// ===== Home Page =====
import gameEngine from '../engine/GameEngine.js';
import { renderNewsFeed } from './NewsFeed.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { BOSS_ACTIONS } from '../data/config.js';
import eventBus from '../eventBus.js';

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
              <div class="card__title" style="margin-bottom:0;">Company System</div>
            </div>
            <div class="company-system__level-badge">
              <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">LV.</div>
              <div style="font-size:var(--font-size-lg);font-weight:700;">${company.level}</div>
            </div>
          </div>
          <div class="company-system__exp">
            <span>Experience</span>
            <span>${company.exp}/${nextLevelExp || 'MAX'}</span>
          </div>
          <div class="progress">
            <div class="progress__fill progress__fill--gradient" style="width:${expPct}%"></div>
          </div>
          ${company.canUpgrade() ? `
            <button class="btn btn--primary btn--full" style="margin-top:var(--space-md);" id="btn-upgrade-company">
              升级公司 (${formatMoney(company.getNextLevelConfig().upgradeCost)})
            </button>
          ` : ''}
          <div class="company-system__funds">
            <span>Available Funds</span>
            <span class="company-system__funds-value">${formatMoney(company.funds)}</span>
          </div>
          <div class="company-system__cost">
            <span>Monthly Cost</span>
            <span>${formatMoney(-monthlyExpense)}</span>
          </div>
        </div>

        <!-- Boss Actions Card -->
        <div class="card boss-actions">
          <div class="card__title">Boss Actions</div>
          <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-md);font-size:var(--font-size-sm);">
            <span>心情: <strong>${boss.mood}</strong></span>
            <span>能力: <strong>${boss.ability}</strong></span>
          </div>
          <div class="action-grid">
            ${BOSS_ACTIONS.map(action => {
              const canDo = boss.canPerformAction(action.id);
              return `
              <div class="action-grid__item ${canDo ? '' : 'action-grid__item--disabled'}"
                   data-boss-action="${action.id}" id="boss-action-${action.id}">
                <i data-lucide="${action.icon}" width="22" height="22"></i>
                ${action.name}
                ${action.cost > 0 ? `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">$${action.cost.toLocaleString()}</span>` : ''}
              </div>`;
            }).join('')}
            <div class="action-grid__item" data-boss-action="declare" id="boss-action-declare">
              <i data-lucide="megaphone" width="22" height="22"></i>
              宣言
            </div>
            <div class="action-grid__item" data-boss-action="schedule" id="boss-action-schedule">
              <i data-lucide="calendar" width="22" height="22"></i>
              排程
            </div>
          </div>
        </div>

        <!-- Date display -->
        <div class="home-date">
          <i data-lucide="calendar-days" width="16" height="16"></i>
          第${year}年 ${month}月
        </div>
      </div>

      <div class="home-page__center">
        <!-- Company Banner -->
        <div class="company-banner">
          <div class="company-banner__name">${company.name}</div>
        </div>

        <!-- Overview section -->
        <div class="card home-overview">
          <div class="home-overview__badge">OVERVIEW</div>
          <h2 class="home-overview__title">Simulating Excellence in Management</h2>
          <p class="home-overview__desc">
            ${company.name} is a leading enterprise in specialized management solutions, dedicated to the optimization of
            corporate ecosystems. Our approach combines data-driven strategy with a focus on sustainable growth.
          </p>
          <div class="home-overview__stats">
            <div class="stat">
              <div class="stat__value">${projects.length}</div>
              <div class="stat__label">PROJECTS</div>
            </div>
            <div class="stat">
              <div class="stat__value">${employees.length}</div>
              <div class="stat__label">STAFF</div>
            </div>
            <div class="stat">
              <div class="stat__value">${avgEfficiency}%</div>
              <div class="stat__label">EFFICIENCY</div>
            </div>
          </div>
        </div>

        <!-- Feature cards -->
        <div class="home-features">
          <div class="feature-card feature-card--purple">
            <div class="feature-card__icon"><i data-lucide="trending-up" width="24" height="24"></i></div>
            <div class="feature-card__title">Growth Index</div>
            <div class="feature-card__desc">Total revenue: ${formatMoney(company.totalRevenue)}</div>
          </div>
          <div class="card" style="display:flex;flex-direction:column;justify-content:center;">
            <div style="margin-bottom:var(--space-xs);"><i data-lucide="monitor" width="20" height="20" style="color:var(--color-text-muted);"></i></div>
            <div class="feature-card__title" style="color:var(--color-text-primary);">Uptime</div>
            <div class="feature-card__desc" style="color:var(--color-text-secondary);">All operations running within standard parameters.</div>
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
        eventBus.emit('toast', { type: 'info', message: '功能开发中...' });
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
          ? `老板心情 +${result.change}`
          : `老板能力 +${result.change}`;
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
