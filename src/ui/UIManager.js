/**
 * UIManager - Manages all user interface elements for Elemelon
 * Handles HUD, inventory, health, tokens, minimap, and interactions
 */

class UIManager {
    constructor(game) {
        this.game = game;
        
        // UI elements
        this.healthBar = null;
        this.tokensDisplay = null;
        this.inventory = null;
        this.minimap = null;
        this.interactionPrompt = null;
        
        // UI state
        this.isInventoryOpen = false;
        this.isMapOpen = false;
        this.currentDialogue = null;
        
        // Animation timers
        this.animationTimers = [];
    }
    
    async init() {
        console.log('🖥️ Initializing UI Manager...');
        
        // Get UI elements
        this.getUIElements();
        
        // Setup UI functionality
        this.setupInventory();
        this.setupMinimap();
        this.setupInteractionSystem();
        
        // Initialize with current game data
        this.updateAllUI();
        
        console.log('🖥️ UI Manager initialized');
    }
    
    getUIElements() {
        this.healthBar = document.getElementById('healthBar');
        this.tokensDisplay = document.getElementById('tokensDisplay');
        this.inventory = document.getElementById('inventory');
        this.minimap = document.getElementById('minimap');
        
        // Create interaction prompt if it doesn't exist
        this.createInteractionPrompt();
        
        // Create dialogue system
        this.createDialogueSystem();
    }
    
    createInteractionPrompt() {
        let prompt = document.getElementById('interactionPrompt');
        
        if (!prompt) {
            prompt = document.createElement('div');
            prompt.id = 'interactionPrompt';
            prompt.className = 'interaction-prompt';
            prompt.style.display = 'none';
            document.getElementById('gameUI').appendChild(prompt);
        }
        
        this.interactionPrompt = prompt;
    }
    
    createDialogueSystem() {
        let dialogueBox = document.getElementById('dialogueBox');
        
        if (!dialogueBox) {
            dialogueBox = document.createElement('div');
            dialogueBox.id = 'dialogueBox';
            dialogueBox.className = 'dialogue-box';
            dialogueBox.innerHTML = `
                <div class="dialogue-header">
                    <span id="dialogueSpeaker"></span>
                    <button id="closeDialogue" class="close-dialogue">✕</button>
                </div>
                <div id="dialogueText" class="dialogue-text"></div>
                <div class="dialogue-actions">
                    <button id="continueDialogue" class="dialogue-btn">Continue</button>
                </div>
            `;
            dialogueBox.style.display = 'none';
            document.getElementById('gameUI').appendChild(dialogueBox);
            
            // Setup dialogue controls
            document.getElementById('closeDialogue').addEventListener('click', () => {
                this.hideDialogue();
            });
            
            document.getElementById('continueDialogue').addEventListener('click', () => {
                this.continueDialogue();
            });
        }
        
        this.dialogueBox = dialogueBox;
    }
    
    // Health system
    updateHealth(health) {
        if (!this.healthBar) return;
        
        const hearts = this.healthBar.querySelectorAll('.heart');
        
        hearts.forEach((heart, index) => {
            if (index < health) {
                heart.className = 'heart full';
            } else {
                heart.className = 'heart empty';
            }
        });
        
        // Animate health change
        if (health < this.lastHealth) {
            this.animateHealthLoss();
        }
        
        this.lastHealth = health;
    }
    
    animateHealthLoss() {
        const hearts = this.healthBar.querySelectorAll('.heart.full');
        hearts.forEach(heart => {
            heart.classList.add('damaged');
            setTimeout(() => {
                heart.classList.remove('damaged');
            }, 500);
        });
    }
    
    // Token system
    updateTokens(tokens) {
        const tokenCount = document.getElementById('tokenCount');
        if (tokenCount) {
            // Animate token change
            const oldValue = parseInt(tokenCount.textContent) || 0;
            const difference = tokens - oldValue;
            
            if (difference !== 0) {
                this.animateTokenChange(tokenCount, oldValue, tokens, difference > 0);
            }
        }
    }
    
    animateTokenChange(element, from, to, isIncrease) {
        const duration = 800;
        const steps = 30;
        const increment = (to - from) / steps;
        let current = from;
        let step = 0;
        
        const animate = () => {
            current += increment;
            element.textContent = Math.round(current);
            
            // Add visual effect for increase
            if (isIncrease && step === 0) {
                element.parentNode.classList.add('token-gain');
                setTimeout(() => {
                    element.parentNode.classList.remove('token-gain');
                }, duration);
            }
            
            step++;
            if (step < steps) {
                setTimeout(animate, duration / steps);
            } else {
                element.textContent = to;
            }
        };
        
        animate();
    }
    
    // Weapon system
    updateWeaponSlot(slot, weaponType) {
        const weaponSlot = document.querySelector(`[data-slot="${slot}"]`);
        if (!weaponSlot) return;
        
        // Clear slot
        weaponSlot.innerHTML = '';
        
        if (weaponType) {
            // Add weapon icon
            const weaponIcon = document.createElement('div');
            weaponIcon.className = 'weapon-icon';
            
            const weaponIcons = {
                blaster: '🔫',
                sword: '⚔️',
                grappling_hook: '🪝'
            };
            
            weaponIcon.textContent = weaponIcons[weaponType] || '❓';
            weaponSlot.appendChild(weaponIcon);
            weaponSlot.classList.remove('empty');
        } else {
            // Show slot number
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = slot + 1;
            weaponSlot.appendChild(slotNumber);
            weaponSlot.classList.add('empty');
        }
    }
    
    updateWeaponSelection(activeSlot) {
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        
        weaponSlots.forEach((slot, index) => {
            if (index === activeSlot) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
    
    // Inventory system
    setupInventory() {
        // Generate consumable slots
        const consumablesContainer = document.querySelector('.inventory-consumables');
        if (consumablesContainer) {
            consumablesContainer.innerHTML = '';
            
            for (let i = 0; i < 12; i++) {
                const slot = document.createElement('div');
                slot.className = 'consumable-slot';
                slot.dataset.slot = i;
                
                slot.addEventListener('click', () => {
                    this.useConsumable(i);
                });
                
                consumablesContainer.appendChild(slot);
            }
        }
        
        // Weapon slot click handlers
        document.querySelectorAll('.weapon-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.game.sceneManager?.player?.switchWeapon(index);
            });
        });
    }
    
    updateConsumableSlot(slot, item) {
        const slotElement = document.querySelector(`[data-slot="${slot}"]`);
        if (!slotElement) return;
        
        slotElement.innerHTML = '';
        
        if (item) {
            const itemIcon = document.createElement('div');
            itemIcon.className = 'item-icon';
            itemIcon.textContent = this.getConsumableIcon(item.type);
            
            const itemCount = document.createElement('div');
            itemCount.className = 'item-count';
            itemCount.textContent = item.count;
            
            slotElement.appendChild(itemIcon);
            slotElement.appendChild(itemCount);
        }
    }
    
    getConsumableIcon(type) {
        const icons = {
            health: '💊',
            energy: '⚡',
            food: '🍎',
            potion: '🧪'
        };
        
        return icons[type] || '❓';
    }
    
    useConsumable(slot) {
        const player = this.game.sceneManager?.player;
        if (player) {
            player.useConsumable(slot);
        }
    }
    
    toggleInventory() {
        this.isInventoryOpen = !this.isInventoryOpen;
        
        const inventory = document.getElementById('inventory');
        if (inventory) {
            inventory.classList.toggle('expanded', this.isInventoryOpen);
        }
    }
    
    // Minimap system
    setupMinimap() {
        const minimapCanvas = document.getElementById('minimapCanvas');
        if (minimapCanvas) {
            this.minimapContext = minimapCanvas.getContext('2d');
            this.drawMinimap();
        }
        
        // Full map button
        const fullmapBtn = document.getElementById('fullmapBtn');
        if (fullmapBtn) {
            fullmapBtn.addEventListener('click', () => {
                this.game.showFullMap();
            });
        }
    }
    
    drawMinimap() {
        if (!this.minimapContext) return;
        
        const canvas = this.minimapContext.canvas;
        const ctx = this.minimapContext;
        
        // Clear canvas
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw world elements
        this.drawMinimapElements(ctx, canvas);
        
        // Draw player position
        this.drawPlayerOnMinimap(ctx, canvas);
    }
    
    drawMinimapElements(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 0.3;
        
        // Draw temples
        const temples = [
            { x: -150, z: -150, color: '#4080ff' }, // Water
            { x: 150, z: -150, color: '#ffff40' },  // Lightning
            { x: -150, z: 150, color: '#80ff80' },  // Wind
            { x: 150, z: 150, color: '#ff4040' }    // Fire
        ];
        
        temples.forEach(temple => {
            const x = centerX + temple.x * scale;
            const y = centerY + temple.z * scale;
            
            ctx.fillStyle = temple.color;
            ctx.fillRect(x - 3, y - 3, 6, 6);
        });
        
        // Draw shops
        const shops = [
            { x: -50, z: 0 },
            { x: 50, z: 0 },
            { x: 0, z: -50 }
        ];
        
        shops.forEach(shop => {
            const x = centerX + shop.x * scale;
            const y = centerY + shop.z * scale;
            
            ctx.fillStyle = '#2196F3';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        });
    }
    
    drawPlayerOnMinimap(ctx, canvas) {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 0.3;
        
        const x = centerX + player.position.x * scale;
        const y = centerY + player.position.z * scale;
        
        // Draw player dot
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        const camera = this.game.gameEngine.camera;
        if (camera) {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + direction.x * 8, y + direction.z * 8);
            ctx.stroke();
        }
    }
    
    updateFullMap() {
        const fullMapCanvas = document.getElementById('fullMapCanvas');
        if (!fullMapCanvas) return;
        
        const ctx = fullMapCanvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, fullMapCanvas.width, fullMapCanvas.height);
        
        // Draw detailed world map
        this.drawFullMapElements(ctx, fullMapCanvas);
    }
    
    drawFullMapElements(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 1.5;
        
        // Draw city grid
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        
        for (let x = -100; x <= 100; x += 50) {
            const screenX = centerX + x * scale;
            ctx.beginPath();
            ctx.moveTo(screenX, centerY - 150 * scale);
            ctx.lineTo(screenX, centerY + 150 * scale);
            ctx.stroke();
        }
        
        for (let z = -100; z <= 100; z += 50) {
            const screenY = centerY + z * scale;
            ctx.beginPath();
            ctx.moveTo(centerX - 150 * scale, screenY);
            ctx.lineTo(centerX + 150 * scale, screenY);
            ctx.stroke();
        }
        
        // Draw temples with labels
        const temples = [
            { x: -150, z: -150, color: '#4080ff', name: 'Water Temple' },
            { x: 150, z: -150, color: '#ffff40', name: 'Lightning Temple' },
            { x: -150, z: 150, color: '#80ff80', name: 'Wind Temple' },
            { x: 150, z: 150, color: '#ff4040', name: 'Fire Temple' }
        ];
        
        temples.forEach(temple => {
            const x = centerX + temple.x * scale;
            const y = centerY + temple.z * scale;
            
            // Draw temple
            ctx.fillStyle = temple.color;
            ctx.fillRect(x - 8, y - 8, 16, 16);
            
            // Draw label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(temple.name, x, y + 25);
        });
        
        // Draw player
        const player = this.game.sceneManager?.player;
        if (player) {
            const x = centerX + player.position.x * scale;
            const y = centerY + player.position.z * scale;
            
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.fillText('You', x, y - 10);
        }
    }
    
    // Interaction system
    showInteractionPrompt(object) {
        if (!this.interactionPrompt) return;
        
        let promptText = 'Press E to interact';
        
        if (object.userData.isTemple) {
            promptText = `Press E to enter ${object.userData.type} temple`;
        } else if (object.userData.isShop) {
            promptText = `Press E to enter ${object.userData.type} shop`;
        } else if (object.userData.isNPC) {
            promptText = 'Press E to talk';
        }
        
        this.interactionPrompt.textContent = promptText;
        this.interactionPrompt.style.display = 'block';
    }
    
    hideInteractionPrompt() {
        if (this.interactionPrompt) {
            this.interactionPrompt.style.display = 'none';
        }
    }
    
    // Dialogue system
    showDialogue(speaker, text) {
        if (!this.dialogueBox) return;
        
        document.getElementById('dialogueSpeaker').textContent = speaker;
        document.getElementById('dialogueText').textContent = text;
        
        this.dialogueBox.style.display = 'block';
        this.currentDialogue = { speaker, text };
    }
    
    hideDialogue() {
        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'none';
            this.currentDialogue = null;
        }
    }
    
    continueDialogue() {
        // For now, just close dialogue
        // In a full implementation, this would advance to next dialogue line
        this.hideDialogue();
    }
    
    // General UI methods
    showGameUI() {
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.style.display = 'block';
        }
    }
    
    hideGameUI() {
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.style.display = 'none';
        }
    }
    
    updateAllUI() {
        const playerData = this.game.getPlayerData();
        
        this.updateHealth(playerData.health);
        this.updateTokens(playerData.tokens);
        
        // Update weapon slots
        playerData.inventory.weapons.forEach((weapon, index) => {
            this.updateWeaponSlot(index, weapon);
        });
        
        this.updateWeaponSelection(playerData.inventory.activeWeapon);
        
        // Update consumable slots
        playerData.inventory.consumables.forEach((item, index) => {
            this.updateConsumableSlot(index, item);
        });
    }
    
    update(deltaTime) {
        // Update minimap
        if (this.minimapContext) {
            this.drawMinimap();
        }
        
        // Update any animated UI elements
        this.updateAnimations(deltaTime);
    }
    
    updateAnimations(deltaTime) {
        // Update any ongoing UI animations
        this.animationTimers = this.animationTimers.filter(timer => {
            timer.elapsed += deltaTime;
            return timer.elapsed < timer.duration;
        });
    }
    
    // Cleanup
    dispose() {
        // Clear animation timers
        this.animationTimers = [];
        
        console.log('🖥️ UI Manager disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
