// ===== Equipment Page =====
import gameEngine from '../engine/GameEngine.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { EQUIPMENT_TYPES } from '../data/equipment.js';
import { EQUIPMENT_LIMIT } from '../data/config.js';
import eventBus from '../eventBus.js';

export function renderEquipmentPage() {
  const company = gameEngine.companyManager;
  const equipment = gameEngine.equipmentManager;
  const owned = equipment.ownedEquipment;
  const activeEffects = equipment.getActiveEffects();

  // System Vitality metrics (derived from equipment state)
  const totalDurability = owned.reduce((sum, e) => sum + e.maxDurability, 0) || 1;
  const currentDurability = owned.reduce((sum, e) => sum + e.currentDurability, 0);
  const healthPct = Math.round((currentDurability / totalDurability) * 100) || 0;

  return `
    <div class="equipment-page">
      <!-- Equipment Market -->
      <div class="card equipment-market">
        <div class="equipment-market__header">
          <div class="card__title" style="margin-bottom:0;">Equipment Market</div>
          <div class="equipment-market__budget">${formatMoney(company.funds)}</div>
        </div>
        <div class="equipment-market__desc">Invest in infrastructure to scale your empire.</div>

        <div class="equipment-grid">
          ${EQUIPMENT_TYPES.map(eq => `
            <div class="equipment-item" id="equip-${eq.id}">
              <div class="equipment-item__image">
                <div class="equipment-item__image-placeholder">${eq.icon}</div>
                ${eq.premium ? '<div class="equipment-item__premium-tag">PREMIUM</div>' : ''}
              </div>
              <div class="equipment-item__body">
                <div class="equipment-item__name">${eq.name}</div>
                <div class="equipment-item__desc">${eq.desc}</div>
                <div class="equipment-item__effect">${eq.effectDesc}</div>
                <button class="equipment-item__buy-btn" data-buy-equip="${eq.id}">
                  BUY FOR ${formatMoney(eq.price)}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Assets Inventory -->
      <div class="card assets-inventory">
        <div class="assets-inventory__header">
          <div class="card__title" style="margin-bottom:0;">Assets Inventory <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);font-weight:400;">(${owned.length}/${EQUIPMENT_LIMIT})</span></div>
          <button class="btn btn--outline btn--sm">
            <i data-lucide="sliders-horizontal" width="14" height="14"></i>
          </button>
        </div>

        ${owned.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon"><i data-lucide="package" width="48" height="48"></i></div>
            <div class="empty-state__text">暂无设备，请从市场购买</div>
          </div>
        ` : `
        <table class="inventory-table">
          <thead>
            <tr>
              <th>ITEM NAME</th>
              <th>STATUS</th>
              <th>DURABILITY</th>
              <th>MAINTENANCE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${owned.map(item => {
              const durPct = Math.round((item.currentDurability / item.maxDurability) * 100);
              const status = item.currentDurability <= 0 ? 'broken' : durPct < 30 ? 'attention' : 'operational';
              const statusLabel = { operational: 'OPERATIONAL', attention: 'ATTENTION', broken: 'BROKEN' }[status];
              return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-sm);">
                    <span>${item.icon}</span>
                    <div>
                      <div style="font-weight:500;">${item.name}</div>
                      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">ID: #${item.id.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="inventory-status inventory-status--${status}">${statusLabel}</span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-sm);">
                    <div class="progress" style="width:80px;">
                      <div class="progress__fill progress__fill--${status === 'broken' ? 'danger' : status === 'attention' ? 'warning' : 'success'}" style="width:${durPct}%"></div>
                    </div>
                    <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${durPct}%</span>
                  </div>
                </td>
                <td style="font-size:var(--font-size-sm);">${formatMoney(item.maintenanceCost)}/月</td>
                <td>
                  ${item.currentDurability <= 0 ? `
                    <button class="btn btn--outline btn--sm" data-repair="${item.id}">
                      <i data-lucide="wrench" width="12" height="12"></i> 维修 ${formatMoney(Math.round(item.price * 0.5))}
                    </button>
                  ` : `
                    <button class="btn btn--outline btn--sm btn--disabled" disabled>
                      <i data-lucide="check-circle" width="12" height="12"></i> 正常
                    </button>
                  `}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        `}
      </div>
    </div>
  `;
}

export function bindEquipmentPageEvents() {
  // Buy equipment
  document.querySelectorAll('[data-buy-equip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const typeId = btn.dataset.buyEquip;
      const type = EQUIPMENT_TYPES.find(t => t.id === typeId);
      if (!type) return;

      if (gameEngine.companyManager.funds < type.price) {
        eventBus.emit('toast', { type: 'error', message: `资金不足！需要 ${formatMoney(type.price)}` });
        return;
      }

      if (gameEngine.equipmentManager.ownedEquipment.length >= EQUIPMENT_LIMIT) {
        eventBus.emit('toast', { type: 'error', message: `设备数量已达上限 (${EQUIPMENT_LIMIT})！` });
        return;
      }

      showModal({
        title: '购买设备',
        content: `
          <div style="text-align:center;padding:var(--space-xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">${type.icon}</div>
            <div style="font-weight:600;font-size:var(--font-size-lg);margin-bottom:var(--space-sm);">${type.name}</div>
            <div style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-md);">${type.desc}</div>
            <div class="tag tag--success">${type.effectDesc}</div>
            <div style="margin-top:var(--space-xl);">
              <strong style="font-size:var(--font-size-xl);">${formatMoney(type.price)}</strong>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-xs);">
                月维护费: ${formatMoney(type.maintenanceCost)} | 耐久: ${type.durability}
              </div>
            </div>
          </div>
        `,
        footer: `<button class="btn btn--secondary" id="modal-cancel">取消</button>
                 <button class="btn btn--primary" id="modal-confirm-buy">确认购买</button>`,
      });

      document.getElementById('modal-confirm-buy')?.addEventListener('click', () => {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-type.price);
        gameEngine.equipmentManager.buyEquipment(typeId);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: `已购买 ${type.name}！` });
        eventBus.emit('ui:refresh');
      });

      document.getElementById('modal-cancel')?.addEventListener('click', () => {
        closeModal(document.querySelector('.modal-overlay'));
      });
    });
  });

  // Repair equipment
  document.querySelectorAll('[data-repair]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.repair;
      gameEngine.snapshot();
      const item = gameEngine.equipmentManager.ownedEquipment.find(e => e.id === itemId);
      if (!item) return;

      const cost = Math.round(item.price * 0.5);
      if (gameEngine.companyManager.funds < cost) {
        eventBus.emit('toast', { type: 'error', message: `资金不足！维修需要 ${formatMoney(cost)}` });
        return;
      }

      gameEngine.companyManager.addFunds(-cost);
      gameEngine.equipmentManager.repairEquipment(itemId);
      eventBus.emit('toast', { type: 'success', message: `${item.name} 已维修！` });
      eventBus.emit('ui:refresh');
    });
  });
}
