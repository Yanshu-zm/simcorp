// ===== AI Settings Modal =====
import { PROVIDERS, loadAIConfig, saveAIConfig, clearAIConfig, getProviderConfig } from '../ai/aiConfig.js';
import aiService from '../ai/AIService.js';
import { showModal, closeModal } from './Modal.js';
import eventBus from '../eventBus.js';
import { t } from '../utils/i18n.js';

export function openAISettings() {
  const cfg = loadAIConfig();

  const content = `
    <div class="ai-settings__provider-grid">
      ${Object.entries(PROVIDERS).map(([id, p]) => `
        <div class="ai-settings__provider-card ${cfg.provider === id ? 'active' : ''}" data-provider="${id}">
          <div style="font-size:1.5rem;">${id === 'deepseek' ? '🐋' : '🔮'}</div>
          <div class="ai-settings__provider-name">${p.name}</div>
        </div>
      `).join('')}
    </div>

    <div class="ai-settings__field">
      <label class="ai-settings__label">API Key</label>
      <div class="ai-settings__key-row">
        <input type="password" class="ai-settings__input" id="ai-key-input"
               value="${cfg.apiKey || ''}" placeholder="API Key" />
        <div class="ai-settings__key-toggle" id="ai-key-toggle">
          <i data-lucide="eye" width="16" height="16"></i>
        </div>
      </div>
    </div>

    <div class="ai-settings__field">
      <label class="ai-settings__label">${t('ai.model')}</label>
      <select class="ai-settings__select" id="ai-model-select">
        ${getProviderConfig(cfg.provider).models.map(m =>
          `<option value="${m}" ${cfg.model === m ? 'selected' : ''}>${m}</option>`
        ).join('')}
      </select>
    </div>

    <div class="ai-settings__field">
      <label class="ai-settings__label">${t('ai.replyLanguage')}</label>
      <select class="ai-settings__select" id="ai-lang-select">
        <option value="zh" ${cfg.language === 'zh' ? 'selected' : ''}>中文</option>
        <option value="en" ${cfg.language === 'en' ? 'selected' : ''}>English</option>
      </select>
    </div>

    <div style="display:flex;gap:var(--space-md);">
      <button class="btn btn--outline btn--full" id="ai-test-btn">
        <i data-lucide="wifi" width="14" height="14"></i> ${t('ai.testConnection')}
      </button>
      <button class="btn btn--outline" id="ai-clear-btn" style="color:var(--color-danger);">
        ${t('ai.clear')}
      </button>
    </div>

    <div id="ai-test-result"></div>

    <div class="ai-settings__hint">
      <i data-lucide="shield" width="14" height="14" style="flex-shrink:0;margin-top:1px;"></i>
      <div>${t('ai.apiKeyHint')}</div>
    </div>
  `;

  const modal = showModal({
    title: `⚙️ ${t('ai.settingsTitle')}`,
    content,
    footer: `
      <button class="btn btn--secondary" id="ai-cancel">${t('emp.cancel')}</button>
      <button class="btn btn--primary" id="ai-save">${t('ai.saveSettings')}</button>
    `,
  });

  // Provider selection
  modal.querySelectorAll('.ai-settings__provider-card').forEach(card => {
    card.addEventListener('click', () => {
      modal.querySelectorAll('.ai-settings__provider-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const providerId = card.dataset.provider;
      const provider = getProviderConfig(providerId);
      const modelSelect = modal.querySelector('#ai-model-select');
      if (modelSelect) {
        modelSelect.innerHTML = provider.models
          .map(m => `<option value="${m}">${m}</option>`)
          .join('');
      }
    });
  });

  // Key toggle
  modal.querySelector('#ai-key-toggle')?.addEventListener('click', () => {
    const input = modal.querySelector('#ai-key-input');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  });

  // Test connection
  modal.querySelector('#ai-test-btn')?.addEventListener('click', async () => {
    const resultEl = modal.querySelector('#ai-test-result');
    if (!resultEl) return;
    resultEl.innerHTML = `<div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-md);">${t('ai.testing')}</div>`;

    // Temporarily save config for test
    const tempCfg = collectFormConfig(modal);
    saveAIConfig(tempCfg);

    const result = await aiService.testConnection();
    if (result.success) {
      resultEl.innerHTML = `<div class="ai-settings__test-result ai-settings__test-result--success">✅ ${t('ai.testSuccess')}</div>`;
    } else {
      resultEl.innerHTML = `<div class="ai-settings__test-result ai-settings__test-result--error">❌ ${t('ai.testFail')}: ${result.error}</div>`;
    }
  });

  // Clear
  modal.querySelector('#ai-clear-btn')?.addEventListener('click', () => {
    clearAIConfig();
    closeModal(modal);
    eventBus.emit('toast', { type: 'info', message: t('ai.cleared') });
  });

  // Cancel
  modal.querySelector('#ai-cancel')?.addEventListener('click', () => closeModal(modal));

  // Save
  modal.querySelector('#ai-save')?.addEventListener('click', () => {
    const newCfg = collectFormConfig(modal);
    saveAIConfig(newCfg);
    closeModal(modal);
    eventBus.emit('toast', { type: 'success', message: t('ai.saved') });
  });
}

function collectFormConfig(modal) {
  const activeProvider = modal.querySelector('.ai-settings__provider-card.active');
  const provider = activeProvider?.dataset.provider || 'deepseek';
  const apiKey = modal.querySelector('#ai-key-input')?.value || '';
  const model = modal.querySelector('#ai-model-select')?.value || getProviderConfig(provider).defaultModel;
  const language = modal.querySelector('#ai-lang-select')?.value || 'zh';

  return {
    provider,
    apiKey,
    model,
    maxTokens: 300,
    temperature: 0.8,
    language,
  };
}

// Listen for open settings event
eventBus.on('ai:openSettings', openAISettings);
