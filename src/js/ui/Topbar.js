import router from '../router.js';
import eventBus from '../eventBus.js';
import gameEngine from '../engine/GameEngine.js';
import { showModal, closeModal } from './Modal.js';
import { t, setLanguage, getCurrentLang } from '../utils/i18n.js';

export function renderTopbar() {
  const currentPage = router.getCurrentPage();
  const lang = getCurrentLang();
  const tabs = [
    { id: 'home', label: t('nav.home') },
    { id: 'employee', label: t('nav.employee') },
    { id: 'project', label: t('nav.project') },
    { id: 'equipment', label: t('nav.equipment') },
  ];

  const companyName = gameEngine.companyManager.name;
  const initial = companyName ? companyName[0].toUpperCase() : 'S';

  return `
    <nav class="topbar" id="topbar">
      <div class="topbar__left">
        <span class="topbar__brand">${t('nav.brand')}</span>
        <div class="topbar__nav">
          ${tabs.map(t => `
            <div class="topbar__nav-item ${currentPage === t.id ? 'active' : ''}"
                 data-page="${t.id}" id="nav-${t.id}">
              ${t.label}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="topbar__right">
        <button class="topbar__icon-btn" id="btn-undo" data-tooltip="${t('tooltip.undo')}" style="display:none;">
          <i data-lucide="undo" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-notifications" data-tooltip="${t('tooltip.notifications')}">
          <i data-lucide="bell" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-help" data-tooltip="${t('tooltip.help')}">
          <i data-lucide="help-circle" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-settings" data-tooltip="${t('tooltip.settings')}">
          <i data-lucide="settings" width="18" height="18"></i>
        </button>
        <div class="topbar__avatar">${initial}</div>
      </div>
    </nav>
  `;
}

export function bindTopbarEvents() {
  document.querySelectorAll('.topbar__nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      router.navigate(page);
    });
  });

  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      gameEngine.undo();
    });

    eventBus.on('undo:updated', () => {
      if (gameEngine.undoStack.length > 0) {
        undoBtn.style.display = 'flex';
      } else {
        undoBtn.style.display = 'none';
      }
    });

    // Check initial state
    if (gameEngine.undoStack.length > 0) {
      undoBtn.style.display = 'flex';
    }

    // Keyboard shortcut (Ctrl+Z or Cmd+Z)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        gameEngine.undo();
      }
    });
  }

  // Help button
  document.getElementById('btn-help')?.addEventListener('click', async () => {
    try {
      const lang = getCurrentLang();
      const fileName = lang === 'en' ? 'GameplayGuide_EN.md' : 'GameplayGuide.md';
      const response = await fetch(`./${fileName}`);
      const text = await response.text();
      
      // Simple markdown-ish to HTML conversion
      const html = text
        .replace(/^# (.*$)/gim, '<h1 style="margin-top:20px;border-bottom:1px solid #eee;padding-bottom:10px;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="margin-top:15px;color:var(--color-primary);">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="margin-top:10px;">$1</h3>')
        .replace(/^\- (.*$)/gim, '<li style="margin-left:20px;">$1</li>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\n/gim, '<br>');

      showModal({
        title: t('tooltip.help'),
        content: `<div style="max-height:60vh; overflow-y:auto; padding-right:10px; line-height:1.6; font-size:14px;">${html}</div>`,
        className: 'modal--lg'
      });
    } catch (error) {
      eventBus.emit('toast', { type: 'danger', message: t('msg.errorLoadingGuide') });
    }
  });

  // Notifications button
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    eventBus.emit('toast', { type: 'info', message: t('msg.noNotifications') });
  });

  // Settings button (Theme & Language Switcher)
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('game-theme') || 'default';
    const currentLang = getCurrentLang();
    
    const content = `
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-xs);">${t('settings.theme')}:</p>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-sm);">
          <div class="theme-option ${currentTheme === 'default' ? 'active' : ''}" data-theme="default" style="padding:var(--space-md); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer; text-align:center;">
            ${t('settings.theme.default')}
          </div>
          <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" style="padding:var(--space-md); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer; text-align:center;">
            ${t('settings.theme.dark')}
          </div>
          <div class="theme-option ${currentTheme === 'vivid' ? 'active' : ''}" data-theme="vivid" style="padding:var(--space-md); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer; text-align:center;">
            ${t('settings.theme.vivid')}
          </div>
        </div>

        <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-top:var(--space-md); margin-bottom:var(--space-xs);">${t('settings.language')}:</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm);">
          <div class="lang-option ${currentLang === 'zh' ? 'active' : ''}" data-lang="zh" style="padding:var(--space-md); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer; text-align:center;">
            简体中文
          </div>
          <div class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="padding:var(--space-md); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer; text-align:center;">
            English
          </div>
        </div>
      </div>
    `;

    const modal = showModal({
      title: t('settings.title'),
      content,
      footer: `<button class="btn btn--secondary" id="settings-close">${t('btn.close')}</button>`
    });

    modal.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        applyTheme(opt.dataset.theme);
        closeModal(modal);
        eventBus.emit('toast', { type: 'success', message: t('toast.themeSuccess') });
      });
    });

    modal.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        setLanguage(opt.dataset.lang);
        gameEngine.gameState.language = opt.dataset.lang;
        closeModal(modal);
        eventBus.emit('toast', { type: 'success', message: t('toast.langSuccess') });
      });
    });

    document.getElementById('settings-close')?.addEventListener('click', () => {
      closeModal(modal);
    });
  });
}

function applyTheme(theme) {
  document.body.classList.remove('dark-theme', 'vivid-theme');
  if (theme === 'dark') document.body.classList.add('dark-theme');
  if (theme === 'vivid') document.body.classList.add('vivid-theme');
  localStorage.setItem('game-theme', theme);
}

// Initial theme application
const savedTheme = localStorage.getItem('game-theme') || 'default';
applyTheme(savedTheme);
