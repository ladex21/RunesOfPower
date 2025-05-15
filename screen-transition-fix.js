/**
 * Screen Transition Fix
 * Fixes issues with screen transitions
 */

// Improved screen activation function
function safeActivateScreen(screenId) {
  try {
    console.log(`Safely activating screen: ${screenId}`);
    
    // Find the screen element
    const screenElement = document.getElementById(screenId);
    if (!screenElement) {
      console.error(`Screen with ID ${screenId} not found`);
      return false;
    }
    
    // First, hide all other screens (not the one we're activating)
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      if (screen.id !== screenId) {
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
        screen.style.display = 'none';
        screen.style.opacity = '0';
        screen.style.visibility = 'hidden';
      }
    });
    
    // Now activate the requested screen
    screenElement.style.display = 'flex'; // Or 'block' depending on your CSS
    void screenElement.offsetWidth; // Force reflow for transition
    screenElement.classList.add('active');
    screenElement.setAttribute('aria-hidden', 'false');
    screenElement.style.opacity = '1';
    screenElement.style.visibility = 'visible';
    
    console.log(`Screen ${screenId} activated successfully`);
    return true;
  } catch (error) {
    console.error("Error in safeActivateScreen:", error);
    return false;
  }
}

// Improved switchToGameScreen function
function safeSwitchToGameScreen() {
  console.log("Safely switching to game screen...");
  
  // Use the safer activate screen function
  const success = safeActivateScreen('game-screen');
  
  if (success) {
    // Schedule post-activation actions (like entering town)
    setTimeout(() => {
      const gameScreen = document.getElementById('game-screen');
      if (!gameScreen || !gameScreen.classList.contains('active')) {
        console.error("Game screen didn't remain active after activation");
        return;
      }
      
      // Enter town if possible
      if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
        console.log("Entering town...");
        window.enterTown(window.GAME_AREAS.town);
      }
    }, 100);
  }
  
  return success;
}

// Replace the original functions with our safer versions
(function() {
  // Save original functions
  if (typeof window.originalActivateScreen !== 'function' && typeof window.activateScreen === 'function') {
    window.originalActivateScreen = window.activateScreen;
  }
  
  if (typeof window.originalSwitchToGameScreen !== 'function' && typeof window.switchToGameScreen === 'function') {
    window.originalSwitchToGameScreen = window.switchToGameScreen;
  }
  
  // Replace with our safer versions
  window.activateScreen = safeActivateScreen;
  window.switchToGameScreen = safeSwitchToGameScreen;
  
  console.log("Safe screen transition functions installed");
})();