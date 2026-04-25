// ===== Project Page =====
import gameEngine from '../engine/GameEngine.js';
import { formatMoney, formatProgress } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { PROJECT_RARITIES } from '../data/config.js';
import eventBus from '../eventBus.js';

export function renderProjectPage() {
  const company = gameEngine.companyManager;
  const projects = gameEngine.projectManager;
  const employees = gameEngine.employeeManager.employees;
  const monthlyExpense = company.getMonthlyExpense(employees, gameEngine.equipmentManager.ownedEquipment);

  // Active bonuses from talent & equipment
  const talent = gameEngine.gameState.talent;
  const equipBuffs = gameEngine.equipmentManager.getActiveBuffs();

  return `
    <div class="project-page">
      <!-- Project Market -->
      <div class="card project-market">
        <div class="project-market__header">
          <div class="card__title" style="margin-bottom:0;">Project Market</div>
          <div class="project-market__refresh" style="cursor:default;">
            <i data-lucide="refresh-cw" width="14" height="14"></i>
            每月自动刷新
          </div>
        </div>
        <div class="project-market__list">
          ${projects.marketProjects.length === 0 ? `
            <div class="empty-state"><div class="empty-state__text">本月已无可投标项目</div></div>
          ` : projects.marketProjects.map(p => {
            const config = PROJECT_RARITIES[p.rarity];
            const rarityClass = `tag--${p.rarity.toLowerCase() === '顶级' ? 'top' : p.rarity.toLowerCase()}`;
            return `
            <div class="market-project" id="market-project-${p.id}">
              <div class="market-project__icon">
                <i data-lucide="${p.category === '建筑' ? 'building' : p.category === '规划' ? 'map' : 'trees'}" width="24" height="24" style="color:var(--color-text-muted);"></i>
              </div>
              <div class="market-project__info">
                <div class="market-project__name">${p.name}</div>
                <div class="market-project__meta">
                  <span>${p.category}</span>
                  <span class="tag ${rarityClass}">${p.rarity}</span>
                  <span>需求能力 ≥${p.bidRequirement}</span>
                  <span>限${p.maxAllowedMonths}个月</span>
                </div>
              </div>
              <div class="market-project__reward">${formatMoney(p.reward)}</div>
              <div class="market-project__actions">
                <button class="btn btn--primary" data-accept-project="${p.id}">Accept</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Active Projects -->
      <div class="card active-projects">
        <div class="active-projects__header">
          <i data-lucide="briefcase" width="20" height="20" style="color:var(--color-text-muted);"></i>
          <div class="card__title" style="margin-bottom:0;margin-left:var(--space-sm);">Active Projects</div>
        </div>
        <div class="active-projects__list">
          ${projects.activeProjects.length === 0 ? `
            <div class="empty-state"><div class="empty-state__text">暂无进行中的项目</div></div>
          ` : projects.activeProjects.map(p => {
            const pct = Math.min(100, Math.round((p.currentProgress / p.hiddenTotalProgress) * 100));
            const isOverdue = p.monthsElapsed > p.maxAllowedMonths;
            const assignedEmps = p.assignedEmployees.map(id => gameEngine.employeeManager.getEmployee(id)).filter(Boolean);
            const leadName = assignedEmps.length > 0 ? `${assignedEmps[0].firstName}` : '未分配';
            const othersCount = Math.max(0, assignedEmps.length - 1);

            return `
            <div class="active-project">
              <div class="active-project__header">
                <div>
                  <div class="active-project__name">${p.name}</div>
                  <span class="tag tag--${p.rarity.toLowerCase() === '顶级' ? 'top' : p.rarity.toLowerCase()}" style="margin-top:2px;">${p.rarity}</span>
                  <span class="tag" style="margin-left:4px;">${p.category}</span>
                  ${isOverdue ? '<span class="tag tag--danger" style="margin-left:4px;">超时</span>' : ''}
                </div>
                <div class="active-project__eta">
                  <div>已进行 ${p.monthsElapsed}/${p.maxAllowedMonths} 月</div>
                </div>
              </div>
              <div class="active-project__team">
                Lead: ${leadName}${othersCount > 0 ? ` + ${othersCount} Specialists` : ''}
              </div>
              <div class="active-project__progress-row">
                <div class="active-project__progress-bar">
                  <div class="progress progress--lg">
                    <div class="progress__fill progress__fill--gradient" style="width:${pct}%"></div>
                  </div>
                </div>
                <div class="active-project__progress-pct">${pct}%</div>
              </div>
              <div class="active-project__reward-info">
                Completion Reward: ${formatMoney(p.reward)} | Exp: +${p.experience}
              </div>
              <button class="btn btn--outline btn--sm active-project__manage-btn" data-manage-project="${p.id}">
                管理团队
              </button>
            </div>`;
          }).join('')}

          <div class="assign-new-project" id="btn-assign-new">
            <i data-lucide="plus-circle" width="24" height="24"></i>
            <div class="assign-new-project__text">ASSIGN NEW PROJECT</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindProjectPageEvents() {
  // Accept project (bid)
  document.querySelectorAll('[data-accept-project]').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.acceptProject;
      showBidModal(projectId);
    });
  });

  // Manage project team
  document.querySelectorAll('[data-manage-project]').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.manageProject;
      showAssignModal(projectId);
    });
  });

  // Assign new 
  const assignNewBtn = document.getElementById('btn-assign-new');
  if (assignNewBtn) {
    assignNewBtn.addEventListener('click', () => {
      eventBus.emit('toast', { type: 'info', message: '请先从 Project Market 承接项目' });
    });
  }
}

function showBidModal(projectId) {
  const project = gameEngine.projectManager.marketProjects.find(p => p.id === projectId);
  if (!project) return;

  const availableEmployees = gameEngine.employeeManager.employees.filter(e => !e.assignedProjectId);

  const content = `
    <div class="bid-project">
      <div class="bid-project__name">${project.name}
        <span class="tag tag--${project.rarity.toLowerCase() === '顶级' ? 'top' : project.rarity.toLowerCase()}" style="margin-left:var(--space-sm);">${project.rarity}</span>
      </div>
      <div class="bid-project__req">类别: ${project.category} | 招标要求: 能力 ≥ ${project.bidRequirement} | 回报: ${formatMoney(project.reward)}</div>
    </div>
    <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-bottom:var(--space-lg);">
      请选择一名员工参与招标（员工能力需 ≥ ${project.bidRequirement}）：
    </p>
    <div class="bid-employee-select">
      ${availableEmployees.length === 0 ? '<div class="empty-state"><div class="empty-state__text">没有可用的员工</div></div>' : ''}
      ${availableEmployees.map(emp => `
        <div class="bid-employee-option" data-bid-emp="${emp.id}">
          <div class="avatar avatar--initials avatar--sm" style="background:${emp.avatarColor};">${emp.firstName[0]}${emp.lastName[0]}</div>
          <div style="flex:1;">
            <div style="font-weight:500;">${emp.firstName} ${emp.lastName}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${emp.functions.join('/')}</div>
          </div>
          <div style="font-weight:600;${emp.ability >= project.bidRequirement ? 'color:var(--color-success);' : 'color:var(--color-danger);'}">
            能力: ${emp.ability}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const modal = showModal({
    title: '项目招标',
    content,
    footer: '<button class="btn btn--secondary" id="modal-cancel">取消</button><button class="btn btn--primary btn--disabled" id="modal-confirm-bid" disabled>确认投标</button>',
  });

  let selectedEmpId = null;

  modal.querySelectorAll('.bid-employee-option').forEach(el => {
    el.addEventListener('click', () => {
      modal.querySelectorAll('.bid-employee-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedEmpId = el.dataset.bidEmp;
      const confirmBtn = modal.querySelector('#modal-confirm-bid');
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('btn--disabled');
    });
  });

  modal.querySelector('#modal-cancel')?.addEventListener('click', () => closeModal(modal));

  modal.querySelector('#modal-confirm-bid')?.addEventListener('click', () => {
    if (!selectedEmpId) return;
    const emp = gameEngine.employeeManager.getEmployee(selectedEmpId);
    if (emp.ability >= project.bidRequirement) {
        gameEngine.snapshot();
    }
    const result = gameEngine.projectManager.bidProject(projectId, emp.ability);

    if (result.success) {
      const acceptedProject = gameEngine.projectManager.acceptProject(projectId);
      closeModal(modal);
      eventBus.emit('toast', { type: 'success', message: `中标成功！${project.name} 已承接` });
      // Now show assign modal
      showAssignModal(acceptedProject.id);
      eventBus.emit('ui:refresh');
    } else {
      closeModal(modal);
      eventBus.emit('toast', { type: 'error', message: `投标失败: ${result.reason}` });
      eventBus.emit('ui:refresh');
    }
  });
}

function showAssignModal(projectId) {
  const project = gameEngine.projectManager.activeProjects.find(p => p.id === projectId);
  if (!project) return;

  const allEmployees = gameEngine.employeeManager.employees;

  const content = `
    <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-bottom:var(--space-lg);">
      选择要分配到「${project.name}」的员工（可多选）：
    </p>
    <div class="assign-modal__employees">
      ${allEmployees.map(emp => {
        const assigned = project.assignedEmployees.includes(emp.id);
        const busyElsewhere = emp.assignedProjectId && emp.assignedProjectId !== projectId;
        return `
        <div class="assign-modal__employee ${assigned ? 'selected' : ''} ${busyElsewhere ? 'disabled' : ''}"
             data-assign-emp="${emp.id}" data-project="${projectId}">
          <div class="assign-modal__employee-check">${assigned ? '✓' : ''}</div>
          <div class="avatar avatar--initials avatar--sm" style="background:${emp.avatarColor};">${emp.firstName[0]}${emp.lastName[0]}</div>
          <div style="flex:1;">
            <div style="font-weight:500;">${emp.firstName} ${emp.lastName}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${emp.functions.join('/')} | 能力:${emp.ability}</div>
          </div>
          ${busyElsewhere ? '<span style="font-size:var(--font-size-xs);color:var(--color-warning);">其他项目中</span>' : ''}
        </div>`;
      }).join('')}
    </div>
  `;

  const modal = showModal({
    title: '分配团队',
    content,
    footer: '<button class="btn btn--secondary" id="modal-cancel">取消</button><button class="btn btn--primary" id="modal-confirm-assign">确认分配</button>',
  });

  modal.querySelectorAll('.assign-modal__employee:not(.disabled)').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('selected');
      const check = el.querySelector('.assign-modal__employee-check');
      check.textContent = el.classList.contains('selected') ? '✓' : '';
    });
  });

  modal.querySelector('#modal-cancel')?.addEventListener('click', () => closeModal(modal));

  modal.querySelector('#modal-confirm-assign')?.addEventListener('click', () => {
    const selected = [...modal.querySelectorAll('.assign-modal__employee.selected')].map(el => el.dataset.assignEmp);

    gameEngine.snapshot();

    // Clear old assignments for this project
    project.assignedEmployees.forEach(empId => {
      const emp = gameEngine.employeeManager.getEmployee(empId);
      if (emp && !selected.includes(empId)) {
        emp.assignedProjectId = null;
        emp.consecutiveWorkMonths = 0;
      }
    });
    project.assignedEmployees = [];

    // Assign new
    selected.forEach(empId => {
      const emp = gameEngine.employeeManager.getEmployee(empId);
      if (emp) {
        // Unassign from previous project if any
        if (emp.assignedProjectId && emp.assignedProjectId !== projectId) {
          gameEngine.projectManager.unassignEmployee(emp.assignedProjectId, empId);
        }
        emp.assignedProjectId = projectId;
        gameEngine.projectManager.assignEmployee(projectId, empId);
      }
    });

    closeModal(modal);
    eventBus.emit('toast', { type: 'success', message: `已分配 ${selected.length} 名员工到 ${project.name}` });
    eventBus.emit('ui:refresh');
  });
}
