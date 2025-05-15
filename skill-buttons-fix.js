/* Skill Buttons Fix Script
 * This script fixes missing skill buttons and other UI elements
 */

// Track if this component has been initialized
let skillButtonsInitialized = false;

// Main initialization function
function initializeSkillButtons() {
  try {
    // Prevent multiple initializations
    if (skillButtonsInitialized) {
      console.log("Skill buttons already initialized, skipping");
      return true;
    }
    
    // Mark as initialized
    skillButtonsInitialized = true;
    
    console.log("Initializing skill buttons fix...");

    // Function to fix player skills
    function fixPlayerSkills() {
      try {
        if (!window.playerData) {
          console.warn("Skill-buttons-fix: playerData not found. Cannot fix skills yet.");
          return false; // Indicate failure or inability to proceed
        }
        
        // Make sure playerData.skills is always an array
        if (!Array.isArray(window.playerData.skills)) {
          window.playerData.skills = [];
        }
        
        console.log(`Skill-buttons-fix: Checking skills. Current skills array length: ${window.playerData.skills.length}`);

        // Check if skills array is empty and playerData.rune is defined
        if (window.playerData.skills.length === 0 && window.playerData.rune) {
          // Try to define skills using original function if available
          if (typeof window.definePlayerSkills === 'function') {
            console.log(`Skill-buttons-fix: Using definePlayerSkills for rune "${window.playerData.rune}"`);
            window.definePlayerSkills(window.playerData.rune);
            
            // Check if definePlayerSkills successfully populated skills
            if (!window.playerData.skills || window.playerData.skills.length === 0) {
              console.warn("Skill-buttons-fix: definePlayerSkills did not populate skills. Using fallback.");
              createDefaultSkills(); // Fallback to local function
            } else {
              console.log(`Skill-buttons-fix: Skills defined successfully. Count: ${window.playerData.skills.length}`);
            }
          } else {
            // Use fallback if definePlayerSkills is not available
            console.warn("Skill-buttons-fix: definePlayerSkills not found. Using fallback function.");
            createDefaultSkills();
          }
          
          // Render the skill buttons
          fixSkillButtonsRendering();
          return true;
        } else if (window.playerData.skills.length > 0) {
          console.log("Skill-buttons-fix: Skills already present. Ensuring proper rendering.");
          // Skills already exist, just update the buttons
          fixSkillButtonsRendering();
          return true;
        } else {
          console.warn("Skill-buttons-fix: Skills array empty and playerData.rune not set. Cannot create skills yet.");
          return false;
        }
      } catch (error) {
        console.error("Error in fixPlayerSkills:", error);
        return false;
      }
    }

    // Function to create default skills when definePlayerSkills is missing
    function createDefaultSkills() {
      try {
        const runeType = window.playerData.rune || 'Fire';
        const MELEE_ATTACK_ID = "melee_attack";
        const MELEE_MANA_REGEN = 8;
        const MELEE_DAMAGE_BASE_PERCENT_OF_ATTACK = 1.0;
        
        // Define a basic melee attack that all runes have
        const meleeAttack = {
          id: MELEE_ATTACK_ID,
          name: "Melee",
          manaCost: 0,
          description: `A basic attack. Deals physical damage based on Attack Power and regenerates ${MELEE_MANA_REGEN} MP.`,
          icon: "⚔️",
          effects: { damageBasePercent: MELEE_DAMAGE_BASE_PERCENT_OF_ATTACK, type: "Normal", target: "enemy", manaRegen: MELEE_MANA_REGEN }
        };

        // Define rune-specific skills
        let elementalSkills = [];
        
        switch (runeType) {
          case 'Fire':
            elementalSkills = [
              { name: "Fireball", manaCost: 10, description: "Hurl a basic fireball.", icon: "🔥", effects: { damage: 12, type: "Fire", target: "enemy" } },
              { name: "Flame Lash", manaCost: 18, description: "A whip of searing flames.", icon: "☄️", effects: { damage: 20, type: "Fire", target: "enemy" } },
              { name: "Cauterize", manaCost: 15, description: "Heal wounds with controlled fire.", icon: "❤️‍🔥", effects: { heal: 20, type: "Fire", target: "self" } }
            ];
            break;
          case 'Water':
            elementalSkills = [
              { name: "Aqua Jet", manaCost: 9, description: "Swiftly strike with water.", icon: "💧", effects: { damage: 11, type: "Water", target: "enemy" } },
              { name: "Tidal Crash", manaCost: 20, description: "A powerful wave crashes down.", icon: "🌊", effects: { damage: 22, type: "Water", target: "enemy" } },
              { name: "Soothing Mist", manaCost: 16, description: "A mist that heals allies.", icon: "💨", effects: { heal: 25, type: "Water", target: "self" } }
            ];
            break;
          case 'Nature':
            elementalSkills = [
              { name: "Vine Lash", manaCost: 11, description: "Strike with a thorny vine.", icon: "🌿", effects: { damage: 13, type: "Nature", target: "enemy" } },
              { name: "Earth Spike", manaCost: 19, description: "Summon a spike from the ground.", icon: "⛰️", effects: { damage: 19, type: "Nature", target: "enemy" } },
              { name: "Regenerate", manaCost: 17, description: "Gradually restore health.", icon: "✨", effects: { heal: 22, type: "Nature", target: "self" } }
            ];
            break;
          case 'Light':
            elementalSkills = [
              { name: "Holy Spark", manaCost: 12, description: "A spark of pure light.", icon: "🌟", effects: { damage: 14, type: "Light", target: "enemy" } },
              { name: "Divine Shield", manaCost: 20, description: "Temporarily boosts defense.", icon: "🛡️", effects: { buff: "defense", value: 5, duration: 3, type: "Light", target: "self" } },
              { name: "Flash Heal", manaCost: 18, description: "A quick burst of healing light.", icon: "💡", effects: { heal: 30, type: "Light", target: "self" } }
            ];
            break;
          case 'Dark':
            elementalSkills = [
              { name: "Shadow Bolt", manaCost: 12, description: "A bolt of dark energy.", icon: "🌑", effects: { damage: 14, type: "Dark", target: "enemy" } },
              { name: "Life Drain", manaCost: 22, description: "Drain HP from the foe.", icon: "💀", effects: { damage: 12, healPercentOfDamage: 0.6, type: "Dark", target: "enemy" } },
              { name: "Cloak of Shadows", manaCost: 18, description: "Briefly increase evasion.", icon: "👻", effects: { buff: "evasion", value: 0.2, duration: 2, type: "Dark", target: "self" } }
            ];
            break;
          default:
            console.warn(`Unknown rune type: ${runeType}, using Fire as default`);
            elementalSkills = [
              { name: "Fireball", manaCost: 10, description: "Hurl a basic fireball.", icon: "🔥", effects: { damage: 12, type: "Fire", target: "enemy" } },
              { name: "Flame Lash", manaCost: 18, description: "A whip of searing flames.", icon: "☄️", effects: { damage: 20, type: "Fire", target: "enemy" } },
              { name: "Cauterize", manaCost: 15, description: "Heal wounds with controlled fire.", icon: "❤️‍🔥", effects: { heal: 20, type: "Fire", target: "self" } }
            ];
        }

        // Define the skill action function if useSkillAction is available
        const skillAction = function(skill) {
          if (typeof window.useSkillAction === 'function') {
            window.useSkillAction(skill);
          } else {
            console.warn(`useSkillAction function not found for skill: ${skill.name}`);
            // Use the globally defined simpleSkillAction or fallback
            if (typeof window.simpleSkillAction === 'function') {
              window.simpleSkillAction(skill);
            } else {
              console.error(`Cannot execute skill ${skill.name}: action handler not available`);
              // Very basic fallback
              console.log(`Using skill: ${skill.name}`);
              if (typeof window.addLogMessage === 'function') {
                window.addLogMessage(`Player used ${skill.name}!`, 'combat-player');
              }
            }
          }
        };

        // Combine melee attack with elemental skills and add action function
        window.playerData.skills = [meleeAttack, ...elementalSkills].map(skill => ({
          ...skill,
          action: function() {
            skillAction(skill);
          }
        }));

        console.log(`Created ${window.playerData.skills.length} default skills for ${runeType} rune`);
        return true;
      } catch (error) {
        console.error("Error in createDefaultSkills:", error);
        return false;
      }
    }

    // Simple skill action implementation for global scope usage
    window.simpleSkillAction = function(skill) {
      try {
        console.log(`Using skill: ${skill.name}`);

        // Check for combat lock or game over
        if (window.gameOver || window.combatLock) {
          console.log("Game over or combat locked, cannot use skill");
          return;
        }

        // Check mana cost for non-melee skills
        if (skill.id !== "melee_attack" && window.playerData && window.playerData.mana < skill.manaCost) {
          if (typeof window.addLogMessage === 'function') {
            window.addLogMessage(`Not enough mana for ${skill.name}.`, 'warning');
          }
          console.log(`Not enough mana for ${skill.name}`);
          return;
        }

        // Add log message if the function exists
        if (typeof window.addLogMessage === 'function') {
          window.addLogMessage(`Player used ${skill.name}!`, 'combat-player');
        }

        // Basic implementation of effects for demo purposes
        if (skill.effects) {
          // Handle mana cost
          if (skill.manaCost > 0 && window.playerData) {
            window.playerData.mana = Math.max(0, window.playerData.mana - skill.manaCost);
          }
          
          // Handle damage
          if (skill.effects.damage && window.currentMonster) {
            const damage = skill.effects.damage;
            window.currentMonster.hp = Math.max(0, window.currentMonster.hp - damage);
            
            if (typeof window.addLogMessage === 'function') {
              window.addLogMessage(`${skill.name} deals ${damage} damage to ${window.currentMonster.name}!`, 'combat-player');
            }
            
            // Animation for damage
            const monsterSprite = document.getElementById('monster-sprite');
            if (monsterSprite) {
              monsterSprite.classList.add('damage-animation');
              setTimeout(() => {
                monsterSprite.classList.remove('damage-animation');
              }, 300);
            }
            
            // Check if monster defeated
            if (window.currentMonster.hp <= 0 && typeof window.monsterDefeated === 'function') {
              window.monsterDefeated();
            }
          }
          
          // Handle healing
          if (skill.effects.heal && window.playerData) {
            const healAmount = skill.effects.heal;
            const oldHp = window.playerData.hp;
            window.playerData.hp = Math.min(window.playerData.maxHp, window.playerData.hp + healAmount);
            
            if (typeof window.addLogMessage === 'function') {
              window.addLogMessage(`${skill.name} heals for ${window.playerData.hp - oldHp} HP!`, 'success');
            }
            
            // Animation for heal
            const playerAvatar = document.getElementById('player-avatar');
            if (playerAvatar) {
              playerAvatar.classList.add('heal-animation');
              setTimeout(() => {
                playerAvatar.classList.remove('heal-animation');
              }, 500);
            }
          }
          
          // Handle mana regeneration
          if (skill.effects.manaRegen && window.playerData) {
            const manaGained = Math.min(skill.effects.manaRegen, window.playerData.maxMana - window.playerData.mana);
            if (manaGained > 0) {
              window.playerData.mana += manaGained;
              
              if (typeof window.addLogMessage === 'function') {
                window.addLogMessage(`${skill.name} regenerates ${manaGained} MP!`, "mana-regen");
              }
            }
          }
        }
        
        // Update UI
        if (typeof window.updatePlayerStatsUI === 'function') {
          window.updatePlayerStatsUI();
        }
        
        if (typeof window.updateMonsterStatsUI === 'function') {
          window.updateMonsterStatsUI();
        }
        
        if (typeof window.updateSkillButtonsAvailability === 'function') {
          window.updateSkillButtonsAvailability();
        }
        
        // If it's not a melee attack and we have monster AI, trigger monster turn
        if (skill.id !== "melee_attack" && window.currentMonster && window.currentMonster.hp > 0) {
          window.isPlayerTurn = false;
          
          if (typeof window.monsterTurn === 'function') {
            setTimeout(() => {
              window.monsterTurn();
            }, 800);
          } else {
            // If monsterTurn doesn't exist, at least set player turn back to true
            setTimeout(() => {
              window.isPlayerTurn = true;
              
              if (typeof window.updateSkillButtonsAvailability === 'function') {
                window.updateSkillButtonsAvailability();
              }
            }, 800);
          }
        }

        console.log(`Skill ${skill.name} executed successfully`);
      } catch (error) {
        console.error(`Error executing skill ${skill.name}:`, error);
        // Set turn back to player if there was an error
        window.isPlayerTurn = true;
        if (typeof window.updateSkillButtonsAvailability === 'function') {
          window.updateSkillButtonsAvailability();
        }
      }
    };

    // Function to render skill buttons in the UI
    function fixSkillButtonsRendering() {
      try {
        // Make sure the player has skills
        if (!window.playerData || !window.playerData.skills || window.playerData.skills.length === 0) {
          console.warn("No skills to render!");
          return false;
        }

        // Get the skill buttons container
        const skillButtonsArea = document.getElementById('skill-buttons-area');
        if (!skillButtonsArea) {
          console.error("Skill buttons area not found in the DOM!");
          return false;
        }

        // Clear existing content
        skillButtonsArea.innerHTML = '';

        // Create buttons for each skill
        window.playerData.skills.forEach(skill => {
          const button = document.createElement('button');
          button.className = 'action-button skill-button';
          button.title = skill.description || '';

          if (skill.id === "melee_attack") {
            button.classList.add('melee-attack-button');
          }

          const iconSpan = document.createElement('span');
          iconSpan.className = 'skill-icon-placeholder';
          iconSpan.textContent = skill.icon || '❓';

          const nameSpan = document.createElement('span');
          nameSpan.className = 'skill-name-display';
          nameSpan.textContent = skill.name;

          const costSpan = document.createElement('span');
          costSpan.className = 'skill-cost-display';
          costSpan.textContent = skill.manaCost > 0 ? `(MP: ${skill.manaCost})` : '(Regen MP)';

          button.appendChild(iconSpan);
          button.appendChild(nameSpan);
          button.appendChild(costSpan);

          // Add click event
          button.onclick = function() {
            if (skill.action && typeof skill.action === 'function') {
              skill.action();
            } else if (typeof window.useSkillAction === 'function') {
              window.useSkillAction(skill);
            } else {
              console.warn(`No action found for skill: ${skill.name}`);
              // Using a globally defined simpleSkillAction function
              if (typeof window.simpleSkillAction === 'function') {
                window.simpleSkillAction(skill);
              } else {
                console.error(`Cannot execute skill ${skill.name}: action handler not found`);
              }
            }
          };

          skillButtonsArea.appendChild(button);
        });

        console.log(`Rendered ${window.playerData.skills.length} skill buttons`);

        // Update skill button availability if the function exists
        if (typeof window.updateSkillButtonsAvailability === 'function') {
          window.updateSkillButtonsAvailability();
        }

        return true;
      } catch (error) {
        console.error("Error in fixSkillButtonsRendering:", error);
        return false;
      }
    }

    // Function to fix game buttons event handlers
    function fixGameButtonsEventHandlers() {
      try {
        // Only run once
        if (window.gameButtonsFixed) {
          return true;
        }
        
        window.gameButtonsFixed = true;
        
        // Shop button
        const shopButton = document.getElementById('shop-button');
        if (shopButton) {
          shopButton.onclick = function() {
            if (typeof window.openShop === 'function') {
              window.openShop();
            } else {
              console.warn("openShop function not found");
              // Basic fallback for shop button
              const shopModal = document.getElementById('shop-modal');
              if (shopModal) {
                shopModal.style.display = 'flex';
                if (typeof window.addLogMessage === 'function') {
                  window.addLogMessage("Shop opened.", "info");
                }
              } else {
                alert("Shop will be available soon!");
              }
            }
          };
        }

        // Rune swap button
        const runeSwapButton = document.getElementById('rune-swap-btn');
        if (runeSwapButton) {
          runeSwapButton.onclick = function() {
            if (typeof window.openRuneSwapModal === 'function') {
              window.openRuneSwapModal();
            } else {
              console.warn("openRuneSwapModal function not found");
              // Basic fallback for rune swap button
              const runeSwapModal = document.getElementById('rune-swap-modal');
              if (runeSwapModal) {
                runeSwapModal.style.display = 'flex';
                if (typeof window.addLogMessage === 'function') {
                  window.addLogMessage("Rune swap opened.", "info");
                }
              } else {
                alert("Rune swapping will be available after defeating a boss!");
              }
            }
          };
        }

        // Inventory button
        const inventoryButton = document.getElementById('inventory-button');
        if (inventoryButton) {
          inventoryButton.onclick = function() {
            if (typeof window.openInventory === 'function') {
              window.openInventory();
            } else {
              console.warn("openInventory function not found");
              // Basic fallback for inventory button
              const inventoryModal = document.getElementById('inventory-modal');
              if (inventoryModal) {
                inventoryModal.style.display = 'flex';
                if (typeof window.addLogMessage === 'function') {
                  window.addLogMessage("Inventory opened.", "info");
                }
              } else {
                alert("Inventory will be available soon!");
              }
            }
          };
        }

        // Battle button
        const battleButton = document.getElementById('leave-town-button');
        if (battleButton) {
          battleButton.onclick = function() {
            if (typeof window.showAreaSelection === 'function') {
              window.showAreaSelection();
            } else if (typeof window.spawnNewMonster === 'function') {
              window.spawnNewMonster();
            } else if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') {
              window.ScreenManager.activateScreen('area-selection-screen');
            } else {
              console.warn("No battle function found");
              alert("Battle function not available!");
            }
          };
        }

        console.log("Fixed game button event handlers");
        return true;
      } catch (error) {
        console.error("Error in fixGameButtonsEventHandlers:", error);
        return false;
      }
    }

    // Fix player UI updates
    function fixPlayerUI() {
      try {
        // Make sure player data is shown on the UI
        if (typeof window.updatePlayerStatsUI === 'function') {
          window.updatePlayerStatsUI();
        } else {
          // Simple player stats update if the function doesn't exist
          updatePlayerStats();
        }

        console.log("Fixed player UI update");
        return true;
      } catch (error) {
        console.error("Error in fixPlayerUI:", error);
        return false;
      }
    }

    // Simple player stats update function if the original is missing
    function updatePlayerStats() {
      try {
        if (!window.playerData) return false;

        // Update player level
        const playerLevelDisplay = document.getElementById('player-level');
        if (playerLevelDisplay) {
          playerLevelDisplay.textContent = window.playerData.level || 1;
        }

        // Update player gold
        const playerGoldDisplay = document.getElementById('player-gold');
        if (playerGoldDisplay) {
          playerGoldDisplay.textContent = window.playerData.gold || 0;
        }

        // Update player rune
        const playerRuneDisplay = document.getElementById('player-rune-display');
        if (playerRuneDisplay) {
          playerRuneDisplay.textContent = window.playerData.rune || 'None';
        }

        // Update player HP
        const playerHpText = document.getElementById('player-hp-text');
        const playerHpFill = document.getElementById('player-hp-fill');
        if (playerHpText && playerHpFill) {
          playerHpText.textContent = `${window.playerData.hp || 0}/${window.playerData.maxHp || 100}`;
          const hpPercent = Math.max(0, ((window.playerData.hp || 0) / (window.playerData.maxHp || 100)) * 100);
          playerHpFill.style.width = `${hpPercent}%`;
        }

        // Update player MP
        const playerManaText = document.getElementById('player-mana-text');
        const playerManaFill = document.getElementById('player-mana-fill');
        if (playerManaText && playerManaFill) {
          playerManaText.textContent = `${window.playerData.mana || 0}/${window.playerData.maxMana || 50}`;
          const manaPercent = Math.max(0, ((window.playerData.mana || 0) / (window.playerData.maxMana || 50)) * 100);
          playerManaFill.style.width = `${manaPercent}%`;
        }

        // Update player EXP
        const playerExpText = document.getElementById('player-exp-text');
        const playerExpFill = document.getElementById('player-exp-fill');
        if (playerExpText && playerExpFill) {
          playerExpText.textContent = `${window.playerData.exp || 0}/${window.playerData.nextLevelExp || 100}`;
          const expPercent = Math.max(0, ((window.playerData.exp || 0) / (window.playerData.nextLevelExp || 100)) * 100);
          playerExpFill.style.width = `${expPercent}%`;
        }

        // Update player attack and defense
        const playerAttackDisplay = document.getElementById('player-attack');
        const playerDefenseDisplay = document.getElementById('player-defense');
        if (playerAttackDisplay) {
          playerAttackDisplay.textContent = window.playerData.attackPower || 7;
        }
        if (playerDefenseDisplay) {
          playerDefenseDisplay.textContent = window.playerData.defense || 3;
        }
        
        return true;
      } catch (error) {
        console.error("Error in updatePlayerStats:", error);
        return false;
      }
    }

    // Execute all fixes
    let success = true;
    
    // Fix game buttons first (these are least likely to depend on other things)
    if (!fixGameButtonsEventHandlers()) {
      console.warn("Failed to fix game buttons, but continuing with other fixes");
      success = false;
    }
    
    // Fix player skills
    if (!fixPlayerSkills()) {
      console.warn("Failed to fix player skills, but continuing with other fixes");
      success = false;
    }
    
    // Fix player UI
    if (!fixPlayerUI()) {
      console.warn("Failed to fix player UI, but continuing");
      success = false;
    }
    
    // Make the fixSkillButtonsRendering function available globally
    window.fixSkillButtonsRendering = fixSkillButtonsRendering;
    
    // Mark this component as initialized
    if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
      window.gameInitRegistry.markInitialized('skillButtons');
    }
    
    // Clear any safety timeout that might have been set by the coordinator
    if (window.currentInitTimeout) {
      clearTimeout(window.currentInitTimeout);
      window.currentInitTimeout = null;
    }
    
    console.log("Skill buttons initialization completed");
    return success;
  } catch (error) {
    console.error("Critical error in skill buttons initialization:", error);
    // Try to mark as initialized anyway to allow other components to load
    if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
      window.gameInitRegistry.markInitialized('skillButtons');
    }
    return false;
  }
}

// Initialize based on the init-component event
document.addEventListener('init-component', function(e) {
  if (e.detail && e.detail.component === 'skillButtons') {
    console.log("Received init-component event for skillButtons");
    initializeSkillButtons();
  }
});

// Also initialize on DOMContentLoaded as a fallback
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (!skillButtonsInitialized) {
      console.warn("Skill buttons not initialized by coordinator, using DOMContentLoaded fallback");
      initializeSkillButtons();
    }
  }, 1500);
});