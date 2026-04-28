// ===== Talent Definitions =====
export const TALENTS = [
  { id: 'industryStar', name: '行业新星', nameEn: 'Industry Star', desc: '初始资金 +$50,000', descEn: 'Starting funds +$50,000', prob: 0.30, icon: '⭐',
    apply: (gameState) => { gameState.funds += 50000; } },
  { id: 'manageExpert', name: '管理专家', nameEn: 'Management Expert', desc: '员工压力增长 -20%', descEn: 'Employee stress growth -20%', prob: 0.25, icon: '📋',
    apply: (gameState) => { gameState.globalStressMod = -0.20; } },
  { id: 'negotiator', name: '谈判高手', nameEn: 'Skilled Negotiator', desc: '项目回报 +10%', descEn: 'Project reward +10%', prob: 0.20, icon: '🤝',
    apply: (gameState) => { gameState.globalRevenueMod = 0.10; } },
  { id: 'techGenius', name: '技术天才', nameEn: 'Tech Genius', desc: '员工能力成长 +15%', descEn: 'Employee ability growth +15%', prob: 0.15, icon: '🧠',
    apply: (gameState) => { gameState.globalGrowthMod = 0.15; } },
  { id: 'destiny', name: '天命所归', nameEn: 'Destined', desc: '正面随机事件概率翻倍', descEn: 'Positive event probability doubled', prob: 0.05, icon: '🍀',
    apply: (gameState) => { gameState.positiveEventDouble = true; } },
  { id: 'superLucky', name: '超级幸运', nameEn: 'Super Lucky', desc: '开局获得一个中级员工', descEn: 'Start with a Medium employee', prob: 0.05, icon: '🎲',
    apply: (gameState) => { gameState.startWithMediumEmployee = true; } },
];

export default TALENTS;
