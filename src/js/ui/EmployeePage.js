// ===== Employee Page =====
import gameEngine from '../engine/GameEngine.js';
import { renderNewsFeed } from './NewsFeed.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { TITLES, RECRUIT, INTERACTIONS, PROMOTION_COSTS, MONTHLY_RECRUIT_LIMIT } from '../data/config.js';
import { isPositiveTrait } from '../data/traits.js';
import { openChatPanel } from './ChatPanel.js';
import eventBus from '../eventBus.js';
import { t, tData, tCat } from '../utils/i18n.js';

export function renderEmployeePage() {
  const company = gameEngine.companyManager;
  const employees = gameEngine.employeeManager.employees;
  const avgEfficiency = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + gameEngine.employeeManager.getEfficiency(e), 0) / employees.length * 100)
    : 0;
  const avgMood = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.mood, 0) / employees.length)
    : 0;

  const limit = company.getEmployeeLimit();
  const canElite = company.level >= 2;
  const canHeadhunter = company.level >= 3;

  return `
    <div class="employee-page">
      <!-- Talent Acquisition -->
      <div class="card talent-acquisition">
        <div class="talent-acquisition__header">
          <div class="card__title" style="margin-bottom:0;">${t('emp.talentAcquisition')} <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);font-weight:400;">${t('emp.recruitUsed', { used: gameEngine.gameState.recruitsThisMonth, limit: MONTHLY_RECRUIT_LIMIT })}</span></div>
          <div class="talent-acquisition__budget">${t('emp.budget')}: ${formatMoney(company.funds)}</div>
        </div>

        <div class="recruit-types">
          <div class="recruit-type active" data-recruit="normal" id="recruit-normal">
            <i data-lucide="users" width="24" height="24"></i>
            ${t('emp.normalRecruit')} ($500)
          </div>
          <div class="recruit-type ${canElite ? '' : 'recruit-type--locked'}" data-recruit="elite" id="recruit-elite">
            <i data-lucide="star" width="24" height="24"></i>
            ${t('emp.eliteRecruit')} ($5k)
            ${!canElite ? `<span style="font-size:var(--font-size-xs);">${t('emp.locked')}</span>` : ''}
          </div>
          <div class="recruit-type ${canHeadhunter ? '' : 'recruit-type--locked'}" data-recruit="headhunter" id="recruit-headhunter">
            <i data-lucide="target" width="24" height="24"></i>
            ${t('emp.headhunterRecruit')} ($12k)
            ${!canHeadhunter ? `<span style="font-size:var(--font-size-xs);">${t('emp.locked')}</span>` : ''}
          </div>
        </div>

        <div class="recruit-action-row">
          <button class="btn btn--primary btn--lg" id="btn-post-job">${t('emp.postJob')}</button>
          <button class="btn btn--outline" id="btn-recruit-filter">
            <i data-lucide="sliders-horizontal" width="16" height="16"></i>
          </button>
        </div>

        <div id="recruit-results"></div>
      </div>

      <!-- Active Workforce -->
      <div class="workforce-section">
        <div class="workforce-section__header">
          <div class="workforce-section__title">${t('emp.workforce')}</div>
          <input type="text" class="workforce-section__search" placeholder="${t('emp.searchPlaceholder')}" id="employee-search" />
        </div>

        <div class="workforce-grid" id="workforce-grid">
          ${employees.length === 0 ? `
            <div class="empty-state" style="grid-column:1/-1;">
              <div class="empty-state__icon"><i data-lucide="user-x" width="48" height="48"></i></div>
              <div class="empty-state__text">暂无员工，请先进行招聘</div>
            </div>
          ` : employees.map(emp => renderEmployeeCard(emp)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderEmployeeCard(emp) {
  const titleConfig = TITLES[emp.title];
  const titleClass = emp.title === 'top' ? 'tag--top' : emp.title === 'senior' ? 'tag--senior' : emp.title === 'medium' ? 'tag--medium' : 'tag--junior';
  const efficiency = Math.round(gameEngine.employeeManager.getEfficiency(emp) * 100);

  const stressPct = Math.round(emp.stress / 120 * 100);
  const moodPct = Math.round(emp.mood);
  const abilityPct = Math.min(100, Math.round(emp.ability / 350 * 100));
  const salaryPct = Math.min(100, Math.round(emp.salary / 120000 * 100));

  const stressColor = stressPct > 75 ? 'danger' : stressPct > 50 ? 'warning' : 'success';
  const moodColor = moodPct < 30 ? 'danger' : moodPct < 60 ? 'warning' : 'info';

  const statuses = new Set();
  if (emp.forceResting) statuses.add(tData(INTERACTIONS.find(i=>i.id==='forceRest'), 'name'));
  if (gameEngine.gameState.interactionsThisMonth[`${emp.id}_rush`]) statuses.add(tData(INTERACTIONS.find(i=>i.id==='rush'), 'name'));
  if (gameEngine.gameState.interactionsThisMonth[`${emp.id}_overtime`]) statuses.add(tData(INTERACTIONS.find(i=>i.id==='overtime'), 'name'));
  const statusTagsHTML = Array.from(statuses).map(s => 
    `<span class="tag tag--warning" style="margin-left:4px; border: 1px solid currentColor; background: transparent;">${s}</span>`
  ).join('');

  return `
    <div class="employee-card" id="emp-card-${emp.id}">
      <div style="margin-bottom:var(--space-sm);">
        <span class="tag ${titleClass}">${tData(titleConfig, 'name').toUpperCase()}</span>
        ${emp.canPromote ? `<span class="promote-badge">⬆ ${t('emp.promote')}</span>` : ''}
        ${emp.assignedProjectId ? `<span class="tag tag--success" style="margin-left:4px;">${t('emp.assignMatch')}</span>` : ''}
        ${statusTagsHTML}
      </div>
      <div class="employee-card__header">
        <div class="avatar avatar--initials" style="background:${emp.avatarColor};">
          ${emp.firstName[0]}${emp.lastName[0]}
        </div>
        <div class="employee-card__info">
          <div class="employee-card__name">${emp.firstName} ${emp.lastName}</div>
          <div class="employee-card__role">${emp.functions.map(tCat).join(' / ')}</div>
        </div>
      </div>

      <div class="employee-card__stats">
        <div class="employee-card__stat-item">
          <div class="employee-card__stat-label">STRESS <span class="stat-value">${Math.round(emp.stress)}</span></div>
          <div class="progress"><div class="progress__fill progress__fill--${stressColor}" style="width:${stressPct}%"></div></div>
        </div>
        <div class="employee-card__stat-item">
          <div class="employee-card__stat-label">ABILITY <span class="stat-value">${emp.ability}</span></div>
          <div class="progress"><div class="progress__fill progress__fill--gradient" style="width:${abilityPct}%"></div></div>
        </div>
        <div class="employee-card__stat-item">
          <div class="employee-card__stat-label">MOOD <span class="stat-value">${Math.round(emp.mood)}</span></div>
          <div class="progress"><div class="progress__fill progress__fill--${moodColor}" style="width:${moodPct}%"></div></div>
        </div>
        <div class="employee-card__stat-item">
          <div class="employee-card__stat-label">SALARY <span class="stat-value">${formatMoney(emp.salary)}</span></div>
          <div class="progress"><div class="progress__fill progress__fill--warning" style="width:${salaryPct}%"></div></div>
        </div>
      </div>

      <div class="trait-tags">
        ${emp.traits.map(tr => {
          const positive = isPositiveTrait(tr);
          return `<span class="trait-tag trait-tag--${positive ? 'positive' : 'negative'}">${tData(tr, 'name')}</span>`;
        }).join('')}
      </div>

      <div class="employee-card__actions" style="margin-top:var(--space-md);">
        <button class="btn btn--danger btn--sm" data-fire="${emp.id}">${t('emp.fire')}</button>
        <button class="btn btn--outline btn--sm ${emp.canPromote ? '' : 'btn--disabled'}" data-promote="${emp.id}">${t('emp.promote')}</button>
        <button class="btn btn--outline btn--sm" data-interact="${emp.id}">${t('emp.interact')}</button>
        <button class="btn btn--primary btn--sm" data-assign-emp="${emp.id}">
          ${emp.assignedProjectId ? t('emp.reassign') : t('emp.assign')}
        </button>
        <button class="btn btn--outline btn--sm" data-chat="${emp.id}" style="color:var(--color-primary);">${t('emp.chat')}</button>
      </div>
    </div>
  `;
}

export function bindEmployeePageEvents() {
  let selectedRecruitType = 'normal';

  // Recruit type selection
  document.querySelectorAll('.recruit-type:not(.recruit-type--locked)').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.recruit-type').forEach(r => r.classList.remove('active'));
      el.classList.add('active');
      selectedRecruitType = el.dataset.recruit;
    });
  });

  // POST JOB OPENING
  const postBtn = document.getElementById('btn-post-job');
  if (postBtn) {
    postBtn.addEventListener('click', () => {
      const type = selectedRecruitType;
      const config = RECRUIT[type];

      // Check monthly limit
      if (gameEngine.gameState.recruitsThisMonth >= MONTHLY_RECRUIT_LIMIT) {
        eventBus.emit('toast', { type: 'error', message: t('emp.recruitLimit', { limit: MONTHLY_RECRUIT_LIMIT }) });
        return;
      }

      // Check cost
      if (gameEngine.companyManager.funds < config.cost) {
        eventBus.emit('toast', { type: 'error', message: t('emp.insufficientFunds', { cost: formatMoney(config.cost) }) });
        return;
      }

      // Check employee limit
      if (gameEngine.employeeManager.employees.length >= gameEngine.companyManager.getEmployeeLimit()) {
        eventBus.emit('toast', { type: 'error', message: t('equip.limitReached', { limit: gameEngine.companyManager.getEmployeeLimit() }) });
        return;
      }

      // Deduct cost for paid recruitment (Normal is free in March and September)
      const isFreeMonth = type === 'normal' && (gameEngine.gameState.month === 3 || gameEngine.gameState.month === 9);
      if (config.cost && !isFreeMonth) {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-config.cost);
      }

      // Increment monthly recruit count
      gameEngine.gameState.recruitsThisMonth++;
      eventBus.emit('ui:refresh');

      const candidates = gameEngine.performRecruitment(type);
      renderCandidates(candidates);
    });
  }

  // Fire buttons
  document.querySelectorAll('[data-fire]').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = btn.dataset.fire;
      const emp = gameEngine.employeeManager.getEmployee(empId);
      if (!emp) return;

      showModal({
        title: t('emp.fire'),
        content: `<p>${t('emp.confirmFire', { name: `<strong>${emp.firstName} ${emp.lastName}</strong>`, cost: formatMoney(emp.salary) })}</p>`,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('emp.cancel')}</button>
                 <button class="btn btn--danger" id="modal-confirm-fire">${t('emp.fire')}</button>`,
      });

      document.getElementById('modal-confirm-fire')?.addEventListener('click', () => {
        // Cancel from project if assigned
        if (emp.assignedProjectId) {
          gameEngine.projectManager.unassignEmployee(emp.assignedProjectId, empId);
        }
        gameEngine.snapshot();
        gameEngine.employeeManager.fireEmployee(empId);
        gameEngine.companyManager.addFunds(-emp.salary);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'info', message: t('emp.fireSuccess', { name: emp.firstName }) });
        eventBus.emit('ui:refresh');
      });

      document.getElementById('modal-cancel')?.addEventListener('click', () => {
        closeModal(document.querySelector('.modal-overlay'));
      });
    });
  });

  // Promote buttons
  document.querySelectorAll('[data-promote]').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = btn.dataset.promote;
      const emp = gameEngine.employeeManager.getEmployee(empId);
      if (!emp || !emp.canPromote) return;

      const cost = PROMOTION_COSTS[emp.title];
      if (gameEngine.companyManager.funds < cost) {
        eventBus.emit('toast', { type: 'error', message: t('emp.insufficientFunds', { cost: formatMoney(cost) }) });
        return;
      }

      showModal({
        title: t('emp.promote'),
        content: `<p>将 <strong>${emp.firstName} ${emp.lastName}</strong> 晋升为 ${tData(TITLES[TITLES[emp.title].nextTitle], 'name')}？</p>
                  <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-top:var(--space-md);">
                    晋升费用: ${formatMoney(cost)}<br>
                    薪资将重新随机生成，职能+1，特性可能变化
                  </p>`,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('emp.cancel')}</button>
                 <button class="btn btn--primary" id="modal-confirm-promote">${t('emp.promote')}</button>`,
      });

      document.getElementById('modal-confirm-promote')?.addEventListener('click', () => {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-cost);
        gameEngine.employeeManager.promoteEmployee(empId);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: t('emp.promoteSuccess', { name: emp.firstName, ability: gameEngine.employeeManager.getEmployee(empId).ability }) });
        eventBus.emit('ui:refresh');
      });

      document.getElementById('modal-cancel')?.addEventListener('click', () => {
        closeModal(document.querySelector('.modal-overlay'));
      });
    });
  });

  // Interact buttons
  document.querySelectorAll('[data-interact]').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = btn.dataset.interact;
      showInteractModal(empId);
    });
  });

  // Assign buttons
  document.querySelectorAll('[data-assign-emp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = btn.dataset.assignEmp;
      showAssignModal(empId);
    });
  });

  // Chat buttons
  document.querySelectorAll('[data-chat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = btn.dataset.chat;
      openChatPanel(empId);
    });
  });

  // Search
  const searchInput = document.getElementById('employee-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.employee-card').forEach(card => {
        const name = card.querySelector('.employee-card__name')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(query) ? '' : 'none';
      });
    });
  }
}

function renderCandidates(candidates) {
  const container = document.getElementById('recruit-results');
  if (!container || !candidates) return;

  container.innerHTML = `
    <div class="recruit-results">
      ${candidates.map(c => {
        const titleConfig = TITLES[c.title];
        const titleClass = c.title === 'senior' ? 'tag--senior' : c.title === 'medium' ? 'tag--medium' : 'tag--junior';
        return `
        <div class="recruit-candidate" id="candidate-${c.id}">
          <div class="recruit-candidate__header">
            <div class="avatar avatar--initials" style="background:${c.avatarColor};">
              ${c.firstName[0]}${c.lastName[0]}
            </div>
            <div>
              <div class="recruit-candidate__name">${c.firstName} ${c.lastName}</div>
              <span class="tag ${titleClass}" style="margin-top:2px;">${tData(titleConfig, 'name')}</span>
              <div class="recruit-candidate__title">${c.functions.map(tCat).join(' / ')}</div>
            </div>
            <div class="recruit-candidate__ability">
              <div class="recruit-candidate__ability-label">Ability</div>
              <div class="recruit-candidate__ability-value">${c.ability}</div>
            </div>
          </div>
          <div class="recruit-candidate__detail">
            <div class="recruit-candidate__detail-label">Function: ${c.functions.map(tCat).join(' / ')}</div>
            <div class="progress" style="margin-top:4px;"><div class="progress__fill progress__fill--gradient" style="width:${Math.min(100,c.ability/220*100)}%"></div></div>
          </div>
          <div class="recruit-candidate__detail">
            <div class="recruit-candidate__detail-label" style="color:var(--color-warning);">Salary: ${formatMoney(c.salary)} / month</div>
            <div class="progress" style="margin-top:4px;"><div class="progress__fill progress__fill--warning" style="width:${Math.min(100,c.salary/40000*100)}%"></div></div>
          </div>
          <div class="trait-tags" style="margin-top:var(--space-sm);">
            ${c.traits.map(tr => {
              const positive = isPositiveTrait(tr);
              return `<span class="trait-tag trait-tag--${positive ? 'positive' : 'negative'}">${tData(tr, 'name')}</span>`;
            }).join('')}
          </div>
          <button class="btn btn--primary btn--full" style="margin-top:var(--space-md);" data-hire='${JSON.stringify(c)}'>
            Hire
          </button>
        </div>`;
      }).join('')}
    </div>
  `;

  // Bind hire buttons
  container.querySelectorAll('[data-hire]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameEngine.employeeManager.employees.length >= gameEngine.companyManager.getEmployeeLimit()) {
        eventBus.emit('toast', { type: 'error', message: t('equip.limitReached', { limit: gameEngine.companyManager.getEmployeeLimit() }) });
        return;
      }
      const empData = JSON.parse(btn.dataset.hire);
      gameEngine.snapshot();
      gameEngine.employeeManager.hireEmployee(empData);
      btn.disabled = true;
      btn.textContent = 'Hired ✓';
      btn.classList.remove('btn--primary');
      btn.classList.add('btn--secondary');
      eventBus.emit('ui:refresh');
    });
  });

  if (window.lucide) lucide.createIcons();
}

function showInteractModal(empId) {
  const emp = gameEngine.employeeManager.getEmployee(empId);
  if (!emp) return;

  const content = `
    <div style="margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-md);">
      <div class="avatar avatar--initials avatar--lg" style="background:${emp.avatarColor};">
        ${emp.firstName[0]}${emp.lastName[0]}
      </div>
      <div>
        <div style="font-weight:600;font-size:var(--font-size-lg);">${emp.firstName} ${emp.lastName}</div>
        <div style="font-size:var(--font-size-sm);color:var(--color-text-muted);">心情: ${Math.round(emp.mood)} | 压力: ${Math.round(emp.stress)} | 能力: ${emp.ability}</div>
      </div>
    </div>
    <div class="interact-options">
      ${INTERACTIONS.map(inter => {
        const monthKey = `${empId}_${inter.id}`;
        const used = gameEngine.gameState.interactionsThisMonth[monthKey];
        const cooling = inter.cooldown > 0 && emp.interactionCooldowns[inter.id] > 0;
        const needsProject = inter.requiresProject && !emp.assignedProjectId;
        const disabled = used || cooling || needsProject;

        return `
        <div class="interact-option ${disabled ? 'interact-option--disabled' : ''}" data-interaction="${inter.id}" data-emp="${empId}">
          <div class="interact-option__info">
            <div class="interact-option__name">${tData(inter, 'name')}</div>
            <div class="interact-option__effect">${tData(inter, 'effects').replace(/\n/g, ' | ')}</div>
            ${disabled ? `<div style="font-size:var(--font-size-xs);color:var(--color-danger);margin-top:2px;">
              ${used ? t('emp.usedThisMonth') : cooling ? t('emp.cooling') : t('emp.needsProject')}
            </div>` : ''}
          </div>
          ${inter.cost > 0 ? `<div class="interact-option__cost">${formatMoney(inter.cost)}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;

  const modal = showModal({ title: t('emp.interaction'), content });

  modal.querySelectorAll('.interact-option:not(.interact-option--disabled)').forEach(el => {
    el.addEventListener('click', () => {
      const interactionId = el.dataset.interaction;
      const interaction = INTERACTIONS.find(i => i.id === interactionId);

      // Check cost
      if (interaction.cost > 0 && gameEngine.companyManager.funds < interaction.cost) {
        eventBus.emit('toast', { type: 'error', message: t('emp.insufficientFunds', { cost: formatMoney(interaction.cost) }) });
        return;
      }

      if (interaction.cost > 0) {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-interaction.cost);
      } else if (interaction.cost === 0) {
        gameEngine.snapshot();
      }
      
      const result = gameEngine.performInteraction(empId, interactionId);
      if (result && result.success) {
        closeModal(modal);
        eventBus.emit('toast', { type: 'success', message: `${tData(interaction, 'name')} 完成！` });
        eventBus.emit('ui:refresh');
      } else if (result) {
        eventBus.emit('toast', { type: 'warning', message: result.reason });
      }
    });
  });
}

function showAssignModal(empId) {
  const emp = gameEngine.employeeManager.getEmployee(empId);
  if (!emp) return;

  const projects = gameEngine.projectManager.activeProjects;
  if (projects.length === 0) {
    eventBus.emit('toast', { type: 'warning', message: t('emp.noProjects') });
    return;
  }

  showModal({
    title: t('emp.assignTitle', { name: `${emp.firstName} ${emp.lastName}` }),
    content: `
      <div style="padding:var(--space-md);">
        <p style="margin-bottom:var(--space-md);color:var(--color-text-secondary);">${t('emp.assignSelect')}</p>
        <div class="assign-project-list" style="display:flex;flex-direction:column;gap:var(--space-sm);">
          ${projects.map(p => {
            const isMatch = emp.functions.includes(p.category);
            return `
              <div class="assign-project-item ${isMatch ? 'assign-project-item--match' : ''}" 
                   style="border:1px solid var(--color-border);padding:var(--space-md);border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;"
                   data-assign-project-id="${p.id}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-weight:600;">${p.name}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${p.rarity} | ${tCat(p.category)}</div>
                  </div>
                  ${isMatch ? `<span class="tag tag--success">${t('emp.assignMatch')}</span>` : `<span class="tag">${t('emp.assignCross')}</span>`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `,
    footer: `<button class="btn btn--secondary" id="modal-cancel">${t('emp.cancel')}</button>`,
  });

  document.querySelectorAll('[data-assign-project-id]').forEach(item => {
    item.addEventListener('mouseover', () => {
      item.style.borderColor = 'var(--color-primary)';
      item.style.backgroundColor = 'var(--color-bg-alt)';
    });
    item.addEventListener('mouseout', () => {
      item.style.borderColor = 'var(--color-border)';
      item.style.backgroundColor = 'transparent';
    });
    item.addEventListener('click', () => {
      const projectId = item.dataset.assignProjectId;
      const project = gameEngine.projectManager.getProjectById(projectId);
      
      gameEngine.snapshot();

      // Unassign from old project if exists
      if (emp.assignedProjectId) {
        gameEngine.projectManager.unassignEmployee(emp.assignedProjectId, emp.id);
      }

      const success = gameEngine.projectManager.assignEmployee(projectId, empId);
      if (success) {
        emp.assignedProjectId = projectId;
        eventBus.emit('toast', { type: 'success', message: t('emp.assignSuccess', { emp: emp.firstName, project: project.name }) });
        eventBus.emit('ui:refresh');
        closeModal(document.querySelector('.modal-overlay'));
      }
    });
  });

  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    closeModal(document.querySelector('.modal-overlay'));
  });
}
