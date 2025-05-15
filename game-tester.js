/**
 * Game Tester Script
 * This script provides utility functions to test your game's functionality
 */

// Self-executing function to avoid global namespace pollution
(function() {
  console.log("Initializing game tester utilities...");
  
  // Expose a set of testing functions to the window object
  window.GameTester = {
    // Test all critical game functions
    testAllFunctions: function() {
      console.log("🧪 Running full game function test suite...");
      let results = {
        criticalFunctions: this.testCriticalFunctions(),
        playerData: this.testPlayerData(),
        monsterData: this.testMonsterFunctions(),
        uiElements: this.testUIElements()
      };
      
      console.log("📊 Test results summary:");
      console.table(results);
      
      // Display results in game log
      if (typeof window.addLogMessage === 'function') {
        window.addLogMessage("Game functionality test complete!", "info");
        for (const [category, status] of Object.entries(results)) {
          window.addLogMessage(`${category}: ${status ? "✅ PASS" : "❌ FAIL"}`, status ? "success" : "error");
        }
      }
      
      return results;
    },
    
    // Test critical game functions
    testCriticalFunctions: function() {
      console.log("🧪 Testing critical functions...");
      let missingFunctions = [];
      
      // List of critical functions to test
      const criticalFunctions = [
        'addLogMessage',
        'updatePlayerStatsUI',
        'updateSkillButtonsAvailability',
        'useSkillAction',
        'enterTown',
        'spawnNewMonster'
      ];
      
      criticalFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
          console.error(`❌ Missing critical function: ${func}`);
          missingFunctions.push(func);
        } else {
          console.log(`✅ Found function: ${func}`);
        }
      });
      
      const result = missingFunctions.length === 0;
      console.log(`Critical function test ${result ? "passed" : "failed"}`);
      return result;
    },
    
    // Test player data
    testPlayerData: function() {
      console.log("🧪 Testing player data...");
      
      if (!window.playerData) {
        console.error("❌ playerData object is missing");
        return false;
      }
      
      // Check required player data properties
      const requiredProps = [
        'rune', 'level', 'hp', 'maxHp', 'mana', 'maxMana', 
        'exp', 'nextLevelExp', 'gold', 'skills', 'attackPower', 
        'defense'
      ];
      
      let missingProps = [];
      requiredProps.forEach(prop => {
        if (window.playerData[prop] === undefined) {
          console.error(`❌ Missing required property: playerData.${prop}`);
          missingProps.push(prop);
        }
      });
      
      // Check skills
      if (!window.playerData.skills || window.playerData.skills.length === 0) {
        console.error("❌ Player has no skills defined");
        missingProps.push('skills (empty)');
      } else {
        console.log(`✅ Player has ${window.playerData.skills.length} skills`);
      }
      
      const result = missingProps.length === 0;
      console.log(`Player data test ${result ? "passed" : "failed"}`);
      return result;
    },
    
    // Test monster functions
    testMonsterFunctions: function() {
      console.log("🧪 Testing monster functions and data...");
      
      // Check if monster templates exist
      if (!window.monsterTemplates || window.monsterTemplates.length === 0) {
        console.error("❌ Monster templates are missing or empty");
        return false;
      }
      
      console.log(`✅ Found ${window.monsterTemplates.length} monster templates`);
      
      // Check if monster sprites exist
      if (!window.monsterSprites) {
        console.error("❌ Monster sprites object is missing");
        return false;
      }
      
      // Check if we can spawn a monster
      try {
        // Save current monster if there is one
        const savedMonster = window.currentMonster;
        
        // Test monster spawning
        if (typeof window.spawnNewMonster !== 'function') {
          console.error("❌ spawnNewMonster function is missing");
          return false;
        }
        
        window.spawnNewMonster();
        
        if (!window.currentMonster) {
          console.error("❌ Failed to spawn a monster");
          return false;
        }
        
        console.log(`✅ Successfully spawned a ${window.currentMonster.name}`);
        
        // Restore original monster if there was one
        window.currentMonster = savedMonster;
        
        return true;
      } catch (error) {
        console.error("❌ Error testing monster functions:", error);
        return false;
      }
    },
    
    // Test UI elements
    testUIElements: function() {
      console.log("🧪 Testing UI elements...");
      
      // List of critical UI elements
      const criticalElements = [
        'game-screen',
        'player-rune-display',
        'player-level',
        'player-gold',
        'player-hp-fill',
        'player-mana-fill',
        'player-exp-fill',
        'skill-buttons-area',
        'monster-name',
        'monster-type',
        'monster-hp-fill',
        'game-log'
      ];
      
      let missingElements = [];
      
      criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
          console.error(`❌ Missing critical UI element: #${id}`);
          missingElements.push(id);
        }
      });
      
      // Check if skill buttons are rendered
      const skillButtonsArea = document.getElementById('skill-buttons-area');
      if (skillButtonsArea) {
        const skillButtons = skillButtonsArea.querySelectorAll('.skill-button');
        if (skillButtons.length === 0) {
          console.error("❌ No skill buttons found in skill-buttons-area");
          missingElements.push('skill-buttons');
        } else {
          console.log(`✅ Found ${skillButtons.length} skill buttons`);
        }
      }
      
      const result = missingElements.length === 0;
      console.log(`UI elements test ${result ? "passed" : "failed"}`);
      return result;
    },
    
    // Fix most common issues
    fixCommonIssues: function() {
      console.log("🔧 Attempting to fix common issues...");
      
      // Fix missing skill buttons
      if (window.playerData && (!window.playerData.skills || window.playerData.skills.length === 0)) {
        console.log("🔧 Fixing missing skills...");
        
        // Try to call the original definePlayerSkills function
        if (typeof window.definePlayerSkills === 'function') {
          window.definePlayerSkills(window.playerData.rune || 'Fire');
        }
        
        // If still no skills, try to load the fix script
        if (!window.playerData.skills || window.playerData.skills.length === 0) {
          console.log("🔧 Loading skill buttons fix script...");
          
          // This code is a very basic version of the skill-buttons-fix.js
          // It directly defines some basic skills rather than loading the entire fix
          const runeType = window.playerData.rune || 'Fire';
          window.playerData.skills = [
            { 
              id: "melee_attack", 
              name: "Melee",
              manaCost: 0,
              description: "A basic attack that deals physical damage.",
              icon: "⚔️",
              effects: { damageBasePercent: 1.0, type: "Normal", target: "enemy", manaRegen: 8 },
              action: function() { 
                if (typeof window.useSkillAction === 'function') {
                  window.useSkillAction(this);
                }
              }
            },
            {
              name: "Fire Strike", 
              manaCost: 10, 
              description: "A basic fire attack.",
              icon: "🔥",
              effects: { damage: 12, type: runeType, target: "enemy" },
              action: function() {
                if (typeof window.useSkillAction === 'function') {
                  window.useSkillAction(this);
                }
              }
            }
          ];
        }
        
        // Render the skills
        if (typeof window.renderSkillButtons === 'function') {
          window.renderSkillButtons();
        } else {
          // Simple render function
          const skillButtonsArea = document.getElementById('skill-buttons-area');
          if (skillButtonsArea && window.playerData.skills) {
            skillButtonsArea.innerHTML = '';
            window.playerData.skills.forEach(skill => {
              const button = document.createElement('button');
              button.className = 'action-button skill-button';
              button.title = skill.description || '';
              
              button.innerHTML = `
                <span class="skill-icon-placeholder">${skill.icon || '❓'}</span>
                <span class="skill-name-display">${skill.name}</span>
                <span class="skill-cost-display">${skill.manaCost > 0 ? `(MP: ${skill.manaCost})` : '(Regen MP)'}</span>
              `;
              
              button.onclick = skill.action;
              skillButtonsArea.appendChild(button);
            });
          }
        }
      }
      
      // Fix battle button
      const battleButton = document.getElementById('leave-town-button');
      if (battleButton) {
        battleButton.onclick = function() {
          if (typeof window.spawnNewMonster === 'function') {
            window.spawnNewMonster();
          } else if (typeof window.showAreaSelection === 'function') {
            window.showAreaSelection();
          } else {
            console.log("Cannot find battle function, adding basic functionality");
            // Basic monster spawn
            window.currentMonster = {
              name: "Training Dummy",
              type: "Normal",
              hp: 50,
              maxHp: 50,
              attack: 5,
              defense: 2,
              expReward: 10,
              goldReward: 5
            };
            
            // Update UI
            const monsterNameDisplay = document.getElementById('monster-name');
            if (monsterNameDisplay) monsterNameDisplay.textContent = window.currentMonster.name;
            
            const monsterTypeDisplay = document.getElementById('monster-type');
            if (monsterTypeDisplay) monsterTypeDisplay.textContent = window.currentMonster.type;
            
            const monsterHpText = document.getElementById('monster-hp-text');
            if (monsterHpText) monsterHpText.textContent = `${window.currentMonster.hp}/${window.currentMonster.maxHp}`;
            
            const monsterHpFill = document.getElementById('monster-hp-fill');
            if (monsterHpFill) monsterHpFill.style.width = "100%";
            
            // Add log message
            if (typeof window.addLogMessage === 'function') {
              window.addLogMessage("A Training Dummy appeared!", "event");
            }
          }
        };
      }
      
      // Fix shop, inventory, and rune swap buttons
      const shopButton = document.getElementById('shop-button');
      if (shopButton) {
        shopButton.onclick = function() {
          const shopModal = document.getElementById('shop-modal');
          if (shopModal) shopModal.style.display = 'flex';
        };
      }
      
      const inventoryButton = document.getElementById('inventory-button');
      if (inventoryButton) {
        inventoryButton.onclick = function() {
          const inventoryModal = document.getElementById('inventory-modal');
          if (inventoryModal) inventoryModal.style.display = 'flex';
        };
      }
      
      const runeSwapButton = document.getElementById('rune-swap-btn');
      if (runeSwapButton) {
        runeSwapButton.onclick = function() {
          const runeSwapModal = document.getElementById('rune-swap-modal');
          if (runeSwapModal) runeSwapModal.style.display = 'flex';
        };
      }
      
      // Fix player UI update
      if (typeof window.updatePlayerStatsUI !== 'function') {
        window.updatePlayerStatsUI = function() {
          if (!window.playerData) return;
          
          // Update player level and gold
          const playerLevelDisplay = document.getElementById('player-level');
          if (playerLevelDisplay) playerLevelDisplay.textContent = window.playerData.level || 1;
          
          const playerGoldDisplay = document.getElementById('player-gold');
          if (playerGoldDisplay) playerGoldDisplay.textContent = window.playerData.gold || 0;
          
          // Update bars
          const updateBar = (textEl, fillEl, currentValue, maxValue) => {
            const text = document.getElementById(textEl);
            const fill = document.getElementById(fillEl);
            if (text) text.textContent = `${currentValue}/${maxValue}`;
            if (fill) fill.style.width = `${Math.max(0, (currentValue / maxValue) * 100)}%`;
          };
          
          updateBar('player-hp-text', 'player-hp-fill', 
                   window.playerData.hp || 0, 
                   window.playerData.maxHp || 100);
                   
          updateBar('player-mana-text', 'player-mana-fill', 
                   window.playerData.mana || 0, 
                   window.playerData.maxMana || 50);
                   
          updateBar('player-exp-text', 'player-exp-fill', 
                   window.playerData.exp || 0, 
                   window.playerData.nextLevelExp || 100);
        };
      }
      
      // Update UI
      if (typeof window.updatePlayerStatsUI === 'function') {
        window.updatePlayerStatsUI();
      }
      
      console.log("🔧 Common issues fix attempted!");
      
      // Run tests again to see if fixes helped
      return this.testAllFunctions();
    },
    
    // Spawn a test monster
    spawnTestMonster: function() {
      console.log("🦄 Spawning test monster...");
      
      // Create a basic test monster
      window.currentMonster = {
        name: "Test Creature",
        type: window.playerData?.rune || "Normal",
        hp: 50,
        maxHp: 50,
        attack: 5,
        defense: 2,
        expReward: 10,
        goldReward: 5
      };
      
      // Update monster UI
      const monsterNameDisplay = document.getElementById('monster-name');
      if (monsterNameDisplay) monsterNameDisplay.textContent = window.currentMonster.name;
      
      const monsterTypeDisplay = document.getElementById('monster-type');
      if (monsterTypeDisplay) monsterTypeDisplay.textContent = window.currentMonster.type;
      
      const monsterLevelDisplay = document.getElementById('monster-level');
      if (monsterLevelDisplay) monsterLevelDisplay.textContent = window.playerData?.level || 1;
      
      const monsterHpText = document.getElementById('monster-hp-text');
      if (monsterHpText) monsterHpText.textContent = `${window.currentMonster.hp}/${window.currentMonster.maxHp}`;
      
      const monsterHpFill = document.getElementById('monster-hp-fill');
      if (monsterHpFill) monsterHpFill.style.width = "100%";
      
      // Add log message
      if (typeof window.addLogMessage === 'function') {
        window.addLogMessage(`A ${window.currentMonster.name} appeared!`, "event");
      }
      
      console.log("🦄 Test monster spawned successfully!");
      return true;
    }
  };
  
  // Add a button to run tests in the game UI
  function addTestButton() {
    const existingButton = document.getElementById('game-tester-button');
    if (existingButton) return;
    
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;
    
    const testButton = document.createElement('button');
    testButton.id = 'game-tester-button';
    testButton.textContent = '🧪 Run Tests';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = 9999;
    testButton.style.padding = '5px 10px';
    testButton.style.backgroundColor = '#8A2BE2';
    testButton.style.color = 'white';
    testButton.style.border = '2px solid #6A0DAD';
    testButton.style.borderRadius = '5px';
    testButton.style.fontFamily = 'monospace';
    testButton.style.cursor = 'pointer';
    
    testButton.onclick = function() {
      window.GameTester.testAllFunctions();
    };
    
    document.body.appendChild(testButton);
    
    // Also add a fix button
    const fixButton = document.createElement('button');
    fixButton.id = 'game-fix-button';
    fixButton.textContent = '🔧 Fix Issues';
    fixButton.style.position = 'fixed';
    fixButton.style.bottom = '10px';
    fixButton.style.right = '100px';
    fixButton.style.zIndex = 9999;
    fixButton.style.padding = '5px 10px';
    fixButton.style.backgroundColor = '#4CAF50';
    fixButton.style.color = 'white';
    fixButton.style.border = '2px solid #3E8E41';
    fixButton.style.borderRadius = '5px';
    fixButton.style.fontFamily = 'monospace';
    fixButton.style.cursor = 'pointer';
    
    fixButton.onclick = function() {
      window.GameTester.fixCommonIssues();
    };
    
    document.body.appendChild(fixButton);
    
    // Add a spawn monster button
    const spawnButton = document.createElement('button');
    spawnButton.id = 'spawn-monster-button';
    spawnButton.textContent = '🦄 Spawn Test Monster';
    spawnButton.style.position = 'fixed';
    spawnButton.style.bottom = '10px';
    spawnButton.style.right = '210px';
    spawnButton.style.zIndex = 9999;
    spawnButton.style.padding = '5px 10px';
    spawnButton.style.backgroundColor = '#FF5722';
    spawnButton.style.color = 'white';
    spawnButton.style.border = '2px solid #E64A19';
    spawnButton.style.borderRadius = '5px';
    spawnButton.style.fontFamily = 'monospace';
    spawnButton.style.cursor = 'pointer';
    
    spawnButton.onclick = function() {
      window.GameTester.spawnTestMonster();
    };
    
    document.body.appendChild(spawnButton);
  }
  
  // Run when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
  } else {
    // DOM already loaded
    addTestButton();
  }
  
  // Also run after a delay to ensure everything is loaded
  setTimeout(addTestButton, 1000);
  
  console.log("Game tester utilities initialized! Access via window.GameTester");
})();