// ===== Project Manager =====
import { PROJECT_RARITIES, PROJECT_REFRESH_PROB, FUNCTIONS } from '../data/config.js';
import { randInt, weightedRandom, randomPick, uid } from '../utils/random.js';
import eventBus from '../eventBus.js';

export class ProjectManager {
  constructor() {
    this.marketProjects = [];
    this.activeProjects = [];
    this.completedProjects = [];
    this.projectCounter = 0;
  }

  generateProjectName(category, rarity) {
    this.projectCounter++;
    const prefixes = {
      '建筑': ['建筑', 'ARCH', 'BLD'],
      '规划': ['规划', 'PLN', 'URB'],
      '风林': ['风林', 'LAN', 'ECO'],
    };
    const prefix = randomPick(prefixes[category] || ['PRJ']);
    return `${prefix}-${rarity}-${String(this.projectCounter).padStart(3, '0')}`;
  }

  generateProject(companyLevel) {
    // Pick rarity based on company level
    const probs = PROJECT_REFRESH_PROB[companyLevel];
    const rarities = Object.keys(probs);
    const weights = Object.values(probs);
    const rarityIdx = weightedRandom(weights);
    const rarityKey = rarities[rarityIdx];
    const config = PROJECT_RARITIES[rarityKey];

    const category = randomPick(FUNCTIONS);
    const name = this.generateProjectName(category, rarityKey);

    return {
      id: uid(),
      name,
      rarity: rarityKey,
      category,
      reward: randInt(config.rewardRange[0], config.rewardRange[1]),
      experience: randInt(config.expRange[0], config.expRange[1]),
      hiddenTotalProgress: config.hiddenProgress,
      currentProgress: 0,
      bidRequirement: config.bidRequirement,
      maxAllowedMonths: config.maxMonths,
      monthsElapsed: 0,
      penaltyPerMonth: config.penaltyPerMonth,
      assignedEmployees: [],
      bidEmployeeId: null,
      status: 'market',
    };
  }

  refreshMarket(companyLevel) {
    this.marketProjects = [];
    for (let i = 0; i < 5; i++) {
      this.marketProjects.push(this.generateProject(companyLevel));
    }
    eventBus.emit('project:marketRefreshed', this.marketProjects);
  }

  bidProject(projectId, employeeAbility) {
    const project = this.marketProjects.find(p => p.id === projectId);
    if (!project) return { success: false, reason: '项目不存在' };

    if (employeeAbility < project.bidRequirement) {
      return { success: false, reason: `能力不足 (需要 ≥${project.bidRequirement})` };
    }

    // 投标成功率逻辑
    // 恰好达到要求时 60%，超出 100 点以上时 100%
    const diff = employeeAbility - project.bidRequirement;
    const successProb = Math.min(1.0, 0.6 + (diff / 100) * 0.4);

    if (Math.random() < successProb) {
      return { success: true, project, prob: successProb };
    } else {
      const probPercent = Math.round(successProb * 100);
      return { success: false, reason: `投标失败 (当前成功率 ${probPercent}%)` };
    }
  }

  acceptProject(projectId) {
    const idx = this.marketProjects.findIndex(p => p.id === projectId);
    if (idx === -1) return null;
    const project = this.marketProjects.splice(idx, 1)[0];
    project.status = 'active';
    this.activeProjects.push(project);
    eventBus.emit('project:accepted', project);
    return project;
  }

  assignEmployee(projectId, employeeId) {
    const project = this.activeProjects.find(p => p.id === projectId);
    if (!project) return false;
    if (!project.assignedEmployees.includes(employeeId)) {
      project.assignedEmployees.push(employeeId);
    }
    return true;
  }

  unassignEmployee(projectId, employeeId) {
    const project = this.activeProjects.find(p => p.id === projectId);
    if (!project) return false;
    project.assignedEmployees = project.assignedEmployees.filter(id => id !== employeeId);
    return true;
  }

  advanceProjects(employeeManager, revenueMod = 0, equipEffects = {}) {
    const results = [];

    for (const project of this.activeProjects) {
      project.monthsElapsed++;

      // Calculate progress
      let totalProgress = 0;
      for (const empId of project.assignedEmployees) {
        const emp = employeeManager.getEmployee(empId);
        if (emp) {
          totalProgress += employeeManager.calculateMonthlyProgress(emp, project.category, equipEffects);
        }
      }
      
      // Apply equipment progress boost (if any)
      if (equipEffects.progressBoost) {
        totalProgress *= (1 + equipEffects.progressBoost);
      }

      project.currentProgress += totalProgress;

      // Check completion
      if (project.currentProgress >= project.hiddenTotalProgress) {
        project.status = 'completed';
        const reward = Math.round(project.reward * (1 + revenueMod));
        results.push({
          project,
          completed: true,
          reward,
          experience: project.experience,
          totalProgress,
        });
      } else {
        // Check penalty
        let penalty = 0;
        if (project.monthsElapsed > project.maxAllowedMonths) {
          penalty = project.penaltyPerMonth;
        }
        results.push({
          project,
          completed: false,
          penalty,
          totalProgress,
          progressPct: Math.min(100, (project.currentProgress / project.hiddenTotalProgress) * 100),
        });
      }
    }

    // Remove completed projects
    const completed = this.activeProjects.filter(p => p.status === 'completed');
    this.completedProjects.push(...completed);
    this.activeProjects = this.activeProjects.filter(p => p.status === 'active');

    // Unassign employees from completed projects
    for (const p of completed) {
      for (const empId of p.assignedEmployees) {
        const emp = employeeManager.getEmployee(empId);
        if (emp) emp.assignedProjectId = null;
      }
    }

    return results;
  }

  getProjectById(id) {
    return this.activeProjects.find(p => p.id === id)
      || this.marketProjects.find(p => p.id === id);
  }

  serialize() {
    return {
      marketProjects: this.marketProjects,
      activeProjects: this.activeProjects,
      completedProjects: this.completedProjects,
      projectCounter: this.projectCounter,
    };
  }

  deserialize(data) {
    Object.assign(this, data);
  }
}

export default ProjectManager;
