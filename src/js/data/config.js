// ===== Game Configuration Constants =====

export const COMPANY_LEVELS = [
  {
    level: 1,
    expRequired: 0,
    upgradeCost: 0,
    employeeLimit: 5,
    normalRecruitProb: { junior: 0.90, medium: 0.09, senior: 0.01 },
    unlocks: ['普通招募'],
    unlocksEn: ['Normal Recruitment'],
  },
  {
    level: 2,
    expRequired: 500,
    upgradeCost: 300000,
    employeeLimit: 10,
    normalRecruitProb: { junior: 0.75, medium: 0.20, senior: 0.05 },
    unlocks: ['精英招募'],
    unlocksEn: ['Elite Recruitment'],
  },
  {
    level: 3,
    expRequired: 1500,
    upgradeCost: 600000,
    employeeLimit: 16,
    normalRecruitProb: { junior: 0.60, medium: 0.30, senior: 0.10 },
    unlocks: ['猎头招募'],
    unlocksEn: ['Headhunter Recruitment'],
  },
];

export const INITIAL_FUNDS = 300000;

export const WIN_CONDITIONS = {
  fundGoal: 10000000,
  qualificationGoal: { companyLevel: 3, topProjectCompleted: true },
};

// 老板属性
export const BOSS_INITIAL = {
  mood: 100,
  ability: 50,
  moodRange: [0, 100],
  abilityRange: [0, 200],
};

export const BOSS_ACTIONS = [
  { id: 'entertainment', name: '娱乐', nameEn: 'Leisure', icon: 'gamepad-2', effect: '心情 +5~10', effectEn: 'Mood +5~10', moodMin: 5, moodMax: 10, limit: 1, cost: 0 },
  { id: 'training', name: '进修', nameEn: 'Study', icon: 'graduation-cap', effect: '能力 +2~5', effectEn: 'Ability +2~5', abilityMin: 2, abilityMax: 5, limit: 1, cost: 5000 },
];

// 员工头衔配置
export const TITLES = {
  junior: {
    name: '初级',
    nameEn: 'Junior',
    abilityRange: [30, 80],
    salaryRange: [4000, 8000],
    functionCount: 1,
    promotionCost: 20000,
    nextTitle: 'medium',
  },
  medium: {
    name: '中级',
    nameEn: 'Medium',
    abilityRange: [70, 140],
    salaryRange: [9000, 18000],
    functionCount: 2,
    promotionCost: 60000,
    nextTitle: 'senior',
  },
  senior: {
    name: '高级',
    nameEn: 'Senior',
    abilityRange: [120, 220],
    salaryRange: [20000, 40000],
    functionCount: 3,
    promotionCost: 150000,
    nextTitle: 'top',
  },
  top: {
    name: '顶级',
    nameEn: 'Top',
    abilityRange: [200, 320],
    salaryRange: [50000, 100000],
    functionCount: 3,
    promotionCost: null,
    nextTitle: null,
  },
};

export const FUNCTIONS = ['建筑', '规划', '风林'];
export const FUNCTIONS_EN = ['Arch', 'Planning', 'Landscape'];

// 员工每月工作影响
export const WORK_EFFECTS = {
  baseMoodLoss: 6,
  extraMoodLossPerMonth: 2,
  maxMoodLoss: 16,
  baseStressGain: 10,
  extraStressGainPerMonth: 4,
  maxStressGain: 30,
  progressMultiplier: 0.1,
  efficiencyMin: 0.3,
  efficiencyMax: 1.0,
  resignMoodThreshold: 10,
  resignStressThreshold: 100,
};

// 能力成长配置
export const ABILITY_GROWTH = {
  R: [2, 5],
  SR: [5, 10],
  SSR: [10, 18],
  TOP: [10, 18],
};

export const ABILITY_DECAY = [
  { threshold: 180, multiplier: 0.5 },
  { threshold: 140, multiplier: 0.7 },
];

// 项目资质配置
export const PROJECT_RARITIES = {
  R: {
    name: 'R',
    minCompanyLevel: 1,
    rewardRange: [45000, 105000],
    expRange: [30, 60],
    hiddenProgress: 50,
    bidRequirement: 30,
    baseMonths: 2,
    maxMonths: 4,
    penaltyPerMonth: 20000,
  },
  SR: {
    name: 'SR',
    minCompanyLevel: 2,
    rewardRange: [120000, 270000],
    expRange: [80, 150],
    hiddenProgress: 80,
    bidRequirement: 100,
    baseMonths: 3,
    maxMonths: 5,
    penaltyPerMonth: 40000,
  },
  SSR: {
    name: 'SSR',
    minCompanyLevel: 3,
    rewardRange: [300000, 750000],
    expRange: [200, 350],
    hiddenProgress: 120,
    bidRequirement: 180,
    baseMonths: 4,
    maxMonths: 6,
    penaltyPerMonth: 80000,
  },
  TOP: {
    name: '顶级',
    minCompanyLevel: 3,
    rewardRange: [1350000, 2250000],
    expRange: [500, 500],
    hiddenProgress: 180,
    bidRequirement: 200,
    baseMonths: 5,
    maxMonths: 7,
    penaltyPerMonth: 150000,
  },
};

// 项目刷新概率（按公司等级）
export const PROJECT_REFRESH_PROB = {
  1: { R: 0.85, SR: 0.14, SSR: 0.01, TOP: 0.00 },
  2: { R: 0.65, SR: 0.28, SSR: 0.07, TOP: 0.00 },
  3: { R: 0.40, SR: 0.40, SSR: 0.14, TOP: 0.06 },
};

// 招募配置
export const RECRUIT = {
  normal: { cost: 500, freeMonths: [3, 9], candidateCount: 8 },
  elite: { cost: 5000, probs: { junior: 0, medium: 0.85, senior: 0.15 }, minLevel: 2, candidateCount: 3 },
  headhunter: { cost: 12000, probs: { junior: 0.10, medium: 0.50, senior: 0.35, top: 0.05 }, minLevel: 3, candidateCount: 3 },
};

// 晋升费用
export const PROMOTION_COSTS = {
  junior: 20000,
  medium: 60000,
  senior: 150000,
};

// 互动选项
export const INTERACTIONS = [
  {
    id: 'rush',
    name: '催进度',
    color: 'warning',
    effects: '进度 +3~8 ×(1+老板能力/200)\n心情 -3, 压力 +5\n20%概率: 失误 -3进度',
    applyEffect: (emp, boss) => {
      const mult = 1 + boss.ability / 200;
      let progress = (3 + Math.random() * 5) * mult;
      emp.mood -= 3;
      emp.stress += 5;
      if (Math.random() < 0.2) {
        progress -= 3;
      }
      return { progress: Math.max(0, progress), moodChange: -3, stressChange: 5 };
    },
    cost: 0,
    cooldown: 0,
    requiresProject: true,
  },
  {
    id: 'overtime',
    name: '加班冲刺',
    color: 'danger',
    effects: '进度 +10 ×(1+老板能力/200)\n心情 -6, 压力 +10\n下月效率 -15%',
    applyEffect: (emp, boss) => {
      const mult = 1 + boss.ability / 200;
      const progress = 10 * mult;
      emp.mood -= 6;
      emp.stress += 10;
      emp.nextMonthEfficiencyMod = -0.15;
      return { progress, moodChange: -6, stressChange: 10 };
    },
    cost: 0,
    cooldown: 0,
    requiresProject: true,
  },
  {
    id: 'specialTraining',
    name: '专项培训',
    color: 'info',
    effects: '能力 +2~5\n心情 +2, 压力 +2\n费用: $8,000',
    applyEffect: (emp) => {
      const abilityGain = 2 + Math.floor(Math.random() * 4);
      emp.ability += abilityGain;
      emp.mood += 2;
      emp.stress += 2;
      return { abilityGain, moodChange: 2, stressChange: 2 };
    },
    cost: 8000,
    cooldown: 0,
  },
  {
    id: 'teamBuilding',
    name: '团建活动',
    color: 'success',
    effects: '心情 +5~10, 压力 -5\n10%概率: 无效果\n费用: $8,000',
    applyEffect: (emp) => {
      if (Math.random() < 0.1) {
        return { failed: true, moodChange: 0, stressChange: 0 };
      }
      const moodGain = 5 + Math.floor(Math.random() * 6);
      emp.mood += moodGain;
      emp.stress -= 5;
      return { moodChange: moodGain, stressChange: -5 };
    },
    cost: 8000,
    cooldown: 0,
  },
  {
    id: 'talk',
    name: '单独谈话',
    color: 'primary',
    effects: '心情 +4, 压力 -2\n冷却: 2个月',
    applyEffect: (emp) => {
      emp.mood += 4;
      emp.stress -= 2;
      return { moodChange: 4, stressChange: -2 };
    },
    cost: 0,
    cooldown: 2,
  },
  {
    id: 'forceRest',
    name: '强制休息',
    color: 'info',
    effects: '心情 +15, 压力 -20\n当月无项目进度\n下月效率 +10%',
    applyEffect: (emp) => {
      emp.mood += 15;
      emp.stress -= 20;
      emp.forceResting = true;
      emp.nextMonthEfficiencyMod = 0.10;
      return { moodChange: 15, stressChange: -20, noProgress: true };
    },
    cost: 0,
    cooldown: 0,
  },
  {
    id: 'raise',
    name: '涨薪',
    color: 'warning',
    effects: '心情 +10, 压力 -5\n薪资 +1,000',
    applyEffect: (emp) => {
      emp.mood += 10;
      emp.stress -= 5;
      emp.salary += 1000;
      return { moodChange: 10, stressChange: -5, salaryIncrease: 1000 };
    },
    cost: 0,
    cooldown: 0,
  },
];

// 随机事件触发频率
export const EVENT_TRIGGER_INTERVAL = 1; // 每个月均触发 (需配合 EventManager.shouldTrigger)

// 设备拥有上限
export const EQUIPMENT_LIMIT = 6;

// 每月招募次数上限
export const MONTHLY_RECRUIT_LIMIT = 10;

// 月份名称
export const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
