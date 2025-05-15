/**
 * Game Screen Recovery Utility
 * 
 * This script adds emergency recovery functions to restore 
 * the game when all screens get hidden unexpectedly.
 */

// Self-executing function to avoid polluting global scope
(function() {
  console.log("Installing game screen recovery utility...");
  
  // Function to restore the game screen if all screens are hidden
  function emergencyRestoreGameScreen() {
    console.log("Emergency: Attempting to restore game screen...");
    
    // Check if any screen is currently visible
    let anyScreenVisible = false;
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(screen => {
      if (screen.classList.contains('active') && 
          screen.style.display !== 'none' && 
          screen.style.visibility !== 'hidden') {
        anyScreenVisible = true;
      }
    });
    
    // If no screens are visible, restore the game screen
    if (!anyScreenVisible) {
      console.log("No visible screens detected! Restoring game screen...");
      
      // First, check if we have player data with a rune
      if (window.playerData && window.playerData.rune) {
        // Player has started the game, restore the game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
          // Make the game screen visible again
          gameScreen.style.display = 'flex';
          gameScreen.classList.add('active');
          gameScreen.setAttribute('aria-hidden', 'false');
          gameScreen.style.opacity = '1';
          gameScreen.style.visibility = 'visible';
          
          console.log("Game screen restored successfully");
          
          // Try to enter town if possible
          if (typeof window.enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
            window.enterTown(window.GAME_AREAS.town);
          }
          
          return true;
        }
      } else {
        // Player hasn't started the game, restore the rune selection screen
        const runeSelectionScreen = document.getElementById('rune-selection-screen');
        if (runeSelectionScreen) {
          runeSelectionScreen.style.display = 'flex';
          runeSelectionScreen.classList.add('active');
          runeSelectionScreen.setAttribute('aria-hidden', 'false');
          runeSelectionScreen.style.opacity = '1';
          runeSelectionScreen.style.visibility = 'visible';
          
          console.log("Rune selection screen restored successfully");
          
          // Make sure rune buttons are enabled
          document.querySelectorAll('.rune-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
          });
          
          return true;
        }
      }
    } else {
      console.log("At least one screen is already visible, no restoration needed");
      return false;
    }
    
    console.error("Failed to restore any screen");
    return false;
  }
  
  // Add keyboard shortcut to restore screens (press 'R' key)
  document.addEventListener('keydown', function(event) {
    // 'R' key for Recovery
    if (event.key === 'r' || event.key === 'R') {
      emergencyRestoreGameScreen();
    }
  });
  
  // Add automatic monitoring to detect when all screens are hidden
  function monitorScreenVisibility() {
    // Check if any screen is visible
    let anyScreenVisible = false;
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(screen => {
      if (screen.classList.contains('active') && 
          screen.style.display !== 'none' && 
          screen.style.visibility !== 'hidden') {
        anyScreenVisible = true;
      }
    });
    
    // If no screens are visible after the game has loaded, attempt recovery
    if (!anyScreenVisible && document.readyState === 'complete') {
      console.warn("⚠️ Detected all screens are hidden! Automatically restoring...");
      emergencyRestoreGameScreen();
    }
  }
  
  // Check periodically if all screens are hidden
  setInterval(monitorScreenVisibility, 3000);
  
  // Add the emergency restore function to the window object
  window.emergencyRestoreGameScreen = emergencyRestoreGameScreen;
  
  // Add recovery button to the page
  function addRecoveryButton() {
    const existingButton = document.getElementById('emergency-recover-button');
    if (existingButton) return;
    
    const recoverButton = document.createElement('button');
    recoverButton.id = 'emergency-recover-button';
    recoverButton.textContent = '🛟 Recover Game';
    recoverButton.style.position = 'fixed';
    recoverButton.style.bottom = '10px';
    recoverButton.style.left = '10px';
    recoverButton.style.zIndex = '9999';
    recoverButton.style.padding = '8px 12px';
    recoverButton.style.backgroundColor = '#e74c3c';
    recoverButton.style.color = 'white';
    recoverButton.style.border = '2px solid #c0392b';
    recoverButton.style.borderRadius = '5px';
    recoverButton.style.fontFamily = 'Arial, sans-serif';
    recoverButton.style.fontSize = '14px';
    recoverButton.style.fontWeight = 'bold';
    recoverButton.style.cursor = 'pointer';
    
    recoverButton.onclick = function() {
      emergencyRestoreGameScreen();
    };
    
    document.body.appendChild(recoverButton);
  }
  
  // Add the recovery button when the DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRecoveryButton);
  } else {
    addRecoveryButton();
  }
  
  console.log("Game screen recovery utility installed");
  console.log("Press 'R' key to restore screens if all are hidden");
})();