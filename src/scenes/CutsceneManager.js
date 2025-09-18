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
        console.log('🎬 Starting opening cutscene...');
        
        this.isPlaying = true;
        this.currentCutscene = 'opening';
        this.currentSequence = 0;
        
        // Show cutscene overlay
        this.showCutsceneOverlay();
        
        // Play opening sequences
        const sequences = [
            { type: 'text', content: 'After a long day at work, you walk home through the empty streets...' },
            { type: 'scene', content: 'walking_home' },
            { type: 'text', content: 'Suddenly, a black van screeches to a halt beside you!' },
            { type: 'scene', content: 'kidnapping' },
            { type: 'text', content: 'You wake up in a dark garage, tied to a chair...' },
            { type: 'dialogue', speaker: 'Dr. Hegesh', content: 'Welcome to your new reality. Take this pill.' },
            { type: 'text', content: 'You have no choice but to swallow the grey pill...' },
            { type: 'scene', content: 'pill_effect' },
            { type: 'text', content: 'The world around you begins to fade to grey...' },
            { type: 'text', content: 'You find yourself in a strange, colorless world...' },
            { type: 'text', content: 'Welcome to the Elemelon World.' }
        ];
        
        await this.playSequences(sequences);
        
        // End cutscene and start gameplay
        this.endCutscene();
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
