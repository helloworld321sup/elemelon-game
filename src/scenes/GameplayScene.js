/**
 * GameplayScene - Main gameplay scene for Elemelon
 * Handles the main game loop, player interactions, and game state
 */

class GameplayScene {
    constructor(game) {
        this.game = game;
        
        // Scene state
        this.isActive = false;
        this.isPaused = false;
        
        // Game systems
        this.player = null;
        this.world = null;
        this.enemies = [];
        
        // Gameplay mechanics
        this.questSystem = null;
        this.combatSystem = null;
        this.puzzleSystem = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastUpdate = 0;
    }
    
    async init() {
        console.log('🎮 Initializing Gameplay Scene...');
        
        // Initialize game systems
        await this.initializeGameSystems();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        console.log('🎮 Gameplay Scene initialized');
    }
    
    async initializeGameSystems() {
        // Get references to game systems
        this.player = this.game.sceneManager?.player;
        this.world = this.game.sceneManager;
        
        // Initialize quest system
        this.questSystem = new QuestSystem(this.game);
        await this.questSystem.init();
        
        // Initialize combat system
        this.combatSystem = new CombatSystem(this.game);
        await this.combatSystem.init();
        
        // Initialize puzzle system
        this.puzzleSystem = new PuzzleSystem(this.game);
        await this.puzzleSystem.init();
    }
    
    setupEventHandlers() {
        // Handle game state changes
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isActive) {
                this.togglePause();
            }
        });
    }
    
    start() {
        console.log('🎮 Starting gameplay scene...');
        
        this.isActive = true;
        this.isPaused = false;
        
        // Start game systems
        this.startGameSystems();
        
        // Initialize starting quest
        this.questSystem?.startMainQuest();
        
        // Play background music
        this.game.audioManager?.playEnvironmentalAudio('city');
    }
    
    startGameSystems() {
        // Enable player controls
        if (this.player) {
            this.player.enableControls();
        }
        
        // Start world systems
        if (this.world) {
            this.world.startGameSystems();
        }
        
        // Start quest system
        this.questSystem?.start();
    }
    
    update(deltaTime) {
        if (!this.isActive || this.isPaused) return;
        
        // Update core systems
        this.updatePlayer(deltaTime);
        this.updateWorld(deltaTime);
        this.updateGameSystems(deltaTime);
        
        // Update gameplay mechanics
        this.updateQuests(deltaTime);
        this.updateCombat(deltaTime);
        this.updatePuzzles(deltaTime);
        
        // Check win/lose conditions
        this.checkGameConditions();
        
        // Performance tracking
        this.updatePerformanceStats(deltaTime);
    }
    
    updatePlayer(deltaTime) {
        if (this.player) {
            this.player.update(deltaTime);
        }
    }
    
    updateWorld(deltaTime) {
        if (this.world) {
            this.world.update(deltaTime);
        }
    }
    
    updateGameSystems(deltaTime) {
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });
        
        // Clean up dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
    }
    
    updateQuests(deltaTime) {
        if (this.questSystem) {
            this.questSystem.update(deltaTime);
        }
    }
    
    updateCombat(deltaTime) {
        if (this.combatSystem) {
            this.combatSystem.update(deltaTime);
        }
    }
    
    updatePuzzles(deltaTime) {
        if (this.puzzleSystem) {
            this.puzzleSystem.update(deltaTime);
        }
    }
    
    checkGameConditions() {
        // Check if player has collected all elements
        const playerData = this.game.getPlayerData();
        const elements = playerData.collectedElements;
        
        if (elements.water && elements.fire && elements.wind && elements.lightning) {
            if (!this.hasTriggeredFinalBoss) {
                this.triggerFinalBoss();
                this.hasTriggeredFinalBoss = true;
            }
        }
        
        // Check if player died
        if (playerData.health <= 0) {
            this.handlePlayerDeath();
        }
    }
    
    triggerFinalBoss() {
        console.log('🏆 All elements collected! Triggering final boss...');
        
        // Play final boss cutscene
        const cutsceneManager = new CutsceneManager(this.game);
        cutsceneManager.playFinalBossCutscene();
    }
    
    handlePlayerDeath() {
        console.log('💀 Player died - showing game over screen');
        
        // Pause gameplay
        this.pause();
        
        // Show game over screen
        this.showGameOverScreen();
    }
    
    // Pause/Resume functionality
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    pause() {
        if (!this.isPaused) {
            console.log('⏸️ Pausing gameplay...');
            
            this.isPaused = true;
            
            // Disable player controls
            if (this.player) {
                this.player.disableControls();
            }
            
            // Show pause menu
            this.game.pauseGame();
        }
    }
    
    resume() {
        if (this.isPaused) {
            console.log('▶️ Resuming gameplay...');
            
            this.isPaused = false;
            
            // Re-enable player controls
            if (this.player) {
                this.player.enableControls();
            }
            
            // Hide pause menu
            this.game.resumeGame();
        }
    }
    
    // Scene transitions
    enterTemple(templeType) {
        console.log(`🏛️ Entering ${templeType} temple...`);
        
        // Play temple entrance cutscene
        const cutsceneManager = new CutsceneManager(this.game);
        cutsceneManager.playTempleEntranceCutscene(templeType);
        
        // Change environment music
        this.game.audioManager?.playEnvironmentalAudio('temple');
        
        // Initialize temple-specific gameplay
        this.initializeTempleGameplay(templeType);
    }
    
    initializeTempleGameplay(templeType) {
        // Spawn temple boss
        this.spawnTempleBoss(templeType);
        
        // Activate temple puzzles
        this.puzzleSystem?.activateTemplePuzzles(templeType);
        
        // Update quest objectives
        this.questSystem?.updateTempleObjective(templeType);
    }
    
    spawnTempleBoss(templeType) {
        let boss = null;
        
        switch (templeType) {
            case 'water':
                boss = new WaterTempleBoss(this.game);
                break;
            case 'fire':
                boss = new FireTempleBoss(this.game);
                break;
            case 'wind':
                boss = new Enemy(this.game, 'wind_boss');
                break;
            case 'lightning':
                boss = new Enemy(this.game, 'lightning_boss');
                break;
        }
        
        if (boss) {
            // Position boss at temple center
            const templePosition = this.getTemplePosition(templeType);
            boss.setPosition(templePosition.x, templePosition.y, templePosition.z);
            
            // Add to enemies list
            this.enemies.push(boss);
            
            // Add to scene
            this.game.gameEngine.addToScene(boss.mesh);
            
            console.log(`👹 ${templeType} temple boss spawned!`);
        }
    }
    
    getTemplePosition(templeType) {
        const positions = {
            water: { x: -150, y: 0, z: -150 },
            fire: { x: 150, y: 0, z: 150 },
            wind: { x: -150, y: 0, z: 150 },
            lightning: { x: 150, y: 0, z: -150 }
        };
        
        return positions[templeType] || { x: 0, y: 0, z: 0 };
    }
    
    // Boss defeat handling
    onBossDefeated(bossType) {
        console.log(`🏆 ${bossType} boss defeated!`);
        
        // Give player the elemental power
        this.grantElementalPower(bossType);
        
        // Play victory cutscene
        const cutsceneManager = new CutsceneManager(this.game);
        cutsceneManager.playBossDefeatCutscene(bossType);
        
        // Update quest progress
        this.questSystem?.completeBossQuest(bossType);
        
        // Return to city music
        this.game.audioManager?.playEnvironmentalAudio('city');
    }
    
    grantElementalPower(elementType) {
        const playerData = this.game.getPlayerData();
        
        // Grant the elemental power
        playerData.collectedElements[elementType] = true;
        playerData.completedTemples++;
        
        // Update game progress
        const totalTemples = 4;
        playerData.gameProgress = (playerData.completedTemples / totalTemples) * 100;
        
        console.log(`✨ Gained ${elementType} power! Progress: ${playerData.gameProgress}%`);
        
        // Update UI
        this.game.uiManager?.updateGameProgress(playerData.gameProgress);
    }
    
    // UI screens
    showGameOverScreen() {
        // Create game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h1>💀 GAME OVER</h1>
                <p>The grey world has claimed another victim...</p>
                <div class="game-over-buttons">
                    <button id="respawnBtn" class="game-over-btn">Respawn</button>
                    <button id="quitToMenuBtn" class="game-over-btn">Main Menu</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
        
        // Setup button handlers
        document.getElementById('respawnBtn')?.addEventListener('click', () => {
            this.respawnPlayer();
            document.body.removeChild(gameOverScreen);
        });
        
        document.getElementById('quitToMenuBtn')?.addEventListener('click', () => {
            this.game.quitToMenu();
            document.body.removeChild(gameOverScreen);
        });
    }
    
    respawnPlayer() {
        console.log('🔄 Respawning player...');
        
        // Reset player health
        const playerData = this.game.getPlayerData();
        playerData.health = 8;
        
        // Move player to safe location
        if (this.player) {
            this.player.setPosition(0, 2, 10);
        }
        
        // Resume gameplay
        this.resume();
        
        // Update UI
        this.game.uiManager?.updateHealth(playerData.health);
    }
    
    // Performance monitoring
    updatePerformanceStats(deltaTime) {
        this.frameCount++;
        this.lastUpdate += deltaTime;
        
        // Log performance every 5 seconds
        if (this.lastUpdate >= 5) {
            const fps = this.frameCount / this.lastUpdate;
            console.log(`🎮 Gameplay FPS: ${fps.toFixed(1)}`);
            
            this.frameCount = 0;
            this.lastUpdate = 0;
        }
    }
    
    // Scene cleanup
    stop() {
        console.log('🎮 Stopping gameplay scene...');
        
        this.isActive = false;
        
        // Disable player controls
        if (this.player) {
            this.player.disableControls();
        }
        
        // Stop game systems
        this.questSystem?.stop();
        this.combatSystem?.stop();
        this.puzzleSystem?.stop();
    }
    
    dispose() {
        this.stop();
        
        // Clean up systems
        this.questSystem?.dispose();
        this.combatSystem?.dispose();
        this.puzzleSystem?.dispose();
        
        // Clear enemies
        this.enemies = [];
        
        console.log('🎮 Gameplay Scene disposed');
    }
}

// Basic quest system
class QuestSystem {
    constructor(game) {
        this.game = game;
        this.activeQuests = [];
        this.completedQuests = [];
    }
    
    async init() {
        console.log('📋 Quest System initialized');
    }
    
    startMainQuest() {
        const mainQuest = {
            id: 'main_quest',
            title: 'Escape the Grey World',
            description: 'Collect all four elemental powers and defeat Dr. Hegesh',
            objectives: [
                'Find the Water Temple',
                'Find the Fire Temple', 
                'Find the Wind Temple',
                'Find the Lightning Temple',
                'Defeat Dr. Hegesh'
            ],
            progress: 0
        };
        
        this.activeQuests.push(mainQuest);
        console.log('📋 Main quest started!');
    }
    
    updateTempleObjective(templeType) {
        console.log(`📋 Updated ${templeType} temple objective`);
    }
    
    completeBossQuest(bossType) {
        console.log(`📋 Completed ${bossType} boss quest`);
    }
    
    start() {}
    stop() {}
    update(deltaTime) {}
    dispose() {}
}

// Basic combat system
class CombatSystem {
    constructor(game) {
        this.game = game;
    }
    
    async init() {
        console.log('⚔️ Combat System initialized');
    }
    
    start() {}
    stop() {}
    update(deltaTime) {}
    dispose() {}
}

// Basic puzzle system
class PuzzleSystem {
    constructor(game) {
        this.game = game;
    }
    
    async init() {
        console.log('🧩 Puzzle System initialized');
    }
    
    activateTemplePuzzles(templeType) {
        console.log(`🧩 Activated ${templeType} temple puzzles`);
    }
    
    start() {}
    stop() {}
    update(deltaTime) {}
    dispose() {}
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameplayScene;
}
