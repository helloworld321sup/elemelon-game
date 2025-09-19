/**
 * CutsceneManager - Handles all cutscenes and story sequences for Elemelon
 * Manages the opening sequence, temple cutscenes, and ending
 */

class CutsceneManager {
    constructor(game) {
        this.game = game;
        
        // Cutscene state
        this.isPlaying = false;
        this.currentCutscene = null;
        this.currentSequence = 0;
        this.isSkippable = true;
        
        // Cutscene elements
        this.cutsceneOverlay = null;
        this.cutsceneVideo = null;
        this.cutsceneText = null;
        this.dialogueText = null;
        
        // Animation properties
        this.fadeSpeed = 0.02;
        this.textSpeed = 50; // Characters per second
        this.sequenceDelay = 3000; // Delay between sequences
        
        // 3D Scene properties
        this.scene = game.gameEngine ? game.gameEngine.scene : null;
        this.camera = game.gameEngine ? game.gameEngine.camera : null;
        this.cutsceneObjects = [];
        this.playerCharacter = null;
        this.drHegesh = null;
        this.van = null;
        this.originalCameraPosition = null;
        this.originalCameraRotation = null;
        
        this.init();
    }
    
    init() {
        // Get cutscene elements
        this.cutsceneOverlay = document.getElementById('cutsceneOverlay');
        this.cutsceneVideo = document.getElementById('cutsceneVideo');
        this.cutsceneText = document.getElementById('cutsceneText');
        this.dialogueText = document.getElementById('dialogueText');
        
        // Setup skip button
        const skipBtn = document.getElementById('skipCutsceneBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipCutscene());
        }
        
        // Setup keyboard skip
        document.addEventListener('keydown', (event) => {
            if (this.isPlaying && event.code === 'Escape') {
                this.skipCutscene();
            }
        });
    }
    
    // Main cutscene methods
    async playOpeningSequence() {
        console.log('🎬 Starting REAL 3D opening cutscene...');
        
        this.isPlaying = true;
        this.currentCutscene = 'opening';
        this.currentSequence = 0;
        
        // Store original camera state
        this.originalCameraPosition = this.camera.position.clone();
        this.originalCameraRotation = this.camera.rotation.clone();
        
        // Show cutscene overlay
        this.showCutsceneOverlay();
        
        // Create 3D cutscene environment
        await this.createOpeningScene();
        
        // Start the real 3D opening sequence
        await this.walkingHomeSequence();
        
        // Cutscene will end automatically from walkingHomeSequence
    }
    
    async playTempleEntranceCutscene(templeType) {
        console.log(`🎬 Playing ${templeType} temple entrance cutscene...`);
        
        this.isPlaying = true;
        this.currentCutscene = `${templeType}_entrance`;
        
        this.showCutsceneOverlay();
        
        const sequences = this.getTempleEntranceSequences(templeType);
        await this.playSequences(sequences);
        
        this.endCutscene();
    }
    
    async playBossDefeatCutscene(templeType) {
        console.log(`🎬 Playing ${templeType} boss defeat cutscene...`);
        
        this.isPlaying = true;
        this.currentCutscene = `${templeType}_victory`;
        
        this.showCutsceneOverlay();
        
        const sequences = this.getBossDefeatSequences(templeType);
        await this.playSequences(sequences);
        
        this.endCutscene();
    }
    
    async playFinalBossCutscene() {
        console.log('🎬 Playing final boss cutscene...');
        
        this.isPlaying = true;
        this.currentCutscene = 'final_boss';
        
        this.showCutsceneOverlay();
        
        const sequences = [
            { type: 'text', content: 'With all four elemental powers in your possession...' },
            { type: 'text', content: 'The locked portal in the city center begins to glow!' },
            { type: 'scene', content: 'portal_opening' },
            { type: 'text', content: 'But as you approach, a familiar figure blocks your path...' },
            { type: 'dialogue', speaker: 'Dr. Hegesh', content: 'I didn\'t expect you to make it this far!' },
            { type: 'dialogue', speaker: 'Dr. Hegesh', content: 'But you won\'t escape my grey world!' },
            { type: 'scene', content: 'boss_transformation' },
            { type: 'text', content: 'Dr. Hegesh transforms into a massive, terrifying creature!' },
            { type: 'text', content: 'This is your final battle!' }
        ];
        
        await this.playSequences(sequences);
        this.endCutscene();
    }
    
    async playEndingCutscene() {
        console.log('🎬 Playing ending cutscene...');
        
        this.isPlaying = true;
        this.currentCutscene = 'ending';
        
        this.showCutsceneOverlay();
        
        const sequences = [
            { type: 'text', content: 'Dr. Hegesh falls defeated, his grey world crumbling...' },
            { type: 'scene', content: 'boss_defeat' },
            { type: 'text', content: 'Color begins to return to the Elemelon World!' },
            { type: 'scene', content: 'world_restoration' },
            { type: 'text', content: 'The portal home opens before you...' },
            { type: 'text', content: 'You step through and find yourself back in the real world.' },
            { type: 'text', content: 'But you\'ll never forget your adventure in the Elemelon World...' },
            { type: 'text', content: 'THE END' },
            { type: 'text', content: 'Thank you for playing Elemelon!' }
        ];
        
        await this.playSequences(sequences);
        
        // Return to main menu
        this.game.quitToMenu();
    }
    
    // Sequence playback
    async playSequences(sequences) {
        for (let i = 0; i < sequences.length && this.isPlaying; i++) {
            this.currentSequence = i;
            const sequence = sequences[i];
            
            await this.playSequence(sequence);
            
            // Wait between sequences
            if (i < sequences.length - 1) {
                await this.wait(this.sequenceDelay);
            }
        }
    }
    
    async playSequence(sequence) {
        switch (sequence.type) {
            case 'text':
                await this.showNarrativeText(sequence.content);
                break;
            case 'dialogue':
                await this.showDialogue(sequence.speaker, sequence.content);
                break;
            case 'scene':
                await this.playVisualScene(sequence.content);
                break;
        }
    }
    
    async showNarrativeText(text) {
        if (!this.dialogueText) return;
        
        // Clear previous text
        this.dialogueText.textContent = '';
        
        // Type out text character by character
        for (let i = 0; i < text.length && this.isPlaying; i++) {
            this.dialogueText.textContent = text.substring(0, i + 1);
            await this.wait(1000 / this.textSpeed);
        }
        
        // Show complete text
        this.dialogueText.textContent = text;
    }
    
    async showDialogue(speaker, text) {
        if (!this.dialogueText) return;
        
        const fullText = `${speaker}: "${text}"`;
        
        // Clear previous text
        this.dialogueText.textContent = '';
        
        // Type out dialogue
        for (let i = 0; i < fullText.length && this.isPlaying; i++) {
            this.dialogueText.textContent = fullText.substring(0, i + 1);
            await this.wait(1000 / this.textSpeed);
        }
        
        // Show complete dialogue
        this.dialogueText.textContent = fullText;
    }
    
    async playVisualScene(sceneType) {
        if (!this.cutsceneVideo) return;
        
        // Clear previous scene content
        this.cutsceneVideo.innerHTML = '';
        
        // Create visual representation of the scene
        const sceneElement = this.createSceneElement(sceneType);
        this.cutsceneVideo.appendChild(sceneElement);
        
        // Let scene play for a moment
        await this.wait(2000);
    }
    
    createSceneElement(sceneType) {
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'cutscene-scene';
        sceneDiv.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
        `;
        
        switch (sceneType) {
            case 'walking_home':
                sceneDiv.innerHTML = '🚶‍♂️🏙️';
                sceneDiv.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
                break;
                
            case 'kidnapping':
                sceneDiv.innerHTML = '🚐💨';
                sceneDiv.style.background = 'linear-gradient(135deg, #000000, #434343)';
                break;
                
            case 'pill_effect':
                sceneDiv.innerHTML = '💊✨';
                sceneDiv.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                this.animateSceneElement(sceneDiv);
                break;
                
            case 'portal_opening':
                sceneDiv.innerHTML = '🌀✨';
                sceneDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                this.animateSceneElement(sceneDiv);
                break;
                
            case 'boss_transformation':
                sceneDiv.innerHTML = '👤➡️👹';
                sceneDiv.style.background = 'linear-gradient(135deg, #ff0000, #8b0000)';
                this.animateSceneElement(sceneDiv);
                break;
                
            case 'boss_defeat':
                sceneDiv.innerHTML = '👹💥';
                sceneDiv.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)';
                break;
                
            case 'world_restoration':
                sceneDiv.innerHTML = '🌈🍈';
                sceneDiv.style.background = 'linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef, #fad0c4)';
                this.animateSceneElement(sceneDiv);
                break;
                
            default:
                sceneDiv.innerHTML = '🎬';
                break;
        }
        
        return sceneDiv;
    }
    
    animateSceneElement(element) {
        // Add pulsing animation
        element.style.animation = 'cutscenePulse 2s ease-in-out infinite';
        
        // Add CSS animation if it doesn't exist
        if (!document.getElementById('cutsceneAnimations')) {
            const style = document.createElement('style');
            style.id = 'cutsceneAnimations';
            style.textContent = `
                @keyframes cutscenePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Temple-specific cutscene sequences
    getTempleEntranceSequences(templeType) {
        const sequences = {
            water: [
                { type: 'text', content: 'You approach the Water Temple...' },
                { type: 'text', content: 'The air grows misty and cool.' },
                { type: 'dialogue', speaker: 'Temple Guardian', content: 'Who dares enter the sacred waters?' },
                { type: 'text', content: 'Prepare yourself for the trials ahead!' }
            ],
            fire: [
                { type: 'text', content: 'You approach the Fire Temple...' },
                { type: 'text', content: 'Heat waves distort the air around you.' },
                { type: 'dialogue', speaker: 'Temple Guardian', content: 'Only those with burning determination may pass!' },
                { type: 'text', content: 'The flames test your resolve!' }
            ],
            wind: [
                { type: 'text', content: 'You approach the Wind Temple...' },
                { type: 'text', content: 'Strong gusts whip around the structure.' },
                { type: 'dialogue', speaker: 'Temple Guardian', content: 'Let the winds carry you to your destiny!' },
                { type: 'text', content: 'The air itself seems alive!' }
            ],
            lightning: [
                { type: 'text', content: 'You approach the Lightning Temple...' },
                { type: 'text', content: 'Electricity crackles in the air.' },
                { type: 'dialogue', speaker: 'Temple Guardian', content: 'Feel the power of the storm!' },
                { type: 'text', content: 'Lightning illuminates your path!' }
            ]
        };
        
        return sequences[templeType] || [];
    }
    
    getBossDefeatSequences(templeType) {
        const elementNames = {
            water: 'Watermelon',
            fire: 'Firemelon',
            wind: 'Windmelon',
            lightning: 'Lightningmelon'
        };
        
        const elementName = elementNames[templeType];
        
        return [
            { type: 'text', content: `The ${templeType} temple boss falls defeated!` },
            { type: 'text', content: `A brilliant ${elementName} appears before you!` },
            { type: 'text', content: `You have gained the power of ${templeType}!` },
            { type: 'text', content: 'One step closer to restoring color to the world...' }
        ];
    }
    
    // Cutscene control methods
    showCutsceneOverlay() {
        if (this.cutsceneOverlay) {
            this.cutsceneOverlay.classList.add('active');
        }
        
        // Disable game controls
        this.game.inputManager?.disablePointerLock();
    }
    
    hideCutsceneOverlay() {
        if (this.cutsceneOverlay) {
            this.cutsceneOverlay.classList.remove('active');
        }
    }
    
    skipCutscene() {
        if (!this.isSkippable || !this.isPlaying) return;
        
        console.log('🎬 Skipping cutscene...');
        this.isPlaying = false;
        this.endCutscene();
    }
    
    endCutscene() {
        console.log('🎬 Ending cutscene...');
        
        this.isPlaying = false;
        this.currentCutscene = null;
        this.currentSequence = 0;
        
        // Hide cutscene overlay
        this.hideCutsceneOverlay();
        
        // Start gameplay
        if (this.game.getGameState() === 'cutscene') {
            this.game.startGameplay();
        }
    }
    
    // 3D Scene Creation Methods
    async createOpeningScene() {
        // Make sure we have scene and camera access
        if (!this.scene || !this.camera) {
            this.scene = this.game.gameEngine ? this.game.gameEngine.scene : null;
            this.camera = this.game.gameEngine ? this.game.gameEngine.camera : null;
        }
        
        if (!this.scene || !this.camera) {
            console.error('🎬 Cannot create 3D cutscene - missing scene or camera');
            console.log('🎬 Falling back to text cutscene...');
            await this.playTextCutscene();
            return;
        }
        
        // Clear existing cutscene objects
        this.clearCutsceneObjects();
        
        // Create city street environment
        await this.createCityStreet();
        
        // Create character models
        await this.createPlayerCharacter();
        await this.createDrHegesh();
        await this.createVan();
        
        console.log('🎬 3D Opening scene created');
    }
    
    async createCityStreet() {
        // Create street ground
        const streetGeometry = new THREE.PlaneGeometry(200, 20);
        const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const street = new THREE.Mesh(streetGeometry, streetMaterial);
        street.rotation.x = -Math.PI / 2;
        street.position.y = 0;
        this.scene.add(street);
        this.cutsceneObjects.push(street);
        
        // Create buildings
        for (let i = 0; i < 8; i++) {
            const buildingHeight = 10 + Math.random() * 15;
            const buildingGeometry = new THREE.BoxGeometry(6, buildingHeight, 6);
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0, 0, 0.2 + Math.random() * 0.2)
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (i - 4) * 12,
                buildingHeight / 2,
                15 + Math.random() * 5
            );
            
            this.scene.add(building);
            this.cutsceneObjects.push(building);
        }
    }
    
    async createPlayerCharacter() {
        // Create 3D player character
        const playerGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        playerGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDBB5 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        playerGroup.add(head);
        
        // Arms and legs for animation
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDBB5 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 1.2, 0);
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 1.2, 0);
        
        playerGroup.add(leftArm, rightArm);
        
        playerGroup.position.set(-30, 0, 0);
        this.scene.add(playerGroup);
        this.cutsceneObjects.push(playerGroup);
        this.playerCharacter = playerGroup;
        
        // Store body parts for animation
        this.playerCharacter.bodyParts = { body, head, leftArm, rightArm };
    }
    
    async createDrHegesh() {
        // Create Dr. Hegesh character
        const drGroup = new THREE.Group();
        
        // Body (menacing)
        const bodyGeometry = new THREE.CapsuleGeometry(0.6, 1.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        drGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.35);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDBB5 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.1;
        drGroup.add(head);
        
        // Evil eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 2.15, 0.3);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 2.15, 0.3);
        
        drGroup.add(leftEye, rightEye);
        
        drGroup.position.set(50, 0, 0); // Start off-screen
        this.scene.add(drGroup);
        this.cutsceneObjects.push(drGroup);
        this.drHegesh = drGroup;
    }
    
    async createVan() {
        // Create black van
        const vanGroup = new THREE.Group();
        
        // Van body
        const bodyGeometry = new THREE.BoxGeometry(6, 2.5, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.25;
        vanGroup.add(body);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
        const positions = [[-2.5, 0.8, -4], [2.5, 0.8, -4], [-2.5, 0.8, 4], [2.5, 0.8, 4]];
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            vanGroup.add(wheel);
        });
        
        vanGroup.position.set(80, 0, -5); // Start off-screen
        this.scene.add(vanGroup);
        this.cutsceneObjects.push(vanGroup);
        this.van = vanGroup;
    }
    
    async walkingHomeSequence() {
        // Set camera for walking scene
        this.camera.position.set(-40, 5, 15);
        this.camera.lookAt(-30, 1, 0);
        
        await this.wait(1000);
        
        // Show dialogue
        await this.showDialogue('', 'After a long day at work, you walk home through the empty streets...');
        
        // Animate player walking
        await this.animatePlayerWalking();
        
        await this.wait(1000);
        
        // Van appears
        await this.showDialogue('', 'Suddenly, a black van screeches to a halt beside you!');
        
        // Van drives up quickly
        await this.animateVanArrival();
        
        // Kidnapping sequence
        await this.kidnappingSequence();
    }
    
    async animatePlayerWalking() {
        return new Promise(resolve => {
            const startPos = this.playerCharacter.position.clone();
            const endPos = new THREE.Vector3(0, 0, 0);
            const duration = 4000;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.playerCharacter.position.lerpVectors(startPos, endPos, progress);
                
                // Walking animation
                const walkCycle = (elapsed / 1000) * 3;
                if (this.playerCharacter.bodyParts) {
                    this.playerCharacter.bodyParts.leftArm.rotation.x = Math.sin(walkCycle) * 0.3;
                    this.playerCharacter.bodyParts.rightArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
                    this.playerCharacter.bodyParts.body.position.y = 1 + Math.sin(walkCycle * 2) * 0.05;
                }
                
                // Camera follows
                this.camera.position.x = this.playerCharacter.position.x - 10;
                this.camera.lookAt(this.playerCharacter.position);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    async animateVanArrival() {
        return new Promise(resolve => {
            const startPos = this.van.position.clone();
            const endPos = new THREE.Vector3(5, 0, -5);
            const duration = 1500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.van.position.lerpVectors(startPos, endPos, progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    async kidnappingSequence() {
        await this.wait(1000);
        
        // Dr. Hegesh gets out
        await this.showDialogue('Dr. Hegesh', 'Get in the van. Now.');
        
        // Move Dr. Hegesh
        await this.animateObject(this.drHegesh, { x: 3, y: 0, z: -3 }, 1000);
        
        await this.showDialogue('Dr. Hegesh', 'You cannot escape your destiny.');
        
        // Player gets dragged
        await this.animateObject(this.playerCharacter, { x: 4, y: 0, z: -4 }, 2000);
        
        // Fade to black and end
        await this.fadeToBlack();
        
        await this.showDialogue('', 'You wake up in the strange grey world of Elemelon...');
        await this.showDialogue('', 'Find the elemental temples to restore color and escape!');
        
        await this.wait(2000);
        this.endCutscene();
    }
    
    async animateObject(object, targetPosition, duration) {
        return new Promise(resolve => {
            const startPos = object.position.clone();
            const endPos = new THREE.Vector3(...Object.values(targetPosition));
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                object.position.lerpVectors(startPos, endPos, progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    async fadeToBlack() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: black; z-index: 250; opacity: 0; transition: opacity 2s ease;
        `;
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => overlay.style.opacity = '1');
        await this.wait(2000);
        
        setTimeout(() => document.body.removeChild(overlay), 100);
    }
    
    clearCutsceneObjects() {
        if (!this.scene) return;
        
        this.cutsceneObjects.forEach(obj => {
            if (obj && this.scene) {
                this.scene.remove(obj);
                
                // Dispose of geometries and materials
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
                
                // Handle groups with children
                if (obj.children) {
                    obj.children.forEach(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => mat.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
            }
        });
        this.cutsceneObjects = [];
    }
    
    // Fallback text cutscene for when 3D fails
    async playTextCutscene() {
        console.log('🎬 Playing fallback text cutscene...');
        
        const messages = [
            "After a long day at work, you walk home through the empty streets...",
            "Suddenly, a black van screeches to a halt beside you!",
            "You wake up in a dark garage, tied to a chair...",
            "Dr. Hegesh: 'Welcome to your new reality. Take this pill.'",
            "You have no choice but to swallow the grey pill...",
            "The world around you begins to fade to grey...",
            "You find yourself in a strange, colorless world...",
            "Welcome to the Elemelon World. Find the elemental temples to restore color!"
        ];
        
        for (let i = 0; i < messages.length; i++) {
            await this.showDialogue('', messages[i]);
            await this.wait(2000);
        }
        
        this.endCutscene();
    }
    
    // Utility methods
    async wait(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
    
    // Public interface
    isPlayingCutscene() {
        return this.isPlaying;
    }
    
    getCurrentCutscene() {
        return this.currentCutscene;
    }
    
    setSkippable(skippable) {
        this.isSkippable = skippable;
        
        const skipBtn = document.getElementById('skipCutsceneBtn');
        if (skipBtn) {
            skipBtn.style.display = skippable ? 'block' : 'none';
        }
    }
    
    // Cleanup
    dispose() {
        this.isPlaying = false;
        this.hideCutsceneOverlay();
        console.log('🎬 Cutscene Manager disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CutsceneManager;
}
