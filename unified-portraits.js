/**
 * Unified Portrait System
 * Provides enhanced portrait display for player and monster characters
 */

// Main configuration for portrait system
const PortraitSystem = {
    // Settings
    settings: {
        iconOnlyMode: false,
        initialized: false
    },
    
    // Initialize the portrait system
    initialize: function() {
        if (this.settings.initialized) return;
        
        console.log("Initializing portrait system...");
        
        // Load saved settings
        this.loadSettings();
        
        // Add toggle button
        this.addPortraitModeToggle();
        
        // Apply initial portrait enhancements
        this.enhancePlayerPortrait();
        this.enhanceMonsterPortrait();
        
        // Apply icon-only mode if previously enabled
        this.applyIconOnlyMode(this.settings.iconOnlyMode);
        
        // Override UI update functions to maintain enhancements
        this.overrideUIFunctions();
        
        // Set up observers for dynamic content changes
        this.setupMutationObservers();
        
        // Mark as initialized
        this.settings.initialized = true;
        console.log("Portrait system initialized!");
    },
    
    // Load saved settings from localStorage
    loadSettings: function() {
        // Load icon-only mode setting
        const savedIconMode = localStorage.getItem('iconOnlyMode');
        this.settings.iconOnlyMode = savedIconMode === 'true';
    },
    
    // Save current settings to localStorage
    saveSettings: function() {
        localStorage.setItem('iconOnlyMode', this.settings.iconOnlyMode);
    },
    
    // Add portrait mode toggle button
    addPortraitModeToggle: function() {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;
        
        // Remove existing button if present
        const existingButton = document.getElementById('portrait-mode-toggle');
        if (existingButton) existingButton.remove();
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'portrait-mode-toggle';
        toggleButton.className = 'action-button portrait-toggle-btn';
        toggleButton.textContent = this.settings.iconOnlyMode ? 'Show Names' : 'Hide Names';
        
        // Add click handler
        toggleButton.addEventListener('click', () => {
            this.settings.iconOnlyMode = !this.settings.iconOnlyMode;
            this.applyIconOnlyMode(this.settings.iconOnlyMode);
            toggleButton.textContent = this.settings.iconOnlyMode ? 'Show Names' : 'Hide Names';
            this.saveSettings();
        });
        
        // Add to game screen
        gameScreen.appendChild(toggleButton);
    },
    
    // Override default UI update functions to maintain portrait enhancements
    overrideUIFunctions: function() {
        if (typeof updatePlayerStatsUI === 'function') {
            const originalUpdatePlayerStatsUI = updatePlayerStatsUI;
            window.updatePlayerStatsUI = () => {
                originalUpdatePlayerStatsUI();
                this.enhancePlayerPortrait();
                this.applyIconOnlyMode(this.settings.iconOnlyMode);
            };
        }
        
        if (typeof updateMonsterStatsUI === 'function') {
            const originalUpdateMonsterStatsUI = updateMonsterStatsUI;
            window.updateMonsterStatsUI = () => {
                originalUpdateMonsterStatsUI();
                this.enhanceMonsterPortrait();
                this.applyIconOnlyMode(this.settings.iconOnlyMode);
            };
        }
    },
    
    // Enhance player portrait with improved layout
    enhancePlayerPortrait: function() {
        const playerCharacterArea = document.getElementById('player-character-area');
        const playerAvatar = document.getElementById('player-avatar');
        const playerPanelTitle = document.getElementById('player-panel-title');
        
        if (!playerCharacterArea || !playerAvatar) return;
        
        // Remove old portrait container if it exists
        const oldContainer = playerCharacterArea.querySelector('.portrait-container');
        if (oldContainer) oldContainer.remove();
        
        // Create new portrait container
        const portraitContainer = document.createElement('div');
        portraitContainer.className = 'portrait-container';
        portraitContainer.id = 'player-avatar-container';
        
        // Create character icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'character-icon';
        
        // Move avatar inside icon container
        const avatarClone = playerAvatar.cloneNode(true);
        iconContainer.appendChild(avatarClone);
        
        // Add element indicator if playerData exists
        if (window.playerData && playerData.rune) {
            const elementType = playerData.rune;
            const elementIndicator = document.createElement('div');
            elementIndicator.className = `element-indicator element-${elementType.toLowerCase()}`;
            
            // Get icon for the element type
            const elementIcon = window.ELEMENTAL_TYPES && ELEMENTAL_TYPES[elementType] ? 
                               ELEMENTAL_TYPES[elementType].icon || '⚪' : '⚪';
            
            elementIndicator.innerHTML = `${elementIcon} ${elementType}`;
            iconContainer.appendChild(elementIndicator);
        }
        
        // Add icon container to portrait container
        portraitContainer.appendChild(iconContainer);
        
        // Add character name
        const nameElement = playerPanelTitle ? playerPanelTitle.cloneNode(true) : document.createElement('h3');
        nameElement.className = 'character-name';
        nameElement.textContent = playerPanelTitle ? playerPanelTitle.textContent : 'YOU';
        portraitContainer.appendChild(nameElement);
        
        // Insert the portrait container as the first child of character area
        if (playerCharacterArea.firstChild) {
            playerCharacterArea.insertBefore(portraitContainer, playerCharacterArea.firstChild);
        } else {
            playerCharacterArea.appendChild(portraitContainer);
        }
        
        // Hide the original elements
        if (playerAvatar.parentNode) playerAvatar.style.display = 'none';
        if (playerPanelTitle && playerPanelTitle.parentNode) playerPanelTitle.style.display = 'none';
    },
    
    // Enhance monster portrait with improved layout
    enhanceMonsterPortrait: function() {
        const monsterEncounterArea = document.getElementById('monster-encounter-area');
        const monsterSprite = document.getElementById('monster-sprite');
        const monsterNameDisplay = document.getElementById('monster-name');
        
        if (!monsterEncounterArea || !monsterSprite) return;
        
        // Remove old portrait container if it exists
        const oldContainer = monsterEncounterArea.querySelector('.portrait-container');
        if (oldContainer) oldContainer.remove();
        
        // Create new portrait container
        const portraitContainer = document.createElement('div');
        portraitContainer.className = 'portrait-container';
        portraitContainer.id = 'monster-sprite-container';
        
        // Create character icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'character-icon';
        
        // Move sprite inside icon container
        const spriteClone = monsterSprite.cloneNode(true);
        iconContainer.appendChild(spriteClone);
        
        // Add element indicator if currentMonster exists
        if (window.currentMonster && currentMonster.type) {
            const elementType = currentMonster.type;
            const elementIndicator = document.createElement('div');
            elementIndicator.className = `element-indicator element-${elementType.toLowerCase()}`;
            
            // Get icon for the element type
            const elementIcon = window.ELEMENTAL_TYPES && ELEMENTAL_TYPES[elementType] ? 
                               ELEMENTAL_TYPES[elementType].icon || '⚪' : '⚪';
            
            elementIndicator.innerHTML = `${elementIcon} ${elementType}`;
            iconContainer.appendChild(elementIndicator);
        }
        
        // Add icon container to portrait container
        portraitContainer.appendChild(iconContainer);
        
        // Add monster name
        const nameElement = document.createElement('h3');
        nameElement.className = 'character-name';
        nameElement.textContent = monsterNameDisplay ? monsterNameDisplay.textContent : 'MONSTER';
        portraitContainer.appendChild(nameElement);
        
        // Insert the portrait container as the first child of monster area
        if (monsterEncounterArea.firstChild) {
            monsterEncounterArea.insertBefore(portraitContainer, monsterEncounterArea.firstChild);
        } else {
            monsterEncounterArea.appendChild(portraitContainer);
        }
        
        // Hide the original elements
        if (monsterSprite.parentNode) monsterSprite.style.display = 'none';
    },
    
    // Apply or remove icon-only mode
    applyIconOnlyMode: function(enabled) {
        // Update all portrait containers
        const portraitContainers = document.querySelectorAll('.portrait-container');
        portraitContainers.forEach(container => {
            if (enabled) {
                container.classList.add('icon-only-mode');
            } else {
                container.classList.remove('icon-only-mode');
            }
        });
        
        // For SVG sprites, update their content to hide text
        if (enabled) {
            this.removeTextFromSprites();
        }
    },
    
    // Remove text from SVG sprites when in icon-only mode
    removeTextFromSprites: function() {
        const spriteImages = document.querySelectorAll('.sprite-image');
        
        spriteImages.forEach(img => {
            if (img.src.includes('svg') && img.src.includes('text=')) {
                // Create a new URL with text parameter set to empty
                const newSrc = img.src.replace(/text=[^&]+/, 'text=');
                if (newSrc !== img.src) {
                    img.src = newSrc;
                }
            }
        });
    },
    
    // Set up mutation observers to maintain portrait enhancements
    setupMutationObservers: function() {
        // Observer for the main game screen
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;
        
        const observer = new MutationObserver(mutations => {
            let needsPlayerPortraitUpdate = false;
            let needsMonsterPortraitUpdate = false;
            
            mutations.forEach(mutation => {
                // If player or monster elements were changed
                if (mutation.target.id === 'player-character-area' || 
                    mutation.target.id === 'player-avatar' ||
                    mutation.target.id === 'player-panel-title') {
                    needsPlayerPortraitUpdate = true;
                }
                
                if (mutation.target.id === 'monster-encounter-area' || 
                    mutation.target.id === 'monster-sprite' ||
                    mutation.target.id === 'monster-name') {
                    needsMonsterPortraitUpdate = true;
                }
                
                // Check for sprite image changes
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'src' && 
                    mutation.target.classList.contains('sprite-image')) {
                    
                    if (this.settings.iconOnlyMode && 
                        mutation.target.src.includes('svg') && 
                        mutation.target.src.includes('text=')) {
                        
                        // Update the sprite to remove text
                        const newSrc = mutation.target.src.replace(/text=[^&]+/, 'text=');
                        if (newSrc !== mutation.target.src) {
                            mutation.target.src = newSrc;
                        }
                    }
                }
            });
            
            // Apply updates if needed
            if (needsPlayerPortraitUpdate) {
                this.enhancePlayerPortrait();
            }
            
            if (needsMonsterPortraitUpdate) {
                this.enhanceMonsterPortrait();
            }
            
            // Reapply icon-only mode
            if (needsPlayerPortraitUpdate || needsMonsterPortraitUpdate) {
                this.applyIconOnlyMode(this.settings.iconOnlyMode);
            }
        });
        
        // Observe the game screen for changes
        observer.observe(gameScreen, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'class', 'style']
        });
    }
};

// Initialize the portrait system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize when original UI setup completes
    const originalInitialUISetup = window.initialUISetup || function() {};
    window.initialUISetup = function() {
        originalInitialUISetup.apply(this, arguments);
        
        // Initialize portrait system
        setTimeout(() => PortraitSystem.initialize(), 100);
    };
});