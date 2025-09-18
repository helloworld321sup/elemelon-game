/**
 * Shop - Shop system for Elemelon
 * Handles item purchasing, inventory management, and shop interactions
 */

class Shop {
    constructor(game, type, position) {
        this.game = game;
        this.type = type; // weapon, consumable, general
        this.position = position;
        
        // Shop properties
        this.name = this.getShopName();
        this.isOpen = true;
        this.shopkeeper = null;
        
        // Shop structure
        this.mesh = null;
        this.interiorObjects = [];
        
        // Shop inventory
        this.inventory = [];
        this.restockTimer = 0;
        this.restockInterval = 300; // 5 minutes
        
        // Shop UI
        this.shopUI = null;
        this.isShopOpen = false;
        
        this.init();
    }
    
    init() {
        console.log(`🏪 Initializing ${this.name}...`);
        
        // Create shop structure
        this.createShopStructure();
        
        // Setup shop inventory
        this.setupInventory();
        
        // Create shopkeeper
        this.createShopkeeper();
        
        // Setup shop UI
        this.setupShopUI();
        
        console.log(`🏪 ${this.name} initialized`);
    }
    
    getShopName() {
        const names = {
            weapon: 'Melon Arms Shop',
            consumable: 'Healing Herbs Store',
            general: 'General Goods Market'
        };
        
        return names[this.type] || 'Melon Shop';
    }
    
    createShopStructure() {
        const shopGroup = new THREE.Group();
        
        // Main shop building
        this.createMainBuilding(shopGroup);
        
        // Shop sign
        this.createShopSign(shopGroup);
        
        // Shop entrance
        this.createEntrance(shopGroup);
        
        // Shop interior
        this.createInterior(shopGroup);
        
        this.mesh = shopGroup;
        this.mesh.position.copy(this.position);
        
        // Add shop data
        this.mesh.userData = {
            type: this.type,
            isShop: true,
            shop: this,
            interactable: true
        };
        
        this.game.gameEngine.addToScene(this.mesh);
    }
    
    createMainBuilding(group) {
        // Shop building
        const buildingGeometry = new THREE.BoxGeometry(15, 10, 15);
        const buildingMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513 // Brown wood color
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 5;
        building.castShadow = true;
        building.receiveShadow = true;
        
        group.add(building);
        
        // Shop roof
        const roofGeometry = new THREE.ConeGeometry(12, 4, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({
            color: 0x654321
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 12;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        
        group.add(roof);
    }
    
    createShopSign(group) {
        // Shop sign
        const signGeometry = new THREE.PlaneGeometry(8, 2);
        const signMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            transparent: true
        });
        
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 7, 7.6);
        
        group.add(sign);
        
        // Add shop name text (in a real implementation, this would be a texture)
        const textGeometry = new THREE.PlaneGeometry(7, 1.5);
        const textMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });
        
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(0, 7, 7.7);
        
        group.add(text);
    }
    
    createEntrance(group) {
        // Shop door
        const doorGeometry = new THREE.BoxGeometry(3, 6, 0.3);
        const doorMaterial = new THREE.MeshLambertMaterial({
            color: 0x654321
        });
        
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 3, 7.6);
        
        group.add(door);
        
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(4, 7, 0.5);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 3.5, 7.3);
        
        group.add(frame);
        
        // Store door reference
        this.door = door;
    }
    
    createInterior(group) {
        // Create interior layout
        this.createShopCounter(group);
        this.createDisplayShelves(group);
        this.createShopDecorations(group);
    }
    
    createShopCounter(group) {
        // Main counter
        const counterGeometry = new THREE.BoxGeometry(8, 3, 2);
        const counterMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513
        });
        
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(0, 1.5, -3);
        
        group.add(counter);
        
        // Counter top
        const topGeometry = new THREE.BoxGeometry(8.2, 0.2, 2.2);
        const topMaterial = new THREE.MeshLambertMaterial({
            color: 0x654321
        });
        
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 3.1, -3);
        
        group.add(top);
        
        this.counter = counter;
    }
    
    createDisplayShelves(group) {
        // Side shelves
        const shelfPositions = [
            { x: -6, z: 0 },
            { x: 6, z: 0 },
            { x: -6, z: -6 },
            { x: 6, z: -6 }
        ];
        
        shelfPositions.forEach(pos => {
            const shelf = this.createShelf();
            shelf.position.set(pos.x, 0, pos.z);
            group.add(shelf);
        });
    }
    
    createShelf() {
        const shelfGroup = new THREE.Group();
        
        // Shelf frame
        const frameGeometry = new THREE.BoxGeometry(2, 6, 0.5);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 3;
        
        // Shelf levels
        for (let i = 0; i < 3; i++) {
            const shelfGeometry = new THREE.BoxGeometry(2.2, 0.2, 1.5);
            const shelfMaterial = new THREE.MeshLambertMaterial({
                color: 0x654321
            });
            
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.y = 1.5 + i * 2;
            
            shelfGroup.add(shelf);
        }
        
        shelfGroup.add(frame);
        
        return shelfGroup;
    }
    
    createShopDecorations(group) {
        // Add decorative items based on shop type
        switch (this.type) {
            case 'weapon':
                this.createWeaponDecorations(group);
                break;
            case 'consumable':
                this.createConsumableDecorations(group);
                break;
            case 'general':
                this.createGeneralDecorations(group);
                break;
        }
    }
    
    createWeaponDecorations(group) {
        // Weapon displays
        const weaponPositions = [
            { x: -6, y: 4, z: 0 },
            { x: 6, y: 4, z: 0 },
            { x: 0, y: 5, z: -6 }
        ];
        
        weaponPositions.forEach(pos => {
            const weaponDisplay = this.createWeaponDisplay();
            weaponDisplay.position.set(pos.x, pos.y, pos.z);
            group.add(weaponDisplay);
        });
    }
    
    createWeaponDisplay() {
        const displayGroup = new THREE.Group();
        
        // Display case
        const caseGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.3);
        const caseMaterial = new THREE.MeshLambertMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        const displayCase = new THREE.Mesh(caseGeometry, caseMaterial);
        displayGroup.add(displayCase);
        
        // Sample weapon (simplified)
        const weaponGeometry = new THREE.BoxGeometry(0.2, 1, 0.1);
        const weaponMaterial = new THREE.MeshLambertMaterial({
            color: 0x888888
        });
        
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.z = 0.1;
        displayGroup.add(weapon);
        
        return displayGroup;
    }
    
    createConsumableDecorations(group) {
        // Potion bottles and herb displays
        const potionPositions = [
            { x: -5, y: 2, z: -1 },
            { x: -3, y: 3, z: -1 },
            { x: 5, y: 2, z: -1 },
            { x: 3, y: 3, z: -1 }
        ];
        
        potionPositions.forEach(pos => {
            const potion = this.createPotionBottle();
            potion.position.set(pos.x, pos.y, pos.z);
            group.add(potion);
        });
    }
    
    createPotionBottle() {
        const bottleGroup = new THREE.Group();
        
        // Bottle
        const bottleGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
        const bottleMaterial = new THREE.MeshLambertMaterial({
            color: 0x90EE90,
            transparent: true,
            opacity: 0.8
        });
        
        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        
        // Cork
        const corkGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 8);
        const corkMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513
        });
        
        const cork = new THREE.Mesh(corkGeometry, corkMaterial);
        cork.position.y = 0.6;
        
        bottleGroup.add(bottle);
        bottleGroup.add(cork);
        
        return bottleGroup;
    }
    
    createGeneralDecorations(group) {
        // Mixed decorations for general store
        this.createWeaponDecorations(group);
        this.createConsumableDecorations(group);
    }
    
    createShopkeeper() {
        // Create shopkeeper NPC
        this.shopkeeper = new ShopkeeperNPC(this.game, this);
        this.shopkeeper.setPosition(0, 0, -4); // Behind counter
        
        this.mesh.add(this.shopkeeper.mesh);
    }
    
    setupInventory() {
        // Initialize shop inventory based on type
        this.inventory = this.generateInitialInventory();
        
        console.log(`🏪 ${this.name} stocked with ${this.inventory.length} items`);
    }
    
    generateInitialInventory() {
        const items = [];
        
        switch (this.type) {
            case 'weapon':
                items.push(...this.generateWeaponInventory());
                break;
            case 'consumable':
                items.push(...this.generateConsumableInventory());
                break;
            case 'general':
                items.push(...this.generateWeaponInventory());
                items.push(...this.generateConsumableInventory());
                break;
        }
        
        return items;
    }
    
    generateWeaponInventory() {
        return [
            {
                id: 'blaster',
                name: 'Energy Blaster',
                type: 'weapon',
                price: 100,
                description: 'A powerful energy weapon that fires plasma bolts',
                icon: '🔫',
                stock: 1,
                requirements: []
            },
            {
                id: 'sword',
                name: 'Elemental Sword',
                type: 'weapon',
                price: 150,
                description: 'A mystical sword that channels elemental energy',
                icon: '⚔️',
                stock: 1,
                requirements: []
            },
            {
                id: 'grappling_hook',
                name: 'Grappling Hook',
                type: 'weapon',
                price: 200,
                description: 'A versatile tool for traversal and combat',
                icon: '🪝',
                stock: 1,
                requirements: []
            }
        ];
    }
    
    generateConsumableInventory() {
        return [
            {
                id: 'health_potion',
                name: 'Health Potion',
                type: 'consumable',
                price: 20,
                description: 'Restores 2 hearts of health',
                icon: '💊',
                stock: 10,
                requirements: []
            },
            {
                id: 'energy_drink',
                name: 'Energy Drink',
                type: 'consumable',
                price: 15,
                description: 'Restores energy and stamina',
                icon: '⚡',
                stock: 8,
                requirements: []
            },
            {
                id: 'food_ration',
                name: 'Food Ration',
                type: 'consumable',
                price: 5,
                description: 'Basic sustenance that restores 1 heart',
                icon: '🍎',
                stock: 20,
                requirements: []
            },
            {
                id: 'magic_crystal',
                name: 'Magic Crystal',
                type: 'consumable',
                price: 100,
                description: 'A rare crystal with mysterious properties',
                icon: '💎',
                stock: 2,
                requirements: ['completed_temple']
            }
        ];
    }
    
    setupShopUI() {
        // Create shop UI elements
        this.createShopInterface();
    }
    
    createShopInterface() {
        // Shop interface will be created when player interacts
        this.shopUIData = {
            title: this.name,
            inventory: this.inventory,
            playerTokens: 0
        };
    }
    
    // Shop interaction methods
    onPlayerEnter(player) {
        console.log(`🏪 Player entered ${this.name}`);
        
        // Show interaction prompt
        this.game.uiManager?.showInteractionPrompt(this.mesh);
    }
    
    onPlayerInteract(player) {
        console.log(`🏪 Player interacting with ${this.name}`);
        
        // Open shop interface
        this.openShop(player);
    }
    
    openShop(player) {
        if (this.isShopOpen) return;
        
        this.isShopOpen = true;
        
        // Update player token count
        this.shopUIData.playerTokens = player.tokens;
        
        // Show shop UI
        this.showShopUI();
        
        // Play shop music/sounds
        this.game.audioManager?.playUISound('shopOpen');
        
        // Shopkeeper greeting
        this.shopkeeper?.greetPlayer();
    }
    
    closeShop() {
        if (!this.isShopOpen) return;
        
        this.isShopOpen = false;
        
        // Hide shop UI
        this.hideShopUI();
        
        // Play close sound
        this.game.audioManager?.playUISound('shopClose');
        
        // Shopkeeper farewell
        this.shopkeeper?.farewellPlayer();
    }
    
    showShopUI() {
        // Create shop UI
        this.createShopModal();
    }
    
    createShopModal() {
        // Remove existing shop modal
        const existingModal = document.getElementById('shopModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create shop modal
        const modal = document.createElement('div');
        modal.id = 'shopModal';
        modal.className = 'shop-modal';
        modal.innerHTML = this.generateShopHTML();
        
        document.body.appendChild(modal);
        
        // Setup event handlers
        this.setupShopEventHandlers();
        
        // Show modal
        modal.classList.add('active');
    }
    
    generateShopHTML() {
        return `
            <div class="shop-content">
                <div class="shop-header">
                    <h2>${this.name}</h2>
                    <div class="player-tokens">
                        <span class="token-icon">🪙</span>
                        <span id="shopPlayerTokens">${this.shopUIData.playerTokens}</span>
                    </div>
                    <button id="closeShop" class="close-shop">✕</button>
                </div>
                
                <div class="shop-inventory">
                    ${this.generateInventoryHTML()}
                </div>
                
                <div class="shop-footer">
                    <div class="shopkeeper-dialogue">
                        <p id="shopkeeperText">Welcome! Take a look at my wares.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateInventoryHTML() {
        return this.inventory.map(item => {
            const canAfford = this.shopUIData.playerTokens >= item.price;
            const inStock = item.stock > 0;
            const meetsRequirements = this.checkRequirements(item.requirements);
            
            const available = canAfford && inStock && meetsRequirements;
            
            return `
                <div class="shop-item ${available ? 'available' : 'unavailable'}" data-item-id="${item.id}">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="item-details">
                            <span class="price">🪙 ${item.price}</span>
                            <span class="stock">Stock: ${item.stock}</span>
                        </div>
                    </div>
                    <button class="buy-button" ${available ? '' : 'disabled'} data-item-id="${item.id}">
                        ${available ? 'Buy' : (inStock ? (canAfford ? 'Requirements not met' : 'Not enough tokens') : 'Out of stock')}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    checkRequirements(requirements) {
        if (!requirements || requirements.length === 0) return true;
        
        const playerData = this.game.getPlayerData();
        
        return requirements.every(req => {
            switch (req) {
                case 'completed_temple':
                    return playerData.completedTemples > 0;
                default:
                    return true;
            }
        });
    }
    
    setupShopEventHandlers() {
        // Close shop button
        document.getElementById('closeShop')?.addEventListener('click', () => {
            this.closeShop();
        });
        
        // Buy buttons
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                this.purchaseItem(itemId);
            });
        });
        
        // Item hover effects
        document.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('mouseenter', (event) => {
                const itemId = event.currentTarget.dataset.itemId;
                this.showItemTooltip(itemId);
            });
            
            item.addEventListener('mouseleave', () => {
                this.hideItemTooltip();
            });
        });
    }
    
    purchaseItem(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        // Check if player can afford item
        if (player.tokens < item.price) {
            this.showShopMessage('Not enough tokens!', 'error');
            return;
        }
        
        // Check stock
        if (item.stock <= 0) {
            this.showShopMessage('Item out of stock!', 'error');
            return;
        }
        
        // Check requirements
        if (!this.checkRequirements(item.requirements)) {
            this.showShopMessage('Requirements not met!', 'error');
            return;
        }
        
        // Process purchase
        if (this.processPurchase(player, item)) {
            this.showShopMessage(`Purchased ${item.name}!`, 'success');
            
            // Update shop UI
            this.updateShopUI();
            
            // Play purchase sound
            this.game.audioManager?.playUISound('purchase');
            
            // Shopkeeper response
            this.shopkeeper?.onItemPurchased(item);
        }
    }
    
    processPurchase(player, item) {
        // Deduct tokens
        if (!player.spendTokens(item.price)) {
            return false;
        }
        
        // Add item to player inventory
        let success = false;
        
        if (item.type === 'weapon') {
            success = player.inventory.addWeapon(item.id);
        } else if (item.type === 'consumable') {
            success = player.inventory.addConsumable(item.id, 1);
        }
        
        if (success) {
            // Reduce shop stock
            item.stock--;
            
            // Update player token display
            this.shopUIData.playerTokens = player.tokens;
            
            return true;
        } else {
            // Refund tokens if item couldn't be added
            player.addTokens(item.price);
            this.showShopMessage('Inventory full!', 'error');
            return false;
        }
    }
    
    showItemTooltip(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        // Create tooltip with detailed item info
        // This would be implemented with a proper tooltip system
        console.log(`📋 Item tooltip: ${item.name} - ${item.description}`);
    }
    
    hideItemTooltip() {
        // Hide item tooltip
    }
    
    showShopMessage(message, type = 'info') {
        const shopkeeperText = document.getElementById('shopkeeperText');
        if (shopkeeperText) {
            shopkeeperText.textContent = message;
            shopkeeperText.className = `message-${type}`;
            
            // Reset message after 3 seconds
            setTimeout(() => {
                shopkeeperText.textContent = 'Anything else you need?';
                shopkeeperText.className = '';
            }, 3000);
        }
    }
    
    updateShopUI() {
        // Update token display
        const tokenDisplay = document.getElementById('shopPlayerTokens');
        if (tokenDisplay) {
            tokenDisplay.textContent = this.shopUIData.playerTokens;
        }
        
        // Update inventory display
        const inventoryContainer = document.querySelector('.shop-inventory');
        if (inventoryContainer) {
            inventoryContainer.innerHTML = this.generateInventoryHTML();
            this.setupShopEventHandlers();
        }
    }
    
    hideShopUI() {
        const modal = document.getElementById('shopModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    // Shop management
    restockInventory() {
        console.log(`🏪 Restocking ${this.name}...`);
        
        // Restock items
        this.inventory.forEach(item => {
            const maxStock = this.getMaxStock(item.id);
            item.stock = Math.min(item.stock + 1, maxStock);
        });
        
        // Add new items occasionally
        if (Math.random() < 0.3) {
            this.addSpecialItems();
        }
    }
    
    getMaxStock(itemId) {
        const maxStocks = {
            'health_potion': 10,
            'energy_drink': 8,
            'food_ration': 20,
            'magic_crystal': 2,
            'blaster': 1,
            'sword': 1,
            'grappling_hook': 1
        };
        
        return maxStocks[itemId] || 5;
    }
    
    addSpecialItems() {
        // Add rare or special items occasionally
        const specialItems = [
            {
                id: 'rare_crystal',
                name: 'Rare Crystal',
                type: 'consumable',
                price: 500,
                description: 'An extremely rare crystal with powerful properties',
                icon: '💎',
                stock: 1,
                requirements: ['completed_temple']
            }
        ];
        
        specialItems.forEach(item => {
            if (!this.inventory.find(i => i.id === item.id)) {
                this.inventory.push(item);
                console.log(`🏪 Added special item: ${item.name}`);
            }
        });
    }
    
    // Update methods
    update(deltaTime) {
        // Update restock timer
        this.restockTimer += deltaTime;
        
        if (this.restockTimer >= this.restockInterval) {
            this.restockInventory();
            this.restockTimer = 0;
        }
        
        // Update shopkeeper
        this.shopkeeper?.update(deltaTime);
    }
    
    // Cleanup
    dispose() {
        if (this.mesh) {
            this.game.gameEngine.removeFromScene(this.mesh);
        }
        
        // Close shop UI if open
        this.hideShopUI();
        
        console.log(`🏪 ${this.name} disposed`);
    }
}

// Shopkeeper NPC
class ShopkeeperNPC {
    constructor(game, shop) {
        this.game = game;
        this.shop = shop;
        this.mesh = null;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create shopkeeper (melon-like character)
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(1.2, 16, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0x90EE90 // Light green
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        
        // Apron (for shopkeeper look)
        const apronGeometry = new THREE.PlaneGeometry(2, 1.5);
        const apronMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9
        });
        const apron = new THREE.Mesh(apronGeometry, apronMaterial);
        apron.position.set(0, 1, 1.3);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 1.4, 1);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 1.4, 1);
        
        group.add(body);
        group.add(apron);
        group.add(leftEye);
        group.add(rightEye);
        
        this.mesh = group;
        this.mesh.userData = { isNPC: true, npc: this };
    }
    
    setPosition(x, y, z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }
    
    greetPlayer() {
        const greetings = [
            'Welcome to my shop!',
            'What can I help you find today?',
            'Take a look at my finest wares!',
            'Everything you need for your adventure!'
        ];
        
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        console.log(`🍈 Shopkeeper: ${greeting}`);
        
        // Show dialogue
        this.game.uiManager?.showDialogue('Shopkeeper', greeting);
    }
    
    farewellPlayer() {
        const farewells = [
            'Thank you for your business!',
            'Come back anytime!',
            'Safe travels!',
            'May your journey be successful!'
        ];
        
        const farewell = farewells[Math.floor(Math.random() * farewells.length)];
        console.log(`🍈 Shopkeeper: ${farewell}`);
    }
    
    onItemPurchased(item) {
        const responses = [
            `Excellent choice! The ${item.name} will serve you well.`,
            `A wise purchase! You won't regret buying the ${item.name}.`,
            `That's one of my favorites! The ${item.name} is top quality.`,
            `Good eye! The ${item.name} is perfect for adventurers like you.`
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        console.log(`🍈 Shopkeeper: ${response}`);
    }
    
    update(deltaTime) {
        // Shopkeeper idle animations
        if (this.mesh) {
            const time = Date.now() * 0.001;
            const bobAmount = Math.sin(time * 2) * 0.05;
            this.mesh.position.y = bobAmount;
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shop;
}
