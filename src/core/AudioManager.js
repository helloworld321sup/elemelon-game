/**
 * AudioManager - Handles all audio for Elemelon game
 * Manages background music, sound effects, and 3D positional audio
 */

class AudioManager {
    constructor(game) {
        this.game = game;
        
        // Audio context
        this.audioContext = null;
        this.listener = null;
        
        // Audio storage
        this.sounds = new Map();
        this.music = new Map();
        
        // Current playing audio
        this.currentMusic = null;
        this.musicVolume = 0.8;
        this.sfxVolume = 1.0;
        this.masterVolume = 1.0;
        
        // Audio settings
        this.isMuted = false;
        this.fadeSpeed = 0.02;
        
        // Preload audio files
        this.audioFiles = [
            { name: 'menuMusic', url: 'assets/audio/menu.mp3', type: 'music' },
            { name: 'backgroundMusic', url: 'assets/audio/background.mp3', type: 'music' },
            { name: 'templeMusic', url: 'assets/audio/temple.mp3', type: 'music' },
            { name: 'bossMusic', url: 'assets/audio/boss.mp3', type: 'music' },
            
            { name: 'footsteps', url: 'assets/audio/footsteps.mp3', type: 'sfx' },
            { name: 'tokenCollect', url: 'assets/audio/token.mp3', type: 'sfx' },
            { name: 'weaponFire', url: 'assets/audio/blaster.mp3', type: 'sfx' },
            { name: 'swordSlash', url: 'assets/audio/sword.mp3', type: 'sfx' },
            { name: 'grappleShoot', url: 'assets/audio/grapple.mp3', type: 'sfx' },
            { name: 'enemyHit', url: 'assets/audio/hit.mp3', type: 'sfx' },
            { name: 'playerHurt', url: 'assets/audio/hurt.mp3', type: 'sfx' },
            { name: 'itemPickup', url: 'assets/audio/pickup.mp3', type: 'sfx' },
            { name: 'doorOpen', url: 'assets/audio/door.mp3', type: 'sfx' },
            { name: 'buttonClick', url: 'assets/audio/click.mp3', type: 'sfx' }
        ];
    }
    
    async init() {
        console.log('🔊 Initializing Audio Manager...');
        
        try {
            // Initialize Web Audio API
            this.initAudioContext();
            
            // Setup 3D audio listener
            this.setup3DAudio();
            
            // Get settings
            const audioSettings = this.game.getGameSettings().audio;
            this.masterVolume = audioSettings.masterVolume;
            this.musicVolume = audioSettings.musicVolume;
            this.sfxVolume = audioSettings.sfxVolume;
            
            console.log('🔊 Audio Manager initialized');
            
        } catch (error) {
            console.warn('🔊 Audio initialization failed:', error);
            // Continue without audio
        }
    }
    
    initAudioContext() {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        
        if (AudioContext) {
            this.audioContext = new AudioContext();
            
            // Resume context on user interaction (required by browsers)
            const resumeContext = () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                document.removeEventListener('click', resumeContext);
                document.removeEventListener('keydown', resumeContext);
            };
            
            document.addEventListener('click', resumeContext);
            document.addEventListener('keydown', resumeContext);
        }
    }
    
    setup3DAudio() {
        if (!this.audioContext) return;
        
        // Create 3D audio listener
        this.listener = this.audioContext.listener;
        
        // Set initial listener properties
        if (this.listener.positionX) {
            // Modern browsers
            this.listener.positionX.setValueAtTime(0, this.audioContext.currentTime);
            this.listener.positionY.setValueAtTime(0, this.audioContext.currentTime);
            this.listener.positionZ.setValueAtTime(0, this.audioContext.currentTime);
            
            this.listener.forwardX.setValueAtTime(0, this.audioContext.currentTime);
            this.listener.forwardY.setValueAtTime(0, this.audioContext.currentTime);
            this.listener.forwardZ.setValueAtTime(-1, this.audioContext.currentTime);
            
            this.listener.upX.setValueAtTime(0, this.audioContext.currentTime);
            this.listener.upY.setValueAtTime(1, this.audioContext.currentTime);
            this.listener.upZ.setValueAtTime(0, this.audioContext.currentTime);
        } else {
            // Fallback for older browsers
            this.listener.setPosition(0, 0, 0);
            this.listener.setOrientation(0, 0, -1, 0, 1, 0);
        }
    }
    
    async loadAudioFiles(customFiles = null) {
        const filesToLoad = customFiles || this.audioFiles;
        
        console.log(`🔊 Loading ${filesToLoad.length} audio files...`);
        
        const loadPromises = filesToLoad.map(file => this.loadAudioFile(file));
        
        try {
            await Promise.all(loadPromises);
            console.log('🔊 All audio files loaded successfully');
        } catch (error) {
            console.warn('🔊 Some audio files failed to load:', error);
        }
    }
    
    async loadAudioFile(fileInfo) {
        try {
            // For now, create placeholder audio objects since we don't have actual files
            // In a real implementation, you would load actual audio files
            
            const audioData = {
                name: fileInfo.name,
                type: fileInfo.type,
                url: fileInfo.url,
                buffer: null, // Would contain actual audio buffer
                isLoaded: false
            };
            
            if (fileInfo.type === 'music') {
                this.music.set(fileInfo.name, audioData);
            } else {
                this.sounds.set(fileInfo.name, audioData);
            }
            
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 100));
            
            audioData.isLoaded = true;
            
        } catch (error) {
            console.warn(`🔊 Failed to load ${fileInfo.name}:`, error);
        }
    }
    
    // Music control methods
    playMusic(musicName, loop = true, fadeIn = true) {
        console.log(`🎵 Playing music: ${musicName}`);
        
        // Stop current music
        if (this.currentMusic) {
            this.stopMusic(fadeIn);
        }
        
        const musicData = this.music.get(musicName);
        if (!musicData) {
            console.warn(`🎵 Music not found: ${musicName}`);
            return;
        }
        
        // In a real implementation, you would play the actual audio
        this.currentMusic = {
            name: musicName,
            data: musicData,
            volume: this.musicVolume * this.masterVolume,
            isPlaying: true
        };
        
        console.log(`🎵 Now playing: ${musicName}`);
    }
    
    stopMusic(fadeOut = true) {
        if (!this.currentMusic) return;
        
        console.log(`🎵 Stopping music: ${this.currentMusic.name}`);
        
        if (fadeOut) {
            // Implement fade out
            this.fadeOutCurrentMusic();
        } else {
            this.currentMusic = null;
        }
    }
    
    fadeOutCurrentMusic() {
        if (!this.currentMusic) return;
        
        const fadeInterval = setInterval(() => {
            if (this.currentMusic && this.currentMusic.volume > 0) {
                this.currentMusic.volume -= this.fadeSpeed;
                if (this.currentMusic.volume <= 0) {
                    this.currentMusic = null;
                    clearInterval(fadeInterval);
                }
            } else {
                clearInterval(fadeInterval);
            }
        }, 50);
    }
    
    // Sound effect methods
    playSound(soundName, volume = 1.0, position = null) {
        const soundData = this.sounds.get(soundName);
        if (!soundData) {
            console.warn(`🔊 Sound not found: ${soundName}`);
            return;
        }
        
        const finalVolume = volume * this.sfxVolume * this.masterVolume;
        
        if (position) {
            console.log(`🔊 Playing 3D sound: ${soundName} at position`, position);
            // In a real implementation, you would create a 3D positioned audio source
        } else {
            console.log(`🔊 Playing sound: ${soundName} (volume: ${finalVolume.toFixed(2)})`);
        }
        
        // In a real implementation, you would play the actual sound effect
    }
    
    // 3D positional audio
    play3DSound(soundName, position, volume = 1.0, maxDistance = 50) {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        // Calculate distance-based volume
        const distance = player.position.distanceTo(position);
        const distanceVolume = Math.max(0, 1 - (distance / maxDistance));
        
        this.playSound(soundName, volume * distanceVolume, position);
    }
    
    // Footstep system
    playFootstep(surface = 'default') {
        const footstepSounds = {
            default: 'footsteps',
            grass: 'footsteps', // Would be different sounds in real implementation
            stone: 'footsteps',
            metal: 'footsteps'
        };
        
        const soundName = footstepSounds[surface] || 'footsteps';
        this.playSound(soundName, 0.3 + Math.random() * 0.2); // Vary volume slightly
    }
    
    // UI sound effects
    playUISound(action) {
        const uiSounds = {
            click: 'buttonClick',
            pickup: 'itemPickup',
            tokenCollect: 'tokenCollect',
            weaponSwitch: 'buttonClick',
            menuOpen: 'buttonClick',
            error: 'buttonClick' // Would be different in real implementation
        };
        
        const soundName = uiSounds[action];
        if (soundName) {
            this.playSound(soundName, 0.7);
        }
    }
    
    // Combat sounds
    playWeaponSound(weaponType, action) {
        const weaponSounds = {
            blaster: { fire: 'weaponFire', reload: 'buttonClick' },
            sword: { attack: 'swordSlash', block: 'buttonClick' },
            grappling_hook: { fire: 'grappleShoot', retract: 'buttonClick' }
        };
        
        const weapon = weaponSounds[weaponType];
        if (weapon && weapon[action]) {
            this.playSound(weapon[action]);
        }
    }
    
    // Update methods
    update(deltaTime) {
        // Update 3D audio listener position
        this.updateListener();
        
        // Update any ongoing audio effects
        this.updateAudioEffects(deltaTime);
    }
    
    updateListener() {
        const player = this.game.sceneManager?.player;
        if (!player || !this.listener) return;
        
        const position = player.position;
        const camera = this.game.gameEngine.camera;
        
        // Update listener position and orientation
        if (this.listener.positionX) {
            // Modern browsers
            this.listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
            this.listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
            this.listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
            
            // Get camera direction
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            this.listener.forwardX.setValueAtTime(direction.x, this.audioContext.currentTime);
            this.listener.forwardY.setValueAtTime(direction.y, this.audioContext.currentTime);
            this.listener.forwardZ.setValueAtTime(direction.z, this.audioContext.currentTime);
        } else {
            // Fallback for older browsers
            this.listener.setPosition(position.x, position.y, position.z);
        }
    }
    
    updateAudioEffects(deltaTime) {
        // Update any time-based audio effects
        // For example, echo effects in temples, wind sounds, etc.
    }
    
    // Volume control
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Master volume set to ${(this.masterVolume * 100).toFixed(0)}%`);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`🎵 Music volume set to ${(this.musicVolume * 100).toFixed(0)}%`);
        
        // Update current music volume
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 SFX volume set to ${(this.sfxVolume * 100).toFixed(0)}%`);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`🔊 Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
        
        if (this.isMuted) {
            this.stopMusic(false);
        }
    }
    
    // Environmental audio
    playEnvironmentalAudio(environment) {
        const environmentSounds = {
            city: 'backgroundMusic',
            temple: 'templeMusic',
            boss: 'bossMusic'
        };
        
        const musicName = environmentSounds[environment];
        if (musicName) {
            this.playMusic(musicName);
        }
    }
    
    // Cleanup
    dispose() {
        this.stopMusic(false);
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds.clear();
        this.music.clear();
        
        console.log('🔊 Audio Manager disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
