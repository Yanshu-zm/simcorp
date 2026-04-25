// ===== Boss Manager =====
import { BOSS_INITIAL, BOSS_ACTIONS } from '../data/config.js';
import { randInt, clamp } from '../utils/random.js';
import eventBus from '../eventBus.js';

export class BossManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.mood = BOSS_INITIAL.mood;
    this.ability = BOSS_INITIAL.ability;
    this.monthlyActionCounts = {};
  }

  resetMonthlyActions() {
    this.monthlyActionCounts = {};
  }

  canPerformAction(actionId) {
    const action = BOSS_ACTIONS.find(a => a.id === actionId);
    if (!action) return false;
    const count = this.monthlyActionCounts[actionId] || 0;
    return count < action.limit;
  }

  performAction(actionId) {
    const action = BOSS_ACTIONS.find(a => a.id === actionId);
    if (!action || !this.canPerformAction(actionId)) return null;

    this.monthlyActionCounts[actionId] = (this.monthlyActionCounts[actionId] || 0) + 1;

    let result = {};
    if (actionId === 'entertainment') {
      const gain = randInt(action.moodMin, action.moodMax);
      this.mood = clamp(this.mood + gain, ...BOSS_INITIAL.moodRange);
      result = { type: 'mood', change: gain };
    } else if (actionId === 'training') {
      const gain = randInt(action.abilityMin, action.abilityMax);
      this.ability = clamp(this.ability + gain, ...BOSS_INITIAL.abilityRange);
      result = { type: 'ability', change: gain, cost: action.cost };
    }

    eventBus.emit('boss:actionPerformed', { actionId, result });
    return result;
  }

  serialize() {
    return { mood: this.mood, ability: this.ability };
  }

  deserialize(data) {
    Object.assign(this, data);
  }
}

export default BossManager;
