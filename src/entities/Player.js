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
        this.speed = 12; // Increased base speed
        this.jumpSpeed = 10;
        this.runMultiplier = 1.8; // More balanced sprint speed
        this.isGrounded = true;
        this.gravity = -30;
        this.acceleration = 50; // Add acceleration for smoother movement
        this.deceleration = 30; // Add deceleration
        this.currentVelocity = new THREE.Vector3(); // Current movement velocity
        
        // Stamina system
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaDrainRate = 30; // Stamina per second when sprinting
        this.staminaRegenRate = 20; // Stamina per second when not sprinting
        this.minStaminaToSprint = 10; // Minimum stamina needed to start sprinting
        
        // Camera properties
        this.camera = null;
        this.cameraHeight = 1.8;
        this.mouseSensitivity = 0.003; // Slightly more responsive
        this.cameraPitch = 0; // Track vertical camera rotation
        this.maxPitch = Math.PI / 3; // Limit vertical look range
        this.minPitch = -Math.PI / 3;
        
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
        // Player starts with a basic blaster for testing
        this.weapons = [new BlasterWeapon(this.game), null, null];
        this.activeWeapon = 0;
        
        // Update UI to show equipped weapon
        this.game.uiManager?.updateWeaponSlot(0, 'blaster');
        this.game.uiManager?.updateWeaponSelection(0);
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
        
        // Calculate desired movement direction
        const desiredDirection = new THREE.Vector3();
        
        if (input.forward) desiredDirection.add(direction);
        if (input.backward) desiredDirection.sub(direction);
        if (input.left) desiredDirection.sub(right);
        if (input.right) desiredDirection.add(right);
        
        // Normalize diagonal movement
        if (desiredDirection.length() > 0) {
            desiredDirection.normalize();
        }
        
        // Handle stamina and sprinting
        const isTryingToSprint = input.running;
        const canSprint = this.stamina >= this.minStaminaToSprint;
        const isSprinting = isTryingToSprint && canSprint && desiredDirection.length() > 0;
        
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
        
        // Calculate target speed
        let targetSpeed = this.speed;
        if (isSprinting) {
            targetSpeed *= this.runMultiplier;
        }
        
        // Calculate target velocity
        const targetVelocity = desiredDirection.clone().multiplyScalar(targetSpeed);
        
        // Smooth acceleration/deceleration
        const accelerationRate = desiredDirection.length() > 0 ? this.acceleration : this.deceleration;
        this.currentVelocity.lerp(targetVelocity, accelerationRate * deltaTime);
        
        // Apply movement with smooth velocity
        const movement = this.currentVelocity.clone().multiplyScalar(deltaTime);
        
        // Check collision with scene manager
        if (this.game.sceneManager && movement.length() > 0) {
            const validMovement = this.game.sceneManager.getValidMovement(this.position, movement);
            movement.copy(validMovement);
        }
        
        // Apply horizontal movement first
        const horizontalMovement = movement.clone();
        horizontalMovement.y = 0; // No vertical movement yet
        
        // Check horizontal collision
        const newHorizontalPosition = this.position.clone().add(horizontalMovement);
        if (this.checkCollision(newHorizontalPosition)) {
            // Handle collision - slide along surfaces
            horizontalMovement.copy(this.handleCollision(this.position, horizontalMovement));
        }
        
        // Update horizontal position
        this.position.add(horizontalMovement);
        
        // Now handle vertical movement and terrain following
        const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
        const targetY = terrainHeight + 1; // Player should be 1 unit above terrain
        
        // Debug terrain following (remove this later)
        if (Math.random() < 0.01) { // Only log occasionally to avoid spam
            console.log(`🏔️ Player at (${this.position.x.toFixed(1)}, ${this.position.z.toFixed(1)}) - Terrain: ${terrainHeight.toFixed(2)}, Target Y: ${targetY.toFixed(2)}, Current Y: ${this.position.y.toFixed(2)}`);
        }
        
        // Handle jumping
        if (input.jump && this.isGrounded) {
            this.velocity.y = this.jumpSpeed;
            this.isGrounded = false;
        }
        
        // Apply gravity only if above terrain
        if (this.position.y > targetY || this.velocity.y > 0) {
            this.velocity.y += this.gravity * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            
            // Check if we've landed on terrain
            if (this.position.y <= targetY) {
                this.position.y = targetY;
                this.velocity.y = 0;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }
        } else {
            // Snap to terrain and stay grounded
            this.position.y = targetY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
        
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
    
    // checkGrounded method removed - terrain following now handled in updateMovement
    
    getTerrainHeight(x, z) {
        // Calculate terrain height using same formula as World.js terrain generation
        const scale1 = 0.01;
        const scale2 = 0.02;
        const scale3 = 0.05;
        
        const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 3;
        const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 1.5;
        const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 0.5;
        
        return (height1 + height2 + height3) * 0.3; // Match World.js scaling
    }
    
    initializeOnTerrain() {
        // Set player to correct height on terrain
        const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
        this.position.y = terrainHeight + 1; // Consistent with movement logic
        this.isGrounded = true;
        console.log(`👤 Player initialized on terrain at height: ${this.position.y} (terrain: ${terrainHeight})`);
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
            // No weapon - try to interact with nearby objects
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
            console.log('🔄 Interacting with:', target.userData?.type || 'unknown');
            
            // Handle different interaction types
            if (target.userData) {
                switch (target.userData.type) {
                    case 'token':
                        this.collectToken(target);
                        break;
                    case 'npc':
                        this.talkToNPC(target);
                        break;
                    case 'shop':
                        this.enterShop(target);
                        break;
                    case 'temple':
                        this.enterTemple(target);
                        break;
                    default:
                        this.game.sceneManager?.handleInteraction(target);
                }
            }
        }
    }
    
    collectToken(token) {
        const value = token.userData.value || 1;
        this.addTokens(value);
        
        // Remove token from scene
        this.game.gameEngine.removeFromScene(token);
        
        // Remove from world's collision groups
        const world = this.game.sceneManager;
        if (world && world.collisionGroups && world.collisionGroups.triggers) {
            const index = world.collisionGroups.triggers.indexOf(token);
            if (index > -1) {
                world.collisionGroups.triggers.splice(index, 1);
            }
        }
        
        console.log(`🪙 Collected ${value} tokens!`);
    }
    
    talkToNPC(npc) {
        console.log('💬 Talking to NPC...');
        
        // Show dialogue
        const dialogues = [
            "Welcome to the grey world, traveler!",
            "The temples hold great power, but beware their guardians.",
            "I've heard rumors of a way to restore color to our world.",
            "The shops have weapons that might help you on your journey.",
            "Dr. Hegesh's tower looms in the distance... avoid it for now."
        ];
        
        const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        this.game.uiManager?.showDialogue('Melon Citizen', randomDialogue);
    }
    
    enterShop(shop) {
        console.log('🏪 Entering shop...');
        this.game.uiManager?.showDialogue('Shop Keeper', 'Welcome to my shop! What can I get for you today?');
        // TODO: Implement shop interface
    }
    
    enterTemple(temple) {
        console.log('🏛️ Entering temple...');
        
        if (temple.userData.temple) {
            temple.userData.temple.onPlayerEnter(this);
        } else {
            this.game.uiManager?.showDialogue('Temple Guardian', `You have entered the ${temple.userData.type} temple. Prepare yourself for the trials ahead!`);
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
            
            // Create projectile
            this.createProjectile();
            
            // Play sound effect (when audio is enabled)
            // this.game.audioManager?.playSound('blaster_fire');
        }
    }
    
    createProjectile() {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        const startPos = player.getPosition().clone();
        startPos.y += 1.5; // Fire from chest height
        
        const direction = this.game.gameEngine.getCameraDirection();
        
        // Create projectile
        const projectile = new BlasterProjectile(this.game, startPos, direction);
        
        // Add to scene manager for updates
        if (this.game.sceneManager.projectiles) {
            this.game.sceneManager.projectiles.push(projectile);
        } else {
            this.game.sceneManager.projectiles = [projectile];
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

// Projectile system
class BlasterProjectile {
    constructor(game, startPos, direction) {
        this.game = game;
        this.position = startPos.clone();
        this.direction = direction.normalize();
        this.speed = 50;
        this.damage = 2;
        this.maxDistance = 100;
        this.traveledDistance = 0;
        this.isActive = true;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create projectile visual
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });
        
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.copy(this.position);
        
        this.game.gameEngine.addToScene(this.mesh);
        this.game.gameEngine.addToScene(this.glow);
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Move projectile
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.position.add(movement);
        this.traveledDistance += movement.length();
        
        // Update mesh positions
        this.mesh.position.copy(this.position);
        this.glow.position.copy(this.position);
        
        // Check for collisions
        this.checkCollisions();
        
        // Check max distance
        if (this.traveledDistance >= this.maxDistance) {
            this.destroy();
        }
    }
    
    checkCollisions() {
        // Simple collision detection with world objects
        const world = this.game.sceneManager;
        if (!world) return;
        
        // Check collision with NPCs
        if (world.npcs) {
            world.npcs.forEach(npc => {
                if (this.position.distanceTo(npc.position) < 2) {
                    this.hitTarget(npc);
                }
            });
        }
        
        // Check collision with buildings
        if (world.buildings) {
            world.buildings.forEach(building => {
                if (this.position.distanceTo(building.position) < 10) {
                    this.destroy();
                }
            });
        }
    }
    
    hitTarget(target) {
        console.log('🎯 Projectile hit target!');
        
        // Deal damage if target has health
        if (target.takeDamage) {
            target.takeDamage(this.damage);
        }
        
        // Create hit effect
        this.createHitEffect();
        
        this.destroy();
    }
    
    createHitEffect() {
        // Create simple hit effect
        const effectGeometry = new THREE.SphereGeometry(1, 8, 8);
        const effectMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        
        const effect = new THREE.Mesh(effectGeometry, effectMaterial);
        effect.position.copy(this.position);
        
        this.game.gameEngine.addToScene(effect);
        
        // Remove effect after short time
        setTimeout(() => {
            this.game.gameEngine.removeFromScene(effect);
        }, 200);
    }
    
    destroy() {
        this.isActive = false;
        
        if (this.mesh) {
            this.game.gameEngine.removeFromScene(this.mesh);
        }
        if (this.glow) {
            this.game.gameEngine.removeFromScene(this.glow);
        }
        
        // Remove from projectiles array
        const projectiles = this.game.sceneManager.projectiles;
        if (projectiles) {
            const index = projectiles.indexOf(this);
            if (index > -1) {
                projectiles.splice(index, 1);
            }
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
