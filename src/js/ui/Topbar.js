// ===== Topbar Component =====
import router from '../router.js';
import eventBus from '../eventBus.js';
import gameEngine from '../engine/GameEngine.js';
import { showModal } from './Modal.js';

export function renderTopbar() {
  const currentPage = router.getCurrentPage();
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'employee', label: 'Employee' },
    { id: 'project', label: 'Project' },
    { id: 'equipment', label: 'Equipment' },
  ];

  const companyName = gameEngine.companyManager.name;
  const initial = companyName ? companyName[0].toUpperCase() : 'S';

  return `
    <nav class="topbar" id="topbar">
      <div class="topbar__left">
        <span class="topbar__brand">Tenure Business</span>
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
        <button class="topbar__icon-btn" id="btn-undo" data-tooltip="撤销 (Ctrl+Z)" style="display:none;">
          <i data-lucide="undo" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-notifications" data-tooltip="通知">
          <i data-lucide="bell" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-help" data-tooltip="游戏指南">
          <i data-lucide="help-circle" width="18" height="18"></i>
        </button>
        <button class="topbar__icon-btn" id="btn-settings" data-tooltip="设置">
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
      const response = await fetch('./GameplayGuide.md');
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
        title: '游戏指南',
        content: `<div style="max-height:60vh; overflow-y:auto; padding-right:10px; line-height:1.6; font-size:14px;">${html}</div>`,
        className: 'modal--lg'
      });
    } catch (error) {
      eventBus.emit('toast', { type: 'danger', message: '无法加载指南' });
    }
  });

  // Notifications button
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    eventBus.emit('toast', { type: 'info', message: '暂无提醒' });
  });

  // Settings button (Theme Switcher)
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('game-theme') || 'default';
    
    const content = `
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-sm);">选择你喜欢的系统主题风格：</p>
        <div class="theme-option ${currentTheme === 'default' ? 'active' : ''}" data-theme="default" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>🌿 清新简约 (默认)</span>
          ${currentTheme === 'default' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>
        <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>🌙 深邃暗黑</span>
          ${currentTheme === 'dark' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>
        <div class="theme-option ${currentTheme === 'vivid' ? 'active' : ''}" data-theme="vivid" style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-lg); border:1px solid var(--color-border); border-radius:var(--radius-md); cursor:pointer;">
          <span>🔮 幻紫霓虹</span>
          ${currentTheme === 'vivid' ? '<i data-lucide="check" width="16" height="16"></i>' : ''}
        </div>
      </div>
    `;

    const modal = showModal({
      title: '系统设置',
      content,
      footer: '<button class="btn btn--secondary" id="settings-close">关闭</button>'
    });

    modal.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        applyTheme(theme);
        // Refresh modal to show checkmark (or just close)
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
        eventBus.emit('toast', { type: 'success', message: '主题设置成功' });
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
