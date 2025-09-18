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
        // Create melon-shaped NPC
        const group = new THREE.Group();
        
        // Main melon body (sphere)
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x90EE90 // Light green for melon
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        
        // Melon stripes
        const stripeGeometry = new THREE.RingGeometry(0.8, 1.1, 8);
        const stripeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 4; i++) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.rotation.x = Math.PI / 2;
            stripe.position.y = 1 + (i - 2) * 0.3;
            stripe.scale.setScalar(0.8 + i * 0.1);
            group.add(stripe);
        }
        
        // Simple eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 1.2, 0.8);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 1.2, 0.8);
        
        group.add(body);
        group.add(leftEye);
        group.add(rightEye);
        
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
        if (!this.mesh) return;
        
        // Bob animation
        const time = Date.now() * 0.001;
        const bobAmount = Math.sin(time * this.bobSpeed + this.bobOffset) * 0.1;
        
        this.mesh.position.y = this.position.y + bobAmount;
        
        // Slight rotation animation
        if (this.isMoving) {
            const rotationAmount = Math.sin(time * this.bobSpeed * 2 + this.bobOffset) * 0.1;
            this.mesh.rotation.z = rotationAmount;
        } else {
            // Return to neutral rotation when not moving
            this.mesh.rotation.z *= 0.95;
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
