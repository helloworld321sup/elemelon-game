/**
 * SceneManager - Manages different game scenes and 3D world
 * Handles scene transitions, world creation, and environment management
 */

class SceneManager {
    constructor(game) {
        this.game = game;
        this.gameEngine = game.gameEngine;
        
        // Scene objects
        this.world = null;
        this.player = null;
        this.npcs = [];
        this.enemies = [];
        
        // Environment objects
        this.cityObjects = [];
        this.temples = [];
        this.shops = [];
        
        // Current scene state
        this.currentScene = 'menu'; // menu, cutscene, gameplay
        this.isLoaded = false;
    }
    
    async init() {
        console.log('🌍 Initializing Scene Manager...');
        // Scene manager initialization
        this.isLoaded = true;
    }
    
    async createWorld() {
        console.log('🌍 Creating Elemelon World...');
        
        // Create the grey world environment
        this.createSkybox();
        this.createGround();
        this.createCity();
        this.createTemples();
        this.createShops();
        
        // Create player
        this.player = new Player(this.game);
        await this.player.init();
        
        // Create NPCs
        this.createNPCs();
        
        console.log('🌍 Elemelon World created successfully!');
    }
    
    createSkybox() {
        // Create grey skybox for the grey world
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x808080,
            side: THREE.BackSide,
            fog: false
        });
        
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.gameEngine.addToScene(skybox);
    }
    
    createGround() {
        // Create large ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x606060,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        
        this.gameEngine.addToScene(ground);
    }
    
    createCity() {
        console.log('🏞️ Creating detailed Zelda-style terrain...');
        
        // Create natural terrain with Kung Fu Panda aesthetic
        this.createTerrain();
        this.createRockFormations();
        this.createGrassPatches();
        this.createStonePaths();
        this.createNaturalStructures();
        this.createDetailedLandmarks();
    }
    
    // Create detailed terrain base with rolling hills
    createTerrain() {
        const worldSize = 2000; // Even bigger world
        const terrainDetail = 200; // High detail terrain
        
        // Create collision detection array
        this.collisionObjects = this.collisionObjects || [];
        
        // Generate height map for rolling hills
        const heightMap = [];
        for (let x = 0; x < terrainDetail; x++) {
            heightMap[x] = [];
            for (let z = 0; z < terrainDetail; z++) {
                // Multiple octaves of noise for natural terrain
                const scale1 = 0.02;
                const scale2 = 0.05;
                const scale3 = 0.1;
                
                const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 15;
                const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 8;
                const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 3;
                
                heightMap[x][z] = height1 + height2 + height3;
            }
        }
        
        // Create terrain mesh
        const terrainGeometry = new THREE.PlaneGeometry(worldSize, worldSize, terrainDetail - 1, terrainDetail - 1);
        const vertices = terrainGeometry.attributes.position.array;
        
        // Apply height map to vertices
        for (let i = 0; i < vertices.length; i += 3) {
            const x = Math.floor((vertices[i] + worldSize/2) / worldSize * terrainDetail);
            const z = Math.floor((vertices[i + 2] + worldSize/2) / worldSize * terrainDetail);
            
            if (x >= 0 && x < terrainDetail && z >= 0 && z < terrainDetail) {
                vertices[i + 1] = heightMap[x][z]; // Y coordinate
            }
        }
        
        terrainGeometry.computeVertexNormals();
        
        // Grey terrain material with subtle texture
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x606060, // Medium grey
            wireframe: false
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.userData.isCollidable = false; // Terrain is walkable
        
        this.gameEngine.addToScene(terrain);
        this.cityObjects.push(terrain);
    }
    
    // Create massive rock formations like Zelda/Kung Fu Panda
    createRockFormations() {
        const rockCount = 150; // Tons of rocks
        const worldSize = 1800;
        
        for (let i = 0; i < rockCount; i++) {
            const rockGroup = this.createDetailedRock();
            
            // Spread them far apart across the world
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 800; // Very spread out
            
            rockGroup.position.x = Math.cos(angle) * distance;
            rockGroup.position.z = Math.sin(angle) * distance;
            rockGroup.position.y = Math.random() * 5; // Slight height variation
            
            // Random rotation for natural look
            rockGroup.rotation.y = Math.random() * Math.PI * 2;
            
            // Add collision
            rockGroup.userData.isCollidable = true;
            rockGroup.userData.boundingBox = new THREE.Box3().setFromObject(rockGroup);
            this.collisionObjects.push(rockGroup);
            
            this.cityObjects.push(rockGroup);
            this.gameEngine.addToScene(rockGroup);
        }
    }
    
    createDetailedRock() {
        const rockGroup = new THREE.Group();
        
        // Main rock (irregular shape)
        const mainRockSize = 8 + Math.random() * 20;
        const rockGeometry = new THREE.SphereGeometry(mainRockSize, 8, 6);
        
        // Deform the sphere to make it look more natural
        const vertices = rockGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += (Math.random() - 0.5) * mainRockSize * 0.3;
            vertices[i + 1] += (Math.random() - 0.5) * mainRockSize * 0.2;
            vertices[i + 2] += (Math.random() - 0.5) * mainRockSize * 0.3;
        }
        rockGeometry.computeVertexNormals();
        
        const rockMaterial = new THREE.MeshLambertMaterial({
            color: 0x4a4a4a, // Dark grey rock
            roughness: 0.9
        });
        
        const mainRock = new THREE.Mesh(rockGeometry, rockMaterial);
        mainRock.castShadow = true;
        mainRock.receiveShadow = true;
        rockGroup.add(mainRock);
        
        // Add smaller rocks around it
        const smallRockCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < smallRockCount; i++) {
            const smallRockSize = 2 + Math.random() * 4;
            const smallRockGeometry = new THREE.SphereGeometry(smallRockSize, 6, 4);
            
            // Deform small rocks too
            const smallVertices = smallRockGeometry.attributes.position.array;
            for (let j = 0; j < smallVertices.length; j += 3) {
                smallVertices[j] += (Math.random() - 0.5) * smallRockSize * 0.4;
                smallVertices[j + 1] += (Math.random() - 0.5) * smallRockSize * 0.3;
                smallVertices[j + 2] += (Math.random() - 0.5) * smallRockSize * 0.4;
            }
            smallRockGeometry.computeVertexNormals();
            
            const smallRock = new THREE.Mesh(smallRockGeometry, rockMaterial);
            smallRock.position.set(
                (Math.random() - 0.5) * mainRockSize * 1.5,
                Math.random() * 3,
                (Math.random() - 0.5) * mainRockSize * 1.5
            );
            smallRock.castShadow = true;
            smallRock.receiveShadow = true;
            rockGroup.add(smallRock);
        }
        
        return rockGroup;
    }
    
    // Create grass patches scattered around
    createGrassPatches() {
        const grassPatchCount = 300; // Tons of grass patches
        const worldSize = 1600;
        
        for (let i = 0; i < grassPatchCount; i++) {
            const grassPatch = this.createGrassPatch();
            
            grassPatch.position.x = (Math.random() - 0.5) * worldSize;
            grassPatch.position.z = (Math.random() - 0.5) * worldSize;
            grassPatch.position.y = 0.1; // Slightly above ground
            
            // Random rotation
            grassPatch.rotation.y = Math.random() * Math.PI * 2;
            
            this.cityObjects.push(grassPatch);
            this.gameEngine.addToScene(grassPatch);
        }
    }
    
    createGrassPatch() {
        const grassGroup = new THREE.Group();
        const grassBladeCount = 20 + Math.floor(Math.random() * 30);
        
        // Grey grass material (colorless world)
        const grassMaterial = new THREE.MeshLambertMaterial({
            color: 0x555555, // Dark grey grass
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < grassBladeCount; i++) {
            const bladeHeight = 0.5 + Math.random() * 1.5;
            const bladeGeometry = new THREE.PlaneGeometry(0.1, bladeHeight);
            
            const grassBlade = new THREE.Mesh(bladeGeometry, grassMaterial);
            grassBlade.position.set(
                (Math.random() - 0.5) * 4,
                bladeHeight / 2,
                (Math.random() - 0.5) * 4
            );
            grassBlade.rotation.y = Math.random() * Math.PI;
            grassBlade.rotation.x = (Math.random() - 0.5) * 0.3;
            
            grassGroup.add(grassBlade);
        }
        
        return grassGroup;
    }
    
    // Create winding stone paths
    createStonePaths() {
        const pathCount = 8; // Several winding paths
        
        for (let i = 0; i < pathCount; i++) {
            this.createWindingPath(i);
        }
    }
    
    createWindingPath(pathIndex) {
        const pathLength = 200 + Math.random() * 300;
        const pathWidth = 4 + Math.random() * 2;
        const stoneCount = Math.floor(pathLength / 2);
        
        // Starting position
        const startAngle = (pathIndex / 8) * Math.PI * 2;
        let currentX = Math.cos(startAngle) * 50;
        let currentZ = Math.sin(startAngle) * 50;
        let currentAngle = startAngle;
        
        for (let i = 0; i < stoneCount; i++) {
            const stone = this.createPathStone();
            
            stone.position.x = currentX;
            stone.position.z = currentZ;
            stone.position.y = 0.05;
            
            // Random rotation for natural look
            stone.rotation.y = Math.random() * Math.PI * 2;
            
            this.cityObjects.push(stone);
            this.gameEngine.addToScene(stone);
            
            // Move to next position with slight curve
            currentAngle += (Math.random() - 0.5) * 0.3;
            currentX += Math.cos(currentAngle) * 2;
            currentZ += Math.sin(currentAngle) * 2;
        }
    }
    
    createPathStone() {
        const stoneSize = 0.8 + Math.random() * 0.4;
        const stoneGeometry = new THREE.CylinderGeometry(stoneSize, stoneSize, 0.2, 6);
        const stoneMaterial = new THREE.MeshLambertMaterial({
            color: 0x666666, // Grey stone
        });
        
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.receiveShadow = true;
        
        return stone;
    }
    
    // Create Kung Fu Panda style natural structures
    createNaturalStructures() {
        const structureCount = 25; // Fewer but more impressive structures
        const worldSize = 1400;
        
        for (let i = 0; i < structureCount; i++) {
            const structure = this.createKungFuStructure();
            
            structure.position.x = (Math.random() - 0.5) * worldSize;
            structure.position.z = (Math.random() - 0.5) * worldSize;
            
            // Ensure not too close to spawn
            if (Math.abs(structure.position.x) < 100 && Math.abs(structure.position.z) < 100) {
                structure.position.x += Math.sign(structure.position.x) * 150;
                structure.position.z += Math.sign(structure.position.z) * 150;
            }
            
            structure.userData.isCollidable = true;
            structure.userData.boundingBox = new THREE.Box3().setFromObject(structure);
            this.collisionObjects.push(structure);
            
            this.cityObjects.push(structure);
            this.gameEngine.addToScene(structure);
        }
    }
    
    createKungFuStructure() {
        const structureGroup = new THREE.Group();
        const structureType = Math.floor(Math.random() * 3);
        
        if (structureType === 0) {
            // Pagoda-style tower
            return this.createPagodaTower();
        } else if (structureType === 1) {
            // Natural stone archway
            return this.createStoneArchway();
        } else {
            // Mountain-like formation
            return this.createMountainFormation();
        }
    }
    
    createPagodaTower() {
        const towerGroup = new THREE.Group();
        const levels = 3 + Math.floor(Math.random() * 3);
        
        const greyWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const greyRoofMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        
        for (let i = 0; i < levels; i++) {
            const levelHeight = 8;
            const levelSize = 12 - i * 2;
            
            // Main structure
            const levelGeometry = new THREE.CylinderGeometry(levelSize, levelSize, levelHeight, 8);
            const levelMesh = new THREE.Mesh(levelGeometry, greyWoodMaterial);
            levelMesh.position.y = i * levelHeight + levelHeight / 2;
            levelMesh.castShadow = true;
            levelMesh.receiveShadow = true;
            towerGroup.add(levelMesh);
            
            // Roof
            const roofGeometry = new THREE.ConeGeometry(levelSize + 2, 3, 8);
            const roofMesh = new THREE.Mesh(roofGeometry, greyRoofMaterial);
            roofMesh.position.y = i * levelHeight + levelHeight;
            roofMesh.castShadow = true;
            towerGroup.add(roofMesh);
        }
        
        return towerGroup;
    }
    
    createStoneArchway() {
        const archGroup = new THREE.Group();
        const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        
        // Left pillar
        const pillarGeometry = new THREE.CylinderGeometry(2, 2, 15, 8);
        const leftPillar = new THREE.Mesh(pillarGeometry, stoneMaterial);
        leftPillar.position.set(-8, 7.5, 0);
        leftPillar.castShadow = true;
        leftPillar.receiveShadow = true;
        archGroup.add(leftPillar);
        
        // Right pillar
        const rightPillar = new THREE.Mesh(pillarGeometry, stoneMaterial);
        rightPillar.position.set(8, 7.5, 0);
        rightPillar.castShadow = true;
        rightPillar.receiveShadow = true;
        archGroup.add(rightPillar);
        
        // Arch top
        const archGeometry = new THREE.TorusGeometry(8, 2, 8, 16, Math.PI);
        const archTop = new THREE.Mesh(archGeometry, stoneMaterial);
        archTop.position.y = 15;
        archTop.rotation.z = Math.PI;
        archTop.castShadow = true;
        archTop.receiveShadow = true;
        archGroup.add(archTop);
        
        return archGroup;
    }
    
    createMountainFormation() {
        const mountainGroup = new THREE.Group();
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x484848 });
        
        // Main mountain peak
        const mainPeakGeometry = new THREE.ConeGeometry(15, 30, 8);
        const mainPeak = new THREE.Mesh(mainPeakGeometry, rockMaterial);
        mainPeak.position.y = 15;
        mainPeak.castShadow = true;
        mainPeak.receiveShadow = true;
        mountainGroup.add(mainPeak);
        
        // Smaller peaks around it
        const smallPeakCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < smallPeakCount; i++) {
            const peakSize = 5 + Math.random() * 8;
            const peakHeight = 10 + Math.random() * 15;
            const peakGeometry = new THREE.ConeGeometry(peakSize, peakHeight, 6);
            const peak = new THREE.Mesh(peakGeometry, rockMaterial);
            
            const angle = (i / smallPeakCount) * Math.PI * 2;
            peak.position.x = Math.cos(angle) * (20 + Math.random() * 10);
            peak.position.z = Math.sin(angle) * (20 + Math.random() * 10);
            peak.position.y = peakHeight / 2;
            
            peak.castShadow = true;
            peak.receiveShadow = true;
            mountainGroup.add(peak);
        }
        
        return mountainGroup;
    }
    
    createDetailedLandmarks() {
        // Create a few special landmark structures
        this.createCentralPlaza();
        this.createSacredGrove();
        this.createAncientRuins();
    }
    
    createCentralPlaza() {
        const plazaGroup = new THREE.Group();
        
        // Large circular stone platform
        const platformGeometry = new THREE.CylinderGeometry(25, 25, 1, 32);
        const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.5;
        platform.receiveShadow = true;
        plazaGroup.add(platform);
        
        // Stone pillars around the edge
        const pillarCount = 8;
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        
        for (let i = 0; i < pillarCount; i++) {
            const angle = (i / pillarCount) * Math.PI * 2;
            const pillarGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            
            pillar.position.x = Math.cos(angle) * 20;
            pillar.position.z = Math.sin(angle) * 20;
            pillar.position.y = 4;
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            
            plazaGroup.add(pillar);
        }
        
        plazaGroup.position.set(0, 0, 0); // Center of world
        this.cityObjects.push(plazaGroup);
        this.gameEngine.addToScene(plazaGroup);
    }
    
    createSacredGrove() {
        const groveGroup = new THREE.Group();
        
        // Circle of ancient trees (grey/dead looking)
        const treeCount = 12;
        const treeRadius = 40;
        
        for (let i = 0; i < treeCount; i++) {
            const tree = this.createAncientTree();
            const angle = (i / treeCount) * Math.PI * 2;
            
            tree.position.x = Math.cos(angle) * treeRadius;
            tree.position.z = Math.sin(angle) * treeRadius;
            
            groveGroup.add(tree);
        }
        
        groveGroup.position.set(300, 0, 300); // Northeast area
        this.cityObjects.push(groveGroup);
        this.gameEngine.addToScene(groveGroup);
    }
    
    createAncientTree() {
        const treeGroup = new THREE.Group();
        
        // Tree trunk (grey/dead)
        const trunkGeometry = new THREE.CylinderGeometry(2, 3, 15, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 7.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Dead branches
        const branchCount = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
            const branchLength = 3 + Math.random() * 4;
            const branchGeometry = new THREE.CylinderGeometry(0.3, 0.5, branchLength, 6);
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            
            const angle = (i / branchCount) * Math.PI * 2;
            branch.position.x = Math.cos(angle) * 2;
            branch.position.y = 10 + Math.random() * 5;
            branch.position.z = Math.sin(angle) * 2;
            branch.rotation.z = (Math.random() - 0.5) * Math.PI / 2;
            branch.rotation.y = angle;
            
            branch.castShadow = true;
            treeGroup.add(branch);
        }
        
        return treeGroup;
    }
    
    createAncientRuins() {
        const ruinsGroup = new THREE.Group();
        
        // Broken stone structures
        const ruinMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
        
        // Broken pillars
        const pillarCount = 8;
        for (let i = 0; i < pillarCount; i++) {
            const pillarHeight = 5 + Math.random() * 10; // Varying broken heights
            const pillarGeometry = new THREE.CylinderGeometry(1.5, 1.5, pillarHeight, 8);
            const pillar = new THREE.Mesh(pillarGeometry, ruinMaterial);
            
            pillar.position.x = (Math.random() - 0.5) * 60;
            pillar.position.z = (Math.random() - 0.5) * 60;
            pillar.position.y = pillarHeight / 2;
            
            // Random tilt for broken look
            pillar.rotation.x = (Math.random() - 0.5) * 0.3;
            pillar.rotation.z = (Math.random() - 0.5) * 0.3;
            
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            ruinsGroup.add(pillar);
        }
        
        // Scattered stone blocks
        const blockCount = 20;
        for (let i = 0; i < blockCount; i++) {
            const blockSize = 1 + Math.random() * 3;
            const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            const block = new THREE.Mesh(blockGeometry, ruinMaterial);
            
            block.position.x = (Math.random() - 0.5) * 80;
            block.position.z = (Math.random() - 0.5) * 80;
            block.position.y = blockSize / 2;
            
            block.rotation.y = Math.random() * Math.PI * 2;
            block.castShadow = true;
            block.receiveShadow = true;
            
            ruinsGroup.add(block);
        }
        
        ruinsGroup.position.set(-400, 0, -400); // Southwest area
        this.cityObjects.push(ruinsGroup);
        this.gameEngine.addToScene(ruinsGroup);
    }
    
    createBuilding() {
        // Random building dimensions
        const width = 5 + Math.random() * 10;
        const height = 10 + Math.random() * 30;
        const depth = 5 + Math.random() * 10;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.3) // Grey variations
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        return building;
    }
    
    createStreets() {
        // Create main streets in grid pattern
        const streetWidth = 4;
        const streetLength = 300;
        const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        
        // North-South streets
        for (let x = -100; x <= 100; x += 50) {
            const streetGeometry = new THREE.PlaneGeometry(streetWidth, streetLength);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(x, 0.1, 0);
            this.gameEngine.addToScene(street);
        }
        
        // East-West streets
        for (let z = -100; z <= 100; z += 50) {
            const streetGeometry = new THREE.PlaneGeometry(streetLength, streetWidth);
            const street = new THREE.Mesh(streetGeometry, streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(0, 0.1, z);
            this.gameEngine.addToScene(street);
        }
    }
    
    createLandmarks() {
        // Create central fountain/monument
        const monumentGeometry = new THREE.CylinderGeometry(3, 5, 8, 8);
        const monumentMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
        monument.position.set(0, 4, 0);
        monument.castShadow = true;
        
        this.gameEngine.addToScene(monument);
        this.cityObjects.push(monument);
    }
    
    createTemples() {
        console.log('🏛️ Creating temples...');
        
        const templePositions = [
            { x: -150, z: -150, type: 'water', color: 0x4080ff },
            { x: 150, z: -150, type: 'lightning', color: 0xffff40 },
            { x: -150, z: 150, type: 'wind', color: 0x80ff80 },
            { x: 150, z: 150, type: 'fire', color: 0xff4040 }
        ];
        
        templePositions.forEach(pos => {
            const temple = this.createTemple(pos.type, pos.color);
            temple.position.set(pos.x, 0, pos.z);
            this.temples.push(temple);
            this.gameEngine.addToScene(temple);
        });
    }
    
    createTemple(type, color) {
        const templeGroup = new THREE.Group();
        
        // Main temple structure
        const templeGeometry = new THREE.BoxGeometry(20, 15, 20);
        const templeMaterial = new THREE.MeshLambertMaterial({ color: color });
        const templeMain = new THREE.Mesh(templeGeometry, templeMaterial);
        templeMain.position.y = 7.5;
        templeMain.castShadow = true;
        
        // Temple pillars
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, 15, 8);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        const pillarPositions = [
            { x: -8, z: -8 }, { x: 8, z: -8 },
            { x: -8, z: 8 }, { x: 8, z: 8 }
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, 7.5, pos.z);
            pillar.castShadow = true;
            templeGroup.add(pillar);
        });
        
        // Temple roof
        const roofGeometry = new THREE.ConeGeometry(15, 8, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: color });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 19;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        
        templeGroup.add(templeMain);
        templeGroup.add(roof);
        
        // Add temple data
        templeGroup.userData = { type: type, isTemple: true };
        
        return templeGroup;
    }
    
    createShops() {
        console.log('🏪 Creating shops...');
        
        const shopPositions = [
            { x: -50, z: 0, type: 'weapon' },
            { x: 50, z: 0, type: 'consumable' },
            { x: 0, z: -50, type: 'general' }
        ];
        
        shopPositions.forEach(pos => {
            const shop = this.createShop(pos.type);
            shop.position.set(pos.x, 0, pos.z);
            this.shops.push(shop);
            this.gameEngine.addToScene(shop);
        });
    }
    
    createShop(type) {
        const shopGroup = new THREE.Group();
        
        // Shop building
        const shopGeometry = new THREE.BoxGeometry(12, 8, 12);
        const shopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const shopBuilding = new THREE.Mesh(shopGeometry, shopMaterial);
        shopBuilding.position.y = 4;
        shopBuilding.castShadow = true;
        
        // Shop sign
        const signGeometry = new THREE.PlaneGeometry(8, 2);
        const signMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 6, 6.1);
        
        shopGroup.add(shopBuilding);
        shopGroup.add(sign);
        
        // Add shop data
        shopGroup.userData = { type: type, isShop: true };
        
        return shopGroup;
    }
    
    createNPCs() {
        console.log('🍈 Creating NPCs...');
        
        // Create melon NPCs around the city
        const npcCount = 20;
        for (let i = 0; i < npcCount; i++) {
            const npc = new NPC(this.game);
            
            // Random position in city
            const angle = (i / npcCount) * Math.PI * 2;
            const radius = 30 + Math.random() * 80;
            
            npc.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            this.npcs.push(npc);
            this.gameEngine.addToScene(npc.mesh);
        }
    }
    
    startGameplayScene() {
        console.log('🎮 Starting gameplay scene...');
        this.currentScene = 'gameplay';
        
        // Position player at spawn point
        if (this.player) {
            this.player.setPosition(0, 2, 10);
        }
        
        // Start game systems
        this.startGameSystems();
    }
    
    startGameSystems() {
        // Initialize UI
        this.game.uiManager.showGameUI();
        
        // Start NPC behaviors
        this.npcs.forEach(npc => npc.startBehavior());
        
        // Enable player controls
        if (this.player) {
            this.player.enableControls();
        }
    }
    
    update(deltaTime) {
        if (this.currentScene !== 'gameplay') return;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Update world systems
        this.updateWorldSystems(deltaTime);
    }
    
    updateWorldSystems(deltaTime) {
        // Update temple effects
        this.temples.forEach(temple => {
            if (temple.userData.type) {
                // Add subtle temple glow animation
                temple.children.forEach(child => {
                    if (child.material) {
                        const time = Date.now() * 0.001;
                        const intensity = 0.8 + Math.sin(time) * 0.2;
                        child.material.emissive = new THREE.Color(child.material.color).multiplyScalar(intensity * 0.1);
                    }
                });
            }
        });
    }
    
    // Interaction methods
    getNearbyInteractables(position, radius = 5) {
        const interactables = [];
        
        // Check temples
        this.temples.forEach(temple => {
            if (position.distanceTo(temple.position) <= radius) {
                interactables.push(temple);
            }
        });
        
        // Check shops
        this.shops.forEach(shop => {
            if (position.distanceTo(shop.position) <= radius) {
                interactables.push(shop);
            }
        });
        
        // Check NPCs
        this.npcs.forEach(npc => {
            if (position.distanceTo(npc.position) <= radius) {
                interactables.push(npc);
            }
        });
        
        return interactables;
    }
    
    handleInteraction(object) {
        if (!object || !object.userData) {
            console.warn('⚠️ Tried to interact with invalid object');
            return;
        }
        
        if (object.userData.isTemple) {
            this.enterTemple(object.userData.type);
        } else if (object.userData.isShop) {
            this.enterShop(object.userData.type);
        } else if (object.userData.isNPC) {
            this.talkToNPC(object);
        }
    }
    
    enterTemple(type) {
        console.log(`🏛️ Entering ${type} temple...`);
        // TODO: Implement temple entrance
        alert(`🏛️ Welcome to the ${type} temple! Temple puzzles and boss battles coming soon...`);
    }
    
    enterShop(type) {
        console.log(`🏪 Entering ${type} shop...`);
        // TODO: Implement shop interface
        alert(`🏪 Welcome to the ${type} shop! Shopping system coming soon...`);
    }
    
    talkToNPC(npc) {
        console.log('🍈 Talking to NPC...');
        // TODO: Implement dialogue system
        alert('🍈 Melon NPC: "Welcome to the grey world! Find the elemental temples to restore color!"');
    }
    
    // Scene transition methods
    switchToScene(sceneName) {
        this.currentScene = sceneName;
        console.log(`🎬 Switched to ${sceneName} scene`);
    }
    
    // Collision Detection System
    checkCollision(playerPosition, movementVector) {
        const playerRadius = 1.5; // Player collision radius
        const newPosition = playerPosition.clone().add(movementVector);
        
        // Create player bounding box
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            newPosition,
            new THREE.Vector3(playerRadius * 2, 4, playerRadius * 2)
        );
        
        // Check collision with all collidable objects
        for (const object of this.collisionObjects || []) {
            if (object.userData.boundingBox && object.userData.boundingBox.intersectsBox(playerBox)) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    getValidMovement(playerPosition, desiredMovement) {
        // Try the full movement first
        if (!this.checkCollision(playerPosition, desiredMovement)) {
            return desiredMovement;
        }
        
        // Try sliding along walls - check X and Z movement separately
        const xMovement = new THREE.Vector3(desiredMovement.x, 0, 0);
        const zMovement = new THREE.Vector3(0, 0, desiredMovement.z);
        
        let validMovement = new THREE.Vector3();
        
        // Try X movement
        if (!this.checkCollision(playerPosition, xMovement)) {
            validMovement.add(xMovement);
        }
        
        // Try Z movement
        if (!this.checkCollision(playerPosition, zMovement)) {
            validMovement.add(zMovement);
        }
        
        return validMovement;
    }
    
    // Cleanup
    dispose() {
        // Clean up all scene objects
        this.cityObjects = [];
        this.temples = [];
        this.shops = [];
        this.npcs = [];
        this.enemies = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneManager;
}
