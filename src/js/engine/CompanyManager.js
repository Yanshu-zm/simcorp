// ===== Company Manager =====
import { COMPANY_LEVELS, INITIAL_FUNDS, WIN_CONDITIONS } from '../data/config.js';
import eventBus from '../eventBus.js';

export class CompanyManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.name = 'SimCorp';
    this.level = 1;
    this.exp = 0;
    this.funds = INITIAL_FUNDS;
    this.totalRevenue = 0;
    this.totalExpense = 0;
    this.topProjectCompleted = false;
  }

  getLevelConfig() {
    return COMPANY_LEVELS[this.level - 1];
  }

  getNextLevelConfig() {
    if (this.level >= COMPANY_LEVELS.length) return null;
    return COMPANY_LEVELS[this.level];
  }

  getEmployeeLimit() {
    return this.getLevelConfig().employeeLimit;
  }

  getExpForNextLevel() {
    const next = this.getNextLevelConfig();
    return next ? next.expRequired : null;
  }

  canUpgrade() {
    const next = this.getNextLevelConfig();
    if (!next) return false;
    return this.exp >= next.expRequired && this.funds >= next.upgradeCost;
  }

  upgrade() {
    const next = this.getNextLevelConfig();
    if (!next || !this.canUpgrade()) return false;
    this.funds -= next.upgradeCost;
    this.totalExpense += next.upgradeCost;
    this.level = next.level;
    eventBus.emit('company:levelUp', { level: this.level });
    eventBus.emit('toast', { type: 'success', message: `公司升级到 ${this.level} 级！` });
    return true;
  }

  addFunds(amount) {
    this.funds += amount;
    if (amount > 0) this.totalRevenue += amount;
    else this.totalExpense += Math.abs(amount);
    eventBus.emit('company:fundsChanged', { funds: this.funds, change: amount });
  }

  addExp(amount) {
    this.exp += amount;
    eventBus.emit('company:expChanged', { exp: this.exp });
  }

  deductSalary(totalSalary) {
    this.funds -= totalSalary;
    this.totalExpense += totalSalary;
  }

  checkBankruptcy() {
    return this.funds < 0;
  }

  checkWin() {
    // 资金胜利
    if (this.funds >= WIN_CONDITIONS.fundGoal) return 'funds';
    // 资质胜利
    if (this.level >= WIN_CONDITIONS.qualificationGoal.companyLevel && this.topProjectCompleted) return 'qualification';
    return null;
  }

  getMonthlyExpense(employees, equipment) {
    const salaryTotal = employees.reduce((sum, e) => sum + e.salary, 0);
    const maintenanceTotal = equipment
      .filter(e => e.currentDurability > 0)
      .reduce((sum, e) => sum + e.maintenanceCost, 0);
    return salaryTotal + maintenanceTotal;
  }

  serialize() {
    return {
      name: this.name, level: this.level, exp: this.exp,
      funds: this.funds, totalRevenue: this.totalRevenue,
      totalExpense: this.totalExpense, topProjectCompleted: this.topProjectCompleted,
    };
  }

  deserialize(data) {
    Object.assign(this, data);
  }
}

export default CompanyManager;
