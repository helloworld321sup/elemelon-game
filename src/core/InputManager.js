/**
 * InputManager - Handles all user input for the Elemelon game
 * Manages keyboard, mouse, and touch controls for WASD movement and interactions
 */

class InputManager {
    constructor(game) {
        this.game = game;
        
        // Input state
        this.keys = {};
        this.mouseState = {
            isLocked: false,
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0
        };
        
        // Movement state
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            running: false
        };
        
        // Pointer lock controls
        this.pointerLockControls = null;
        this.isPointerLockEnabled = false;
        
        // Settings
        this.mouseSensitivity = 1.0;
        this.invertY = false;
        
        // Key bindings from game settings
        this.keyBindings = null;
    }
    
    async init() {
        console.log('🎮 Initializing Input Manager...');
        
        // Get key bindings from game settings
        this.keyBindings = this.game.getGameSettings().controls.keyBindings;
        this.mouseSensitivity = this.game.getGameSettings().controls.mouseSensitivity;
        this.invertY = this.game.getGameSettings().controls.invertY;
        
        // Initialize pointer lock controls
        this.initPointerLockControls();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('🎮 Input Manager initialized');
    }
    
    initPointerLockControls() {
        const camera = this.game.gameEngine.camera;
        this.pointerLockControls = new THREE.PointerLockControls(camera, document.body);
        
        // Add controls to scene (for the camera object)
        this.game.gameEngine.scene.add(this.pointerLockControls.getObject());
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Mouse events
        document.addEventListener('click', (event) => this.handleMouseClick(event));
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.handlePointerLockChange());
        document.addEventListener('pointerlockerror', () => this.handlePointerLockError());
        
        // Touch events for mobile
        document.addEventListener('touchstart', (event) => this.handleTouchStart(event));
        document.addEventListener('touchmove', (event) => this.handleTouchMove(event));
        document.addEventListener('touchend', (event) => this.handleTouchEnd(event));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => event.preventDefault());
    }
    
    handleKeyDown(event) {
        const key = event.code;
        this.keys[key] = true;
        
        // Update movement state based on key bindings
        this.updateMovementState();
        
        // Handle special keys
        this.handleSpecialKeys(key, true);
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
    }
    
    handleKeyUp(event) {
        const key = event.code;
        this.keys[key] = false;
        
        // Update movement state
        this.updateMovementState();
        
        // Handle special keys
        this.handleSpecialKeys(key, false);
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
    }
    
    updateMovementState() {
        this.movement.forward = this.keys[this.keyBindings.forward] || false;
        this.movement.backward = this.keys[this.keyBindings.backward] || false;
        this.movement.left = this.keys[this.keyBindings.left] || false;
        this.movement.right = this.keys[this.keyBindings.right] || false;
        this.movement.jump = this.keys[this.keyBindings.jump] || false;
        this.movement.running = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || false;
    }
    
    handleSpecialKeys(key, isPressed) {
        if (!isPressed) return; // Only handle key press, not release
        
        const bindings = this.keyBindings;
        
        // Weapon selection
        if (key === bindings.weapon1) {
            this.game.getPlayerData().inventory.activeWeapon = 0;
            this.game.uiManager?.updateWeaponSelection(0);
        } else if (key === bindings.weapon2) {
            this.game.getPlayerData().inventory.activeWeapon = 1;
            this.game.uiManager?.updateWeaponSelection(1);
        } else if (key === bindings.weapon3) {
            this.game.getPlayerData().inventory.activeWeapon = 2;
            this.game.uiManager?.updateWeaponSelection(2);
        }
        
        // Interface toggles
        if (key === bindings.inventory) {
            this.toggleInventory();
        } else if (key === bindings.map) {
            this.toggleMap();
        }
        
        // Interaction
        if (key === bindings.interact) {
            this.handleInteraction();
        }
    }
    
    handleMouseClick(event) {
        // Request pointer lock on click if in gameplay
        if (this.game.getGameState() === 'playing' && !this.isPointerLockEnabled) {
            this.enablePointerLock();
        }
        
        // Handle weapon firing or interactions
        if (this.isPointerLockEnabled) {
            if (event.button === 0) { // Left click
                this.handlePrimaryAction();
            } else if (event.button === 2) { // Right click
                this.handleSecondaryAction();
            }
        }
    }
    
    handleMouseMove(event) {
        if (!this.isPointerLockEnabled) return;
        
        // Update mouse delta for camera rotation
        this.mouseState.deltaX = event.movementX * this.mouseSensitivity;
        this.mouseState.deltaY = event.movementY * this.mouseSensitivity;
        
        if (this.invertY) {
            this.mouseState.deltaY *= -1;
        }
        
        // Apply camera rotation
        this.updateCameraRotation();
    }
    
    updateCameraRotation() {
        if (!this.pointerLockControls) return;
        
        // The PointerLockControls handles rotation automatically
        // We just need to ensure it's active
    }
    
    handlePointerLockChange() {
        this.isPointerLockEnabled = document.pointerLockElement === document.body;
        
        if (this.isPointerLockEnabled) {
            console.log('🎮 Pointer lock enabled');
        } else {
            console.log('🎮 Pointer lock disabled');
            // Pause game if pointer lock is lost during gameplay
            if (this.game.getGameState() === 'playing') {
                this.game.pauseGame();
            }
        }
    }
    
    handlePointerLockError() {
        console.error('🎮 Pointer lock error');
    }
    
    // Touch events for mobile support
    handleTouchStart(event) {
        // Implement touch controls for mobile
        // This is a basic implementation
        event.preventDefault();
    }
    
    handleTouchMove(event) {
        // Handle touch movement for mobile camera control
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        // Handle touch end events
        event.preventDefault();
    }
    
    // Action handlers
    handlePrimaryAction() {
        // Fire weapon or interact
        const player = this.game.sceneManager?.player;
        if (player) {
            player.primaryAction();
        }
    }
    
    handleSecondaryAction() {
        // Secondary weapon action or aim
        const player = this.game.sceneManager?.player;
        if (player) {
            player.secondaryAction();
        }
    }
    
    handleInteraction() {
        // Interact with nearby objects
        const player = this.game.sceneManager?.player;
        if (player) {
            player.interact();
        }
    }
    
    toggleInventory() {
        // Toggle inventory display
        this.game.uiManager?.toggleInventory();
    }
    
    toggleMap() {
        // Toggle map display
        this.game.showFullMap();
    }
    
    // Pointer lock management
    enablePointerLock() {
        if (this.game.getGameState() === 'playing') {
            document.body.requestPointerLock();
        }
    }
    
    disablePointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    // Movement getters for player
    getMovementInput() {
        return {
            forward: this.movement.forward,
            backward: this.movement.backward,
            left: this.movement.left,
            right: this.movement.right,
            jump: this.movement.jump,
            running: this.movement.running
        };
    }
    
    getMouseDelta() {
        const delta = {
            x: this.mouseState.deltaX,
            y: this.mouseState.deltaY
        };
        
        // Reset deltas after reading
        this.mouseState.deltaX = 0;
        this.mouseState.deltaY = 0;
        
        return delta;
    }
    
    // Utility methods
    isGameKey(key) {
        const bindings = this.keyBindings;
        return Object.values(bindings).includes(key) || 
               ['ShiftLeft', 'ShiftRight'].includes(key);
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    // Settings updates
    updateMouseSensitivity(sensitivity) {
        this.mouseSensitivity = sensitivity;
    }
    
    updateInvertY(invert) {
        this.invertY = invert;
    }
    
    updateKeyBindings(newBindings) {
        this.keyBindings = newBindings;
    }
    
    // Mobile detection and touch controls
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupMobileControls() {
        if (this.isMobileDevice()) {
            // Create virtual joystick and buttons for mobile
            this.createVirtualControls();
        }
    }
    
    createVirtualControls() {
        // TODO: Implement virtual joystick and buttons for mobile
        console.log('📱 Mobile controls would be implemented here');
    }
    
    // Debug methods
    getInputState() {
        return {
            keys: this.keys,
            movement: this.movement,
            mouseState: this.mouseState,
            pointerLock: this.isPointerLockEnabled
        };
    }
    
    // Cleanup
    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('click', this.handleMouseClick);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('pointerlockerror', this.handlePointerLockError);
        
        // Disable pointer lock
        this.disablePointerLock();
        
        console.log('🎮 Input Manager disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputManager;
}
