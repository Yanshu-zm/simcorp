// ===== Sidebar Component =====
import gameEngine from '../engine/GameEngine.js';
import router from '../router.js';
import { formatMoney } from '../utils/format.js';
import eventBus from '../eventBus.js';
import { t } from '../utils/i18n.js';

export function renderSidebar() {
  const company = gameEngine.companyManager;
  const initial = company.name ? company.name[0].toUpperCase() : 'S';

  const navItems = [
    { id: 'company-stats', icon: 'layout-dashboard', label: t('sidebar.companyStats'), action: 'home' },
    { id: 'boss-actions', icon: 'sparkles', label: t('sidebar.bossActions'), action: 'home' },
    { id: 'recruitment', icon: 'user-plus', label: t('sidebar.recruitment'), action: 'employee' },
    { id: 'inventory', icon: 'package', label: t('sidebar.inventory'), action: 'equipment' },
  ];

  const currentPage = router.getCurrentPage();

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__header">
        <div class="sidebar__company-icon">${initial}</div>
        <div class="sidebar__company-info">
          <div class="sidebar__company-name">${company.name}</div>
          <div class="sidebar__company-level">${t('sidebar.levelLabel', { level: company.level })}</div>
        </div>
      </div>
      <nav class="sidebar__nav">
        ${navItems.map(item => `
          <div class="sidebar__nav-item ${currentPage === item.action ? 'active' : ''}"
               data-action="${item.action}" id="sidebar-${item.id}">
            <i data-lucide="${item.icon}" width="18" height="18"></i>
            ${item.label}
          </div>
        `).join('')}
      </nav>
      <div class="sidebar__footer">
        <button class="sidebar__market-btn" id="btn-open-market">
          ${t('sidebar.openMarket')}
        </button>
        <div class="sidebar__footer-link" id="btn-ai-settings">
          <i data-lucide="bot" width="16" height="16"></i>
          ${t('sidebar.aiSettings')}
        </div>
        <div class="sidebar__footer-link" id="btn-save">
          <i data-lucide="save" width="16" height="16"></i>
          ${t('sidebar.save')}
        </div>
      </div>
    </aside>
  `;
}

export function bindSidebarEvents() {
  document.querySelectorAll('.sidebar__nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      router.navigate(action);
    });
  });

  const marketBtn = document.getElementById('btn-open-market');
  if (marketBtn) {
    marketBtn.addEventListener('click', () => router.navigate('project'));
  }

  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => gameEngine.save());
  }

  const aiSettingsBtn = document.getElementById('btn-ai-settings');
  if (aiSettingsBtn) {
    aiSettingsBtn.addEventListener('click', () => eventBus.emit('ai:openSettings'));
  }
}
