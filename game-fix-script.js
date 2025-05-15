/**
 * Script Fix: This file provides solutions for the freezing issues in the Runes of Power game.
 * It addresses initialization order problems, function availability, and combat lock issues.
 */

// Immediately check for initialization state
const gameInitializationState = {
  isGameLoaded: false,
  isScriptRunning: false,
  isErrorHandlerReady: false,
  isInitializing: false,
  initializationAttempts: 0,
  MAX_INIT_ATTEMPTS: 3
};

/**
 * Safely ensure a function exists before trying to call it
 * @param {string} funcName - The name of the function to check
 * @param {Array} args - Arguments to pass to the function if it exists
 * @returns {any} - The result of the function call or undefined
 */
function safelyCallFunction(funcName, args = []) {
  try {
    if (typeof window[funcName] === 'function') {
      return window[funcName](...args);
    } else {
      console.warn(`Function ${funcName} is not available yet.`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error calling ${funcName}:`, error);
    if (typeof window.showError === 'function') {
      window.showError(`Error in ${funcName}`, error);
    }
    return undefined;
  }
}

/**
 * Emergency combat unlock - prevents the game from getting stuck in combat
 */
function emergencyCombatUnlock() {
  try {
    console.log("Emergency Combat Unlock: Checking for locked combat state...");
    
    // Only run if we're in a combat lock state
    if (window.combatLock === true) {
      console.log("Emergency Combat Unlock: Combat lock detected!");
      
      // Check how long the lock has been active
      if (!window.lastCombatLockTime) {
        window.lastCombatLockTime = Date.now();
        console.log("Emergency Combat Unlock: Setting initial lock time.");
        return; // First detection, just set the time
      }
      
      const lockDuration = Date.now() - window.lastCombatLockTime;
      
      // If locked for more than 5 seconds, consider it stuck
      if (lockDuration > 5000) {
        console.log(`Emergency Combat Unlock: Combat appears stuck for ${lockDuration}ms. Unlocking.`);
        
        // Force unlock combat
        window.combatLock = false;
        window.isPlayerTurn = true;
        
        // Try to update UI
        if (typeof updateSkillButtonsAvailability === 'function') {
          updateSkillButtonsAvailability();
        }
        
        // Add a message to the log if possible
        if (typeof addLogMessage === 'function') {
          addLogMessage("Combat seems stuck. Emergency unlock activated!", "warning");
        } else {
          // Fallback message direct to game log
          const gameLog = document.getElementById('game-log');
          if (gameLog) {
            const logMessage = document.createElement('div');
            logMessage.className = 'log-message warning';
            logMessage.textContent = "Combat seems stuck. Emergency unlock activated!";
            gameLog.appendChild(logMessage);
            gameLog.scrollTop = gameLog.scrollHeight;
          }
        }
        
        // Clear the lock time
        window.lastCombatLockTime = null;
        
        // Try to restore the game state if possible
        if (!window.currentMonster && typeof enterTown === 'function' && GAME_AREAS && GAME_AREAS.town) {
          console.log("Emergency Combat Unlock: Attempting to return to town");
          enterTown(GAME_AREAS.town);
        }
      } else {
        console.log(`Emergency Combat Unlock: Combat locked for ${lockDuration}ms, still waiting...`);
      }
    } else {
      // Combat is not locked, clear the timer
      window.lastCombatLockTime = null;
    }
  } catch (error) {
    console.error("Error in emergencyCombatUnlock:", error);
    // Force unlock in case of error
    window.combatLock = false;
    window.isPlayerTurn = true;
  }
}

/**
 * Ensures all required game constants exist and are properly initialized
 */
function ensureGameConstantsExist() {
  // Check and repair game constants
  if (!window.ELEMENTAL_TYPES || Object.keys(window.ELEMENTAL_TYPES).length === 0) {
    console.warn("Game Fix: ELEMENTAL_TYPES missing or empty, creating fallback.");
    window.ELEMENTAL_TYPES = {
      Fire: { color: '#FF6347', textColor: '#FFFFFF', icon: '🔥', strong: ['Nature'], weak: ['Water'], neutral: ['Fire', 'Light', 'Dark'] },
      Water: { color: '#4682B4', textColor: '#FFFFFF', icon: '💧', strong: ['Fire'], weak: ['Nature'], neutral: ['Water', 'Light', 'Dark'] },
      Nature: { color: '#3CB371', textColor: '#FFFFFF', icon: '🌿', strong: ['Water'], weak: ['Fire'], neutral: ['Nature', 'Light', 'Dark'] },
      Light: { color: '#FFFACD', textColor: '#000000', icon: '✨', strong: ['Dark'], weak: [], neutral: ['Fire', 'Water', 'Nature'] },
      Dark: { color: '#4B0082', textColor: '#FFFFFF', icon: '🌑', strong: [], weak: ['Light'], neutral: ['Fire', 'Water', 'Nature'] },
      Normal: { color: '#A9A9A9', textColor: '#FFFFFF', icon: '⚪', strong: [], weak: [], neutral: ['Normal', 'Fire', 'Water', 'Nature', 'Light', 'Dark'] }
    };
  }
  
  if (!window.GAME_AREAS || Object.keys(window.GAME_AREAS).length === 0) {
    console.warn("Game Fix: GAME_AREAS missing or empty, creating fallback.");
    window.GAME_AREAS = {
      town: { name: "Runehaven", description: "A small town where adventurers gather.", backgroundImage: "", shops: ["generalStore"], monsters: [], isSafe: true },
      forest: { name: "Whispering Woods", description: "An ancient forest.", backgroundImage: "", shops: [], monsters: ["Forest Wisp"], isSafe: false, recommendedLevel: 1, dominantElement: "Nature" }
    };
  }
  
  if (!window.monsterTemplates || window.monsterTemplates.length === 0) {
    console.warn("Game Fix: monsterTemplates not found or empty, creating fallback.");
    window.monsterTemplates = [
      { name: "Default Monster", type: "Normal", baseMaxHp: 30, baseAttack: 5, baseDefense: 2, expReward: 10, goldReward: 5, spriteKey: "DefaultMonster", skills: [{ name: "Attack", damageMultiplier: 1.0, type: "Normal", chance: 1.0 }] },
      { name: "Forest Wisp", type: "Nature", baseMaxHp: 50, baseAttack: 9, baseDefense: 2, expReward: 18, goldReward: 9, spriteKey: "ForestWisp", skills: [{ name: "Tackle", damageMultiplier: 1.0, type: "Normal", chance: 0.5 }, { name: "Leaf Cutter", damageMultiplier: 1.2, type: "Nature", chance: 0.5 }] }
    ];
  }
  
  if (!window.bossMonsterTemplates || window.bossMonsterTemplates.length === 0) {
    console.warn("Game Fix: bossMonsterTemplates not found or empty, creating fallback.");
    window.bossMonsterTemplates = [
      { name: "Boss Monster", type: "Normal", baseMaxHp: 200, baseAttack: 15, baseDefense: 5, expReward: 100, goldReward: 50, spriteKey: "DefaultMonster", skills: [{ name: "Powerful Attack", damageMultiplier: 1.5, type: "Normal", chance: 1.0 }], isBoss: true }
    ];
  }
  
  if (!window.heroAvatars) {
    console.warn("Game Fix: heroAvatars not found, creating fallback.");
    window.heroAvatars = {
      Default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%238A2BE2'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E✧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EHERO%3C/text%3E%3C/svg%3E",
      Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FF6347'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3EFIRE%3C/text%3E%3C/svg%3E",
      Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234682B4'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EWATER%3C/text%3E%3C/svg%3E"
    };
  }
  
  if (!window.monsterSprites) {
    console.warn("Game Fix: monsterSprites not found, creating fallback.");
    window.monsterSprites = {
      DefaultMonster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23708090'/%3E%3Ctext x='120' y='120' font-family='Arial' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle'%3E😈%3C/text%3E%3C/svg%3E",
      ForestWisp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%2390EE90'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EWISP%3C/text%3E%3C/svg%3E",
      Victory: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%2377DD77'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='80' fill='black' text-anchor='middle' dominant-baseline='middle'%3E😎%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EWIN!%3C/text%3E%3C/svg%3E",
      GameOver: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23808080'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle'%3E😵%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EGAME OVER%3C/text%3E%3C/svg%3E"
    };
  }
  
  if (!window.runeIcons) {
    console.warn("Game Fix: runeIcons not found, creating fallback.");
    window.runeIcons = { 
      Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23FF6347'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3C/svg%3E",
      Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234682B4'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3C/svg%3E"
    };
  }
  
  console.log("Game constants check completed");
}

/**
 * Ensures critical game functions exist with fallbacks
 */
function ensureCriticalFunctionsExist() {
  // Ensure showError exists
  if (typeof window.showError !== 'function') {
    window.showError = function(message, error = null) {
      console.error("Fallback showError:", message, error);
      try {
        const errorLogDisplay = document.getElementById('error-log-display');
        const errorMessageSpan = document.getElementById('error-message-span');
        if (errorLogDisplay && errorMessageSpan) {
          errorMessageSpan.textContent = message;
          errorLogDisplay.style.display = 'block';
        } else {
          alert("Error: " + message);
        }
      } catch (e) {
        alert("Error: " + message);
      }
    };
  }
  
  // Ensure addLogMessage exists
  if (typeof window.addLogMessage !== 'function') {
    window.addLogMessage = function(message, type = "info") {
      console.log(`Game Log (${type}): ${message}`);
      try {
        const gameLog = document.getElementById('game-log');
        if (gameLog) {
          const logLine = document.createElement('div');
          logLine.className = `log-message ${type}`;
          logLine.textContent = message;
          gameLog.appendChild(logLine);
          gameLog.scrollTop = gameLog.scrollHeight;
        }
      } catch (e) {
        console.error("Error in fallback addLogMessage:", e);
      }
    };
  }
  
  // Ensure hideAllScreens exists
  if (typeof window.hideAllScreens !== 'function') {
    window.hideAllScreens = function() {
      try {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
          if (s && s.style) {
            s.classList.remove('active');
            s.setAttribute('aria-hidden', 'true');
            s.style.display = 'none';
          }
        });
      } catch (e) {
        console.error("Error in fallback hideAllScreens:", e);
      }
    };
  }
  
  // Ensure activateScreen exists
  if (typeof window.activateScreen !== 'function') {
    window.activateScreen = function(screenId) {
      try {
        if (typeof hideAllScreens === 'function') {
          hideAllScreens();
        }
        
        const screenEl = document.getElementById(screenId);
        if (!screenEl) {
          console.error(`Screen ${screenId} not found.`);
          return false;
        }
        
        screenEl.style.display = 'flex';
        screenEl.classList.add('active');
        screenEl.setAttribute('aria-hidden', 'false');
        
        return true;
      } catch (e) {
        console.error(`Error in fallback activateScreen(${screenId}):`, e);
        return false;
      }
    };
  }
  
  // Ensure initializeGame is properly wrapped with error handling
  if (typeof window.initializeGame === 'function') {
    const originalInitializeGame = window.initializeGame;
    window.initializeGame = function(chosenRune) {
      try {
        console.log(`Game Fix: Safely initializing game with rune: ${chosenRune}`);
        return originalInitializeGame(chosenRune);
      } catch (error) {
        console.error("Game Fix: Error in initializeGame:", error);
        if (typeof window.showError === 'function') {
          window.showError("Error starting game: " + error.message, error);
        }
        
        // Re-enable rune buttons
        document.querySelectorAll('.rune-button').forEach(btn => {
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = "1";
          }
        });
        
        // Try to go back to rune selection
        const runeSelectionScreen = document.getElementById('rune-selection-screen');
        if (runeSelectionScreen) {
          if (typeof window.activateScreen === 'function') {
            window.activateScreen('rune-selection-screen');
          } else {
            runeSelectionScreen.style.display = 'flex';
            runeSelectionScreen.classList.add('active');
          }
        }
      }
    };
  }
  
  // Ensure useSkill is properly wrapped with error handling and combat lock safety
  if (typeof window.useSkill === 'function') {
    const originalUseSkill = window.useSkill;
    window.useSkill = function(skillId) {
      try {
        // Set a timestamp when combat lock is engaged
        window.lastCombatLockTime = Date.now();
        
        // Timeout to prevent infinite lock
        const unlockTimeout = setTimeout(() => {
          if (window.combatLock) {
            console.warn("Game Fix: Combat lock timeout triggered, forcing unlock");
            window.combatLock = false;
            window.isPlayerTurn = true;
            if (typeof updateSkillButtonsAvailability === 'function') {
              updateSkillButtonsAvailability();
            }
          }
        }, 8000); // 8 second timeout
        
        // Call the original function
        const result = originalUseSkill(skillId);
        
        // Clear the timeout if the function returns normally
        clearTimeout(unlockTimeout);
        
        return result;
      } catch (error) {
        console.error(`Game Fix: Error in useSkill(${skillId}):`, error);
        if (typeof window.showError === 'function') {
          window.showError("Error using skill: " + error.message, error);
        }
        
        // Ensure combat doesn't stay locked after an error
        window.combatLock = false;
        window.isPlayerTurn = true;
        if (typeof updateSkillButtonsAvailability === 'function') {
          updateSkillButtonsAvailability();
        }
      }
    };
  }
  
  // Ensure spawnNewMonster is properly wrapped with error handling
  if (typeof window.spawnNewMonster === 'function') {
    const originalSpawnNewMonster = window.spawnNewMonster;
    window.spawnNewMonster = function() {
      try {
        return originalSpawnNewMonster();
      } catch (error) {
        console.error("Game Fix: Error in spawnNewMonster:", error);
        if (typeof window.showError === 'function') {
          window.showError("Error spawning monster: " + error.message, error);
        }
        
        // Create a basic default monster as fallback
        window.currentMonster = {
          name: "Backup Monster",
          type: "Normal",
          level: (window.playerData ? window.playerData.level : 1),
          maxHp: 30,
          hp: 30,
          attackPower: 5,
          defense: 2,
          expReward: 10,
          goldReward: 5,
          spriteKey: "DefaultMonster",
          skills: [{ name: "Attack", damageMultiplier: 1.0, type: "Normal", chance: 1.0 }],
          statusEffects: []
        };
        
        // Update UI
        if (typeof updateMonsterStatsUI === 'function') {
          updateMonsterStatsUI();
        }
        
        // Add log message
        if (typeof addLogMessage === 'function') {
          addLogMessage("A monster appears despite errors!", "warning");
        }
      }
    };
  }
  
  console.log("Core function check/creation completed");
}

/**
 * Set up periodic safety checks
 */
function setupSafetyChecks() {
  // Set up emergency combat unlock timer
  setInterval(emergencyCombatUnlock, 2000);
  
  // Set up error handler to make sure it's always available
  window.onerror = function(message, source, lineno, colno, error) {
    console.error(`Error: ${message} @ ${source}:${lineno}:${colno}`);
    
    if (typeof window.showError === 'function') {
      window.showError(`Error: ${message}`, error);
    } else {
      alert(`Error: ${message}`);
    }
    
    return true; // Prevent default error handling
  };
  
  window.onunhandledrejection = function(event) {
    console.error("Unhandled Promise Rejection:", event.reason);
    
    if (typeof window.showError === 'function') {
      window.showError("Unhandled Promise Rejection", event.reason);
    }
  };
  
  console.log("Error handling setup completed");
}

/**
 * Main initialization function for the game fix
 */
function initializeGameFix() {
  // Prevent multiple initializations
  if (gameInitializationState.isInitializing) {
    console.log("Game Fix: Already initializing, skipping duplicate call");
    return;
  }
  
  gameInitializationState.isInitializing = true;
  gameInitializationState.initializationAttempts++;
  
  console.log(`Game Fix: Initializing (attempt ${gameInitializationState.initializationAttempts} of ${gameInitializationState.MAX_INIT_ATTEMPTS})`);
  
  try {
    // Fix game constants
    ensureGameConstantsExist();
    
    // Fix critical functions
    ensureCriticalFunctionsExist();
    
    // Set up safety checks
    setupSafetyChecks();
    
    // Mark initialization as complete
    gameInitializationState.isGameLoaded = true;
    gameInitializationState.isErrorHandlerReady = true;
    gameInitializationState.isInitializing = false;
    
    console.log("Game Fix: Initialization complete");
    
    // Add message to log if possible
    if (typeof addLogMessage === 'function') {
      addLogMessage("Game stabilization active", "info");
    }
    
  } catch (error) {
    console.error("Game Fix: Error during initialization:", error);
    gameInitializationState.isInitializing = false;
    
    // Try again if we haven't exceeded max attempts
    if (gameInitializationState.initializationAttempts < gameInitializationState.MAX_INIT_ATTEMPTS) {
      console.log("Game Fix: Retrying initialization in 1 second");
      setTimeout(initializeGameFix, 1000);
    } else {
      console.error("Game Fix: Maximum initialization attempts reached");
      alert("Game initialization failed after multiple attempts. Please refresh the page.");
    }
  }
}

// Call fix initialization once the DOM is loaded
function runWhenDocumentReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initializeGameFix, 100);
    });
  } else {
    setTimeout(initializeGameFix, 100);
  }
}

// Run the fix immediately
runWhenDocumentReady();

// Make sure the fix is applied even if other scripts fail
setTimeout(function() {
  if (!gameInitializationState.isGameLoaded) {
    console.warn("Game Fix: Delayed initialization triggered (backup)");
    initializeGameFix();
  }
}, 2000);