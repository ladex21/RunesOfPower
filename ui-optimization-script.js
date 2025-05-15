/**
 * UI Optimization and Fixes
 * 
 * This script fixes UI-related issues that might be causing freezing:
 * 1. Optimizes DOM updates to reduce reflows
 * 2. Fixes event handler memory leaks
 * 3. Adds safety checks for UI operations
 * 4. Provides fallbacks for missing UI elements
 */

// Store references to common UI operations to minimize lookups
const uiHelpers = {
  // Cache for commonly accessed DOM elements
  cachedElements: {},
  
  // Get an element, either from cache or from the DOM
  getElement(id) {
    if (!this.cachedElements[id]) {
      this.cachedElements[id] = document.getElementById(id);
    }
    return this.cachedElements[id];
  },
  
  // Update text content safely
  updateText(id, text) {
    const element = this.getElement(id);
    if (element) {
      element.textContent = text;
      return true;
    }
    return false;
  },
  
  // Update an element's style property safely
  updateStyle(id, property, value) {
    const element = this.getElement(id);
    if (element && element.style) {
      element.style[property] = value;
      return true;
    }
    return false;
  },
  
  // Show or hide an element safely
  setVisibility(id, visible) {
    const element = this.getElement(id);
    if (element && element.style) {
      element.style.display = visible ? 'block' : 'none';
      if (typeof element.setAttribute === 'function') {
        element.setAttribute('aria-hidden', visible ? 'false' : 'true');
      }
      return true;
    }
    return false;
  },
  
  // Clear all children from an element
  clearChildren(id) {
    const element = this.getElement(id);
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      return true;
    }
    return false;
  },
  
  // Create a button with proper event handling
  createButton(text, onClick, className = '') {
    const button = document.createElement('button');
    button.textContent = text;
    if (className) {
      button.className = className;
    }
    
    // Use a clean event listener that won't create memory leaks
    button.addEventListener('click', onClick, { once: false });
    
    return button;
  },
  
  // Add a message to the game log with optimized rendering
  addToGameLog(message, type = 'info') {
    const gameLog = this.getElement('game-log');
    if (!gameLog) return false;
    
    const logLine = document.createElement('div');
    logLine.className = `log-message ${type}`;
    logLine.textContent = message;
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    fragment.appendChild(logLine);
    gameLog.appendChild(fragment);
    
    // Efficiently scroll to bottom
    gameLog.scrollTop = gameLog.scrollHeight;
    
    // Remove old messages if there are too many (performance optimization)
    while (gameLog.children.length > 50) {
      gameLog.removeChild(gameLog.firstChild);
    }
    
    return true;
  },
  
  // Safely batch update UI elements (minimizes reflows)
  batchUpdate(updates) {
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      updates.forEach(update => {
        if (update.type === 'text') {
          this.updateText(update.id, update.value);
        } else if (update.type === 'style') {
          this.updateStyle(update.id, update.property, update.value);
        } else if (update.type === 'visibility') {
          this.setVisibility(update.id, update.visible);
        } else if (update.type === 'clear') {
          this.clearChildren(update.id);
        }
      });
    });
  }
};

/**
 * Enhanced version of updatePlayerStatsUI with optimized DOM updates
 */
function optimizedUpdatePlayerStatsUI() {
  try {
    if (!window.playerData) {
      console.warn("UI Fix: playerData undefined in optimizedUpdatePlayerStatsUI.");
      return;
    }
    
    // Batch all UI updates to minimize reflows
    const updates = [
      { type: 'text', id: 'player-level', value: playerData.level },
      { type: 'text', id: 'player-gold', value: playerData.gold },
      { type: 'text', id: 'player-attack', value: playerData.attackPower },
      { type: 'text', id: 'player-defense', value: playerData.defense },
      { type: 'text', id: 'player-hp-text', value: `${playerData.hp}/${playerData.maxHp}` },
      { type: 'text', id: 'player-mana-text', value: `${playerData.mana}/${playerData.maxMana}` },
      { type: 'text', id: 'player-exp-text', value: `${playerData.exp}/${playerData.nextLevelExp}` },
      { type: 'style', id: 'player-hp-fill', property: 'width', 
        value: playerData.maxHp > 0 ? `${Math.max(0, (playerData.hp / playerData.maxHp) * 100)}%` : '0%' },
      { type: 'style', id: 'player-mana-fill', property: 'width', 
        value: playerData.maxMana > 0 ? `${Math.max(0, (playerData.mana / playerData.maxMana) * 100)}%` : '0%' },
      { type: 'style', id: 'player-exp-fill', property: 'width', 
        value: playerData.nextLevelExp > 0 ? `${Math.max(0, (playerData.exp / playerData.nextLevelExp) * 100)}%` : '0%' }
    ];
    
    // Update avatar if available
    const playerAvatar = uiHelpers.getElement('player-avatar');
    if (playerAvatar && playerData.avatar) {
      playerAvatar.src = playerData.avatar;
      playerAvatar.alt = `${playerData.rune || 'Generic'} Hero`;
    } else if (playerAvatar && window.heroAvatars && window.heroAvatars.Default) {
      playerAvatar.src = window.heroAvatars.Default;
    }
    
    // Apply all updates in one batch
    uiHelpers.batchUpdate(updates);
    
    // Update additional UI elements if the functions exist
    if (typeof updateMasteryProgressUI === 'function') {
      try {
        updateMasteryProgressUI();
      } catch (e) {
        console.warn("UI Fix: Error in updateMasteryProgressUI", e);
      }
    }
    
    if (typeof updatePlayerStatusEffectsUI === 'function') {
      try {
        updatePlayerStatusEffectsUI();
      } catch (e) {
        console.warn("UI Fix: Error in updatePlayerStatusEffectsUI", e);
        // Fallback simple status effect display
        optimizedUpdatePlayerStatusEffectsUI();
      }
    }
  } catch (e) {
    console.error("UI Fix: Error in optimizedUpdatePlayerStatsUI:", e);
    // Try to use original function if available
    if (typeof window.originalUpdatePlayerStatsUI === 'function') {
      window.originalUpdatePlayerStatsUI();
    }
  }
}

/**
 * Optimized version of updatePlayerStatusEffectsUI
 */
function optimizedUpdatePlayerStatusEffectsUI() {
  try {
    const statusArea = uiHelpers.getElement('player-status-effects-area');
    if (!statusArea) return;
    
    // Clear existing status effects efficiently
    uiHelpers.clearChildren('player-status-effects-area');
    
    // Create and add new status effects if any exist
    if (window.playerData && window.playerData.statusEffects && window.playerData.statusEffects.length > 0) {
      // Use document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      playerData.statusEffects.forEach(effect => {
        const effectDiv = document.createElement('div');
        effectDiv.className = 'status-effect';
        
        // Add appropriate class based on effect type
        if (effect.type.includes('_up')) {
          effectDiv.classList.add('buff');
        } else if (effect.type.includes('_down') || effect.type === 'poison_dot') {
          effectDiv.classList.add('debuff');
        } else {
          effectDiv.classList.add('neutral');
        }
        
        // Create effect text
        let effectText = effect.type.replace(/_/g, ' ').toUpperCase();
        if (typeof effect.value === 'number') {
          effectText += ` (${effect.value > 0 && !String(effect.type).includes("Percent") ? '+' : ''}${effect.value}${String(effect.type).includes("Percent") ? '%' : ''})`;
        }
        if (typeof effect.duration === 'number') {
          effectText += ` [${effect.duration}t]`;
        }
        
        effectDiv.textContent = effectText;
        effectDiv.title = effect.description || effectText;
        
        fragment.appendChild(effectDiv);
      });
      
      // Add all status effects in one DOM operation
      statusArea.appendChild(fragment);
    }
  } catch (e) {
    console.error("UI Fix: Error in optimizedUpdatePlayerStatusEffectsUI:", e);
  }
}

/**
 * Optimized version of updateMonsterStatsUI
 */
function optimizedUpdateMonsterStatsUI() {
  try {
    // Define all required elements
    const elementIds = [
      'monster-name', 'monster-type', 'monster-level', 
      'monster-hp-text', 'monster-hp-fill', 'monster-sprite'
    ];
    
    // Check if essential elements exist
    const missingElements = elementIds.filter(id => !uiHelpers.getElement(id));
    if (missingElements.length > 0) {
      console.warn(`UI Fix: Monster UI elements missing: ${missingElements.join(', ')}`);
      return;
    }
    
    if (window.currentMonster) {
      // Prepare updates for batch processing
      const updates = [
        { type: 'text', id: 'monster-name', 
          value: currentMonster.isBoss ? `BOSS: ${currentMonster.name}` : currentMonster.name },
        { type: 'text', id: 'monster-type', value: currentMonster.type },
        { type: 'text', id: 'monster-level', 
          value: currentMonster.level || (window.playerData ? window.playerData.level : 1) },
        { type: 'text', id: 'monster-hp-text', 
          value: `${currentMonster.hp}/${currentMonster.maxHp}` },
        { type: 'style', id: 'monster-hp-fill', property: 'width', 
          value: `${Math.max(0, (currentMonster.hp / currentMonster.maxHp) * 100)}%` }
      ];
      
      // Apply all updates at once
      uiHelpers.batchUpdate(updates);
      
      // Update the monster sprite (can't be batched with style updates)
      const monsterSprite = uiHelpers.getElement('monster-sprite');
      if (monsterSprite) {
        monsterSprite.src = (window.monsterSprites && window.monsterSprites[currentMonster.spriteKey]) || 
                           (window.monsterSprites ? window.monsterSprites.DefaultMonster : '');
        monsterSprite.alt = currentMonster.name;
        monsterSprite.style.display = 'block';
      }
      
      // Update type data attribute if the element has this capability
      const monsterTypeDisplay = uiHelpers.getElement('monster-type');
      if (monsterTypeDisplay && monsterTypeDisplay.dataset) {
        monsterTypeDisplay.dataset.type = currentMonster.type;
      }
      
      // Update monster counters (separate from the main monster display)
      if (uiHelpers.getElement('monsters-defeated')) {
        uiHelpers.updateText('monsters-defeated', window.regularMonsterDefeatCount);
      }
      
      if (uiHelpers.getElement('next-boss-counter')) {
        const bossInterval = window.BOSS_MONSTER_INTERVAL || 10;
        const remaining = bossInterval - (window.regularMonsterDefeatCount % bossInterval);
        uiHelpers.updateText('next-boss-counter', 
          (window.regularMonsterDefeatCount > 0 && remaining === bossInterval) ? "NOW!" : remaining.toString());
      }
    } else {
      // No monster, show appropriate placeholders
      const updates = [
        { type: 'text', id: 'monster-name', 
          value: window.gameOver ? "GAME OVER" : (window.currentArea === 'town' ? "Runehaven" : "Victory!") },
        { type: 'text', id: 'monster-type', value: "---" },
        { type: 'text', id: 'monster-level', value: "--" },
        { type: 'text', id: 'monster-hp-text', value: "---/---" },
        { type: 'style', id: 'monster-hp-fill', property: 'width', value: "0%" }
      ];
      
      // Apply all updates at once
      uiHelpers.batchUpdate(updates);
      
      // Update the monster sprite for game over or victory
      const monsterSprite = uiHelpers.getElement('monster-sprite');
      if (monsterSprite) {
        monsterSprite.src = window.gameOver ? 
          (window.monsterSprites ? window.monsterSprites.GameOver : '') : 
          (window.currentArea === 'town' && window.heroAvatars ? 
            window.heroAvatars.Default : (window.monsterSprites ? window.monsterSprites.Victory : ''));
        monsterSprite.alt = window.gameOver ? "Game Over" : (window.currentArea === 'town' ? "Town" : "No monster");
      }
      
      // Clear monster type data attribute
      const monsterTypeDisplay = uiHelpers.getElement('monster-type');
      if (monsterTypeDisplay && monsterTypeDisplay.dataset) {
        monsterTypeDisplay.dataset.type = "";
      }
    }
    
    // Update monster status effects if the function exists
    if (typeof updateMonsterStatusEffectsUI === 'function') {
      try {
        updateMonsterStatusEffectsUI();
      } catch (e) {
        console.warn("UI Fix: Error in updateMonsterStatusEffectsUI", e);
        // No fallback needed here, status effects are non-critical
      }
    }
  } catch (e) {
    console.error("UI Fix: Error in optimizedUpdateMonsterStatsUI:", e);
    // Try to use original function if available
    if (typeof window.originalUpdateMonsterStatsUI === 'function') {
      window.originalUpdateMonsterStatsUI();
    }
  }
}

/**
 * Optimized version of addLogMessage that batches updates
 */
function optimizedAddLogMessage(message, type = "info") {
  try {
    return uiHelpers.addToGameLog(message, type);
  } catch (e) {
    console.error("UI Fix: Error in optimizedAddLogMessage:", e);
    // Fall back to console logging
    console.log(`Game Log (${type}): ${message}`);
    return false;
  }
}

/**
 * Fix event handler leaks by recreating skill buttons with proper listeners
 */
function fixSkillButtonEventHandlers() {
  try {
    const skillButtonsArea = uiHelpers.getElement('skill-buttons-area');
    if (!skillButtonsArea) return;
    
    const buttons = skillButtonsArea.querySelectorAll('.skill-button');
    if (!buttons || buttons.length === 0) return;
    
    buttons.forEach(button => {
      // Clone the button to remove old event listeners
      const newButton = button.cloneNode(true);
      
      // Add new, clean event listener
      newButton.addEventListener('click', function() {
        const skillId = this.dataset.skillId;
        if (!skillId) {
          console.warn("UI Fix: Skill button missing skillId data attribute.");
          return;
        }
        
        if (typeof window.useSkill === 'function') {
          window.useSkill(skillId);
        } else {
          console.error("UI Fix: useSkill function is missing!");
          if (typeof window.showError === 'function') {
            window.showError("Cannot use skill: Function missing.");
          }
        }
      });
      
      // Replace the old button with the new one
      button.parentNode.replaceChild(newButton, button);
    });
    
    console.log("UI Fix: Skill button event handlers fixed");
  } catch (e) {
    console.error("UI Fix: Error fixing skill button event handlers:", e);
  }
}

/**
 * Install all UI fixes
 */
function installUIFixes() {
  console.log("UI Fix: Installing UI optimizations and fixes");
  
  // Save original functions before replacing
  if (typeof window.updatePlayerStatsUI === 'function') {
    window.originalUpdatePlayerStatsUI = window.updatePlayerStatsUI;
    window.updatePlayerStatsUI = optimizedUpdatePlayerStatsUI;
    console.log("UI Fix: Enhanced updatePlayerStatsUI installed");
  }
  
  if (typeof window.updateMonsterStatsUI === 'function') {
    window.originalUpdateMonsterStatsUI = window.updateMonsterStatsUI;
    window.updateMonsterStatsUI = optimizedUpdateMonsterStatsUI;
    console.log("UI Fix: Enhanced updateMonsterStatsUI installed");
  }
  
  if (typeof window.addLogMessage === 'function') {
    window.originalAddLogMessage = window.addLogMessage;
    window.addLogMessage = optimizedAddLogMessage;
    console.log("UI Fix: Enhanced addLogMessage installed");
  }
  
  // Fix event handlers once now, and periodically
  fixSkillButtonEventHandlers();
  
  // Periodically fix event handlers to prevent memory leaks
  setInterval(fixSkillButtonEventHandlers, 60000); // Check every minute
  
  // Add our UI helpers to the window for other scripts to use
  window.uiHelpers = uiHelpers;
  
  console.log("UI Fix: Installation complete");
}

// Install the UI fixes after a short delay
setTimeout(installUIFixes, 1000);