// ===== Game Engine =====
import CompanyManager from './CompanyManager.js';
import EmployeeManager from './EmployeeManager.js';
import ProjectManager from './ProjectManager.js';
import EquipmentManager from './EquipmentManager.js';
import BossManager from './BossManager.js';
import EventManager from './EventManager.js';
import { TALENTS } from '../data/talents.js';
import { RECRUIT, INTERACTIONS } from '../data/config.js';
import { weightedRandomPick } from '../utils/random.js';
import { saveGame, loadGame } from '../utils/storage.js';
import eventBus from '../eventBus.js';

class GameEngine {
  constructor() {
    this.companyManager = new CompanyManager();
    this.employeeManager = new EmployeeManager();
    this.projectManager = new ProjectManager();
    this.equipmentManager = new EquipmentManager();
    this.bossManager = new BossManager();
    this.eventManager = new EventManager();

    this.gameState = {
      month: 1,
      year: 1,
      totalMonths: 0,
      talent: null,
      gameOver: false,
      won: false,
      winType: null,
      infiniteMode: false,
      // Talent-applied global modifiers
      globalStressMod: 0,
      globalRevenueMod: 0,
      globalGrowthMod: 0,
      positiveEventDouble: false,
      startWithMediumEmployee: false,
      // Monthly tracking
      bossActionsThisMonth: 0,
      interactionsThisMonth: {},
      recruitsThisMonth: 0,
      newsLog: [],
    };
    this.undoStack = [];
  }

  rollTalent() {
    const talent = weightedRandomPick(TALENTS);
    return talent;
  }

  startNewGame(companyName, talent) {
    // Reset all
    this.companyManager.reset();
    this.employeeManager = new EmployeeManager();
    this.projectManager = new ProjectManager();
    this.equipmentManager = new EquipmentManager();
    this.bossManager.reset();
    this.eventManager = new EventManager();

    this.companyManager.name = companyName;
    this.gameState = {
      month: 1,
      year: 1,
      totalMonths: 1,
      talent,
      gameOver: false,
      won: false,
      winType: null,
      infiniteMode: false,
      globalStressMod: 0,
      globalRevenueMod: 0,
      globalGrowthMod: 0,
      positiveEventDouble: false,
      startWithMediumEmployee: false,
      bossActionsThisMonth: 0,
      interactionsThisMonth: {},
      recruitsThisMonth: 0,
      newsLog: [],
    };

    // Apply talent
    if (talent) {
      // 先将公司初始资金同步到 gameState 中，防止增加资金时出现 NaN
      this.gameState.funds = this.companyManager.funds;
      talent.apply(this.gameState);
      
      // 同步回公司账户
      if (this.gameState.funds !== undefined && !isNaN(this.gameState.funds)) {
        this.companyManager.funds = this.gameState.funds;
      }
      delete this.gameState.funds;
    }

    // If super lucky: start with medium employee
    if (this.gameState.startWithMediumEmployee) {
      const emp = this.employeeManager.generateEmployee('medium');
      this.employeeManager.hireEmployee(emp);
    }

    // Generate initial market projects
    this.projectManager.refreshMarket(this.companyManager.level);

    // Add welcome news
    this.addNews('system', { zh: '公司成立', en: 'Company Founded' }, { zh: `${companyName} 正式成立！初始资金 $${this.companyManager.funds.toLocaleString()}`, en: `${companyName} officially founded! Initial funds $${this.companyManager.funds.toLocaleString()}` });
    if (talent) {
      this.addNews('market', { zh: '天赋觉醒', en: 'Talent Awakened' }, { zh: `获得天赋「${talent.name}」: ${talent.desc}`, en: `Acquired talent '${talent.nameEn || talent.name}': ${talent.descEn || talent.desc}` });
    }

    eventBus.emit('game:started', this.gameState);
  }

  loadSavedGame() {
    const data = loadGame();
    if (!data) return false;
    this.companyManager.deserialize(data.company);
    this.employeeManager.deserialize(data.employees);
    this.projectManager.deserialize(data.projects);
    this.equipmentManager.deserialize(data.equipment);
    this.bossManager.deserialize(data.boss);
    this.eventManager.deserialize(data.events);
    this.gameState = data.gameState;
    eventBus.emit('game:loaded', this.gameState);
    return true;
  }

  save() {
    const data = {
      company: this.companyManager.serialize(),
      employees: this.employeeManager.serialize(),
      projects: this.projectManager.serialize(),
      equipment: this.equipmentManager.serialize(),
      boss: this.bossManager.serialize(),
      events: this.eventManager.serialize(),
      gameState: this.gameState,
    };
    saveGame(data);
    eventBus.emit('toast', { type: 'info', message: '游戏已保存' });
  }

  snapshot() {
    const data = {
      company: this.companyManager.serialize(),
      employees: this.employeeManager.serialize(),
      projects: this.projectManager.serialize(),
      equipment: this.equipmentManager.serialize(),
      boss: this.bossManager.serialize(),
      events: this.eventManager.serialize(),
      gameState: JSON.parse(JSON.stringify(this.gameState)),
    };
    this.undoStack.push(data);
    if (this.undoStack.length > 3) {
      this.undoStack.shift();
    }
    eventBus.emit('undo:updated');
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const data = this.undoStack.pop();
    this.companyManager.deserialize(data.company);
    this.employeeManager.deserialize(data.employees);
    this.projectManager.deserialize(data.projects);
    this.equipmentManager.deserialize(data.equipment);
    this.bossManager.deserialize(data.boss);
    this.eventManager.deserialize(data.events);
    this.gameState = JSON.parse(JSON.stringify(data.gameState));
    eventBus.emit('undo:updated');
    eventBus.emit('ui:refresh');
    eventBus.emit('toast', { type: 'info', message: '已撤销上一步操作' });
    return true;
  }

  nextMonth() {
    if (this.gameState.gameOver && !this.gameState.infiniteMode) return;

    const settlement = this.performMonthlySettlement();

    // Advance date
    this.gameState.month++;
    if (this.gameState.month > 12) {
      this.gameState.month = 1;
      this.gameState.year++;
    }
    this.gameState.totalMonths++;

    // Reset monthly states
    this.bossManager.resetMonthlyActions();
    this.employeeManager.resetMonthlyStates();
    this.gameState.bossActionsThisMonth = 0;
    this.gameState.interactionsThisMonth = {};
    this.gameState.recruitsThisMonth = 0;

    // Refresh market projects
    this.projectManager.refreshMarket(this.companyManager.level);

    // Check free recruit months (March=3, September=9)
    if (this.gameState.month === 3 || this.gameState.month === 9) {
      this.addNews('system', { zh: '招募季', en: 'Recruitment Season' }, { zh: '普通招募开放！可免费招募8位候选人。', en: 'Normal recruitment is open! Can recruit 8 candidates for free.' });
      eventBus.emit('recruit:freeAvailable');
    }

    // Check random event
    if (this.eventManager.shouldTrigger(this.gameState.totalMonths)) {
      const eventResult = this.eventManager.triggerEvent(this);
      settlement.randomEvent = eventResult;
      this.addNews(
        eventResult.event.type === 'positive' ? 'market' : eventResult.event.type === 'negative' ? 'warning' : 'system',
        eventResult.event.name,
        eventResult.resultMessage
      );
    }

    // Auto-save
    this.save();

    eventBus.emit('game:monthAdvanced', { settlement, month: this.gameState.month, year: this.gameState.year });
    return settlement;
  }

  performMonthlySettlement() {
    const settlement = {
      projectResults: [],
      salaryTotal: 0,
      maintenanceCost: 0,
      penalties: 0,
      brokenEquipment: [],
      resignedEmployees: [],
      equipmentEffects: {},
      gameOver: false,
      won: false,
    };

    // 1. Project progress
    const equipEffects = this.equipmentManager.getActiveEffects();
    const revenueMod = this.gameState.globalRevenueMod;
    settlement.projectResults = this.projectManager.advanceProjects(this.employeeManager, revenueMod, equipEffects);

    // Process completed projects
    for (const result of settlement.projectResults) {
      if (result.completed) {
        this.companyManager.addFunds(result.reward);
        this.companyManager.addExp(result.experience);
        // Ability growth for assigned employees
        for (const empId of result.project.assignedEmployees) {
          const emp = this.employeeManager.getEmployee(empId);
          if (emp) {
            this.employeeManager.applyAbilityGrowth(emp, result.project.rarity, this.gameState.globalGrowthMod, equipEffects);
          }
        }
        if (result.project.rarity === 'TOP') {
          this.companyManager.topProjectCompleted = true;
        }
        this.addNews('market', { zh: '项目完成', en: 'Project Completed' }, { zh: `${result.project.name} 已完成！收入 $${result.reward.toLocaleString()}`, en: `${result.project.name} completed! Revenue $${result.reward.toLocaleString()}` });
      } else if (result.penalty > 0) {
        settlement.penalties += result.penalty;
        this.companyManager.addFunds(-result.penalty);
        this.addNews('warning', { zh: '超时罚款', en: 'Overtime Penalty' }, { zh: `${result.project.name} 超时，罚款 $${result.penalty.toLocaleString()}`, en: `${result.project.name} overdue, penalty $${result.penalty.toLocaleString()}` });
      }
    }

    // 2. Employee mood/stress updates
    this.employeeManager.employees.forEach(emp => {
      this.employeeManager.applyMonthlyWorkEffects(emp);
    });

    // Apply global stress mod from talent
    if (this.gameState.globalStressMod !== 0) {
      this.employeeManager.employees.forEach(emp => {
        if (emp.assignedProjectId) {
          emp.stress += emp.stress * this.gameState.globalStressMod * 0.1; // Small reduction each month
          emp.stress = Math.max(0, Math.min(120, emp.stress));
        }
      });
    }

    // 3. Equipment durability
    settlement.brokenEquipment = this.equipmentManager.applyMonthlyDurability();
    for (const item of settlement.brokenEquipment) {
      this.addNews('warning', { zh: '设备故障', en: 'Equipment Failure' }, { zh: `${item.name} 已损坏，需要维修！`, en: `${item.name} is broken and needs repair!` });
    }

    // Apply equipment effects
    settlement.equipmentEffects = equipEffects;
    this.employeeManager.applyEquipmentEffects(equipEffects);

    // 4. Deduct salaries
    settlement.salaryTotal = this.employeeManager.employees.reduce((sum, e) => sum + e.salary, 0);
    this.companyManager.deductSalary(settlement.salaryTotal);

    // 5. Deduct maintenance
    settlement.maintenanceCost = this.equipmentManager.getTotalMaintenanceCost();
    this.companyManager.addFunds(-settlement.maintenanceCost);

    // 6. Check resignations
    settlement.resignedEmployees = this.employeeManager.checkResignations();
    for (const emp of settlement.resignedEmployees) {
      this.companyManager.addFunds(-emp.salary); // Severance
      this.addNews('warning', { zh: '员工离职', en: 'Employee Resigned' }, { zh: `${emp.firstName} ${emp.lastName} 已离职，支付补偿 $${emp.salary.toLocaleString()}`, en: `${emp.firstName} ${emp.lastName} has resigned. Severance paid: $${emp.salary.toLocaleString()}` });
    }

    // 7. Check bankruptcy
    if (this.companyManager.checkBankruptcy()) {
      this.gameState.gameOver = true;
      settlement.gameOver = true;
      eventBus.emit('game:over', { reason: 'bankruptcy' });
    }

    // 8. Check win
    if (!this.gameState.gameOver) {
      const winType = this.companyManager.checkWin();
      if (winType && !this.gameState.won) {
        this.gameState.won = true;
        this.gameState.winType = winType;
        settlement.won = true;
        eventBus.emit('game:won', { winType });
      }
    }

    return settlement;
  }

  // Recruitment
  performRecruitment(type) {
    const config = RECRUIT[type];
    if (!config) return null;

    let probs;
    if (type === 'normal') {
      probs = this.companyManager.getLevelConfig().normalRecruitProb;
    } else {
      probs = config.probs;
    }

    const count = config.candidateCount || 8;
    return this.employeeManager.generateCandidates(probs, count);
  }

  // Employee interaction
  performInteraction(employeeId, interactionId) {
    const emp = this.employeeManager.getEmployee(employeeId);
    if (!emp) return null;

    const interaction = INTERACTIONS.find(i => i.id === interactionId);
    if (!interaction) return null;

    // Check cooldown
    if (interaction.cooldown > 0 && emp.interactionCooldowns[interactionId] > 0) {
      return { success: false, reason: '冷却中' };
    }

    // Check monthly limit
    const monthKey = `${employeeId}_${interactionId}`;
    if (this.gameState.interactionsThisMonth[monthKey]) {
      return { success: false, reason: '本月已使用' };
    }

    // Execute
    const result = interaction.applyEffect(emp, this.bossManager);
    emp.mood = Math.max(0, Math.min(100, emp.mood));
    emp.stress = Math.max(0, Math.min(120, emp.stress));

    // Record
    this.gameState.interactionsThisMonth[monthKey] = true;
    if (interaction.cooldown > 0) {
      emp.interactionCooldowns[interactionId] = interaction.cooldown;
    }

    return { success: true, result, interaction };
  }

  // News log
  addNews(tag, title, desc) {
    this.gameState.newsLog.unshift({
      tag,
      title,
      desc,
      month: this.gameState.month,
      year: this.gameState.year,
    });
    // Keep last 50
    if (this.gameState.newsLog.length > 50) {
      this.gameState.newsLog.length = 50;
    }
  }

  // Helpers for event effects
  allEmployees(fn) {
    this.employeeManager.employees.forEach(fn);
  }

  allProjects(fn) {
    this.projectManager.activeProjects.forEach(fn);
  }

  addFunds(amount) {
    this.companyManager.addFunds(amount);
  }

  addExp(amount) {
    this.companyManager.addExp(amount);
  }

  addFreeEmployee(title) {
    const emp = this.employeeManager.generateEmployee(title);
    this.employeeManager.hireEmployee(emp);
  }
}

// Singleton
export const gameEngine = new GameEngine();
export default gameEngine;
