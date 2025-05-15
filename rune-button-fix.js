/**
 * UPDATED Rune Button Fix
 * Simplified to rely on centralized game initialization.
 * This script ensures rune selection buttons correctly initiate the game
 * by calling the global initializeGame function.
 */

// Track if this component has been initialized to prevent redundant executions.
let runeButtonsInitialized = false;

/**
 * Main initialization function for rune button handling.
 * Sets up event listeners for rune selection buttons.
 */
function initializeRuneButtonHandling() {
  // Prevent multiple initializations if the script is somehow called again.
  if (runeButtonsInitialized) {
    console.log("Rune button handling already initialized, skipping (rune-button-fix.js)");
    return;
  }
  
  runeButtonsInitialized = true;
  console.log("Initializing UPDATED rune button handling (rune-button-fix.js)...");
  
  /**
   * Attaches corrected event handlers to all rune buttons.
   * Clones buttons to remove any pre-existing problematic handlers.
   */
  function fixRuneButtonHandlers() {
    try {
      // Select all elements with the class 'rune-button'.
      const runeButtons = document.querySelectorAll('.rune-button');
      console.log(`Found ${runeButtons.length} rune buttons to fix (rune-button-fix.js)`);
      
      // If no rune buttons are found, log an error and exit.
      // This might indicate that the DOM isn't fully loaded or selectors are incorrect.
      if (runeButtons.length === 0) {
        console.error("No rune buttons found by rune-button-fix.js. DOM might not be fully loaded or selectors are incorrect.");
        return false; // Indicate failure.
      }
      
      // Iterate over each found rune button.
      runeButtons.forEach(button => {
        const runeType = button.getAttribute('data-rune');
        // Ensure the button has a 'data-rune' attribute.
        if (!runeType) {
          console.warn("A rune button is missing data-rune attribute. Skipping this button:", button);
          return; // Skip this button if it's not configured correctly.
        }

        // Clone the button to remove any existing event listeners.
        // This is a common technique to ensure a clean slate for event handling.
        const newButton = button.cloneNode(true);  
        if (button.parentNode) {
          button.parentNode.replaceChild(newButton, button);
        } else {
          // Log a warning if the button couldn't be replaced (e.g., not properly in DOM).
          console.warn("Original rune button has no parent, cannot replace. Proceeding with event listener attachment.", button);
          return; // Skip this button if it's not in the DOM
        }
        
        console.log(`Fixing event handler for ${runeType} rune button (rune-button-fix.js)`);
        
        // Add the new, corrected event listener to the cloned button.
        newButton.addEventListener('click', function(event) {
          console.log(`${runeType} rune button clicked! (rune-button-fix.js)`);
          
          // Prevent default browser action and stop the event from bubbling up.
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
          
          // Disable all rune buttons to prevent multiple clicks or race conditions.
          document.querySelectorAll('.rune-button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5"; // Visual feedback for disabled state.
          });
          
          // Highlight the clicked button by ensuring its opacity is full.
          this.style.opacity = "1"; // 'this' refers to newButton.
          
          try {
            // Attempt to call the centralized initializeGame function.
            // This function is expected to be defined globally (e.g., in script.js or patched by another fix script).
            if (typeof window.initializeGame === 'function') {
              console.log(`Calling global initializeGame('${runeType}') (rune-button-fix.js)`);
              window.initializeGame(runeType); // This function should handle player setup & screen transition.
            } else {
              // This is a critical failure if initializeGame is not found.
              console.error("CRITICAL: window.initializeGame function not found! Game cannot start. (rune-button-fix.js)");
              // Check for a potential initializeGame function that might be added by other scripts
              if (typeof window.originalInitializeGame === 'function') {
                console.warn("Found originalInitializeGame, trying to use it as a fallback");
                window.originalInitializeGame(runeType);
              } else if (typeof window.setupPlayerWithRune === 'function') {
                // Fallback: Try to at least set up the player if possible
                console.warn("Attempting minimal game initialization fallback");
                window.setupPlayerWithRune(runeType);
                
                // Fallback: Attempt a very basic screen switch if ScreenManager is available.
                // This indicates a deeper problem with the game's initialization sequence.
                if (typeof window.ScreenManager !== 'undefined' && typeof window.ScreenManager.activateScreen === 'function') {
                  console.warn("Attempting fallback screen switch to game-screen via ScreenManager (rune-button-fix.js)");
                  // Basic player data setup (this should ideally be in setupPlayerWithRune).
                  if(window.playerData) window.playerData.rune = runeType; else window.playerData = { rune: runeType}; // Ensure playerData exists.
                  window.ScreenManager.activateScreen('game-screen');
                } else if (typeof window.activateScreen === 'function') {
                  console.warn("Attempting fallback screen switch via activateScreen (rune-button-fix.js)");
                  window.activateScreen('game-screen');
                } else {
                  // Last resort: alert the user.
                  alert("Error: Game initialization failed. Key function missing. Please refresh.");
                }
              } else {
                // Absolute last resort - try to manually simulate what initializeGame would do
                console.error("No initialization functions found, attempting emergency startup sequence");
                if (!window.playerData) window.playerData = {};
                window.playerData.rune = runeType;
                
                // Hide rune selection screen
                const runeSelectionScreen = document.getElementById('rune-selection-screen');
                if (runeSelectionScreen) {
                  runeSelectionScreen.classList.remove('active');
                  runeSelectionScreen.style.display = 'none';
                }
                
                // Show game screen
                const gameScreen = document.getElementById('game-screen');
                if (gameScreen) {
                  gameScreen.classList.add('active'); 
                  gameScreen.style.display = 'flex';
                  gameScreen.style.opacity = '1';
                  gameScreen.style.visibility = 'visible';
                } else {
                  alert("Error: Game screen not found. Initialization failed.");
                }
              }
            }
          } catch (error) {
            // Catch any errors that occur during the initializeGame call.
            console.error(`Error during initializeGame call from rune-button-fix.js for ${runeType}:`, error);
            // Display error to the user if showError function is available.
            if(typeof window.showError === 'function') {
              window.showError(`Failed to start game with ${runeType} rune.`, error);
            } else {
              alert(`Error starting game with ${runeType}. Check console.`);
            }
            // Re-enable rune buttons if an error occurs to allow the user to try again.
            document.querySelectorAll('.rune-button').forEach(btn => {
              btn.disabled = false;
              btn.style.opacity = "1";
            });
          }
          return false; // Explicitly prevent default behavior for the click.
        }, true); // Using capturing phase for the event listener (can be true or false, false is more common).
      });
      
      console.log("Rune button handlers fixed successfully by rune-button-fix.js");
      return true; // Indicate success.
    } catch (error) {
      console.error("Error in fixRuneButtonHandlers:", error);
      // Re-enable all buttons in case of error
      document.querySelectorAll('.rune-button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
      });
      return false; // Indicate failure
    }
  }
  
  /**
   * Allows manual initialization of a rune via the browser console for testing.
   * @param {string} runeType - The type of rune to initialize (e.g., 'Fire').
   */
  function manuallyInitializeRune(runeType) {
    console.log(`Manually initializing ${runeType} rune via rune-button-fix.js...`);
    
    const validRunes = ['Fire', 'Water', 'Nature', 'Light', 'Dark'];
    if (!validRunes.includes(runeType)) {
      console.error(`Invalid rune type for manual initialization: ${runeType}`);
      return false;
    }
    
    // Provide visual feedback as if the button was clicked.
    document.querySelectorAll('.rune-button').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
    });
    // Attempt to find the specific rune button to highlight it.
    const runeButton = document.querySelector(`#${runeType.toLowerCase()}-rune-btn`) || 
                      document.querySelector(`[data-rune="${runeType}"]`);
    if (runeButton) {
      runeButton.style.opacity = "1";
    }

    // Call the main game initialization function.
    if (typeof window.initializeGame === 'function') {
        window.initializeGame(runeType);
        return true;
    } else {
        console.error("window.initializeGame is not defined. Cannot manually initialize rune via rune-button-fix.js.");
        // Re-enable buttons if manual init fails here.
        document.querySelectorAll('.rune-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = "1";
        });
        return false;
    }
  }
  
  // Execute the function to fix rune button handlers.
  const success = fixRuneButtonHandlers();
  
  // Expose utility functions to the window object for debugging or external calls.
  // Renamed to avoid potential conflicts if the script is accidentally loaded multiple times.
  window.fixRuneButtonHandlersExternal = fixRuneButtonHandlers; 
  window.manuallyInitializeRuneExternal = manuallyInitializeRune;
  
  console.log("UPDATED rune button handling initialized by rune-button-fix.js");
  
  // Return success status
  return success;
}

// Standard event listener for 'init-component' dispatched by initialization-coordinator.js.
// This is the preferred way for this script to be triggered.
document.addEventListener('init-component', function(e) {
  if (e.detail && e.detail.component === 'runeButtons') {
    console.log("Received init-component event for runeButtons");
    const success = initializeRuneButtonHandling();
    // Mark this component as initialized in the central registry.
    if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
      window.gameInitRegistry.markInitialized('runeButtons');
    }
    
    // Clear any safety timeout that might have been set by the coordinator
    if (window.currentInitTimeout) {
      clearTimeout(window.currentInitTimeout);
      window.currentInitTimeout = null;
    }
  }
});

// Fallback initialization:
// If the 'init-component' event isn't received (e.g., if initialization-coordinator.js fails or is missing),
// this attempts to run the initialization logic after the DOM is fully loaded.
// This serves as a safety net.
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Check if the main initialization has already run.
        if (!runeButtonsInitialized && document.querySelector('.rune-button')) {
            console.warn("rune-button-fix.js: Initializing via DOMContentLoaded fallback (coordinator event likely not received or processed).");
            initializeRuneButtonHandling();
            // Note: If initializing here, it might be too late to correctly register with gameInitRegistry
            // if the coordinator has already moved past this component's slot.
            // However, the critical button fixes will still be applied.
        }
    }, 1000); // Delay to allow other scripts to potentially load and define global functions.
});