/**
 * Improved hideAllScreens Function
 * This version preserves the currently active screen
 */

// Track if this component has been initialized
let hideAllScreensFixed = false;

// Main initialization function
function initializeImprovedHideAllScreens() {
  // Prevent multiple initializations
  if (hideAllScreensFixed) {
    console.log("Improved hideAllScreens already initialized, skipping");
    return;
  }
  
  // Mark as initialized
  hideAllScreensFixed = true;
  
  // Define a safer version of hideAllScreens that won't hide the active screen
  function hideAllScreensExceptActive() {
    try {
      console.log("Hiding all screens except the active one...");
      
      // First, find which screen is currently active
      const activeScreen = document.querySelector('.screen.active');
      const activeScreenId = activeScreen ? activeScreen.id : null;
      
      console.log(`Currently active screen: ${activeScreenId || 'none'}`);
      
      // Only hide screens that aren't active
      const screens = document.querySelectorAll('.screen');
      if (screens.length === 0) {
        console.warn("No screens found with '.screen' class to hide.");
        return;
      }
      
      screens.forEach(screen => {
        // Skip the active screen
        if (activeScreenId && screen.id === activeScreenId) {
          console.log(`Preserving active screen: ${screen.id}`);
          return;
        }
        
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
        screen.style.display = 'none';
        screen.style.opacity = '0';
        screen.style.visibility = 'hidden';
      });
      
      console.log("Non-active screens hidden successfully");
    } catch (error) {
      console.error("Error in hideAllScreensExceptActive:", error);
    }
  }

  // Override the original hideAllScreens function
  // Preserve the original function for reference
  if (typeof window.originalHideAllScreens !== 'function' && typeof window.hideAllScreens === 'function') {
    window.originalHideAllScreens = window.hideAllScreens;
  }
  
  // Replace with our improved version
  window.hideAllScreens = function() {
    console.log("Enhanced hideAllScreens called - preserving active screen");
    hideAllScreensExceptActive();
  };
  
  console.log("Improved hideAllScreens function installed");
}

// Initialize based on the init-component event
document.addEventListener('init-component', function(e) {
  if (e.detail.component === 'screenTransitions') {
    initializeImprovedHideAllScreens();
    // Mark component as initialized in the registry
    if (window.gameInitRegistry) {
      window.gameInitRegistry.markInitialized('screenTransitions');
    }
  }
});