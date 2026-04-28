// ===== Equipment Page =====
import gameEngine from '../engine/GameEngine.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { EQUIPMENT_TYPES } from '../data/equipment.js';
import { EQUIPMENT_LIMIT } from '../data/config.js';
import eventBus from '../eventBus.js';
import { t, tData } from '../utils/i18n.js';

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
          <div class="card__title" style="margin-bottom:0;">${t('equip.market')}</div>
          <div class="equipment-market__budget">${formatMoney(company.funds)}</div>
        </div>
        <div class="equipment-market__desc">${t('equip.invest')}</div>

        <div class="equipment-grid">
          ${EQUIPMENT_TYPES.map(eq => `
            <div class="equipment-item" id="equip-${eq.id}">
              <div class="equipment-item__image">
                <div class="equipment-item__image-placeholder">${eq.icon}</div>
                ${eq.premium ? `<div class="equipment-item__premium-tag">${t('general.premium')}</div>` : ''}
              </div>
              <div class="equipment-item__body">
                <div class="equipment-item__name">${tData(eq, 'name')}</div>
                <div class="equipment-item__desc">${tData(eq, 'desc')}</div>
                <div class="equipment-item__effect">${tData(eq, 'effectDesc')}</div>
                <button class="equipment-item__buy-btn" data-buy-equip="${eq.id}">
                  ${t('equip.buyFor', { price: formatMoney(eq.price) })}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Assets Inventory -->
      <div class="card assets-inventory">
        <div class="assets-inventory__header">
          <div class="card__title" style="margin-bottom:0;">${t('equip.assets')} <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);font-weight:400;">(${owned.length}/${EQUIPMENT_LIMIT})</span></div>
          <button class="btn btn--outline btn--sm">
            <i data-lucide="sliders-horizontal" width="14" height="14"></i>
          </button>
        </div>

        ${owned.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon"><i data-lucide="package" width="48" height="48"></i></div>
            <div class="empty-state__text">${t('equip.noEquipment')}</div>
          </div>
        ` : `
        <table class="inventory-table">
          <thead>
            <tr>
              <th>${t('equip.itemName')}</th>
              <th>${t('equip.status')}</th>
              <th>${t('equip.durability')}</th>
              <th>${t('equip.maintenance')}</th>
              <th>${t('equip.action')}</th>
            </tr>
          </thead>
          <tbody>
            ${owned.map(item => {
              const durPct = Math.round((item.currentDurability / item.maxDurability) * 100);
              const status = item.currentDurability <= 0 ? 'broken' : durPct < 30 ? 'attention' : 'operational';
              const statusLabelMap = { operational: t('equip.operational'), attention: t('equip.attention'), broken: t('equip.broken') };
              const statusLabel = statusLabelMap[status];
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
                <td style="font-size:var(--font-size-sm);">${t('equip.monthlyMaintenance', { cost: formatMoney(item.maintenanceCost) })}</td>
                <td>
                  <div style="display:flex;gap:var(--space-xs);">
                    ${item.currentDurability <= 0 ? `
                      <button class="btn btn--outline btn--sm" data-repair="${item.id}">
                        <i data-lucide="wrench" width="12" height="12"></i> ${t('equip.repair')}
                      </button>
                    ` : `
                      <button class="btn btn--outline btn--sm btn--disabled" disabled>
                        <i data-lucide="check-circle" width="12" height="12"></i> ${t('equip.normal')}
                      </button>
                    `}
                    <button class="btn btn--danger btn--sm" data-sell="${item.id}">
                      <i data-lucide="dollar-sign" width="12" height="12"></i> ${t('equip.sell')}
                    </button>
                  </div>
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
        eventBus.emit('toast', { type: 'error', message: t('equip.buyNoFunds', { cost: formatMoney(type.price) }) });
        return;
      }

      if (gameEngine.equipmentManager.ownedEquipment.length >= EQUIPMENT_LIMIT) {
        eventBus.emit('toast', { type: 'error', message: t('equip.limitReached', { limit: EQUIPMENT_LIMIT }) });
        return;
      }

      showModal({
        title: t('equip.buyTitle'),
        content: `
          <div style="text-align:center;padding:var(--space-xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">${type.icon}</div>
            <div style="font-weight:600;font-size:var(--font-size-lg);margin-bottom:var(--space-sm);">${tData(type, 'name')}</div>
            <div style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-md);">${tData(type, 'desc')}</div>
            <div class="tag tag--success">${tData(type, 'effectDesc')}</div>
            <div style="margin-top:var(--space-xl);">
              <strong style="font-size:var(--font-size-xl);">${formatMoney(type.price)}</strong>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-xs);">
                ${t('equip.monthlyDurability', { maintenance: formatMoney(type.maintenanceCost), durability: type.durability })}
              </div>
            </div>
          </div>
        `,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('emp.cancel')}</button>
                 <button class="btn btn--primary" id="modal-confirm-buy">${t('equip.buyConfirm')}</button>`,
      });

      document.getElementById('modal-confirm-buy')?.addEventListener('click', () => {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-type.price);
        gameEngine.equipmentManager.buyEquipment(typeId);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: t('equip.buySuccess', { name: tData(type, 'name') }) });
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
        eventBus.emit('toast', { type: 'error', message: t('equip.repairNoFunds', { cost: formatMoney(cost) }) });
        return;
      }

      gameEngine.companyManager.addFunds(-cost);
      gameEngine.equipmentManager.repairEquipment(itemId);
      eventBus.emit('toast', { type: 'success', message: t('equip.repairSuccess', { name: item.name }) });
      eventBus.emit('ui:refresh');
    });
  });
  
  // Sell equipment
  document.querySelectorAll('[data-sell]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.sell;
      const item = gameEngine.equipmentManager.ownedEquipment.find(e => e.id === itemId);
      if (!item) return;

      const sellPrice = Math.round((item.currentDurability / item.maxDurability) * item.price);

      showModal({
        title: t('equip.sellTitle'),
        content: `
          <div style="text-align:center;padding:var(--space-xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">${item.icon}</div>
            <p>${t('equip.sellPrompt', { name: `<strong>${item.name}</strong>` })}</p>
            <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-top:var(--space-sm);">
              ${t('equip.sellDurability', { pct: Math.round((item.currentDurability/item.maxDurability)*100) })}
            </p>
            <div style="margin-top:var(--space-xl);">
              ${t('equip.sellRecovery')} <strong style="font-size:var(--font-size-xl);color:var(--color-success);">${formatMoney(sellPrice)}</strong>
            </div>
          </div>
        `,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('emp.cancel')}</button>
                 <button class="btn btn--danger" id="modal-confirm-sell">${t('equip.sellConfirm')}</button>`,
      });

      document.getElementById('modal-confirm-sell')?.addEventListener('click', () => {
        gameEngine.snapshot();
        const finalPrice = gameEngine.equipmentManager.sellEquipment(itemId);
        gameEngine.companyManager.addFunds(finalPrice);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: t('equip.sellSuccess', { name: item.name, price: formatMoney(finalPrice) }) });
        eventBus.emit('ui:refresh');
      });

      document.getElementById('modal-cancel')?.addEventListener('click', () => {
        closeModal(document.querySelector('.modal-overlay'));
      });
    });
  });
}
