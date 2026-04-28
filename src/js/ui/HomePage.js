// ===== Home Page =====
import gameEngine from '../engine/GameEngine.js';
import { renderNewsFeed } from './NewsFeed.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { BOSS_ACTIONS } from '../data/config.js';
import eventBus from '../eventBus.js';
import { t, tData } from '../utils/i18n.js';

export function renderHomePage() {
  const company = gameEngine.companyManager;
  const boss = gameEngine.bossManager;
  const employees = gameEngine.employeeManager.employees;
  const projects = gameEngine.projectManager.activeProjects;
  const { month, year } = gameEngine.gameState;

  const nextLevelExp = company.getExpForNextLevel();
  const expPct = nextLevelExp ? Math.min(100, (company.exp / nextLevelExp) * 100) : 100;
  const monthlyExpense = company.getMonthlyExpense(employees, gameEngine.equipmentManager.ownedEquipment);

  // Global efficiency
  const avgEfficiency = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + gameEngine.employeeManager.getEfficiency(e), 0) / employees.length * 100)
    : 0;

  return `
    <div class="home-page">
      <div class="home-page__left">
        <!-- Company System Card -->
        <div class="card company-system">
          <div class="company-system__header">
            <div>
              <div class="card__title" style="margin-bottom:0;">${t('home.companySystem')}</div>
            </div>
            <div class="company-system__level-badge">
              <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">LV.</div>
              <div style="font-size:var(--font-size-lg);font-weight:700;">${company.level}</div>
            </div>
          </div>
          <div class="company-system__exp">
            <span>${t('home.experience')}</span>
            <span>${company.exp}/${nextLevelExp || 'MAX'}</span>
          </div>
          <div class="progress">
            <div class="progress__fill progress__fill--gradient" style="width:${expPct}%"></div>
          </div>
          ${company.canUpgrade() ? `
            <button class="btn btn--primary btn--full" style="margin-top:var(--space-md);" id="btn-upgrade-company">
              ${t('home.upgradeCompany', { cost: formatMoney(company.getNextLevelConfig().upgradeCost) })}
            </button>
          ` : ''}
          <div class="company-system__funds">
            <span>${t('home.availableFunds')}</span>
            <span class="company-system__funds-value">${formatMoney(company.funds)}</span>
          </div>
          <div class="company-system__cost">
            <span>${t('home.monthlyCost')}</span>
            <span>${formatMoney(-monthlyExpense)}</span>
          </div>
        </div>

        <!-- Boss Actions Card -->
        <div class="card boss-actions">
          <div class="card__title">${t('home.bossActions')}</div>
          <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-md);font-size:var(--font-size-sm);">
            <span>${t('home.mood')}: <strong>${boss.mood}</strong></span>
            <span>${t('home.ability')}: <strong>${boss.ability}</strong></span>
          </div>
          <div class="action-grid">
            ${BOSS_ACTIONS.map(action => {
              const canDo = boss.canPerformAction(action.id);
              return `
              <div class="action-grid__item ${canDo ? '' : 'action-grid__item--disabled'}"
                   data-boss-action="${action.id}" id="boss-action-${action.id}">
                <i data-lucide="${action.icon}" width="22" height="22"></i>
                ${tData(action, 'name')}
                ${action.cost > 0 ? `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">$${action.cost.toLocaleString()}</span>` : ''}
              </div>`;
            }).join('')}
            <div class="action-grid__item" data-boss-action="declare" id="boss-action-declare">
              <i data-lucide="megaphone" width="22" height="22"></i>
              ${t('home.declare')}
            </div>
            <div class="action-grid__item" data-boss-action="schedule" id="boss-action-schedule">
              <i data-lucide="calendar" width="22" height="22"></i>
              ${t('home.schedule')}
            </div>
          </div>
        </div>

        <!-- Date display -->
        <div class="home-date">
          <i data-lucide="calendar-days" width="16" height="16"></i>
          ${t('home.dateDisplay', { year, month })}
        </div>
      </div>

      <div class="home-page__center">
        <!-- Company Banner -->
        <div class="company-banner">
          <div class="company-banner__name">${company.name}</div>
        </div>

        <!-- Overview section -->
        <div class="card home-overview">
          <div class="home-overview__badge">${t('home.overview')}</div>
          <h2 class="home-overview__title">${t('home.overviewTitle')}</h2>
          <p class="home-overview__desc">
            ${t('home.overviewDesc', { name: company.name })}
          </p>
          <div class="home-overview__stats">
            <div class="stat">
              <div class="stat__value">${projects.length}</div>
              <div class="stat__label">${t('home.projects')}</div>
            </div>
            <div class="stat">
              <div class="stat__value">${employees.length}</div>
              <div class="stat__label">${t('home.staff')}</div>
            </div>
            <div class="stat">
              <div class="stat__value">${avgEfficiency}%</div>
              <div class="stat__label">${t('home.efficiency')}</div>
            </div>
          </div>
        </div>

        <!-- Feature cards -->
        <div class="home-features">
          <div class="feature-card feature-card--purple">
            <div class="feature-card__icon"><i data-lucide="trending-up" width="24" height="24"></i></div>
            <div class="feature-card__title">${t('home.growthIndex')}</div>
            <div class="feature-card__desc">${t('home.totalRevenue', { amount: formatMoney(company.totalRevenue) })}</div>
          </div>
          <div class="card" style="display:flex;flex-direction:column;justify-content:center;">
            <div style="margin-bottom:var(--space-xs);"><i data-lucide="monitor" width="20" height="20" style="color:var(--color-text-muted);"></i></div>
            <div class="feature-card__title" style="color:var(--color-text-primary);">${t('home.uptime')}</div>
            <div class="feature-card__desc" style="color:var(--color-text-secondary);">${t('home.uptimeDesc')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindHomePageEvents() {
  // Boss actions
  document.querySelectorAll('[data-boss-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const actionId = btn.dataset.bossAction;
      if (actionId === 'declare' || actionId === 'schedule') {
        eventBus.emit('toast', { type: 'info', message: t('home.comingSoon') });
        return;
      }
      if (gameEngine.bossManager.canPerformAction(actionId)) {
        // Quick check for funds before snapshotting
        const action = BOSS_ACTIONS.find(a => a.id === actionId);
        if (action && gameEngine.companyManager.funds >= action.cost) {
          gameEngine.snapshot();
        }
      }
      const result = gameEngine.bossManager.performAction(actionId);
      if (result) {
        if (result.cost) {
          gameEngine.companyManager.addFunds(-result.cost);
        }
        const msg = result.type === 'mood'
          ? t('home.bossMood', { change: result.change })
          : t('home.bossAbility', { change: result.change });
        eventBus.emit('toast', { type: 'success', message: msg });
        eventBus.emit('ui:refresh');
      }
    });
  });

  // Upgrade company
  const upgradeBtn = document.getElementById('btn-upgrade-company');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      gameEngine.snapshot();
      gameEngine.companyManager.upgrade();
      eventBus.emit('ui:refresh');
    });
  }
}
