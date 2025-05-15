/**
 * Enhanced Screen Transition Fix
 * A comprehensive solution for screen transition issues in Runes of Power
 */

// Track if this component has been initialized
let enhancedScreenFixInitialized = false;

// Main initialization function
function initializeEnhancedScreenFix() {
  try {
    // Prevent multiple initializations
    if (enhancedScreenFixInitialized) {
      console.log("Enhanced screen fix already initialized, skipping");
      return;
    }
    
    // Mark as initialized
    enhancedScreenFixInitialized = true;
    
    console.log("Installing enhanced screen fix...");
    
    // ---------- Global Screen Management Variables ----------
    // These flags help coordinate screen transitions to prevent race conditions
    window.screenTransitionInProgress = false;
    window.lastActiveScreen = null;
    window.screenManagerVersion = "1.1";
    
    // ---------- Enhanced Screen Management API ----------
    // Create a centralized API for screen management to replace scattered functions
    window.ScreenManager = {
      // Safely activate a screen by ID
      activateScreen: function(screenId) {
        try {
          console.log(`ScreenManager: Activating screen ${screenId}`);
          
          // Set transition flag
          window.screenTransitionInProgress = true;
          
          // Find the target screen
          const targetScreen = document.getElementById(screenId);
          if (!targetScreen) {
            console.error(`ScreenManager: Screen with ID ${screenId} not found`);
            window.screenTransitionInProgress = false;
            return false;
          }
          
          // Store the current active screen
          const previousActiveScreen = document.querySelector('.screen.active');
          window.lastActiveScreen = previousActiveScreen ? previousActiveScreen.id : null;
          
          // Hide all screens except the one being activated
          this.hideAllScreensExcept(screenId);
          
          // Show the target screen
          targetScreen.style.display = 'flex';
          void targetScreen.offsetWidth; // Force reflow for CSS transitions
          targetScreen.classList.add('active');
          targetScreen.setAttribute('aria-hidden', 'false');
          targetScreen.style.opacity = '1';
          targetScreen.style.visibility = 'visible';
          
          // For the game screen, ensure it has the correct styles
          if (screenId === 'game-screen') {
            targetScreen.style.width = '100%';
            targetScreen.style.maxWidth = '1200px';
            targetScreen.style.margin = '0 auto';
          }
          
          // Call any post-activation handlers specific to the screen
          this.runPostActivationHandlers(screenId);
          
          // Reset transition flag after a short delay
          setTimeout(() => {
            window.screenTransitionInProgress = false;
          }, 300);
          
          return true;
        } catch (error) {
          console.error(`ScreenManager: Error activating screen ${screenId}:`, error);
          window.screenTransitionInProgress = false;
          return false;
        }
      },
      
      // Hide all screens except the specified one
      hideAllScreensExcept: function(exceptScreenId) {
        try {
          const screens = document.querySelectorAll('.screen');
          
          if (screens.length === 0) {
            console.warn("No screens found to hide");
            return;
          }
          
          screens.forEach(screen => {
            if (screen.id !== exceptScreenId) {
              screen.classList.remove('active');
              screen.setAttribute('aria-hidden', 'true');
              screen.style.display = 'none';
              screen.style.opacity = '0';
              screen.style.visibility = 'hidden';
            }
          });
        } catch (error) {
          console.error("Error in hideAllScreensExcept:", error);
        }
      },
      
      // Hide all screens (used rarely, prefer hideAllScreensExcept)
      hideAllScreens: function() {
        try {
          if (window.screenTransitionInProgress) {
            console.log("ScreenManager: Screen transition in progress, skipping hideAllScreens");
            return;
          }
          
          this.hideAllScreensExcept(null);
        } catch (error) {
          console.error("Error in hideAllScreens:", error);
        }
      },
      
      // Run post-activation handlers specific to each screen
      runPostActivationHandlers: function(screenId) {
        try {
          switch(screenId) {
            case 'game-screen':
              // For game screen, enter town if possible
              if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
                setTimeout(() => {
                  try {
                    window.enterTown(window.GAME_AREAS.town);
                  } catch (error) {
                    console.error("Error entering town:", error);
                  }
                }, 100);
              }
              break;
              
            case 'area-selection-screen':
              // For area selection, populate areas if needed
              if (typeof window.populateAreaSelection === 'function') {
                setTimeout(() => {
                  try {
                    window.populateAreaSelection();
                  } catch (error) {
                    console.error("Error populating area selection:", error);
                  }
                }, 100);
              }
              break;
          }
        } catch (error) {
          console.error("Error in runPostActivationHandlers:", error);
        }
      },
      
      // Go back to the previous screen
      goBack: function() {
        try {
          if (window.lastActiveScreen) {
            this.activateScreen(window.lastActiveScreen);
          } else {
            // Default to game screen if no previous screen
            this.activateScreen('game-screen');
          }
        } catch (error) {
          console.error("Error in goBack:", error);
          // Attempt to at least show some screen
          this.emergencyRestore();
        }
      },
      
      // Get the currently active screen
      getActiveScreen: function() {
        try {
          const activeScreen = document.querySelector('.screen.active');
          return activeScreen ? activeScreen.id : null;
        } catch (error) {
          console.error("Error in getActiveScreen:", error);
          return null;
        }
      },
      
      // Emergency restore function to ensure at least one screen is visible
      emergencyRestore: function() {
        try {
          console.log("ScreenManager: Emergency restore called");
          
          // Check if any screen is visible
          const activeScreen = document.querySelector('.screen.active');
          if (activeScreen && activeScreen.style.display !== 'none' && activeScreen.style.visibility !== 'hidden') {
            console.log(`ScreenManager: Screen ${activeScreen.id} is already active, no restoration needed`);
            return;
          }
          
          // No active screen, so restore the game screen
          if (window.playerData && window.playerData.rune) {
            // Player has started the game, restore game screen
            this.activateScreen('game-screen');
          } else {
            // Player hasn't started, show rune selection
            this.activateScreen('rune-selection-screen');
          }
        } catch (error) {
          console.error("Error in emergencyRestore:", error);
          // Final fallback - try to show any screen
          try {
            const allScreens = document.querySelectorAll('.screen');
            if (allScreens.length > 0) {
              const firstScreen = allScreens[0];
              firstScreen.style.display = 'flex';
              firstScreen.classList.add('active');
              firstScreen.style.opacity = '1';
              firstScreen.style.visibility = 'visible';
              console.log(`Last resort: Showing screen ${firstScreen.id}`);
            }
          } catch (innerError) {
            console.error("Critical failure in emergency restore:", innerError);
          }
        }
      }
    };
    
    // ---------- Function Overrides ----------
    // Override existing functions to use the ScreenManager
    
    // 1. Override activateScreen if it exists
    if (typeof window.originalActivateScreen !== 'function' && 
        typeof window.activateScreen === 'function') {
      window.originalActivateScreen = window.activateScreen;
    }
    window.activateScreen = function(screenId) {
      return window.ScreenManager.activateScreen(screenId);
    };
    
    // 2. Override hideAllScreens if it exists
    if (typeof window.originalHideAllScreens !== 'function' && 
        typeof window.hideAllScreens === 'function') {
      window.originalHideAllScreens = window.hideAllScreens;
    }
    window.hideAllScreens = function() {
      return window.ScreenManager.hideAllScreens();
    };
    
    // 3. Override switchToGameScreen if it exists
    if (typeof window.originalSwitchToGameScreen !== 'function' && 
        typeof window.switchToGameScreen === 'function') {
      window.originalSwitchToGameScreen = window.switchToGameScreen;
    }
    window.switchToGameScreen = function() {
      return window.ScreenManager.activateScreen('game-screen');
    };
    
    // 4. Override showAreaSelection if it exists
    if (typeof window.originalShowAreaSelection !== 'function' && 
        typeof window.showAreaSelection === 'function') {
      window.originalShowAreaSelection = window.showAreaSelection;
    }
    window.showAreaSelection = function() {
      return window.ScreenManager.activateScreen('area-selection-screen');
    };
    
    // ---------- Fix Game Initialization Flow ----------
    // Override initializeGame to ensure proper screen transitions during initialization
    if (typeof window.originalInitializeGame !== 'function' && 
        typeof window.initializeGame === 'function') {
      window.originalInitializeGame = window.initializeGame;
    }
    
    window.initializeGame = function enhancedInitializeGame(chosenRune) {
      try {
        console.log(`Enhanced initializeGame called with rune: ${chosenRune}`);
        
        // Set transition flag
        window.screenTransitionInProgress = true;
        
        // Set up player data with chosen rune
        if (typeof window.setupPlayerWithRune === 'function') {
          window.setupPlayerWithRune(chosenRune);
        } else {
          console.error("setupPlayerWithRune function not found");
          // Basic fallback for player setup
          if (!window.playerData) window.playerData = {};
          window.playerData.rune = chosenRune;
          console.log("Created basic playerData with rune:", chosenRune);
        }
        
        // Reset game state
        if (typeof window.resetGameState === 'function') {
          window.resetGameState();
        }
        
        // Switch to game screen using ScreenManager
        const success = window.ScreenManager.activateScreen('game-screen');
        
        // Reset transition flag after a delay
        setTimeout(() => {
          window.screenTransitionInProgress = false;
        }, 500);
        
        return success;
      } catch (error) {
        console.error("Error in enhanced initializeGame:", error);
        window.screenTransitionInProgress = false;
        return false;
      }
    };
    
    // ---------- Periodic Screen Check ----------
    // Set up a periodic check to ensure a screen is always visible
    const screenCheckInterval = setInterval(() => {
      try {
        // Skip if transition is in progress
        if (window.screenTransitionInProgress) return;
        
        // Check if any screen is visible
        const anyScreenVisible = Array.from(document.querySelectorAll('.screen')).some(screen => {
          return screen.classList.contains('active') && 
                 screen.style.display !== 'none' &&
                 screen.style.visibility !== 'hidden';
        });
        
        // If no screens are visible, restore
        if (!anyScreenVisible) {
          console.warn("No visible screens detected! Running emergency restore.");
          window.ScreenManager.emergencyRestore();
        }
      } catch (error) {
        console.error("Error in screen check interval:", error);
      }
    }, 2000);
    
    // ---------- Integration with Game Recovery ----------
    // Connect our ScreenManager to the game recovery system if it exists
    if (typeof window.emergencyRestoreGameScreen === 'function') {
      console.log("Integrating with existing emergency restore function");
      
      // Save original function
      window.originalEmergencyRestoreGameScreen = window.emergencyRestoreGameScreen;
      
      // Override with our version that uses ScreenManager
      window.emergencyRestoreGameScreen = function() {
        try {
          console.log("Enhanced emergency restore called");
          
          // Skip if transition is in progress
          if (window.screenTransitionInProgress) {
            console.log("Screen transition in progress, skipping emergency restore");
            return false;
          }
          
          return window.ScreenManager.emergencyRestore();
        } catch (error) {
          console.error("Error in emergency restore:", error);
          return false;
        }
      };
    }
    
    // ---------- Keyboard Shortcut ----------
    // Add a keyboard shortcut to fix screen (Alt+R)
    document.addEventListener('keydown', function(event) {
      if (event.altKey && (event.key === 'r' || event.key === 'R')) {
        console.log("Screen fix keyboard shortcut activated");
        window.ScreenManager.emergencyRestore();
      }
    });
    
    console.log("Enhanced screen fix installed successfully");
    
    // Mark as initialized in registry
    if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
      window.gameInitRegistry.markInitialized('enhancedScreen');
    }
    
    // Clear any safety timeout that might have been set by the coordinator
    if (window.currentInitTimeout) {
      clearTimeout(window.currentInitTimeout);
      window.currentInitTimeout = null;
    }
  } catch (error) {
    console.error("Critical error in enhanced screen fix initialization:", error);
    // Try to mark as initialized anyway to allow other components to load
    if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
      window.gameInitRegistry.markInitialized('enhancedScreen');
    }
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Allow a small delay for other scripts to load
  setTimeout(initializeEnhancedScreenFix, 300);
});

// Initialize on the init-component event if using initialization coordinator
document.addEventListener('init-component', function(e) {
  if (e.detail && e.detail.component === 'enhancedScreen') {
    initializeEnhancedScreenFix();
  }
});

// Also run after a certain delay as a fallback
setTimeout(initializeEnhancedScreenFix, 1000)