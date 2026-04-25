// ===== Equipment Manager =====
import { EQUIPMENT_TYPES } from '../data/equipment.js';
import { randInt, uid } from '../utils/random.js';
import eventBus from '../eventBus.js';

export class EquipmentManager {
  constructor() {
    this.ownedEquipment = [];
  }

  buyEquipment(typeId) {
    const type = EQUIPMENT_TYPES.find(t => t.id === typeId);
    if (!type) return null;

    const item = {
      id: uid(),
      typeId: type.id,
      name: type.name,
      nameEn: type.nameEn,
      effects: { ...type.effects },
      currentDurability: type.durability,
      maxDurability: type.durability,
      maintenanceCost: type.maintenanceCost,
      price: type.price,
      icon: type.icon,
    };
    this.ownedEquipment.push(item);
    eventBus.emit('equipment:bought', item);
    return item;
  }

  repairEquipment(itemId) {
    const item = this.ownedEquipment.find(e => e.id === itemId);
    if (!item) return false;
    const cost = Math.round(item.price * 0.5);
    item.currentDurability = item.maxDurability;
    eventBus.emit('equipment:repaired', { item, cost });
    return cost;
  }

  applyMonthlyDurability() {
    const broken = [];
    for (const item of this.ownedEquipment) {
      if (item.currentDurability <= 0) continue;
      const loss = randInt(1, 3);
      item.currentDurability = Math.max(0, item.currentDurability - loss);
      if (item.currentDurability <= 0) {
        broken.push(item);
      }
    }
    return broken;
  }

  getActiveEffects() {
    const effects = { ability: 0, moodBoost: 0, stressReduction: 0 };
    for (const item of this.ownedEquipment) {
      if (item.currentDurability > 0) {
        if (item.effects.ability) effects.ability += item.effects.ability;
        if (item.effects.moodBoost) effects.moodBoost += item.effects.moodBoost;
        if (item.effects.stressReduction) effects.stressReduction += item.effects.stressReduction;
      }
    }
    return effects;
  }

  getTotalMaintenanceCost() {
    return this.ownedEquipment
      .filter(e => e.currentDurability > 0)
      .reduce((sum, e) => sum + e.maintenanceCost, 0);
  }

  getActiveBuffs() {
    return this.ownedEquipment.filter(e => e.currentDurability > 0);
  }

  serialize() {
    return { ownedEquipment: this.ownedEquipment };
  }

  deserialize(data) {
    this.ownedEquipment = data.ownedEquipment || [];
  }
}

export default EquipmentManager;
