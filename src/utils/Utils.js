/**
 * Utils - Utility functions for Elemelon game
 * Common helper functions used throughout the game
 */

class Utils {
    // Math utilities
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Vector utilities
    static distance2D(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static distance3D(pos1, pos2) {
        return pos1.distanceTo(pos2);
    }
    
    static normalize2D(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    static lerpColor(color1, color2, factor) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, factor);
    }
    
    // Time utilities
    static formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
    
    // String utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    static camelToSnake(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
    
    static snakeToCamel(str) {
        return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    
    // Array utilities
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    static removeFromArray(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }
    
    // Object utilities
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    static mergeObjects(target, source) {
        return Object.assign({}, target, source);
    }
    
    // DOM utilities
    static createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (startOpacity * (1 - progress)).toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Local storage utilities
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }
    
    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Game-specific utilities
    static getElementalColor(element) {
        const colors = {
            water: 0x4080ff,
            fire: 0xff4040,
            wind: 0x80ff80,
            lightning: 0xffff40,
            earth: 0x8B4513,
            ice: 0x87CEEB,
            shadow: 0x4B0082,
            light: 0xFFFFE0
        };
        
        return colors[element] || 0x808080;
    }
    
    static getWeaponIcon(weaponType) {
        const icons = {
            blaster: '🔫',
            sword: '⚔️',
            grappling_hook: '🪝',
            bow: '🏹',
            staff: '🪄',
            hammer: '🔨'
        };
        
        return icons[weaponType] || '❓';
    }
    
    static getConsumableIcon(itemType) {
        const icons = {
            health: '💊',
            energy: '⚡',
            food: '🍎',
            potion: '🧪',
            key: '🗝️',
            gem: '💎'
        };
        
        return icons[itemType] || '❓';
    }
    
    // Physics utilities
    static checkSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < (radius1 + radius2);
    }
    
    static checkBoxCollision(box1, box2) {
        return (box1.min.x <= box2.max.x && box1.max.x >= box2.min.x) &&
               (box1.min.y <= box2.max.y && box1.max.y >= box2.min.y) &&
               (box1.min.z <= box2.max.z && box1.max.z >= box2.min.z);
    }
    
    static raycastGround(position, objects) {
        const raycaster = new THREE.Raycaster();
        raycaster.set(position, new THREE.Vector3(0, -1, 0));
        
        const intersects = raycaster.intersectObjects(objects, true);
        return intersects.length > 0 ? intersects[0] : null;
    }
    
    // Audio utilities
    static calculateAudioDistance(listenerPos, sourcePos, maxDistance = 50) {
        const distance = listenerPos.distanceTo(sourcePos);
        return Math.max(0, 1 - (distance / maxDistance));
    }
    
    // Validation utilities
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static isValidUsername(username) {
        return username && username.length >= 3 && username.length <= 20;
    }
    
    static sanitizeInput(input) {
        return input.replace(/[<>\"'&]/g, '');
    }
    
    // Browser utilities
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    static isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }
    
    static getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    }
    
    // Loading utilities
    static async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    
    static async loadJSON(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Failed to load JSON:', error);
            throw error;
        }
    }
    
    static createLoadingPromise(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    // Debug utilities
    static logPerformance(name, func) {
        return function(...args) {
            const start = performance.now();
            const result = func.apply(this, args);
            const end = performance.now();
            console.log(`${name} took ${(end - start).toFixed(2)}ms`);
            return result;
        };
    }
    
    static drawDebugSphere(scene, position, radius = 1, color = 0xff0000) {
        const geometry = new THREE.SphereGeometry(radius, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        scene.add(sphere);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            scene.remove(sphere);
        }, 5000);
        
        return sphere;
    }
    
    static drawDebugLine(scene, start, end, color = 0xff0000) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color: color });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            scene.remove(line);
        }, 5000);
        
        return line;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
