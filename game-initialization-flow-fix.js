/**
 * Game Initialization Flow Fix
 * 
 * This script fixes issues with the game initialization flow,
 * particularly preventing unexpected screen hiding after a successful
 * game screen transition.
 */

// Track if this component has been initialized
let screenTransitionsInitialized = false;

// Main initialization function
function initializeGameFlow() {
  // Prevent multiple initializations
  if (screenTransitionsInitialized) {
    console.log("Game initialization flow already initialized, skipping");
    return;
  }
  
  // Mark as initialized
  screenTransitionsInitialized = true;
  
  console.log("Installing game initialization flow fix...");
  
  // Flag to track if we're in the middle of a screen transition
  let screenTransitionInProgress = false;

  // Replace original functions with patched versions
  if (typeof window.originalHideAllScreens !== 'function' && 
      typeof window.hideAllScreens === 'function') {
    window.originalHideAllScreens = window.hideAllScreens;
  }
  
  window.hideAllScreens = patchedHideAllScreens;
  console.log("Game initialization flow: hideAllScreens patched");
  
  // Modify the part where you override initializeGame
  if (typeof window.originalInitializeGame !== 'function' && 
      typeof window.initializeGame === 'function') {
    window.originalInitializeGame = window.initializeGame;
  }

  window.initializeGame = patchedInitializeGame;
  console.log("Game initialization flow: initializeGame patched");
  
  // Patched version of hideAllScreens that checks if we're in the 
  // middle of a game screen transition
  function patchedHideAllScreens() {
    // If in the middle of a screen transition, don't hide anything
    if (screenTransitionInProgress) {
      console.log("Screen transition in progress, skipping hideAllScreens");
      return;
    }
    
    // Normal behavior when not in a transition
    console.log("Hiding all screens...");
    const screens = document.querySelectorAll('.screen');
    if (screens.length === 0) {
      console.warn("No screens found with '.screen' class to hide.");
      return;
    }
    
    // Check if game screen is active before hiding all screens
    const gameScreenActive = document.getElementById('game-screen')?.classList.contains('active');
    
    // If game screen is active, preserve it
    screens.forEach(screen => {
      if (gameScreenActive && screen.id === 'game-screen') {
        console.log("Preserving active game screen");
        return;
      }
      
      screen.classList.remove('active');
      screen.setAttribute('aria-hidden', 'true');
      screen.style.display = 'none';
      screen.style.opacity = '0';
      screen.style.visibility = 'hidden';
    });
  }
  
  // Patched version of initializeGame to manage screen transitions
  function patchedInitializeGame(chosenRune) {
    try {
      console.log(`Patched initializeGame starting with rune: ${chosenRune}`);
      
      // Mark that we're in a transition
      screenTransitionInProgress = true;
      
      // Create a timer to ensure the flag is eventually reset
      // in case something goes wrong
      const timeoutId = setTimeout(() => {
        screenTransitionInProgress = false;
        console.log("Screen transition timeout - flag reset");
      }, 5000);
      
      if (!chosenRune) {
        screenTransitionInProgress = false;
        clearTimeout(timeoutId);
        console.error("No rune selected for game initialization");
        return false;
      }
      
      // Initialize global game state variables
      window.gameOver = false;
      window.combatLock = false;
      window.isPlayerTurn = true;
      window.regularMonsterDefeatCount = 0;
      window.currentMonster = null;
      
      // Call the original setupPlayerWithRune if it exists
      if (typeof window.setupPlayerWithRune === 'function') {
        window.setupPlayerWithRune(chosenRune);
      } else {
        console.error("setupPlayerWithRune function not found");
        screenTransitionInProgress = false;
        clearTimeout(timeoutId);
        return false;
      }
      
      // Set up game button event handlers - ONLY IF NOT ALREADY DONE
      if (typeof window.setupGameButtonEventHandlers === 'function' && 
          !window.gameButtonsInitialized) {
        window.setupGameButtonEventHandlers();
        window.gameButtonsInitialized = true;
      }
      
      // Now handle screen transition manually without using hideAllScreens
      console.log("Manually handling screen transition...");
      
      // Hide rune selection screen
      const runeSelectionScreen = document.getElementById('rune-selection-screen');
      if (runeSelectionScreen) {
        runeSelectionScreen.classList.remove('active');
        runeSelectionScreen.setAttribute('aria-hidden', 'true');
        runeSelectionScreen.style.display = 'none';
        runeSelectionScreen.style.opacity = '0';
        runeSelectionScreen.style.visibility = 'hidden';
      }
      
      // Show game screen with proper styling
      const gameScreen = document.getElementById('game-screen');
      if (gameScreen) {
        gameScreen.style.display = 'flex';
        gameScreen.style.width = '100%';
        gameScreen.style.maxWidth = '1200px';
        gameScreen.style.margin = '0 auto';
        gameScreen.classList.add('active');
        gameScreen.setAttribute('aria-hidden', 'false');
        gameScreen.style.opacity = '1';
        gameScreen.style.visibility = 'visible';
        console.log("Game screen activated");
        
        // Attempt to enter town after a short delay
        setTimeout(() => {
          if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
            window.enterTown(window.GAME_AREAS.town);
            console.log("Entered town");
          }
          
          // Reset the transition flag
          screenTransitionInProgress = false;
          clearTimeout(timeoutId);
          console.log("Screen transition complete");
        }, 200);
        
        return true;
      } else {
        console.error("Game screen element not found");
        screenTransitionInProgress = false;
        clearTimeout(timeoutId);
        return false;
      }
    } catch (error) {
      console.error("Error in patched initializeGame:", error);
      // Always make sure to reset the flag on error
      screenTransitionInProgress = false;
      return false;
    }
  }
  
  console.log("Game initialization flow fix installed");
}

// Initialize based on the init-component event
document.addEventListener('init-component', function(e) {
  if (e.detail.component === 'screenTransitions') {
    initializeGameFlow();
    // Mark component as initialized in the registry
    if (window.gameInitRegistry) {
      window.gameInitRegistry.markInitialized('screenTransitions');
    }
  }
});