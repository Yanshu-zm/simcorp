// ===== Talent Definitions =====
export const TALENTS = [
  { id: 'industryStar', name: '行业新星', desc: '初始资金 +$50,000', prob: 0.30, icon: '⭐',
    apply: (gameState) => { gameState.funds += 50000; } },
  { id: 'manageExpert', name: '管理专家', desc: '员工压力增长 -20%', prob: 0.25, icon: '📋',
    apply: (gameState) => { gameState.globalStressMod = -0.20; } },
  { id: 'negotiator', name: '谈判高手', desc: '项目回报 +10%', prob: 0.20, icon: '🤝',
    apply: (gameState) => { gameState.globalRevenueMod = 0.10; } },
  { id: 'techGenius', name: '技术天才', desc: '员工能力成长 +15%', prob: 0.15, icon: '🧠',
    apply: (gameState) => { gameState.globalGrowthMod = 0.15; } },
  { id: 'destiny', name: '天命所归', desc: '正面随机事件概率翻倍', prob: 0.05, icon: '🍀',
    apply: (gameState) => { gameState.positiveEventDouble = true; } },
  { id: 'superLucky', name: '超级幸运', desc: '开局获得一个中级员工', prob: 0.05, icon: '🎲',
    apply: (gameState) => { gameState.startWithMediumEmployee = true; } },
];

export default TALENTS;
