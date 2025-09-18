# Contributing to Elemelon 🍈

Thank you for your interest in contributing to Elemelon! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include detailed information**:
   - Browser and version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. **Search existing feature requests** first
2. **Use the feature request template**
3. **Provide detailed description**:
   - Use case and motivation
   - Proposed implementation
   - Alternative solutions considered
   - Additional context

### Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/elemelon-game.git
   cd elemelon-game
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**
   ```bash
   # Start local server
   python -m http.server 8000
   # or
   npx http-server
   ```

#### Development Guidelines

##### Code Style

- **JavaScript ES6+**: Use modern JavaScript features
- **Consistent naming**: 
  - `camelCase` for variables and functions
  - `PascalCase` for classes and constructors
  - `UPPER_SNAKE_CASE` for constants
- **Meaningful names**: Use descriptive variable and function names
- **Comments**: Document complex logic and public APIs

##### File Organization

```
src/
├── core/          # Core engine systems
├── entities/      # Game objects (Player, NPCs, etc.)
├── world/         # World generation and management
├── ui/            # User interface components
├── scenes/        # Game scenes and cutscenes
├── styles/        # CSS stylesheets
└── utils/         # Utility functions
```

##### Code Quality

- **No console.log in production**: Use proper logging system
- **Error handling**: Always handle potential errors
- **Performance**: Consider performance impact of changes
- **Browser compatibility**: Test on multiple browsers
- **Mobile friendly**: Ensure responsive design

#### Commit Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(combat): add grappling hook weapon mechanics"
git commit -m "fix(ui): resolve inventory slot overflow on mobile"
git commit -m "docs(readme): update installation instructions"
```

#### Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** across different browsers
3. **Update changelog** for significant changes
4. **Create pull request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots/GIFs for UI changes
   - Testing instructions

## 🎮 Game Development Areas

### Core Systems
- **Game Engine**: Three.js rendering, game loop, performance
- **Physics**: Collision detection, movement, interactions
- **Audio**: Sound effects, music, 3D audio positioning
- **Input**: Keyboard, mouse, touch controls
- **Save System**: Local storage, game state management

### Gameplay Features
- **Combat System**: Weapon mechanics, enemy AI, damage system
- **Temple Puzzles**: Logic puzzles, environmental challenges
- **NPC Interactions**: Dialogue system, quest mechanics
- **Inventory Management**: Item handling, UI improvements
- **World Building**: Environment design, asset creation

### User Interface
- **HUD Elements**: Health bar, minimap, inventory display
- **Menu Systems**: Main menu, settings, pause screen
- **Mobile Support**: Touch controls, responsive design
- **Accessibility**: Screen reader support, keyboard navigation

### Content Creation
- **3D Models**: Character models, environment assets
- **Textures**: Material creation, texture optimization
- **Audio**: Sound effects, background music, voice acting
- **Animations**: Character animations, environmental effects

## 🧪 Testing

### Manual Testing
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iOS Safari, Android Chrome
- **Performance testing**: Frame rate, memory usage
- **Gameplay testing**: Complete game walkthrough

### Automated Testing
- **Unit tests**: Individual function testing
- **Integration tests**: System interaction testing
- **Performance tests**: Benchmark critical paths

## 📝 Documentation

### Code Documentation
- **JSDoc comments** for public APIs
- **README updates** for new features
- **API documentation** for complex systems
- **Tutorial updates** for gameplay changes

### User Documentation
- **Gameplay guides**: How-to instructions
- **Troubleshooting**: Common issues and solutions
- **FAQ updates**: Frequently asked questions

## 🎨 Asset Guidelines

### 3D Models
- **Format**: GLTF/GLB preferred
- **Optimization**: Keep polygon count reasonable
- **Textures**: Power-of-2 dimensions, compressed formats
- **Naming**: Consistent naming conventions

### Audio Files
- **Format**: MP3 or OGG for web compatibility
- **Quality**: Balance file size and audio quality
- **Normalization**: Consistent volume levels
- **Looping**: Seamless loops for background music

### Images
- **Format**: PNG for UI, JPEG for textures
- **Optimization**: Compress for web delivery
- **Resolution**: Multiple sizes for different screens
- **Consistency**: Maintain visual style

## 🚀 Release Process

### Version Numbering
Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes or major new features
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes and small improvements

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Performance benchmarks met
- [ ] Cross-browser testing complete
- [ ] Mobile compatibility verified

## 🏆 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **In-game credits**: Special thanks screen
- **Release notes**: Feature attribution
- **Discord/community**: Contributor role

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (link in README)
- **Email**: Direct contact for sensitive issues

### Development Support
- **Code reviews**: Get feedback on your contributions
- **Mentoring**: Help for new contributors
- **Pair programming**: Collaborative development sessions
- **Architecture discussions**: Design decision input

## 🎯 Priority Areas

Current focus areas for contributions:

### High Priority
- **Performance optimization**: Frame rate improvements
- **Mobile support**: Touch controls and responsive design
- **Bug fixes**: Critical gameplay issues
- **Accessibility**: Screen reader and keyboard support

### Medium Priority
- **New weapons**: Additional combat mechanics
- **Temple content**: More puzzles and challenges
- **Audio improvements**: Better sound design
- **Visual effects**: Particle systems and shaders

### Low Priority
- **Code refactoring**: Architecture improvements
- **Documentation**: Comprehensive guides
- **Developer tools**: Debugging and profiling tools
- **Localization**: Multi-language support

## 📋 Templates

### Bug Report Template
```markdown
**Bug Description**
Brief description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: 
- Version: 
- OS: 
- Device: 

**Screenshots**
Add screenshots if applicable
```

### Feature Request Template
```markdown
**Feature Description**
Brief description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternative Solutions**
Other ways to solve this

**Additional Context**
Any other relevant information
```

Thank you for contributing to Elemelon! Together, we can create an amazing gaming experience! 🍈✨
