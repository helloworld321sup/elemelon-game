/**
 * Player - Main player character controller for Elemelon
 * Handles movement, camera, weapons, health, and interactions
 */

class Player {
    constructor(game) {
        this.game = game;
        this.gameEngine = game.gameEngine;
        this.inputManager = game.inputManager;
        
        // Player state
        this.position = new THREE.Vector3(0, 2, 10);
        this.velocity = new THREE.Vector3();
        this.health = 8; // 8 hearts
        
        // Initialize player on terrain after position is set
        this.initializeOnTerrain();
        this.tokens = 20;
        
        // Movement properties
        this.speed = 10;
        this.jumpSpeed = 8;
        this.runMultiplier = 2.0; // Increased sprint speed
        this.isGrounded = true;
        this.gravity = -25;
        
        // Stamina system
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaDrainRate = 30; // Stamina per second when sprinting
        this.staminaRegenRate = 20; // Stamina per second when not sprinting
        this.minStaminaToSprint = 10; // Minimum stamina needed to start sprinting
        
        // Camera properties
        this.camera = null;
        this.cameraHeight = 1.8;
        this.mouseSensitivity = 0.002;
        
        // Weapons and inventory
        this.weapons = [null, null, null];
        this.activeWeapon = 0;
        this.consumables = Array(12).fill(null);
        
        // Interaction
        this.interactionRange = 5;
        this.nearbyInteractables = [];
        
        // Physics
        this.collisionObjects = [];
        this.raycaster = new THREE.Raycaster();
        
        // Player mesh (for third-person view or multiplayer)
        this.mesh = null;
    }
    
    async init() {
        console.log('👤 Initializing Player...');
        
        // Setup camera
        this.camera = this.gameEngine.camera;
        this.setupCamera();
        
        // Create player mesh (invisible in first person, but useful for collisions)
        this.createPlayerMesh();
        
        // Initialize weapons
        this.initializeWeapons();
        
        // Setup collision detection
        this.setupCollisionDetection();
        
        console.log('👤 Player initialized');
    }
    
    setupCamera() {
        // Position camera at player position
        this.camera.position.copy(this.position);
        this.camera.position.y += this.cameraHeight;
    }
    
    createPlayerMesh() {
        // Create invisible collision capsule for player
        const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
        const material = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0 // Invisible
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add to scene for collision detection
        this.gameEngine.addToScene(this.mesh);
    }
    
    initializeWeapons() {
        // Player starts with no weapons - must buy from shops
        this.weapons = [null, null, null];
        this.activeWeapon = 0;
    }
    
    setupCollisionDetection() {
        // Get collision objects from scene manager
        if (this.game.sceneManager) {
            this.collisionObjects = [
                ...this.game.sceneManager.cityObjects,
                ...this.game.sceneManager.temples,
                ...this.game.sceneManager.shops
            ];
        }
    }
    
    update(deltaTime) {
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update camera
        this.updateCamera();
        
        // Update interactions
        this.updateInteractions();
        
        // Update weapons
        this.updateWeapons(deltaTime);
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
    
    updateMovement(deltaTime) {
        if (!this.inputManager) return;
        
        const input = this.inputManager.getMovementInput();
        const camera = this.camera;
        
        // Calculate movement direction based on camera
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        camera.getWorldDirection(direction);
        direction.y = 0; // Keep movement horizontal
        direction.normalize();
        
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));
        right.normalize();
        
        // Calculate movement vector
        const movement = new THREE.Vector3();
        
        if (input.forward) movement.add(direction);
        if (input.backward) movement.sub(direction);
        if (input.left) movement.sub(right);
        if (input.right) movement.add(right);
        
        // Normalize diagonal movement
        if (movement.length() > 0) {
            movement.normalize();
        }
        
        // Handle stamina and sprinting
        const isTryingToSprint = input.running;
        const canSprint = this.stamina >= this.minStaminaToSprint;
        const isSprinting = isTryingToSprint && canSprint && movement.length() > 0;
        
        // Update stamina
        if (isSprinting) {
            this.stamina -= this.staminaDrainRate * deltaTime;
            this.stamina = Math.max(0, this.stamina);
        } else {
            this.stamina += this.staminaRegenRate * deltaTime;
            this.stamina = Math.min(this.maxStamina, this.stamina);
        }
        
        // Update stamina UI
        this.updateStaminaUI();
        
        // Apply speed
        let currentSpeed = this.speed;
        if (isSprinting) {
            currentSpeed *= this.runMultiplier;
        }
        
        movement.multiplyScalar(currentSpeed * deltaTime);
        
        // Check collision with scene manager
        if (this.game.sceneManager && movement.length() > 0) {
            const validMovement = this.game.sceneManager.getValidMovement(this.position, movement);
            movement.copy(validMovement);
        }
        
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Handle jumping
        if (input.jump && this.isGrounded) {
            this.velocity.y = this.jumpSpeed;
            this.isGrounded = false;
        }
        
        // Combine horizontal movement with vertical velocity
        const finalMovement = movement.clone();
        finalMovement.y = this.velocity.y * deltaTime;
        
        // Apply collision detection
        const newPosition = this.position.clone().add(finalMovement);
        
        if (this.checkCollision(newPosition)) {
            // Handle collision - slide along surfaces
            newPosition.copy(this.handleCollision(this.position, finalMovement));
        }
        
        // Update position
        this.position.copy(newPosition);
        
        // Ground check
        this.checkGrounded();
        
        // Keep player in world bounds
        this.enforceWorldBounds();
    }
    
    updateCamera() {
        // Update camera position to follow player
        this.camera.position.x = this.position.x;
        this.camera.position.y = this.position.y + this.cameraHeight;
        this.camera.position.z = this.position.z;
        
        // Mouse look is handled by PointerLockControls in InputManager
    }
    
    updateInteractions() {
        // Find nearby interactable objects
        this.nearbyInteractables = this.game.sceneManager?.getNearbyInteractables(
            this.position, 
            this.interactionRange
        ) || [];
        
        // Update UI with interaction prompts
        if (this.nearbyInteractables.length > 0) {
            this.game.uiManager?.showInteractionPrompt(this.nearbyInteractables[0]);
        } else {
            this.game.uiManager?.hideInteractionPrompt();
        }
    }
    
    updateWeapons(deltaTime) {
        // Update active weapon
        const weapon = this.weapons[this.activeWeapon];
        if (weapon) {
            weapon.update(deltaTime);
        }
    }
    
    checkCollision(newPosition) {
        // Simple collision detection with buildings and objects
        const playerRadius = 0.5;
        
        for (const object of this.collisionObjects) {
            if (object && object.position) {
                const distance = newPosition.distanceTo(object.position);
                const minDistance = playerRadius + (object.userData.radius || 5);
                
                if (distance < minDistance) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    handleCollision(currentPos, movement) {
        // Simple collision response - stop movement
        return currentPos.clone();
    }
    
    checkGrounded() {
        // Get terrain height at current position
        const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
        const playerBottom = this.position.y - 1; // Player is 2 units tall, so bottom is at y-1
        
        // Check if player is close to terrain
        this.isGrounded = playerBottom <= terrainHeight + 0.1;
        
        // Snap to terrain if grounded or falling below it
        if (this.isGrounded || this.position.y < terrainHeight + 1) {
            this.position.y = terrainHeight + 1; // Keep player 1 unit above terrain
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
            }
            this.isGrounded = true;
        }
    }
    
    getTerrainHeight(x, z) {
        // Calculate terrain height using same formula as terrain generation
        const scale1 = 0.02;
        const scale2 = 0.05;
        const scale3 = 0.1;
        
        const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 15;
        const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 8;
        const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 3;
        
        return height1 + height2 + height3;
    }
    
    initializeOnTerrain() {
        // Set player to correct height on terrain
        const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
        this.position.y = terrainHeight + 2; // Player height + buffer
        this.isGrounded = true;
        console.log(`👤 Player initialized on terrain at height: ${this.position.y}`);
    }
    
    updateStaminaUI() {
        // Update sprint bar UI
        const sprintBarFill = document.getElementById('sprintBarFill');
        const sprintText = document.getElementById('sprintText');
        
        if (sprintBarFill) {
            const staminaPercent = (this.stamina / this.maxStamina) * 100;
            sprintBarFill.style.width = `${staminaPercent}%`;
            
            // Change color based on stamina level
            if (staminaPercent < 25) {
                sprintBarFill.style.background = '#ff4444'; // Red when low
            } else if (staminaPercent < 50) {
                sprintBarFill.style.background = '#ffaa44'; // Orange when medium
            } else {
                sprintBarFill.style.background = '#44ff44'; // Green when high
            }
        }
        
        if (sprintText) {
            sprintText.textContent = `${Math.round(this.stamina)}%`;
        }
    }
    
    enforceWorldBounds() {
        // Keep player within world boundaries
        const worldSize = 500;
        
        this.position.x = Math.max(-worldSize, Math.min(worldSize, this.position.x));
        this.position.z = Math.max(-worldSize, Math.min(worldSize, this.position.z));
        this.position.y = Math.max(0, this.position.y); // Don't fall through ground
    }
    
    // Action methods
    primaryAction() {
        const weapon = this.weapons[this.activeWeapon];
        if (weapon) {
            weapon.primaryFire();
        } else {
            // No weapon - maybe punch or interact
            this.interact();
        }
    }
    
    secondaryAction() {
        const weapon = this.weapons[this.activeWeapon];
        if (weapon) {
            weapon.secondaryFire();
        }
    }
    
    interact() {
        if (this.nearbyInteractables.length > 0) {
            const target = this.nearbyInteractables[0];
            this.game.sceneManager?.handleInteraction(target);
        }
    }
    
    // Weapon management
    equipWeapon(weaponType, slot) {
        if (slot >= 0 && slot < 3) {
            // Create weapon based on type
            let weapon = null;
            
            switch (weaponType) {
                case 'blaster':
                    weapon = new BlasterWeapon(this.game);
                    break;
                case 'sword':
                    weapon = new SwordWeapon(this.game);
                    break;
                case 'grappling_hook':
                    weapon = new GrapplingHookWeapon(this.game);
                    break;
            }
            
            if (weapon) {
                this.weapons[slot] = weapon;
                console.log(`🔫 Equipped ${weaponType} in slot ${slot + 1}`);
                
                // Update UI
                this.game.uiManager?.updateWeaponSlot(slot, weaponType);
            }
        }
    }
    
    switchWeapon(slot) {
        if (slot >= 0 && slot < 3 && this.weapons[slot]) {
            this.activeWeapon = slot;
            console.log(`🔄 Switched to weapon slot ${slot + 1}`);
            
            // Update UI
            this.game.uiManager?.updateWeaponSelection(slot);
        }
    }
    
    // Health and damage
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log(`💔 Player took ${amount} damage. Health: ${this.health}/8`);
        
        // Update UI
        this.game.uiManager?.updateHealth(this.health);
        
        // Check if player died
        if (this.health <= 0) {
            this.die();
        }
    }
    
    heal(amount) {
        this.health = Math.min(8, this.health + amount);
        console.log(`💚 Player healed ${amount}. Health: ${this.health}/8`);
        
        // Update UI
        this.game.uiManager?.updateHealth(this.health);
    }
    
    die() {
        console.log('💀 Player died!');
        // TODO: Implement death screen and respawn
        alert('💀 You died! Game over...');
        this.game.quitToMenu();
    }
    
    // Token management
    addTokens(amount) {
        this.tokens += amount;
        console.log(`🪙 Gained ${amount} tokens. Total: ${this.tokens}`);
        
        // Update UI
        this.game.uiManager?.updateTokens(this.tokens);
    }
    
    spendTokens(amount) {
        if (this.tokens >= amount) {
            this.tokens -= amount;
            console.log(`💸 Spent ${amount} tokens. Remaining: ${this.tokens}`);
            
            // Update UI
            this.game.uiManager?.updateTokens(this.tokens);
            return true;
        }
        
        console.log(`❌ Not enough tokens! Need ${amount}, have ${this.tokens}`);
        return false;
    }
    
    // Consumable management
    useConsumable(slot) {
        if (slot >= 0 && slot < 12 && this.consumables[slot]) {
            const item = this.consumables[slot];
            
            // Apply item effect
            if (item.type === 'health') {
                this.heal(item.amount);
            } else if (item.type === 'energy') {
                // TODO: Implement energy system
            }
            
            // Remove item from inventory
            item.count--;
            if (item.count <= 0) {
                this.consumables[slot] = null;
            }
            
            // Update UI
            this.game.uiManager?.updateConsumableSlot(slot, this.consumables[slot]);
        }
    }
    
    // Position and movement controls
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.setupCamera();
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    enableControls() {
        // Enable player controls
        console.log('🎮 Player controls enabled');
    }
    
    disableControls() {
        // Disable player controls
        console.log('🎮 Player controls disabled');
    }
    
    // Save/load data
    getSaveData() {
        return {
            position: this.position.toArray(),
            health: this.health,
            tokens: this.tokens,
            weapons: this.weapons.map(w => w ? w.type : null),
            activeWeapon: this.activeWeapon,
            consumables: this.consumables
        };
    }
    
    loadSaveData(data) {
        this.position.fromArray(data.position);
        this.health = data.health;
        this.tokens = data.tokens;
        this.activeWeapon = data.activeWeapon;
        this.consumables = data.consumables;
        
        // Restore weapons
        data.weapons.forEach((weaponType, slot) => {
            if (weaponType) {
                this.equipWeapon(weaponType, slot);
            }
        });
        
        this.setupCamera();
    }
}

// Weapon classes (basic implementations)
class BlasterWeapon {
    constructor(game) {
        this.game = game;
        this.type = 'blaster';
        this.ammo = 100;
        this.fireRate = 0.2; // Seconds between shots
        this.lastFire = 0;
    }
    
    update(deltaTime) {
        this.lastFire += deltaTime;
    }
    
    primaryFire() {
        if (this.lastFire >= this.fireRate && this.ammo > 0) {
            console.log('🔫 Blaster fired!');
            this.ammo--;
            this.lastFire = 0;
            
            // TODO: Create projectile and damage system
        }
    }
    
    secondaryFire() {
        // Charged shot
        console.log('🔫 Blaster charged shot!');
    }
}

class SwordWeapon {
    constructor(game) {
        this.game = game;
        this.type = 'sword';
        this.damage = 2;
        this.range = 3;
        this.attackCooldown = 0.8;
        this.lastAttack = 0;
    }
    
    update(deltaTime) {
        this.lastAttack += deltaTime;
    }
    
    primaryFire() {
        if (this.lastAttack >= this.attackCooldown) {
            console.log('⚔️ Sword slash!');
            this.lastAttack = 0;
            
            // TODO: Implement melee attack system
        }
    }
    
    secondaryFire() {
        // Heavy attack
        console.log('⚔️ Sword heavy attack!');
    }
}

class GrapplingHookWeapon {
    constructor(game) {
        this.game = game;
        this.type = 'grappling_hook';
        this.range = 20;
        this.isGrappling = false;
    }
    
    update(deltaTime) {
        // Update grappling physics
    }
    
    primaryFire() {
        if (!this.isGrappling) {
            console.log('🪝 Grappling hook fired!');
            this.isGrappling = true;
            
            // TODO: Implement grappling hook physics
        }
    }
    
    secondaryFire() {
        // Release hook
        console.log('🪝 Grappling hook released!');
        this.isGrappling = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
