// ===== Trait Definitions =====

// 特性类别
export const TRAIT_CATEGORIES = ['efficiency', 'mood', 'stress', 'growth', 'revenue'];

// 特性池 - 按档次定义
const TRAIT_TIERS = [
  {
    tier: 1,
    efficiency: { name: '天才设计师', value: 0.20 },
    mood: { name: '热爱工作', value: -0.20 },
    stress: { name: '抗压专家', value: -0.20 },
    growth: { name: '学习天才', value: 0.20 },
    revenue: { name: '商业头脑', value: 0.20 },
  },
  {
    tier: 2,
    efficiency: { name: '高效执行者', value: 0.10 },
    mood: { name: '乐观主义', value: -0.10 },
    stress: { name: '抗压能力强', value: -0.10 },
    growth: { name: '快速成长', value: 0.10 },
    revenue: { name: '成本控制者', value: 0.10 },
  },
  {
    tier: 3,
    efficiency: { name: '稳定输出', value: 0.05 },
    mood: { name: '情绪稳定', value: -0.05 },
    stress: { name: '正常抗压', value: -0.05 },
    growth: { name: '稳步提升', value: 0.05 },
    revenue: { name: '稳健经营', value: 0.05 },
  },
  {
    tier: 4,
    efficiency: { name: '拖延症', value: -0.025 },
    mood: { name: '情绪波动', value: 0.025 },
    stress: { name: '易紧张', value: 0.025 },
    growth: { name: '学习缓慢', value: -0.025 },
    revenue: { name: '粗心大意', value: -0.025 },
  },
  {
    tier: 5,
    efficiency: { name: '低效执行', value: -0.05 },
    mood: { name: '易疲劳', value: 0.05 },
    stress: { name: '高压体质', value: 0.05 },
    growth: { name: '难以提升', value: -0.05 },
    revenue: { name: '资源浪费', value: -0.05 },
  },
  {
    tier: 6,
    efficiency: { name: '摸鱼大师', value: -0.10 },
    mood: { name: '厌恶工作', value: 0.10 },
    stress: { name: '崩溃边缘', value: 0.10 },
    growth: { name: '毫无进步', value: -0.10 },
    revenue: { name: '预算黑洞', value: -0.10 },
  },
];

// 初级员工特性池: 6档, 概率 1/14, 2/14, 4/14, 4/14, 2/14, 1/14
export const JUNIOR_TRAIT_POOL = {
  tiers: [1, 2, 3, 4, 5, 6],
  weights: [1, 2, 4, 4, 2, 1], // /14
};

// 中级员工特性池: 5档 (去掉第6档), 概率 1/13, 2/13, 4/13, 4/13, 2/13
export const MEDIUM_TRAIT_POOL = {
  tiers: [1, 2, 3, 4, 5],
  weights: [1, 2, 4, 4, 2], // /13
};

// 高级员工特性池: 3档 (只保留前3档), 概率 1/7, 2/7, 4/7
export const SENIOR_TRAIT_POOL = {
  tiers: [1, 2, 3],
  weights: [1, 2, 4], // /7
};

// 顶级人才特性池: 只保留前2档, 概率 1/3, 2/3
export const TOP_TRAIT_POOL = {
  tiers: [1, 2],
  weights: [1, 2], // /3
};

export function getTraitPool(title) {
  switch (title) {
    case 'junior': return JUNIOR_TRAIT_POOL;
    case 'medium': return MEDIUM_TRAIT_POOL;
    case 'senior': return SENIOR_TRAIT_POOL;
    case 'top': return TOP_TRAIT_POOL;
    default: return JUNIOR_TRAIT_POOL;
  }
}

export function getTraitByTierAndCategory(tier, category) {
  const tierData = TRAIT_TIERS.find(t => t.tier === tier);
  if (!tierData) return null;
  return { ...tierData[category], category, tier };
}

// 判断特性是正面/负面
export function isPositiveTrait(trait) {
  if (trait.category === 'efficiency' || trait.category === 'growth' || trait.category === 'revenue') {
    return trait.value > 0;
  }
  // mood和stress: 负值表示减少下降/增长 = 正面
  return trait.value < 0;
}

export { TRAIT_TIERS };
