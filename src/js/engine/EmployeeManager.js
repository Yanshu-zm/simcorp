// ===== Employee Manager =====
import { TITLES, FUNCTIONS, WORK_EFFECTS, ABILITY_GROWTH, ABILITY_DECAY } from '../data/config.js';
import { FIRST_NAMES, LAST_NAMES } from '../data/namePool.js';
import { getTraitPool, getTraitByTierAndCategory, TRAIT_CATEGORIES } from '../data/traits.js';
import { randInt, randomPick, weightedRandom, uid, clamp, pickByProbability } from '../utils/random.js';
import eventBus from '../eventBus.js';

export class EmployeeManager {
  constructor() {
    this.employees = [];
    this.usedNames = new Set();
  }

  generateName() {
    let attempts = 0;
    while (attempts < 100) {
      const first = randomPick(FIRST_NAMES);
      const last = randomPick(LAST_NAMES);
      const fullName = `${first} ${last}`;
      if (!this.usedNames.has(fullName)) {
        this.usedNames.add(fullName);
        return { firstName: first, lastName: last };
      }
      attempts++;
    }
    // Fallback
    const first = randomPick(FIRST_NAMES);
    const last = randomPick(LAST_NAMES);
    return { firstName: first, lastName: last };
  }

  generateTraits(title) {
    const pool = getTraitPool(title);
    // Pick 2 traits from different categories
    const availableCategories = [...TRAIT_CATEGORIES];
    const traits = [];

    for (let i = 0; i < 2; i++) {
      // Pick category
      const catIdx = Math.floor(Math.random() * availableCategories.length);
      const category = availableCategories.splice(catIdx, 1)[0];

      // Pick tier by weight
      const tierIdx = weightedRandom(pool.weights);
      const tier = pool.tiers[tierIdx];

      const trait = getTraitByTierAndCategory(tier, category);
      if (trait) traits.push(trait);
    }
    return traits;
  }

  generateEmployee(title) {
    const config = TITLES[title];
    const { firstName, lastName } = this.generateName();
    const ability = randInt(config.abilityRange[0], config.abilityRange[1]);
    const salary = randInt(config.salaryRange[0], config.salaryRange[1]);

    // 随机选职能
    const allFunctions = [...FUNCTIONS];
    const funcs = [];
    for (let i = 0; i < config.functionCount; i++) {
      const idx = Math.floor(Math.random() * allFunctions.length);
      funcs.push(allFunctions.splice(idx, 1)[0]);
    }

    const traits = this.generateTraits(title);
    // 随机头像色
    const avatarColors = ['#5B5FC7', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6'];
    const avatarColor = randomPick(avatarColors);

    return {
      id: uid(),
      firstName,
      lastName,
      title,
      ability,
      mood: 100,
      stress: 0,
      salary,
      functions: funcs,
      traits,
      assignedProjectId: null,
      consecutiveWorkMonths: 0,
      currentEfficiencyMod: 0,
      nextMonthEfficiencyMod: 0,
      forceResting: false,
      canPromote: false,
      interactionCooldowns: {},
      avatarColor,
    };
  }

  generateCandidates(probMap, count) {
    const candidates = [];
    for (let i = 0; i < count; i++) {
      const title = pickByProbability(probMap);
      candidates.push(this.generateEmployee(title));
    }
    return candidates;
  }

  hireEmployee(employee) {
    this.employees.push(employee);
    eventBus.emit('employee:hired', employee);
    eventBus.emit('toast', { type: 'success', message: `${employee.firstName} ${employee.lastName} 已加入公司！` });
  }

  fireEmployee(employeeId) {
    const idx = this.employees.findIndex(e => e.id === employeeId);
    if (idx === -1) return null;
    const emp = this.employees[idx];
    this.employees.splice(idx, 1);
    eventBus.emit('employee:fired', emp);
    return emp;
  }

  getEmployee(id) {
    return this.employees.find(e => e.id === id);
  }

  getAvailableEmployees() {
    return this.employees.filter(e => !e.assignedProjectId);
  }

  getEfficiency(emp, equipEffects = {}) {
    const moodFactor = emp.mood / 100;
    const stressFactor = 1 - emp.stress / 120;
    let eff = moodFactor * stressFactor;
    eff = clamp(eff, WORK_EFFECTS.efficiencyMin, WORK_EFFECTS.efficiencyMax);

    // Apply current month mod
    if (emp.currentEfficiencyMod) {
      eff *= (1 + emp.currentEfficiencyMod);
    }

    // Apply equipment efficiency boost
    if (equipEffects.efficiencyBoost) {
      eff *= (1 + equipEffects.efficiencyBoost);
    }

    return clamp(eff, WORK_EFFECTS.efficiencyMin, WORK_EFFECTS.efficiencyMax * 2); // Allow efficiency to go higher with equipment
  }

  getTraitMultiplier(emp, category) {
    let mult = 1;
    for (const trait of emp.traits) {
      if (trait.category === category) {
        mult += trait.value;
      }
    }
    return mult;
  }

  calculateMonthlyProgress(emp, projectCategory, equipEffects = {}) {
    if (emp.forceResting) return 0;

    const matchCoeff = emp.functions.includes(projectCategory) ? 1 : 0.4;
    const efficiency = this.getEfficiency(emp, equipEffects);
    const efficiencyTraitMult = this.getTraitMultiplier(emp, 'efficiency');
    
    // 效率提升 1.5 倍
    return emp.ability * matchCoeff * efficiency * WORK_EFFECTS.progressMultiplier * efficiencyTraitMult * 1.5;
  }

  applyMonthlyWorkEffects(emp) {
    if (!emp.assignedProjectId) {
      emp.consecutiveWorkMonths = 0;
      return;
    }

    if (emp.forceResting) {
      emp.forceResting = false;
      return;
    }

    emp.consecutiveWorkMonths++;
    const months = emp.consecutiveWorkMonths;

    // Mood loss
    const moodTraitMult = this.getTraitMultiplier(emp, 'mood');
    const extraMoodLoss = Math.min((months - 1) * WORK_EFFECTS.extraMoodLossPerMonth, WORK_EFFECTS.maxMoodLoss - WORK_EFFECTS.baseMoodLoss);
    const totalMoodLoss = (WORK_EFFECTS.baseMoodLoss + extraMoodLoss) * (1 + moodTraitMult - 1);
    emp.mood -= totalMoodLoss;

    // Stress gain
    const stressTraitMult = this.getTraitMultiplier(emp, 'stress');
    const extraStressGain = Math.min((months - 1) * WORK_EFFECTS.extraStressGainPerMonth, WORK_EFFECTS.maxStressGain - WORK_EFFECTS.baseStressGain);
    const totalStressGain = (WORK_EFFECTS.baseStressGain + extraStressGain) * (1 + stressTraitMult - 1);
    emp.stress += totalStressGain;

    // Clamp
    emp.mood = clamp(emp.mood, 0, 100);
    emp.stress = clamp(emp.stress, 0, 120);
  }

  applyAbilityGrowth(emp, projectRarity, globalGrowthMod = 0, equipEffects = {}) {
    const range = ABILITY_GROWTH[projectRarity];
    if (!range) return 0;

    let growth = randInt(range[0], range[1]);

    // Decay
    for (const decay of ABILITY_DECAY) {
      if (emp.ability > decay.threshold) {
        growth *= decay.multiplier;
        break;
      }
    }

    // Trait multiplier
    const traitMult = this.getTraitMultiplier(emp, 'growth');
    growth *= traitMult;

    // Global mod (talent)
    growth *= (1 + globalGrowthMod);

    // Equipment growth boost
    if (equipEffects.growthBoost) {
      growth *= (1 + equipEffects.growthBoost);
    }

    growth = Math.round(growth);
    emp.ability += growth;

    // Check promotion
    const titleConfig = TITLES[emp.title];
    if (emp.ability >= titleConfig.abilityRange[1] && titleConfig.nextTitle) {
      emp.canPromote = true;
    }

    return growth;
  }

  promoteEmployee(empId) {
    const emp = this.getEmployee(empId);
    if (!emp || !emp.canPromote) return false;

    const currentConfig = TITLES[emp.title];
    const nextTitle = currentConfig.nextTitle;
    if (!nextTitle) return false;

    const nextConfig = TITLES[nextTitle];
    emp.title = nextTitle;
    
    // 按当前能力值提升 30%
    emp.ability = Math.round(emp.ability * 1.3);
    // 工资按同等比例（30%）提升
    emp.salary = Math.round(emp.salary * 1.3);
    
    emp.canPromote = false;

    // Add new function
    const missing = FUNCTIONS.filter(f => !emp.functions.includes(f));
    if (missing.length > 0) {
      emp.functions.push(randomPick(missing));
    }

    // Re-roll traits if needed
    emp.traits = this.generateTraits(nextTitle);

    eventBus.emit('employee:promoted', emp);
    return true;
  }

  checkResignations() {
    const resigned = [];
    this.employees = this.employees.filter(emp => {
      if (emp.mood < WORK_EFFECTS.resignMoodThreshold && emp.stress > WORK_EFFECTS.resignStressThreshold) {
        resigned.push(emp);
        return false;
      }
      return true;
    });
    return resigned;
  }

  resetMonthlyStates() {
    this.employees.forEach(emp => {
      // 将下月的 buff 转移到当月，并重置下月 buff
      emp.currentEfficiencyMod = emp.nextMonthEfficiencyMod || 0;
      emp.nextMonthEfficiencyMod = 0;
      
      // Decrement cooldowns
      for (const key in emp.interactionCooldowns) {
        if (emp.interactionCooldowns[key] > 0) {
          emp.interactionCooldowns[key]--;
        }
      }
    });
  }

  applyEquipmentEffects(equipmentEffects) {
    if (!equipmentEffects) return;
    this.employees.forEach(emp => {
      // Flat ability boost from certain equipment
      if (equipmentEffects.ability) {
        // We don't add to emp.ability permanently here to avoid accumulation
        // This is handled in getEfficiency/calculateMonthlyProgress if needed
      }
      if (equipmentEffects.moodBoost) emp.mood = clamp(emp.mood + equipmentEffects.moodBoost, 0, 100);
      if (equipmentEffects.stressReduction) emp.stress = clamp(emp.stress - equipmentEffects.stressReduction, 0, 120);
    });
  }

  serialize() {
    return {
      employees: this.employees.map(e => ({ ...e })),
      usedNames: [...this.usedNames],
    };
  }

  deserialize(data) {
    this.employees = data.employees || [];
    this.usedNames = new Set(data.usedNames || []);
  }
}

export default EmployeeManager;
