import gameEngine from '../engine/GameEngine.js';
import { formatMoney } from '../utils/format.js';
import { showModal, closeModal } from './Modal.js';
import { EQUIPMENT_TYPES } from '../data/equipment.js';
import { EQUIPMENT_LIMIT } from '../data/config.js';
import eventBus from '../eventBus.js';
import { t, getCurrentLang } from '../utils/i18n.js';

export function renderEquipmentPage() {
  const company = gameEngine.companyManager;
  const equipment = gameEngine.equipmentManager;
  const owned = equipment.ownedEquipment;
  const lang = getCurrentLang();

  return `
    <div class="equipment-page">
      <!-- Equipment Market -->
      <div class="card equipment-market">
        <div class="equipment-market__header">
          <div class="card__title" style="margin-bottom:0;">${t('equip.market')}</div>
          <div class="equipment-market__budget">${formatMoney(company.funds)}</div>
        </div>
        <div class="equipment-market__desc">${t('equip.marketDesc')}</div>

        <div class="equipment-grid">
          ${EQUIPMENT_TYPES.map(eq => {
            const name = lang === 'en' ? eq.nameEn : eq.name;
            const desc = lang === 'en' ? eq.descEn : eq.desc;
            const effectDesc = lang === 'en' ? eq.effectDescEn : eq.effectDesc;
            return `
            <div class="equipment-item" id="equip-${eq.id}">
              <div class="equipment-item__image">
                <div class="equipment-item__image-placeholder">${eq.icon}</div>
                ${eq.premium ? '<div class="equipment-item__premium-tag">PREMIUM</div>' : ''}
              </div>
              <div class="equipment-item__body">
                <div class="equipment-item__name">${name}</div>
                <div class="equipment-item__desc">${desc}</div>
                <div class="equipment-item__effect">${effectDesc}</div>
                <button class="equipment-item__buy-btn" data-buy-equip="${eq.id}">
                  ${t('btn.buyFor')} ${formatMoney(eq.price)}
                </button>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>

      <!-- Assets Inventory -->
      <div class="card assets-inventory">
        <div class="assets-inventory__header">
          <div class="card__title" style="margin-bottom:0;">${t('equip.inventory')} <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);font-weight:400;">(${owned.length}/${EQUIPMENT_LIMIT})</span></div>
          <button class="btn btn--outline btn--sm">
            <i data-lucide="sliders-horizontal" width="14" height="14"></i>
          </button>
        </div>

        ${owned.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon"><i data-lucide="package" width="48" height="48"></i></div>
            <div class="empty-state__text">${t('equip.noAssets')}</div>
          </div>
        ` : `
        <table class="inventory-table">
          <thead>
            <tr>
              <th>${t('table.itemName')}</th>
              <th>${t('table.status')}</th>
              <th>${t('table.durability')}</th>
              <th>${t('table.maintenance')}</th>
              <th>${t('table.action')}</th>
            </tr>
          </thead>
          <tbody>
            ${owned.map(item => {
              const durPct = Math.round((item.currentDurability / item.maxDurability) * 100);
              const status = item.currentDurability <= 0 ? 'broken' : durPct < 30 ? 'attention' : 'operational';
              const statusLabel = { 
                operational: t('status.operational'), 
                attention: t('status.attention'), 
                broken: t('status.broken') 
              }[status];
              const name = lang === 'en' ? item.nameEn : item.name;
              
              return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-sm);">
                    <span>${item.icon}</span>
                    <div>
                      <div style="font-weight:500;">${name}</div>
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
                <td style="font-size:var(--font-size-sm);">${formatMoney(item.maintenanceCost)}/${lang === 'en' ? 'mo' : '月'}</td>
                <td>
                  <div style="display:flex;gap:var(--space-xs);">
                    ${item.currentDurability <= 0 ? `
                      <button class="btn btn--outline btn--sm" data-repair="${item.id}">
                        <i data-lucide="wrench" width="12" height="12"></i> ${t('btn.repair')}
                      </button>
                    ` : `
                      <button class="btn btn--outline btn--sm btn--disabled" disabled>
                        <i data-lucide="check-circle" width="12" height="12"></i> ${t('status.normal')}
                      </button>
                    `}
                    <button class="btn btn--danger btn--sm" data-sell="${item.id}" title="${t('btn.sell')}: ${formatMoney(Math.round((item.currentDurability / item.maxDurability) * item.price))}">
                      <i data-lucide="dollar-sign" width="12" height="12"></i> ${t('btn.sell')}
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
      const lang = getCurrentLang();
      const typeId = btn.dataset.buyEquip;
      const type = EQUIPMENT_TYPES.find(t => t.id === typeId);
      if (!type) return;

      if (gameEngine.companyManager.funds < type.price) {
        eventBus.emit('toast', { type: 'error', message: `${t('msg.insufficientFunds')}！${lang === 'en' ? 'Needs' : '需要'} ${formatMoney(type.price)}` });
        return;
      }

      if (gameEngine.equipmentManager.ownedEquipment.length >= EQUIPMENT_LIMIT) {
        eventBus.emit('toast', { type: 'error', message: `${t('msg.equipLimit')} (${EQUIPMENT_LIMIT})！` });
        return;
      }

      const name = lang === 'en' ? type.nameEn : type.name;
      const desc = lang === 'en' ? type.descEn : type.desc;
      const effectDesc = lang === 'en' ? type.effectDescEn : type.effectDesc;

      showModal({
        title: t('modal.buyTitle'),
        content: `
          <div style="text-align:center;padding:var(--space-xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">${type.icon}</div>
            <div style="font-weight:600;font-size:var(--font-size-lg);margin-bottom:var(--space-sm);">${name}</div>
            <div style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-md);">${desc}</div>
            <div class="tag tag--success">${effectDesc}</div>
            <div style="margin-top:var(--space-xl);">
              <strong style="font-size:var(--font-size-xl);">${formatMoney(type.price)}</strong>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-xs);">
                ${t('equip.monthlyMaint')}: ${formatMoney(type.maintenanceCost)} | ${t('equip.durability')}: ${type.durability}
              </div>
            </div>
          </div>
        `,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('btn.close')}</button>
                 <button class="btn btn--primary" id="modal-confirm-buy">${t('confirm.buy')}</button>`,
      });

      document.getElementById('modal-confirm-buy')?.addEventListener('click', () => {
        gameEngine.snapshot();
        gameEngine.companyManager.addFunds(-type.price);
        gameEngine.equipmentManager.buyEquipment(typeId);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: t('msg.buySuccess').replace('{name}', name) });
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
      const lang = getCurrentLang();
      gameEngine.snapshot();
      const item = gameEngine.equipmentManager.ownedEquipment.find(e => e.id === itemId);
      if (!item) return;

      const cost = Math.round(item.price * 0.5);
      if (gameEngine.companyManager.funds < cost) {
        eventBus.emit('toast', { type: 'error', message: `${t('msg.insufficientFunds')}！${lang === 'en' ? 'Needs' : '维修需要'} ${formatMoney(cost)}` });
        return;
      }

      gameEngine.companyManager.addFunds(-cost);
      gameEngine.equipmentManager.repairEquipment(itemId);
      const name = lang === 'en' ? item.nameEn : item.name;
      eventBus.emit('toast', { type: 'success', message: t('msg.repairSuccess').replace('{name}', name) });
      eventBus.emit('ui:refresh');
    });
  });

  // Sell equipment
  document.querySelectorAll('[data-sell]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = getCurrentLang();
      const itemId = btn.dataset.sell;
      const item = gameEngine.equipmentManager.ownedEquipment.find(e => e.id === itemId);
      if (!item) return;

      const sellPrice = Math.round((item.currentDurability / item.maxDurability) * item.price);
      const name = lang === 'en' ? item.nameEn : item.name;

      showModal({
        title: t('modal.sellTitle'),
        content: `
          <div style="text-align:center;padding:var(--space-xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">${item.icon}</div>
            <p>${lang === 'en' ? 'Are you sure to sell' : '确定要出售'} <strong>${name}</strong> ${lang === 'en' ? '?' : '吗？'}</p>
            <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-top:var(--space-sm);">
              ${lang === 'en' ? 'Current Durability' : '当前耐久'}: ${Math.round((item.currentDurability/item.maxDurability)*100)}%
            </p>
            <div style="margin-top:var(--space-xl);">
              ${t('equip.estimatedRecycle')}: <strong style="font-size:var(--font-size-xl);color:var(--color-success);">${formatMoney(sellPrice)}</strong>
            </div>
          </div>
        `,
        footer: `<button class="btn btn--secondary" id="modal-cancel">${t('btn.close')}</button>
                 <button class="btn btn--danger" id="modal-confirm-sell">${t('confirm.sell')}</button>`,
      });

      document.getElementById('modal-confirm-sell')?.addEventListener('click', () => {
        gameEngine.snapshot();
        const finalPrice = gameEngine.equipmentManager.sellEquipment(itemId);
        gameEngine.companyManager.addFunds(finalPrice);
        closeModal(document.querySelector('.modal-overlay'));
        eventBus.emit('toast', { type: 'success', message: t('msg.sellSuccess').replace('{name}', name).replace('{price}', formatMoney(finalPrice)) });
        eventBus.emit('ui:refresh');
      });

      document.getElementById('modal-cancel')?.addEventListener('click', () => {
        closeModal(document.querySelector('.modal-overlay'));
      });
    });
  });
}
