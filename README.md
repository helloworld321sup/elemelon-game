# 🍈 Elemelon - 3D Adventure Game

**Escape the Grey World and Restore Color to Elemelon!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r158-blue.svg)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-green.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🎮 About Elemelon

Elemelon is an immersive 3D adventure game where you find yourself trapped in a mysterious grey world after being kidnapped and forced to take a strange pill. Navigate through the Elemelon world, collect elemental powers, defeat temple bosses, and ultimately face the evil Dr. Hegesh to restore color and return home.

### ✨ Key Features

- **🌍 Immersive 3D World**: Explore a detailed grey world built with Three.js
- **🎯 First-Person Adventure**: WASD movement with mouse look controls
- **⚔️ Combat System**: Three unique weapons with different abilities
  - 🔫 Blaster - Ranged energy weapon
  - ⚔️ Sword - Melee combat weapon  
  - 🪝 Grappling Hook - Utility and combat tool
- **🏛️ Elemental Temples**: Four temples to conquer, each with unique puzzles and bosses
  - 💧 Watermelon Temple
  - ⚡ Lightningmelon Temple
  - 💨 Windmelon Temple
  - 🔥 Firemelon Temple
- **🎒 Inventory System**: Manage weapons and consumables
- **🗺️ Interactive Map**: Minimap and fullscreen world map
- **💰 Token Economy**: Collect and spend Elemelon tokens
- **🎬 Cinematic Story**: Engaging cutscenes and storyline
- **💾 Save System**: Local storage save/load functionality

## 🚀 Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Local web server (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elemelon-game.git
   cd elemelon-game
   ```

2. **Start a local server**
   
   **Option 1: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option 2: Using Node.js**
   ```bash
   npx http-server
   ```
   
   **Option 3: Using PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**
   ```
   http://localhost:8000
   ```

4. **Start playing!**
   - Click "New Game" to begin your adventure
   - Use WASD to move, mouse to look around
   - Click to interact with objects and NPCs

## 🎯 Gameplay Guide

### Controls

| Action | Key/Mouse |
|--------|-----------|
| Move Forward | W |
| Move Backward | S |
| Move Left | A |
| Move Right | D |
| Look Around | Mouse |
| Interact | Left Click |
| Jump | Space |
| Weapon Slot 1 | 1 |
| Weapon Slot 2 | 2 |
| Weapon Slot 3 | 3 |
| Open Map | M |
| Pause | Escape |

### Game Progression

1. **Start**: Wake up in the grey Elemelon world
2. **Explore**: Navigate the city and talk to NPCs
3. **Shop**: Purchase weapons and items with tokens
4. **Temples**: Visit each elemental temple
5. **Puzzles**: Solve temple puzzles to reach bosses
6. **Bosses**: Defeat temple guardians to collect elemelons
7. **Final Battle**: Face Dr. Hegesh with all four elemelons
8. **Victory**: Restore color and return home!

### Health & Inventory

- **Health**: 8 hearts - avoid damage to survive
- **Tokens**: Start with 20, earn more by completing tasks
- **Weapons**: Carry up to 3 different weapons
- **Consumables**: 12 slots for healing items and food

## 🏗️ Project Structure

```
elemelon-game/
├── index.html              # Main game HTML
├── README.md               # This file
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
│
├── src/                   # Source code
│   ├── core/             # Core game engine
│   │   ├── GameEngine.js # 3D rendering & game loop
│   │   ├── SceneManager.js # Scene management
│   │   ├── InputManager.js # Input handling
│   │   ├── AudioManager.js # Sound management
│   │   └── SaveManager.js  # Save/load system
│   │
│   ├── entities/         # Game entities
│   │   ├── Player.js     # Player controller
│   │   ├── NPC.js        # Non-player characters
│   │   └── Enemy.js      # Enemy entities
│   │
│   ├── world/            # World generation
│   │   ├── World.js      # Main world
│   │   ├── Temple.js     # Temple structures
│   │   └── Shop.js       # Shop systems
│   │
│   ├── ui/               # User interface
│   │   ├── UIManager.js  # UI controller
│   │   ├── Inventory.js  # Inventory system
│   │   └── Minimap.js    # Map display
│   │
│   ├── scenes/           # Game scenes
│   │   ├── CutsceneManager.js # Cutscene system
│   │   └── GameplayScene.js   # Main gameplay
│   │
│   ├── styles/           # CSS stylesheets
│   │   ├── main.css      # Main styles
│   │   └── ui.css        # UI styles
│   │
│   ├── utils/            # Utility functions
│   │   └── Utils.js      # Helper functions
│   │
│   └── Game.js           # Main game controller
│
├── assets/               # Game assets
│   ├── models/           # 3D models
│   ├── textures/         # Images & textures
│   ├── audio/            # Sound effects & music
│   └── data/             # Game data files
│
└── docs/                 # Documentation
    ├── DEVELOPMENT.md    # Development guide
    ├── CONTRIBUTING.md   # Contribution guidelines
    └── API.md            # API documentation
```

## 🛠️ Technology Stack

- **🎮 Three.js**: 3D graphics and rendering
- **🌐 HTML5**: Canvas and modern web APIs
- **🎨 CSS3**: Styling and animations
- **⚡ JavaScript ES6+**: Game logic and interactivity
- **🔊 Web Audio API**: Sound effects and music
- **💾 Local Storage**: Save game persistence

## 🎨 Game Design

### Visual Style
- **Grey World Theme**: Everything starts in monochrome
- **Detailed 3D Models**: High-quality melon characters and environments
- **Atmospheric Lighting**: Dynamic shadows and fog effects
- **Smooth Animations**: Fluid character and object movements

### Audio Design
- **Immersive Soundscape**: Environmental audio and effects
- **Dynamic Music**: Adaptive soundtrack based on game state
- **Voice Acting**: Character dialogues and narration
- ** 3D Audio**: Positional sound for enhanced immersion

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Create a Pull Request

### Code Style

- Use ES6+ JavaScript features
- Follow consistent naming conventions
- Comment complex logic
- Maintain clean, readable code structure

## 📊 Performance

### System Requirements

**Minimum:**
- Modern browser with WebGL support
- 4GB RAM
- Integrated graphics

**Recommended:**
- Chrome/Firefox/Safari latest version
- 8GB RAM
- Dedicated graphics card
- Stable internet connection

### Optimization Features

- **LOD System**: Level-of-detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Texture Compression**: Optimized asset sizes
- **Performance Monitoring**: Built-in FPS tracking

## 🐛 Known Issues

- Initial loading may take time on slower connections
- Some mobile browsers may have limited performance
- Save system requires local storage support

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete story mode
- All four temples implemented
- Save/load functionality
- Full 3D world exploration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D library
- **WebGL Contributors**: For browser 3D support
- **Game Design Inspiration**: Classic adventure games
- **Beta Testers**: Community feedback and testing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/elemelon-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/elemelon-game/discussions)
- **Email**: your.email@example.com

---

**🍈 Embark on your journey to restore color to the Elemelon world! 🍈**

*Made with ❤️ and Three.js*
