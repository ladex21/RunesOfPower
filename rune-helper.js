/**
 * Rune Selection Helper Functions
 * 
 * These functions provide a robust way to select rune buttons
 * regardless of how they're structured in the HTML.
 */

// List of all possible rune types
const RUNE_TYPES = ['Fire', 'Water', 'Nature', 'Light', 'Dark'];

/**
 * Select and click a specific rune button by type
 * @param {string} runeType - The type of rune (Fire, Water, Nature, Light, Dark)
 * @returns {boolean} - Whether the rune was successfully selected
 */
function selectRune(runeType) {
  // Validate rune type
  if (!RUNE_TYPES.includes(runeType)) {
    console.error(`Invalid rune type: ${runeType}. Must be one of: ${RUNE_TYPES.join(', ')}`);
    return false;
  }
  
  console.log(`Attempting to select ${runeType} rune...`);
  
  // Try multiple selectors to find the button
  const lowerRune = runeType.toLowerCase();
  
  // Selectors in order of specificity
  const selectors = [
    `#${lowerRune}-rune-btn`, // ID (most specific)
    `button[data-rune="${runeType}"]`, // Data attribute
    `.${lowerRune}-rune`, // Class
    `button.${lowerRune}-rune`, // Button with class
    `.rune-button.${lowerRune}-rune` // Multiple classes
  ];
  
  // Try each selector
  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button) {
      console.log(`Found ${runeType} button with selector: ${selector}`);
      button.click();
      return true;
    }
  }
  
  // If we get here, try a more thorough approach
  console.log('Trying alternative selection methods...');
  return selectRuneAlternative(runeType);
}

/**
 * Alternative method to find and select a rune when selectors fail
 * @param {string} runeType - The type of rune to select
 * @returns {boolean} - Whether the rune was successfully selected
 */
function selectRuneAlternative(runeType) {
  // Get all rune buttons
  const buttons = document.querySelectorAll('.rune-button');
  console.log(`Found ${buttons.length} rune buttons in total`);
  
  if (buttons.length === 0) {
    console.error('No rune buttons found on page. DOM might not be fully loaded.');
    return false;
  }
  
  // Find the button for this rune type
  let targetButton = null;
  
  buttons.forEach(btn => {
    const dataRune = btn.getAttribute('data-rune');
    const classes = [...btn.classList];
    const text = btn.textContent || btn.innerText;
    
    console.log(`Button: data-rune="${dataRune}", classes="${classes.join(' ')}", text="${text.trim()}"`);
    
    // Check if this is the button we want
    if (
      (dataRune === runeType) || 
      (classes.includes(`${runeType.toLowerCase()}-rune`)) ||
      (text.includes(`${runeType} Rune`))
    ) {
      targetButton = btn;
    }
  });
  
  // Click it if found
  if (targetButton) {
    console.log(`Found ${runeType} button using alternative method, clicking it`);
    targetButton.click();
    return true;
  }
  
  console.error(`${runeType} button not found after trying all methods`);
  return false;
}

/**
 * Run diagnostics to check what rune buttons exist in the DOM
 * This is helpful for troubleshooting
 * @returns {object} - Information about found elements
 */
function runRuneButtonDiagnostics() {
  // Get counts of elements
  const allButtons = document.querySelectorAll('button');
  const runeButtons = document.querySelectorAll('.rune-button');
  
  console.log(`Found ${allButtons.length} total buttons`);
  console.log(`Found ${runeButtons.length} rune buttons (.rune-button class)`);
  
  // Check each rune type
  const results = {};
  
  for (const runeType of RUNE_TYPES) {
    const lowerRune = runeType.toLowerCase();
    
    results[runeType] = {
      byId: document.getElementById(`${lowerRune}-rune-btn`) ? 'Found' : 'Not found',
      byDataAttr: document.querySelector(`[data-rune="${runeType}"]`) ? 'Found' : 'Not found',
      byClass: document.querySelector(`.${lowerRune}-rune`) ? 'Found' : 'Not found'
    };
    
    console.log(`${runeType} Rune:`, results[runeType]);
  }
  
  // Show full details of all rune buttons
  if (runeButtons.length > 0) {
    console.log('Detailed info on all rune buttons:');
    runeButtons.forEach((btn, index) => {
      console.log(`Button ${index + 1}:`, {
        dataRune: btn.getAttribute('data-rune'),
        id: btn.id,
        classes: [...btn.classList],
        text: (btn.textContent || btn.innerText).trim(),
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      });
    });
  }
  
  return results;
}

/**
 * Wait for DOM to be ready, then run a callback
 * @param {Function} callback - Function to run when DOM is ready
 */
function whenDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // DOM already loaded, run callback immediately
    callback();
  }
}

/**
 * Select all runes in sequence (for testing)
 * Waits between clicks to allow animations/transitions
 */
function selectAllRunes() {
  let index = 0;
  
  function selectNext() {
    if (index >= RUNE_TYPES.length) {
      console.log('Finished selecting all runes');
      return;
    }
    
    const runeType = RUNE_TYPES[index++];
    console.log(`Selecting ${runeType} rune (${index}/${RUNE_TYPES.length})`);
    
    selectRune(runeType);
    
    // Schedule next selection
    setTimeout(selectNext, 2000); // 2 second delay
  }
  
  // Start the sequence
  selectNext();
}

// Export the functions if in a module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectRune,
    runRuneButtonDiagnostics,
    whenDOMReady,
    selectAllRunes
  };
}

// If not a module, add to global window object
if (typeof window !== 'undefined') {
  window.selectRune = selectRune;
  window.runRuneButtonDiagnostics = runRuneButtonDiagnostics;
  window.whenDOMReady = whenDOMReady;
  window.selectAllRunes = selectAllRunes;
}