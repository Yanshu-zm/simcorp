// ===== Main Entry Point =====
import '../css/variables.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/modal.css';
import '../css/home.css';
import '../css/employee.css';
import '../css/project.css';
import '../css/equipment.css';
import '../css/chat.css';

import gameEngine from './engine/GameEngine.js';
import router from './router.js';
import eventBus from './eventBus.js';
import { hasSave } from './utils/storage.js';
import { formatMoney, formatMonthCN } from './utils/format.js';

import { renderTopbar, bindTopbarEvents } from './ui/Topbar.js';
import { renderSidebar, bindSidebarEvents } from './ui/Sidebar.js';
import { renderNewsFeed } from './ui/NewsFeed.js';
import { renderHomePage, bindHomePageEvents } from './ui/HomePage.js';
import { renderEmployeePage, bindEmployeePageEvents } from './ui/EmployeePage.js';
import { renderProjectPage, bindProjectPageEvents } from './ui/ProjectPage.js';
import { renderEquipmentPage, bindEquipmentPageEvents } from './ui/EquipmentPage.js';
import { showModal, closeModal } from './ui/Modal.js';
import './ui/AISettings.js'; // registers ai:openSettings listener
import { injectChatEvent } from './ui/ChatPanel.js';
import chatManager from './ai/ChatManager.js';

const app = document.getElementById('app');

// ===== Start Screen =====
function showStartScreen() {
  let currentTalent = gameEngine.rollTalent();
  const hasExistingSave = hasSave();

  function renderStart() {
    app.innerHTML = `
      <div class="start-screen">
        <div class="start-screen__content">
          <div class="start-screen__logo">SimCorp</div>
          <div class="start-screen__subtitle">规划老总模拟器</div>

          <div class="start-screen__input-group">
            <label class="start-screen__label">公司名称</label>
            <input type="text" class="start-screen__input" id="company-name-input" 
                   placeholder="输入你的公司名称" value="SimCorp" maxlength="20" />
          </div>

          <div class="start-screen__talent">
            <div class="start-screen__talent-title">你的天赋</div>
            <div class="start-screen__talent-name">${currentTalent.icon} ${currentTalent.name}</div>
            <div class="start-screen__talent-desc">${currentTalent.desc}</div>
            <button class="start-screen__talent-reroll" id="btn-reroll">🎲 重新抽取</button>
          </div>

          <div class="start-screen__actions">
            <button class="start-screen__btn-start" id="btn-start">开始游戏</button>
            ${hasExistingSave ? '<button class="start-screen__btn-load" id="btn-load">继续存档</button>' : ''}
          </div>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('btn-reroll')?.addEventListener('click', () => {
      currentTalent = gameEngine.rollTalent();
      renderStart();
    });

    document.getElementById('btn-start')?.addEventListener('click', () => {
      const name = document.getElementById('company-name-input')?.value.trim() || 'SimCorp';
      gameEngine.startNewGame(name, currentTalent);
      showGameLayout();
    });

    document.getElementById('btn-load')?.addEventListener('click', () => {
      if (gameEngine.loadSavedGame()) {
        showGameLayout();
      }
    });
  }

  renderStart();
}

// ===== Game Layout =====
function showGameLayout() {
  app.innerHTML = `
    ${renderTopbar()}
    ${renderSidebar()}
    <main class="main-content">
      <div class="main-content__center" id="page-content"></div>
      <div class="main-content__right" id="right-panel"></div>
    </main>
    <button class="fab-next-month" id="btn-next-month">
      <i data-lucide="arrow-right-circle" width="20" height="20"></i>
      下一月
      <span class="fab-next-month__month" id="fab-month-display"></span>
    </button>
  `;

  // Init icons
  if (window.lucide) lucide.createIcons();

  // Bind global UI
  bindTopbarEvents();
  bindSidebarEvents();

  // FAB next month
  const nextBtn = document.getElementById('btn-next-month');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      gameEngine.snapshot();
      performNextMonth();
    });
  }

  // Register routes
  router.register('home', () => renderPage('home'));
  router.register('employee', () => renderPage('employee'));
  router.register('project', () => renderPage('project'));
  router.register('equipment', () => renderPage('equipment'));

  // Listen for refresh
  eventBus.on('ui:refresh', () => {
    renderPage(router.getCurrentPage());
  });

  // Navigate to home
  router.init();
  if (!window.location.hash) {
    router.navigate('home');
  }

  updateFabDisplay();
}

function renderPage(page) {
  const content = document.getElementById('page-content');
  const rightPanel = document.getElementById('right-panel');

  if (!content || !rightPanel) return;

  switch (page) {
    case 'home':
      content.innerHTML = renderHomePage();
      bindHomePageEvents();
      break;
    case 'employee':
      content.innerHTML = renderEmployeePage();
      bindEmployeePageEvents();
      break;
    case 'project':
      content.innerHTML = renderProjectPage();
      bindProjectPageEvents();
      break;
    case 'equipment':
      content.innerHTML = renderEquipmentPage();
      bindEquipmentPageEvents();
      break;
  }

  // Right panel news feed
  rightPanel.innerHTML = renderNewsFeed(page);

  // Update nav active states
  document.querySelectorAll('.topbar__nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Re-render sidebar to update stats
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.outerHTML = renderSidebar();
    bindSidebarEvents();
  }

  updateFabDisplay();

  // Re-init icons
  if (window.lucide) lucide.createIcons();
}

function updateFabDisplay() {
  const display = document.getElementById('fab-month-display');
  if (display) {
    display.textContent = formatMonthCN(gameEngine.gameState.month, gameEngine.gameState.year);
  }
}

function performNextMonth() {
  const settlement = gameEngine.nextMonth();
  if (!settlement) return;

  // Show settlement modal
  let settlementHTML = '<div style="max-height:400px;overflow-y:auto;">';

  // Random event (Moved to TOP for visibility)
  if (settlement.randomEvent) {
    const evt = settlement.randomEvent;
    settlementHTML += `<div class="event-card" style="padding:var(--space-lg); margin-bottom:var(--space-lg); border: 2px solid var(--color-primary);">
      <div class="event-card__icon event-card__icon--${evt.event.type === 'positive' ? 'positive' : evt.event.type === 'negative' ? 'negative' : 'neutral'}">
        ${evt.event.type === 'positive' ? '🎉' : evt.event.type === 'negative' ? '⚠️' : '📋'}
      </div>
      <div class="event-card__title">【突发事件】${evt.event.name}</div>
      <div class="event-card__desc">${evt.event.desc}</div>
      <div style="margin-top:var(--space-md);font-weight:600;color:var(--color-primary);">${evt.resultMessage}</div>
    </div>`;
  }

  // Project progress
  if (settlement.projectResults.length > 0) {
    settlementHTML += '<h4 style="margin-bottom:var(--space-md);font-size:var(--font-size-base);">📋 项目进展</h4>';
    settlement.projectResults.forEach(r => {
      if (r.completed) {
        settlementHTML += `<div class="settlement-item">
          <span class="settlement-item__label">✅ ${r.project.name} 完成！</span>
          <span class="settlement-item__value settlement-item__value--positive">+${formatMoney(r.reward)}</span>
        </div>`;
      } else {
        settlementHTML += `<div class="settlement-item">
          <span class="settlement-item__label">${r.project.name}</span>
          <span class="settlement-item__value">${Math.round(r.progressPct || 0)}%</span>
        </div>`;
        if (r.penalty > 0) {
          settlementHTML += `<div class="settlement-item">
            <span class="settlement-item__label" style="color:var(--color-danger);">  ⚠ 超时罚款</span>
            <span class="settlement-item__value settlement-item__value--negative">-${formatMoney(r.penalty)}</span>
          </div>`;
        }
      }
    });
  }

  // Financials
  settlementHTML += '<div class="divider"></div>';
  settlementHTML += '<h4 style="margin-bottom:var(--space-md);font-size:var(--font-size-base);">💰 财务结算</h4>';
  settlementHTML += `<div class="settlement-item">
    <span class="settlement-item__label">员工薪资</span>
    <span class="settlement-item__value settlement-item__value--negative">-${formatMoney(settlement.salaryTotal)}</span>
  </div>`;
  if (settlement.maintenanceCost > 0) {
    settlementHTML += `<div class="settlement-item">
      <span class="settlement-item__label">设备维护</span>
      <span class="settlement-item__value settlement-item__value--negative">-${formatMoney(settlement.maintenanceCost)}</span>
    </div>`;
  }
  settlementHTML += `<div class="settlement-item" style="font-weight:700;border-top:2px solid var(--color-border);padding-top:var(--space-md);">
    <span>当前资金</span>
    <span style="color:${gameEngine.companyManager.funds >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${formatMoney(gameEngine.companyManager.funds)}</span>
  </div>`;

  // Broken equipment
  if (settlement.brokenEquipment.length > 0) {
    settlementHTML += '<div class="divider"></div>';
    settlementHTML += '<h4 style="margin-bottom:var(--space-md);font-size:var(--font-size-base);">🔧 设备状态</h4>';
    settlement.brokenEquipment.forEach(item => {
      settlementHTML += `<div class="settlement-item">
        <span class="settlement-item__label" style="color:var(--color-danger);">⚠ ${item.name} 已损坏</span>
        <span class="settlement-item__value">需维修</span>
      </div>`;
    });
  }

  // Resigned employees
  if (settlement.resignedEmployees.length > 0) {
    settlementHTML += '<div class="divider"></div>';
    settlementHTML += '<h4 style="margin-bottom:var(--space-md);font-size:var(--font-size-base);">👋 员工变动</h4>';
    settlement.resignedEmployees.forEach(emp => {
      settlementHTML += `<div class="settlement-item">
        <span class="settlement-item__label" style="color:var(--color-danger);">${emp.firstName} ${emp.lastName} 已离职</span>
        <span class="settlement-item__value settlement-item__value--negative">补偿 -${formatMoney(emp.salary)}</span>
      </div>`;
    });
  }

  settlementHTML += '</div>';

  // Game Over
  if (settlement.gameOver) {
    settlementHTML += `<div style="text-align:center;padding:var(--space-2xl);background:var(--color-danger-light);border-radius:var(--radius-lg);margin-top:var(--space-xl);">
      <div style="font-size:2rem;margin-bottom:var(--space-md);">💀</div>
      <div style="font-size:var(--font-size-xl);font-weight:700;color:var(--color-danger);">游戏结束</div>
      <div style="color:var(--color-text-secondary);margin-top:var(--space-sm);">公司资产为负，所有员工已离职。</div>
    </div>`;
  }

  // Win
  if (settlement.won) {
    const winMsg = gameEngine.gameState.winType === 'funds' ? '资金达到 $10,000,000！' : '完成了顶级项目！';
    settlementHTML += `<div style="text-align:center;padding:var(--space-2xl);background:var(--color-success-light);border-radius:var(--radius-lg);margin-top:var(--space-xl);">
      <div style="font-size:2rem;margin-bottom:var(--space-md);">🏆</div>
      <div style="font-size:var(--font-size-xl);font-weight:700;color:var(--color-success);">胜利！</div>
      <div style="color:var(--color-text-secondary);margin-top:var(--space-sm);">${winMsg}</div>
      <button class="btn btn--primary" style="margin-top:var(--space-lg);" id="btn-infinite-mode">继续无限模式</button>
    </div>`;
  }

  const monthLabel = formatMonthCN(gameEngine.gameState.month, gameEngine.gameState.year);

  const modal = showModal({
    title: `📊 ${monthLabel} 月报`,
    content: settlementHTML,
    className: 'settlement-modal',
    footer: settlement.gameOver
      ? '<button class="btn btn--primary" id="modal-restart">重新开始</button>'
      : '<button class="btn btn--primary" id="modal-ok">确认</button>',
  });

  modal.querySelector('#modal-ok')?.addEventListener('click', () => {
    closeModal(modal);
    renderPage(router.getCurrentPage());
  });

  modal.querySelector('#modal-restart')?.addEventListener('click', () => {
    closeModal(modal);
    showStartScreen();
  });

  modal.querySelector('#btn-infinite-mode')?.addEventListener('click', () => {
    gameEngine.gameState.infiniteMode = true;
    closeModal(modal);
    renderPage(router.getCurrentPage());
  });
}

// ===== Game Over / Win Events =====
eventBus.on('game:over', () => {
  // Handled in nextMonth settlement
});

eventBus.on('game:won', () => {
  // Handled in nextMonth settlement
});

// ===== Chat Event Injection =====
eventBus.on('employee:hired', (emp) => {
  injectChatEvent(emp.id, `你刚被 ${gameEngine.companyManager.name} 公司录用了！`);
});

eventBus.on('boss:actionPerformed', ({ actionId, result }) => {
  // Inject into all working employees
  const actionNames = { entertainment: '娱乐放松', training: '进修学习' };
  const name = actionNames[actionId] || actionId;
  gameEngine.employeeManager.employees.forEach(emp => {
    injectChatEvent(emp.id, `老板刚进行了「${name}」活动`);
  });
});

eventBus.on('project:accepted', (project) => {
  gameEngine.employeeManager.employees.forEach(emp => {
    injectChatEvent(emp.id, `公司承接了新项目: ${project.name}（${project.rarity}级）`);
  });
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  showStartScreen();
});

// Also handle immediate case (Vite hot reload)
if (document.readyState !== 'loading') {
  showStartScreen();
}
