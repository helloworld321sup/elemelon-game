/**
 * Enemy - Enemy entities for Elemelon
 * Base class for temple bosses and hostile creatures
 */

class Enemy {
    constructor(game, type = 'basic') {
        this.game = game;
        this.type = type;
        
        // Enemy properties
        this.position = new THREE.Vector3();
        this.mesh = null;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.speed = 3;
        
        // AI properties
        this.target = null;
        this.attackRange = 3;
        this.detectionRange = 15;
        this.isAggressive = false;
        this.lastAttack = 0;
        this.attackCooldown = 2;
        
        // State
        this.state = 'idle'; // idle, chasing, attacking, dead
        
        this.createMesh();
    }
    
    createMesh() {
        // Create basic enemy mesh based on type
        const group = new THREE.Group();
        
        if (this.type === 'temple_boss') {
            this.createBossMesh(group);
        } else {
            this.createBasicEnemyMesh(group);
        }
        
        this.mesh = group;
        this.mesh.userData = { isEnemy: true, enemy: this };
    }
    
    createBasicEnemyMesh(group) {
        // Create basic hostile creature
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x800000 }); // Dark red
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        
        // Spikes
        for (let i = 0; i < 6; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.2, 0.8, 4);
            const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0x400000 });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            spike.position.set(
                Math.cos(angle) * 0.8,
                1.5,
                Math.sin(angle) * 0.8
            );
            spike.castShadow = true;
            
            group.add(spike);
        }
        
        // Glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 1.5, 0.7);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 1.5, 0.7);
        
        group.add(body);
        group.add(leftEye);
        group.add(rightEye);
    }
    
    createBossMesh(group) {
        // Create larger, more intimidating boss
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 3;
        this.speed = 2;
        this.attackRange = 5;
        
        // Main body - larger and more detailed
        const bodyGeometry = new THREE.BoxGeometry(3, 4, 3);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x400040 // Dark purple
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2;
        body.castShadow = true;
        
        // Boss crown/horns
        const hornGeometry = new THREE.ConeGeometry(0.5, 2, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x800080 });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-1, 4.5, 0);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(1, 4.5, 0);
        
        // Glowing core
        const coreGeometry = new THREE.SphereGeometry(0.5, 12, 12);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 2;
        
        group.add(body);
        group.add(leftHorn);
        group.add(rightHorn);
        group.add(core);
    }
    
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
    
    update(deltaTime) {
        this.updateAI(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateAttackCooldown(deltaTime);
    }
    
    updateAI(deltaTime) {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        const distanceToPlayer = this.position.distanceTo(player.position);
        
        // State machine
        switch (this.state) {
            case 'idle':
                if (distanceToPlayer <= this.detectionRange) {
                    this.state = 'chasing';
                    this.target = player;
                }
                break;
                
            case 'chasing':
                if (distanceToPlayer > this.detectionRange * 1.5) {
                    this.state = 'idle';
                    this.target = null;
                } else if (distanceToPlayer <= this.attackRange) {
                    this.state = 'attacking';
                } else {
                    this.moveTowardsTarget(deltaTime);
                }
                break;
                
            case 'attacking':
                if (distanceToPlayer > this.attackRange) {
                    this.state = 'chasing';
                } else {
                    this.attackTarget();
                }
                break;
        }
    }
    
    moveTowardsTarget(deltaTime) {
        if (!this.target) return;
        
        const direction = this.target.position.clone().sub(this.position);
        direction.y = 0; // Keep movement horizontal
        direction.normalize();
        direction.multiplyScalar(this.speed * deltaTime);
        
        this.position.add(direction);
        
        // Face target
        if (this.mesh) {
            this.mesh.lookAt(this.target.position);
            this.mesh.position.copy(this.position);
        }
    }
    
    attackTarget() {
        if (this.lastAttack <= 0) {
            console.log(`👹 ${this.type} attacks!`);
            
            // Deal damage to player
            if (this.target && this.target.takeDamage) {
                this.target.takeDamage(this.damage);
            }
            
            this.lastAttack = this.attackCooldown;
            
            // Attack animation
            this.playAttackAnimation();
        }
    }
    
    updateAttackCooldown(deltaTime) {
        if (this.lastAttack > 0) {
            this.lastAttack -= deltaTime;
        }
    }
    
    updateAnimation(deltaTime) {
        if (!this.mesh) return;
        
        const time = Date.now() * 0.001;
        
        // Idle breathing animation
        if (this.state === 'idle') {
            const breathe = Math.sin(time * 2) * 0.05;
            this.mesh.scale.y = 1 + breathe;
        }
        
        // Aggressive pulsing when chasing/attacking
        if (this.state === 'chasing' || this.state === 'attacking') {
            const pulse = Math.sin(time * 8) * 0.1;
            this.mesh.scale.setScalar(1 + pulse);
            
            // Glowing effect
            this.mesh.children.forEach(child => {
                if (child.material && child.material.emissive) {
                    const intensity = 0.5 + Math.sin(time * 6) * 0.3;
                    child.material.emissiveIntensity = intensity;
                }
            });
        }
    }
    
    playAttackAnimation() {
        if (!this.mesh) return;
        
        // Quick scale animation for attack
        const originalScale = this.mesh.scale.clone();
        
        this.mesh.scale.multiplyScalar(1.3);
        
        setTimeout(() => {
            if (this.mesh) {
                this.mesh.scale.copy(originalScale);
            }
        }, 200);
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log(`👹 ${this.type} took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
        
        // Damage flash effect
        this.playDamageEffect();
        
        // Become aggressive when damaged
        this.isAggressive = true;
        this.detectionRange *= 1.5;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    playDamageEffect() {
        if (!this.mesh) return;
        
        // Flash red
        this.mesh.children.forEach(child => {
            if (child.material) {
                const originalColor = child.material.color.clone();
                child.material.color.setHex(0xff0000);
                
                setTimeout(() => {
                    if (child.material) {
                        child.material.color.copy(originalColor);
                    }
                }, 100);
            }
        });
    }
    
    die() {
        console.log(`👹 ${this.type} defeated!`);
        this.state = 'dead';
        
        // Death animation
        this.playDeathAnimation();
        
        // Give rewards to player
        this.giveRewards();
        
        // Remove from scene after animation
        setTimeout(() => {
            this.dispose();
        }, 2000);
    }
    
    playDeathAnimation() {
        if (!this.mesh) return;
        
        // Falling and fading animation
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (this.mesh) {
                // Fall down
                this.mesh.rotation.x = progress * Math.PI / 2;
                
                // Fade out
                this.mesh.children.forEach(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 1 - progress;
                    }
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
        };
        
        animate();
    }
    
    giveRewards() {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        // Give tokens based on enemy type
        let tokenReward = 5;
        if (this.type === 'temple_boss') {
            tokenReward = 50;
        }
        
        player.addTokens(tokenReward);
        
        // Special rewards for bosses
        if (this.type === 'temple_boss') {
            console.log('🏆 Boss defeated! Special reward unlocked!');
            // TODO: Give elemental power
        }
    }
    
    dispose() {
        if (this.mesh) {
            this.game.gameEngine.removeFromScene(this.mesh);
        }
        
        // Remove from enemy list
        const enemies = this.game.sceneManager?.enemies;
        if (enemies) {
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
            }
        }
    }
}

// Specific boss classes
class WaterTempleBoss extends Enemy {
    constructor(game) {
        super(game, 'water_boss');
        this.element = 'water';
        this.createWaterEffects();
    }
    
    createWaterEffects() {
        // Add water-specific visual effects
        if (this.mesh) {
            // Blue tint
            this.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.color.setHex(0x0066cc);
                }
            });
        }
    }
    
    specialAttack() {
        console.log('🌊 Water Boss uses Tidal Wave!');
        // TODO: Implement water-based attack
    }
}

class FireTempleBoss extends Enemy {
    constructor(game) {
        super(game, 'fire_boss');
        this.element = 'fire';
        this.createFireEffects();
    }
    
    createFireEffects() {
        // Add fire-specific visual effects
        if (this.mesh) {
            // Red/orange tint
            this.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.color.setHex(0xff4400);
                    child.material.emissive.setHex(0x442200);
                    child.material.emissiveIntensity = 0.3;
                }
            });
        }
    }
    
    specialAttack() {
        console.log('🔥 Fire Boss uses Flame Burst!');
        // TODO: Implement fire-based attack
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Enemy, WaterTempleBoss, FireTempleBoss };
}
