/**
 * NPC - Non-Player Character for Elemelon
 * Creates melon-shaped NPCs that populate the city
 */

class NPC {
    constructor(game) {
        this.game = game;
        
        // NPC properties
        this.position = new THREE.Vector3();
        this.mesh = null;
        this.type = 'melon_citizen';
        
        // Behavior properties
        this.walkSpeed = 2;
        this.wanderRadius = 10;
        this.wanderCenter = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.isMoving = false;
        
        // Animation properties
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 2;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create detailed melon-shaped NPC
        const group = new THREE.Group();
        
        // Main melon body (more detailed sphere)
        const bodyGeometry = new THREE.SphereGeometry(1.2, 32, 24);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x90EE90, // Light green for melon
            shininess: 30,
            specular: 0x222222
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Detailed melon stripes (vertical)
        for (let i = 0; i < 8; i++) {
            const stripeGeometry = new THREE.CylinderGeometry(1.25, 1.25, 2.4, 4);
            const stripeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x228B22,
                transparent: true,
                opacity: 0.8
            });
            
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.y = 1.2;
            stripe.rotation.y = (i / 8) * Math.PI * 2;
            stripe.scale.set(0.05, 1, 1);
            group.add(stripe);
        }
        
        // Improved eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 12);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const pupilGeometry = new THREE.SphereGeometry(0.08, 12, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.4, 1.4, 1.0);
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.4, 1.4, 1.08);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.4, 1.4, 1.0);
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.4, 1.4, 1.08);
        
        // Mouth
        const mouthGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.0, 1.0);
        mouth.rotation.x = Math.PI;
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x90EE90 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1.3, 1.0, 0);
        leftArm.rotation.z = Math.PI / 4;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1.3, 1.0, 0);
        rightArm.rotation.z = -Math.PI / 4;
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x90EE90 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.4, 0.3, 0);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.4, 0.3, 0);
        
        // Add all parts
        group.add(body);
        group.add(leftEye, leftPupil);
        group.add(rightEye, rightPupil);
        group.add(mouth);
        group.add(leftArm, rightArm);
        group.add(leftLeg, rightLeg);
        
        // Store for animation
        this.bodyParts = {
            body: body,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg
        };
        
        this.mesh = group;
        this.mesh.userData = { isNPC: true, npc: this };
    }
    
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.wanderCenter.copy(this.position);
        this.targetPosition.copy(this.position);
        
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
    
    startBehavior() {
        // Start wandering behavior
        this.pickNewTarget();
    }
    
    update(deltaTime) {
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update animation
        this.updateAnimation(deltaTime);
    }
    
    updateMovement(deltaTime) {
        if (!this.isMoving) {
            // Randomly decide to start moving
            if (Math.random() < 0.01) { // 1% chance per frame
                this.pickNewTarget();
            }
            return;
        }
        
        // Move towards target
        const direction = this.targetPosition.clone().sub(this.position);
        const distance = direction.length();
        
        if (distance < 0.5) {
            // Reached target
            this.isMoving = false;
            
            // Wait before picking new target
            setTimeout(() => {
                if (Math.random() < 0.7) { // 70% chance to move again
                    this.pickNewTarget();
                }
            }, 2000 + Math.random() * 3000); // Wait 2-5 seconds
            
        } else {
            // Move towards target
            direction.normalize();
            direction.multiplyScalar(this.walkSpeed * deltaTime);
            
            this.position.add(direction);
            
            // Face movement direction
            if (this.mesh) {
                this.mesh.lookAt(this.targetPosition);
            }
        }
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
    
    updateAnimation(deltaTime) {
        if (!this.mesh || !this.bodyParts) return;
        
        const time = Date.now() * 0.001;
        
        // Bob animation for body
        const bobAmount = Math.sin(time * this.bobSpeed + this.bobOffset) * 0.1;
        this.mesh.position.y = this.position.y + bobAmount;
        
        // Enhanced animations based on movement
        if (this.isMoving) {
            // Walking animation
            const walkCycle = time * this.bobSpeed * 3 + this.bobOffset;
            
            // Arm swinging
            if (this.bodyParts.leftArm) {
                this.bodyParts.leftArm.rotation.x = Math.sin(walkCycle) * 0.5;
                this.bodyParts.rightArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
            }
            
            // Leg movement
            if (this.bodyParts.leftLeg) {
                this.bodyParts.leftLeg.rotation.x = Math.sin(walkCycle) * 0.3;
                this.bodyParts.rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
            }
            
            // Body sway
            const swayAmount = Math.sin(time * this.bobSpeed * 2 + this.bobOffset) * 0.08;
            this.mesh.rotation.z = swayAmount;
            
            // Body bounce
            if (this.bodyParts.body) {
                this.bodyParts.body.scale.y = 1 + Math.sin(walkCycle * 2) * 0.05;
                this.bodyParts.body.scale.x = 1 - Math.sin(walkCycle * 2) * 0.02;
                this.bodyParts.body.scale.z = 1 - Math.sin(walkCycle * 2) * 0.02;
            }
            
        } else {
            // Idle animations
            const idleCycle = time * this.bobSpeed * 0.5 + this.bobOffset;
            
            // Gentle arm movement
            if (this.bodyParts.leftArm) {
                this.bodyParts.leftArm.rotation.x = Math.sin(idleCycle) * 0.1;
                this.bodyParts.rightArm.rotation.x = Math.sin(idleCycle + Math.PI) * 0.1;
            }
            
            // Return legs to neutral
            if (this.bodyParts.leftLeg) {
                this.bodyParts.leftLeg.rotation.x *= 0.95;
                this.bodyParts.rightLeg.rotation.x *= 0.95;
            }
            
            // Return body to neutral rotation
            this.mesh.rotation.z *= 0.95;
            
            // Gentle breathing animation
            if (this.bodyParts.body) {
                this.bodyParts.body.scale.y = 1 + Math.sin(idleCycle * 0.5) * 0.02;
                this.bodyParts.body.scale.x = 1 - Math.sin(idleCycle * 0.5) * 0.01;
                this.bodyParts.body.scale.z = 1 - Math.sin(idleCycle * 0.5) * 0.01;
            }
        }
        
        // Random blink animation
        if (Math.random() < 0.005) { // 0.5% chance per frame
            this.blink();
        }
    }
    
    blink() {
        // Simple blink by scaling eyes
        if (this.bodyParts && this.mesh) {
            const eyes = this.mesh.children.filter(child => 
                child.material && child.material.color && 
                child.material.color.getHex() === 0xffffff
            );
            
            eyes.forEach(eye => {
                eye.scale.y = 0.1;
                setTimeout(() => {
                    eye.scale.y = 1;
                }, 100);
            });
        }
    }
    
    pickNewTarget() {
        // Pick random point within wander radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.wanderRadius;
        
        this.targetPosition.set(
            this.wanderCenter.x + Math.cos(angle) * distance,
            this.wanderCenter.y,
            this.wanderCenter.z + Math.sin(angle) * distance
        );
        
        // Ensure target is within world bounds
        const worldBound = 200;
        this.targetPosition.x = Math.max(-worldBound, Math.min(worldBound, this.targetPosition.x));
        this.targetPosition.z = Math.max(-worldBound, Math.min(worldBound, this.targetPosition.z));
        
        this.isMoving = true;
    }
    
    // Interaction methods
    onInteract(player) {
        console.log('🍈 NPC: Hello! Welcome to the grey world!');
        
        // Random NPC dialogue
        const dialogues = [
            "🍈 The world wasn't always grey... something happened to the colors.",
            "🍈 I heard there are temples around the city with strange powers.",
            "🍈 Be careful out there! Strange creatures roam at night.",
            "🍈 The shops have good equipment, but they're expensive!",
            "🍈 Have you seen the portal in the center? It's been locked for ages.",
            "🍈 Dr. Hegesh... that name gives me chills. Stay away from him!",
            "🍈 Find the elemental temples - they hold the key to restoring color!"
        ];
        
        const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        
        // Show dialogue to player
        this.game.uiManager?.showDialogue('Melon Citizen', randomDialogue);
        
        // Face the player
        if (this.mesh && player) {
            this.mesh.lookAt(player.position);
        }
        
        // Stop current movement
        this.isMoving = false;
    }
    
    // Utility methods
    getDistanceToPlayer() {
        const player = this.game.sceneManager?.player;
        if (player) {
            return this.position.distanceTo(player.position);
        }
        return Infinity;
    }
    
    isNearPlayer(radius = 5) {
        return this.getDistanceToPlayer() <= radius;
    }
    
    dispose() {
        if (this.mesh) {
            this.game.gameEngine.removeFromScene(this.mesh);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPC;
}
