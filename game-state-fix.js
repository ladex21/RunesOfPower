/**
 * Game State Initialization Fix
 * This script ensures proper game initialization and fixes common state issues
 */

// Flag to prevent multiple full initializations by this script
let gameStateFixFullyInitialized = false;

// Main initialization function for this component
function initializeGameStateFix() {
    try {
        if (gameStateFixFullyInitialized) {
            console.log("Game-state-fix: Already fully initialized. Skipping.");
            return;
        }
        console.log("Game-state-fix: Initializing game state...");

        function ensurePlayerDataExists() {
            if (!window.playerData) {
                console.warn("Game-state-fix: window.playerData not found. Creating emergency default playerData. This indicates script.js might not have run correctly.");
                window.playerData = {
                    // Leave rune undefined as it should be set by player choice
                    level: 1,
                    hp: 100,
                    maxHp: 100,
                    mana: 50,
                    maxMana: 50,
                    exp: 0,
                    nextLevelExp: 50,
                    gold: 30,
                    skills: [],
                    avatar: "",
                    attackPower: 7,
                    defense: 3,
                    statusEffects: [],
                    inventory: [],
                    unlockedRunes: [],
                    equipment: { weapon: null, shield: null, armor: null, accessory: null },
                    hasRevivalStone: false,
                    elementalBoostPercent: 0
                };
                console.log("Game-state-fix: Created emergency playerData structure");
            } else {
                console.log(`Game-state-fix: window.playerData already exists. Current rune: ${window.playerData.rune || 'not set'}`);
                // Ensure essential sub-objects exist if playerData was minimal
                if (typeof window.playerData.equipment !== 'object' || window.playerData.equipment === null) {
                    window.playerData.equipment = { weapon: null, shield: null, armor: null, accessory: null };
                }
                if (!Array.isArray(window.playerData.skills)) {
                    window.playerData.skills = [];
                }
                if (!Array.isArray(window.playerData.inventory)) {
                    window.playerData.inventory = [];
                }
                if (!Array.isArray(window.playerData.statusEffects)) {
                    window.playerData.statusEffects = [];
                }
                if (!Array.isArray(window.playerData.unlockedRunes)) {
                    window.playerData.unlockedRunes = [];
                }
                console.log("Game-state-fix: Ensured all required playerData sub-properties exist");
            }
        }

        function ensureGameConstantsExist() {
            // Define fallback elemental types if missing
            if (!window.ELEMENTAL_TYPES) {
                console.warn("Game-state-fix: ELEMENTAL_TYPES not found. Creating default.");
                window.ELEMENTAL_TYPES = {
                    Fire: {
                        color: '#FF6347',
                        textColor: '#FFFFFF',
                        icon: '🔥',
                        strong: ['Nature', 'Ice', 'Metal'],
                        weak: ['Water', 'Earth', 'Rock'],
                        neutral: ['Fire', 'Light', 'Dark', 'Lightning', 'Karma']
                    },
                    Water: {
                        color: '#4682B4',
                        textColor: '#FFFFFF',
                        icon: '💧',
                        strong: ['Fire', 'Earth', 'Rock'],
                        weak: ['Nature', 'Ice', 'Lightning'],
                        neutral: ['Water', 'Light', 'Dark', 'Poison', 'Karma']
                    },
                    Nature: {
                        color: '#3CB371',
                        textColor: '#FFFFFF',
                        icon: '🌿',
                        strong: ['Water', 'Earth', 'Rock'],
                        weak: ['Fire', 'Ice', 'Poison', 'Flying'],
                        neutral: ['Nature', 'Light', 'Dark', 'Karma']
                    },
                    Light: {
                        color: '#FFFACD',
                        textColor: '#000000',
                        icon: '✨',
                        strong: ['Dark', 'Chaos', 'Undead'],
                        weak: ['Void', 'Metal'],
                        neutral: ['Fire', 'Water', 'Nature', 'Earth', 'Ice', 'Lightning']
                    },
                    Dark: {
                        color: '#4B0082',
                        textColor: '#FFFFFF',
                        icon: '🌑',
                        strong: ['Light', 'Psychic', 'Spirit'],
                        weak: ['Light', 'Holy', 'Pure'],
                        neutral: ['Fire', 'Water', 'Nature', 'Earth', 'Ice', 'Lightning']
                    },
                    Normal: {
                        color: '#A9A9A9',
                        textColor: '#FFFFFF',
                        icon: '⚪',
                        strong: [],
                        weak: ['Rock', 'Metal'],
                        neutral: ['Normal', 'Fire', 'Water', 'Nature', 'Light', 'Dark', 'Earth', 'Ice', 'Lightning']
                    }
                };
            }

            // Define fallback game areas if missing
            if (!window.GAME_AREAS) {
                console.warn("Game-state-fix: GAME_AREAS not found. Creating default.");
                window.GAME_AREAS = {
                    town: {
                        name: "Runehaven",
                        description: "A small town where adventurers gather to rest and trade",
                        backgroundImage: "https://placehold.co/800x200/7B9E89/FFFFFF?text=Runehaven&font=pressstart2p",
                        shops: ["generalStore"],
                        monsters: [],
                        isSafe: true
                    },
                    forest: {
                        name: "Whispering Woods",
                        description: "An ancient forest filled with Nature elemental creatures",
                        backgroundImage: "https://placehold.co/800x200/2E8B57/FFFFFF?text=Whispering+Woods&font=pressstart2p",
                        shops: [],
                        monsters: ["Forest Wisp", "Vine Crawler", "Ancient Treant"],
                        isSafe: false,
                        recommendedLevel: 1,
                        dominantElement: "Nature"
                    }
                };
            }

            // Define fallback monsters if missing
            if (!window.monsterTemplates || window.monsterTemplates.length === 0) {
                console.warn("Game-state-fix: monsterTemplates not found or empty. Creating default.");
                window.monsterTemplates = [
                    { name: "Tiny Flame Imp", type: "Fire", baseMaxHp: 35, baseAttack: 7, baseDefense: 1, expReward: 12, goldReward: 7, spriteKey: "TinyFlameImp", skills: [{ name: "Scratch", damageMultiplier: 1.0, type: "Normal", chance: 0.7 }, { name: "Small Ember", damageMultiplier: 1.1, type: "Fire", chance: 0.3 }] },
                    { name: "Forest Wisp", type: "Nature", baseMaxHp: 50, baseAttack: 9, baseDefense: 2, expReward: 18, goldReward: 9, spriteKey: "ForestWisp", skills: [{ name: "Tackle", damageMultiplier: 1.0, type: "Normal", chance: 0.5 }, { name: "Leaf Cutter", damageMultiplier: 1.2, type: "Nature", chance: 0.5 }] }
                ];
            }

            // Define fallback avatar sprites if missing
            if (!window.heroAvatars) {
                console.warn("Game-state-fix: heroAvatars not found. Creating default.");
                window.heroAvatars = {
                    Default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%238A2BE2'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E✧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EHERO%3C/text%3E%3C/svg%3E",
                    Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FF6347'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3EFIRE%3C/text%3E%3C/svg%3E",
                    Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234682B4'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EWATER%3C/text%3E%3C/svg%3E",
                    Nature: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233CB371'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3ENATURE%3C/text%3E%3C/svg%3E",
                    Light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FFFACD'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3ELIGHT%3C/text%3E%3C/svg%3E",
                    Dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234B0082'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌑%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EDARK%3C/text%3E%3C/svg%3E"
                };
            }

            // Define fallback monster sprites if missing
            if (!window.monsterSprites) {
                console.warn("Game-state-fix: monsterSprites not found. Creating default.");
                window.monsterSprites = {
                    TinyFlameImp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23FF7F50'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EIMP%3C/text%3E%3C/svg%3E",
                    ForestWisp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%2390EE90'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EWISP%3C/text%3E%3C/svg%3E",
                    DefaultMonster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23708090'/%3E%3Ctext x='120' y='120' font-family='Arial' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle'%3E😈%3C/text%3E%3C/svg%3E"
                };
            }

            console.log("Game-state-fix: Game constants check completed");
        }

        function createCoreFunctions() {
            // Create fallback for addLogMessage if it doesn't exist
            if (typeof window.addLogMessage !== 'function') {
                console.warn("Game-state-fix: addLogMessage function not found. Creating fallback.");
                window.addLogMessage = function(message, type = "info") {
                    console.log(`[${type}] ${message}`);
                    // Try to add message to the game log UI if it exists
                    const gameLog = document.getElementById('game-log');
                    if (gameLog) {
                        const entry = document.createElement('div');
                        entry.className = `log-entry ${type}`;
                        entry.textContent = message;
                        gameLog.appendChild(entry);
                        // Auto-scroll
                        gameLog.scrollTop = gameLog.scrollHeight;
                    }
                };
            }

            // Create fallback for updatePlayerStatsUI if it doesn't exist
            if (typeof window.updatePlayerStatsUI !== 'function') {
                console.warn("Game-state-fix: updatePlayerStatsUI function not found. Creating fallback.");
                window.updatePlayerStatsUI = function() {
                    // Basic UI update for player stats
                    try {
                        if (!window.playerData) return;
                        
                        // Update player level and gold if those elements exist
                        const playerLevelDisplay = document.getElementById('player-level');
                        if (playerLevelDisplay) playerLevelDisplay.textContent = window.playerData.level || 1;
                        
                        const playerGoldDisplay = document.getElementById('player-gold');
                        if (playerGoldDisplay) playerGoldDisplay.textContent = window.playerData.gold || 0;
                        
                        // Update player HP bar
                        const playerHpText = document.getElementById('player-hp-text');
                        const playerHpFill = document.getElementById('player-hp-fill');
                        if (playerHpText && window.playerData.hp !== undefined && window.playerData.maxHp !== undefined) {
                            playerHpText.textContent = `${window.playerData.hp}/${window.playerData.maxHp}`;
                        }
                        if (playerHpFill && window.playerData.hp !== undefined && window.playerData.maxHp !== undefined) {
                            const hpPercent = Math.max(0, (window.playerData.hp / window.playerData.maxHp) * 100);
                            playerHpFill.style.width = `${hpPercent}%`;
                        }
                        
                        // Update player mana bar
                        const playerManaText = document.getElementById('player-mana-text');
                        const playerManaFill = document.getElementById('player-mana-fill');
                        if (playerManaText && window.playerData.mana !== undefined && window.playerData.maxMana !== undefined) {
                            playerManaText.textContent = `${window.playerData.mana}/${window.playerData.maxMana}`;
                        }
                        if (playerManaFill && window.playerData.mana !== undefined && window.playerData.maxMana !== undefined) {
                            const manaPercent = Math.max(0, (window.playerData.mana / window.playerData.maxMana) * 100);
                            playerManaFill.style.width = `${manaPercent}%`;
                        }
                        
                        // Update player exp bar
                        const playerExpText = document.getElementById('player-exp-text');
                        const playerExpFill = document.getElementById('player-exp-fill');
                        if (playerExpText && window.playerData.exp !== undefined && window.playerData.nextLevelExp !== undefined) {
                            playerExpText.textContent = `${window.playerData.exp}/${window.playerData.nextLevelExp}`;
                        }
                        if (playerExpFill && window.playerData.exp !== undefined && window.playerData.nextLevelExp !== undefined) {
                            const expPercent = Math.max(0, (window.playerData.exp / window.playerData.nextLevelExp) * 100);
                            playerExpFill.style.width = `${expPercent}%`;
                        }
                        
                        // Update player attack and defense
                        const playerAttackDisplay = document.getElementById('player-attack');
                        if (playerAttackDisplay) playerAttackDisplay.textContent = window.playerData.attackPower || 0;
                        
                        const playerDefenseDisplay = document.getElementById('player-defense');
                        if (playerDefenseDisplay) playerDefenseDisplay.textContent = window.playerData.defense || 0;
                        
                        // Update player avatar
                        const playerAvatar = document.getElementById('player-avatar');
                        if (playerAvatar && window.playerData.avatar) {
                            playerAvatar.src = window.playerData.avatar;
                        } else if (playerAvatar && window.heroAvatars && window.playerData.rune && window.heroAvatars[window.playerData.rune]) {
                            playerAvatar.src = window.heroAvatars[window.playerData.rune];
                        }
                        
                        // Update player rune display
                        const playerRuneDisplay = document.getElementById('player-rune-display');
                        if (playerRuneDisplay && window.playerData.rune) {
                            playerRuneDisplay.textContent = window.playerData.rune;
                        }
                    } catch (error) {
                        console.error("Error in fallback updatePlayerStatsUI:", error);
                    }
                };
            }

            // Create fallback for showError if it doesn't exist
            if (typeof window.showError !== 'function') {
                console.warn("Game-state-fix: showError function not found. Creating fallback.");
                window.showError = function(message, error = null) {
                    console.error(message, error);
                    // Try to use the error log UI if it exists
                    const errorLogDisplay = document.getElementById('error-log-display');
                    const errorMessageSpan = document.getElementById('error-message-span');
                    if (errorLogDisplay && errorMessageSpan) {
                        errorMessageSpan.textContent = message;
                        errorLogDisplay.style.display = 'block';
                        // If there's a stack trace element, populate it
                        const errorStack = document.getElementById('error-stack');
                        if (errorStack && error && error.stack) {
                            errorStack.textContent = error.stack;
                        }
                    } else {
                        // Fallback to alert if error UI is not available
                        alert("Error: " + message);
                    }
                };
            }
            
            // Create fallback for enterTown if it doesn't exist
            if (typeof window.enterTown !== 'function') {
                console.warn("Game-state-fix: enterTown function not found. Creating fallback.");
                window.enterTown = function(townData) {
                    if (!townData) {
                        console.error("enterTown called with no town data");
                        return;
                    }
                    
                    // Set currentArea to town
                    window.currentArea = 'town';
                    // Clear currentMonster
                    window.currentMonster = null;
                    
                    // Add log message
                    if (typeof window.addLogMessage === 'function') {
                        window.addLogMessage(`Welcome to ${townData.name}!`, "info");
                    }
                    
                    // Update UI for town
                    if (typeof window.updateMonsterStatsUI === 'function') {
                        window.updateMonsterStatsUI();
                    }
                    
                    if (typeof window.updatePlayerStatsUI === 'function') {
                        window.updatePlayerStatsUI();
                    }
                    
                    // Enable town-related buttons
                    const shopButton = document.getElementById('shop-button');
                    if (shopButton) shopButton.disabled = false;
                    
                    const runeSwapButton = document.getElementById('rune-swap-btn');
                    if (runeSwapButton) runeSwapButton.disabled = false;
                    
                    const inventoryButton = document.getElementById('inventory-button');
                    if (inventoryButton) inventoryButton.disabled = false;
                    
                    const leaveTownButton = document.getElementById('leave-town-button');
                    if (leaveTownButton) leaveTownButton.disabled = false;
                };
            }

            console.log("Game-state-fix: Core function check/creation completed");
        }

        function setupErrorHandling() {
            // Make sure error logging is initialized
            try {
                // First check if error logging is already set up
                if (typeof window.initializeErrorLogger !== 'function') {
                    console.warn("Game-state-fix: initializeErrorLogger function not found. Creating fallback.");
                    
                    window.initializeErrorLogger = function() {
                        const errorLogDisplay = document.getElementById('error-log-display');
                        const errorMessageSpan = document.getElementById('error-message-span');
                        const errorExpandButton = document.getElementById('error-expand-button');
                        const errorDetails = document.getElementById('error-details');
                        const errorStack = document.getElementById('error-stack');
                        
                        if (!errorLogDisplay || !errorMessageSpan) {
                            console.error("Critical error log elements missing from DOM");
                            return;
                        }
                        
                        // Initially hide the error log
                        errorLogDisplay.style.display = 'none';
                        
                        // Set up expand button click handler if it exists
                        if (errorExpandButton && errorDetails) {
                            errorExpandButton.onclick = function() {
                                const isExpanded = errorDetails.style.display === 'block';
                                errorDetails.style.display = isExpanded ? 'none' : 'block';
                                errorExpandButton.textContent = isExpanded ? 'Show Details' : 'Hide Details';
                            };
                        }
                        
                        console.log("Error logger initialized by fallback function");
                    };
                    
                    // Call the function to set up error logging
                    window.initializeErrorLogger();
                }
                
                // Check if global error handlers are set up
                if (typeof window.setupGlobalErrorHandlers !== 'function') {
                    console.warn("Game-state-fix: setupGlobalErrorHandlers function not found. Creating fallback.");
                    
                    window.setupGlobalErrorHandlers = function() {
                        window.onerror = function(message, source, lineno, colno, error) {
                            const formattedMessage = `Unhandled Error: ${message} at ${source ? source.substring(source.lastIndexOf('/') + 1) : 'unknown'}:${lineno}:${colno}`;
                            if (typeof window.showError === 'function') {
                                window.showError(formattedMessage, error);
                            }
                            return true; // Prevent default browser error handling
                        };
                        
                        window.onunhandledrejection = function(event) {
                            const reason = event.reason || "Unknown reason";
                            const formattedMessage = `Unhandled Promise Rejection: ${reason.message || reason}`;
                            if (typeof window.showError === 'function') {
                                window.showError(formattedMessage, reason instanceof Error ? reason : new Error(String(reason)));
                            }
                            return true; // Prevent default browser error handling
                        };
                        
                        console.log("Global error handlers set up by fallback function");
                    };
                    
                    // Call the function to set up global error handlers
                    window.setupGlobalErrorHandlers();
                }
                
                console.log("Game-state-fix: Error handling setup completed");
            } catch (error) {
                console.error("Failed to set up error handling:", error);
            }
        }

        // Actually execute our fixes
        ensurePlayerDataExists();
        ensureGameConstantsExist();
        createCoreFunctions();
        setupErrorHandling();

        // Mark as initialized
        gameStateFixFullyInitialized = true;
        console.log("Game-state-fix: Game state initialization complete");
        
        // Mark this component as initialized in the registry if available
        if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
            window.gameInitRegistry.markInitialized('gameState');
        }
        
        // Clear any safety timeout that might have been set by the coordinator
        if (window.currentInitTimeout) {
            clearTimeout(window.currentInitTimeout);
            window.currentInitTimeout = null;
        }
        
        // Return success
        return true;
    } catch (error) {
        console.error("Critical error in game state initialization:", error);
        // Try to mark as initialized anyway to allow other components to load
        if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
            window.gameInitRegistry.markInitialized('gameState');
        }
        
        // Try to show error if possible
        if (typeof window.showError === 'function') {
            window.showError("Critical error in game state initialization", error);
        } else {
            alert("Critical error in game state initialization. Check console.");
        }
        
        return false;
    }
}

// Listen for the initialization coordinator's event
document.addEventListener('init-component', function(e) {
    if (e.detail && e.detail.component === 'gameState') {
        console.log("Game-state-fix: Received init-component event for gameState");
        initializeGameStateFix();
    }
});

// Fallback initialization if the coordinator event isn't received after a delay
// This is a safety net, but ideally, the coordinator handles it
setTimeout(() => {
    if (!gameStateFixFullyInitialized) {
        console.warn("Game-state-fix: Coordinator event not received, attempting fallback initialization for gameState");
        initializeGameStateFix();
    }
}, 1500); // Adjust delay as needed, should be after coordinator's attempt