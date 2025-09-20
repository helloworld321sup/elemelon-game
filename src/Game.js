/**
 * Elemelon Game - Main Game Controller
 * Handles game initialization, state management, and core game loop
 */

class ElmelonGame {
    constructor() {
        this.gameEngine = null;
        this.sceneManager = null;
        this.inputManager = null;
        this.audioManager = null;
        this.saveManager = null;
        this.uiManager = null;
        
        this.gameState = 'loading'; // loading, menu, cutscene, playing, paused
        this.currentScene = null;
        this.isInitialized = false;
        
        // Game data
        this.playerData = {
            health: 8, // 8 hearts
            tokens: 20,
            position: { x: 0, y: 0, z: 0 },
            inventory: {
                weapons: [null, null, null], // 3 weapon slots
                consumables: Array(12).fill(null), // 12 consumable slots
                activeWeapon: 0
            },
            collectedElements: {
                water: false,
                lightning: false,
                wind: false,
                fire: false
            },
            completedTemples: 0,
            gameProgress: 0 // 0-100%
        };
        
        this.gameSettings = {
            graphics: {
                quality: 'high', // low, medium, high
                shadows: true,
                particles: true,
                antialiasing: true
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.8,
                sfxVolume: 1.0
            },
            controls: {
                mouseSensitivity: 1.0,
                invertY: false,
                keyBindings: {
                    forward: 'KeyW',
                    backward: 'KeyS',
                    left: 'KeyA',
                    right: 'KeyD',
                    jump: 'Space',
                    interact: 'KeyE',
                    weapon1: 'Digit1',
                    weapon2: 'Digit2',
                    weapon3: 'Digit3',
                    inventory: 'KeyI',
                    map: 'KeyM',
                    pause: 'Escape'
                }
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🍈 Initializing Elemelon Game...');
            
            // Show loading screen
            this.showScreen('loadingScreen');
            this.updateLoadingProgress(0, 'Initializing game engine...');
            
            // Initialize core systems
            await this.initializeCoreSystem();
            this.updateLoadingProgress(20, 'Loading assets...');
            
            // Load game assets
            await this.loadAssets();
            this.updateLoadingProgress(60, 'Setting up world...');
            
            // Initialize game world
            await this.initializeWorld();
            this.updateLoadingProgress(80, 'Finalizing setup...');
            
            // Setup event listeners
            this.setupEventListeners();
            this.updateLoadingProgress(100, 'Ready to play!');
            
            // Complete initialization
            setTimeout(() => {
                this.isInitialized = true;
                this.showMainMenu();
                console.log('🍈 Elemelon Game initialized successfully!');
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh and try again.');
        }
    }
    
    async initializeCoreSystem() {
        // Initialize game engine
        this.gameEngine = new GameEngine(this);
        await this.gameEngine.init();
        
        // Initialize managers
        this.sceneManager = new SceneManager(this);
        this.inputManager = new InputManager(this);
        this.audioManager = new AudioManager(this);
        this.saveManager = new SaveManager(this);
        this.uiManager = new UIManager(this);
        
        // Initialize systems
        await this.sceneManager.init();
        await this.inputManager.init();
        await this.audioManager.init();
        await this.uiManager.init();
    }
    
    async loadAssets() {
        // This would typically load 3D models, textures, sounds, etc.
        // For now, we'll simulate loading with promises
        const assetPromises = [
            this.loadModels(),
            this.loadTextures(),
            this.loadAudio(),
            this.loadGameData()
        ];
        
        await Promise.all(assetPromises);
    }
    
    async loadModels() {
        // Simulate model loading
        return new Promise(resolve => setTimeout(resolve, 500));
    }
    
    async loadTextures() {
        // Simulate texture loading
        return new Promise(resolve => setTimeout(resolve, 300));
    }
    
    async loadAudio() {
        // Audio loading disabled temporarily to prevent errors
        // TODO: Add actual audio files and re-enable
        console.log('🔇 Audio loading disabled - no audio files available');
        return Promise.resolve();
    }
    
    async loadGameData() {
        // Load game configuration data
        return new Promise(resolve => setTimeout(resolve, 200));
    }
    
    async initializeWorld() {
        // Initialize the Elemelon world
        await this.sceneManager.createWorld();
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('newGameBtn')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('loadGameBtn')?.addEventListener('click', () => this.loadGame());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('creditsBtn')?.addEventListener('click', () => this.showCredits());
        
        // Game UI buttons
        document.getElementById('fullmapBtn')?.addEventListener('click', () => this.showFullMap());
        document.getElementById('closeMapBtn')?.addEventListener('click', () => this.hideFullMap());
        document.getElementById('skipCutsceneBtn')?.addEventListener('click', () => this.skipCutscene());
        
        // Pause menu buttons
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('saveGameBtn')?.addEventListener('click', () => this.saveGame());
        document.getElementById('pauseSettingsBtn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('quitToMenuBtn')?.addEventListener('click', () => this.quitToMenu());
        
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveGame());
    }
    
    updateLoadingProgress(percentage, text) {
        const progressFill = document.getElementById('loadingProgressFill');
        const percentageText = document.getElementById('loadingPercentage');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (percentageText) percentageText.textContent = `${percentage}%`;
        if (loadingText) loadingText.textContent = text;
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Update game state
        if (screenId === 'mainMenu') this.gameState = 'menu';
        else if (screenId === 'gameCanvas') this.gameState = 'playing';
        else if (screenId === 'pauseMenu') this.gameState = 'paused';
        else if (screenId === 'cutsceneOverlay') this.gameState = 'cutscene';
    }
    
    showMainMenu() {
        this.showScreen('mainMenu');
        this.audioManager?.playMusic('menuMusic');
        
        // Check for saved games
        const hasSavedGame = this.saveManager?.hasSavedGame();
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.disabled = !hasSavedGame;
            loadGameBtn.style.opacity = hasSavedGame ? '1' : '0.5';
        }
    }
    
    startNewGame() {
        console.log('🍈 Starting new game...');
        
        // Reset player data
        this.resetPlayerData();
        
        // Start with opening cutscene
        this.startOpeningCutscene();
    }
    
    startOpeningCutscene() {
        this.showScreen('cutsceneOverlay');
        this.gameState = 'cutscene';
        
        // Initialize cutscene manager and play opening sequence
        const cutsceneManager = new CutsceneManager(this);
        cutsceneManager.playOpeningSequence();
    }
    
    skipCutscene() {
        // Skip to gameplay
        this.startGameplay();
    }
    
    startGameplay() {
        console.log('🍈 Starting gameplay...');
        
        this.showScreen('gameCanvas');
        this.gameState = 'playing';
        
        // Show game UI
        document.getElementById('gameUI').style.display = 'block';
        
        // Initialize gameplay scene
        this.sceneManager.startGameplayScene();
        
        // Start game loop
        this.gameEngine.startGameLoop();
        
        // Enable pointer lock for FPS controls
        this.inputManager.enablePointerLock();
        
        // Play background music
        this.audioManager?.playMusic('backgroundMusic');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseMenu');
            this.gameEngine.pauseGameLoop();
            this.inputManager.disablePointerLock();
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('gameCanvas');
            this.gameEngine.resumeGameLoop();
            this.inputManager.enablePointerLock();
        }
    }
    
    saveGame() {
        if (this.saveManager) {
            const saveData = {
                playerData: this.playerData,
                gameSettings: this.gameSettings,
                timestamp: Date.now(),
                version: '1.0.0'
            };
            
            this.saveManager.saveGame(saveData);
            console.log('🍈 Game saved successfully!');
        }
    }
    
    loadGame() {
        if (this.saveManager?.hasSavedGame()) {
            const saveData = this.saveManager.loadGame();
            if (saveData) {
                this.playerData = saveData.playerData;
                this.gameSettings = saveData.gameSettings;
                
                // Start gameplay with loaded data
                this.startGameplay();
                console.log('🍈 Game loaded successfully!');
            }
        }
    }
    
    resetPlayerData() {
        this.playerData = {
            health: 8,
            tokens: 20,
            position: { x: 0, y: 0, z: 0 },
            inventory: {
                weapons: [null, null, null],
                consumables: Array(12).fill(null),
                activeWeapon: 0
            },
            collectedElements: {
                water: false,
                lightning: false,
                wind: false,
                fire: false
            },
            completedTemples: 0,
            gameProgress: 0
        };
    }
    
    showFullMap() {
        this.showScreen('fullMap');
        // Update map display
        this.uiManager?.updateFullMap();
    }
    
    hideFullMap() {
        this.showScreen('gameCanvas');
    }
    
    showSettings() {
        // TODO: Implement settings screen
        console.log('🍈 Settings screen not implemented yet');
    }
    
    showCredits() {
        // TODO: Implement credits screen
        console.log('🍈 Credits screen not implemented yet');
    }
    
    quitToMenu() {
        this.gameEngine?.pauseGameLoop();
        this.inputManager?.disablePointerLock();
        this.showMainMenu();
        
        // Hide game UI
        document.getElementById('gameUI').style.display = 'none';
    }
    
    handleKeyDown(event) {
        if (!this.isInitialized) return;
        
        const key = event.code;
        
        // Global key handlers
        if (key === this.gameSettings.controls.keyBindings.pause) {
            event.preventDefault();
            if (this.gameState === 'playing') {
                this.pauseGame();
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            }
        }
        
        // Pass to input manager for game-specific handling
        if (this.gameState === 'playing') {
            this.inputManager?.handleKeyDown(event);
        }
    }
    
    handleKeyUp(event) {
        if (this.gameState === 'playing') {
            this.inputManager?.handleKeyUp(event);
        }
    }
    
    handleResize() {
        this.gameEngine?.handleResize();
    }
    
    showError(message) {
        console.error('🍈 Game Error:', message);
        // TODO: Implement error display UI
        alert(message);
    }
    
    // Game state getters
    getPlayerData() {
        return this.playerData;
    }
    
    getGameSettings() {
        return this.gameSettings;
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    getGameState() {
        return this.gameState;
    }
    
    // Update methods called by game loop
    update(deltaTime) {
        if (this.gameState === 'playing') {
            this.sceneManager?.update(deltaTime);
            this.uiManager?.update(deltaTime);
            this.audioManager?.update(deltaTime);
        }
    }
    
    render() {
        if (this.gameState === 'playing') {
            this.gameEngine?.render();
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🍈 Elemelon Game - Starting...');
    window.elmelonGame = new ElmelonGame();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElmelonGame;
}
