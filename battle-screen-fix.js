/**
 * Battle Screen Transition Fix
 * 
 * This script fixes issues with the battle screen transition,
 * specifically when the battle button is clicked and the screen
 * disappears completely.
 */

// Track initialization to prevent duplicate execution
let battleScreenFixInitialized = false;

// Main initialization function
function initializeBattleScreenFix() {
  // Prevent multiple initializations
  if (battleScreenFixInitialized) {
    console.log("Battle screen fix already initialized, skipping");
    return;
  }
  
  // Mark as initialized
  battleScreenFixInitialized = true;
  
  console.log("Installing battle screen transition fix...");

  // Global flags to track transitions
  window.battleTransitionInProgress = false;
  window.battleScreenActive = false;
  
  // Save original screen transition functions if they exist
  if (typeof window.originalShowAreaSelection !== 'function' && 
      typeof window.showAreaSelection === 'function') {
    window.originalShowAreaSelection = window.showAreaSelection;
  }
  
  if (typeof window.originalSpawnNewMonster !== 'function' && 
      typeof window.spawnNewMonster === 'function') {
    window.originalSpawnNewMonster = window.spawnNewMonster;
  }
  
  // ---------- Fix Battle Button ----------
  function fixBattleButton() {
    const battleButton = document.getElementById('leave-town-button');
    if (!battleButton) {
      console.error("Battle button (leave-town-button) not found");
      return;
    }

    // Clone and replace to remove any existing handlers
    const newBattleButton = battleButton.cloneNode(true);
    if (battleButton.parentNode) {
      battleButton.parentNode.replaceChild(newBattleButton, battleButton);
    }

    // Add new safe event handler
    newBattleButton.addEventListener('click', safeStartBattle);
    console.log("Battle button fixed with safe handler");
  }
  
  // Safe battle start function to replace battle button click handler
  function safeStartBattle(event) {
    console.log("Safe battle start function called");
    
    // Prevent any default actions and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Set transition flag so other functions know we're in transition
    window.battleTransitionInProgress = true;
    
    // First ensure game screen is visible
    ensureGameScreenVisible();
    
    // Add message to the game log
    if (typeof window.addLogMessage === 'function') {
      window.addLogMessage("Preparing for battle...", "info");
    }
    
    // Determine which approach to use
    if (typeof window.showAreaSelection === 'function') {
      console.log("Using area selection approach");
      safeShowAreaSelection();
    } else if (typeof window.spawnNewMonster === 'function') {
      console.log("Using direct monster spawn approach");
      safeSpawnMonster();
    } else {
      console.error("No battle function available (showAreaSelection or spawnNewMonster)");
      if (typeof window.addLogMessage === 'function') {
        window.addLogMessage("ERROR: Battle function not available", "error");
      }
      // Reset transition flag
      window.battleTransitionInProgress = false;
    }
  }
  
  // Ensure game screen is visible
  function ensureGameScreenVisible() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) {
      console.error("Game screen not found");
      return false;
    }
    
    // Make sure game screen is visible
    gameScreen.style.display = 'flex';
    gameScreen.classList.add('active');
    gameScreen.setAttribute('aria-hidden', 'false');
    gameScreen.style.opacity = '1';
    gameScreen.style.visibility = 'visible';
    
    return true;
  }
  
  // ---------- Fix Area Selection ----------
  function safeShowAreaSelection() {
    try {
      // Create area selection screen if it doesn't exist
      const areaSelectionScreen = document.getElementById('area-selection-screen');
      if (!areaSelectionScreen) {
        console.error("Area selection screen not found, trying to create one");
        if (typeof window.createAreaSelectionScreen === 'function') {
          window.createAreaSelectionScreen();
        }
      }
      
      // Make sure areas are populated
      const areasContainer = document.getElementById('areas-container');
      if (areasContainer && (!areasContainer.children || areasContainer.children.length === 0)) {
        if (typeof window.populateAreaSelection === 'function') {
          window.populateAreaSelection();
        }
      }
      
      // Actually show the area selection
      if (typeof window.originalShowAreaSelection === 'function') {
        window.originalShowAreaSelection();
      } else if (typeof window.showAreaSelection === 'function') {
        window.showAreaSelection();
      } else {
        // Fallback if no function exists
        showAreaSelectionFallback();
      }
    } catch (error) {
      console.error("Error in safeShowAreaSelection:", error);
      // Reset the battle screen back to town if there's an error
      resetBattleScreen();
    }
  }
  
  // Fallback function if showAreaSelection doesn't exist
  function showAreaSelectionFallback() {
    console.log("Using fallback area selection function");
    
    // Hide other screens without using hideAllScreens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      if (screen.id !== 'area-selection-screen') {
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
        screen.style.display = 'none';
      }
    });
    
    // Show area selection screen
    const areaSelectionScreen = document.getElementById('area-selection-screen');
    if (areaSelectionScreen) {
      areaSelectionScreen.classList.add('active');
      areaSelectionScreen.setAttribute('aria-hidden', 'false');
      areaSelectionScreen.style.display = 'flex';
      areaSelectionScreen.style.opacity = '1';
      areaSelectionScreen.style.visibility = 'visible';
    }
    
    // Set flag
    window.inAreaSelection = true;
    
    // Set timeout to reset transition flag
    setTimeout(() => {
      window.battleTransitionInProgress = false;
    }, 500);
  }
  
  // ---------- Fix Monster Spawning ----------
  function safeSpawnMonster() {
    try {
      console.log("Safe monster spawn function called");
      
      // Ensure game screen is visible
      ensureGameScreenVisible();
      
      // Set the current area to something other than town
      if (window.currentArea === 'town') {
        window.currentArea = 'forest'; // Default to forest if we're in town
      }
      
      // Make sure monsterTemplates exists and has some templates
      if (!window.monsterTemplates || window.monsterTemplates.length === 0) {
        console.warn("No monster templates found, using defaults");
        window.monsterTemplates = [
          { name: "Forest Wisp", type: "Nature", baseMaxHp: 50, baseAttack: 9, baseDefense: 2, expReward: 18, goldReward: 9, spriteKey: "ForestWisp", skills: [{ name: "Tackle", damageMultiplier: 1.0, type: "Normal", chance: 0.5 }, { name: "Leaf Cutter", damageMultiplier: 1.2, type: "Nature", chance: 0.5 }] }
        ];
      }
      
      // Use original spawn function if it exists
      if (typeof window.originalSpawnNewMonster === 'function') {
        window.originalSpawnNewMonster();
      } else if (typeof window.spawnNewMonster === 'function') {
        window.spawnNewMonster();
      } else {
        // Fallback if no function exists
        spawnMonsterFallback();
      }
      
      // Update UI
      if (typeof window.updateMonsterStatsUI === 'function') {
        window.updateMonsterStatsUI();
      }
      
      // Update skill button availability
      if (typeof window.updateSkillButtonsAvailability === 'function') {
        window.updateSkillButtonsAvailability();
      }
      
      // Set flags
      window.battleScreenActive = true;
      
      // Set timeout to reset transition flag
      setTimeout(() => {
        window.battleTransitionInProgress = false;
      }, 500);
      
    } catch (error) {
      console.error("Error in safeSpawnMonster:", error);
      // Reset the battle screen back to town if there's an error
      resetBattleScreen();
    }
  }
  
  // Fallback function if spawnNewMonster doesn't exist
  function spawnMonsterFallback() {
    console.log("Using fallback monster spawn function");
    
    // Create a basic monster
    window.currentMonster = {
      name: "Forest Wisp",
      type: "Nature",
      hp: 50,
      maxHp: 50,
      attack: 8,
      defense: 2,
      expReward: 20,
      goldReward: 10,
      spriteKey: "ForestWisp",
      skills: [
        { name: "Tackle", damageMultiplier: 1.0, type: "Normal", chance: 0.7 },
        { name: "Leaf Cutter", damageMultiplier: 1.2, type: "Nature", chance: 0.3 }
      ]
    };
    
    // Add message to log
    if (typeof window.addLogMessage === 'function') {
      window.addLogMessage(`A wild ${window.currentMonster.name} appeared!`, "event");
    }
    
    // Update monster display
    const monsterNameDisplay = document.getElementById('monster-name');
    if (monsterNameDisplay) monsterNameDisplay.textContent = window.currentMonster.name;
    
    const monsterTypeDisplay = document.getElementById('monster-type');
    if (monsterTypeDisplay) monsterTypeDisplay.textContent = window.currentMonster.type;
    
    const monsterHpText = document.getElementById('monster-hp-text');
    if (monsterHpText) monsterHpText.textContent = `${window.currentMonster.hp}/${window.currentMonster.maxHp}`;
    
    const monsterHpFill = document.getElementById('monster-hp-fill');
    if (monsterHpFill) monsterHpFill.style.width = "100%";
    
    // Set monster sprite if possible
    const monsterSprite = document.getElementById('monster-sprite');
    if (monsterSprite && window.monsterSprites && window.monsterSprites[window.currentMonster.spriteKey]) {
      monsterSprite.src = window.monsterSprites[window.currentMonster.spriteKey];
    }
  }
  
  // Reset battle screen in case of errors
  function resetBattleScreen() {
    console.log("Resetting battle screen");
    
    // Clear transition flags
    window.battleTransitionInProgress = false;
    window.battleScreenActive = false;
    
    // Ensure game screen is visible
    ensureGameScreenVisible();
    
    // Try to enter town
    if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
      window.enterTown(window.GAME_AREAS.town);
    }
    
    // Add error message
    if (typeof window.addLogMessage === 'function') {
      window.addLogMessage("Error during battle transition. Returning to town.", "error");
    }
  }
  
  // ---------- Fix Area Selection Button ----------
  function fixAreaSelectionBackButton() {
    const backButton = document.getElementById('area-selection-back-btn') || 
                       document.getElementById('back-to-game-button');
    
    if (backButton) {
      // Clone and replace
      const newBackButton = backButton.cloneNode(true);
      if (backButton.parentNode) {
        backButton.parentNode.replaceChild(newBackButton, backButton);
      }
      
      // Add new handler
      newBackButton.addEventListener('click', function() {
        console.log("Area selection back button clicked");
        
        // Reset flags
        window.inAreaSelection = false;
        
        // Hide area selection screen
        const areaSelectionScreen = document.getElementById('area-selection-screen');
        if (areaSelectionScreen) {
          areaSelectionScreen.classList.remove('active');
          areaSelectionScreen.setAttribute('aria-hidden', 'true');
          areaSelectionScreen.style.display = 'none';
        }
        
        // Ensure game screen is visible
        ensureGameScreenVisible();
        
        // Try to enter town
        if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
          window.enterTown(window.GAME_AREAS.town);
        }
      });
      
      console.log("Area selection back button fixed");
    }
  }
  
  // ---------- Fix Enter Area Function ----------
  function fixEnterAreaFunction() {
    if (typeof window.originalEnterArea !== 'function' && 
        typeof window.enterArea === 'function') {
      window.originalEnterArea = window.enterArea;
    }
    
    window.enterArea = function safeEnterArea(areaKey) {
      console.log(`Safe enter area function called for: ${areaKey}`);
      
      try {
        // Set transition flag
        window.battleTransitionInProgress = true;
        
        // Hide area selection screen
        const areaSelectionScreen = document.getElementById('area-selection-screen');
        if (areaSelectionScreen) {
          areaSelectionScreen.classList.remove('active');
          areaSelectionScreen.setAttribute('aria-hidden', 'true');
          areaSelectionScreen.style.display = 'none';
          areaSelectionScreen.style.opacity = '0';
          areaSelectionScreen.style.visibility = 'hidden';
        }
        
        // Ensure game screen is visible
        ensureGameScreenVisible();
        
        // Reset flags
        window.inAreaSelection = false;
        
        // Set current area
        window.currentArea = areaKey;
        
        // Call original function if it exists
        if (typeof window.originalEnterArea === 'function') {
          window.originalEnterArea(areaKey);
        } else {
          // Basic implementation if original doesn't exist
          const area = window.GAME_AREAS && window.GAME_AREAS[areaKey];
          if (area) {
            if (typeof window.addLogMessage === 'function') {
              window.addLogMessage(`Entering ${area.name}...`, "info");
            }
            
            // Spawn monster from this area
            if (typeof window.spawnAreaMonster === 'function') {
              window.spawnAreaMonster(area);
            } else if (typeof window.spawnNewMonster === 'function') {
              window.spawnNewMonster();
            }
          }
        }
        
        // Reset transition flag after a delay
        setTimeout(() => {
          window.battleTransitionInProgress = false;
        }, 500);
        
      } catch (error) {
        console.error(`Error in safeEnterArea(${areaKey}):`, error);
        resetBattleScreen();
      }
    };
    
    console.log("Enter area function fixed");
  }
  
  // Run all fixes
  fixBattleButton();
  fixAreaSelectionBackButton();
  fixEnterAreaFunction();
  
  // Add a MutationObserver to detect if the battle button gets re-added or changed
  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          // Check if the battle button was added or changed
          const battleButton = document.getElementById('leave-town-button');
          if (battleButton && !battleButton.battleScreenFixApplied) {
            fixBattleButton();
          }
        }
      });
    });
    
    observer.observe(gameScreen, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Register with initialization coordinator if available
  if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
    window.gameInitRegistry.markInitialized('battleScreen');
  }
  
  console.log("Battle screen transition fix installed successfully");
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Allow a small delay for other scripts to load
  setTimeout(initializeBattleScreenFix, 300);
});

// Initialize on the init-component event if using initialization coordinator
document.addEventListener('init-component', function(e) {
  if (e.detail.component === 'battleScreen') {
    initializeBattleScreenFix();
  }
});

// Also run after a certain delay as a fallback
setTimeout(initializeBattleScreenFix, 1000);