/**
 * Combat System Fixes - Addresses specific issues with the combat system
 * that can cause freezing or unexpected behavior.
 */

// Store the last monster turn timestamp to detect stuck turns
let lastMonsterTurnTime = 0;

/**
 * Enhanced monsterTurn function with safety features
 * This replaces or wraps the existing monsterTurn function
 */
function enhancedMonsterTurn() {
  try {
    // Record start time for monitoring
    lastMonsterTurnTime = Date.now();
    
    // Set a safety timeout
    const monsterTurnTimeout = setTimeout(() => {
      console.warn("Combat Fix: Monster turn seems stuck, applying emergency fix");
      forceEndMonsterTurn();
    }, 6000); // 6 second timeout
    
    // Only proceed if we have a monster and not in game over state
    if (!window.currentMonster || window.gameOver) {
      console.log("Combat Fix: No monster or game over, skipping monster turn");
      clearTimeout(monsterTurnTimeout);
      forceEndMonsterTurn();
      return;
    }
    
    // Process status effects if the function exists
    if (typeof processTurnStatusEffects === 'function') {
      try {
        processTurnStatusEffects(true); // True means starting monster turn
      } catch (e) {
        console.error("Combat Fix: Error in processTurnStatusEffects:", e);
        // Continue despite error
      }
    }
    
    // Check if monster is still alive after status effects
    if (window.currentMonster && window.currentMonster.hp <= 0) {
      console.log("Combat Fix: Monster defeated by status effects");
      clearTimeout(monsterTurnTimeout);
      
      if (typeof handleMonsterDefeated === 'function') {
        setTimeout(() => {
          try {
            handleMonsterDefeated();
          } catch (e) {
            console.error("Combat Fix: Error in handleMonsterDefeated:", e);
            forceEndMonsterTurn();
          }
        }, 500);
      } else {
        console.warn("Combat Fix: handleMonsterDefeated missing, using emergency defeat");
        emergencyMonsterDefeat();
      }
      return;
    }
    
    // Select and execute monster skill with safety
    let monsterSkill = null;
    
    if (typeof selectMonsterSkill === 'function') {
      try {
        monsterSkill = selectMonsterSkill();
      } catch (e) {
        console.error("Combat Fix: Error selecting monster skill:", e);
        // Use a fallback skill
        monsterSkill = { 
          name: "Desperate Attack", 
          damageMultiplier: 0.8, 
          type: "Normal" 
        };
      }
    } else {
      // Fallback if selectMonsterSkill doesn't exist
      monsterSkill = { 
        name: "Basic Attack", 
        damageMultiplier: 1.0, 
        type: "Normal" 
      };
    }
    
    // Log the monster's action
    if (typeof addLogMessage === 'function') {
      addLogMessage(`${window.currentMonster.name} uses ${monsterSkill.name}!`, "monster-action");
    }
    
    // Execute the attack with safety
    let attackSuccess = false;
    if (typeof executeMonsterAttack === 'function') {
      try {
        executeMonsterAttack(monsterSkill);
        attackSuccess = true;
      } catch (e) {
        console.error("Combat Fix: Error executing monster attack:", e);
        // Fallback to direct player damage
        emergencyMonsterAttack(monsterSkill);
      }
    } else {
      // If executeMonsterAttack doesn't exist, do emergency attack
      emergencyMonsterAttack(monsterSkill);
    }
    
    // Check if player is defeated
    if (window.playerData && window.playerData.hp <= 0) {
      clearTimeout(monsterTurnTimeout);
      
      if (typeof handlePlayerDefeated === 'function') {
        try {
          handlePlayerDefeated();
        } catch (e) {
          console.error("Combat Fix: Error in handlePlayerDefeated:", e);
          emergencyPlayerDefeat();
        }
      } else {
        console.warn("Combat Fix: handlePlayerDefeated missing, using emergency defeat");
        emergencyPlayerDefeat();
      }
      return;
    }
    
    // End monster turn and switch back to player
    clearTimeout(monsterTurnTimeout);
    
    setTimeout(() => {
      forceEndMonsterTurn();
    }, 1000);
    
  } catch (error) {
    console.error("Combat Fix: Fatal error in monster turn:", error);
    if (typeof showError === 'function') {
      showError("Error during monster's turn: " + error.message, error);
    }
    
    // Emergency recovery
    forceEndMonsterTurn();
  }
}

/**
 * Force end the monster's turn and return to player turn
 */
function forceEndMonsterTurn() {
  try {
    window.isPlayerTurn = true;
    window.combatLock = false;
    
    // Update UI
    if (typeof updateSkillButtonsAvailability === 'function') {
      updateSkillButtonsAvailability();
    }
    
    // Log turn change if possible
    if (typeof addLogMessage === 'function') {
      addLogMessage("Your turn!", "turn-change");
    }
    
    // Process status effects for player turn if possible
    if (typeof processTurnStatusEffects === 'function') {
      try {
        processTurnStatusEffects(false); // False means we're starting player's turn
      } catch (e) {
        console.error("Combat Fix: Error in processTurnStatusEffects for player turn:", e);
        // Continue despite error
      }
    }
    
    console.log("Combat Fix: Monster turn forcibly ended, returning to player turn");
  } catch (e) {
    console.error("Combat Fix: Error in forceEndMonsterTurn:", e);
    // Last resort
    window.isPlayerTurn = true;
    window.combatLock = false;
  }
}

/**
 * Emergency monster attack when normal attack function fails
 */
function emergencyMonsterAttack(skill) {
  try {
    // Calculate basic damage
    const damageMultiplier = skill.damageMultiplier || 1.0;
    const monsterAttack = window.currentMonster.attackPower || 5;
    const playerDefense = window.playerData.defense || 2;
    
    // Simple damage formula
    let damage = Math.round(monsterAttack * damageMultiplier);
    damage = Math.max(1, damage - playerDefense);
    
    // Apply damage to player
    const oldHp = window.playerData.hp;
    window.playerData.hp = Math.max(0, window.playerData.hp - damage);
    
    // Log the damage
    if (typeof addLogMessage === 'function') {
      addLogMessage(`${window.currentMonster.name} dealt ${damage} damage to you!`, "damage-taken");
    }
    
    // Update player UI if possible
    if (typeof updatePlayerStatsUI === 'function') {
      updatePlayerStatsUI();
    }
    
    console.log(`Combat Fix: Emergency monster attack dealt ${damage} damage`);
  } catch (e) {
    console.error("Combat Fix: Error in emergencyMonsterAttack:", e);
  }
}

/**
 * Emergency handler for monster defeat
 */
function emergencyMonsterDefeat() {
  try {
    // Log victory
    if (typeof addLogMessage === 'function') {
      addLogMessage(`You defeated ${window.currentMonster.name}!`, "success");
    }
    
    // Award some EXP and gold
    const expReward = window.currentMonster.expReward || 10;
    const goldReward = window.currentMonster.goldReward || 5;
    
    window.playerData.exp += expReward;
    window.playerData.gold += goldReward;
    
    if (typeof addLogMessage === 'function') {
      addLogMessage(`Gained ${expReward} EXP and ${goldReward} gold!`, "success");
    }
    
    // Heal player a bit
    const healAmount = Math.round(window.playerData.maxHp * 0.3);
    window.playerData.hp = Math.min(window.playerData.maxHp, window.playerData.hp + healAmount);
    
    if (typeof addLogMessage === 'function') {
      addLogMessage(`Victory restores ${healAmount} HP!`, "heal");
    }
    
    // Update UI
    if (typeof updatePlayerStatsUI === 'function') {
      updatePlayerStatsUI();
    }
    
    // Clear current monster
    window.currentMonster = null;
    
    // Update monster UI
    if (typeof updateMonsterStatsUI === 'function') {
      updateMonsterStatsUI();
    }
    
    // Return to player turn
    window.isPlayerTurn = true;
    window.combatLock = false;
    
    // Check for level up
    if (window.playerData.exp >= window.playerData.nextLevelExp) {
      if (typeof levelUp === 'function') {
        try {
          levelUp();
        } catch (e) {
          console.error("Combat Fix: Error in levelUp:", e);
        }
      }
    }
    
    // Spawn a new monster in a moment
    setTimeout(() => {
      if (typeof spawnNewMonster === 'function') {
        try {
          spawnNewMonster();
        } catch (e) {
          console.error("Combat Fix: Error in spawnNewMonster:", e);
          if (typeof enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
            enterTown(window.GAME_AREAS.town);
          }
        }
      } else {
        // If we can't spawn a monster, try to return to town
        if (typeof enterTown === 'function' && window.GAME_AREAS && window.GAME_AREAS.town) {
          enterTown(window.GAME_AREAS.town);
        }
      }
    }, 1500);
    
    console.log("Combat Fix: Emergency monster defeat processed");
  } catch (e) {
    console.error("Combat Fix: Error in emergencyMonsterDefeat:", e);
  }
}

/**
 * Emergency handler for player defeat
 */
function emergencyPlayerDefeat() {
  try {
    // Check for revival stone
    if (window.playerData.hasRevivalStone) {
      // Use revival stone
      window.playerData.hasRevivalStone = false;
      window.playerData.hp = Math.floor(window.playerData.maxHp * 0.5);
      window.playerData.mana = Math.floor(window.playerData.maxMana * 0.3);
      
      if (typeof addLogMessage === 'function') {
        addLogMessage("Revival Stone activates! You've been given another chance!", "event-critical");
      }
      
      // Return to player turn
      window.isPlayerTurn = true;
      window.combatLock = false;
      
      // Update UI
      if (typeof updatePlayerStatsUI === 'function') {
        updatePlayerStatsUI();
      }
      
      console.log("Combat Fix: Used revival stone in emergency");
      return;
    }
    
    // Game over
    window.gameOver = true;
    window.combatLock = true;
    window.isPlayerTurn = false;
    
    // Log defeat
    if (typeof addLogMessage === 'function') {
      addLogMessage("You have been defeated!", "event-critical");
      addLogMessage("Game Over - Refresh to start a new game.", "info");
    }
    
    // Update UI
    if (typeof updatePlayerStatsUI === 'function') {
      updatePlayerStatsUI();
    }
    
    if (typeof updateMonsterStatsUI === 'function') {
      updateMonsterStatsUI();
    }
    
    console.log("Combat Fix: Emergency player defeat processed");
  } catch (e) {
    console.error("Combat Fix: Error in emergencyPlayerDefeat:", e);
  }
}

/**
 * Override or wrap the original monsterTurn function
 */
function installMonsterTurnFix() {
  if (typeof window.monsterTurn === 'function') {
    console.log("Combat Fix: Wrapping original monsterTurn with enhanced version");
    window.originalMonsterTurn = window.monsterTurn;
    window.monsterTurn = enhancedMonsterTurn;
  } else {
    console.log("Combat Fix: Installing new monsterTurn function");
    window.monsterTurn = enhancedMonsterTurn;
  }
}

/**
 * Install our combat fixes
 */
function initializeCombatFixes() {
  console.log("Combat Fix: Initializing combat system fixes");
  
  // Install the monster turn fix
  installMonsterTurnFix();
  
  // Create monitoring interval for combat
  setInterval(() => {
    // Check if monster turn is stuck
    if (!window.isPlayerTurn && !window.gameOver && lastMonsterTurnTime > 0) {
      const now = Date.now();
      const elapsed = now - lastMonsterTurnTime;
      
      // If monster turn has been active for more than 10 seconds, force end it
      if (elapsed > 10000) {
        console.warn(`Combat Fix: Monster turn appears stuck for ${elapsed}ms, forcing end`);
        forceEndMonsterTurn();
        lastMonsterTurnTime = 0;
      }
    }
  }, 2000);
  
  console.log("Combat Fix: Installation complete");
}

// Initialize after a short delay to make sure other scripts are loaded
setTimeout(initializeCombatFixes, 500);