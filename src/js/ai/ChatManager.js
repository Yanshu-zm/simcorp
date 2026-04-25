// ===== Chat Manager — Dialogue Orchestrator =====
import aiService from './AIService.js';
import promptBuilder from './PromptBuilder.js';
import gameEngine from '../engine/GameEngine.js';
import eventBus from '../eventBus.js';
import { clamp } from '../utils/random.js';

// Template replies for fallback (no API)
const TEMPLATE_REPLIES = {
  high: [
    '老板好！一切顺利，有什么需要尽管说！',
    '嗨老板！今天心情不错，工作进展很顺利~',
    '老板！我最近状态超好的，感觉干劲十足！',
    '有什么新任务吗？我现在精力充沛！',
    '老板辛苦了！我这边都在正常推进中。',
  ],
  mid: [
    '好的，收到。',
    '嗯，我来看看。',
    '了解了，老板。',
    '行，我知道了。',
    '嗯嗯，没问题。',
  ],
  low: [
    '...知道了。',
    '嗯。',
    '好吧。',
    '哦...行。',
    '我尽量吧...',
  ],
  veryLow: [
    '...',
    '随便吧。',
    '我真的快撑不住了...',
    '老板，能不能让我歇歇...',
    '说实话我有点想辞职了...',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTemplateReply(employee) {
  if (employee.mood >= 80) return pickRandom(TEMPLATE_REPLIES.high);
  if (employee.mood >= 50) return pickRandom(TEMPLATE_REPLIES.mid);
  if (employee.mood >= 20) return pickRandom(TEMPLATE_REPLIES.low);
  return pickRandom(TEMPLATE_REPLIES.veryLow);
}

class ChatManager {
  constructor() {
    // employeeId → { messages: [{role, content}], events: [] }
    this.histories = new Map();
  }

  getHistory(empId) {
    if (!this.histories.has(empId)) {
      this.histories.set(empId, { messages: [], events: [] });
    }
    return this.histories.get(empId);
  }

  clearHistory(empId) {
    this.histories.delete(empId);
  }

  clearAllHistories() {
    this.histories.clear();
  }

  /** 注入游戏事件到对话上下文 */
  injectEvent(empId, eventText) {
    const history = this.getHistory(empId);
    // 作为 system 消息插入
    history.messages.push({
      role: 'system',
      content: `[系统通知: ${eventText}]`,
    });
  }

  /** 构建游戏上下文 */
  _getGameContext(empId) {
    const emp = gameEngine.employeeManager.getEmployee(empId);
    let projectInfo = null;
    if (emp && emp.assignedProjectId) {
      const proj = gameEngine.projectManager.getProjectById(emp.assignedProjectId);
      if (proj) {
        const pct = Math.min(100, Math.round((proj.currentProgress / proj.hiddenTotalProgress) * 100));
        projectInfo = `${proj.name}（${proj.category}，${proj.rarity}级，进度${pct}%，已${proj.monthsElapsed}/${proj.maxAllowedMonths}月）`;
      }
    }

    const cfg = aiService.getConfig();
    return {
      month: gameEngine.gameState.month,
      year: gameEngine.gameState.year,
      companyName: gameEngine.companyManager.name,
      projectInfo,
      language: cfg.language || 'zh',
    };
  }

  /** 解析 AI 回复中的数值标签 */
  parseEffects(rawText) {
    const tagRegex = /\[(MOOD|STRESS)([+-]\d+)\]/g;
    const effects = [];
    let match;

    while ((match = tagRegex.exec(rawText)) !== null) {
      const attr = match[1].toLowerCase(); // 'mood' or 'stress'
      const value = parseInt(match[2], 10);
      // Clamp effect magnitude
      const clamped = attr === 'mood'
        ? clamp(value, -5, 5)
        : clamp(value, -5, 5);
      effects.push({ attr, value: clamped });
    }

    // Remove tags from displayed text
    const cleanText = rawText.replace(tagRegex, '').trim();

    return { cleanText, effects };
  }

  /** 应用数值影响到员工 */
  applyEffects(empId, effects) {
    const emp = gameEngine.employeeManager.getEmployee(empId);
    if (!emp || effects.length === 0) return;

    for (const eff of effects) {
      if (eff.attr === 'mood') {
        emp.mood = clamp(emp.mood + eff.value, 0, 100);
      } else if (eff.attr === 'stress') {
        emp.stress = clamp(emp.stress + eff.value, 0, 120);
      }
    }
  }

  /**
   * 发送消息并获取回复
   * @returns {{ text: string, effects: Array, isTemplate: boolean }}
   */
  async sendMessage(empId, userInput) {
    const emp = gameEngine.employeeManager.getEmployee(empId);
    if (!emp) return { text: '（该员工不存在）', effects: [], isTemplate: true };

    const history = this.getHistory(empId);

    // Record user message
    history.messages.push({ role: 'user', content: userInput });

    // If no API configured, use template
    if (!aiService.isConfigured()) {
      const reply = getTemplateReply(emp);
      history.messages.push({ role: 'assistant', content: reply });
      return { text: reply, effects: [], isTemplate: true };
    }

    // Build messages and call API
    try {
      const gameContext = this._getGameContext(empId);
      const messages = promptBuilder.buildMessages(emp, history.messages.slice(0, -1), userInput, gameContext);

      const rawReply = await aiService.chat(messages);
      const { cleanText, effects } = this.parseEffects(rawReply);

      // Record AI reply
      history.messages.push({ role: 'assistant', content: cleanText });

      // Apply effects
      this.applyEffects(empId, effects);

      return { text: cleanText, effects, isTemplate: false };
    } catch (err) {
      const errorMsg = `（AI 请求失败: ${err.message}）`;
      return { text: errorMsg, effects: [], isTemplate: true, error: true };
    }
  }

  /**
   * 流式发送消息
   * @param {Function} onChunk - (delta, fullText) 回调
   * @returns {Promise<{ text, effects, isTemplate }>}
   */
  async sendMessageStream(empId, userInput, onChunk) {
    const emp = gameEngine.employeeManager.getEmployee(empId);
    if (!emp) return { text: '（该员工不存在）', effects: [], isTemplate: true };

    const history = this.getHistory(empId);
    history.messages.push({ role: 'user', content: userInput });

    if (!aiService.isConfigured()) {
      const reply = getTemplateReply(emp);
      history.messages.push({ role: 'assistant', content: reply });
      // Simulate typing
      for (let i = 0; i < reply.length; i++) {
        await new Promise(r => setTimeout(r, 30));
        onChunk(reply[i], reply.slice(0, i + 1));
      }
      return { text: reply, effects: [], isTemplate: true };
    }

    try {
      const gameContext = this._getGameContext(empId);
      const messages = promptBuilder.buildMessages(emp, history.messages.slice(0, -1), userInput, gameContext);

      const rawReply = await aiService.chatStream(messages, onChunk);
      const { cleanText, effects } = this.parseEffects(rawReply);

      history.messages.push({ role: 'assistant', content: cleanText });
      this.applyEffects(empId, effects);

      return { text: cleanText, effects, isTemplate: false };
    } catch (err) {
      const errorMsg = `（AI 请求失败: ${err.message}）`;
      return { text: errorMsg, effects: [], isTemplate: true, error: true };
    }
  }
}

export const chatManager = new ChatManager();
export default chatManager;
