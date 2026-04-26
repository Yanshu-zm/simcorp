// ===== Equipment Manager =====
import { EQUIPMENT_TYPES } from '../data/equipment.js';
import { EQUIPMENT_LIMIT } from '../data/config.js';
import { randInt, uid } from '../utils/random.js';
import eventBus from '../eventBus.js';

export class EquipmentManager {
  constructor() {
    this.ownedEquipment = [];
  }

  buyEquipment(typeId) {
    const type = EQUIPMENT_TYPES.find(t => t.id === typeId);
    if (!type) return null;

    if (this.ownedEquipment.length >= EQUIPMENT_LIMIT) {
      return null;
    }

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

  sellEquipment(itemId) {
    const index = this.ownedEquipment.findIndex(e => e.id === itemId);
    if (index === -1) return 0;
    const item = this.ownedEquipment[index];
    const sellPrice = Math.round((item.currentDurability / item.maxDurability) * item.price);
    this.ownedEquipment.splice(index, 1);
    eventBus.emit('equipment:sold', { item, sellPrice });
    return sellPrice;
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
    const effects = { 
      ability: 0, 
      moodBoost: 0, 
      stressReduction: 0,
      progressBoost: 0,
      growthBoost: 0,
      efficiencyBoost: 0
    };
    for (const item of this.ownedEquipment) {
      if (item.currentDurability > 0) {
        if (item.effects.ability) effects.ability += item.effects.ability;
        if (item.effects.moodBoost) effects.moodBoost += item.effects.moodBoost;
        if (item.effects.stressReduction) effects.stressReduction += item.effects.stressReduction;
        if (item.effects.progressBoost) effects.progressBoost += item.effects.progressBoost;
        if (item.effects.growthBoost) effects.growthBoost += item.effects.growthBoost;
        if (item.effects.efficiencyBoost) effects.efficiencyBoost += item.effects.efficiencyBoost;
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
