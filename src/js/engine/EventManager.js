// ===== Event Manager =====
import EVENTS from '../data/events.js';
import { weightedRandomPick } from '../utils/random.js';
import { EVENT_TRIGGER_INTERVAL } from '../data/config.js';

export class EventManager {
  constructor() {
    this.history = [];
  }

  shouldTrigger(month) {
    // 基础频率由 config 决定 (1表示每月)，配合 50% 概率
    return month % EVENT_TRIGGER_INTERVAL === 0 && Math.random() < 0.5;
  }

  triggerEvent(gameEngine) {
    // Adjust probabilities if positiveEventDouble is true
    let pool = [...EVENTS];
    if (gameEngine.gameState.positiveEventDouble) {
      pool = pool.map(e => {
        if (e.type === 'positive') {
          return { ...e, prob: e.prob * 2 };
        }
        return e;
      });
    }

    const event = weightedRandomPick(pool);
    const effectAdapter = {
      allEmployees: (fn) => gameEngine.employeeManager.employees.forEach(fn),
      allProjects: (fn) => gameEngine.projectManager.activeProjects.forEach(fn),
      addFunds: (amount) => gameEngine.companyManager.addFunds(amount),
      addExp: (amount) => gameEngine.companyManager.addExp(amount),
      addFreeEmployee: (title) => {
        const emp = gameEngine.employeeManager.generateEmployee(title);
        gameEngine.employeeManager.hireEmployee(emp);
      },
    };

    const resultMessage = event.effect(effectAdapter);

    this.history.push({
      month: gameEngine.gameState.totalMonths,
      event: event.name,
      type: event.type,
      result: resultMessage,
    });

    return { event, resultMessage };
  }

  serialize() {
    return { history: this.history };
  }

  deserialize(data) {
    this.history = data.history || [];
  }
}

export default EventManager;
