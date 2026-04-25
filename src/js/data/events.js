// ===== Random Events Pool (40 events) =====

export const EVENTS = [
  // ===== 正面事件 (~40%) =====
  { id: 1, name: '行业峰会', type: 'positive', prob: 0.01, desc: '公司受邀参加行业峰会，全体员工受益匪浅。', effect: (g) => { g.allEmployees(e => { e.ability += 2; e.mood += 5; }); return '全体员工能力+2, 心情+5'; } },
  { id: 2, name: '政府补贴', type: 'positive', prob: 0.03, desc: '公司获得政府专项补贴。', effect: (g) => { g.addFunds(30000); return '资金+$30,000'; } },
  { id: 3, name: '员工推荐', type: 'positive', prob: 0.03, desc: '一位优秀的中级人才慕名而来。', effect: (g) => { g.addFreeEmployee('medium'); return '免费获得一个中级员工'; } },
  { id: 4, name: '技术突破', type: 'positive', prob: 0.02, desc: '团队攻克技术难关，所有项目进展顺利。', effect: (g) => { g.allProjects(p => { p.currentProgress += p.hiddenTotalProgress * 0.05; }); return '所有项目进度+5%'; } },
  { id: 5, name: '办公环境改善', type: 'positive', prob: 0.02, desc: '办公环境得到优化，员工心情大好。', effect: (g) => { g.allEmployees(e => { e.stress -= 5; }); return '全体员工压力-5'; } },
  { id: 6, name: '媒体报道', type: 'positive', prob: 0.02, desc: '公司项目被主流媒体报道，声誉大增。', effect: (g) => { g.addExp(50); return '公司经验+50'; } },
  { id: 7, name: '老客户回馈', type: 'positive', prob: 0.02, desc: '老客户追加订单，额外收入一笔。', effect: (g) => { g.addFunds(20000); return '资金+$20,000'; } },
  { id: 8, name: '团队默契提升', type: 'positive', prob: 0.02, desc: '团队合作越来越默契。', effect: (g) => { g.allEmployees(e => { e.mood += 3; e.stress -= 3; }); return '全体心情+3, 压力-3'; } },
  { id: 9, name: '设计大奖', type: 'positive', prob: 0.01, desc: '公司作品获得业界设计大奖！', effect: (g) => { g.addFunds(50000); g.addExp(80); return '资金+$50,000, 经验+80'; } },
  { id: 10, name: '实习生助力', type: 'positive', prob: 0.02, desc: '一批优秀实习生协助工作。', effect: (g) => { g.allProjects(p => { p.currentProgress += p.hiddenTotalProgress * 0.03; }); return '所有项目进度+3%'; } },
  { id: 11, name: '行业论坛', type: 'positive', prob: 0.02, desc: '参加行业论坛获取前沿知识。', effect: (g) => { g.allEmployees(e => { e.ability += 1; }); return '全体员工能力+1'; } },
  { id: 12, name: '节日福利', type: 'positive', prob: 0.02, desc: '节日期间发放福利，员工满意度提升。', effect: (g) => { g.allEmployees(e => { e.mood += 8; }); g.addFunds(-10000); return '全体心情+8, 费用$10,000'; } },
  { id: 13, name: '税收优惠', type: 'positive', prob: 0.02, desc: '获得区域税收优惠政策。', effect: (g) => { g.addFunds(15000); return '资金+$15,000'; } },
  { id: 14, name: '战略合作', type: 'positive', prob: 0.01, desc: '与知名企业达成战略合作。', effect: (g) => { g.addExp(40); g.allEmployees(e => { e.mood += 3; }); return '经验+40, 全体心情+3'; } },
  { id: 15, name: '员工生日会', type: 'positive', prob: 0.02, desc: '公司举办集体生日会。', effect: (g) => { g.allEmployees(e => { e.mood += 5; e.stress -= 2; }); return '全体心情+5, 压力-2'; } },
  { id: 16, name: '办公设备赞助', type: 'positive', prob: 0.01, desc: '供应商赞助了一批办公设备。', effect: (g) => { g.addFunds(8000); return '节省设备费$8,000'; } },

  // ===== 中性事件 (~30%) =====
  { id: 17, name: '项目延期', type: 'neutral', prob: 0.03, desc: '客户修改需求，项目工期延长。', effect: (g) => { g.allProjects(p => { p.maxAllowedMonths += 1; }); return '所有项目最长时间+1个月'; } },
  { id: 18, name: '行业调研', type: 'neutral', prob: 0.03, desc: '公司组织行业调研。', effect: (g) => { g.addFunds(-5000); g.addExp(20); return '费用$5,000, 经验+20'; } },
  { id: 19, name: '人员调整', type: 'neutral', prob: 0.03, desc: '部分员工调整岗位。', effect: (g) => { g.allEmployees(e => { e.mood -= 2; e.ability += 1; }); return '全体心情-2, 能力+1'; } },
  { id: 20, name: '办公室搬迁', type: 'neutral', prob: 0.02, desc: '公司搬迁至新办公室。', effect: (g) => { g.addFunds(-20000); g.allEmployees(e => { e.mood += 5; e.stress -= 3; }); return '费用$20,000, 心情+5, 压力-3'; } },
  { id: 21, name: '系统升级', type: 'neutral', prob: 0.03, desc: '办公系统进行升级。', effect: (g) => { g.addFunds(-8000); return '升级费用$8,000'; } },
  { id: 22, name: '规范整顿', type: 'neutral', prob: 0.03, desc: '公司进行内部规范整顿。', effect: (g) => { g.allEmployees(e => { e.stress += 3; e.mood -= 2; }); return '全体压力+3, 心情-2'; } },
  { id: 23, name: '客户考察', type: 'neutral', prob: 0.03, desc: '重要客户来公司考察。', effect: (g) => { g.allEmployees(e => { e.stress += 2; }); g.addExp(15); return '全体压力+2, 经验+15'; } },
  { id: 24, name: '季度总结', type: 'neutral', prob: 0.03, desc: '进行季度工作总结。', effect: (g) => { g.allEmployees(e => { e.mood -= 1; }); return '全体心情-1 (会议疲劳)'; } },
  { id: 25, name: '市场波动', type: 'neutral', prob: 0.02, desc: '市场行情出现小幅波动。', effect: (g) => { const amount = Math.random() > 0.5 ? 10000 : -10000; g.addFunds(amount); return amount > 0 ? '资金+$10,000' : '资金-$10,000'; } },
  { id: 26, name: '政策调整', type: 'neutral', prob: 0.02, desc: '行业政策微调。', effect: (g) => { return '暂无直接影响'; } },
  { id: 27, name: '供应商更换', type: 'neutral', prob: 0.02, desc: '更换办公用品供应商。', effect: (g) => { g.addFunds(-3000); return '过渡费用$3,000'; } },
  { id: 28, name: '网络故障', type: 'neutral', prob: 0.01, desc: '办公网络短暂故障，影响了半天工作。', effect: (g) => { g.allProjects(p => { p.currentProgress -= p.hiddenTotalProgress * 0.01; }); return '所有项目进度-1%'; } },

  // ===== 负面事件 (~30%) =====
  { id: 29, name: '客户毁约', type: 'negative', prob: 0.04, desc: '一个客户突然毁约，造成损失。', effect: (g) => { g.allProjects(p => { p.currentProgress -= p.hiddenTotalProgress * 0.20; }); g.addFunds(-10000); return '项目进度-20%, 资金-$10,000'; } },
  { id: 30, name: '设备故障', type: 'negative', prob: 0.04, desc: '部分办公设备出现故障。', effect: (g) => { g.addFunds(-5000); return '维修费用$5,000'; } },
  { id: 31, name: '人才流失', type: 'negative', prob: 0.03, desc: '行业竞争加剧，员工情绪不稳。', effect: (g) => { g.allEmployees(e => { e.mood -= 5; e.stress += 5; }); return '全体心情-5, 压力+5'; } },
  { id: 32, name: '恶意竞标', type: 'negative', prob: 0.04, desc: '竞争对手恶意压价竞标。', effect: (g) => { g.addFunds(-15000); return '项目利润被压缩$15,000'; } },
  { id: 33, name: '加班风波', type: 'negative', prob: 0.04, desc: '连续加班引起部分员工不满。', effect: (g) => { g.allEmployees(e => { e.mood -= 8; e.stress += 8; }); return '全体心情-8, 压力+8'; } },
  { id: 34, name: '数据泄露', type: 'negative', prob: 0.03, desc: '公司部分数据泄露，需紧急处理。', effect: (g) => { g.addFunds(-25000); g.allEmployees(e => { e.stress += 5; }); return '处理费$25,000, 全体压力+5'; } },
  { id: 35, name: '材料涨价', type: 'negative', prob: 0.03, desc: '建筑材料价格上涨。', effect: (g) => { g.addFunds(-12000); return '额外成本$12,000'; } },
  { id: 36, name: '审批延误', type: 'negative', prob: 0.03, desc: '项目审批流程延误。', effect: (g) => { g.allProjects(p => { p.currentProgress -= p.hiddenTotalProgress * 0.05; }); return '所有项目进度-5%'; } },
  { id: 37, name: '自然灾害', type: 'negative', prob: 0.02, desc: '暴雨导致办公室受灾。', effect: (g) => { g.addFunds(-30000); g.allEmployees(e => { e.mood -= 10; }); return '修复费$30,000, 全体心情-10'; } },
  { id: 38, name: '罚款通知', type: 'negative', prob: 0.04, desc: '因合规疏忽收到罚款通知。', effect: (g) => { g.addFunds(-20000); return '罚款$20,000'; } },
  { id: 39, name: '核心员工被挖', type: 'negative', prob: 0.03, desc: '竞争对手试图挖走你的核心员工。', effect: (g) => { g.allEmployees(e => { e.mood -= 3; }); return '全体心情-3 (人心不稳)'; } },
  { id: 40, name: '项目纠纷', type: 'negative', prob: 0.03, desc: '与合作方产生项目纠纷。', effect: (g) => { g.addFunds(-18000); g.allEmployees(e => { e.stress += 3; }); return '律师费$18,000, 全体压力+3'; } },
];

export default EVENTS;
