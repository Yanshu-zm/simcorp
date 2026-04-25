// ===== Chat Panel UI Component =====
import chatManager from '../ai/ChatManager.js';
import aiService from '../ai/AIService.js';
import gameEngine from '../engine/GameEngine.js';
import eventBus from '../eventBus.js';

let currentEmpId = null;
let isStreaming = false;

export function openChatPanel(empId) {
  const emp = gameEngine.employeeManager.getEmployee(empId);
  if (!emp) return;
  currentEmpId = empId;

  // Remove existing panel
  closeChatPanel();

  const configured = aiService.isConfigured();
  const history = chatManager.getHistory(empId);

  const overlay = document.createElement('div');
  overlay.className = 'chat-panel-overlay active';
  overlay.id = 'chat-panel-overlay';
  overlay.innerHTML = `
    <div class="chat-panel" id="chat-panel">
      <div class="chat-panel__header">
        <div class="chat-panel__avatar" style="background:${emp.avatarColor};">
          ${emp.firstName[0]}${emp.lastName[0]}
        </div>
        <div class="chat-panel__info">
          <div class="chat-panel__name">💬 ${emp.firstName} ${emp.lastName}</div>
          <div class="chat-panel__meta">
            <span>${emp.title === 'senior' ? 'Senior' : emp.title === 'medium' ? 'Medium' : 'Junior'}</span>
            <span>·</span>
            <span>${emp.functions.join('/')}</span>
            <span>·</span>
            <span>心情:${Math.round(emp.mood)}</span>
            <span>压力:${Math.round(emp.stress)}</span>
          </div>
        </div>
        <div class="chat-panel__close" id="chat-close">
          <i data-lucide="x" width="18" height="18"></i>
        </div>
      </div>

      ${!configured ? `
        <div class="chat-panel__banner">
          ⚠️ 未配置 AI API，使用模板回复 ·
          <a id="chat-open-settings">去设置</a>
        </div>
      ` : ''}

      <div class="chat-panel__messages" id="chat-messages">
        ${renderExistingMessages(history.messages)}
        ${history.messages.length === 0 ? renderWelcome(emp) : ''}
      </div>

      <div class="chat-panel__input-area">
        <input type="text" class="chat-panel__input" id="chat-input"
               placeholder="输入消息..." autocomplete="off" />
        <div class="chat-panel__send" id="chat-send">
          <i data-lucide="send" width="16" height="16"></i>
        </div>
      </div>

      <div class="chat-panel__footer">
        <div class="chat-panel__footer-actions">
          <div class="chat-panel__footer-btn" id="chat-settings-btn">
            <i data-lucide="settings" width="12" height="12"></i> AI设置
          </div>
          <div class="chat-panel__footer-btn" id="chat-clear-btn">
            <i data-lucide="trash-2" width="12" height="12"></i> 清空
          </div>
        </div>
        <div class="chat-panel__token-count" id="chat-token-count">
          Tokens: ${aiService.getTokensUsed().toLocaleString()}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  if (window.lucide) lucide.createIcons();

  // Bind events
  bindChatEvents(overlay, empId);

  // Scroll to bottom
  scrollToBottom();

  // Focus input
  setTimeout(() => {
    document.getElementById('chat-input')?.focus();
  }, 400);
}

function renderWelcome(emp) {
  const greetings = {
    high: '老板好！有什么事吗？😊',
    mid: '老板好。',
    low: '...嗯？',
  };
  const greeting = emp.mood >= 70 ? greetings.high : emp.mood >= 40 ? greetings.mid : greetings.low;
  return `
    <div class="chat-msg chat-msg--ai">
      <div class="chat-msg__bubble">${greeting}</div>
    </div>
  `;
}

function renderExistingMessages(messages) {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => {
      if (m.role === 'user') {
        return `<div class="chat-msg chat-msg--user"><div class="chat-msg__bubble">${escapeHtml(m.content)}</div></div>`;
      }
      return `<div class="chat-msg chat-msg--ai"><div class="chat-msg__bubble">${escapeHtml(m.content)}</div></div>`;
    })
    .join('');
}

function appendMessage(role, text, effects = []) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const cls = role === 'user' ? 'chat-msg--user' : role === 'system' ? 'chat-msg--system' : 'chat-msg--ai';
  const msgEl = document.createElement('div');
  msgEl.className = `chat-msg ${cls}`;

  let effectsHtml = '';
  if (effects.length > 0) {
    effectsHtml = '<div class="chat-msg__effects">' +
      effects.map(e => {
        const label = e.attr === 'mood' ? '心情' : '压力';
        const sign = e.value > 0 ? '+' : '';
        const cls = (e.attr === 'mood' && e.value > 0) || (e.attr === 'stress' && e.value < 0)
          ? 'chat-msg__effect-tag--positive'
          : 'chat-msg__effect-tag--negative';
        return `<span class="chat-msg__effect-tag ${cls}">${label} ${sign}${e.value}</span>`;
      }).join('') + '</div>';
  }

  msgEl.innerHTML = `<div class="chat-msg__bubble">${escapeHtml(text)}</div>${effectsHtml}`;
  container.appendChild(msgEl);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const el = document.createElement('div');
  el.id = 'chat-typing';
  el.className = 'chat-typing';
  el.innerHTML = '<div class="chat-typing__dot"></div><div class="chat-typing__dot"></div><div class="chat-typing__dot"></div>';
  container.appendChild(el);
  scrollToBottom();
}

function removeTypingIndicator() {
  document.getElementById('chat-typing')?.remove();
}

function updateStreamingBubble(text) {
  let bubble = document.getElementById('chat-streaming-bubble');
  const container = document.getElementById('chat-messages');
  if (!bubble && container) {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg--ai';
    msgEl.innerHTML = '<div class="chat-msg__bubble" id="chat-streaming-bubble"></div>';
    container.appendChild(msgEl);
    bubble = document.getElementById('chat-streaming-bubble');
  }
  if (bubble) {
    bubble.textContent = text;
    scrollToBottom();
  }
}

function finalizeStreamingBubble(cleanText, effects) {
  const bubble = document.getElementById('chat-streaming-bubble');
  if (bubble) {
    bubble.textContent = cleanText;
    bubble.removeAttribute('id');
    // Add effects tags
    if (effects.length > 0) {
      const parent = bubble.parentElement;
      const effectsHtml = effects.map(e => {
        const label = e.attr === 'mood' ? '心情' : '压力';
        const sign = e.value > 0 ? '+' : '';
        const cls = (e.attr === 'mood' && e.value > 0) || (e.attr === 'stress' && e.value < 0)
          ? 'chat-msg__effect-tag--positive'
          : 'chat-msg__effect-tag--negative';
        return `<span class="chat-msg__effect-tag ${cls}">${label} ${sign}${e.value}</span>`;
      }).join('');
      const div = document.createElement('div');
      div.className = 'chat-msg__effects';
      div.innerHTML = effectsHtml;
      parent.appendChild(div);
    }
  }
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

function updateTokenDisplay() {
  const el = document.getElementById('chat-token-count');
  if (el) el.textContent = `Tokens: ${aiService.getTokensUsed().toLocaleString()}`;
}

async function handleSend(empId) {
  if (isStreaming) return;
  const input = document.getElementById('chat-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendMessage('user', text);

  const sendBtn = document.getElementById('chat-send');
  if (sendBtn) sendBtn.classList.add('chat-panel__send--disabled');
  isStreaming = true;

  const configured = aiService.isConfigured();

  if (configured) {
    // Stream mode
    showTypingIndicator();
    try {
      const result = await chatManager.sendMessageStream(empId, text, (delta, fullText) => {
        removeTypingIndicator();
        updateStreamingBubble(fullText);
      });
      removeTypingIndicator();
      finalizeStreamingBubble(result.text, result.effects);
      updateTokenDisplay();
      if (result.effects.length > 0) eventBus.emit('ui:refresh');
    } catch {
      removeTypingIndicator();
      appendMessage('ai', '（请求失败，请检查 AI 设置）');
    }
  } else {
    // Template mode
    showTypingIndicator();
    const result = await chatManager.sendMessage(empId, text);
    removeTypingIndicator();
    appendMessage('ai', result.text, result.effects);
  }

  isStreaming = false;
  if (sendBtn) sendBtn.classList.remove('chat-panel__send--disabled');
  input.focus();

  // Refresh employee meta in header
  refreshChatHeader(empId);
}

function refreshChatHeader(empId) {
  const emp = gameEngine.employeeManager.getEmployee(empId);
  if (!emp) return;
  const metaEl = document.querySelector('.chat-panel__meta');
  if (metaEl) {
    metaEl.innerHTML = `
      <span>${emp.title === 'senior' ? 'Senior' : emp.title === 'medium' ? 'Medium' : 'Junior'}</span>
      <span>·</span>
      <span>${emp.functions.join('/')}</span>
      <span>·</span>
      <span>心情:${Math.round(emp.mood)}</span>
      <span>压力:${Math.round(emp.stress)}</span>
    `;
  }
}

function bindChatEvents(overlay, empId) {
  // Close
  overlay.querySelector('#chat-close')?.addEventListener('click', closeChatPanel);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeChatPanel();
  });

  // Send
  overlay.querySelector('#chat-send')?.addEventListener('click', () => handleSend(empId));
  overlay.querySelector('#chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(empId);
    }
  });

  // Clear
  overlay.querySelector('#chat-clear-btn')?.addEventListener('click', () => {
    chatManager.clearHistory(empId);
    const container = document.getElementById('chat-messages');
    if (container) {
      const emp = gameEngine.employeeManager.getEmployee(empId);
      container.innerHTML = emp ? renderWelcome(emp) : '';
    }
    eventBus.emit('toast', { type: 'info', message: '对话记录已清空' });
  });

  // Settings
  overlay.querySelector('#chat-settings-btn')?.addEventListener('click', () => {
    eventBus.emit('ai:openSettings');
  });
  overlay.querySelector('#chat-open-settings')?.addEventListener('click', () => {
    eventBus.emit('ai:openSettings');
  });
}

export function closeChatPanel() {
  const overlay = document.getElementById('chat-panel-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 350);
  }
  currentEmpId = null;
  isStreaming = false;
}

/** Inject a system event into the currently open chat */
export function injectChatEvent(empId, text) {
  chatManager.injectEvent(empId, text);
  if (currentEmpId === empId) {
    appendMessage('system', `📋 ${text}`);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
