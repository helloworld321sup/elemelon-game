/**
 * SaveManager - Handles game save/load functionality for Elemelon
 * Uses localStorage to persist game progress and settings
 */

class SaveManager {
    constructor(game) {
        this.game = game;
        
        // Save keys
        this.saveKeys = {
            gameData: 'elemelon_game_save',
            settings: 'elemelon_settings',
            achievements: 'elemelon_achievements'
        };
        
        // Save version for compatibility
        this.saveVersion = '1.0.0';
        
        // Auto-save settings
        this.autoSaveEnabled = true;
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
    }
    
    async init() {
        console.log('💾 Initializing Save Manager...');
        
        // Check localStorage availability
        if (!this.isLocalStorageAvailable()) {
            console.warn('💾 localStorage not available - saves will not persist');
            return;
        }
        
        // Start auto-save if enabled
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }
        
        console.log('💾 Save Manager initialized');
    }
    
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Main save/load methods
    saveGame(customData = null) {
        if (!this.isLocalStorageAvailable()) {
            console.warn('💾 Cannot save - localStorage not available');
            return false;
        }
        
        try {
            const saveData = customData || this.createSaveData();
            const serializedData = JSON.stringify(saveData);
            
            localStorage.setItem(this.saveKeys.gameData, serializedData);
            
            console.log('💾 Game saved successfully');
            this.showSaveNotification('Game Saved!');
            
            return true;
            
        } catch (error) {
            console.error('💾 Failed to save game:', error);
            this.showSaveNotification('Save Failed!', true);
            return false;
        }
    }
    
    loadGame() {
        if (!this.isLocalStorageAvailable()) {
            console.warn('💾 Cannot load - localStorage not available');
            return null;
        }
        
        try {
            const serializedData = localStorage.getItem(this.saveKeys.gameData);
            
            if (!serializedData) {
                console.log('💾 No save data found');
                return null;
            }
            
            const saveData = JSON.parse(serializedData);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                console.warn('💾 Invalid save data');
                return null;
            }
            
            console.log('💾 Game loaded successfully');
            this.showSaveNotification('Game Loaded!');
            
            return saveData;
            
        } catch (error) {
            console.error('💾 Failed to load game:', error);
            this.showSaveNotification('Load Failed!', true);
            return null;
        }
    }
    
    hasSavedGame() {
        if (!this.isLocalStorageAvailable()) return false;
        
        const saveData = localStorage.getItem(this.saveKeys.gameData);
        return saveData !== null;
    }
    
    deleteSave() {
        if (!this.isLocalStorageAvailable()) return false;
        
        try {
            localStorage.removeItem(this.saveKeys.gameData);
            console.log('💾 Save data deleted');
            this.showSaveNotification('Save Deleted!');
            return true;
            
        } catch (error) {
            console.error('💾 Failed to delete save:', error);
            return false;
        }
    }
    
    // Create save data from current game state
    createSaveData() {
        const playerData = this.game.getPlayerData();
        const player = this.game.sceneManager?.player;
        
        const saveData = {
            version: this.saveVersion,
            timestamp: Date.now(),
            
            // Player data
            player: {
                position: player ? player.position.toArray() : [0, 2, 10],
                health: playerData.health,
                tokens: playerData.tokens,
                inventory: {
                    weapons: playerData.inventory.weapons,
                    consumables: playerData.inventory.consumables,
                    activeWeapon: playerData.inventory.activeWeapon
                }
            },
            
            // Game progress
            progress: {
                collectedElements: playerData.collectedElements,
                completedTemples: playerData.completedTemples,
                gameProgress: playerData.gameProgress,
                currentScene: this.game.sceneManager?.currentScene || 'gameplay'
            },
            
            // World state
            world: {
                defeatedEnemies: [], // Would track defeated enemies
                openedChests: [], // Would track opened treasure chests
                completedQuests: [] // Would track completed quests
            },
            
            // Statistics
            stats: {
                playTime: this.getPlayTime(),
                tokensCollected: playerData.tokens,
                enemiesDefeated: 0, // Would be tracked
                deathCount: 0, // Would be tracked
                templesCompleted: Object.values(playerData.collectedElements).filter(Boolean).length
            }
        };
        
        return saveData;
    }
    
    validateSaveData(saveData) {
        // Check required fields
        const requiredFields = ['version', 'timestamp', 'player', 'progress'];
        
        for (const field of requiredFields) {
            if (!saveData.hasOwnProperty(field)) {
                console.warn(`💾 Missing required field: ${field}`);
                return false;
            }
        }
        
        // Check version compatibility
        if (saveData.version !== this.saveVersion) {
            console.warn(`💾 Version mismatch: ${saveData.version} vs ${this.saveVersion}`);
            // Could implement migration here
        }
        
        // Validate player data
        if (!saveData.player.position || !Array.isArray(saveData.player.position)) {
            console.warn('💾 Invalid player position data');
            return false;
        }
        
        return true;
    }
    
    // Settings management
    saveSettings() {
        if (!this.isLocalStorageAvailable()) return false;
        
        try {
            const settings = this.game.getGameSettings();
            const serializedSettings = JSON.stringify(settings);
            
            localStorage.setItem(this.saveKeys.settings, serializedSettings);
            
            console.log('⚙️ Settings saved');
            return true;
            
        } catch (error) {
            console.error('⚙️ Failed to save settings:', error);
            return false;
        }
    }
    
    loadSettings() {
        if (!this.isLocalStorageAvailable()) return null;
        
        try {
            const serializedSettings = localStorage.getItem(this.saveKeys.settings);
            
            if (!serializedSettings) {
                return null;
            }
            
            const settings = JSON.parse(serializedSettings);
            console.log('⚙️ Settings loaded');
            
            return settings;
            
        } catch (error) {
            console.error('⚙️ Failed to load settings:', error);
            return null;
        }
    }
    
    // Quick save slots
    quickSave(slot = 1) {
        const quickSaveKey = `${this.saveKeys.gameData}_quick_${slot}`;
        
        try {
            const saveData = this.createSaveData();
            saveData.isQuickSave = true;
            saveData.slot = slot;
            
            localStorage.setItem(quickSaveKey, JSON.stringify(saveData));
            
            console.log(`💾 Quick saved to slot ${slot}`);
            this.showSaveNotification(`Quick Save ${slot}!`);
            
            return true;
            
        } catch (error) {
            console.error(`💾 Quick save failed:`, error);
            return false;
        }
    }
    
    quickLoad(slot = 1) {
        const quickSaveKey = `${this.saveKeys.gameData}_quick_${slot}`;
        
        try {
            const serializedData = localStorage.getItem(quickSaveKey);
            
            if (!serializedData) {
                console.warn(`💾 No quick save found in slot ${slot}`);
                return null;
            }
            
            const saveData = JSON.parse(serializedData);
            
            console.log(`💾 Quick loaded from slot ${slot}`);
            this.showSaveNotification(`Quick Load ${slot}!`);
            
            return saveData;
            
        } catch (error) {
            console.error(`💾 Quick load failed:`, error);
            return null;
        }
    }
    
    // Auto-save functionality
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.game.getGameState() === 'playing') {
                this.autoSave();
            }
        }, this.autoSaveInterval);
        
        console.log(`💾 Auto-save started (${this.autoSaveInterval / 1000}s interval)`);
    }
    
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('💾 Auto-save stopped');
        }
    }
    
    autoSave() {
        const autoSaveKey = `${this.saveKeys.gameData}_auto`;
        
        try {
            const saveData = this.createSaveData();
            saveData.isAutoSave = true;
            
            localStorage.setItem(autoSaveKey, JSON.stringify(saveData));
            
            console.log('💾 Auto-saved');
            // Don't show notification for auto-save to avoid spam
            
        } catch (error) {
            console.warn('💾 Auto-save failed:', error);
        }
    }
    
    // Save management
    getAllSaves() {
        const saves = [];
        
        if (!this.isLocalStorageAvailable()) return saves;
        
        // Main save
        const mainSave = localStorage.getItem(this.saveKeys.gameData);
        if (mainSave) {
            try {
                const data = JSON.parse(mainSave);
                saves.push({
                    type: 'main',
                    name: 'Main Save',
                    data: data,
                    timestamp: data.timestamp
                });
            } catch (error) {
                console.warn('💾 Corrupted main save');
            }
        }
        
        // Quick saves
        for (let slot = 1; slot <= 5; slot++) {
            const quickSaveKey = `${this.saveKeys.gameData}_quick_${slot}`;
            const quickSave = localStorage.getItem(quickSaveKey);
            
            if (quickSave) {
                try {
                    const data = JSON.parse(quickSave);
                    saves.push({
                        type: 'quick',
                        name: `Quick Save ${slot}`,
                        data: data,
                        timestamp: data.timestamp,
                        slot: slot
                    });
                } catch (error) {
                    console.warn(`💾 Corrupted quick save ${slot}`);
                }
            }
        }
        
        // Auto save
        const autoSave = localStorage.getItem(`${this.saveKeys.gameData}_auto`);
        if (autoSave) {
            try {
                const data = JSON.parse(autoSave);
                saves.push({
                    type: 'auto',
                    name: 'Auto Save',
                    data: data,
                    timestamp: data.timestamp
                });
            } catch (error) {
                console.warn('💾 Corrupted auto save');
            }
        }
        
        // Sort by timestamp (newest first)
        saves.sort((a, b) => b.timestamp - a.timestamp);
        
        return saves;
    }
    
    // Utility methods
    getPlayTime() {
        // Would track actual play time in a real implementation
        return Date.now() - (this.game.startTime || Date.now());
    }
    
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
    
    getSaveSize() {
        if (!this.isLocalStorageAvailable()) return 0;
        
        let totalSize = 0;
        
        Object.values(this.saveKeys).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += data.length;
            }
        });
        
        // Check quick saves and auto save
        for (let slot = 1; slot <= 5; slot++) {
            const data = localStorage.getItem(`${this.saveKeys.gameData}_quick_${slot}`);
            if (data) totalSize += data.length;
        }
        
        const autoData = localStorage.getItem(`${this.saveKeys.gameData}_auto`);
        if (autoData) totalSize += autoData.length;
        
        return totalSize;
    }
    
    // UI notification
    showSaveNotification(message, isError = false) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `save-notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isError ? '#ff4444' : '#44ff44'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Cleanup
    dispose() {
        this.stopAutoSave();
        console.log('💾 Save Manager disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveManager;
}
