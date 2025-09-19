/**
 * GameEngine - Core 3D rendering and game loop management
 * Handles Three.js setup, rendering pipeline, and frame management
 */

class GameEngine {
    constructor(game) {
        this.game = game;
        
        // Three.js core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        
        // Rendering components
        this.clock = new THREE.Clock();
        this.frameId = null;
        this.isRunning = false;
        this.isPaused = false;
        
        // Performance tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Lighting setup
        this.ambientLight = null;
        this.directionalLight = null;
        this.shadowCamera = null;
        
        // Post-processing
        this.composer = null;
        
        // World bounds
        this.worldSize = 1000; // Size of the game world
    }
    
    async init() {
        try {
            console.log('🎮 Initializing Game Engine...');
            
            // Get canvas element
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Game canvas not found');
            }
            
            // Initialize Three.js components
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.initLighting();
            this.initPostProcessing();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            console.log('🎮 Game Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Game Engine:', error);
            throw error;
        }
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        
        // Set background to grey (Elemelon world is grey)
        this.scene.background = new THREE.Color(0x808080); // Grey color
        
        // Add fog for atmosphere
        this.scene.fog = new THREE.Fog(0x808080, 50, 300);
    }
    
    initCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Create perspective camera for 3D view
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Set initial camera position (will be controlled by player)
        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(0, 0, 0);
    }
    
    initRenderer() {
        const settings = this.game.getGameSettings().graphics;
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: settings.antialiasing,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows if supported
        if (settings.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Set rendering parameters
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Enable physically correct lighting
        this.renderer.useLegacyLights = false;
    }
    
    initLighting() {
        // Ambient light for overall illumination
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.ambientLight);
        
        // Directional light (sun) for shadows and main lighting
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(100, 100, 50);
        this.directionalLight.castShadow = true;
        
        // Configure shadow properties
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(this.directionalLight);
        
        // Add hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.4);
        this.scene.add(hemisphereLight);
    }
    
    initPostProcessing() {
        // Post-processing effects would be initialized here
        // For now, we'll keep it simple without post-processing
        this.composer = null;
    }
    
    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle visibility change (pause when tab not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                this.pauseGameLoop();
            } else if (!document.hidden && this.isPaused && this.game.getGameState() === 'playing') {
                this.resumeGameLoop();
            }
        });
    }
    
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update camera aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Update post-processing composer if it exists
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    startGameLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.clock.start();
            this.gameLoop();
            console.log('🎮 Game loop started');
        }
    }
    
    pauseGameLoop() {
        this.isPaused = true;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        console.log('🎮 Game loop paused');
    }
    
    resumeGameLoop() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.clock.start();
            this.gameLoop();
            console.log('🎮 Game loop resumed');
        }
    }
    
    stopGameLoop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        
        console.log('🎮 Game loop stopped');
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Schedule next frame
        this.frameId = requestAnimationFrame(() => this.gameLoop());
        
        // Calculate delta time
        const deltaTime = this.clock.getDelta();
        
        // Update FPS counter
        this.updateFPS();
        
        // Update game systems
        this.update(deltaTime);
        
        // Render frame
        this.render();
    }
    
    update(deltaTime) {
        // Update game logic
        this.game.update(deltaTime);
        
        // Update any engine-specific systems here
        this.updateLighting(deltaTime);
    }
    
    updateLighting(deltaTime) {
        // Animate lighting for day/night cycle or atmosphere effects
        // For now, keep lighting static
    }
    
    render() {
        if (this.composer) {
            // Render with post-processing
            this.composer.render();
        } else {
            // Direct rendering
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        
        if (now >= this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    // Utility methods for adding/removing objects
    addToScene(object) {
        this.scene.add(object);
    }
    
    removeFromScene(object) {
        this.scene.remove(object);
    }
    
    // Camera control methods
    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    setCameraRotation(x, y, z) {
        this.camera.rotation.set(x, y, z);
    }
    
    getCameraPosition() {
        return this.camera.position.clone();
    }
    
    getCameraDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }
    
    // Raycasting for interaction detection
    raycast(origin, direction, objects, distance = 10) {
        const raycaster = new THREE.Raycaster(origin, direction, 0, distance);
        return raycaster.intersectObjects(objects, true);
    }
    
    // Screen to world coordinate conversion
    screenToWorld(x, y, z = 0) {
        const vector = new THREE.Vector3();
        vector.set(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1,
            z
        );
        vector.unproject(this.camera);
        return vector;
    }
    
    // World to screen coordinate conversion
    worldToScreen(worldPosition) {
        const vector = worldPosition.clone();
        vector.project(this.camera);
        
        return {
            x: (vector.x + 1) * window.innerWidth / 2,
            y: (-vector.y + 1) * window.innerHeight / 2
        };
    }
    
    // Graphics settings management
    updateGraphicsSettings(settings) {
        // Update renderer settings
        this.renderer.shadowMap.enabled = settings.shadows;
        
        // Update lighting quality
        if (settings.quality === 'low') {
            this.directionalLight.shadow.mapSize.setScalar(1024);
        } else if (settings.quality === 'medium') {
            this.directionalLight.shadow.mapSize.setScalar(2048);
        } else {
            this.directionalLight.shadow.mapSize.setScalar(4096);
        }
        
        // Update antialiasing (requires renderer recreation)
        if (this.renderer.getContext().getParameter(this.renderer.getContext().SAMPLES) !== (settings.antialiasing ? 4 : 0)) {
            // Would need to recreate renderer for antialiasing change
            console.log('Antialiasing change requires restart');
        }
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return {
            fps: this.fps,
            memoryUsage: this.renderer.info.memory,
            renderCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles
        };
    }
    
    // Cleanup
    dispose() {
        this.stopGameLoop();
        
        // Dispose of Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Clear scene
        if (this.scene) {
            this.scene.clear();
        }
        
        console.log('🎮 Game Engine disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
