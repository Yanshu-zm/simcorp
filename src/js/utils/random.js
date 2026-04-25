// ===== Random Utilities =====

/** 范围内随机整数 [min, max] */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 范围内随机浮点数 [min, max) */
export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** 加权随机抽取 - 返回被选中项的索引 */
export function weightedRandom(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/** 加权随机抽取对象数组, 使用 prob 字段 */
export function weightedRandomPick(items) {
  const weights = items.map(i => i.prob || 1);
  return items[weightedRandom(weights)];
}

/** 从数组随机选一项 */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 从数组随机选 n 项（不重复） */
export function randomPickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/** 生成唯一 ID */
let idCounter = 0;
export function uid() {
  return `id_${Date.now()}_${idCounter++}`;
}

/** 根据概率分布选择等级 */
export function pickByProbability(probMap) {
  const entries = Object.entries(probMap);
  const weights = entries.map(([, p]) => p);
  const idx = weightedRandom(weights);
  return entries[idx][0];
}

/** Clamp */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
