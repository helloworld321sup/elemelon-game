/**
 * World - Main world management for Elemelon
 * Handles world generation, physics, and environmental systems
 */

class World {
    constructor(game) {
        this.game = game;
        this.gameEngine = game.gameEngine;
        
        // World properties
        this.size = 1000;
        this.isGenerated = false;
        
        // World objects
        this.terrain = null;
        this.buildings = [];
        this.environment = [];
        
        // Environmental effects
        this.weather = 'clear';
        this.timeOfDay = 12; // 0-24 hours
        this.ambientSounds = [];
        
        // Physics world
        this.physicsObjects = [];
        this.collisionGroups = {
            static: [],
            dynamic: [],
            triggers: []
        };
    }
    
    async init() {
        console.log('🌍 Initializing World...');
        
        // Generate world
        await this.generateWorld();
        
        // Setup physics
        this.setupPhysics();
        
        // Initialize environmental systems
        this.setupEnvironment();
        
        console.log('🌍 World initialized');
    }
    
    async generateWorld() {
        console.log('🌍 Generating world...');
        
        // Generate terrain
        this.generateTerrain();
        
        // Generate city layout
        this.generateCity();
        
        // Generate natural features
        this.generateNaturalFeatures();
        
        // Place world objects
        this.placeWorldObjects();
        
        this.isGenerated = true;
        console.log('🌍 World generation complete');
    }
    
    generateTerrain() {
        // Create base terrain
        const terrainGeometry = new THREE.PlaneGeometry(this.size, this.size, 100, 100);
        
        // Add height variation
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Add subtle height variation
            vertices[i + 1] = Math.random() * 2 - 1; // Y coordinate
        }
        
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x606060, // Grey terrain
            wireframe: false
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        
        this.gameEngine.addToScene(this.terrain);
        this.collisionGroups.static.push(this.terrain);
    }
    
    generateCity() {
        console.log('🏙️ Generating city layout...');
        
        // Create city districts
        this.createDistricts();
        
        // Generate street network
        this.generateStreets();
        
        // Place buildings
        this.generateBuildings();
        
        // Add city infrastructure
        this.addCityInfrastructure();
    }
    
    createDistricts() {
        // Define city districts
        this.districts = [
            { 
                name: 'Central Plaza', 
                center: { x: 0, z: 0 }, 
                radius: 30,
                type: 'commercial'
            },
            { 
                name: 'Temple District', 
                center: { x: 0, z: 0 }, 
                radius: 200,
                type: 'religious'
            },
            { 
                name: 'Market District', 
                center: { x: 0, z: 0 }, 
                radius: 50,
                type: 'commercial'
            }
        ];
    }
    
    generateStreets() {
        // Create main street grid
        const streetWidth = 4;
        const streetMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x404040 
        });
        
        // North-South streets
        for (let x = -200; x <= 200; x += 50) {
            const streetGeometry = new THREE.PlaneGeometry(streetWidth, 400);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(x, 0.1, 0);
            
            this.gameEngine.addToScene(street);
            this.environment.push(street);
        }
        
        // East-West streets
        for (let z = -200; z <= 200; z += 50) {
            const streetGeometry = new THREE.PlaneGeometry(400, streetWidth);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(0, 0.1, z);
            
            this.gameEngine.addToScene(street);
            this.environment.push(street);
        }
    }
    
    generateBuildings() {
        const buildingCount = 80;
        const cityRadius = 250;
        
        for (let i = 0; i < buildingCount; i++) {
            const building = this.createRandomBuilding();
            
            // Find valid position
            let position;
            let attempts = 0;
            do {
                position = this.getRandomCityPosition(cityRadius);
                attempts++;
            } while (!this.isValidBuildingPosition(position) && attempts < 50);
            
            if (attempts < 50) {
                building.position.copy(position);
                this.buildings.push(building);
                this.gameEngine.addToScene(building);
                this.collisionGroups.static.push(building);
            }
        }
        
        console.log(`🏗️ Generated ${this.buildings.length} buildings`);
    }
    
    createRandomBuilding() {
        const width = 8 + Math.random() * 15;
        const height = 15 + Math.random() * 40;
        const depth = 8 + Math.random() * 15;
        
        const buildingGroup = new THREE.Group();
        
        // Main building structure
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0, 0, 0.2 + Math.random() * 0.4)
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        buildingGroup.add(building);
        
        // Add building details
        this.addBuildingDetails(buildingGroup, width, height, depth);
        
        // Add collision data
        buildingGroup.userData = {
            type: 'building',
            bounds: { width, height, depth },
            collidable: true
        };
        
        return buildingGroup;
    }
    
    addBuildingDetails(buildingGroup, width, height, depth) {
        // Add windows
        const windowCount = Math.floor(height / 4);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        for (let floor = 1; floor <= windowCount; floor++) {
            // Front windows
            for (let w = 0; w < Math.floor(width / 3); w++) {
                const windowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    -width/2 + 2 + w * 3,
                    floor * 4,
                    depth/2 + 0.1
                );
                buildingGroup.add(window);
            }
        }
        
        // Add rooftop elements
        if (Math.random() < 0.3) {
            const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
            const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.position.y = height + 1.5;
            buildingGroup.add(antenna);
        }
    }
    
    getRandomCityPosition(radius) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        return new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
    }
    
    isValidBuildingPosition(position) {
        const minDistance = 20;
        
        // Check distance from spawn point
        if (position.length() < 30) return false;
        
        // Check distance from temples
        const templePositions = [
            new THREE.Vector3(-150, 0, -150),
            new THREE.Vector3(150, 0, -150),
            new THREE.Vector3(-150, 0, 150),
            new THREE.Vector3(150, 0, 150)
        ];
        
        for (const templePos of templePositions) {
            if (position.distanceTo(templePos) < 40) return false;
        }
        
        // Check distance from other buildings
        for (const building of this.buildings) {
            if (position.distanceTo(building.position) < minDistance) return false;
        }
        
        return true;
    }
    
    addCityInfrastructure() {
        // Add street lamps
        this.addStreetLamps();
        
        // Add decorative elements
        this.addDecorations();
        
        // Add ambient objects
        this.addAmbientObjects();
    }
    
    addStreetLamps() {
        const lampPositions = [];
        
        // Place lamps at street intersections
        for (let x = -200; x <= 200; x += 50) {
            for (let z = -200; z <= 200; z += 50) {
                if (Math.abs(x) > 25 || Math.abs(z) > 25) { // Avoid center area
                    lampPositions.push({ x, z });
                }
            }
        }
        
        lampPositions.forEach(pos => {
            const lamp = this.createStreetLamp();
            lamp.position.set(pos.x, 0, pos.z);
            this.gameEngine.addToScene(lamp);
            this.environment.push(lamp);
        });
        
        console.log(`💡 Added ${lampPositions.length} street lamps`);
    }
    
    createStreetLamp() {
        const lampGroup = new THREE.Group();
        
        // Lamp post
        const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 4;
        post.castShadow = true;
        
        // Lamp head
        const headGeometry = new THREE.SphereGeometry(1, 8, 8);
        const headMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 8;
        
        lampGroup.add(post);
        lampGroup.add(head);
        
        return lampGroup;
    }
    
    addDecorations() {
        // Add fountains, statues, benches, etc.
        const decorationCount = 20;
        
        for (let i = 0; i < decorationCount; i++) {
            const decoration = this.createRandomDecoration();
            const position = this.getRandomCityPosition(100);
            
            if (this.isValidDecorationPosition(position)) {
                decoration.position.copy(position);
                this.gameEngine.addToScene(decoration);
                this.environment.push(decoration);
            }
        }
    }
    
    createRandomDecoration() {
        const decorationTypes = ['fountain', 'statue', 'bench', 'tree'];
        const type = decorationTypes[Math.floor(Math.random() * decorationTypes.length)];
        
        switch (type) {
            case 'fountain':
                return this.createFountain();
            case 'statue':
                return this.createStatue();
            case 'bench':
                return this.createBench();
            case 'tree':
                return this.createTree();
            default:
                return this.createBench();
        }
    }
    
    createFountain() {
        const fountainGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(4, 5, 1);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        
        // Center pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.8, 3);
        const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
        pillar.position.y = 2.5;
        
        fountainGroup.add(base);
        fountainGroup.add(pillar);
        
        return fountainGroup;
    }
    
    createStatue() {
        const statueGroup = new THREE.Group();
        
        // Pedestal
        const pedestalGeometry = new THREE.BoxGeometry(2, 1, 2);
        const pedestalMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = 0.5;
        
        // Statue figure (simple)
        const figureGeometry = new THREE.CapsuleGeometry(0.5, 2);
        const figureMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const figure = new THREE.Mesh(figureGeometry, figureMaterial);
        figure.position.y = 2.5;
        
        statueGroup.add(pedestal);
        statueGroup.add(figure);
        
        return statueGroup;
    }
    
    createBench() {
        const benchGroup = new THREE.Group();
        
        // Bench seat
        const seatGeometry = new THREE.BoxGeometry(3, 0.2, 1);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 1;
        
        // Bench back
        const backGeometry = new THREE.BoxGeometry(3, 1, 0.2);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 1.5, -0.4);
        
        benchGroup.add(seat);
        benchGroup.add(back);
        
        return benchGroup;
    }
    
    createTree() {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        
        // Leaves (simple sphere)
        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 5;
        
        treeGroup.add(trunk);
        treeGroup.add(leaves);
        
        return treeGroup;
    }
    
    isValidDecorationPosition(position) {
        const minDistance = 15;
        
        // Check distance from buildings
        for (const building of this.buildings) {
            if (position.distanceTo(building.position) < minDistance) return false;
        }
        
        // Check distance from other decorations
        for (const decoration of this.environment) {
            if (decoration.position && position.distanceTo(decoration.position) < 8) return false;
        }
        
        return true;
    }
    
    addAmbientObjects() {
        // Add small ambient objects like trash cans, signs, etc.
        // This would be expanded in a full implementation
    }
    
    generateNaturalFeatures() {
        // Add natural elements to break up the urban environment
        this.addParkAreas();
        this.addWaterFeatures();
    }
    
    addParkAreas() {
        // Create small park areas with grass and trees
        const parkCount = 3;
        
        for (let i = 0; i < parkCount; i++) {
            const parkCenter = this.getRandomCityPosition(150);
            if (this.isValidParkPosition(parkCenter)) {
                this.createParkArea(parkCenter);
            }
        }
    }
    
    createParkArea(center) {
        // Create grass area
        const grassGeometry = new THREE.CircleGeometry(15, 16);
        const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.copy(center);
        grass.position.y = 0.1;
        
        this.gameEngine.addToScene(grass);
        this.environment.push(grass);
        
        // Add trees around the park
        const treeCount = 5;
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const treePos = new THREE.Vector3(
                center.x + Math.cos(angle) * 12,
                0,
                center.z + Math.sin(angle) * 12
            );
            
            const tree = this.createTree();
            tree.position.copy(treePos);
            this.gameEngine.addToScene(tree);
            this.environment.push(tree);
        }
    }
    
    isValidParkPosition(position) {
        // Check if position is suitable for a park
        return this.isValidBuildingPosition(position);
    }
    
    addWaterFeatures() {
        // Add small water features like ponds
        // This would be expanded in a full implementation
    }
    
    placeWorldObjects() {
        // Place interactive objects throughout the world
        this.placeCollectibles();
        this.placeInteractiveObjects();
    }
    
    placeCollectibles() {
        // Place token collectibles around the world
        const tokenCount = 50;
        
        for (let i = 0; i < tokenCount; i++) {
            const token = this.createTokenCollectible();
            const position = this.getRandomCityPosition(200);
            
            if (this.isValidCollectiblePosition(position)) {
                token.position.copy(position);
                token.position.y = 1;
                this.gameEngine.addToScene(token);
                this.collisionGroups.triggers.push(token);
            }
        }
    }
    
    createTokenCollectible() {
        const tokenGroup = new THREE.Group();
        
        // Token mesh
        const tokenGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8);
        const tokenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        const token = new THREE.Mesh(tokenGeometry, tokenMaterial);
        
        tokenGroup.add(token);
        
        // Add user data for interaction
        tokenGroup.userData = {
            type: 'token',
            value: 1,
            collectible: true
        };
        
        return tokenGroup;
    }
    
    isValidCollectiblePosition(position) {
        // Check if position is accessible and not inside buildings
        const minDistance = 5;
        
        for (const building of this.buildings) {
            if (position.distanceTo(building.position) < minDistance) return false;
        }
        
        return true;
    }
    
    placeInteractiveObjects() {
        // Place objects that players can interact with
        // This would include quest objects, lore items, etc.
    }
    
    setupPhysics() {
        console.log('🌍 Setting up world physics...');
        
        // Initialize collision detection systems
        this.setupCollisionDetection();
        
        // Setup trigger zones
        this.setupTriggerZones();
    }
    
    setupCollisionDetection() {
        // Set up spatial partitioning for efficient collision detection
        this.spatialGrid = new Map();
        this.gridSize = 50;
        
        // Populate spatial grid with static objects
        this.collisionGroups.static.forEach(obj => {
            this.addToSpatialGrid(obj);
        });
    }
    
    addToSpatialGrid(object) {
        if (!object.position) return;
        
        const gridX = Math.floor(object.position.x / this.gridSize);
        const gridZ = Math.floor(object.position.z / this.gridSize);
        const key = `${gridX},${gridZ}`;
        
        if (!this.spatialGrid.has(key)) {
            this.spatialGrid.set(key, []);
        }
        
        this.spatialGrid.get(key).push(object);
    }
    
    getObjectsInGrid(position) {
        const gridX = Math.floor(position.x / this.gridSize);
        const gridZ = Math.floor(position.z / this.gridSize);
        
        const objects = [];
        
        // Check surrounding grid cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const key = `${gridX + dx},${gridZ + dz}`;
                if (this.spatialGrid.has(key)) {
                    objects.push(...this.spatialGrid.get(key));
                }
            }
        }
        
        return objects;
    }
    
    setupTriggerZones() {
        // Create trigger zones for temples, shops, etc.
        // These are invisible areas that trigger events when entered
    }
    
    setupEnvironment() {
        console.log('🌍 Setting up environment...');
        
        // Initialize weather system
        this.initWeatherSystem();
        
        // Setup day/night cycle
        this.initDayNightCycle();
        
        // Initialize ambient sounds
        this.initAmbientSounds();
    }
    
    initWeatherSystem() {
        this.weather = 'overcast'; // Fits the grey world theme
        // In a full implementation, this would handle weather effects
    }
    
    initDayNightCycle() {
        // The grey world has a perpetual overcast day
        this.timeOfDay = 14; // Afternoon lighting
        this.updateLighting();
    }
    
    updateLighting() {
        // Update directional light based on time of day
        const light = this.gameEngine.directionalLight;
        if (light) {
            // Grey world has dim, diffused lighting
            light.intensity = 0.6;
            light.color.setHex(0x888888);
        }
    }
    
    initAmbientSounds() {
        // Initialize ambient city sounds
        this.ambientSounds = [
            'city_ambience',
            'wind_subtle',
            'distant_sounds'
        ];
        
        // Play ambient sounds
        this.playAmbientSounds();
    }
    
    playAmbientSounds() {
        // Play ambient sounds through audio manager
        this.ambientSounds.forEach(soundName => {
            // this.game.audioManager?.playAmbientSound(soundName);
        });
    }
    
    // Update methods
    update(deltaTime) {
        // Update environmental systems
        this.updateEnvironmentalEffects(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update dynamic objects
        this.updateDynamicObjects(deltaTime);
    }
    
    updateEnvironmentalEffects(deltaTime) {
        // Update weather effects, particles, etc.
        this.updateWeatherEffects(deltaTime);
        
        // Update day/night cycle
        this.updateDayNightCycle(deltaTime);
    }
    
    updateWeatherEffects(deltaTime) {
        // Update weather-related visual effects
        // In the grey world, this might include fog, subtle wind effects
    }
    
    updateDayNightCycle(deltaTime) {
        // The grey world has static lighting, but this could change
        // as the player restores color
    }
    
    updatePhysics(deltaTime) {
        // Update physics simulations
        this.updateCollisions();
    }
    
    updateCollisions() {
        // Handle collision detection and response
        // This would be more complex in a full implementation
    }
    
    updateDynamicObjects(deltaTime) {
        // Update any dynamic world objects
        this.updateCollectibles(deltaTime);
    }
    
    updateCollectibles(deltaTime) {
        // Animate collectible tokens
        this.collisionGroups.triggers.forEach(obj => {
            if (obj.userData && obj.userData.type === 'token') {
                obj.rotation.y += deltaTime * 2;
                obj.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            }
        });
    }
    
    // Utility methods
    getCollisionObjects() {
        return this.collisionGroups.static;
    }
    
    getTriggerObjects() {
        return this.collisionGroups.triggers;
    }
    
    findNearestBuilding(position) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const building of this.buildings) {
            const distance = position.distanceTo(building.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = building;
            }
        }
        
        return nearest;
    }
    
    // Cleanup
    dispose() {
        // Clean up world resources
        this.buildings = [];
        this.environment = [];
        this.collisionGroups = { static: [], dynamic: [], triggers: [] };
        this.spatialGrid.clear();
        
        console.log('🌍 World disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = World;
}
