/**
 * SceneManager - Manages different game scenes and 3D world
 * Handles scene transitions, world creation, and environment management
 */

class SceneManager {
    constructor(game) {
        this.game = game;
        this.gameEngine = game.gameEngine;
        
        // Scene objects
        this.world = null;
        this.player = null;
        this.npcs = [];
        this.enemies = [];
        
        // Environment objects
        this.cityObjects = [];
        this.temples = [];
        this.shops = [];
        
        // Current scene state
        this.currentScene = 'menu'; // menu, cutscene, gameplay
        this.isLoaded = false;
    }
    
    async init() {
        console.log('🌍 Initializing Scene Manager...');
        // Scene manager initialization
        this.isLoaded = true;
    }
    
    async createWorld() {
        console.log('🌍 Creating Elemelon World...');
        
        // Create the grey world environment
        this.createSkybox();
        this.createGround();
        this.createCity();
        this.createTemples();
        this.createShops();
        
        // Create player
        this.player = new Player(this.game);
        await this.player.init();
        
        // Create NPCs
        this.createNPCs();
        
        console.log('🌍 Elemelon World created successfully!');
    }
    
    createSkybox() {
        // Create grey skybox for the grey world
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x808080,
            side: THREE.BackSide,
            fog: false
        });
        
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.gameEngine.addToScene(skybox);
    }
    
    createGround() {
        // Create large ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x606060,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        
        this.gameEngine.addToScene(ground);
    }
    
    createCity() {
        console.log('🏙️ Creating city...');
        
        // Create city buildings
        this.createBuildings();
        this.createStreets();
        this.createLandmarks();
    }
    
    createBuildings() {
        const buildingCount = 200; // Much more buildings
        const citySize = 1000; // 5x larger world
        
        // Create collision detection array
        this.collisionObjects = this.collisionObjects || [];
        
        for (let i = 0; i < buildingCount; i++) {
            const building = this.createBuilding();
            
            // Random position within city bounds
            building.position.x = (Math.random() - 0.5) * citySize;
            building.position.z = (Math.random() - 0.5) * citySize;
            
            // Ensure buildings don't overlap with player spawn area
            if (building.position.x > -50 && building.position.x < 50 && 
                building.position.z > -50 && building.position.z < 50) {
                building.position.x += Math.sign(building.position.x) * 80;
                building.position.z += Math.sign(building.position.z) * 80;
            }
            
            // Add collision data
            building.userData.isCollidable = true;
            building.userData.boundingBox = new THREE.Box3().setFromObject(building);
            this.collisionObjects.push(building);
            
            this.cityObjects.push(building);
            this.gameEngine.addToScene(building);
        }
    }
    
    createBuilding() {
        // Random building dimensions
        const width = 5 + Math.random() * 10;
        const height = 10 + Math.random() * 30;
        const depth = 5 + Math.random() * 10;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.3) // Grey variations
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        return building;
    }
    
    createStreets() {
        // Create main streets in grid pattern
        const streetWidth = 4;
        const streetLength = 300;
        const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        
        // North-South streets
        for (let x = -100; x <= 100; x += 50) {
            const streetGeometry = new THREE.PlaneGeometry(streetWidth, streetLength);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(x, 0.1, 0);
            this.gameEngine.addToScene(street);
        }
        
        // East-West streets
        for (let z = -100; z <= 100; z += 50) {
            const streetGeometry = new THREE.PlaneGeometry(streetLength, streetWidth);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(0, 0.1, z);
            this.gameEngine.addToScene(street);
        }
    }
    
    createLandmarks() {
        // Create central fountain/monument
        const monumentGeometry = new THREE.CylinderGeometry(3, 5, 8, 8);
        const monumentMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
        monument.position.set(0, 4, 0);
        monument.castShadow = true;
        
        this.gameEngine.addToScene(monument);
        this.cityObjects.push(monument);
    }
    
    createTemples() {
        console.log('🏛️ Creating temples...');
        
        const templePositions = [
            { x: -150, z: -150, type: 'water', color: 0x4080ff },
            { x: 150, z: -150, type: 'lightning', color: 0xffff40 },
            { x: -150, z: 150, type: 'wind', color: 0x80ff80 },
            { x: 150, z: 150, type: 'fire', color: 0xff4040 }
        ];
        
        templePositions.forEach(pos => {
            const temple = this.createTemple(pos.type, pos.color);
            temple.position.set(pos.x, 0, pos.z);
            this.temples.push(temple);
            this.gameEngine.addToScene(temple);
        });
    }
    
    createTemple(type, color) {
        const templeGroup = new THREE.Group();
        
        // Main temple structure
        const templeGeometry = new THREE.BoxGeometry(20, 15, 20);
        const templeMaterial = new THREE.MeshLambertMaterial({ color: color });
        const templeMain = new THREE.Mesh(templeGeometry, templeMaterial);
        templeMain.position.y = 7.5;
        templeMain.castShadow = true;
        
        // Temple pillars
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, 15, 8);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        const pillarPositions = [
            { x: -8, z: -8 }, { x: 8, z: -8 },
            { x: -8, z: 8 }, { x: 8, z: 8 }
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, 7.5, pos.z);
            pillar.castShadow = true;
            templeGroup.add(pillar);
        });
        
        // Temple roof
        const roofGeometry = new THREE.ConeGeometry(15, 8, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: color });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 19;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        
        templeGroup.add(templeMain);
        templeGroup.add(roof);
        
        // Add temple data
        templeGroup.userData = { type: type, isTemple: true };
        
        return templeGroup;
    }
    
    createShops() {
        console.log('🏪 Creating shops...');
        
        const shopPositions = [
            { x: -50, z: 0, type: 'weapon' },
            { x: 50, z: 0, type: 'consumable' },
            { x: 0, z: -50, type: 'general' }
        ];
        
        shopPositions.forEach(pos => {
            const shop = this.createShop(pos.type);
            shop.position.set(pos.x, 0, pos.z);
            this.shops.push(shop);
            this.gameEngine.addToScene(shop);
        });
    }
    
    createShop(type) {
        const shopGroup = new THREE.Group();
        
        // Shop building
        const shopGeometry = new THREE.BoxGeometry(12, 8, 12);
        const shopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const shopBuilding = new THREE.Mesh(shopGeometry, shopMaterial);
        shopBuilding.position.y = 4;
        shopBuilding.castShadow = true;
        
        // Shop sign
        const signGeometry = new THREE.PlaneGeometry(8, 2);
        const signMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 6, 6.1);
        
        shopGroup.add(shopBuilding);
        shopGroup.add(sign);
        
        // Add shop data
        shopGroup.userData = { type: type, isShop: true };
        
        return shopGroup;
    }
    
    createNPCs() {
        console.log('🍈 Creating NPCs...');
        
        // Create melon NPCs around the city
        const npcCount = 20;
        for (let i = 0; i < npcCount; i++) {
            const npc = new NPC(this.game);
            
            // Random position in city
            const angle = (i / npcCount) * Math.PI * 2;
            const radius = 30 + Math.random() * 80;
            
            npc.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            this.npcs.push(npc);
            this.gameEngine.addToScene(npc.mesh);
        }
    }
    
    startGameplayScene() {
        console.log('🎮 Starting gameplay scene...');
        this.currentScene = 'gameplay';
        
        // Position player at spawn point
        if (this.player) {
            this.player.setPosition(0, 2, 10);
        }
        
        // Start game systems
        this.startGameSystems();
    }
    
    startGameSystems() {
        // Initialize UI
        this.game.uiManager.showGameUI();
        
        // Start NPC behaviors
        this.npcs.forEach(npc => npc.startBehavior());
        
        // Enable player controls
        if (this.player) {
            this.player.enableControls();
        }
    }
    
    update(deltaTime) {
        if (this.currentScene !== 'gameplay') return;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Update world systems
        this.updateWorldSystems(deltaTime);
    }
    
    updateWorldSystems(deltaTime) {
        // Update temple effects
        this.temples.forEach(temple => {
            if (temple.userData.type) {
                // Add subtle temple glow animation
                temple.children.forEach(child => {
                    if (child.material) {
                        const time = Date.now() * 0.001;
                        const intensity = 0.8 + Math.sin(time) * 0.2;
                        child.material.emissive = new THREE.Color(child.material.color).multiplyScalar(intensity * 0.1);
                    }
                });
            }
        });
    }
    
    // Interaction methods
    getNearbyInteractables(position, radius = 5) {
        const interactables = [];
        
        // Check temples
        this.temples.forEach(temple => {
            if (position.distanceTo(temple.position) <= radius) {
                interactables.push(temple);
            }
        });
        
        // Check shops
        this.shops.forEach(shop => {
            if (position.distanceTo(shop.position) <= radius) {
                interactables.push(shop);
            }
        });
        
        // Check NPCs
        this.npcs.forEach(npc => {
            if (position.distanceTo(npc.position) <= radius) {
                interactables.push(npc);
            }
        });
        
        return interactables;
    }
    
    handleInteraction(object) {
        if (object.userData.isTemple) {
            this.enterTemple(object.userData.type);
        } else if (object.userData.isShop) {
            this.enterShop(object.userData.type);
        } else if (object.userData.isNPC) {
            this.talkToNPC(object);
        }
    }
    
    enterTemple(type) {
        console.log(`🏛️ Entering ${type} temple...`);
        // TODO: Implement temple entrance
        alert(`🏛️ Welcome to the ${type} temple! Temple puzzles and boss battles coming soon...`);
    }
    
    enterShop(type) {
        console.log(`🏪 Entering ${type} shop...`);
        // TODO: Implement shop interface
        alert(`🏪 Welcome to the ${type} shop! Shopping system coming soon...`);
    }
    
    talkToNPC(npc) {
        console.log('🍈 Talking to NPC...');
        // TODO: Implement dialogue system
        alert('🍈 Melon NPC: "Welcome to the grey world! Find the elemental temples to restore color!"');
    }
    
    // Scene transition methods
    switchToScene(sceneName) {
        this.currentScene = sceneName;
        console.log(`🎬 Switched to ${sceneName} scene`);
    }
    
    // Collision Detection System
    checkCollision(playerPosition, movementVector) {
        const playerRadius = 1.5; // Player collision radius
        const newPosition = playerPosition.clone().add(movementVector);
        
        // Create player bounding box
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            newPosition,
            new THREE.Vector3(playerRadius * 2, 4, playerRadius * 2)
        );
        
        // Check collision with all collidable objects
        for (const object of this.collisionObjects || []) {
            if (object.userData.boundingBox && object.userData.boundingBox.intersectsBox(playerBox)) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    getValidMovement(playerPosition, desiredMovement) {
        // Try the full movement first
        if (!this.checkCollision(playerPosition, desiredMovement)) {
            return desiredMovement;
        }
        
        // Try sliding along walls - check X and Z movement separately
        const xMovement = new THREE.Vector3(desiredMovement.x, 0, 0);
        const zMovement = new THREE.Vector3(0, 0, desiredMovement.z);
        
        let validMovement = new THREE.Vector3();
        
        // Try X movement
        if (!this.checkCollision(playerPosition, xMovement)) {
            validMovement.add(xMovement);
        }
        
        // Try Z movement
        if (!this.checkCollision(playerPosition, zMovement)) {
            validMovement.add(zMovement);
        }
        
        return validMovement;
    }
    
    // Cleanup
    dispose() {
        // Clean up all scene objects
        this.cityObjects = [];
        this.temples = [];
        this.shops = [];
        this.npcs = [];
        this.enemies = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneManager;
}
