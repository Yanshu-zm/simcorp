// ===== Topbar Component =====
import router from '../router.js';
import eventBus from '../eventBus.js';
import gameEngine from '../engine/GameEngine.js';
import { showModal } from './Modal.js';
import { t, setLang, getLang } from '../utils/i18n.js';

export function renderTopbar() {
  const currentPage = router.getCurrentPage();
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
        <span class="topbar__brand">${t('topbar.brand')}</span>
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
        <button class="topbar__icon-btn" id="btn-undo" data-tooltip="${t('topbar.undo')}" style="display:none;">
          <i data-lucide="undo" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-notifications" data-tooltip="${t('topbar.notifications')}">
          <i data-lucide="bell" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-help" data-tooltip="${t('topbar.help')}">
          <i data-lucide="help-circle" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-settings" data-tooltip="${t('topbar.settings')}">
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
      const isEn = getLang() === 'en';
      const response = await fetch(isEn ? './GameplayGuide_en.md' : './GameplayGuide.md');
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
        title: t('topbar.gameGuide') || 'Game Guide',
        content: `<div style="line-height:1.6;font-size:var(--font-size-sm);color:var(--color-text-secondary);">${html}</div>`,
        className: 'guide-modal'
      });
    } catch (error) {
      eventBus.emit('toast', { type: 'danger', message: t('help.loadFail') });
    }
  });

  // Notifications button
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    eventBus.emit('toast', { type: 'info', message: t('topbar.noNotifications') });
  });

  // Settings button (Theme + Language Switcher)
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('game-theme') || 'default';
    const currentLang = getLang();
    
    const content = `
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-sm);">${t('settings.themeLabel')}</p>
        <div class="theme-option ${currentTheme === 'default' ? 'active' : ''}" data-theme="default" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>${t('settings.themeDefault')}</span>
          ${currentTheme === 'default' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>
        <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>${t('settings.themeDark')}</span>
          ${currentTheme === 'dark' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>
        <div class="theme-option ${currentTheme === 'vivid' ? 'active' : ''}" data-theme="vivid" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>${t('settings.themeVivid')}</span>
          ${currentTheme === 'vivid' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>

        <div style="border-top:1px solid var(--color-border); margin-top:var(--space-md); padding-top:var(--space-lg);">
          <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-sm);">${t('settings.langLabel')}</p>
          <div style="display:flex; gap:var(--space-md);">
            <div class="lang-option ${currentLang === 'zh' ? 'active' : ''}" data-lang="zh" style="flex:1; display:flex; align-items:center; justify-content:center; padding:var(--space-lg); border:2px solid ${currentLang === 'zh' ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius:var(--radius-md); cursor:pointer; font-weight:${currentLang === 'zh' ? '600' : '400'};">
              ${t('settings.langZh')}
            </div>
            <div class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="flex:1; display:flex; align-items:center; justify-content:center; padding:var(--space-lg); border:2px solid ${currentLang === 'en' ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius:var(--radius-md); cursor:pointer; font-weight:${currentLang === 'en' ? '600' : '400'};">
              ${t('settings.langEn')}
            </div>
          </div>
        </div>
      </div>
    `;

    const modal = showModal({
      title: t('settings.title'),
      content,
      footer: `<button class="btn btn--secondary" id="settings-close">${t('settings.close')}</button>`
    });

    modal.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        applyTheme(theme);
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
        eventBus.emit('toast', { type: 'success', message: t('settings.themeSuccess') });
      });
    });

    modal.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const lang = opt.dataset.lang;
        setLang(lang);
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
        eventBus.emit('toast', { type: 'success', message: t('settings.langSuccess') });
        eventBus.emit('ui:refresh');
        // Also re-render topbar and sidebar
        const topbar = document.getElementById('topbar');
        if (topbar) {
          topbar.outerHTML = renderTopbar();
          bindTopbarEvents();
        }
      });
    });

    document.getElementById('settings-close')?.addEventListener('click', () => {
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) overlay.remove();
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
