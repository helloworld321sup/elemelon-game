/**
 * Inventory - Detailed inventory management for Elemelon
 * Handles weapon and consumable inventory systems
 */

class Inventory {
    constructor(game) {
        this.game = game;
        
        // Inventory data
        this.weapons = [null, null, null]; // 3 weapon slots
        this.consumables = Array(12).fill(null); // 12 consumable slots
        this.activeWeapon = 0;
        
        // UI elements
        this.inventoryElement = null;
        this.weaponSlots = [];
        this.consumableSlots = [];
        
        // Inventory state
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        console.log('🎒 Initializing Inventory System...');
        
        // Get inventory UI elements
        this.inventoryElement = document.getElementById('inventory');
        this.setupInventoryUI();
        
        console.log('🎒 Inventory System initialized');
    }
    
    setupInventoryUI() {
        if (!this.inventoryElement) return;
        
        // Get weapon slots
        this.weaponSlots = Array.from(document.querySelectorAll('.weapon-slot'));
        
        // Setup weapon slot click handlers
        this.weaponSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectWeapon(index));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showWeaponContextMenu(index, e);
            });
        });
        
        // Get consumable slots
        this.consumableSlots = Array.from(document.querySelectorAll('.consumable-slot'));
        
        // Setup consumable slot click handlers
        this.consumableSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.useConsumable(index));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showConsumableContextMenu(index, e);
            });
        });
    }
    
    // Weapon management
    addWeapon(weaponType, slot = null) {
        // Find empty slot or use specified slot
        const targetSlot = slot !== null ? slot : this.findEmptyWeaponSlot();
        
        if (targetSlot === -1) {
            console.warn('🎒 No empty weapon slots available');
            return false;
        }
        
        // Create weapon object
        const weapon = this.createWeapon(weaponType);
        
        if (weapon) {
            this.weapons[targetSlot] = weapon;
            this.updateWeaponSlotUI(targetSlot);
            
            console.log(`🎒 Added ${weaponType} to slot ${targetSlot + 1}`);
            
            // Play pickup sound
            this.game.audioManager?.playUISound('pickup');
            
            return true;
        }
        
        return false;
    }
    
    removeWeapon(slot) {
        if (slot >= 0 && slot < 3 && this.weapons[slot]) {
            const weapon = this.weapons[slot];
            this.weapons[slot] = null;
            
            // If this was the active weapon, switch to another
            if (this.activeWeapon === slot) {
                this.selectNextAvailableWeapon();
            }
            
            this.updateWeaponSlotUI(slot);
            
            console.log(`🎒 Removed ${weapon.type} from slot ${slot + 1}`);
            
            return weapon;
        }
        
        return null;
    }
    
    selectWeapon(slot) {
        if (slot >= 0 && slot < 3 && this.weapons[slot]) {
            this.activeWeapon = slot;
            this.updateWeaponSelection();
            
            // Notify player
            const player = this.game.sceneManager?.player;
            if (player) {
                player.switchWeapon(slot);
            }
            
            // Play sound
            this.game.audioManager?.playUISound('weaponSwitch');
            
            console.log(`🎒 Selected weapon slot ${slot + 1}`);
        }
    }
    
    selectNextAvailableWeapon() {
        for (let i = 0; i < 3; i++) {
            if (this.weapons[i]) {
                this.selectWeapon(i);
                return;
            }
        }
        
        // No weapons available
        this.activeWeapon = 0;
        this.updateWeaponSelection();
    }
    
    findEmptyWeaponSlot() {
        for (let i = 0; i < 3; i++) {
            if (!this.weapons[i]) {
                return i;
            }
        }
        return -1;
    }
    
    createWeapon(weaponType) {
        const weaponData = {
            blaster: {
                type: 'blaster',
                name: 'Energy Blaster',
                icon: '🔫',
                damage: 2,
                range: 20,
                ammo: 100,
                maxAmmo: 100,
                fireRate: 0.3
            },
            sword: {
                type: 'sword',
                name: 'Elemental Sword',
                icon: '⚔️',
                damage: 3,
                range: 3,
                durability: 100,
                maxDurability: 100,
                attackSpeed: 0.8
            },
            grappling_hook: {
                type: 'grappling_hook',
                name: 'Grappling Hook',
                icon: '🪝',
                damage: 1,
                range: 25,
                cooldown: 2.0,
                swingSpeed: 15
            }
        };
        
        return weaponData[weaponType] || null;
    }
    
    // Consumable management
    addConsumable(itemType, count = 1) {
        // Try to stack with existing items
        for (let i = 0; i < 12; i++) {
            const item = this.consumables[i];
            if (item && item.type === itemType && item.count < item.maxStack) {
                const addAmount = Math.min(count, item.maxStack - item.count);
                item.count += addAmount;
                count -= addAmount;
                
                this.updateConsumableSlotUI(i);
                
                if (count <= 0) {
                    console.log(`🎒 Stacked ${itemType} (total: ${item.count})`);
                    return true;
                }
            }
        }
        
        // Create new stacks for remaining items
        while (count > 0) {
            const emptySlot = this.findEmptyConsumableSlot();
            if (emptySlot === -1) {
                console.warn('🎒 No empty consumable slots available');
                return false;
            }
            
            const item = this.createConsumable(itemType);
            if (!item) return false;
            
            const addAmount = Math.min(count, item.maxStack);
            item.count = addAmount;
            count -= addAmount;
            
            this.consumables[emptySlot] = item;
            this.updateConsumableSlotUI(emptySlot);
        }
        
        // Play pickup sound
        this.game.audioManager?.playUISound('pickup');
        
        console.log(`🎒 Added ${itemType} to inventory`);
        return true;
    }
    
    useConsumable(slot) {
        if (slot >= 0 && slot < 12 && this.consumables[slot]) {
            const item = this.consumables[slot];
            
            // Apply item effect
            if (this.applyConsumableEffect(item)) {
                // Reduce count
                item.count--;
                
                // Remove item if count reaches zero
                if (item.count <= 0) {
                    this.consumables[slot] = null;
                }
                
                this.updateConsumableSlotUI(slot);
                
                // Play use sound
                this.game.audioManager?.playUISound('pickup');
                
                console.log(`🎒 Used ${item.name}`);
                return true;
            }
        }
        
        return false;
    }
    
    findEmptyConsumableSlot() {
        for (let i = 0; i < 12; i++) {
            if (!this.consumables[i]) {
                return i;
            }
        }
        return -1;
    }
    
    createConsumable(itemType) {
        const consumableData = {
            health_potion: {
                type: 'health_potion',
                name: 'Health Potion',
                icon: '💊',
                effect: 'heal',
                value: 2,
                maxStack: 5,
                count: 0
            },
            energy_drink: {
                type: 'energy_drink',
                name: 'Energy Drink',
                icon: '⚡',
                effect: 'energy',
                value: 50,
                maxStack: 3,
                count: 0
            },
            food_ration: {
                type: 'food_ration',
                name: 'Food Ration',
                icon: '🍎',
                effect: 'heal',
                value: 1,
                maxStack: 10,
                count: 0
            },
            magic_crystal: {
                type: 'magic_crystal',
                name: 'Magic Crystal',
                icon: '💎',
                effect: 'special',
                value: 1,
                maxStack: 1,
                count: 0
            }
        };
        
        return consumableData[itemType] ? { ...consumableData[itemType] } : null;
    }
    
    applyConsumableEffect(item) {
        const player = this.game.sceneManager?.player;
        if (!player) return false;
        
        switch (item.effect) {
            case 'heal':
                if (player.health < 8) {
                    player.heal(item.value);
                    return true;
                }
                break;
                
            case 'energy':
                // TODO: Implement energy system
                console.log(`🎒 Gained ${item.value} energy`);
                return true;
                
            case 'special':
                // TODO: Implement special effects
                console.log(`🎒 Used ${item.name} special effect`);
                return true;
        }
        
        return false;
    }
    
    // UI Updates
    updateWeaponSlotUI(slot) {
        if (slot >= 0 && slot < this.weaponSlots.length) {
            const slotElement = this.weaponSlots[slot];
            const weapon = this.weapons[slot];
            
            // Clear slot
            slotElement.innerHTML = '';
            slotElement.className = 'weapon-slot';
            
            if (weapon) {
                // Add weapon icon
                const icon = document.createElement('div');
                icon.className = 'weapon-icon';
                icon.textContent = weapon.icon;
                slotElement.appendChild(icon);
                
                // Add weapon info
                const info = document.createElement('div');
                info.className = 'weapon-info';
                info.innerHTML = `
                    <div class="weapon-name">${weapon.name}</div>
                    <div class="weapon-stats">DMG: ${weapon.damage}</div>
                `;
                slotElement.appendChild(info);
                
                slotElement.classList.add('filled');
            } else {
                // Show slot number
                const slotNumber = document.createElement('div');
                slotNumber.className = 'slot-number';
                slotNumber.textContent = slot + 1;
                slotElement.appendChild(slotNumber);
                
                slotElement.classList.add('empty');
            }
        }
    }
    
    updateConsumableSlotUI(slot) {
        if (slot >= 0 && slot < this.consumableSlots.length) {
            const slotElement = this.consumableSlots[slot];
            const item = this.consumables[slot];
            
            // Clear slot
            slotElement.innerHTML = '';
            
            if (item) {
                // Add item icon
                const icon = document.createElement('div');
                icon.className = 'item-icon';
                icon.textContent = item.icon;
                slotElement.appendChild(icon);
                
                // Add item count
                if (item.count > 1) {
                    const count = document.createElement('div');
                    count.className = 'item-count';
                    count.textContent = item.count;
                    slotElement.appendChild(count);
                }
                
                // Add tooltip
                slotElement.title = `${item.name} (${item.count})`;
            }
        }
    }
    
    updateWeaponSelection() {
        this.weaponSlots.forEach((slot, index) => {
            if (index === this.activeWeapon) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
    
    updateAllUI() {
        // Update all weapon slots
        for (let i = 0; i < 3; i++) {
            this.updateWeaponSlotUI(i);
        }
        
        // Update all consumable slots
        for (let i = 0; i < 12; i++) {
            this.updateConsumableSlotUI(i);
        }
        
        // Update weapon selection
        this.updateWeaponSelection();
    }
    
    // Context menus
    showWeaponContextMenu(slot, event) {
        if (!this.weapons[slot]) return;
        
        const contextMenu = this.createContextMenu([
            { label: 'Drop Weapon', action: () => this.dropWeapon(slot) },
            { label: 'Weapon Info', action: () => this.showWeaponInfo(slot) }
        ]);
        
        this.showContextMenuAt(contextMenu, event.clientX, event.clientY);
    }
    
    showConsumableContextMenu(slot, event) {
        if (!this.consumables[slot]) return;
        
        const contextMenu = this.createContextMenu([
            { label: 'Use Item', action: () => this.useConsumable(slot) },
            { label: 'Drop Item', action: () => this.dropConsumable(slot) },
            { label: 'Item Info', action: () => this.showItemInfo(slot) }
        ]);
        
        this.showContextMenuAt(contextMenu, event.clientX, event.clientY);
    }
    
    createContextMenu(items) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.label;
            menuItem.addEventListener('click', () => {
                item.action();
                this.hideContextMenu();
            });
            menu.appendChild(menuItem);
        });
        
        return menu;
    }
    
    showContextMenuAt(menu, x, y) {
        // Remove existing context menu
        this.hideContextMenu();
        
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // Hide menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => this.hideContextMenu(), { once: true });
        }, 10);
    }
    
    hideContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }
    
    // Item actions
    dropWeapon(slot) {
        const weapon = this.removeWeapon(slot);
        if (weapon) {
            console.log(`🎒 Dropped ${weapon.name}`);
            // TODO: Create weapon pickup in world
        }
    }
    
    dropConsumable(slot) {
        if (this.consumables[slot]) {
            const item = this.consumables[slot];
            this.consumables[slot] = null;
            this.updateConsumableSlotUI(slot);
            
            console.log(`🎒 Dropped ${item.name}`);
            // TODO: Create item pickup in world
        }
    }
    
    showWeaponInfo(slot) {
        const weapon = this.weapons[slot];
        if (weapon) {
            alert(`${weapon.name}\nDamage: ${weapon.damage}\nRange: ${weapon.range}`);
        }
    }
    
    showItemInfo(slot) {
        const item = this.consumables[slot];
        if (item) {
            alert(`${item.name}\nEffect: ${item.effect}\nValue: ${item.value}\nCount: ${item.count}`);
        }
    }
    
    // Save/Load
    getSaveData() {
        return {
            weapons: this.weapons,
            consumables: this.consumables,
            activeWeapon: this.activeWeapon
        };
    }
    
    loadSaveData(data) {
        this.weapons = data.weapons || [null, null, null];
        this.consumables = data.consumables || Array(12).fill(null);
        this.activeWeapon = data.activeWeapon || 0;
        
        this.updateAllUI();
    }
    
    // Public interface
    getActiveWeapon() {
        return this.weapons[this.activeWeapon];
    }
    
    hasWeapon(weaponType) {
        return this.weapons.some(weapon => weapon && weapon.type === weaponType);
    }
    
    hasConsumable(itemType) {
        return this.consumables.some(item => item && item.type === itemType);
    }
    
    getConsumableCount(itemType) {
        return this.consumables
            .filter(item => item && item.type === itemType)
            .reduce((total, item) => total + item.count, 0);
    }
    
    // Cleanup
    dispose() {
        this.hideContextMenu();
        console.log('🎒 Inventory disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Inventory;
}
