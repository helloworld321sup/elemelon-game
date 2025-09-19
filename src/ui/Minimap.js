/**
 * Minimap - Minimap and full map system for Elemelon
 * Displays player position, temples, shops, and world layout
 */

class Minimap {
    constructor(game) {
        this.game = game;
        
        // Canvas elements
        this.minimapCanvas = null;
        this.minimapContext = null;
        this.fullMapCanvas = null;
        this.fullMapContext = null;
        
        // Map settings
        this.minimapSize = 150;
        this.fullMapSize = { width: 800, height: 600 };
        this.worldScale = 0.3; // Scale factor for minimap
        this.fullMapScale = 1.5; // Scale factor for full map
        
        // Map data
        this.worldBounds = { x: 500, z: 500 };
        this.mapElements = {
            temples: [],
            shops: [],
            npcs: [],
            enemies: [],
            interestPoints: []
        };
        
        // Visual settings
        this.colors = {
            background: '#2a2a2a',
            player: '#4CAF50',
            temples: {
                water: '#4080ff',
                fire: '#ff4040',
                wind: '#80ff80',
                lightning: '#ffff40'
            },
            shops: '#2196F3',
            npcs: '#FFB74D',
            enemies: '#F44336',
            buildings: '#616161',
            streets: '#424242',
            fog: 'rgba(42, 42, 42, 0.7)'
        };
        
        // Fog of war (areas the player hasn't explored)
        this.fogOfWar = true;
        this.exploredAreas = new Set();
        this.explorationRadius = 50;
        
        this.init();
    }
    
    init() {
        console.log('🗺️ Initializing Minimap System...');
        
        // Get canvas elements
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.fullMapCanvas = document.getElementById('fullMapCanvas');
        
        if (this.minimapCanvas) {
            this.minimapContext = this.minimapCanvas.getContext('2d');
        }
        
        if (this.fullMapCanvas) {
            this.fullMapContext = this.fullMapCanvas.getContext('2d');
        }
        
        // Initialize map data
        this.initializeMapData();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        console.log('🗺️ Minimap System initialized');
    }
    
    initializeMapData() {
        // Temple positions
        this.mapElements.temples = [
            { x: -150, z: -150, type: 'water', name: 'Water Temple' },
            { x: 150, z: -150, type: 'lightning', name: 'Lightning Temple' },
            { x: -150, z: 150, type: 'wind', name: 'Wind Temple' },
            { x: 150, z: 150, type: 'fire', name: 'Fire Temple' }
        ];
        
        // Shop positions
        this.mapElements.shops = [
            { x: -50, z: 0, type: 'weapon', name: 'Weapon Shop' },
            { x: 50, z: 0, type: 'consumable', name: 'Item Shop' },
            { x: 0, z: -50, type: 'general', name: 'General Store' }
        ];
        
        // Interest points
        this.mapElements.interestPoints = [
            { x: 0, z: 0, type: 'portal', name: 'Locked Portal' },
            { x: 0, z: 0, type: 'spawn', name: 'Spawn Point' }
        ];
    }
    
    setupEventHandlers() {
        // Minimap click to open full map
        if (this.minimapCanvas) {
            this.minimapCanvas.addEventListener('click', () => {
                this.game.showFullMap();
            });
        }
        
        // Full map click to close
        if (this.fullMapCanvas) {
            this.fullMapCanvas.addEventListener('click', (event) => {
                // Check if clicking on map elements for interaction
                this.handleFullMapClick(event);
            });
        }
    }
    
    handleFullMapClick(event) {
        const rect = this.fullMapCanvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const worldPos = this.screenToWorld(clickX, clickY, true);
        
        // Check if clicking on any map elements
        const clickedElement = this.getElementAtPosition(worldPos.x, worldPos.z);
        
        if (clickedElement) {
            this.showElementInfo(clickedElement);
        }
    }
    
    screenToWorld(screenX, screenY, isFullMap = false) {
        const canvas = isFullMap ? this.fullMapCanvas : this.minimapCanvas;
        const scale = isFullMap ? this.fullMapScale : this.worldScale;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        return {
            x: (screenX - centerX) / scale,
            z: (screenY - centerY) / scale
        };
    }
    
    worldToScreen(worldX, worldZ, isFullMap = false) {
        const canvas = isFullMap ? this.fullMapCanvas : this.minimapCanvas;
        const scale = isFullMap ? this.fullMapScale : this.worldScale;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        return {
            x: centerX + worldX * scale,
            y: centerY + worldZ * scale
        };
    }
    
    getElementAtPosition(x, z, radius = 10) {
        // Check temples
        for (const temple of this.mapElements.temples) {
            const distance = Math.sqrt((temple.x - x) ** 2 + (temple.z - z) ** 2);
            if (distance <= radius) {
                return { ...temple, elementType: 'temple' };
            }
        }
        
        // Check shops
        for (const shop of this.mapElements.shops) {
            const distance = Math.sqrt((shop.x - x) ** 2 + (shop.z - z) ** 2);
            if (distance <= radius) {
                return { ...shop, elementType: 'shop' };
            }
        }
        
        return null;
    }
    
    showElementInfo(element) {
        let message = `${element.name}`;
        
        if (element.elementType === 'temple') {
            const playerData = this.game.getPlayerData();
            const isCompleted = playerData.collectedElements[element.type];
            message += isCompleted ? ' ✅ (Completed)' : ' 🔒 (Not Completed)';
        }
        
        // Create info popup
        this.showMapInfoPopup(message);
    }
    
    showMapInfoPopup(message) {
        // Remove existing popup
        const existingPopup = document.querySelector('.map-info-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create new popup
        const popup = document.createElement('div');
        popup.className = 'map-info-popup';
        popup.textContent = message;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            z-index: 10001;
            font-size: 16px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(popup);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000);
    }
    
    // Drawing methods
    drawMinimap() {
        if (!this.minimapContext) return;
        
        const ctx = this.minimapContext;
        const canvas = this.minimapCanvas;
        
        // Clear canvas
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw world elements
        this.drawWorldElements(ctx, false);
        
        // Draw fog of war
        if (this.fogOfWar) {
            this.drawFogOfWar(ctx, false);
        }
        
        // Draw player
        this.drawPlayer(ctx, false);
        
        // Draw border
        this.drawMapBorder(ctx);
    }
    
    drawFullMap() {
        if (!this.fullMapContext) return;
        
        const ctx = this.fullMapContext;
        const canvas = this.fullMapCanvas;
        
        // Clear canvas
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.drawGrid(ctx, true);
        
        // Draw world elements
        this.drawWorldElements(ctx, true);
        
        // Draw fog of war
        if (this.fogOfWar) {
            this.drawFogOfWar(ctx, true);
        }
        
        // Draw player
        this.drawPlayer(ctx, true);
        
        // Draw legend
        this.drawMapLegend(ctx, true);
        
        // Draw border
        this.drawMapBorder(ctx);
    }
    
    drawGrid(ctx, isFullMap) {
        const canvas = isFullMap ? this.fullMapCanvas : this.minimapCanvas;
        const scale = isFullMap ? this.fullMapScale : this.worldScale;
        
        ctx.strokeStyle = this.colors.streets;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gridSize = 50 * scale;
        
        // Vertical lines
        for (let x = -200; x <= 200; x += 50) {
            const screenX = centerX + x * scale;
            if (screenX >= 0 && screenX <= canvas.width) {
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, canvas.height);
                ctx.stroke();
            }
        }
        
        // Horizontal lines
        for (let z = -200; z <= 200; z += 50) {
            const screenY = centerY + z * scale;
            if (screenY >= 0 && screenY <= canvas.height) {
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(canvas.width, screenY);
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawWorldElements(ctx, isFullMap) {
        // First draw the actual terrain heightmap
        this.drawTerrainHeightmap(ctx, isFullMap);
        
        // Then draw rock formations and natural features
        this.drawRockFormations(ctx, isFullMap);
        
        // Draw grass patches
        this.drawGrassPatches(ctx, isFullMap);
        
        // Draw stone paths
        this.drawStonePaths(ctx, isFullMap);
        
        // Draw natural structures (pagodas, arches, mountains)
        this.drawNaturalStructures(ctx, isFullMap);
        
        // Draw special landmarks
        this.drawLandmarks(ctx, isFullMap);
        
        // Draw temples
        this.mapElements.temples.forEach(temple => {
            this.drawTemple(ctx, temple, isFullMap);
        });
        
        // Draw shops
        this.mapElements.shops.forEach(shop => {
            this.drawShop(ctx, shop, isFullMap);
        });
        
        // Draw NPCs (if visible)
        this.updateNPCPositions();
        this.mapElements.npcs.forEach(npc => {
            if (this.isPositionExplored(npc.x, npc.z)) {
                this.drawNPC(ctx, npc, isFullMap);
            }
        });
        
        // Draw enemies (if visible)
        this.updateEnemyPositions();
        this.mapElements.enemies.forEach(enemy => {
            if (this.isPositionExplored(enemy.x, enemy.z)) {
                this.drawEnemy(ctx, enemy, isFullMap);
            }
        });
        
        // Draw interest points
        this.mapElements.interestPoints.forEach(point => {
            this.drawInterestPoint(ctx, point, isFullMap);
        });
    }
    
    // Terrain rendering methods
    drawTerrainHeightmap(ctx, isFullMap) {
        const canvas = isFullMap ? this.fullMapCanvas : this.minimapCanvas;
        const scale = isFullMap ? this.fullMapScale : this.worldScale;
        const resolution = isFullMap ? 4 : 8; // Higher resolution for full map
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const worldSize = 1000; // Match terrain size
        
        // Draw terrain heightmap with color-coded elevations
        for (let x = -worldSize; x < worldSize; x += resolution) {
            for (let z = -worldSize; z < worldSize; z += resolution) {
                // Get terrain height using same formula as game
                const height = this.getTerrainHeight(x, z);
                
                // Convert world coordinates to screen coordinates
                const screenX = centerX + (x * scale);
                const screenY = centerY + (z * scale);
                
                // Skip if outside canvas
                if (screenX < 0 || screenX >= canvas.width || screenY < 0 || screenY >= canvas.height) {
                    continue;
                }
                
                // Color based on height (grey world)
                const normalizedHeight = (height + 25) / 50; // Normalize -25 to 25 range to 0-1
                const greyValue = Math.floor(60 + normalizedHeight * 40); // 60-100 grey range
                const color = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
                
                ctx.fillStyle = color;
                ctx.fillRect(screenX, screenY, resolution, resolution);
            }
        }
    }
    
    getTerrainHeight(x, z) {
        // Same formula as terrain generation
        const scale1 = 0.02;
        const scale2 = 0.05;
        const scale3 = 0.1;
        
        const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 15;
        const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 8;
        const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 3;
        
        return height1 + height2 + height3;
    }
    
    drawRockFormations(ctx, isFullMap) {
        // Get actual rock positions from SceneManager
        const sceneManager = this.game.sceneManager;
        if (!sceneManager || !sceneManager.cityObjects) return;
        
        const size = isFullMap ? 6 : 3;
        
        // Draw actual rock objects from the world
        sceneManager.cityObjects.forEach(object => {
            if (object.userData && object.userData.isCollidable && object.position) {
                // Check if this is likely a rock (has position in expected range)
                const distance = Math.sqrt(object.position.x * object.position.x + object.position.z * object.position.z);
                if (distance > 50 && distance < 900) { // Rock distance range
                    const pos = this.worldToScreen(object.position.x, object.position.z, isFullMap);
                    
                    // Draw main rock
                    ctx.fillStyle = '#404040';
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add smaller rocks around main rock
                    for (let j = 0; j < 3; j++) {
                        const smallAngle = (j / 3) * Math.PI * 2;
                        const smallDistance = size * 1.5;
                        const smallX = pos.x + Math.cos(smallAngle) * smallDistance;
                        const smallY = pos.y + Math.sin(smallAngle) * smallDistance;
                        
                        ctx.fillStyle = '#383838';
                        ctx.beginPath();
                        ctx.arc(smallX, smallY, size * 0.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });
    }
    
    drawGrassPatches(ctx, isFullMap) {
        // Use deterministic grass positions based on world coordinates
        const grassCount = isFullMap ? 300 : 150; // Fewer on minimap for performance
        const size = isFullMap ? 4 : 2;
        
        // Generate consistent grass positions using simple hash function
        for (let i = 0; i < grassCount; i++) {
            // Use index-based deterministic positioning
            const seedX = (i * 73) % 1600 - 800; // Deterministic X
            const seedZ = ((i * 97) % 1600) - 800; // Deterministic Z
            
            const pos = this.worldToScreen(seedX, seedZ, isFullMap);
            
            // Draw grass patch as slightly lighter grey
            ctx.fillStyle = '#505050';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    drawStonePaths(ctx, isFullMap) {
        const pathCount = 8;
        
        // Draw winding stone paths with deterministic curves
        for (let i = 0; i < pathCount; i++) {
            const startAngle = (i / pathCount) * Math.PI * 2;
            let currentX = Math.cos(startAngle) * 50;
            let currentZ = Math.sin(startAngle) * 50;
            let currentAngle = startAngle;
            
            ctx.strokeStyle = '#606060';
            ctx.lineWidth = isFullMap ? 3 : 1.5;
            ctx.lineCap = 'round';
            
            const pos = this.worldToScreen(currentX, currentZ, isFullMap);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            
            // Draw path segments with deterministic curves
            for (let j = 0; j < 100; j++) {
                // Use deterministic angle changes instead of random
                const angleChange = Math.sin((i * 100 + j) * 0.1) * 0.3;
                currentAngle += angleChange;
                currentX += Math.cos(currentAngle) * 2;
                currentZ += Math.sin(currentAngle) * 2;
                
                const segmentPos = this.worldToScreen(currentX, currentZ, isFullMap);
                ctx.lineTo(segmentPos.x, segmentPos.y);
            }
            
            ctx.stroke();
        }
    }
    
    drawNaturalStructures(ctx, isFullMap) {
        // Get actual natural structures from SceneManager
        const sceneManager = this.game.sceneManager;
        if (!sceneManager || !sceneManager.cityObjects) return;
        
        const size = isFullMap ? 10 : 5;
        let structureIndex = 0;
        
        // Draw actual natural structure objects from the world
        sceneManager.cityObjects.forEach(object => {
            if (object.userData && object.userData.isCollidable && object.position) {
                // Check if this is likely a natural structure (not too close to center, medium distance)
                const distance = Math.sqrt(object.position.x * object.position.x + object.position.z * object.position.z);
                if (distance > 100 && distance < 800 && Math.abs(object.position.x) > 100 && Math.abs(object.position.z) > 100) {
                    const pos = this.worldToScreen(object.position.x, object.position.z, isFullMap);
                    const structureType = structureIndex % 3;
                    
                    if (structureType === 0) {
                        // Pagoda tower - draw as stacked squares
                        ctx.fillStyle = '#4a4a4a';
                        for (let level = 0; level < 3; level++) {
                            const levelSize = size - level * 2;
                            ctx.fillRect(pos.x - levelSize/2, pos.y - levelSize/2, levelSize, levelSize);
                        }
                    } else if (structureType === 1) {
                        // Stone archway - draw as arch shape
                        ctx.strokeStyle = '#454545';
                        ctx.lineWidth = isFullMap ? 4 : 2;
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, size, 0, Math.PI);
                        ctx.stroke();
                    } else {
                        // Mountain formation - draw as triangle
                        ctx.fillStyle = '#424242';
                        ctx.beginPath();
                        ctx.moveTo(pos.x, pos.y - size);
                        ctx.lineTo(pos.x - size, pos.y + size);
                        ctx.lineTo(pos.x + size, pos.y + size);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    structureIndex++;
                    if (structureIndex >= 25) return; // Limit to 25 structures
                }
            }
        });
    }
    
    drawLandmarks(ctx, isFullMap) {
        const scale = isFullMap ? this.fullMapScale : this.worldScale;
        
        // Central Plaza
        const plazaPos = this.worldToScreen(0, 0, isFullMap);
        const plazaSize = isFullMap ? 20 : 10;
        
        ctx.fillStyle = '#555555';
        ctx.beginPath();
        ctx.arc(plazaPos.x, plazaPos.y, plazaSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pillars around plaza
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillarX = plazaPos.x + Math.cos(angle) * plazaSize * 0.8;
            const pillarY = plazaPos.y + Math.sin(angle) * plazaSize * 0.8;
            
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.arc(pillarX, pillarY, isFullMap ? 3 : 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Sacred Grove (Northeast)
        const grovePos = this.worldToScreen(300, 300, isFullMap);
        const groveSize = isFullMap ? 15 : 8;
        
        // Draw circle of dead trees
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const treeX = grovePos.x + Math.cos(angle) * groveSize;
            const treeY = grovePos.y + Math.sin(angle) * groveSize;
            
            ctx.fillStyle = '#353535';
            ctx.beginPath();
            ctx.arc(treeX, treeY, isFullMap ? 4 : 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Ancient Ruins (Southwest)
        const ruinsPos = this.worldToScreen(-400, -400, isFullMap);
        const ruinsSize = isFullMap ? 25 : 12;
        
        // Draw scattered broken pillars
        for (let i = 0; i < 8; i++) {
            const pillarX = ruinsPos.x + (Math.random() - 0.5) * ruinsSize * 2;
            const pillarY = ruinsPos.y + (Math.random() - 0.5) * ruinsSize * 2;
            
            ctx.fillStyle = '#404040';
            ctx.fillRect(pillarX - 1, pillarY - (isFullMap ? 6 : 3), 2, isFullMap ? 12 : 6);
        }
    }
    
    drawTemple(ctx, temple, isFullMap) {
        const pos = this.worldToScreen(temple.x, temple.z, isFullMap);
        const size = isFullMap ? 12 : 6;
        
        // Check if temple is completed
        const playerData = this.game.getPlayerData();
        const isCompleted = playerData.collectedElements[temple.type];
        
        ctx.fillStyle = this.colors.temples[temple.type];
        ctx.globalAlpha = isCompleted ? 1.0 : 0.7;
        
        // Draw temple as diamond
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.restore();
        
        // Draw completion indicator
        if (isCompleted) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw label on full map
        if (isFullMap) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(temple.name, pos.x, pos.y + size + 15);
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawShop(ctx, shop, isFullMap) {
        const pos = this.worldToScreen(shop.x, shop.z, isFullMap);
        const size = isFullMap ? 8 : 4;
        
        ctx.fillStyle = this.colors.shops;
        ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size);
        
        // Draw label on full map
        if (isFullMap) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(shop.name, pos.x, pos.y + size + 12);
        }
    }
    
    drawNPC(ctx, npc, isFullMap) {
        const pos = this.worldToScreen(npc.x, npc.z, isFullMap);
        const size = isFullMap ? 4 : 2;
        
        ctx.fillStyle = this.colors.npcs;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEnemy(ctx, enemy, isFullMap) {
        const pos = this.worldToScreen(enemy.x, enemy.z, isFullMap);
        const size = isFullMap ? 5 : 3;
        
        ctx.fillStyle = this.colors.enemies;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.restore();
    }
    
    drawInterestPoint(ctx, point, isFullMap) {
        const pos = this.worldToScreen(point.x, point.z, isFullMap);
        
        if (point.type === 'portal') {
            const size = isFullMap ? 10 : 5;
            
            // Check if portal is unlocked
            const playerData = this.game.getPlayerData();
            const allElementsCollected = Object.values(playerData.collectedElements).every(Boolean);
            
            ctx.strokeStyle = allElementsCollected ? '#9C27B0' : '#666666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.stroke();
            
            if (allElementsCollected) {
                ctx.fillStyle = '#9C27B0';
                ctx.globalAlpha = 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }
    
    drawPlayer(ctx, isFullMap) {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        const pos = this.worldToScreen(player.position.x, player.position.z, isFullMap);
        const size = isFullMap ? 6 : 3;
        
        // Draw player dot
        ctx.fillStyle = this.colors.player;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        const camera = this.game.gameEngine.camera;
        if (camera) {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            const lineLength = isFullMap ? 12 : 6;
            const endX = pos.x + direction.x * lineLength;
            const endY = pos.y + direction.z * lineLength;
            
            ctx.strokeStyle = this.colors.player;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Draw label on full map
        if (isFullMap) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('You', pos.x, pos.y - size - 5);
        }
    }
    
    drawFogOfWar(ctx, isFullMap) {
        const player = this.game.sceneManager?.player;
        if (!player) return;
        
        // Update explored areas
        this.updateExploredAreas(player.position);
        
        // Create fog overlay
        ctx.fillStyle = this.colors.fog;
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw fog over unexplored areas
        // This is a simplified implementation
        // In a full game, you'd use more sophisticated fog of war
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    drawMapBorder(ctx) {
        const canvas = ctx.canvas;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    }
    
    drawMapLegend(ctx, isFullMap) {
        if (!isFullMap) return;
        
        const canvas = ctx.canvas;
        const legendX = canvas.width - 150;
        const legendY = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(legendX - 10, legendY - 10, 140, 120);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        const legendItems = [
            { color: this.colors.player, text: 'You' },
            { color: this.colors.temples.water, text: 'Temples' },
            { color: this.colors.shops, text: 'Shops' },
            { color: this.colors.npcs, text: 'NPCs' },
            { color: this.colors.enemies, text: 'Enemies' }
        ];
        
        legendItems.forEach((item, index) => {
            const y = legendY + index * 20;
            
            // Draw color indicator
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, y - 6, 12, 12);
            
            // Draw text
            ctx.fillStyle = 'white';
            ctx.fillText(item.text, legendX + 20, y + 3);
        });
    }
    
    // Position tracking and fog of war
    updateExploredAreas(playerPosition) {
        const gridSize = 10;
        const gridX = Math.floor(playerPosition.x / gridSize);
        const gridZ = Math.floor(playerPosition.z / gridSize);
        
        // Mark nearby grid cells as explored
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                const key = `${gridX + dx},${gridZ + dz}`;
                this.exploredAreas.add(key);
            }
        }
    }
    
    isPositionExplored(x, z) {
        if (!this.fogOfWar) return true;
        
        const gridSize = 10;
        const gridX = Math.floor(x / gridSize);
        const gridZ = Math.floor(z / gridSize);
        const key = `${gridX},${gridZ}`;
        
        return this.exploredAreas.has(key);
    }
    
    updateNPCPositions() {
        // Get NPC positions from scene manager
        const npcs = this.game.sceneManager?.npcs || [];
        
        this.mapElements.npcs = npcs.map(npc => ({
            x: npc.position.x,
            z: npc.position.z,
            type: 'npc'
        }));
    }
    
    updateEnemyPositions() {
        // Get enemy positions from scene manager
        const enemies = this.game.sceneManager?.enemies || [];
        
        this.mapElements.enemies = enemies.map(enemy => ({
            x: enemy.position.x,
            z: enemy.position.z,
            type: 'enemy'
        }));
    }
    
    // Public interface
    update() {
        // Update minimap
        this.drawMinimap();
    }
    
    updateFullMap() {
        // Update full map
        this.drawFullMap();
    }
    
    toggleFogOfWar() {
        this.fogOfWar = !this.fogOfWar;
        console.log(`🗺️ Fog of war ${this.fogOfWar ? 'enabled' : 'disabled'}`);
    }
    
    revealAllAreas() {
        // Debug function to reveal entire map
        for (let x = -50; x <= 50; x++) {
            for (let z = -50; z <= 50; z++) {
                this.exploredAreas.add(`${x},${z}`);
            }
        }
        console.log('🗺️ All areas revealed');
    }
    
    // Cleanup
    dispose() {
        console.log('🗺️ Minimap disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minimap;
}
