/**
 * Temple - Temple system for Elemelon
 * Handles temple generation, puzzles, and boss encounters
 */

class Temple {
    constructor(game, type, position) {
        this.game = game;
        this.type = type; // water, fire, wind, lightning
        this.position = position;
        
        // Temple properties
        this.isCompleted = false;
        this.isUnlocked = true;
        this.difficulty = 1;
        
        // Temple structure
        this.mesh = null;
        this.interiorObjects = [];
        this.puzzleElements = [];
        
        // Temple systems
        this.puzzleManager = null;
        this.bossEncounter = null;
        this.rewards = [];
        
        // Visual effects
        this.elementalEffects = [];
        this.ambientParticles = null;
        
        this.init();
    }
    
    init() {
        console.log(`🏛️ Initializing ${this.type} Temple...`);
        
        // Create temple structure
        this.createTempleStructure();
        
        // Setup temple systems
        this.setupPuzzleSystem();
        this.setupBossEncounter();
        this.setupRewards();
        
        // Add visual effects
        this.createVisualEffects();
        
        console.log(`🏛️ ${this.type} Temple initialized`);
    }
    
    createTempleStructure() {
        const templeGroup = new THREE.Group();
        
        // Main temple building
        this.createMainBuilding(templeGroup);
        
        // Temple pillars
        this.createPillars(templeGroup);
        
        // Temple roof
        this.createRoof(templeGroup);
        
        // Interior elements
        this.createInterior(templeGroup);
        
        // Temple entrance
        this.createEntrance(templeGroup);
        
        this.mesh = templeGroup;
        this.mesh.position.copy(this.position);
        
        // Add temple data
        this.mesh.userData = {
            type: this.type,
            isTemple: true,
            temple: this,
            interactable: true
        };
        
        this.game.gameEngine.addToScene(this.mesh);
    }
    
    createMainBuilding(group) {
        const color = this.getElementalColor();
        
        // Main structure
        const buildingGeometry = new THREE.BoxGeometry(25, 18, 25);
        const buildingMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 9;
        building.castShadow = true;
        building.receiveShadow = true;
        
        group.add(building);
        
        // Temple walls with details
        this.addWallDetails(group, color);
    }
    
    addWallDetails(group, color) {
        // Add decorative elements to walls
        const detailMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color(color).multiplyScalar(1.2),
            emissive: new THREE.Color(color).multiplyScalar(0.1)
        });
        
        // Wall decorations
        const decorationPositions = [
            { x: 0, y: 12, z: 12.6 }, // Front
            { x: 0, y: 12, z: -12.6 }, // Back
            { x: 12.6, y: 12, z: 0 }, // Right
            { x: -12.6, y: 12, z: 0 } // Left
        ];
        
        decorationPositions.forEach(pos => {
            const decorGeometry = new THREE.BoxGeometry(8, 4, 0.2);
            const decoration = new THREE.Mesh(decorGeometry, detailMaterial);
            decoration.position.set(pos.x, pos.y, pos.z);
            group.add(decoration);
        });
    }
    
    createPillars(group) {
        const color = this.getElementalColor();
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        const pillarPositions = [
            { x: -10, z: -10 },
            { x: 10, z: -10 },
            { x: -10, z: 10 },
            { x: 10, z: 10 },
            { x: 0, z: -12 }, // Front center
            { x: 0, z: 12 }   // Back center
        ];
        
        pillarPositions.forEach(pos => {
            const pillarGeometry = new THREE.CylinderGeometry(1.5, 1.8, 18, 8);
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, 9, pos.z);
            pillar.castShadow = true;
            group.add(pillar);
            
            // Pillar capitals
            const capitalGeometry = new THREE.BoxGeometry(3, 1, 3);
            const capital = new THREE.Mesh(capitalGeometry, pillarMaterial);
            capital.position.set(pos.x, 18, pos.z);
            group.add(capital);
        });
    }
    
    createRoof(group) {
        const color = this.getElementalColor();
        
        // Main roof
        const roofGeometry = new THREE.ConeGeometry(18, 10, 8);
        const roofMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color(color).multiplyScalar(0.8)
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 23;
        roof.rotation.y = Math.PI / 8;
        roof.castShadow = true;
        
        group.add(roof);
        
        // Roof ornament
        const ornamentGeometry = new THREE.SphereGeometry(2, 8, 8);
        const ornamentMaterial = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
        ornament.position.y = 29;
        group.add(ornament);
    }
    
    createInterior(group) {
        // Interior will be created when player enters
        this.createInteriorLayout();
    }
    
    createInteriorLayout() {
        // Define interior layout
        this.interiorLayout = {
            entrance: { x: 0, z: 12 },
            altar: { x: 0, z: -10 },
            puzzleAreas: [
                { x: -8, z: -5, type: 'switch' },
                { x: 8, z: -5, type: 'pressure_plate' },
                { x: 0, z: 0, type: 'crystal' }
            ],
            bossArea: { x: 0, z: -15, radius: 8 }
        };
    }
    
    createEntrance(group) {
        // Temple entrance door
        const doorGeometry = new THREE.BoxGeometry(4, 8, 0.5);
        const doorMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            transparent: true,
            opacity: 0.9
        });
        
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 4, 12.8);
        
        group.add(door);
        
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(5, 9, 1);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: this.getElementalColor()
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 4.5, 12.5);
        
        group.add(frame);
        
        // Store door reference for animations
        this.door = door;
    }
    
    getElementalColor() {
        const colors = {
            water: 0x4080ff,
            fire: 0xff4040,
            wind: 0x80ff80,
            lightning: 0xffff40,
            earth: 0x8B4513
        };
        
        return colors[this.type] || 0x808080;
    }
    
    setupPuzzleSystem() {
        this.puzzleManager = new TemplePuzzleManager(this.game, this.type);
        
        // Define temple-specific puzzles
        this.definePuzzles();
    }
    
    definePuzzles() {
        switch (this.type) {
            case 'water':
                this.puzzleManager.addPuzzle({
                    type: 'flow_control',
                    description: 'Direct the water flow to activate all crystals',
                    difficulty: 2
                });
                break;
                
            case 'fire':
                this.puzzleManager.addPuzzle({
                    type: 'flame_sequence',
                    description: 'Light the torches in the correct order',
                    difficulty: 3
                });
                break;
                
            case 'wind':
                this.puzzleManager.addPuzzle({
                    type: 'wind_currents',
                    description: 'Use wind currents to move objects to their positions',
                    difficulty: 2
                });
                break;
                
            case 'lightning':
                this.puzzleManager.addPuzzle({
                    type: 'circuit_completion',
                    description: 'Complete the electrical circuit to power the altar',
                    difficulty: 4
                });
                break;
        }
    }
    
    setupBossEncounter() {
        this.bossEncounter = new TempleBossEncounter(this.game, this.type);
        this.bossEncounter.setTemple(this);
    }
    
    setupRewards() {
        // Define temple rewards
        this.rewards = [
            {
                type: 'elemental_power',
                element: this.type,
                name: `${this.type}melon`,
                description: `The power of ${this.type}`
            },
            {
                type: 'tokens',
                amount: 50,
                description: 'Temple completion bonus'
            },
            {
                type: 'experience',
                amount: 100,
                description: 'Temple mastery experience'
            }
        ];
    }
    
    createVisualEffects() {
        // Add elemental particle effects
        this.createElementalParticles();
        
        // Add ambient lighting effects
        this.createAmbientLighting();
        
        // Add elemental aura
        this.createElementalAura();
    }
    
    createElementalParticles() {
        // Create particle system based on element type
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 30;     // x
            positions[i + 1] = Math.random() * 25;         // y
            positions[i + 2] = (Math.random() - 0.5) * 30; // z
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: this.getElementalColor(),
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        this.ambientParticles = new THREE.Points(geometry, material);
        this.mesh.add(this.ambientParticles);
    }
    
    createAmbientLighting() {
        // Add colored lighting around the temple
        const lightColor = this.getElementalColor();
        
        const ambientLight = new THREE.PointLight(lightColor, 0.5, 50);
        ambientLight.position.set(0, 15, 0);
        
        this.mesh.add(ambientLight);
        
        // Add multiple colored lights around the temple
        const lightPositions = [
            { x: -12, y: 10, z: -12 },
            { x: 12, y: 10, z: -12 },
            { x: -12, y: 10, z: 12 },
            { x: 12, y: 10, z: 12 }
        ];
        
        lightPositions.forEach(pos => {
            const light = new THREE.PointLight(lightColor, 0.3, 20);
            light.position.set(pos.x, pos.y, pos.z);
            this.mesh.add(light);
        });
    }
    
    createElementalAura() {
        // Create glowing aura effect around temple
        const auraGeometry = new THREE.SphereGeometry(30, 32, 32);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: this.getElementalColor(),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.y = 10;
        
        this.mesh.add(aura);
        this.elementalAura = aura;
    }
    
    // Temple interaction methods
    onPlayerEnter(player) {
        console.log(`🏛️ Player entered ${this.type} temple`);
        
        // Play temple entrance cutscene
        const cutsceneManager = new CutsceneManager(this.game);
        cutsceneManager.playTempleEntranceCutscene(this.type);
        
        // Start temple music
        this.game.audioManager?.playEnvironmentalAudio('temple');
        
        // Initialize temple interior
        this.initializeTempleInterior();
        
        // Start puzzle system
        this.puzzleManager?.startPuzzles();
    }
    
    initializeTempleInterior() {
        // Create interior objects when player enters
        this.createInteriorObjects();
        
        // Setup puzzle elements
        this.createPuzzleElements();
        
        // Prepare boss encounter
        this.bossEncounter?.prepare();
    }
    
    createInteriorObjects() {
        // Create altar
        this.createAltar();
        
        // Create decorative elements
        this.createInteriorDecorations();
        
        // Create interactive objects
        this.createInteractiveObjects();
    }
    
    createAltar() {
        const altarGeometry = new THREE.CylinderGeometry(3, 4, 2, 8);
        const altarMaterial = new THREE.MeshLambertMaterial({
            color: this.getElementalColor(),
            emissive: this.getElementalColor(),
            emissiveIntensity: 0.2
        });
        
        const altar = new THREE.Mesh(altarGeometry, altarMaterial);
        altar.position.set(
            this.interiorLayout.altar.x,
            1,
            this.interiorLayout.altar.z
        );
        
        this.mesh.add(altar);
        this.altar = altar;
    }
    
    createInteriorDecorations() {
        // Add torches, crystals, elemental decorations
        this.createTorches();
        this.createCrystals();
        this.createElementalSymbols();
    }
    
    createTorches() {
        const torchPositions = [
            { x: -10, z: 5 },
            { x: 10, z: 5 },
            { x: -10, z: -5 },
            { x: 10, z: -5 }
        ];
        
        torchPositions.forEach(pos => {
            const torch = this.createTorch();
            torch.position.set(pos.x, 0, pos.z);
            this.mesh.add(torch);
        });
    }
    
    createTorch() {
        const torchGroup = new THREE.Group();
        
        // Torch post
        const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 2;
        
        // Flame
        const flameGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: this.getElementalColor(),
            emissive: this.getElementalColor(),
            emissiveIntensity: 0.8
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 4.5;
        
        torchGroup.add(post);
        torchGroup.add(flame);
        
        return torchGroup;
    }
    
    createCrystals() {
        const crystalPositions = [
            { x: -5, z: -8 },
            { x: 5, z: -8 },
            { x: 0, z: -12 }
        ];
        
        crystalPositions.forEach(pos => {
            const crystal = this.createCrystal();
            crystal.position.set(pos.x, 0, pos.z);
            this.mesh.add(crystal);
        });
    }
    
    createCrystal() {
        const crystalGeometry = new THREE.OctahedronGeometry(1.5);
        const crystalMaterial = new THREE.MeshLambertMaterial({
            color: this.getElementalColor(),
            transparent: true,
            opacity: 0.8,
            emissive: this.getElementalColor(),
            emissiveIntensity: 0.3
        });
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = 1.5;
        
        return crystal;
    }
    
    createElementalSymbols() {
        // Create symbols on the floor/walls representing the element
        const symbolGeometry = new THREE.CircleGeometry(2, 16);
        const symbolMaterial = new THREE.MeshBasicMaterial({
            color: this.getElementalColor(),
            transparent: true,
            opacity: 0.5
        });
        
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.rotation.x = -Math.PI / 2;
        symbol.position.set(0, 0.1, 0);
        
        this.mesh.add(symbol);
    }
    
    createInteractiveObjects() {
        // Create objects players can interact with
        this.createSwitches();
        this.createPressurePlates();
    }
    
    createSwitches() {
        // Create puzzle switches
        this.interiorLayout.puzzleAreas
            .filter(area => area.type === 'switch')
            .forEach(area => {
                const switchObj = this.createSwitch();
                switchObj.position.set(area.x, 0, area.z);
                this.mesh.add(switchObj);
                this.puzzleElements.push(switchObj);
            });
    }
    
    createSwitch() {
        const switchGroup = new THREE.Group();
        
        // Switch base
        const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.5);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        
        // Switch lever
        const leverGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
        const leverMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const lever = new THREE.Mesh(leverGeometry, leverMaterial);
        lever.position.y = 1.5;
        
        switchGroup.add(base);
        switchGroup.add(lever);
        
        // Add interaction data
        switchGroup.userData = {
            type: 'switch',
            isActive: false,
            interactable: true
        };
        
        return switchGroup;
    }
    
    createPressurePlates() {
        // Create pressure plates
        this.interiorLayout.puzzleAreas
            .filter(area => area.type === 'pressure_plate')
            .forEach(area => {
                const plate = this.createPressurePlate();
                plate.position.set(area.x, 0, area.z);
                this.mesh.add(plate);
                this.puzzleElements.push(plate);
            });
    }
    
    createPressurePlate() {
        const plateGeometry = new THREE.CylinderGeometry(2, 2, 0.2);
        const plateMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.y = 0.1;
        
        plate.userData = {
            type: 'pressure_plate',
            isPressed: false,
            interactable: true
        };
        
        return plate;
    }
    
    createPuzzleElements() {
        // Create puzzle-specific elements based on temple type
        switch (this.type) {
            case 'water':
                this.createWaterPuzzleElements();
                break;
            case 'fire':
                this.createFirePuzzleElements();
                break;
            case 'wind':
                this.createWindPuzzleElements();
                break;
            case 'lightning':
                this.createLightningPuzzleElements();
                break;
        }
    }
    
    createWaterPuzzleElements() {
        // Water flow channels, dams, etc.
        console.log('🌊 Creating water puzzle elements');
    }
    
    createFirePuzzleElements() {
        // Torch sequences, fire barriers, etc.
        console.log('🔥 Creating fire puzzle elements');
    }
    
    createWindPuzzleElements() {
        // Wind currents, moveable objects, etc.
        console.log('💨 Creating wind puzzle elements');
    }
    
    createLightningPuzzleElements() {
        // Electrical circuits, conductors, etc.
        console.log('⚡ Creating lightning puzzle elements');
    }
    
    // Temple completion
    onPuzzlesSolved() {
        console.log(`🧩 ${this.type} temple puzzles solved!`);
        
        // Unlock boss encounter
        this.bossEncounter?.activate();
        
        // Visual feedback
        this.playPuzzleSolvedEffects();
    }
    
    onBossDefeated() {
        console.log(`👹 ${this.type} temple boss defeated!`);
        
        // Mark temple as completed
        this.isCompleted = true;
        
        // Give rewards
        this.giveRewards();
        
        // Play victory effects
        this.playVictoryEffects();
        
        // Play victory cutscene
        const cutsceneManager = new CutsceneManager(this.game);
        cutsceneManager.playBossDefeatCutscene(this.type);
    }
    
    giveRewards() {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        this.rewards.forEach(reward => {
            switch (reward.type) {
                case 'elemental_power':
                    this.grantElementalPower(player, reward);
                    break;
                case 'tokens':
                    player.addTokens(reward.amount);
                    break;
                case 'experience':
                    // TODO: Implement experience system
                    console.log(`📈 Gained ${reward.amount} experience`);
                    break;
            }
        });
    }
    
    grantElementalPower(player, reward) {
        // Grant elemental power to player
        const playerData = this.game.getPlayerData();
        playerData.collectedElements[this.type] = true;
        playerData.completedTemples++;
        
        console.log(`✨ Gained ${reward.name} power!`);
        
        // Update game progress
        const totalTemples = 4;
        playerData.gameProgress = (playerData.completedTemples / totalTemples) * 100;
    }
    
    playPuzzleSolvedEffects() {
        // Visual and audio feedback for puzzle completion
        this.createSuccessParticles();
        this.game.audioManager?.playUISound('success');
    }
    
    playVictoryEffects() {
        // Victory celebration effects
        this.createVictoryParticles();
        this.animateTempleCompletion();
        this.game.audioManager?.playUISound('victory');
    }
    
    createSuccessParticles() {
        // Create particle burst effect
        // This would be a more complex particle system in a full implementation
    }
    
    createVictoryParticles() {
        // Create victory celebration particles
        // This would be a spectacular effect in a full implementation
    }
    
    animateTempleCompletion() {
        // Animate temple transformation after completion
        if (this.elementalAura) {
            // Make aura more prominent
            this.elementalAura.material.opacity = 0.3;
            this.elementalAura.scale.multiplyScalar(1.2);
        }
        
        // Add golden glow to indicate completion
        const completionGlow = new THREE.PointLight(0xFFD700, 1, 100);
        completionGlow.position.set(0, 20, 0);
        this.mesh.add(completionGlow);
    }
    
    // Update methods
    update(deltaTime) {
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update puzzle system
        this.puzzleManager?.update(deltaTime);
        
        // Update boss encounter
        this.bossEncounter?.update(deltaTime);
    }
    
    updateVisualEffects(deltaTime) {
        // Animate particles
        if (this.ambientParticles) {
            this.ambientParticles.rotation.y += deltaTime * 0.5;
            
            // Animate particle positions
            const positions = this.ambientParticles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
            }
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate elemental aura
        if (this.elementalAura) {
            this.elementalAura.rotation.y += deltaTime * 0.2;
            
            const time = Date.now() * 0.001;
            const opacity = 0.1 + Math.sin(time) * 0.05;
            this.elementalAura.material.opacity = opacity;
        }
    }
    
    // Cleanup
    dispose() {
        if (this.mesh) {
            this.game.gameEngine.removeFromScene(this.mesh);
        }
        
        this.puzzleManager?.dispose();
        this.bossEncounter?.dispose();
        
        console.log(`🏛️ ${this.type} Temple disposed`);
    }
}

// Temple Puzzle Manager
class TemplePuzzleManager {
    constructor(game, templeType) {
        this.game = game;
        this.templeType = templeType;
        this.puzzles = [];
        this.activePuzzles = [];
        this.completedPuzzles = [];
    }
    
    addPuzzle(puzzleData) {
        this.puzzles.push(puzzleData);
    }
    
    startPuzzles() {
        this.activePuzzles = [...this.puzzles];
        console.log(`🧩 Started ${this.activePuzzles.length} puzzles for ${this.templeType} temple`);
    }
    
    solvePuzzle(puzzleIndex) {
        if (puzzleIndex >= 0 && puzzleIndex < this.activePuzzles.length) {
            const puzzle = this.activePuzzles.splice(puzzleIndex, 1)[0];
            this.completedPuzzles.push(puzzle);
            
            console.log(`🧩 Solved puzzle: ${puzzle.description}`);
            
            if (this.activePuzzles.length === 0) {
                this.onAllPuzzlesSolved();
            }
        }
    }
    
    onAllPuzzlesSolved() {
        console.log(`🧩 All ${this.templeType} temple puzzles solved!`);
        // Notify temple
        // this.temple?.onPuzzlesSolved();
    }
    
    update(deltaTime) {
        // Update active puzzles
    }
    
    dispose() {
        this.puzzles = [];
        this.activePuzzles = [];
        this.completedPuzzles = [];
    }
}

// Temple Boss Encounter
class TempleBossEncounter {
    constructor(game, templeType) {
        this.game = game;
        this.templeType = templeType;
        this.temple = null;
        this.boss = null;
        this.isActive = false;
    }
    
    setTemple(temple) {
        this.temple = temple;
    }
    
    prepare() {
        // Prepare boss encounter
        console.log(`👹 Preparing ${this.templeType} temple boss encounter`);
    }
    
    activate() {
        if (!this.isActive) {
            this.isActive = true;
            this.spawnBoss();
            console.log(`👹 Activated ${this.templeType} temple boss encounter`);
        }
    }
    
    spawnBoss() {
        // Create temple boss based on type
        switch (this.templeType) {
            case 'water':
                this.boss = new WaterTempleBoss(this.game);
                break;
            case 'fire':
                this.boss = new FireTempleBoss(this.game);
                break;
            default:
                this.boss = new Enemy(this.game, `${this.templeType}_boss`);
                break;
        }
        
        if (this.boss && this.temple) {
            // Position boss in temple
            const bossArea = this.temple.interiorLayout.bossArea;
            this.boss.setPosition(bossArea.x, 0, bossArea.z);
            
            // Add boss to scene
            this.game.gameEngine.addToScene(this.boss.mesh);
        }
    }
    
    onBossDefeated() {
        this.isActive = false;
        this.temple?.onBossDefeated();
    }
    
    update(deltaTime) {
        if (this.isActive && this.boss) {
            this.boss.update(deltaTime);
            
            // Check if boss is defeated
            if (this.boss.health <= 0) {
                this.onBossDefeated();
            }
        }
    }
    
    dispose() {
        if (this.boss) {
            this.boss.dispose();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Temple;
}
