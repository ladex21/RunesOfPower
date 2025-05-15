"use strict"; // Enforce stricter parsing and error handling

// --- ABSOLUTELY CRITICAL GLOBAL DATA STRUCTURES ---
// These MUST be defined first, before any functions or listeners that might use them.

// Initialize playerData globally and immediately.
window.playerData = {
    rune: null,
    level: 1,
    hp: 100, // Will be overridden by PLAYER_BASE_HP shortly
    maxHp: 100,
    mana: 50, // Will be overridden by PLAYER_BASE_MANA shortly
    maxMana: 50,
    exp: 0,
    nextLevelExp: 100, // Will be overridden by INITIAL_EXP_TO_LEVEL
    gold: 30,
    skills: [],
    avatar: "", // Will be set properly in setupPlayerWithRune
    attackPower: 7, // Will be overridden by PLAYER_BASE_ATTACK_POWER
    defense: 3,   // Will be overridden by PLAYER_BASE_DEFENSE
    statusEffects: [],
    inventory: [],
    unlockedRunes: [],
    equipment: { weapon: null, shield: null, armor: null, accessory: null },
    hasRevivalStone: false,
    elementalBoostPercent: 0,
    skillMastery: {}
};

// Define heroAvatars globally and immediately.
const heroAvatars = {
    Default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%238A2BE2'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E✧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EHERO%3C/text%3E%3C/svg%3E",
    Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FF6347'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3EFIRE%3C/text%3E%3C/svg%3E",
    Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234682B4'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EWATER%3C/text%3E%3C/svg%3E",
    Nature: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233CB371'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3ENATURE%3C/text%3E%3C/svg%3E",
    Light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FFFACD'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='black' text-anchor='middle'%3ELIGHT%3C/text%3E%3C/svg%3E",
    Dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234B0082'/%3E%3Ctext x='50' y='45' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌑%3C/text%3E%3Ctext x='50' y='75' font-family='Arial' font-size='15' fill='white' text-anchor='middle'%3EDARK%3C/text%3E%3C/svg%3E"
};

// --- Global Game State Variables (Declare & Initialize) ---
window.gameOver = false;
window.combatLock = false;
window.isPlayerTurn = true;
window.currentMonster = null;
window.regularMonsterDefeatCount = 0;
window.currentArea = 'town'; // Default area

// --- DOM Element Variables (Declared here, assigned later in assignDOMElements) ---
let runeSelectionScreen, gameScreen, areaSelectionScreen, fireRuneButton, waterRuneButton,
    natureRuneButton, lightRuneButton, darkRuneButton, playerRuneDisplay, playerLevelDisplay,
    playerGoldDisplay, playerHpText, playerHpFill, playerManaText, playerManaFill,
    playerExpText, playerExpFill, playerAvatar, playerAttackDisplay, playerDefenseDisplay,
    monsterNameDisplay, monsterTypeDisplay, monsterLevelDisplay, monsterHpText, monsterHpFill,
    monsterSprite, gameLog, skillButtonsArea, shopButton, runeSwapButton, inventoryButton,
    monstersDefeatedCounter, nextBossCounter, leaveTownButton, shopModal, shopPlayerGoldDisplay,
    shopItemsContainer, closeShopButton, modalCloseButtonX, shopTabs, inventoryModal,
    inventoryItemsContainer, equipmentSlotsContainer, inventoryModalCloseButtonX,
    closeInventoryButton, runeSwapModal, currentActiveRuneDisplay, unlockedRunesContainer,
    runeSwapModalCloseButtonX, closeRuneSwapModalButton, levelUpModal, newLevelDisplay,
    oldHpDisplay, newHpDisplay, oldMpDisplay, newMpDisplay, oldAttackDisplay, newAttackDisplay,
    oldDefenseDisplay, newDefenseDisplay, closeLevelUpModalButton, errorLogDisplay,
    errorMessageSpan, errorExpandButton, errorDetails, errorStack, errorHistoryButton,
    areaSelectionBackButton;

let runeButtons = [];

// --- START: Early Error Setup ---
let earlyErrorHandlersInitialized = false;
function initializeEarlyErrorDisplay() {
    // ... (Keep the exact same initializeEarlyErrorDisplay function from script_js_complete_v1_part3_4)
    // This function should only assign errorLogDisplay, errorMessageSpan, etc.
    // and call initializeErrorLogger and setupGlobalErrorHandlers if they exist.
    if (earlyErrorHandlersInitialized) return true;
    console.log("Script.js: Initializing early error display system...");
    try {
        errorLogDisplay = document.getElementById('error-log-display');
        errorMessageSpan = document.getElementById('error-message-span');
        errorExpandButton = document.getElementById('error-expand-button');
        errorDetails = document.getElementById('error-details');
        errorStack = document.getElementById('error-stack');

        if (!errorLogDisplay || !errorMessageSpan) {
            console.error("Script.js: Critical error log UI elements missing for early display.");
            alert("CRITICAL UI ERROR: Error display components missing.");
            return false;
        }
        // These functions (initializeErrorLogger, setupGlobalErrorHandlers) will be defined later in this script.
        // If they are called here, ensure they are robust enough or only perform DOM assignments.
        // For now, we'll assume they are defined later and this early setup focuses on element acquisition.
        // If initializeErrorLogger itself tries to use other not-yet-defined things, it could fail.
        // It's safer to have initializeErrorLogger and setupGlobalErrorHandlers defined *before* this.
        // Let's ensure their definitions are moved up.
        
        // Fallback definitions if not provided by other scripts or later in this one.
        if (typeof window.initializeErrorLogger !== 'function') {
            window.initializeErrorLogger = function() {
                if (errorLogDisplay && errorExpandButton && errorDetails) {
                    errorLogDisplay.style.display = 'none';
                    errorExpandButton.onclick = () => {
                        const isExpanded = errorDetails.style.display === 'block';
                        errorDetails.style.display = isExpanded ? 'none' : 'block';
                        errorExpandButton.textContent = isExpanded ? 'Details' : 'Hide';
                    };
                }
            };
        }
        initializeErrorLogger();
        
        if (typeof window.setupGlobalErrorHandlers !== 'function') {
            window.setupGlobalErrorHandlers = function() {
                window.onerror = (msg, src, line, col, err) => { if(typeof showError === 'function') showError(`Unhandled: ${msg} @ ${src}:${line}`, err); return true; };
                window.onunhandledrejection = evt => { if(typeof showError === 'function') showError(`Unhandled Promise: ${evt.reason}`, evt.reason); };
            };
        }
        setupGlobalErrorHandlers();


        earlyErrorHandlersInitialized = true;
        console.log("Script.js: Early error display system initialized.");
        return true;
    } catch (e) {
        console.error("Script.js: CRITICAL FAILURE in initializeEarlyErrorDisplay:", e.message, e.stack);
        alert("FATAL SCRIPT ERROR: Could not set up early error display. " + e.message);
        return false;
    }
}
document.addEventListener('init-component', function(e) {
    if (e.detail && e.detail.component === 'scriptErrorSetup') {
        if (initializeEarlyErrorDisplay()) {
            if (window.gameInitRegistry && typeof window.gameInitRegistry.markInitialized === 'function') {
                window.gameInitRegistry.markInitialized('scriptErrorSetup');
            }
        }
    }
});
// --- END: Early Error Setup ---

// --- ALL OTHER GAME DATA CONSTANTS ---
// These can come after the critical playerData and heroAvatars.

const PLAYER_BASE_HP = 100;
// playerData.hp = PLAYER_BASE_HP; // Initialize with constants
// playerData.maxHp = PLAYER_BASE_HP;

const PLAYER_HP_PER_LEVEL = 34;
const PLAYER_BASE_MANA = 55;
// playerData.mana = PLAYER_BASE_MANA;
// playerData.maxMana = PLAYER_BASE_MANA;

const PLAYER_MANA_PER_LEVEL = 15;
const PLAYER_BASE_ATTACK_POWER = 7;
// playerData.attackPower = PLAYER_BASE_ATTACK_POWER;

const PLAYER_ATTACK_POWER_PER_LEVEL = 4;
const PLAYER_BASE_DEFENSE = 3;
// playerData.defense = PLAYER_BASE_DEFENSE;

const PLAYER_DEFENSE_PER_LEVEL = 2;
const PLAYER_SKILL_DAMAGE_SCALING_FACTOR = 3.5;
const PLAYER_HEAL_SCALING_FACTOR = 3.0;

const MONSTER_ATTACK_SCALING_PER_PLAYER_LEVEL = 1.4;
const MONSTER_DEFENSE_SCALING_PER_PLAYER_LEVEL = 0.8;
const MONSTER_HP_SCALING_PER_PLAYER_LEVEL = 8;

const BOSS_MONSTER_INTERVAL = 10;

const MELEE_ATTACK_ID = "melee_attack";
const MELEE_MANA_REGEN = 9;
const MELEE_DAMAGE_BASE_PERCENT_OF_ATTACK = 1.0;

const HEAL_ON_DEFEAT_PERCENT_HP = 0.35;
const REGEN_ON_DEFEAT_PERCENT_MANA = 0.40;

const INITIAL_EXP_TO_LEVEL = 50;
// playerData.nextLevelExp = INITIAL_EXP_TO_LEVEL;

const EXP_CURVE_FACTOR = 1.23;
const EXP_CURVE_FLAT_ADDITION = 20;

// Re-initialize parts of playerData with these constants now that they are defined
playerData.hp = PLAYER_BASE_HP;
playerData.maxHp = PLAYER_BASE_HP;
playerData.mana = PLAYER_BASE_MANA;
playerData.maxMana = PLAYER_BASE_MANA;
playerData.attackPower = PLAYER_BASE_ATTACK_POWER;
playerData.defense = PLAYER_BASE_DEFENSE;
playerData.nextLevelExp = INITIAL_EXP_TO_LEVEL;


const runeIcons = { /* ... (same as before) ... */ 
    Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23FF6347'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3C/svg%3E",
    Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234682B4'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3C/svg%3E",
    Nature: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%233CB371'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3C/svg%3E",
    Light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23FFFACD'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3C/svg%3E",
    Dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234B0082'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌑%3C/text%3E%3C/svg%3E"
};
const monsterSprites = { /* ... (same as before) ... */ 
    TinyFlameImp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23FF7F50'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EIMP%3C/text%3E%3C/svg%3E",
    PuddleSprite: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23ADD8E6'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EPUDDLE%3C/text%3E%3C/svg%3E",
    ForestWisp: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%2390EE90'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EWISP%3C/text%3E%3C/svg%3E",
    ShadowPup: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23A9A9A9'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌑%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EPUP%3C/text%3E%3C/svg%3E",
    SunSeeker: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23FFFFE0'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3ESEEKER%3C/text%3E%3C/svg%3E",
    StoneGolem: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23BDB76B'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E⛰️%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EGOLEM%3C/text%3E%3C/svg%3E",
    BlazeHound: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23FF4500'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EHOUND%3C/text%3E%3C/svg%3E",
    GronkBoss: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%238B4513'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌋%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EGRONK%3C/text%3E%3C/svg%3E",
    VoidmawBoss: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%232F002F'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3E👾%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EVOIDMAW%3C/text%3E%3C/svg%3E",
    DefaultMonster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23708090'/%3E%3Ctext x='120' y='120' font-family='Arial' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle'%3E😈%3C/text%3E%3C/svg%3E",
    Victory: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%2377DD77'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='80' fill='black' text-anchor='middle' dominant-baseline='middle'%3E😎%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='black' text-anchor='middle'%3EWIN!%3C/text%3E%3C/svg%3E",
    GameOver: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23808080'/%3E%3Ctext x='120' y='100' font-family='Arial' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle'%3E😵%3C/text%3E%3Ctext x='120' y='160' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EGAME OVER%3C/text%3E%3C/svg%3E"
};
const ELEMENTAL_TYPES = { /* ... (same as before) ... */ 
    Fire:    { color: '#FF6347', textColor: '#FFFFFF', icon: '🔥', strong: ['Nature', 'Ice', 'Metal'], weak: ['Water', 'Earth', 'Rock'], neutral: ['Fire', 'Light', 'Dark', 'Lightning', 'Karma'] },
    Water:   { color: '#4682B4', textColor: '#FFFFFF', icon: '💧', strong: ['Fire', 'Earth', 'Rock'],  weak: ['Nature', 'Ice', 'Lightning'], neutral: ['Water', 'Light', 'Dark', 'Poison', 'Karma'] },
    Nature:  { color: '#3CB371', textColor: '#FFFFFF', icon: '🌿', strong: ['Water', 'Earth', 'Rock'],  weak: ['Fire', 'Ice', 'Poison', 'Flying'], neutral: ['Nature', 'Light', 'Dark', 'Karma'] },
    Light:   { color: '#FFFACD', textColor: '#000000', icon: '✨', strong: ['Dark', 'Chaos', 'Undead'],weak: ['Void', 'Metal'], neutral: ['Fire', 'Water', 'Nature', 'Earth', 'Ice', 'Lightning'] },
    Dark:    { color: '#4B0082', textColor: '#FFFFFF', icon: '🌑', strong: ['Light','Psychic','Spirit'],weak: ['Light', 'Holy', 'Pure'], neutral: ['Fire', 'Water', 'Nature', 'Earth', 'Ice', 'Lightning'] },
    Earth:   { color: '#8B4513', textColor: '#FFFFFF', icon: '⛰️', strong: ['Lightning','Poison','Metal','Fire'], weak: ['Nature','Water','Ice'], neutral: ['Earth', 'Light', 'Dark'] },
    Ice:     { color: '#E0FFFF', textColor: '#000000', icon: '❄️', strong: ['Nature','Flying','Dragon','Water'], weak: ['Fire','Metal','Fighting'], neutral: ['Ice', 'Light', 'Dark'] },
    Lightning:{ color: '#FFD700', textColor: '#000000', icon: '⚡', strong: ['Water','Metal','Flying'],  weak: ['Earth','Rock','Nature'], neutral: ['Lightning', 'Fire', 'Ice', 'Light', 'Dark'] },
    Normal:  { color: '#A9A9A9', textColor: '#FFFFFF', icon: '⚪', strong: [], weak: ['Rock', 'Metal'], neutral: ['Normal', 'Fire', 'Water', 'Nature', 'Light', 'Dark', 'Earth', 'Ice', 'Lightning'] }
};
const GAME_AREAS = { /* ... (same as before) ... */ 
    town: { name: "Runehaven", description: "A small town where adventurers gather.", backgroundImage: "https://placehold.co/800x200/7B9E89/FFFFFF?text=Runehaven&font=pressstart2p", shops: ["generalStore", "magicEmporium", "blacksmith"], monsters: [], isSafe: true },
    forest: { name: "Whispering Woods", description: "An ancient forest.", backgroundImage: "https://placehold.co/800x200/2E8B57/FFFFFF?text=Whispering+Woods&font=pressstart2p", shops: [], monsters: ["Forest Wisp", "Vine Crawler"], isSafe: false, recommendedLevel: 1, dominantElement: "Nature" },
    volcano: { name: "Ember Peaks", description: "An active volcano.", backgroundImage: "https://placehold.co/800x200/B22222/FFFFFF?text=Ember+Peaks&font=pressstart2p", shops: [], monsters: ["Tiny Flame Imp", "Blaze Hound"], isSafe: false, recommendedLevel: 3, dominantElement: "Fire" },
    lake: { name: "Crystal Lake", description: "A serene, dangerous lake.", backgroundImage: "https://placehold.co/800x200/4169E1/FFFFFF?text=Crystal+Lake&font=pressstart2p", shops: [], monsters: ["Puddle Sprite", "Deep One"], isSafe: false, recommendedLevel: 2, dominantElement: "Water" },
    cavern: { name: "Stone Hollow", description: "Dark, rocky caverns.", backgroundImage: "https://placehold.co/800x200/696969/FFFFFF?text=Stone+Hollow&font=pressstart2p", shops: [], monsters: ["Stone Golem"], isSafe: false, recommendedLevel: 4, dominantElement: "Earth" },
    temple: { name: "Temple of Radiance", description: "A sacred, light-filled temple.", backgroundImage: "https://placehold.co/800x200/FFD700/000000?text=Temple+of+Radiance&font=pressstart2p", shops: ["holyShrine"], monsters: ["Sun Seeker"], isSafe: false, recommendedLevel: 5, dominantElement: "Light" },
    crypt: { name: "Shadow Crypt", description: "An ancient, dark crypt.", backgroundImage: "https://placehold.co/800x200/483D8B/FFFFFF?text=Shadow+Crypt&font=pressstart2p", shops: [], monsters: ["Shadow Pup"], isSafe: false, recommendedLevel: 6, dominantElement: "Dark" }
};
const SHOP_TYPES = { /* ... (same as before) ... */ 
    generalStore: { name: "General Store", description: "Basic supplies.", inventory: ["health_potion_s", "health_potion_m", "mana_potion_s", "mana_potion_m", "revival_stone"] },
    magicEmporium: { name: "Magic Emporium", description: "Magical items.", inventory: ["mana_potion_l", "elemental_charm", "spell_scroll", "rune_fragment"] },
    blacksmith: { name: "Blacksmith", description: "Weapons and armor.", inventory: ["basic_sword", "reinforced_shield", "leather_armor", "iron_helmet"] },
    holyShrine: { name: "Holy Shrine", description: "Sacred items.", inventory: ["holy_water", "blessed_amulet", "warding_charm", "purification_scroll"] }
};
const shopItems = [ /* ... (same as before, ensure effect functions correctly reference playerData) ... */ 
    { id: "health_potion_s", name: "Sm. HP Potion", icon: "🧪", type: "consumable", description: "Restores 50 HP + (5×Lvl).", cost: 15, effect: function() { const h = 50 + (playerData.level*5); const aH = Math.min(h, playerData.maxHp - playerData.hp); if(aH>0){playerData.hp+=aH; addLogMessage(`Restored ${aH} HP.`, "success"); updatePlayerStatsUI();} else {addLogMessage("HP full!", "info");} return aH>0; } },
    { id: "health_potion_m", name: "Md. HP Potion", icon: "🧪", type: "consumable", description: "Restores 100 HP + (10×Lvl).", cost: 40, effect: function() { const h = 100 + (playerData.level*10); const aH = Math.min(h, playerData.maxHp - playerData.hp); if(aH>0){playerData.hp+=aH; addLogMessage(`Restored ${aH} HP.`, "success"); updatePlayerStatsUI();} else {addLogMessage("HP full!", "info");} return aH>0; } },
    { id: "mana_potion_s", name: "Sm. MP Potion", icon: "🔮", type: "consumable", description: "Restores 30 MP + (3×Lvl).", cost: 20, effect: function() { const m = 30 + (playerData.level*3); const aR = Math.min(m, playerData.maxMana - playerData.mana); if(aR>0){playerData.mana+=aR; addLogMessage(`Restored ${aR} MP.`, "success"); updatePlayerStatsUI(); updateSkillButtonsAvailability();} else {addLogMessage("MP full!", "info");} return aR>0; } },
    { id: "mana_potion_m", name: "Md. MP Potion", icon: "🔮", type: "consumable", description: "Restores 60 MP + (6×Lvl).", cost: 45, effect: function() { const m = 60 + (playerData.level*6); const aR = Math.min(m, playerData.maxMana - playerData.mana); if(aR>0){playerData.mana+=aR; addLogMessage(`Restored ${aR} MP.`, "success"); updatePlayerStatsUI(); updateSkillButtonsAvailability();} else {addLogMessage("MP full!", "info");} return aR>0; } },
    { id: "mana_potion_l", name: "Lg. MP Potion", icon: "🔮✨", type: "consumable", description: "Restores 120 MP + (10×Lvl).", cost: 80, effect: function() { const m = 120 + (playerData.level*10); const aR = Math.min(m, playerData.maxMana - playerData.mana); if(aR>0){playerData.mana+=aR; addLogMessage(`Restored ${aR} MP.`, "success"); updatePlayerStatsUI(); updateSkillButtonsAvailability();} else {addLogMessage("MP full!", "info");} return aR>0; } },
    { id: "revival_stone", name: "Revival Stone", icon: "💎", type: "consumable", description: "Auto-revives if defeated.", cost: 120, effect: function() { if(!playerData.hasRevivalStone){playerData.hasRevivalStone=true; addLogMessage("Revival Stone active.", "success"); return true;} else {addLogMessage("Already have Revival Stone.", "info"); return false;} } },
    { id: "spell_scroll", name: "Empower Scroll", icon: "📜", type: "consumable", description: "Boosts next skill damage by 25%.", cost: 50, effect: function() { addLogMessage("Empower Scroll used!", "success"); playerData.statusEffects.push({type:"skill_boost",value:0.25,duration:1}); return true;} },
    { id: "holy_water", name: "Holy Water", icon: "💧✨", type: "consumable", description: "Cures minor debuffs & heals.", cost: 30, effect: function() { playerData.statusEffects=playerData.statusEffects.filter(e=>e.isBuff); addLogMessage("Holy Water purifies.", "success"); const h=20+(playerData.level*2); const aH=Math.min(h,playerData.maxHp-playerData.hp); if(aH>0)playerData.hp+=aH; updatePlayerStatsUI(); return true;} },
    { id: "purification_scroll", name: "Purify Scroll", icon: "📜✨", type: "consumable", description: "Removes negative effects.", cost: 70, effect: function() {playerData.statusEffects=playerData.statusEffects.filter(e=>e.isBuff); addLogMessage("Purified from debuffs!", "success"); return true;} },
    { id: "basic_sword", name: "Basic Sword", icon: "🗡️", type: "weapon", description: "ATK +5.", cost: 75, slot: "weapon", stats: { attackPower: 5 } },
    { id: "leather_armor", name: "Leather Armor", icon: "🧥", type: "armor", description: "DEF +3, MaxHP +20.", cost: 60, slot: "armor", stats: { defense: 3, maxHp: 20 } },
    { id: "reinforced_shield", name: "Reinforced Shield", icon: "🛡️", type: "shield", description: "DEF +4.", cost: 70, slot: "shield", stats: { defense: 4 } },
    { id: "elemental_charm", name: "Elem. Charm", icon: "�", type: "accessory", description: "Rune elem. dmg +10%.", cost: 150, slot: "accessory", stats: { elementalBoostPercent: 0.10 } },
    { id: "iron_helmet", name: "Iron Helmet", icon: "🪖", type: "armor", slot: "armor", description: "DEF +2, MaxHP +10", cost: 40, stats: { defense: 2, maxHp: 10 } },
    { id: "blessed_amulet", name: "Blessed Amulet", icon: "💠", type: "accessory", slot: "accessory", description: "MaxMP +15, LightRes +5%", cost: 90, stats: { maxMana: 15 } },
    { id: "warding_charm", name: "Warding Charm", icon: "🧿", type: "accessory", slot: "accessory", description: "DarkRes +10%", cost: 65, stats: {} },
    { id: "rune_fragment", name: "Rune Fragment", icon: "🧩", type: "special", description: "A piece of a powerful rune.", cost: 200 }
];
const monsterTemplates = [ /* ... (same as before) ... */ 
    { name: "Tiny Flame Imp", type: "Fire", baseMaxHp: 35, baseAttack: 7, baseDefense: 1, expReward: 12, goldReward: 7, spriteKey: "TinyFlameImp", skills: [{ name: "Scratch", damageMultiplier: 1.0, type: "Normal", chance: 0.7 }, { name: "Small Ember", damageMultiplier: 1.1, type: "Fire", chance: 0.3 }] },
    { name: "Puddle Sprite", type: "Water", baseMaxHp: 45, baseAttack: 6, baseDefense: 2, expReward: 14, goldReward: 8, spriteKey: "PuddleSprite", skills: [{ name: "Splash", damageMultiplier: 1.0, type: "Normal", chance: 0.6 }, { name: "Weak Bubble", damageMultiplier: 1.0, type: "Water", chance: 0.4 }] },
    { name: "Forest Wisp", type: "Nature", baseMaxHp: 50, baseAttack: 9, baseDefense: 2, expReward: 18, goldReward: 9, spriteKey: "ForestWisp", skills: [{ name: "Tackle", damageMultiplier: 1.0, type: "Normal", chance: 0.5 }, { name: "Leaf Cutter", damageMultiplier: 1.2, type: "Nature", chance: 0.5 }] },
    { name: "Shadow Pup", type: "Dark", baseMaxHp: 60, baseAttack: 10, baseDefense: 3, expReward: 25, goldReward: 12, spriteKey: "ShadowPup", skills: [{ name: "Bite", damageMultiplier: 1.0, type: "Normal", chance: 0.6 }, { name: "Dark Pulse", damageMultiplier: 1.2, type: "Dark", chance: 0.4 }] },
    { name: "Sun Seeker", type: "Light", baseMaxHp: 55, baseAttack: 9, baseDefense: 4, expReward: 23, goldReward: 11, spriteKey: "SunSeeker", skills: [{ name: "Peck", damageMultiplier: 1.0, type: "Normal", chance: 0.6 }, { name: "Holy Spark", damageMultiplier: 1.2, type: "Light", chance: 0.4 }] },
    { name: "Blaze Hound", type: "Fire", baseMaxHp: 75, baseAttack: 12, baseDefense: 4, expReward: 30, goldReward: 15, spriteKey: "BlazeHound", skills: [{ name: "Fiery Bite", damageMultiplier: 1.1, type: "Fire", chance: 0.6 }, { name: "Howl", damageMultiplier: 0, type: "Buff", effect: "attack_up", chance: 0.4, description: "Boosts its Attack." }] },
    { name: "Stone Golem", type: "Earth", baseMaxHp: 90, baseAttack: 8, baseDefense: 5, expReward: 35, goldReward: 18, spriteKey: "StoneGolem", skills: [{ name: "Heavy Punch", damageMultiplier: 1.0, type: "Normal", chance: 0.7 }, { name: "Rock Throw", damageMultiplier: 1.3, type: "Earth", chance: 0.3 }] },
    { name: "Vine Crawler", type: "Nature", baseMaxHp: 80, baseAttack: 11, baseDefense: 3, expReward: 32, goldReward: 16, spriteKey: "ForestWisp", skills: [{ name: "Constrict", damageMultiplier: 0.8, type: "Nature", chance: 0.5, effect: "defense_down", description: "Lowers Defense." }, { name: "Poison Spores", damageMultiplier: 0.5, type: "Poison", chance: 0.5, effect: "poison_dot", duration: 3, description: "Inflicts poison." }] },
    { name: "Magma Elemental", type: "Fire", baseMaxHp: 100, baseAttack: 14, baseDefense: 2, expReward: 40, goldReward: 20, spriteKey: "TinyFlameImp", skills: [{ name: "Magma Ball", damageMultiplier: 1.4, type: "Fire", chance: 0.6 }, { name: "Heat Wave", damageMultiplier: 1.0, type: "Fire", chance: 0.4, aoe: true, description: "Damages all." }] },
    { name: "Deep One", type: "Water", baseMaxHp: 95, baseAttack: 10, baseDefense: 6, expReward: 38, goldReward: 19, spriteKey: "PuddleSprite", skills: [{ name: "Tentacle Whip", damageMultiplier: 1.2, type: "Water", chance: 0.7 }, { name: "Ink Cloud", damageMultiplier: 0, type: "Debuff", effect: "accuracy_down", chance: 0.3, description: "Lowers accuracy." }] },
];
const bossMonsterTemplates = [ /* ... (same as before) ... */ 
    { name: "GRONK, Earth Titan", type: "Earth", baseMaxHp: 220, baseAttack: 15, baseDefense: 8, expReward: 120, goldReward: 80, spriteKey: "GronkBoss", skills: [ { name: "Titan Slam", damageMultiplier: 1.5, type: "Earth", chance: 0.6, description: "A devastating slam." }, { name: "Earthquake", damageMultiplier: 1.2, type: "Earth", chance: 0.3, aoe: true, description: "Shakes the ground." }, { name: "Stone Skin", damageMultiplier: 0, type: "Buff", effect: "defense_up", chance: 0.2, description: "Boosts Defense." } ], isBoss: true },
    { name: "VOIDMAW, Hungering Dark", type: "Dark", baseMaxHp: 180, baseAttack: 20, baseDefense: 6, expReward: 150, goldReward: 100, spriteKey: "VoidmawBoss", skills: [ { name: "Shadow Claw", damageMultiplier: 1.4, type: "Dark", chance: 0.5, description: "Dark claws." }, { name: "Devouring Void", damageMultiplier: 1.0, type: "Dark", chance: 0.3, effect: "hp_drain", description: "Drains life." }, { name: "Nightmare Veil", damageMultiplier: 0, type: "Debuff", effect: "accuracy_down", chance: 0.2, description: "Lowers accuracy." } ], isBoss: true }
];

// --- END OF GAME DATA DEFINITIONS ---

// --- Function Definitions (Should come AFTER data, but BEFORE DOMContentLoaded if they are helpers for it) ---

// Fallback showError and initializeErrorLogger if not provided by other means (e.g. a dedicated error script)
// These are defined early so they are available for the Early Error Setup and global handlers.
if (typeof showError !== 'function') {
    window.showError = function(message, error = null) {
        console.warn("Script.js: Using fallback showError function.");
        console.error("Fallback showError:", message, error); 
        const errLogDisp = document.getElementById('error-log-display'); // Re-fetch, might not be global yet
        const errMessageSpan = document.getElementById('error-message-span');
        const errStack = document.getElementById('error-stack');
        const errExpandBtn = document.getElementById('error-expand-button');
        const errDetails = document.getElementById('error-details');

        if (errLogDisp && errMessageSpan) {
            errMessageSpan.textContent = message;
            if (error && errStack) {
                errStack.textContent = error.stack || error.toString();
                if(errExpandBtn) errExpandBtn.style.display = 'inline-block';
                if(errDetails) errDetails.style.display = 'none'; 
            } else {
                if(errExpandBtn) errExpandBtn.style.display = 'none';
                if(errDetails) errDetails.style.display = 'none';
            }
            errLogDisp.style.display = 'block';
        } else {
            alert("Error: " + message + (error ? `\nDetails: ${error.message}` : ''));
        }
    };
}

if (typeof initializeErrorLogger !== 'function') {
    window.initializeErrorLogger = function() {
        console.warn("Script.js: Using fallback initializeErrorLogger.");
        const errLogDisp = document.getElementById('error-log-display'); // Re-fetch
        const errExpandBtn = document.getElementById('error-expand-button');
        const errDetails = document.getElementById('error-details');
        if (errLogDisp && errExpandBtn && errDetails) {
            errLogDisp.style.display = 'none';
            errExpandBtn.onclick = () => { // Use onclick for simplicity in fallback
                const isExpanded = errDetails.style.display === 'block';
                errDetails.style.display = isExpanded ? 'none' : 'block';
                errExpandBtn.textContent = isExpanded ? 'Details' : 'Hide';
            };
        } else {
            console.error("Script.js: Fallback initializeErrorLogger - critical error log elements missing.");
        }
    };
}


/**
 * Sets up event listeners for the rune selection buttons.
 */
function setupRuneSelectionButtons() {
    // ... (Content from previous script_js_complete_v1_part2 - ensure it's here and correct)
    try {
        console.log("Script.js: Setting up rune selection buttons...");
        if (!runeButtons || runeButtons.length === 0) {
            console.error("Script.js: No rune buttons found in `runeButtons` array.");
            if (typeof showError === 'function') showError("Critical: Rune selection buttons not found.", new Error("Rune buttons missing"));
            return;
        }
        runeButtons.forEach(button => {
            if (button && typeof button.addEventListener === 'function') {
                const newButton = button.cloneNode(true);
                if (button.parentNode) button.parentNode.replaceChild(newButton, button);
                else console.warn("Script.js: Rune button has no parent, cannot replace for listener cleanup.");

                newButton.addEventListener('click', function() {
                    const runeType = this.dataset.rune; 
                    if (!runeType) {
                        console.error("Script.js: Rune button 'data-rune' missing.");
                        if(typeof showError === 'function') showError("Could not determine selected rune.");
                        return;
                    }
                    console.log(`Script.js: ${runeType} rune selected.`);
                    document.querySelectorAll('.rune-button').forEach(btn => { if(btn) { btn.disabled = true; btn.style.opacity = "0.5"; }});
                    this.style.opacity = "1"; 
                    if (typeof initializeGame === 'function') initializeGame(runeType);
                    else {
                        console.error("Script.js: initializeGame function undefined!");
                        if(typeof showError === 'function') showError("Critical error: Game init missing.");
                        document.querySelectorAll('.rune-button').forEach(btn => { if(btn) {btn.disabled = false; btn.style.opacity = "1";}});
                    }
                });
            } else {
                console.warn("Script.js: Invalid rune button element found.");
            }
        });
        console.log("Script.js: Rune selection buttons event listeners attached.");
    } catch (error) {
        console.error("Script.js: Error in setupRuneSelectionButtons:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error setting up rune buttons.", error);
    }
}

/**
 * Initializes the shop category tabs with event listeners.
 */
function initializeShopTabs() {
    // ... (Content from previous script_js_complete_v1_part2 - ensure it's here and correct)
    try {
        if (!shopTabs || shopTabs.length === 0) {
            console.warn("Script.js: No shop tabs found.");
            return;
        }
        shopTabs.forEach(tab => {
            if (tab && typeof tab.addEventListener === 'function') {
                tab.addEventListener('click', function() {
                    shopTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    if (typeof filterShopItems === 'function') filterShopItems(this.dataset.category);
                    else console.error("Script.js: filterShopItems function undefined.");
                });
            }
        });
        console.log("Script.js: Shop tabs event listeners initialized.");
    } catch (error) {
        console.error("Script.js: Error initializing shop tabs:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error setting up shop tabs.", error);
    }
}


// --- Main Game Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function() {
    // ... (Keep the exact same DOMContentLoaded listener from script_js_complete_v1_part2)
    // This calls assignDOMElements, error logger setup, validateDOMElements, and initialUISetup.
    try {
        console.log("Script.js: DOMContentLoaded event fired. Starting main game initialization...");

        if (typeof assignDOMElements === 'function') assignDOMElements();
        else {
            console.error("Script.js: assignDOMElements missing!");
            if (typeof showError === 'function') showError("CRITICAL: assignDOMElements missing.", new Error("assignDOMElements not found"));
            else alert("CRITICAL: assignDOMElements missing.");
            return; 
        }
        console.log("Script.js: assignDOMElements completed.");

        if (!earlyErrorHandlersInitialized) { // Check if early setup already ran
            console.log("Script.js: DOMContentLoaded running error logger setup (if not done by early init).");
            if (typeof initializeErrorLogger === 'function') initializeErrorLogger();
            else console.warn("Script.js: initializeErrorLogger missing at DOMContentLoaded.");

            if (typeof setupGlobalErrorHandlers === 'function') setupGlobalErrorHandlers();
            else console.warn("Script.js: setupGlobalErrorHandlers missing at DOMContentLoaded.");
        } else {
            console.log("Script.js: Error logger setup likely done by early init, skipping in DOMContentLoaded.");
        }
        
        if (typeof validateDOMElements === 'function') {
            if (!validateDOMElements()) {
                console.error("Script.js: Critical DOM elements missing, aborting main initialization.");
                return; // showError would be called by validateDOMElements
            }
        } else {
            console.error("Script.js: validateDOMElements missing!");
            if(typeof showError === 'function') showError("CRITICAL: validateDOMElements missing.", new Error("validateDOMElements not found"));
            return;
        }
        console.log("Script.js: validateDOMElements completed.");

        if (typeof initialUISetup === 'function') initialUISetup();
        else {
            console.error("Script.js: initialUISetup missing!");
            if(typeof showError === 'function') showError("CRITICAL: initialUISetup missing.", new Error("initialUISetup not found"));
            // Fallback: Try to show rune selection screen if possible
            if(runeSelectionScreen && typeof runeSelectionScreen.style !== 'undefined') { 
                if(typeof hideAllScreens === 'function') hideAllScreens();
                runeSelectionScreen.style.display = 'flex'; 
                runeSelectionScreen.classList.add('active');
                runeSelectionScreen.setAttribute('aria-hidden', 'false');
                runeSelectionScreen.style.opacity = '1';
                runeSelectionScreen.style.visibility = 'visible';
            }
        }
        console.log("Script.js: initialUISetup completed.");
        
        console.log("Script.js: Main game initialization sequence within DOMContentLoaded complete!");

    } catch (error) {
        console.error("Script.js: FATAL ERROR during DOMContentLoaded:", error.message, error.stack);
        if (typeof showError === 'function') showError("FATAL DOMContentLoaded ERROR: " + error.message, error);
        else alert("FATAL DOMContentLoaded ERROR. Check console. Error: " + error.message);
    }
});

// --- Utility and Core Setup Functions (assignDOMElements, validateDOMElements, initialUISetup, etc.) ---
function assignDOMElements() {
    // ... (Full content of assignDOMElements from script_js_complete_v1_part2)
    console.log("Script.js: Assigning DOM elements...");
    runeSelectionScreen = document.getElementById('rune-selection-screen');
    gameScreen = document.getElementById('game-screen');
    areaSelectionScreen = document.getElementById('area-selection-screen');
    fireRuneButton = document.getElementById('fire-rune-btn');
    waterRuneButton = document.getElementById('water-rune-btn');
    natureRuneButton = document.getElementById('nature-rune-btn');
    lightRuneButton = document.getElementById('light-rune-btn');
    darkRuneButton = document.getElementById('dark-rune-btn');
    runeButtons = [fireRuneButton, waterRuneButton, natureRuneButton, lightRuneButton, darkRuneButton].filter(btn => btn !== null);
    playerRuneDisplay = document.getElementById('player-rune-display');
    playerLevelDisplay = document.getElementById('player-level');
    playerGoldDisplay = document.getElementById('player-gold');
    playerHpText = document.getElementById('player-hp-text');
    playerHpFill = document.getElementById('player-hp-fill');
    playerManaText = document.getElementById('player-mana-text');
    playerManaFill = document.getElementById('player-mana-fill');
    playerExpText = document.getElementById('player-exp-text');
    playerExpFill = document.getElementById('player-exp-fill');
    playerAvatar = document.getElementById('player-avatar');
    playerAttackDisplay = document.getElementById('player-attack');
    playerDefenseDisplay = document.getElementById('player-defense');
    monsterNameDisplay = document.getElementById('monster-name');
    monsterTypeDisplay = document.getElementById('monster-type');
    monsterLevelDisplay = document.getElementById('monster-level');
    monsterHpText = document.getElementById('monster-hp-text');
    monsterHpFill = document.getElementById('monster-hp-fill');
    monsterSprite = document.getElementById('monster-sprite');
    gameLog = document.getElementById('game-log');
    skillButtonsArea = document.getElementById('skill-buttons-area');
    shopButton = document.getElementById('shop-button');
    runeSwapButton = document.getElementById('rune-swap-btn');
    inventoryButton = document.getElementById('inventory-button');
    monstersDefeatedCounter = document.getElementById('monsters-defeated');
    nextBossCounter = document.getElementById('next-boss-counter');
    leaveTownButton = document.getElementById('leave-town-button');
    areaSelectionBackButton = document.getElementById('area-selection-back-btn');
    shopModal = document.getElementById('shop-modal');
    shopPlayerGoldDisplay = document.getElementById('shop-current-gold');
    shopItemsContainer = document.getElementById('shop-items-container');
    closeShopButton = document.getElementById('close-shop-button');
    modalCloseButtonX = document.getElementById('modal-close-button');
    shopTabs = document.querySelectorAll('.shop-tab');
    inventoryModal = document.getElementById('inventory-modal');
    inventoryItemsContainer = document.getElementById('inventory-items-container');
    equipmentSlotsContainer = document.getElementById('equipment-slots-container');
    inventoryModalCloseButtonX = document.getElementById('inventory-modal-close-button');
    closeInventoryButton = document.getElementById('close-inventory-button');
    runeSwapModal = document.getElementById('rune-swap-modal');
    currentActiveRuneDisplay = document.getElementById('current-active-rune-display');
    unlockedRunesContainer = document.getElementById('unlocked-runes-container');
    runeSwapModalCloseButtonX = document.getElementById('rune-swap-modal-close-button');
    closeRuneSwapModalButton = document.getElementById('close-rune-swap-modal-button');
    levelUpModal = document.getElementById('level-up-modal');
    newLevelDisplay = document.getElementById('new-level-display');
    oldHpDisplay = document.getElementById('old-hp');
    newHpDisplay = document.getElementById('new-hp');
    oldMpDisplay = document.getElementById('old-mp');
    newMpDisplay = document.getElementById('new-mp');
    oldAttackDisplay = document.getElementById('old-attack');
    newAttackDisplay = document.getElementById('new-attack');
    oldDefenseDisplay = document.getElementById('old-defense');
    newDefenseDisplay = document.getElementById('new-defense');
    closeLevelUpModalButton = document.getElementById('close-level-up-modal-button');
    errorLogDisplay = document.getElementById('error-log-display'); // Re-confirm
    errorMessageSpan = document.getElementById('error-message-span');
    errorExpandButton = document.getElementById('error-expand-button');
    errorDetails = document.getElementById('error-details');
    errorStack = document.getElementById('error-stack');
    errorHistoryButton = document.getElementById('error-history-button');
    console.log("Script.js: DOM element assignment finished.");
}

function validateDOMElements() {
    // ... (Full content of validateDOMElements from script_js_complete_v1_part2)
    console.log("Script.js: Validating critical DOM elements...");
    const criticalElementsMap = {
        'rune-selection-screen': runeSelectionScreen, 'game-screen': gameScreen, 'fire-rune-btn': fireRuneButton, 
        'game-log': gameLog, 'skill-buttons-area': skillButtonsArea, 'player-hp-text': playerHpText, 'monster-name': monsterNameDisplay
    };
    let allCriticalFound = true; let missingElementsDetails = [];
    for (const id in criticalElementsMap) { if (!criticalElementsMap[id]) { allCriticalFound = false; missingElementsDetails.push(`ID '${id}'`);}}
    if (!allCriticalFound) { const msg = `Critical DOM elements missing: ${missingElementsDetails.join(', ')}.`; console.error(msg); if(typeof showError==='function')showError(msg); return false; }
    console.log("Script.js: All critical DOM elements validated successfully.");
    return true;
}

function initialUISetup() {
    // ... (Full content of initialUISetup from script_js_complete_v1_part2, ensuring it calls the now-defined setupRuneSelectionButtons and initializeShopTabs)
    try {
        console.log("Script.js: Starting initial UI setup...");
        if (runeSelectionScreen && typeof runeSelectionScreen.style !== 'undefined') {
            if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') window.ScreenManager.activateScreen('rune-selection-screen');
            else if (typeof activateScreen === 'function') activateScreen('rune-selection-screen');
            else { console.warn("Script.js: No screen manager, using direct styles for initial screen."); hideAllScreens(); runeSelectionScreen.style.display = 'flex'; runeSelectionScreen.classList.add('active'); runeSelectionScreen.setAttribute('aria-hidden', 'false'); runeSelectionScreen.style.opacity = '1'; runeSelectionScreen.style.visibility = 'visible'; }
            console.log("Script.js: Rune selection screen made active.");
        } else { console.error("Script.js: runeSelectionScreen missing/invalid."); if(typeof showError === 'function') showError("Critical: Initial screen missing.", new Error("runeSelectionScreen missing")); return; }

        if (gameScreen && !gameScreen.classList.contains('active')) { gameScreen.style.display = 'none'; gameScreen.setAttribute('aria-hidden', 'true');}
        if (areaSelectionScreen && !areaSelectionScreen.classList.contains('active')) { areaSelectionScreen.style.display = 'none'; areaSelectionScreen.setAttribute('aria-hidden', 'true');}
        hideAllModals();

        if (window.playerData && window.heroAvatars && window.heroAvatars.Default) { // Check these are defined
            playerData.avatar = heroAvatars.Default;
        } else {
            console.warn("Script.js: playerData or heroAvatars.Default not defined during initialUISetup. Default avatar may not be set. This usually means data constants are not defined at the top of script.js.");
        }
        
        if (typeof setupRuneSelectionButtons === 'function') setupRuneSelectionButtons(); // Now defined above
        else { console.error("Script.js: setupRuneSelectionButtons missing!"); if(typeof showError === 'function') showError("Error: Rune selection init failed.");}

        if (typeof initializeShopTabs === 'function') initializeShopTabs(); // Now defined above
        else console.warn("Script.js: initializeShopTabs missing.");
        
        if (areaSelectionBackButton && typeof areaSelectionBackButton.addEventListener === 'function') {
            areaSelectionBackButton.addEventListener('click', () => {
                if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') { window.ScreenManager.activateScreen('game-screen'); if (typeof enterTown === 'function' && GAME_AREAS && GAME_AREAS.town) setTimeout(() => enterTown(GAME_AREAS.town), 50); }
                else if (typeof activateScreen === 'function') { activateScreen('game-screen'); if (typeof enterTown === 'function' && GAME_AREAS && GAME_AREAS.town) setTimeout(() => enterTown(GAME_AREAS.town), 50); }
                else if(typeof showError === 'function') showError("Cannot go back: Screen manager missing.");
            });
        }
        console.log("Script.js: Initial UI setup complete!");
    } catch (error) {
        console.error("Script.js: Error during initialUISetup:", error.message, error.stack);
        if (typeof showError === 'function') showError("Error during initial UI setup: " + error.message, error);
    }
}

function setupGlobalErrorHandlers() {
    // ... (Full content of setupGlobalErrorHandlers from script_js_complete_v1_part2)
    window.onerror = function(message, source, lineno, colno, error) { const srcFile = source ? source.substring(source.lastIndexOf('/')+1) : 'unknown'; const msg = `Unhandled: ${message} @ ${srcFile}:${lineno}:${colno}`; console.error(msg, error); if(typeof showError==='function')showError(msg,error); return true; };
    window.onunhandledrejection = function(event) { const reason = event.reason || "Unhandled rejection"; let msg = "Unhandled Promise Rejection: "; let errObj = null; if(reason instanceof Error){msg+=reason.message; errObj=reason;}else if(typeof reason === 'string'){msg+=reason; errObj=new Error(reason);}else{try{msg+=JSON.stringify(reason);}catch(e){msg+="Non-serializable reason";}errObj=new Error(msg);} console.error(msg,errObj); if(typeof showError==='function')showError(msg,errObj);};
    console.log("Script.js: Global error handlers set up.");
}

function hideAllModals() {
    // ... (Full content of hideAllModals from script_js_complete_v1_part2)
    try { const modals = document.querySelectorAll('.modal'); modals.forEach(m => { if(m && m.style) {m.style.display = 'none'; m.setAttribute('aria-hidden', 'true');}}); } catch(e) {console.error("Error in hideAllModals:", e);}
}

function hideAllScreens() {
    // ... (Full content of hideAllScreens from script_js_complete_v1_part2)
    try { const screens = document.querySelectorAll('.screen'); screens.forEach(s => { if(s && s.style) {s.classList.remove('active'); s.setAttribute('aria-hidden', 'true'); s.style.display='none'; s.style.opacity='0'; s.style.visibility='hidden';}}); } catch(e) {console.error("Error in hideAllScreens:", e); if(typeof showError==='function')showError("Error hiding screens",e);}
}

function activateScreen(screenId) {
    // ... (Full content of activateScreen from script_js_complete_v1_part2)
    try { if(typeof hideAllScreens==='function')hideAllScreens(); else console.warn("hideAllScreens missing in activateScreen"); const screenEl = document.getElementById(screenId); if(!screenEl || !screenEl.style){console.error(`Screen ${screenId} not found/invalid.`); if(typeof showError==='function')showError(`Screen ${screenId} missing.`); return false;} screenEl.style.display='flex'; void screenEl.offsetWidth; screenEl.classList.add('active'); screenEl.setAttribute('aria-hidden','false'); setTimeout(()=>{screenEl.style.opacity='1'; screenEl.style.visibility='visible';},10); console.log(`Script.js: Screen ${screenId} activated.`); return true; } catch(e){console.error(`Error activating ${screenId}:`,e); if(typeof showError==='function')showError(`Error activating ${screenId}`,e); return false;}
}
// --- (Ensure Part 1: Strict Mode, Core Data & Early Setup, DOMContentLoaded, and initial setup functions are above this point) ---

// --- Game Logic Functions (Core Game Setup, UI, Skills) ---

/**
 * Initializes the game after a rune is chosen.
 * This is the main function called when the player starts their journey.
 * @param {string} chosenRune - The name of the rune selected by the player.
 */
function initializeGame(chosenRune) {
    try {
        console.log(`Script.js: initializeGame called with rune: ${chosenRune}`);
        
        if (!chosenRune) {
            if(typeof showError === 'function') showError("No rune selected for game initialization. Please select a rune.");
            // Re-enable rune buttons if initialization fails early
            if(runeButtons && runeButtons.length > 0) {
                runeButtons.forEach(btn => { if(btn && typeof btn.style !== 'undefined') { btn.disabled = false; btn.style.opacity = "1"; }});
            }
            return; 
        }
        
        // 1. Setup Player Data based on the chosen rune
        if (typeof setupPlayerWithRune === 'function') {
            setupPlayerWithRune(chosenRune);
        } else {
            const errMsg = 'Critical Error: setupPlayerWithRune function is not defined! Cannot set up player.';
            console.error(errMsg);
            if(typeof showError === 'function') showError(errMsg);
            throw new Error(errMsg); 
        }
        
        // 2. Setup Event Handlers for game buttons (shop, inventory, etc.)
        if (typeof setupGameButtonEventHandlers === 'function') {
            setupGameButtonEventHandlers();
        } else {
            console.warn('Script.js: setupGameButtonEventHandlers function is not defined. Some game buttons may not work.');
        }
        
        // 3. Reset Game State Variables (like combatLock, gameOver flags)
        if (typeof resetGameState === 'function') {
            resetGameState();
        } else {
            console.warn('Script.js: resetGameState function is not defined. Game state might not be fresh.');
            // Basic fallback reset:
            window.gameOver = false;
            window.combatLock = false;
            window.isPlayerTurn = true;
            window.currentMonster = null;
            window.regularMonsterDefeatCount = 0;
        }
        
        // 4. Switch to the main game screen
        let switchedSuccessfully = false;
        if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') {
            switchedSuccessfully = window.ScreenManager.activateScreen('game-screen');
        } else if (typeof activateScreen === 'function') {
            switchedSuccessfully = activateScreen('game-screen');
        } else {
            console.error("Script.js: No screen activation function (ScreenManager or activateScreen) found. Cannot switch to game screen.");
            if(typeof showError === 'function') showError("Critical Error: Cannot display game screen. Function missing.");
            // Attempt manual show as last resort
            if(gameScreen && typeof gameScreen.style !== 'undefined' && runeSelectionScreen && typeof runeSelectionScreen.style !== 'undefined') {
                if(typeof hideAllScreens === 'function') hideAllScreens();
                gameScreen.style.display = 'flex';
                gameScreen.classList.add('active');
                gameScreen.setAttribute('aria-hidden', 'false');
                gameScreen.style.opacity = '1';
                gameScreen.style.visibility = 'visible';
                switchedSuccessfully = true; // Assume it worked for the next step
            }
        }

        if (!switchedSuccessfully) {
            console.error("Script.js: Failed to switch to game screen during initialization.");
             if(runeButtons && runeButtons.length > 0) {
                runeButtons.forEach(btn => { if(btn && typeof btn.style !== 'undefined') { btn.disabled = false; btn.style.opacity = "1"; }});
            }
            if(runeSelectionScreen && typeof activateScreen === 'function') activateScreen('rune-selection-screen'); // Try to go back
            else if (runeSelectionScreen && typeof runeSelectionScreen.style !== 'undefined') { // Manual fallback if activateScreen is also missing
                if(typeof hideAllScreens === 'function') hideAllScreens();
                runeSelectionScreen.style.display = 'flex';
                runeSelectionScreen.classList.add('active');
            }
            return;
        }
        
        // 5. Enter the starting town area
        setTimeout(() => {
            if (typeof enterTown === 'function' && typeof GAME_AREAS !== 'undefined' && GAME_AREAS.town) {
                enterTown(GAME_AREAS.town);
            } else {
                console.warn("Script.js: enterTown function or GAME_AREAS.town not defined. Cannot enter starting town.");
                if(typeof addLogMessage === 'function') addLogMessage("Welcome! Explore the world.", "info"); 
            }
            // Final UI updates after town entry
            if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
            if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); 
            if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
        }, 100); // 100ms delay to allow screen transition to settle

        console.log("Script.js: Game initialization with rune completed successfully!");

    } catch (error) {
        console.error(`Script.js: Error initializing game with ${chosenRune} rune:`, error.message, error.stack);
        if (typeof showError === 'function') {
            showError(`Error initializing game: ${error.message}. Please try again.`, error);
        }
        try { // Recovery attempt
            if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') window.ScreenManager.activateScreen('rune-selection-screen');
            else if (typeof activateScreen === 'function') activateScreen('rune-selection-screen');
            else if (runeSelectionScreen && typeof runeSelectionScreen.style !== 'undefined') { if(typeof hideAllScreens === 'function') hideAllScreens(); runeSelectionScreen.style.display = 'flex'; runeSelectionScreen.classList.add('active');}
            if(runeButtons && runeButtons.length > 0) { runeButtons.forEach(btn => { if(btn && typeof btn.style !== 'undefined') { btn.disabled = false; btn.style.opacity = "1"; }});}
            if(typeof addLogMessage === 'function') addLogMessage("Error during game start. Please select a rune again.", "error");
        } catch (recoveryError) {
            console.error("Script.js: Recovery attempt failed:", recoveryError);
            alert("A critical error occurred, and recovery failed. Please refresh the page.");
        }
    }
}

/**
 * Sets up the player's initial state based on the chosen rune.
 */
function setupPlayerWithRune(chosenRune) {
    console.log(`Script.js: Setting up player with ${chosenRune} rune.`);
    if (!window.playerData) { 
        console.error("Script.js: playerData object is missing! Cannot setup player.");
        window.playerData = { /* minimal fallback structure */ level: 1, gold: 0, skills:[], inventory:[], equipment:{}, unlockedRunes:[] }; 
    }

    playerData.rune = chosenRune;
    playerData.level = 1;
    playerData.maxHp = PLAYER_BASE_HP;     // Uses const defined at the top
    playerData.hp = playerData.maxHp;
    playerData.maxMana = PLAYER_BASE_MANA;   // Uses const
    playerData.mana = playerData.maxMana;
    playerData.exp = 0;
    playerData.nextLevelExp = INITIAL_EXP_TO_LEVEL; // Uses const
    playerData.gold = 30; 
    playerData.attackPower = PLAYER_BASE_ATTACK_POWER; // Uses const
    playerData.defense = PLAYER_BASE_DEFENSE;     // Uses const
    playerData.statusEffects = [];
    playerData.inventory = [];
    playerData.unlockedRunes = [chosenRune];
    playerData.equipment = { weapon: null, shield: null, armor: null, accessory: null };
    playerData.hasRevivalStone = false;
    playerData.elementalBoostPercent = 0;
    playerData.skillMastery = {};

    if (heroAvatars && heroAvatars[chosenRune]) { // heroAvatars also defined at top
        playerData.avatar = heroAvatars[chosenRune];
    } else {
        playerData.avatar = heroAvatars.Default; 
        console.warn(`Script.js: Avatar for ${chosenRune} not found, using default.`);
    }

    if (typeof definePlayerSkills === 'function') {
        definePlayerSkills(chosenRune); 
    } else {
        console.error("Script.js: definePlayerSkills function is missing. Player will have no skills.");
        playerData.skills = []; 
    }

    if (playerRuneDisplay) playerRuneDisplay.textContent = chosenRune;
    else console.warn("Script.js: playerRuneDisplay element not found. Cannot update rune display.");
    
    if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();

    if(typeof addLogMessage === 'function') addLogMessage(`You have attuned to the ${chosenRune} Rune! Your adventure begins.`, 'event-critical');
    console.log("Script.js: Player setup with rune complete.");
}

/**
 * Sets up event handlers for main game action buttons.
 */
function setupGameButtonEventHandlers() {
    console.log("Script.js: Setting up game button event handlers...");
    
    if (shopButton) shopButton.onclick = () => { if (typeof openShop === 'function') openShop(); else console.error("Script.js: openShop undefined."); };
    else console.warn("Script.js: Shop button not found.");

    if (runeSwapButton) runeSwapButton.onclick = () => { if (typeof openRuneSwapModal === 'function') openRuneSwapModal(); else console.error("Script.js: openRuneSwapModal undefined."); };
    else console.warn("Script.js: Rune Swap button not found.");

    if (inventoryButton) inventoryButton.onclick = () => { if (typeof openInventory === 'function') openInventory(); else console.error("Script.js: openInventory undefined."); };
    else console.warn("Script.js: Inventory button not found.");

    if (leaveTownButton) {
        leaveTownButton.onclick = () => {
            if (typeof showAreaSelection === 'function') showAreaSelection();
            else if (typeof spawnNewMonster === 'function') { console.warn("Script.js: showAreaSelection undefined, using spawnNewMonster."); spawnNewMonster(); }
            else { console.error("Script.js: No battle function for leaveTownButton."); if(typeof showError === 'function') showError("Cannot start battle: Function missing.");}
        };
    } else console.warn("Script.js: Leave Town/Battle button not found.");

    // Modal Close Buttons
    if (modalCloseButtonX) modalCloseButtonX.onclick = () => { if (shopModal && shopModal.style) shopModal.style.display = 'none'; };
    if (closeShopButton) closeShopButton.onclick = () => { if (shopModal && shopModal.style) shopModal.style.display = 'none'; };
    if (inventoryModalCloseButtonX) inventoryModalCloseButtonX.onclick = () => { if (inventoryModal && inventoryModal.style) inventoryModal.style.display = 'none'; };
    if (closeInventoryButton) closeInventoryButton.onclick = () => { if (inventoryModal && inventoryModal.style) inventoryModal.style.display = 'none'; };
    if (runeSwapModalCloseButtonX) runeSwapModalCloseButtonX.onclick = () => { if (runeSwapModal && runeSwapModal.style) runeSwapModal.style.display = 'none'; };
    if (closeRuneSwapModalButton) closeRuneSwapModalButton.onclick = () => { if (runeSwapModal && runeSwapModal.style) runeSwapModal.style.display = 'none'; };
    if (closeLevelUpModalButton) closeLevelUpModalButton.onclick = () => { if (levelUpModal && levelUpModal.style) levelUpModal.style.display = 'none';};

    console.log("Script.js: Game button event handlers setup complete.");
}

/**
 * Resets game state variables.
 */
function resetGameState() {
    console.log("Script.js: Resetting game state...");
    window.gameOver = false;
    window.combatLock = false;
    window.isPlayerTurn = true;
    window.currentMonster = null; 
    window.regularMonsterDefeatCount = 0;
    if (window.playerData) playerData.statusEffects = []; // Clear status effects on reset
    console.log("Script.js: Game state reset.");
}

/**
 * Updates all player-related statistics and bars in the UI.
 */
function updatePlayerStatsUI() {
    try {
        if (!window.playerData) { console.warn("Script.js: playerData undefined in updatePlayerStatsUI."); return; }
        const updateStat = (el, val) => { if (el) el.textContent = val; };
        updateStat(playerLevelDisplay, playerData.level);
        updateStat(playerGoldDisplay, playerData.gold);
        updateStat(playerAttackDisplay, playerData.attackPower);
        updateStat(playerDefenseDisplay, playerData.defense);

        if (playerAvatar && playerData.avatar) { playerAvatar.src = playerData.avatar; playerAvatar.alt = `${playerData.rune || 'Generic'} Hero`; }
        else if (playerAvatar && heroAvatars && heroAvatars.Default) playerAvatar.src = heroAvatars.Default; // Fallback

        const updateBar = (txtEl, fillEl, curr, max, meterEl) => {
            if (txtEl && fillEl && typeof curr === 'number' && typeof max === 'number' && max >= 0) { // max can be 0 for EXP at max level
                txtEl.textContent = `${curr}/${max}`;
                fillEl.style.width = max > 0 ? `${Math.max(0, (curr / max) * 100)}%` : '0%';
                if (meterEl && typeof meterEl.setAttribute === 'function') { meterEl.setAttribute('aria-valuenow', curr); meterEl.setAttribute('aria-valuemax', max); }
            } else if (txtEl) { txtEl.textContent = `${curr || 'N/A'}/${max || 'N/A'}`; if(fillEl) fillEl.style.width = '0%';}
        };
        updateBar(playerHpText, playerHpFill, playerData.hp, playerData.maxHp, playerHpFill ? playerHpFill.parentElement : null);
        updateBar(playerManaText, playerManaFill, playerData.mana, playerData.maxMana, playerManaFill ? playerManaFill.parentElement : null);
        updateBar(playerExpText, playerExpFill, playerData.exp, playerData.nextLevelExp, playerExpFill ? playerExpFill.parentElement : null);
        
        if (typeof updateMasteryProgressUI === 'function') updateMasteryProgressUI();
        if (typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
    } catch (e) { console.error("Script.js: Error updating player stats UI:", e); if(typeof showError === 'function') showError("Error updating player stats.", e); }
}

/**
 * Updates the display of player's active status effects.
 */
function updatePlayerStatusEffectsUI() {
    const statusArea = document.getElementById('player-status-effects-area');
    if (!statusArea) return;
    statusArea.innerHTML = ''; 
    if (playerData && playerData.statusEffects && playerData.statusEffects.length > 0) {
        playerData.statusEffects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.classList.add('status-effect');
            if (effect.type.includes('_up')) effectDiv.classList.add('buff');
            else if (effect.type.includes('_down') || effect.type === 'poison_dot') effectDiv.classList.add('debuff');
            else effectDiv.classList.add('neutral');
            let effectText = effect.type.replace(/_/g, ' ').toUpperCase();
            if (typeof effect.value === 'number') effectText += ` (${effect.value > 0 && !String(effect.type).includes("Percent") ? '+' : ''}${effect.value}${String(effect.type).includes("Percent") ? '%' : ''})`;
            if (typeof effect.duration === 'number') effectText += ` [${effect.duration}t]`;
            effectDiv.textContent = effectText;
            effectDiv.title = effect.description || effectText;
            statusArea.appendChild(effectDiv);
        });
    }
}

/**
 * Updates all monster-related statistics and sprite in the UI.
 */
function updateMonsterStatsUI() {
    try {
        if (!monsterNameDisplay || !monsterTypeDisplay || !monsterHpText || !monsterHpFill || !monsterSprite) {
            console.warn("Script.js: Monster UI elements missing."); return;
        }
        if (currentMonster) {
            monsterNameDisplay.textContent = currentMonster.isBoss ? `BOSS: ${currentMonster.name}` : currentMonster.name;
            monsterTypeDisplay.textContent = currentMonster.type;
            if (monsterTypeDisplay.dataset) monsterTypeDisplay.dataset.type = currentMonster.type;
            if (monsterLevelDisplay) monsterLevelDisplay.textContent = currentMonster.level || (playerData ? playerData.level : 1);
            monsterHpText.textContent = `${currentMonster.hp}/${currentMonster.maxHp}`;
            const hpPercent = (currentMonster.hp / currentMonster.maxHp) * 100;
            monsterHpFill.style.width = `${Math.max(0, hpPercent)}%`;
            if (monsterHpFill.parentElement && typeof monsterHpFill.parentElement.setAttribute === 'function') { monsterHpFill.parentElement.setAttribute('aria-valuenow', currentMonster.hp); monsterHpFill.parentElement.setAttribute('aria-valuemax', currentMonster.maxHp); }
            monsterSprite.src = (monsterSprites && monsterSprites[currentMonster.spriteKey]) || (monsterSprites ? monsterSprites.DefaultMonster : '');
            monsterSprite.alt = currentMonster.name;
            monsterSprite.style.display = 'block';
        } else {
            monsterNameDisplay.textContent = gameOver ? "GAME OVER" : (currentArea === 'town' ? "Runehaven" : "Victory!");
            monsterTypeDisplay.textContent = "---";
            if (monsterTypeDisplay.dataset) monsterTypeDisplay.dataset.type = "";
            if (monsterLevelDisplay) monsterLevelDisplay.textContent = "--";
            monsterHpText.textContent = "---/---";
            monsterHpFill.style.width = "0%";
            if (monsterHpFill.parentElement && typeof monsterHpFill.parentElement.setAttribute === 'function') { monsterHpFill.parentElement.setAttribute('aria-valuenow', 0); monsterHpFill.parentElement.setAttribute('aria-valuemax', 100); }
            monsterSprite.src = gameOver ? (monsterSprites ? monsterSprites.GameOver : '') : (currentArea === 'town' && heroAvatars ? heroAvatars.Default : (monsterSprites ? monsterSprites.Victory : ''));
            monsterSprite.alt = gameOver ? "Game Over" : (currentArea === 'town' ? "Town" : "No monster");
        }
        if (monstersDefeatedCounter) monstersDefeatedCounter.textContent = regularMonsterDefeatCount;
        if (nextBossCounter) {
            const remaining = BOSS_MONSTER_INTERVAL - (regularMonsterDefeatCount % BOSS_MONSTER_INTERVAL);
            nextBossCounter.textContent = (regularMonsterDefeatCount > 0 && remaining === BOSS_MONSTER_INTERVAL) ? "NOW!" : remaining.toString();
        }
        if (typeof updateMonsterStatusEffectsUI === 'function') updateMonsterStatusEffectsUI();
    } catch (e) { console.error("Script.js: Error updating monster stats UI:", e); if(typeof showError === 'function') showError("Error updating monster UI.", e); }
}

/**
 * Updates the display of monster's active status effects.
 */
function updateMonsterStatusEffectsUI() {
    const statusArea = document.getElementById('monster-status-effects-area');
    if (!statusArea) return;
    statusArea.innerHTML = '';
    if (currentMonster && currentMonster.statusEffects && currentMonster.statusEffects.length > 0) {
        currentMonster.statusEffects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.classList.add('status-effect');
            if (effect.type.includes('_up')) effectDiv.classList.add('buff');
            else if (effect.type.includes('_down') || effect.type === 'poison_dot') effectDiv.classList.add('debuff');
            else effectDiv.classList.add('neutral');
            let effectText = effect.type.replace(/_/g, ' ').toUpperCase();
            if (typeof effect.value === 'number') effectText += ` (${effect.value > 0 && !String(effect.type).includes("Percent") ? '+' : ''}${effect.value}${String(effect.type).includes("Percent") ? '%' : ''})`;
            if (typeof effect.duration === 'number') effectText += ` [${effect.duration}t]`;
            effectDiv.textContent = effectText;
            effectDiv.title = effect.description || effectText;
            statusArea.appendChild(effectDiv);
        });
    }
}

/**
 * Updates the display of skill mastery progress. (Placeholder)
 */
function updateMasteryProgressUI() {
    const masteryDisplay = document.getElementById('mastery-progress-display');
    if (masteryDisplay) {
        masteryDisplay.innerHTML = '<p class="mastery-info">Skill mastery system coming soon.</p>';
    }
}

/**
 * Updates the player's gold display in the shop UI.
 */
function updateShopPlayerGold() {
    if (shopPlayerGoldDisplay && window.playerData) shopPlayerGoldDisplay.textContent = playerData.gold;
    else if (shopPlayerGoldDisplay) shopPlayerGoldDisplay.textContent = "N/A";
}

/**
 * Returns a standard melee attack skill object.
 */
function getMeleeAttackSkill() {
    return {
        id: MELEE_ATTACK_ID, name: "Melee", manaCost: 0,
        description: `Basic attack. Deals physical damage. Regenerates ${MELEE_MANA_REGEN} MP.`,
        icon: "⚔️", effects: { damageBasePercent: MELEE_DAMAGE_BASE_PERCENT_OF_ATTACK, type: "Normal", target: "enemy", manaRegen: MELEE_MANA_REGEN }
    };
}

/**
 * Defines the player's skills based on their chosen rune.
 */
function definePlayerSkills(rune) {
    try {
        console.log(`Script.js: Defining skills for ${rune} rune.`);
        let elementalSkills = [];
        const baseSkillValues = { /* ... (same as before) ... */ 
            fireballDamage: 12, flameLashDamage: 20, cauterizeHeal: 20,
            aquaJetDamage: 11, tidalCrashDamage: 22, soothingMistHeal: 25,
            vineLashDamage: 13, earthSpikeDamage: 19, regenerateHeal: 22,
            holySparkDamage: 14, divineShieldValue: 5, flashHeal: 30,
            shadowBoltDamage: 14, lifeDrainDamage: 12, lifeDrainHealPercent: 0.6
        };
        switch (rune) {
            case 'Fire':
                elementalSkills = [
                    { id: "fire_fireball", name: "Fireball", manaCost: 10, description: "Hurl a basic fireball.", icon: "🔥", effects: { damage: baseSkillValues.fireballDamage, type: "Fire", target: "enemy" } },
                    { id: "fire_flame_lash", name: "Flame Lash", manaCost: 18, description: "A whip of searing flames.", icon: "☄️", effects: { damage: baseSkillValues.flameLashDamage, type: "Fire", target: "enemy" } },
                    { id: "fire_cauterize", name: "Cauterize", manaCost: 15, description: "Heal wounds with fire.", icon: "❤️‍🔥", effects: { heal: baseSkillValues.cauterizeHeal, type: "Fire", target: "self" } }
                ]; break;
            case 'Water':
                elementalSkills = [
                    { id: "water_aqua_jet", name: "Aqua Jet", manaCost: 9, description: "Swiftly strike with water.", icon: "💧", effects: { damage: baseSkillValues.aquaJetDamage, type: "Water", target: "enemy" } },
                    { id: "water_tidal_crash", name: "Tidal Crash", manaCost: 20, description: "A powerful wave.", icon: "🌊", effects: { damage: baseSkillValues.tidalCrashDamage, type: "Water", target: "enemy" } },
                    { id: "water_soothing_mist", name: "Soothing Mist", manaCost: 16, description: "A healing mist.", icon: "💨", effects: { heal: baseSkillValues.soothingMistHeal, type: "Water", target: "self" } }
                ]; break;
            case 'Nature':
                elementalSkills = [
                    { id: "nature_vine_lash", name: "Vine Lash", manaCost: 11, description: "Strike with thorny vine.", icon: "🌿", effects: { damage: baseSkillValues.vineLashDamage, type: "Nature", target: "enemy" } },
                    { id: "nature_earth_spike", name: "Earth Spike", manaCost: 19, description: "Spike from ground.", icon: "⛰️", effects: { damage: baseSkillValues.earthSpikeDamage, type: "Nature", target: "enemy" } },
                    { id: "nature_regenerate", name: "Regenerate", manaCost: 17, description: "Gradually restore health.", icon: "✨", effects: { heal: baseSkillValues.regenerateHeal, type: "Nature", target: "self" } }
                ]; break;
            case 'Light': 
                 elementalSkills = [
                    { id: "light_holy_spark", name: "Holy Spark", manaCost: 12, description: "A spark of pure light.", icon: "🌟", effects: { damage: baseSkillValues.holySparkDamage, type: "Light", target: "enemy" } },
                    { id: "light_divine_shield", name: "Divine Shield", manaCost: 20, description: `Boosts Defense by ${baseSkillValues.divineShieldValue}.`, icon: "🛡️", effects: { buff: "defense_up", value: baseSkillValues.divineShieldValue, duration: 3, type: "Light", target: "self", description: `Increases Defense by ${baseSkillValues.divineShieldValue} for 3 turns.` } },
                    { id: "light_flash_heal", name: "Flash Heal", manaCost: 18, description: "Quick healing light.", icon: "💡", effects: { heal: baseSkillValues.flashHeal, type: "Light", target: "self" } }
                ]; break;
            case 'Dark': 
                elementalSkills = [
                    { id: "dark_shadow_bolt", name: "Shadow Bolt", manaCost: 12, description: "Bolt of dark energy.", icon: "🌑", effects: { damage: baseSkillValues.shadowBoltDamage, type: "Dark", target: "enemy" } },
                    { id: "dark_life_drain", name: "Life Drain", manaCost: 22, description: `Drain ${baseSkillValues.lifeDrainDamage} HP, heal portion.`, icon: "💀", effects: { damage: baseSkillValues.lifeDrainDamage, healPercentOfDamage: baseSkillValues.lifeDrainHealPercent, type: "Dark", target: "enemy", description: `Deals ${baseSkillValues.lifeDrainDamage} Dark damage, heals ${baseSkillValues.lifeDrainHealPercent*100}% of damage.` } },
                    { id: "dark_cloak_shadows", name: "Cloak of Shadows", manaCost: 18, description: "Increase evasion 20%.", icon: "👻", effects: { buff: "evasion_up", value: 0.20, duration: 2, type: "Dark", target: "self", description: "Evasion +20% for 2 turns." } }
                ]; break;
            default: 
                console.error(`Script.js: Unknown rune "${rune}" in definePlayerSkills.`);
                if(typeof showError === 'function') showError(`Unknown rune: ${rune}.`); 
                elementalSkills = [];
        }
        playerData.skills = [getMeleeAttackSkill(), ...elementalSkills].map(skill => ({ ...skill, action: () => useSkillAction(skill) }));
        if(typeof renderSkillButtons === 'function') renderSkillButtons();
        else console.error("Script.js: renderSkillButtons undefined.");
    } catch (e) { console.error("Script.js: Error defining skills:", e); if(typeof showError === 'function') showError("Error defining skills.", e); playerData.skills = [getMeleeAttackSkill()].map(skill => ({ ...skill, action: () => useSkillAction(skill) })); if(typeof renderSkillButtons === 'function') renderSkillButtons();}
}

/**
 * Renders the player's skills as buttons in the UI.
 */
function renderSkillButtons() {
    try {
        if (!skillButtonsArea) { console.error("Script.js: skillButtonsArea missing."); return; }
        skillButtonsArea.innerHTML = ''; 
        if (!playerData.skills || playerData.skills.length === 0) {
            skillButtonsArea.innerHTML = '<p>No skills.</p>'; return;
        }
        playerData.skills.forEach(skill => {
            const button = document.createElement('button'); 
            button.className = 'action-button skill-button';
            if (skill.id === MELEE_ATTACK_ID) button.classList.add('melee-attack-button');
            button.title = skill.description || skill.name;
            button.innerHTML = `
                <span class="skill-icon-placeholder">${skill.icon || '❓'}</span>
                <span class="skill-name-display">${skill.name}</span>
                <span class="skill-cost-display">${skill.manaCost > 0 ? `(MP: ${skill.manaCost})` : (skill.id === MELEE_ATTACK_ID ? `(Regen MP)`: `(Free)`)}</span>`;
            button.onclick = skill.action;
            skillButtonsArea.appendChild(button);
        });
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error rendering skill buttons:", e); if(typeof showError === 'function') showError("Error rendering skills.", e); }
}

/**
 * Updates the enabled/disabled state of skill buttons.
 */
function updateSkillButtonsAvailability() {
    try {
        if (!skillButtonsArea || !playerData || !playerData.skills) return;
        const buttons = skillButtonsArea.querySelectorAll('.skill-button');
        buttons.forEach((button, index) => {
            const skill = playerData.skills[index];
            if (skill && button) {
                const canUseMelee = !gameOver && !combatLock && isPlayerTurn && currentMonster && currentMonster.hp > 0;
                const canUseSpell = canUseMelee && playerData.mana >= skill.manaCost;
                button.disabled = (skill.id === MELEE_ATTACK_ID) ? !canUseMelee : !canUseSpell;
                button.classList.toggle('no-mana', playerData.mana < skill.manaCost && skill.id !== MELEE_ATTACK_ID);
            } else if (button) { button.disabled = true; }
        });
        const inCombat = currentMonster && currentMonster.hp > 0;
        if (shopButton) shopButton.disabled = gameOver || combatLock || inCombat;
        if (runeSwapButton) runeSwapButton.disabled = gameOver || combatLock || inCombat;
        if (inventoryButton) inventoryButton.disabled = gameOver || combatLock || (inCombat && !isPlayerTurn);
        if (leaveTownButton) leaveTownButton.disabled = gameOver || combatLock || inCombat;
    } catch (e) { console.error("Script.js: Error updating skill button availability:", e); if(typeof showError === 'function') showError("Error updating skill states.", e); }
}

// --- END OF SCRIPT.JS PART 2 (NEW STRUCTURE) ---

// --- (Ensure Part 1 and Part 2 of the new script.js are above this point) ---

// --- START OF SCRIPT.JS PART 3 --- Combat, Status Effects, Progression, Modals ---

// --- Combat Calculations & Core Skill Action ---

/**
 * Calculates the damage a player's skill will deal to a target monster.
 * Considers player's attack power, skill's base damage/multiplier, player level,
 * elemental advantages/disadvantages, and monster's defense.
 * @param {object} skill - The skill object being used.
 * @param {object} targetMonster - The monster object being targeted.
 * @returns {number} The calculated damage amount.
 */
function calculatePlayerDamage(skill, targetMonster) {
    try {
        if (!playerData || !skill || !targetMonster) {
            console.error("Script.js: Missing data for player damage calculation.", {playerData, skill, targetMonster});
            return 1; // Minimal damage if data is missing
        }

        let baseDamage = 0;
        const skillEffects = skill.effects || {};

        if (skill.id === MELEE_ATTACK_ID) {
            baseDamage = playerData.attackPower * (skillEffects.damageBasePercent || 1.0);
        } else {
            baseDamage = (skillEffects.damage || 0) + (playerData.level - 1) * PLAYER_SKILL_DAMAGE_SCALING_FACTOR;
        }
        
        if (skillEffects.type === playerData.rune && playerData.elementalBoostPercent > 0) {
            baseDamage *= (1 + playerData.elementalBoostPercent);
            if (typeof addLogMessage === 'function') addLogMessage(`(${playerData.rune} Boost!)`, "combat-info");
        }

        const skillBoostEffectIndex = playerData.statusEffects.findIndex(e => e.type === "skill_boost");
        if (skillBoostEffectIndex > -1) {
            const skillBoostEffect = playerData.statusEffects[skillBoostEffectIndex];
            baseDamage *= (1 + skillBoostEffect.value);
            if (typeof addLogMessage === 'function') addLogMessage("Skill empowered by scroll!", "success");
            playerData.statusEffects[skillBoostEffectIndex].duration--;
            if (playerData.statusEffects[skillBoostEffectIndex].duration <= 0) {
                playerData.statusEffects.splice(skillBoostEffectIndex, 1);
            }
            if(typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
        }

        const elementalMultiplier = getElementalMultiplier(skillEffects.type, targetMonster.type);
        
        if (typeof addLogMessage === 'function') {
            if (elementalMultiplier > 1.5) addLogMessage("It's super effective!", "combat-player");
            else if (elementalMultiplier < 0.75 && elementalMultiplier > 0) addLogMessage("It's not very effective...", "combat-player");
            else if (elementalMultiplier === 0) addLogMessage(`${targetMonster.name} is immune to ${skillEffects.type}!`, "combat-info");
        }

        let damageAfterElemental = baseDamage * elementalMultiplier;
        let finalDamage = Math.max(elementalMultiplier === 0 ? 0 : 1, Math.floor(damageAfterElemental - (targetMonster.defense || 0)));
        
        // console.log(`Script.js: Player damage: Base=${baseDamage.toFixed(1)}, ElemMult=${elementalMultiplier}, Final=${finalDamage}`);
        return finalDamage;

    } catch (error) {
        console.error("Script.js: Error in calculatePlayerDamage:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating player damage.", error);
        return 1; 
    }
}

/**
 * Calculates the amount a player's skill will heal.
 * @param {object} skill - The healing skill object.
 * @returns {number} The calculated heal amount.
 */
function calculatePlayerHeal(skill) {
    try {
        if (!playerData || !skill || !skill.effects || typeof skill.effects.heal !== 'number') {
            console.error("Script.js: Missing data for player heal calculation.");
            return 0;
        }
        let finalHeal = skill.effects.heal + (playerData.level - 1) * PLAYER_HEAL_SCALING_FACTOR;
        return Math.floor(finalHeal);
    } catch (error) {
        console.error("Script.js: Error in calculatePlayerHeal:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating player heal.", error);
        return 0; 
    }
}

/**
 * Calculates the damage a monster's skill will deal to the player.
 * @param {object} monsterSkill - The monster's skill object.
 * @param {object} targetPlayer - The player data object.
 * @returns {number} The calculated damage amount.
 */
function calculateMonsterDamage(monsterSkill, targetPlayer) {
    try {
        if (!currentMonster || !monsterSkill || !targetPlayer) {
            console.error("Script.js: Missing data for monster damage calculation.");
            return 1; 
        }
        
        const skillEffects = monsterSkill.effects || {}; 
        let baseDamage = (currentMonster.attack || 5) * (monsterSkill.damageMultiplier || 1.0);
        const elementalMultiplier = getElementalMultiplier(monsterSkill.type, targetPlayer.rune);

        if (typeof addLogMessage === 'function') {
            if (elementalMultiplier > 1.5) addLogMessage("The attack is super effective against you!", "combat-monster");
            else if (elementalMultiplier < 0.75 && elementalMultiplier > 0) addLogMessage("Your rune resists some of the damage!", "combat-info");
            else if (elementalMultiplier === 0) addLogMessage(`You are immune to ${monsterSkill.type}!`, "success");
        }

        let damageAfterElemental = baseDamage * elementalMultiplier;
        let finalDamage = Math.max(elementalMultiplier === 0 ? 0 : 1, Math.floor(damageAfterElemental - (targetPlayer.defense || 0)));
        
        // console.log(`Script.js: Monster damage: Base=${baseDamage.toFixed(1)}, ElemMult=${elementalMultiplier}, Final=${finalDamage}`);
        return finalDamage;

    } catch (error) {
        console.error("Script.js: Error in calculateMonsterDamage:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating monster damage.", error);
        return 1; 
    }
}

/**
 * Determines the damage multiplier based on elemental interactions.
 * @param {string} attackerType - The elemental type of the attacker.
 * @param {string} targetType - The elemental type of the target.
 * @returns {number} The damage multiplier.
 */
function getElementalMultiplier(attackerType, targetType) {
    if (!attackerType || !targetType || !ELEMENTAL_TYPES || !ELEMENTAL_TYPES[attackerType] || !ELEMENTAL_TYPES[targetType]) {
        return 1.0; 
    }
    const attackerElement = ELEMENTAL_TYPES[attackerType];
    if (attackerElement.strong && attackerElement.strong.includes(targetType)) return 2.0;
    if (attackerElement.weak && attackerElement.weak.includes(targetType)) return 0.5;
    if (attackerElement.immune && attackerElement.immune.includes(targetType)) return 0.0;
    return 1.0;
}

/**
 * Handles the execution of a player's skill.
 * @param {object} skill - The skill object to be used.
 */
function useSkillAction(skill) {
    try {
        if (gameOver || combatLock || !isPlayerTurn) { return; }
        if (!currentMonster || currentMonster.hp <= 0) { 
            if(typeof addLogMessage === 'function') addLogMessage("There is no target.", "warning"); 
            if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
            return; 
        }
        if (skill.id !== MELEE_ATTACK_ID && playerData.mana < skill.manaCost) {
            if(typeof addLogMessage === 'function') addLogMessage(`Not enough mana for ${skill.name}.`, 'warning'); 
            return; 
        }

        combatLock = true; isPlayerTurn = false;
        if (skill.id !== MELEE_ATTACK_ID && skill.manaCost > 0) playerData.mana -= skill.manaCost;

        if(typeof addLogMessage === 'function') addLogMessage(`Player used ${skill.name}!`, 'combat-player');
        const skillEffects = skill.effects || {};

        if (skillEffects.target === "enemy" && (typeof skillEffects.damage === 'number' || typeof skillEffects.damageBasePercent === 'number')) {
            const damageDealt = calculatePlayerDamage(skill, currentMonster);
            currentMonster.hp = Math.max(0, currentMonster.hp - damageDealt);
            if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} hits ${currentMonster.name} for ${damageDealt} damage!`, 'combat-player');
            if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('damage-animation'); setTimeout(() => monsterSprite.classList.remove('damage-animation'), 300); }
            if (skillEffects.healPercentOfDamage && damageDealt > 0) {
                const healedAmount = Math.floor(damageDealt * skillEffects.healPercentOfDamage);
                if (healedAmount > 0) {
                    playerData.hp = Math.min(playerData.maxHp, playerData.hp + healedAmount);
                    if(typeof addLogMessage === 'function') addLogMessage(`Player drained ${healedAmount} HP!`, "success");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 500); }
                }
            }
        }
        if (skillEffects.target === "self" && typeof skillEffects.heal === 'number') {
            const healAmount = calculatePlayerHeal(skill);
            if (healAmount > 0) {
                const oldHp = playerData.hp;
                playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
                if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} heals Player for ${playerData.hp - oldHp} HP.`, 'success');
                if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 500); }
            } else if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} had no effect.`, 'info');
        }
        if (typeof skillEffects.manaRegen === 'number' && skillEffects.manaRegen > 0) {
            const manaGained = Math.min(skillEffects.manaRegen, playerData.maxMana - playerData.mana);
            if (manaGained > 0) { playerData.mana += manaGained; if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} regenerates ${manaGained} MP!`, "mana-regen"); }
        }
        if (skillEffects.buff && typeof applyStatusEffect === 'function') { 
            applyStatusEffect(playerData, skillEffects.buff, skillEffects.value, skillEffects.duration, skillEffects.description);
            if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('buff-animation'); setTimeout(() => playerAvatar.classList.remove('buff-animation'), 500); }
        }
        if (skillEffects.debuff && skillEffects.target === "enemy" && typeof applyStatusEffect === 'function') { 
             if (currentMonster) applyStatusEffect(currentMonster, skillEffects.debuff, skillEffects.value, skillEffects.duration, skillEffects.description);
        }

        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        
        if (currentMonster && currentMonster.hp <= 0) {
            if(typeof monsterDefeated === 'function') monsterDefeated();
            else { if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} defeated! (Handler missing)`, "success"); currentMonster = null; if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); combatLock = false; isPlayerTurn = true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
        } else {
            setTimeout(() => {
                if (currentMonster && currentMonster.hp > 0 && typeof monsterTurn === 'function') monsterTurn();
                else { combatLock = false; isPlayerTurn = true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
            }, 800); 
        }
    } catch (error) {
        console.error("Script.js: Error in useSkillAction:", skill, error);
        if(typeof showError === 'function') showError("Error during skill use.", error);
        combatLock = false; isPlayerTurn = true;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    }
}

/**
 * Applies a status effect to a target.
 */
function applyStatusEffect(target, effectType, value, duration, description) {
    try {
        if (!target || !effectType || typeof duration !== 'number') { console.error("Script.js: Invalid args for applyStatusEffect."); return; }
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects = target.statusEffects.filter(e => e.type !== effectType); // Remove old, refresh
        const newEffect = { type: effectType, duration: duration, value: value, description: description || effectType.replace(/_/g, ' ').toUpperCase(), initialApplicationTurn: window.combatTurnCounter || 0 };
        let statChanged = false;
        if (effectType === "defense_up" && typeof target.defense === 'number' && typeof value === 'number') { newEffect.originalValue = target.defense; target.defense += value; statChanged = true; }
        else if (effectType === "attack_up" && typeof target.attack === 'number' && typeof value === 'number') { newEffect.originalValue = target.attack; target.attack += value; statChanged = true; }
        else if (effectType === "defense_down" && typeof target.defense === 'number' && typeof value === 'number') { newEffect.originalValue = target.defense; target.defense = Math.max(0, target.defense - value); statChanged = true; }
        else if (effectType === "attack_down" && typeof target.attack === 'number' && typeof value === 'number') { newEffect.originalValue = target.attack; target.attack = Math.max(1, target.attack - value); statChanged = true; }
        target.statusEffects.push(newEffect);
        if(typeof addLogMessage === 'function') addLogMessage(`${target === playerData ? "Player" : target.name} is affected by ${newEffect.description}!`, target === playerData ? "combat-player" : "combat-monster");
        if (statChanged) { 
            if (target === playerData && typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
            else if (target === currentMonster && typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        }
        if (target === playerData && typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
        else if (target === currentMonster && typeof updateMonsterStatusEffectsUI === 'function') updateMonsterStatusEffectsUI();
    } catch (e) { console.error("Script.js: Error applying status effect:", e); if(typeof showError === 'function') showError("Error applying status.", e); }
}

/**
 * Processes active status effects for player and monster.
 */
function processStatusEffects() {
    try {
        if (!playerData || !playerData.statusEffects) return; 
        const processTarget = (target, isPlayerTarget) => {
            if (!target || !target.statusEffects || !Array.isArray(target.statusEffects)) return;
            let effectsUINeedsUpdate = false;
            target.statusEffects = target.statusEffects.filter(effect => {
                let effectExpired = false;
                if (effect.type === "poison_dot" && typeof effect.value === 'number') {
                    const dotDamage = Math.max(1, Math.floor(effect.value - (target.defenseDotResist || 0)));
                    target.hp = Math.max(0, target.hp - dotDamage);
                    if(typeof addLogMessage === 'function') addLogMessage(`${isPlayerTarget ? "Player" : target.name} takes ${dotDamage} poison damage!`, isPlayerTarget ? "combat-player" : "combat-monster");
                    effectsUINeedsUpdate = true;
                    if (target.hp <= 0) {
                        if (isPlayerTarget && typeof handlePlayerDeath === 'function') handlePlayerDeath();
                        else if (!isPlayerTarget && target === currentMonster && typeof monsterDefeated === 'function') monsterDefeated();
                        effectExpired = true; 
                    }
                }
                if (effectExpired) return false; 
                effect.duration--;
                if (effect.duration <= 0) {
                    let statReverted = false;
                    if (effect.originalValue !== undefined) { 
                        if (effect.type === "defense_up" && typeof target.defense === 'number') { target.defense = effect.originalValue; statReverted = true; }
                        else if (effect.type === "attack_up" && typeof target.attack === 'number') { target.attack = effect.originalValue; statReverted = true; }
                        else if (effect.type === "defense_down" && typeof target.defense === 'number') { target.defense = effect.originalValue; statReverted = true; }
                        else if (effect.type === "attack_down" && typeof target.attack === 'number') { target.attack = effect.originalValue; statReverted = true; }
                    }
                    if(typeof addLogMessage === 'function') addLogMessage(`${isPlayerTarget ? "Player's" : (target.name || "Target")}'s ${effect.description || effect.type} wore off.`, "info");
                    effectsUINeedsUpdate = true;
                    if (statReverted) { 
                         if (isPlayerTarget && typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
                         else if (!isPlayerTarget && target === currentMonster && typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
                    }
                    return false; 
                }
                return true; 
            });
            if (effectsUINeedsUpdate) { 
                if (isPlayerTarget && typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
                else if (!isPlayerTarget && target === currentMonster && typeof updateMonsterStatusEffectsUI === 'function') updateMonsterStatusEffectsUI();
            }
        };
        processTarget(playerData, true);
        if (currentMonster) processTarget(currentMonster, false);
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        if(typeof updateMonsterStatsUI === 'function' && currentMonster) updateMonsterStatsUI(); 
    } catch (e) { console.error("Script.js: Error processing status effects:", e); if(typeof showError === 'function') showError("Error processing effects.", e); }
}

/**
 * Handles the monster's turn in combat.
 */
function monsterTurn() {
    try {
        if (gameOver || !currentMonster || currentMonster.hp <= 0) {
            isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); return;
        }
        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name}'s turn...`, "combat-monster");
        const evasionEffect = playerData.statusEffects.find(e => e.type === "evasion_up");
        if (evasionEffect && Math.random() < (evasionEffect.value || 0)) {
            if(typeof addLogMessage === 'function') addLogMessage(`Player dodged ${currentMonster.name}'s attack!`, "success");
        } else {
            let chosenMonsterSkill = null;
            if (currentMonster.skills && currentMonster.skills.length > 0) {
                let cumulativeChance = 0; const randomRoll = Math.random();
                for (const skill of currentMonster.skills) {
                    cumulativeChance += (skill.chance || (1.0 / currentMonster.skills.length)); 
                    if (randomRoll < cumulativeChance) { chosenMonsterSkill = skill; break; }
                }
                if (!chosenMonsterSkill) chosenMonsterSkill = currentMonster.skills[currentMonster.skills.length - 1];
            }
            if (chosenMonsterSkill) {
                if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} uses ${chosenMonsterSkill.name}! (${chosenMonsterSkill.description || 'A fearsome move!'})`, "combat-monster");
                const skillEffects = chosenMonsterSkill.effects || {}; 
                if (chosenMonsterSkill.damageMultiplier > 0 || typeof skillEffects.damage === 'number') {
                    const damageDealt = calculateMonsterDamage(chosenMonsterSkill, playerData);
                    playerData.hp = Math.max(0, playerData.hp - damageDealt);
                    if(typeof addLogMessage === 'function') addLogMessage(`${chosenMonsterSkill.name} hits Player for ${damageDealt} damage!`, "combat-monster");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('damage-animation'); setTimeout(() => playerAvatar.classList.remove('damage-animation'), 300); }
                }
                if (skillEffects.buff && chosenMonsterSkill.target !== "enemy" && typeof applyStatusEffect === 'function') { 
                     applyStatusEffect(currentMonster, skillEffects.buff, skillEffects.value, skillEffects.duration, skillEffects.description);
                     if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('buff-animation'); setTimeout(() => monsterSprite.classList.remove('buff-animation'), 500); }
                }
                if (skillEffects.debuff && chosenMonsterSkill.target !== "self" && typeof applyStatusEffect === 'function') { 
                     applyStatusEffect(playerData, skillEffects.debuff, skillEffects.value, skillEffects.duration, skillEffects.description);
                }
                if (skillEffects.effect === "hp_drain" && (chosenMonsterSkill.damageMultiplier > 0 || typeof skillEffects.damage === 'number')) {
                    const damageDealtToPlayer = calculateMonsterDamage(chosenMonsterSkill, playerData); 
                    playerData.hp = Math.max(0, playerData.hp - damageDealtToPlayer);
                     if(typeof addLogMessage === 'function') addLogMessage(`${chosenMonsterSkill.name} deals ${damageDealtToPlayer} damage to Player!`, "combat-monster");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('damage-animation'); setTimeout(() => playerAvatar.classList.remove('damage-animation'), 300); }
                    const healedAmount = Math.floor(damageDealtToPlayer * (skillEffects.healPercentOfDamage || 0.5)); 
                    if (healedAmount > 0) {
                        currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healedAmount);
                        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} drained ${healedAmount} HP!`, "combat-info");
                        if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('heal-animation'); setTimeout(() => monsterSprite.classList.remove('heal-animation'), 500); }
                    }
                }
            } else if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} hesitates...`, "combat-monster");
        }
        if(typeof processStatusEffects === 'function') processStatusEffects(); 
        else { if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); }
        if (playerData.hp <= 0) {
            if(typeof handlePlayerDeath === 'function') handlePlayerDeath();
            else { gameOver = true; if(typeof addLogMessage === 'function') addLogMessage("Player defeated! (Handler missing)","error");}
        } else {
            isPlayerTurn = true; combatLock = false;
            if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
            if(typeof addLogMessage === 'function') addLogMessage("Your turn!", "info");
        }
    } catch (e) { console.error("Script.js: Error in monsterTurn:", e); if(typeof showError === 'function') showError("Error in monster's turn.", e); isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
}

/**
 * Handles monster defeat.
 */
function monsterDefeated() {
    try {
        if (gameOver || !currentMonster) return; 
        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} defeated!`, "success");
        playerData.exp += currentMonster.expReward; playerData.gold += currentMonster.goldReward;
        if(typeof addLogMessage === 'function') addLogMessage(`Gained ${currentMonster.expReward} EXP & ${currentMonster.goldReward} Gold.`, "event");
        if (!currentMonster.isBoss) regularMonsterDefeatCount++;
        const hpHeal = Math.floor(playerData.maxHp * HEAL_ON_DEFEAT_PERCENT_HP);
        const manaRegen = Math.floor(playerData.maxMana * REGEN_ON_DEFEAT_PERCENT_MANA);
        const actualHpHeal = Math.min(hpHeal, playerData.maxHp - playerData.hp);
        if (actualHpHeal > 0) { playerData.hp += actualHpHeal; if(typeof addLogMessage === 'function') addLogMessage(`Recovered ${actualHpHeal} HP.`, "success"); if(playerAvatar && playerAvatar.classList){playerAvatar.classList.add('heal-animation'); setTimeout(()=>playerAvatar.classList.remove('heal-animation'),600);}}
        const actualManaRegen = Math.min(manaRegen, playerData.maxMana - playerData.mana);
        if (actualManaRegen > 0) { playerData.mana += actualManaRegen; if(typeof addLogMessage === 'function') addLogMessage(`Recovered ${actualManaRegen} MP.`, "mana-regen");}
        const wasBoss = currentMonster.isBoss; currentMonster = null; 
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); 
        if(typeof checkLevelUp === 'function') checkLevelUp(); 
        else if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); 
        if (wasBoss) {
            const possibleRunes = ["Fire","Water","Nature","Light","Dark"].filter(r=>r!==playerData.rune && !playerData.unlockedRunes.includes(r));
            if (possibleRunes.length > 0) { const dropped = possibleRunes[Math.floor(Math.random()*possibleRunes.length)]; playerData.unlockedRunes.push(dropped); if(typeof addLogMessage === 'function') addLogMessage(`Boss dropped ${dropped} Rune fragment!`, "event-critical");}
            if(typeof addLogMessage === 'function') addLogMessage("Returning to Runehaven...", "info");
            setTimeout(() => { if (typeof enterTown === 'function' && GAME_AREAS && GAME_AREAS.town) enterTown(GAME_AREAS.town); }, 2000);
        } else {
            if ((regularMonsterDefeatCount % BOSS_MONSTER_INTERVAL) === 0 && regularMonsterDefeatCount > 0) {
                if(typeof addLogMessage === 'function') addLogMessage("A powerful foe approaches!", "event-critical");
                setTimeout(() => { if(typeof spawnBossMonster === 'function') spawnBossMonster(); }, 1500);
            } else if(typeof showPostBattleOptions === 'function') showPostBattleOptions();
        }
        combatLock = false; isPlayerTurn = true;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error in monsterDefeated:", e); if(typeof showError === 'function') showError("Error processing defeat.", e); combatLock=false; isPlayerTurn=true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
}

/**
 * Displays post-battle options.
 */
function showPostBattleOptions() {
    try {
        let container = document.getElementById('post-battle-options');
        const footer = document.getElementById('combat-actions-container');
        if (!container && footer && footer.parentNode) { container = document.createElement('div'); container.id='post-battle-options'; container.className='post-battle-options'; footer.parentNode.insertBefore(container, footer.nextSibling); }
        else if (!container) { console.error("Script.js: Cannot find place for post-battle options."); return; }
        container.innerHTML = ''; 
        const continueBtn = document.createElement('button'); continueBtn.className='action-button battle-btn'; continueBtn.textContent='Next Battle';
        continueBtn.onclick=()=>{ container.style.display='none'; if(GAME_AREAS && GAME_AREAS[currentArea] && typeof spawnAreaMonster==='function') spawnAreaMonster(GAME_AREAS[currentArea]); else {if(typeof addLogMessage==='function')addLogMessage("No more monsters. Returning to town.","warning"); if(typeof enterTown==='function' && GAME_AREAS && GAME_AREAS.town)enterTown(GAME_AREAS.town);}};
        const townBtn = document.createElement('button'); townBtn.className='action-button town-btn'; townBtn.textContent='Return to Town';
        townBtn.onclick=()=>{ container.style.display='none'; if(typeof enterTown==='function' && GAME_AREAS && GAME_AREAS.town)enterTown(GAME_AREAS.town);};
        container.appendChild(continueBtn); container.appendChild(townBtn); container.style.display='flex'; 
    } catch (e) { console.error("Script.js: Error in showPostBattleOptions:", e); if(typeof showError === 'function') showError("Error showing post-battle options.", e); }
}

/**
 * Handles player's defeat.
 */
function handlePlayerDeath() {
    try {
        if (playerData.hasRevivalStone) {
            if(typeof addLogMessage === 'function') addLogMessage("Revival Stone shatters, bringing you back!", "event-critical");
            playerData.hasRevivalStone = false; playerData.hp = Math.floor(playerData.maxHp * 0.5); 
            if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
            if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 800); }
            if(typeof addLogMessage === 'function') addLogMessage("Revived with 50% HP!", "success");
            isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); if(typeof addLogMessage === 'function') addLogMessage("Your turn!", "info");
        } else {
            gameOver = true; if(typeof addLogMessage === 'function') addLogMessage("Player defeated... GAME OVER.", "error");
            if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); 
            let retryBtn = document.getElementById('retry-button');
            if (!retryBtn) { retryBtn = document.createElement('button'); retryBtn.id='retry-button'; retryBtn.className='action-button'; retryBtn.textContent='Try Again'; retryBtn.style.marginTop='20px'; const cp = document.getElementById('center-panel'); if(cp)cp.appendChild(retryBtn); else if(gameScreen)gameScreen.appendChild(retryBtn); else document.body.appendChild(retryBtn);}
            retryBtn.style.display='block'; 
            retryBtn.onclick = () => {
                gameOver = false; 
                if (window.ScreenManager?.activateScreen) window.ScreenManager.activateScreen('rune-selection-screen');
                else if (typeof activateScreen === 'function') activateScreen('rune-selection-screen');
                else if (runeSelectionScreen) { if(typeof hideAllScreens==='function')hideAllScreens(); runeSelectionScreen.style.display='flex'; runeSelectionScreen.classList.add('active');}
                if(runeButtons?.length) runeButtons.forEach(b => { if(b) {b.disabled=false; b.style.opacity="1";}});
                retryBtn.remove(); 
            };
        }
    } catch (e) { console.error("Script.js: Error in handlePlayerDeath:", e); if(typeof showError === 'function') showError("Error handling player death.", e); }
}

/**
 * Checks for player level up.
 */
function checkLevelUp() {
    try {
        if (!playerData) return;
        if (playerData.exp >= playerData.nextLevelExp) {
            const oldStats = { level:playerData.level, maxHp:playerData.maxHp, maxMana:playerData.maxMana, attackPower:playerData.attackPower, defense:playerData.defense };
            playerData.level++; playerData.exp -= playerData.nextLevelExp; 
            playerData.nextLevelExp = Math.floor(INITIAL_EXP_TO_LEVEL * Math.pow(EXP_CURVE_FACTOR, playerData.level -1) + (EXP_CURVE_FLAT_ADDITION * (playerData.level-1)) );
            playerData.maxHp += PLAYER_HP_PER_LEVEL; playerData.maxMana += PLAYER_MANA_PER_LEVEL;
            playerData.attackPower += PLAYER_ATTACK_POWER_PER_LEVEL; playerData.defense += PLAYER_DEFENSE_PER_LEVEL;
            playerData.hp = playerData.maxHp; playerData.mana = playerData.maxMana;
            if(typeof addLogMessage === 'function') addLogMessage(`Player leveled up to Level ${playerData.level}!`, "level-up");
            if(typeof showLevelUpModal === 'function') showLevelUpModal(oldStats);
            if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); 
            if (playerData.exp >= playerData.nextLevelExp) setTimeout(checkLevelUp, 200); 
        }
    } catch (e) { console.error("Script.js: Error in checkLevelUp:", e); if(typeof showError === 'function') showError("Error processing level up.", e); }
}

/**
 * Displays the level up modal.
 */
function showLevelUpModal(oldStats) {
    try {
        if (!levelUpModal || !newLevelDisplay || !oldHpDisplay || !newHpDisplay || !oldMpDisplay || !newMpDisplay || !oldAttackDisplay || !newAttackDisplay || !oldDefenseDisplay || !newDefenseDisplay || !closeLevelUpModalButton) { console.warn("Script.js: Level up modal elements missing."); return; }
        newLevelDisplay.textContent = `Level ${playerData.level}`;
        oldHpDisplay.textContent = oldStats.maxHp; newHpDisplay.textContent = playerData.maxHp;
        oldMpDisplay.textContent = oldStats.maxMana; newMpDisplay.textContent = playerData.maxMana;
        oldAttackDisplay.textContent = oldStats.attackPower; newAttackDisplay.textContent = playerData.attackPower;
        oldDefenseDisplay.textContent = oldStats.defense; newDefenseDisplay.textContent = playerData.defense;
        const masteryUnlockDiv = document.getElementById('mastery-skill-unlock');
        const newSkillInfoDiv = document.getElementById('new-skill-info');
        if(masteryUnlockDiv && newSkillInfoDiv) {
            let newSkillUnlocked = null; 
            // Example: if (playerData.level === 3 && playerData.rune === "Fire" && !playerData.skills.find(s => s.id === "fire_advanced_skill")) { newSkillUnlocked = { name: "Adv. Fire Skill", icon: "🔥✨", description: "Powerful fire spell!" }; playerData.skills.push({ id: "fire_advanced_skill", name: "Adv. Fire Skill", /*...rest of skill...*/ action: ()=>useSkillAction(thisSkill) }); if(typeof renderSkillButtons==='function')renderSkillButtons(); }
            if (newSkillUnlocked) { newSkillInfoDiv.innerHTML = `<span class="new-skill-icon">${newSkillUnlocked.icon}</span><span class="new-skill-name">${newSkillUnlocked.name}</span><p class="new-skill-desc">${newSkillUnlocked.description}</p>`; masteryUnlockDiv.style.display = 'block';}
            else masteryUnlockDiv.style.display = 'none';
        }
        levelUpModal.style.display = 'flex'; levelUpModal.setAttribute('aria-hidden', 'false');
        if (!closeLevelUpModalButton.listenerAttached) { closeLevelUpModalButton.addEventListener('click', () => { levelUpModal.style.display = 'none'; levelUpModal.setAttribute('aria-hidden', 'true'); }); closeLevelUpModalButton.listenerAttached = true; }
    } catch (e) { console.error("Script.js: Error in showLevelUpModal:", e); if(typeof showError === 'function') showError("Error displaying level up modal.", e); }
}

// --- Area/Town Logic, Monster Spawning, Modals (Shop, Inventory, Rune Swap) ---
// (This is where the functions from Part 3.4 will go)
// For example:
// function showAreaSelection() { ... }
// function populateAreaSelection() { ... }
// function enterArea(areaKey) { ... }
// ... and so on for all functions related to areas, modals, and item management.

// --- Final Log Message for Script.js ---
// console.log("Script.js: All main parts loaded and initialized. Game should be ready."); // This will be moved to the very end.

// --- END OF SCRIPT.JS PART 3 (NEW STRUCTURE) --- 

// --- (Ensure Part 1 and Part 2 of the new script.js are above this point) ---

// --- START OF SCRIPT.JS PART 3 --- Combat, Status Effects, Progression, Modals & Game Logic ---

// --- Combat Calculations & Core Skill Action ---

/**
 * Calculates the damage a player's skill will deal to a target monster.
 * Considers player's attack power, skill's base damage/multiplier, player level,
 * elemental advantages/disadvantages, and monster's defense.
 * @param {object} skill - The skill object being used.
 * @param {object} targetMonster - The monster object being targeted.
 * @returns {number} The calculated damage amount.
 */
function calculatePlayerDamage(skill, targetMonster) {
    try {
        if (!playerData || !skill || !targetMonster) {
            console.error("Script.js: Missing data for player damage calculation.", {playerData, skill, targetMonster});
            return 1; // Minimal damage if data is missing
        }

        let baseDamage = 0;
        const skillEffects = skill.effects || {};

        if (skill.id === MELEE_ATTACK_ID) {
            baseDamage = playerData.attackPower * (skillEffects.damageBasePercent || 1.0);
        } else {
            baseDamage = (skillEffects.damage || 0) + (playerData.level - 1) * PLAYER_SKILL_DAMAGE_SCALING_FACTOR;
        }
        
        if (skillEffects.type === playerData.rune && playerData.elementalBoostPercent > 0) {
            baseDamage *= (1 + playerData.elementalBoostPercent);
            if (typeof addLogMessage === 'function') addLogMessage(`(${playerData.rune} Boost!)`, "combat-info");
        }

        const skillBoostEffectIndex = playerData.statusEffects.findIndex(e => e.type === "skill_boost");
        if (skillBoostEffectIndex > -1) {
            const skillBoostEffect = playerData.statusEffects[skillBoostEffectIndex];
            baseDamage *= (1 + skillBoostEffect.value);
            if (typeof addLogMessage === 'function') addLogMessage("Skill empowered by scroll!", "success");
            playerData.statusEffects[skillBoostEffectIndex].duration--;
            if (playerData.statusEffects[skillBoostEffectIndex].duration <= 0) {
                playerData.statusEffects.splice(skillBoostEffectIndex, 1);
            }
            if(typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
        }

        const elementalMultiplier = getElementalMultiplier(skillEffects.type, targetMonster.type);
        
        if (typeof addLogMessage === 'function') {
            if (elementalMultiplier > 1.5) addLogMessage("It's super effective!", "combat-player");
            else if (elementalMultiplier < 0.75 && elementalMultiplier > 0) addLogMessage("It's not very effective...", "combat-player");
            else if (elementalMultiplier === 0) addLogMessage(`${targetMonster.name} is immune to ${skillEffects.type}!`, "combat-info");
        }

        let damageAfterElemental = baseDamage * elementalMultiplier;
        let finalDamage = Math.max(elementalMultiplier === 0 ? 0 : 1, Math.floor(damageAfterElemental - (targetMonster.defense || 0)));
        
        // console.log(`Script.js: Player damage: Base=${baseDamage.toFixed(1)}, ElemMult=${elementalMultiplier}, Final=${finalDamage}`);
        return finalDamage;

    } catch (error) {
        console.error("Script.js: Error in calculatePlayerDamage:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating player damage.", error);
        return 1; 
    }
}

/**
 * Calculates the amount a player's skill will heal.
 * @param {object} skill - The healing skill object.
 * @returns {number} The calculated heal amount.
 */
function calculatePlayerHeal(skill) {
    try {
        if (!playerData || !skill || !skill.effects || typeof skill.effects.heal !== 'number') {
            console.error("Script.js: Missing data for player heal calculation.");
            return 0;
        }
        let finalHeal = skill.effects.heal + (playerData.level - 1) * PLAYER_HEAL_SCALING_FACTOR;
        return Math.floor(finalHeal);
    } catch (error) {
        console.error("Script.js: Error in calculatePlayerHeal:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating player heal.", error);
        return 0; 
    }
}

/**
 * Calculates the damage a monster's skill will deal to the player.
 * @param {object} monsterSkill - The monster's skill object.
 * @param {object} targetPlayer - The player data object.
 * @returns {number} The calculated damage amount.
 */
function calculateMonsterDamage(monsterSkill, targetPlayer) {
    try {
        if (!currentMonster || !monsterSkill || !targetPlayer) {
            console.error("Script.js: Missing data for monster damage calculation.");
            return 1; 
        }
        
        const skillEffects = monsterSkill.effects || {}; 
        let baseDamage = (currentMonster.attack || 5) * (monsterSkill.damageMultiplier || 1.0);
        const elementalMultiplier = getElementalMultiplier(monsterSkill.type, targetPlayer.rune);

        if (typeof addLogMessage === 'function') {
            if (elementalMultiplier > 1.5) addLogMessage("The attack is super effective against you!", "combat-monster");
            else if (elementalMultiplier < 0.75 && elementalMultiplier > 0) addLogMessage("Your rune resists some of the damage!", "combat-info");
            else if (elementalMultiplier === 0) addLogMessage(`You are immune to ${monsterSkill.type}!`, "success");
        }

        let damageAfterElemental = baseDamage * elementalMultiplier;
        let finalDamage = Math.max(elementalMultiplier === 0 ? 0 : 1, Math.floor(damageAfterElemental - (targetPlayer.defense || 0)));
        
        // console.log(`Script.js: Monster damage: Base=${baseDamage.toFixed(1)}, ElemMult=${elementalMultiplier}, Final=${finalDamage}`);
        return finalDamage;

    } catch (error) {
        console.error("Script.js: Error in calculateMonsterDamage:", error.message, error.stack);
        if(typeof showError === 'function') showError("Error calculating monster damage.", error);
        return 1; 
    }
}

/**
 * Determines the damage multiplier based on elemental interactions.
 * @param {string} attackerType - The elemental type of the attacker.
 * @param {string} targetType - The elemental type of the target.
 * @returns {number} The damage multiplier.
 */
function getElementalMultiplier(attackerType, targetType) {
    if (!attackerType || !targetType || !ELEMENTAL_TYPES || !ELEMENTAL_TYPES[attackerType] || !ELEMENTAL_TYPES[targetType]) {
        return 1.0; 
    }
    const attackerElement = ELEMENTAL_TYPES[attackerType];
    if (attackerElement.strong && attackerElement.strong.includes(targetType)) return 2.0;
    if (attackerElement.weak && attackerElement.weak.includes(targetType)) return 0.5;
    if (attackerElement.immune && attackerElement.immune.includes(targetType)) return 0.0;
    return 1.0;
}

/**
 * Handles the execution of a player's skill.
 * @param {object} skill - The skill object to be used.
 */
function useSkillAction(skill) {
    try {
        if (gameOver || combatLock || !isPlayerTurn) { return; }
        if (!currentMonster || currentMonster.hp <= 0) { 
            if(typeof addLogMessage === 'function') addLogMessage("There is no target.", "warning"); 
            if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
            return; 
        }
        if (skill.id !== MELEE_ATTACK_ID && playerData.mana < skill.manaCost) {
            if(typeof addLogMessage === 'function') addLogMessage(`Not enough mana for ${skill.name}.`, 'warning'); 
            return; 
        }

        combatLock = true; isPlayerTurn = false;
        if (skill.id !== MELEE_ATTACK_ID && skill.manaCost > 0) playerData.mana -= skill.manaCost;

        if(typeof addLogMessage === 'function') addLogMessage(`Player used ${skill.name}!`, 'combat-player');
        const skillEffects = skill.effects || {};

        if (skillEffects.target === "enemy" && (typeof skillEffects.damage === 'number' || typeof skillEffects.damageBasePercent === 'number')) {
            const damageDealt = calculatePlayerDamage(skill, currentMonster);
            currentMonster.hp = Math.max(0, currentMonster.hp - damageDealt);
            if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} hits ${currentMonster.name} for ${damageDealt} damage!`, 'combat-player');
            if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('damage-animation'); setTimeout(() => monsterSprite.classList.remove('damage-animation'), 300); }
            if (skillEffects.healPercentOfDamage && damageDealt > 0) {
                const healedAmount = Math.floor(damageDealt * skillEffects.healPercentOfDamage);
                if (healedAmount > 0) {
                    playerData.hp = Math.min(playerData.maxHp, playerData.hp + healedAmount);
                    if(typeof addLogMessage === 'function') addLogMessage(`Player drained ${healedAmount} HP!`, "success");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 500); }
                }
            }
        }
        if (skillEffects.target === "self" && typeof skillEffects.heal === 'number') {
            const healAmount = calculatePlayerHeal(skill);
            if (healAmount > 0) {
                const oldHp = playerData.hp;
                playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
                if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} heals Player for ${playerData.hp - oldHp} HP.`, 'success');
                if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 500); }
            } else if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} had no effect.`, 'info');
        }
        if (typeof skillEffects.manaRegen === 'number' && skillEffects.manaRegen > 0) {
            const manaGained = Math.min(skillEffects.manaRegen, playerData.maxMana - playerData.mana);
            if (manaGained > 0) { playerData.mana += manaGained; if(typeof addLogMessage === 'function') addLogMessage(`${skill.name} regenerates ${manaGained} MP!`, "mana-regen"); }
        }
        if (skillEffects.buff && typeof applyStatusEffect === 'function') { 
            applyStatusEffect(playerData, skillEffects.buff, skillEffects.value, skillEffects.duration, skillEffects.description);
            if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('buff-animation'); setTimeout(() => playerAvatar.classList.remove('buff-animation'), 500); }
        }
        if (skillEffects.debuff && skillEffects.target === "enemy" && typeof applyStatusEffect === 'function') { 
             if (currentMonster) applyStatusEffect(currentMonster, skillEffects.debuff, skillEffects.value, skillEffects.duration, skillEffects.description);
        }

        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        
        if (currentMonster && currentMonster.hp <= 0) {
            if(typeof monsterDefeated === 'function') monsterDefeated();
            else { if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} defeated! (Handler missing)`, "success"); currentMonster = null; if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); combatLock = false; isPlayerTurn = true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
        } else {
            setTimeout(() => {
                if (currentMonster && currentMonster.hp > 0 && typeof monsterTurn === 'function') monsterTurn();
                else { combatLock = false; isPlayerTurn = true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
            }, 800); 
        }
    } catch (error) {
        console.error("Script.js: Error in useSkillAction:", skill, error);
        if(typeof showError === 'function') showError("Error during skill use.", error);
        combatLock = false; isPlayerTurn = true;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    }
}

/**
 * Applies a status effect to a target.
 */
function applyStatusEffect(target, effectType, value, duration, description) {
    try {
        if (!target || !effectType || typeof duration !== 'number') { console.error("Script.js: Invalid args for applyStatusEffect."); return; }
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects = target.statusEffects.filter(e => e.type !== effectType); 
        const newEffect = { type: effectType, duration: duration, value: value, description: description || effectType.replace(/_/g, ' ').toUpperCase(), initialApplicationTurn: window.combatTurnCounter || 0 };
        let statChanged = false;
        if (effectType === "defense_up" && typeof target.defense === 'number' && typeof value === 'number') { newEffect.originalValue = target.defense; target.defense += value; statChanged = true; }
        else if (effectType === "attack_up" && typeof target.attack === 'number' && typeof value === 'number') { newEffect.originalValue = target.attack; target.attack += value; statChanged = true; }
        else if (effectType === "defense_down" && typeof target.defense === 'number' && typeof value === 'number') { newEffect.originalValue = target.defense; target.defense = Math.max(0, target.defense - value); statChanged = true; }
        else if (effectType === "attack_down" && typeof target.attack === 'number' && typeof value === 'number') { newEffect.originalValue = target.attack; target.attack = Math.max(1, target.attack - value); statChanged = true; }
        target.statusEffects.push(newEffect);
        if(typeof addLogMessage === 'function') addLogMessage(`${target === playerData ? "Player" : target.name} is affected by ${newEffect.description}!`, target === playerData ? "combat-player" : "combat-monster");
        if (statChanged) { 
            if (target === playerData && typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
            else if (target === currentMonster && typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        }
        if (target === playerData && typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
        else if (target === currentMonster && typeof updateMonsterStatusEffectsUI === 'function') updateMonsterStatusEffectsUI();
    } catch (e) { console.error("Script.js: Error applying status effect:", e); if(typeof showError === 'function') showError("Error applying status.", e); }
}

/**
 * Processes active status effects for player and monster.
 */
function processStatusEffects() {
    try {
        if (!playerData || !playerData.statusEffects) return; 
        const processTarget = (target, isPlayerTarget) => {
            if (!target || !target.statusEffects || !Array.isArray(target.statusEffects)) return;
            let effectsUINeedsUpdate = false;
            target.statusEffects = target.statusEffects.filter(effect => {
                let effectExpired = false;
                if (effect.type === "poison_dot" && typeof effect.value === 'number') {
                    const dotDamage = Math.max(1, Math.floor(effect.value - (target.defenseDotResist || 0)));
                    target.hp = Math.max(0, target.hp - dotDamage);
                    if(typeof addLogMessage === 'function') addLogMessage(`${isPlayerTarget ? "Player" : target.name} takes ${dotDamage} poison damage!`, isPlayerTarget ? "combat-player" : "combat-monster");
                    effectsUINeedsUpdate = true;
                    if (target.hp <= 0) {
                        if (isPlayerTarget && typeof handlePlayerDeath === 'function') handlePlayerDeath();
                        else if (!isPlayerTarget && target === currentMonster && typeof monsterDefeated === 'function') monsterDefeated();
                        effectExpired = true; 
                    }
                }
                if (effectExpired) return false; 
                effect.duration--;
                if (effect.duration <= 0) {
                    let statReverted = false;
                    if (effect.originalValue !== undefined) { 
                        if (effect.type === "defense_up" && typeof target.defense === 'number') { target.defense = effect.originalValue; statReverted = true; }
                        else if (effect.type === "attack_up" && typeof target.attack === 'number') { target.attack = effect.originalValue; statReverted = true; }
                        else if (effect.type === "defense_down" && typeof target.defense === 'number') { target.defense = effect.originalValue; statReverted = true; }
                        else if (effect.type === "attack_down" && typeof target.attack === 'number') { target.attack = effect.originalValue; statReverted = true; }
                    }
                    if(typeof addLogMessage === 'function') addLogMessage(`${isPlayerTarget ? "Player's" : (target.name || "Target")}'s ${effect.description || effect.type} wore off.`, "info");
                    effectsUINeedsUpdate = true;
                    if (statReverted) { 
                         if (isPlayerTarget && typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
                         else if (!isPlayerTarget && target === currentMonster && typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
                    }
                    return false; 
                }
                return true; 
            });
            if (effectsUINeedsUpdate) { 
                if (isPlayerTarget && typeof updatePlayerStatusEffectsUI === 'function') updatePlayerStatusEffectsUI();
                else if (!isPlayerTarget && target === currentMonster && typeof updateMonsterStatusEffectsUI === 'function') updateMonsterStatusEffectsUI();
            }
        };
        processTarget(playerData, true);
        if (currentMonster) processTarget(currentMonster, false);
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        if(typeof updateMonsterStatsUI === 'function' && currentMonster) updateMonsterStatsUI(); 
    } catch (e) { console.error("Script.js: Error processing status effects:", e); if(typeof showError === 'function') showError("Error processing effects.", e); }
}

/**
 * Handles the monster's turn in combat.
 */
function monsterTurn() {
    try {
        if (gameOver || !currentMonster || currentMonster.hp <= 0) {
            isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); return;
        }
        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name}'s turn...`, "combat-monster");
        const evasionEffect = playerData.statusEffects.find(e => e.type === "evasion_up");
        if (evasionEffect && Math.random() < (evasionEffect.value || 0)) {
            if(typeof addLogMessage === 'function') addLogMessage(`Player dodged ${currentMonster.name}'s attack!`, "success");
        } else {
            let chosenMonsterSkill = null;
            if (currentMonster.skills && currentMonster.skills.length > 0) {
                let cumulativeChance = 0; const randomRoll = Math.random();
                for (const skill of currentMonster.skills) {
                    cumulativeChance += (skill.chance || (1.0 / currentMonster.skills.length)); 
                    if (randomRoll < cumulativeChance) { chosenMonsterSkill = skill; break; }
                }
                if (!chosenMonsterSkill) chosenMonsterSkill = currentMonster.skills[currentMonster.skills.length - 1];
            }
            if (chosenMonsterSkill) {
                if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} uses ${chosenMonsterSkill.name}! (${chosenMonsterSkill.description || 'A fearsome move!'})`, "combat-monster");
                const skillEffects = chosenMonsterSkill.effects || {}; 
                if (chosenMonsterSkill.damageMultiplier > 0 || typeof skillEffects.damage === 'number') {
                    const damageDealt = calculateMonsterDamage(chosenMonsterSkill, playerData);
                    playerData.hp = Math.max(0, playerData.hp - damageDealt);
                    if(typeof addLogMessage === 'function') addLogMessage(`${chosenMonsterSkill.name} hits Player for ${damageDealt} damage!`, "combat-monster");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('damage-animation'); setTimeout(() => playerAvatar.classList.remove('damage-animation'), 300); }
                }
                if (skillEffects.buff && chosenMonsterSkill.target !== "enemy" && typeof applyStatusEffect === 'function') { 
                     applyStatusEffect(currentMonster, skillEffects.buff, skillEffects.value, skillEffects.duration, skillEffects.description);
                     if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('buff-animation'); setTimeout(() => monsterSprite.classList.remove('buff-animation'), 500); }
                }
                if (skillEffects.debuff && chosenMonsterSkill.target !== "self" && typeof applyStatusEffect === 'function') { 
                     applyStatusEffect(playerData, skillEffects.debuff, skillEffects.value, skillEffects.duration, skillEffects.description);
                }
                if (skillEffects.effect === "hp_drain" && (chosenMonsterSkill.damageMultiplier > 0 || typeof skillEffects.damage === 'number')) {
                    const damageDealtToPlayer = calculateMonsterDamage(chosenMonsterSkill, playerData); 
                    playerData.hp = Math.max(0, playerData.hp - damageDealtToPlayer);
                     if(typeof addLogMessage === 'function') addLogMessage(`${chosenMonsterSkill.name} deals ${damageDealtToPlayer} damage to Player!`, "combat-monster");
                    if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('damage-animation'); setTimeout(() => playerAvatar.classList.remove('damage-animation'), 300); }
                    const healedAmount = Math.floor(damageDealtToPlayer * (skillEffects.healPercentOfDamage || 0.5)); 
                    if (healedAmount > 0) {
                        currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healedAmount);
                        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} drained ${healedAmount} HP!`, "combat-info");
                        if (monsterSprite && monsterSprite.classList) { monsterSprite.classList.add('heal-animation'); setTimeout(() => monsterSprite.classList.remove('heal-animation'), 500); }
                    }
                }
            } else if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} hesitates...`, "combat-monster");
        }
        if(typeof processStatusEffects === 'function') processStatusEffects(); 
        else { if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); }
        if (playerData.hp <= 0) {
            if(typeof handlePlayerDeath === 'function') handlePlayerDeath();
            else { gameOver = true; if(typeof addLogMessage === 'function') addLogMessage("Player defeated! (Handler missing)","error");}
        } else {
            isPlayerTurn = true; combatLock = false;
            if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
            if(typeof addLogMessage === 'function') addLogMessage("Your turn!", "info");
        }
    } catch (e) { console.error("Script.js: Error in monsterTurn:", e); if(typeof showError === 'function') showError("Error in monster's turn.", e); isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
}

/**
 * Handles monster defeat.
 */
function monsterDefeated() {
    try {
        if (gameOver || !currentMonster) return; 
        if(typeof addLogMessage === 'function') addLogMessage(`${currentMonster.name} defeated!`, "success");
        playerData.exp += currentMonster.expReward; playerData.gold += currentMonster.goldReward;
        if(typeof addLogMessage === 'function') addLogMessage(`Gained ${currentMonster.expReward} EXP & ${currentMonster.goldReward} Gold.`, "event");
        if (!currentMonster.isBoss) regularMonsterDefeatCount++;
        const hpHeal = Math.floor(playerData.maxHp * HEAL_ON_DEFEAT_PERCENT_HP);
        const manaRegen = Math.floor(playerData.maxMana * REGEN_ON_DEFEAT_PERCENT_MANA);
        const actualHpHeal = Math.min(hpHeal, playerData.maxHp - playerData.hp);
        if (actualHpHeal > 0) { playerData.hp += actualHpHeal; if(typeof addLogMessage === 'function') addLogMessage(`Recovered ${actualHpHeal} HP.`, "success"); if(playerAvatar && playerAvatar.classList){playerAvatar.classList.add('heal-animation'); setTimeout(()=>playerAvatar.classList.remove('heal-animation'),600);}}
        const actualManaRegen = Math.min(manaRegen, playerData.maxMana - playerData.mana);
        if (actualManaRegen > 0) { playerData.mana += actualManaRegen; if(typeof addLogMessage === 'function') addLogMessage(`Recovered ${actualManaRegen} MP.`, "mana-regen");}
        const wasBoss = currentMonster.isBoss; currentMonster = null; 
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); 
        if(typeof checkLevelUp === 'function') checkLevelUp(); 
        else if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); 
        if (wasBoss) {
            const possibleRunes = ["Fire","Water","Nature","Light","Dark"].filter(r=>r!==playerData.rune && !playerData.unlockedRunes.includes(r));
            if (possibleRunes.length > 0) { const dropped = possibleRunes[Math.floor(Math.random()*possibleRunes.length)]; playerData.unlockedRunes.push(dropped); if(typeof addLogMessage === 'function') addLogMessage(`Boss dropped ${dropped} Rune fragment!`, "event-critical");}
            if(typeof addLogMessage === 'function') addLogMessage("Returning to Runehaven...", "info");
            setTimeout(() => { if (typeof enterTown === 'function' && GAME_AREAS && GAME_AREAS.town) enterTown(GAME_AREAS.town); }, 2000);
        } else {
            if ((regularMonsterDefeatCount % BOSS_MONSTER_INTERVAL) === 0 && regularMonsterDefeatCount > 0) {
                if(typeof addLogMessage === 'function') addLogMessage("A powerful foe approaches!", "event-critical");
                setTimeout(() => { if(typeof spawnBossMonster === 'function') spawnBossMonster(); }, 1500);
            } else if(typeof showPostBattleOptions === 'function') showPostBattleOptions();
        }
        combatLock = false; isPlayerTurn = true;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error in monsterDefeated:", e); if(typeof showError === 'function') showError("Error processing defeat.", e); combatLock=false; isPlayerTurn=true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); }
}

/**
 * Displays post-battle options.
 */
function showPostBattleOptions() {
    try {
        let container = document.getElementById('post-battle-options');
        const footer = document.getElementById('combat-actions-container');
        if (!container && footer && footer.parentNode) { container = document.createElement('div'); container.id='post-battle-options'; container.className='post-battle-options'; footer.parentNode.insertBefore(container, footer.nextSibling); }
        else if (!container) { console.error("Script.js: Cannot find place for post-battle options."); return; }
        container.innerHTML = ''; 
        const continueBtn = document.createElement('button'); continueBtn.className='action-button battle-btn'; continueBtn.textContent='Next Battle';
        continueBtn.onclick=()=>{ container.style.display='none'; if(GAME_AREAS && GAME_AREAS[currentArea] && typeof spawnAreaMonster==='function') spawnAreaMonster(GAME_AREAS[currentArea]); else {if(typeof addLogMessage==='function')addLogMessage("No more monsters. Returning to town.","warning"); if(typeof enterTown==='function' && GAME_AREAS && GAME_AREAS.town)enterTown(GAME_AREAS.town);}};
        const townBtn = document.createElement('button'); townBtn.className='action-button town-btn'; townBtn.textContent='Return to Town';
        townBtn.onclick=()=>{ container.style.display='none'; if(typeof enterTown==='function' && GAME_AREAS && GAME_AREAS.town)enterTown(GAME_AREAS.town);};
        container.appendChild(continueBtn); container.appendChild(townBtn); container.style.display='flex'; 
    } catch (e) { console.error("Script.js: Error in showPostBattleOptions:", e); if(typeof showError === 'function') showError("Error showing post-battle options.", e); }
}

/**
 * Handles player's defeat.
 */
function handlePlayerDeath() {
    try {
        if (playerData.hasRevivalStone) {
            if(typeof addLogMessage === 'function') addLogMessage("Revival Stone shatters, bringing you back!", "event-critical");
            playerData.hasRevivalStone = false; playerData.hp = Math.floor(playerData.maxHp * 0.5); 
            if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
            if (playerAvatar && playerAvatar.classList) { playerAvatar.classList.add('heal-animation'); setTimeout(() => playerAvatar.classList.remove('heal-animation'), 800); }
            if(typeof addLogMessage === 'function') addLogMessage("Revived with 50% HP!", "success");
            isPlayerTurn = true; combatLock = false; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); if(typeof addLogMessage === 'function') addLogMessage("Your turn!", "info");
        } else {
            gameOver = true; if(typeof addLogMessage === 'function') addLogMessage("Player defeated... GAME OVER.", "error");
            if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); 
            let retryBtn = document.getElementById('retry-button');
            if (!retryBtn) { retryBtn = document.createElement('button'); retryBtn.id='retry-button'; retryBtn.className='action-button'; retryBtn.textContent='Try Again'; retryBtn.style.marginTop='20px'; const cp = document.getElementById('center-panel'); if(cp)cp.appendChild(retryBtn); else if(gameScreen)gameScreen.appendChild(retryBtn); else document.body.appendChild(retryBtn);}
            retryBtn.style.display='block'; 
            retryBtn.onclick = () => {
                gameOver = false; 
                if (window.ScreenManager?.activateScreen) window.ScreenManager.activateScreen('rune-selection-screen');
                else if (typeof activateScreen === 'function') activateScreen('rune-selection-screen');
                else if (runeSelectionScreen) { if(typeof hideAllScreens==='function')hideAllScreens(); runeSelectionScreen.style.display='flex'; runeSelectionScreen.classList.add('active');}
                if(runeButtons?.length) runeButtons.forEach(b => { if(b) {b.disabled=false; b.style.opacity="1";}});
                retryBtn.remove(); 
            };
        }
    } catch (e) { console.error("Script.js: Error in handlePlayerDeath:", e); if(typeof showError === 'function') showError("Error handling player death.", e); }
}

/**
 * Checks for player level up.
 */
function checkLevelUp() {
    try {
        if (!playerData) return;
        if (playerData.exp >= playerData.nextLevelExp) {
            const oldStats = { level:playerData.level, maxHp:playerData.maxHp, maxMana:playerData.maxMana, attackPower:playerData.attackPower, defense:playerData.defense };
            playerData.level++; playerData.exp -= playerData.nextLevelExp; 
            playerData.nextLevelExp = Math.floor(INITIAL_EXP_TO_LEVEL * Math.pow(EXP_CURVE_FACTOR, playerData.level -1) + (EXP_CURVE_FLAT_ADDITION * (playerData.level-1)) );
            playerData.maxHp += PLAYER_HP_PER_LEVEL; playerData.maxMana += PLAYER_MANA_PER_LEVEL;
            playerData.attackPower += PLAYER_ATTACK_POWER_PER_LEVEL; playerData.defense += PLAYER_DEFENSE_PER_LEVEL;
            playerData.hp = playerData.maxHp; playerData.mana = playerData.maxMana;
            if(typeof addLogMessage === 'function') addLogMessage(`Player leveled up to Level ${playerData.level}!`, "level-up");
            if(typeof showLevelUpModal === 'function') showLevelUpModal(oldStats);
            if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); 
            if (playerData.exp >= playerData.nextLevelExp) setTimeout(checkLevelUp, 200); 
        }
    } catch (e) { console.error("Script.js: Error in checkLevelUp:", e); if(typeof showError === 'function') showError("Error processing level up.", e); }
}

/**
 * Displays the level up modal.
 */
function showLevelUpModal(oldStats) {
    try {
        if (!levelUpModal || !newLevelDisplay || !oldHpDisplay || !newHpDisplay || !oldMpDisplay || !newMpDisplay || !oldAttackDisplay || !newAttackDisplay || !oldDefenseDisplay || !newDefenseDisplay || !closeLevelUpModalButton) { console.warn("Script.js: Level up modal elements missing."); return; }
        newLevelDisplay.textContent = `Level ${playerData.level}`;
        oldHpDisplay.textContent = oldStats.maxHp; newHpDisplay.textContent = playerData.maxHp;
        oldMpDisplay.textContent = oldStats.maxMana; newMpDisplay.textContent = playerData.maxMana;
        oldAttackDisplay.textContent = oldStats.attackPower; newAttackDisplay.textContent = playerData.attackPower;
        oldDefenseDisplay.textContent = oldStats.defense; newDefenseDisplay.textContent = playerData.defense;
        const masteryUnlockDiv = document.getElementById('mastery-skill-unlock');
        const newSkillInfoDiv = document.getElementById('new-skill-info');
        if(masteryUnlockDiv && newSkillInfoDiv) {
            let newSkillUnlocked = null; 
            // Example: if (playerData.level === 3 && playerData.rune === "Fire" && !playerData.skills.find(s => s.id === "fire_advanced_skill")) { newSkillUnlocked = { name: "Adv. Fire Skill", icon: "🔥✨", description: "Powerful fire spell!" }; playerData.skills.push({ id: "fire_advanced_skill", name: "Adv. Fire Skill", /*...rest of skill...*/ action: ()=>useSkillAction(thisSkill) }); if(typeof renderSkillButtons==='function')renderSkillButtons(); }
            if (newSkillUnlocked) { newSkillInfoDiv.innerHTML = `<span class="new-skill-icon">${newSkillUnlocked.icon}</span><span class="new-skill-name">${newSkillUnlocked.name}</span><p class="new-skill-desc">${newSkillUnlocked.description}</p>`; masteryUnlockDiv.style.display = 'block';}
            else masteryUnlockDiv.style.display = 'none';
        }
        levelUpModal.style.display = 'flex'; levelUpModal.setAttribute('aria-hidden', 'false');
        if (!closeLevelUpModalButton.listenerAttached) { closeLevelUpModalButton.addEventListener('click', () => { levelUpModal.style.display = 'none'; levelUpModal.setAttribute('aria-hidden', 'true'); }); closeLevelUpModalButton.listenerAttached = true; }
    } catch (e) { console.error("Script.js: Error in showLevelUpModal:", e); if(typeof showError === 'function') showError("Error displaying level up modal.", e); }
}

// --- Area/Town Logic, Monster Spawning, Modals (Shop, Inventory, Rune Swap) ---

/**
 * Displays the area selection screen and populates it with available areas.
 */
function showAreaSelection() {
    try {
        console.log("Script.js: Showing area selection.");
        let screenActivated = false;
        if (window.ScreenManager?.activateScreen) screenActivated = window.ScreenManager.activateScreen('area-selection-screen');
        else if (typeof activateScreen === 'function') screenActivated = activateScreen('area-selection-screen');
        else { console.error("Script.js: No screen activation function for area selection."); if(typeof showError === 'function') showError("Cannot show areas: Screen manager missing."); return; }

        if (!screenActivated) { console.error("Script.js: Failed to activate area-selection-screen."); return; }
        
        if (typeof populateAreaSelection === 'function') populateAreaSelection();
        else { console.error("Script.js: populateAreaSelection function undefined."); if(areaSelectionScreen?.querySelector('#areas-container')) areaSelectionScreen.querySelector('#areas-container').innerHTML = "<p>Error: Could not load areas.</p>";}
    } catch (e) { console.error("Script.js: Error in showAreaSelection:", e); if(typeof showError === 'function') showError("Error showing area selection.", e); }
}

/**
 * Populates the area selection screen with cards for each game area.
 */
function populateAreaSelection() {
    try {
        const areasContainer = document.getElementById('areas-container'); 
        if (!areasContainer) { console.error("Script.js: areas-container not found."); return; }
        areasContainer.innerHTML = ''; 
        if (!GAME_AREAS || Object.keys(GAME_AREAS).length === 0) { areasContainer.innerHTML = '<p>No areas discovered.</p>'; return; }

        Object.entries(GAME_AREAS).forEach(([areaKey, area]) => {
            if (area.isSafe) return; 
            const areaCard = document.createElement('div'); areaCard.className = 'area-card';
            if (area.dominantElement) areaCard.dataset.element = area.dominantElement.toLowerCase();
            let levelBadgeHTML = area.recommendedLevel ? `<div class="${(playerData?.level < area.recommendedLevel) ? 'level-badge danger' : 'level-badge'}" title="Recommended Level">Lvl ${area.recommendedLevel}+</div>` : '';
            const bgStyle = area.backgroundImage ? `style="background-image: url('${area.backgroundImage}');"` : '';
            areaCard.innerHTML = `<div class="area-header" ${bgStyle}><h3>${area.name}</h3>${levelBadgeHTML}</div><div class="area-info-content"><p class="area-description">${area.description||''}</p><p class="area-element">Element: <span class="type-badge" data-type="${area.dominantElement||'Normal'}">${area.dominantElement||'Various'}</span></p></div><button class="action-button enter-area-btn" data-area-key="${areaKey}">Explore</button>`;
            const enterButton = areaCard.querySelector('.enter-area-btn');
            if (enterButton) enterButton.onclick = () => { if (typeof enterArea === 'function') enterArea(areaKey); else console.error("Script.js: enterArea undefined."); };
            areasContainer.appendChild(areaCard);
        });
    } catch (e) { console.error("Script.js: Error populating areas:", e); if(typeof showError === 'function') showError("Error populating areas.", e); }
}

/**
 * Handles player entering a new combat area.
 */
function enterArea(areaKey) {
    try {
        if (!GAME_AREAS?.[areaKey]) { if(typeof addLogMessage === 'function') addLogMessage(`Area ${areaKey} unknown!`, "error"); return; }
        const area = GAME_AREAS[areaKey];
        if (area.isSafe) { if(typeof addLogMessage === 'function') addLogMessage(`Entering ${area.name}. Safe zone.`, "info"); if (typeof enterTown === 'function' && areaKey === 'town') enterTown(area); else { currentArea = areaKey; if (window.ScreenManager?.activateScreen) window.ScreenManager.activateScreen('game-screen'); else if(typeof activateScreen === 'function') activateScreen('game-screen'); if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); } return; }
        if (area.recommendedLevel && playerData.level < area.recommendedLevel && !window.confirm(`Warning: ${area.name} is Lvl ${area.recommendedLevel}+. Proceed?`)) { if(typeof addLogMessage === 'function') addLogMessage("Retreated from dangerous area.", "info"); return; }
        currentArea = areaKey; 
        if(typeof addLogMessage === 'function') addLogMessage(`Entering ${area.name}...`, "event");
        if (window.ScreenManager?.activateScreen) window.ScreenManager.activateScreen('game-screen');
        else if(typeof activateScreen === 'function') activateScreen('game-screen');
        else { console.error("Script.js: No screen activation for entering area."); return; }
        const postBattleOpts = document.getElementById('post-battle-options'); if (postBattleOpts) postBattleOpts.style.display = 'none';
        if (typeof spawnAreaMonster === 'function') spawnAreaMonster(area);
        else { console.error("Script.js: spawnAreaMonster undefined."); if(typeof addLogMessage === 'function') addLogMessage("No monsters here...", "info");}
    } catch (e) { console.error("Script.js: Error in enterArea:", e); if(typeof showError === 'function') showError("Error entering area.", e); }
}

/**
 * Handles player returning to or entering the town.
 */
function enterTown(townDataInput) {
    try {
        const townData = townDataInput || GAME_AREAS?.town;
        if (!townData || !townData.isSafe) { console.error("Script.js: Invalid town data.", townData); if(typeof addLogMessage === 'function') addLogMessage("Cannot go to unsafe town.", "error"); return; }
        currentArea = 'town'; currentMonster = null; gameOver = false; combatLock = false; 
        if(typeof addLogMessage === 'function') { addLogMessage(`Welcome to ${townData.name}! Safe here.`, "event"); addLogMessage("Rest, shop, or adventure.", "info"); }
        if (window.ScreenManager?.activateScreen) window.ScreenManager.activateScreen('game-screen');
        else if(typeof activateScreen === 'function') activateScreen('game-screen');
        const postBattleOpts = document.getElementById('post-battle-options'); if (postBattleOpts) postBattleOpts.style.display = 'none';
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI(); 
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();   
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability(); 
    } catch (e) { console.error("Script.js: Error in enterTown:", e); if(typeof showError === 'function') showError("Error entering town.", e); }
}

/**
 * Spawns a monster appropriate for the given area and player level.
 */
function spawnAreaMonster(area) {
    try {
        if (gameOver || !area || area.isSafe) { if (area?.isSafe && typeof addLogMessage === 'function') addLogMessage(`${area.name} is safe.`, "info"); return; }
        let monsterPool = area.monsters?.length ? monsterTemplates.filter(m => area.monsters.includes(m.name)) : [];
        if (!monsterPool.length) { if(typeof addLogMessage === 'function') addLogMessage(`No specific monsters for ${area.name}, spawning generic.`, "warning"); if(typeof spawnNewMonster === 'function') spawnNewMonster(); else console.error("Script.js: spawnNewMonster undefined."); return; }
        const template = monsterPool[Math.floor(Math.random() * monsterPool.length)];
        const monsterLvl = area.recommendedLevel || playerData?.level || 1;
        currentMonster = { ...template, level: monsterLvl, maxHp: Math.floor(template.baseMaxHp+(monsterLvl-1)*MONSTER_HP_SCALING_PER_PLAYER_LEVEL), hp:0, attack: Math.floor(template.baseAttack+(monsterLvl-1)*MONSTER_ATTACK_SCALING_PER_PLAYER_LEVEL), defense: Math.floor(template.baseDefense+(monsterLvl-1)*MONSTER_DEFENSE_SCALING_PER_PLAYER_LEVEL), statusEffects:[], isBoss:false };
        currentMonster.hp = currentMonster.maxHp; // Full HP on spawn
        if(typeof addLogMessage === 'function') addLogMessage(`Lvl ${currentMonster.level} ${currentMonster.name} (${currentMonster.type}) appears from ${area.name}!`, "event");
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        isPlayerTurn = true; combatLock = false;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error spawning area monster:", e); if(typeof showError === 'function') showError("Error spawning monster.", e); }
}

/**
 * Spawns a boss monster.
 */
function spawnBossMonster() {
    try {
        if (gameOver) return;
        if (!bossMonsterTemplates?.length) { if(typeof addLogMessage === 'function') addLogMessage("No bosses! Strong regular monster instead.", "warning"); if(typeof spawnNewMonster === 'function') spawnNewMonster(true); else console.error("Script.js: spawnNewMonster for boss undefined."); return; }
        const template = bossMonsterTemplates[Math.floor(Math.random() * bossMonsterTemplates.length)];
        const bossLvl = (playerData?.level || 1) + 2; 
        currentMonster = { ...template, level: bossLvl, maxHp: Math.floor((template.baseMaxHp+(bossLvl-1)*MONSTER_HP_SCALING_PER_PLAYER_LEVEL)*1.8), hp:0, attack: Math.floor((template.baseAttack+(bossLvl-1)*MONSTER_ATTACK_SCALING_PER_PLAYER_LEVEL)*1.4), defense: Math.floor((template.baseDefense+(bossLvl-1)*MONSTER_DEFENSE_SCALING_PER_PLAYER_LEVEL)*1.3), statusEffects:[], isBoss:true };
        currentMonster.hp = currentMonster.maxHp;
        if(typeof addLogMessage === 'function') addLogMessage(`BOSS: Lvl ${currentMonster.level} ${currentMonster.name} (${currentMonster.type}) appears!`, "event-critical");
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        isPlayerTurn = true; combatLock = false;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error spawning boss:", e); if(typeof showError === 'function') showError("Error spawning boss.", e); }
}

/**
 * Spawns a new generic monster, scaled to player's level.
 */
function spawnNewMonster(isStronger = false) {
    try {
        if (gameOver) return;
        if (!monsterTemplates?.length) { console.error("Script.js: monsterTemplates empty."); return; }
        let pLvl = playerData?.level || 1;
        let pool = monsterTemplates.filter(m => Math.abs(pLvl - (m.baseLevel || pLvl)) <= 3);
        if (!pool.length) pool = monsterTemplates; 
        const template = pool[Math.floor(Math.random() * pool.length)];
        currentMonster = { ...template, level: pLvl, maxHp:Math.floor((template.baseMaxHp+(pLvl-1)*MONSTER_HP_SCALING_PER_PLAYER_LEVEL)*(isStronger?1.3:1)), hp:0, attack:Math.floor((template.baseAttack+(pLvl-1)*MONSTER_ATTACK_SCALING_PER_PLAYER_LEVEL)*(isStronger?1.2:1)), defense:Math.floor((template.baseDefense+(pLvl-1)*MONSTER_DEFENSE_SCALING_PER_PLAYER_LEVEL)*(isStronger?1.1:1)), statusEffects:[], isBoss:false };
        currentMonster.hp = currentMonster.maxHp;
        if(typeof addLogMessage === 'function') addLogMessage(`Lvl ${currentMonster.level} ${currentMonster.name} (${currentMonster.type}) appears!`, "event");
        if(typeof updateMonsterStatsUI === 'function') updateMonsterStatsUI();
        isPlayerTurn = true; combatLock = false;
        if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
    } catch (e) { console.error("Script.js: Error spawning new monster:", e); if(typeof showError === 'function') showError("Error spawning monster.", e); }
}

/**
 * Opens the shop modal.
 */
function openShop() {
    try {
        if (!shopModal) { if(typeof showError === 'function') showError("Shop modal missing."); return; }
        if (currentMonster?.hp > 0) { if(typeof addLogMessage === 'function') addLogMessage("Cannot shop during combat!", "warning"); return; }
        shopModal.style.display = 'flex'; shopModal.setAttribute('aria-hidden', 'false');
        if(typeof updateShopPlayerGold === 'function') updateShopPlayerGold();
        const activeTab = shopTabs?.length ? (document.querySelector('.shop-tab[data-category="all"]') || shopTabs[0]) : null;
        if (activeTab) { shopTabs.forEach(t => t.classList.remove('active')); activeTab.classList.add('active'); if (typeof filterShopItems === 'function') filterShopItems(activeTab.dataset.category); }
        else if (typeof filterShopItems === 'function') filterShopItems('all');
    } catch (e) { console.error("Script.js: Error opening shop:", e); if(typeof showError === 'function') showError("Error opening shop.", e); }
}

/**
 * Filters and displays items in the shop.
 */
function filterShopItems(category) {
    try {
        if (!shopItemsContainer || !shopItems) { if(shopItemsContainer) shopItemsContainer.innerHTML = '<p>Error loading items.</p>'; return; }
        shopItemsContainer.innerHTML = '';
        const itemsToDisplay = category === 'all' ? shopItems : shopItems.filter(item => item.type === category);
        if (!itemsToDisplay.length) { shopItemsContainer.innerHTML = '<p><i>No items in category.</i></p>'; return; }
        itemsToDisplay.forEach(item => { 
            const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item'; itemDiv.dataset.type = item.type;
            const canAfford = playerData.gold >= item.cost; if (!canAfford) itemDiv.classList.add('cannot-afford');
            itemDiv.innerHTML = `<div class="shop-item-icon">${item.icon || '❓'}</div><div class="shop-item-details"><h3 class="shop-item-name">${item.name}</h3><p class="shop-item-description">${item.description || ''}</p><p class="shop-item-cost ${canAfford ? '' : 'expensive'}">Cost: ${item.cost} G</p></div>`;
            const buyBtn = document.createElement('button'); buyBtn.className='action-button buy-button'; buyBtn.textContent='Buy'; buyBtn.disabled=!canAfford;
            buyBtn.onclick=()=>{if(typeof buyItem==='function')buyItem(item.id);}; itemDiv.appendChild(buyBtn); shopItemsContainer.appendChild(itemDiv);
        });
    } catch (e) { console.error("Script.js: Error filtering shop items:", e); if(typeof showError === 'function') showError("Error filtering shop.", e); if(shopItemsContainer) shopItemsContainer.innerHTML = '<p>Error displaying items.</p>';}
}

/**
 * Handles the purchase of an item.
 */
function buyItem(itemId) {
    try {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) { if(typeof addLogMessage === 'function') addLogMessage(`Item ${itemId} not found.`, "error"); return; }
        if (playerData.gold < item.cost) { if(typeof addLogMessage === 'function') addLogMessage(`Not enough gold for ${item.name}.`, "warning"); return; }
        playerData.gold -= item.cost;
        if(typeof addLogMessage === 'function') addLogMessage(`Purchased ${item.name} for ${item.cost} gold.`, "success");
        if (typeof addItemToInventory === 'function') addItemToInventory(item.id, 1);
        else console.error("Script.js: addItemToInventory undefined.");
        if(typeof updateShopPlayerGold === 'function') updateShopPlayerGold();
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        const activeTabEl = document.querySelector('#shop-tabs .shop-tab.active');
        if (typeof filterShopItems === 'function' && activeTabEl) filterShopItems(activeTabEl.dataset.category);
        else if (typeof filterShopItems === 'function') filterShopItems('all');
    } catch (e) { console.error("Script.js: Error buying item:", e); if(typeof showError === 'function') showError("Error buying item.", e); }
}

/**
 * Opens the player's inventory modal.
 */
function openInventory() {
    try {
        if (!inventoryModal) { if(typeof showError === 'function') showError("Inventory modal missing."); return; }
        if (currentMonster?.hp > 0 && !isPlayerTurn) { if(typeof addLogMessage === 'function') addLogMessage("Not your turn!", "warning"); return; }
        inventoryModal.style.display = 'flex'; inventoryModal.setAttribute('aria-hidden', 'false');
        if(typeof updateInventoryUI === 'function') updateInventoryUI();
        else console.error("Script.js: updateInventoryUI undefined.");
    } catch (e) { console.error("Script.js: Error opening inventory:", e); if(typeof showError === 'function') showError("Error opening inventory.", e); }
}

/**
 * Updates the inventory UI.
 */
function updateInventoryUI() {
    try {
        if (equipmentSlotsContainer && playerData?.equipment) {
            equipmentSlotsContainer.innerHTML = ''; 
            const slots = { weapon: "Weapon", shield: "Shield", armor: "Armor", accessory: "Accessory" };
            Object.entries(slots).forEach(([slotKey, slotName]) => { 
                const slotDiv = document.createElement('div'); slotDiv.className = 'equipment-slot';
                const itemId = playerData.equipment[slotKey]; const item = itemId ? shopItems.find(i => i.id === itemId) : null;
                slotDiv.innerHTML = `<span class="equipment-slot-label">${slotName}:</span><span class="equipment-slot-item ${item ? 'equipped-item' : ''}">${item ? item.name : 'None'}</span>`;
                if (item && typeof unequipItem === 'function') { const btn=document.createElement('button');btn.className='action-button unequip-btn';btn.textContent='Unequip';btn.onclick=()=>unequipItem(slotKey);slotDiv.appendChild(btn);}
                equipmentSlotsContainer.appendChild(slotDiv);
            });
        } else if (equipmentSlotsContainer) equipmentSlotsContainer.innerHTML = '<p>Equipment slots unavailable.</p>';

        if (inventoryItemsContainer && playerData?.inventory) {
            inventoryItemsContainer.innerHTML = ''; 
            if (!playerData.inventory.length) { inventoryItemsContainer.innerHTML = '<p><i>Bag is empty.</i></p>'; return; }
            playerData.inventory.forEach(invItem => { 
                const item = shopItems.find(i => i.id === invItem.id); if (!item) return;
                const itemDiv = document.createElement('div'); itemDiv.className = 'inventory-item';
                itemDiv.innerHTML = `<span class="inventory-item-icon">${item.icon||'❓'}</span><span class="inventory-item-name">${item.name}</span><span class="inventory-item-quantity">x${invItem.quantity}</span>`;
                const useBtn = document.createElement('button'); useBtn.className='action-button use-item-btn'; useBtn.textContent=(item.type==="consumable")?"Use":"Equip";
                if (item.type !== "consumable" && playerData.equipment[item.slot] === item.id) { useBtn.textContent = "Equipped"; useBtn.disabled = true; }
                useBtn.onclick=()=>{if(typeof useItemFromInventory==='function')useItemFromInventory(invItem.id);}; itemDiv.appendChild(useBtn); inventoryItemsContainer.appendChild(itemDiv);
            });
        } else if (inventoryItemsContainer) inventoryItemsContainer.innerHTML = '<p>Inventory unavailable.</p>';
    } catch (e) { console.error("Script.js: Error updating inventory UI:", e); if(typeof showError === 'function') showError("Error updating inventory.", e); }
}

/**
 * Adds an item to player's inventory.
 */
function addItemToInventory(itemId, quantity = 1) {
    if (!playerData?.inventory) { console.error("Script.js: Player inventory not init."); return; }
    const itemDef = shopItems.find(i => i.id === itemId); if (!itemDef) { if(typeof addLogMessage==='function')addLogMessage(`Unknown item: ${itemId}`, "error"); return; }
    const existing = playerData.inventory.find(item => item.id === itemId);
    if (existing) existing.quantity += quantity; else playerData.inventory.push({ id: itemId, quantity: quantity });
    if(typeof addLogMessage==='function')addLogMessage(`${itemDef.name} (x${quantity}) added to inventory.`, "success");
    if (inventoryModal?.style.display === 'flex' && typeof updateInventoryUI === 'function') updateInventoryUI();
}

/**
 * Removes an item from player's inventory.
 */
function removeItemFromInventory(itemId, quantity = 1) {
    if (!playerData?.inventory) return false;
    const itemIdx = playerData.inventory.findIndex(item => item.id === itemId);
    if (itemIdx === -1) return false;
    if (playerData.inventory[itemIdx].quantity <= quantity) playerData.inventory.splice(itemIdx, 1);
    else playerData.inventory[itemIdx].quantity -= quantity;
    if (inventoryModal?.style.display === 'flex' && typeof updateInventoryUI === 'function') updateInventoryUI();
    return true;
}

/**
 * Uses or equips an item from inventory.
 */
function useItemFromInventory(itemId) {
    try {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) { if(typeof addLogMessage === 'function') addLogMessage(`Item ${itemId} not found.`, "error"); return false; }
        if (currentMonster?.hp > 0 && !isPlayerTurn && item.type === "consumable" && item.effectDuringCombat !== false) { if(typeof addLogMessage === 'function') addLogMessage("Not your turn!", "warning"); return false; }
        let success = false;
        if (item.type === "consumable" && typeof item.effect === "function") {
            success = item.effect(); 
            if (success) { 
                removeItemFromInventory(itemId, 1);
                if (currentMonster?.hp > 0 && !isPlayerTurn) { // Item use took a turn (check if it was player's turn before use)
                    // This logic needs refinement: useItemFromInventory can be called when it IS player's turn.
                    // The turn progression should happen in useSkillAction or a similar combat turn manager.
                    // For now, we assume if combat is active, using an item might take the turn.
                    isPlayerTurn = false; combatLock = true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();
                    setTimeout(() => { if (typeof monsterTurn === 'function') monsterTurn(); else { combatLock=false; isPlayerTurn=true; if(typeof updateSkillButtonsAvailability === 'function') updateSkillButtonsAvailability();}}, 800);
                }
            }
        } else if (["weapon", "shield", "armor", "accessory"].includes(item.type) && typeof item.slot === 'string') {
            if (typeof equipItem === 'function') success = equipItem(item);
        } else if(typeof addLogMessage === 'function') addLogMessage(`Cannot use/equip ${item.name}.`, "warning");
        if (inventoryModal?.style.display === 'flex' && typeof updateInventoryUI === 'function') updateInventoryUI();
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        return success;
    } catch (e) { console.error("Script.js: Error using item:", e); if(typeof showError === 'function') showError("Error using item.", e); return false; }
}

/**
 * Equips an item to the player.
 */
function equipItem(itemToEquip) {
    if (!playerData?.equipment || !itemToEquip?.slot) { if(typeof addLogMessage === 'function') addLogMessage("Cannot equip: Invalid data.", "error"); return false; }
    const slot = itemToEquip.slot;
    if (playerData.equipment[slot] && typeof unequipItem === 'function') unequipItem(slot, true); 
    playerData.equipment[slot] = itemToEquip.id;
    if (itemToEquip.stats) { Object.entries(itemToEquip.stats).forEach(([stat, value]) => { if (typeof playerData[stat]==='number') {playerData[stat]+=value; if(stat==="maxHp" && playerData.hp)playerData.hp+=value; if(stat==="maxMana" && playerData.mana)playerData.mana+=value;} else playerData[stat]=value; }); }
    if(typeof addLogMessage === 'function') addLogMessage(`Equipped ${itemToEquip.name}.`, "success");
    removeItemFromInventory(itemToEquip.id, 1); 
    if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
    if(typeof updateInventoryUI === 'function') updateInventoryUI();
    return true;
}

/**
 * Unequips an item from a slot.
 */
function unequipItem(slotKey, silent = false) {
    if (!playerData?.equipment?.[slotKey]) { if(!silent && typeof addLogMessage==='function')addLogMessage("Nothing to unequip.", "info"); return false; }
    const equippedItemId = playerData.equipment[slotKey];
    const itemToUnequip = shopItems.find(i => i.id === equippedItemId);
    if (!itemToUnequip) { if(!silent && typeof addLogMessage==='function')addLogMessage("Equipped item data missing.", "error"); playerData.equipment[slotKey]=null; return false; }
    if (itemToUnequip.stats) { Object.entries(itemToUnequip.stats).forEach(([stat, value]) => { if (typeof playerData[stat]==='number'){playerData[stat]-=value; if(stat==="maxHp" && playerData.hp)playerData.hp=Math.min(playerData.hp,playerData.maxHp); if(stat==="maxMana" && playerData.mana)playerData.mana=Math.min(playerData.mana,playerData.maxMana);} else if(playerData[stat]===value){ if(stat==="elementalBoostPercent")playerData.elementalBoostPercent=0; else delete playerData[stat];}}); }
    playerData.equipment[slotKey] = null;
    if (!silent) { 
        addItemToInventory(itemToUnequip.id, 1); 
        if(typeof addLogMessage === 'function') addLogMessage(`Unequipped ${itemToUnequip.name}.`, "success");
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI();
        if(typeof updateInventoryUI === 'function') updateInventoryUI();
    }
    return true;
}

/**
 * Opens the rune swap modal.
 */
function openRuneSwapModal() {
    try {
        if (!runeSwapModal) { if(typeof showError === 'function') showError("Rune swap modal missing."); return; }
        if (currentMonster?.hp > 0) { if(typeof addLogMessage === 'function') addLogMessage("Cannot swap runes in combat!", "warning"); return; }
        runeSwapModal.style.display = 'flex'; runeSwapModal.setAttribute('aria-hidden', 'false');
        if(typeof updateRuneSwapUI === 'function') updateRuneSwapUI();
        else console.error("Script.js: updateRuneSwapUI undefined.");
    } catch (e) { console.error("Script.js: Error opening rune swap:", e); if(typeof showError === 'function') showError("Error opening rune swap.", e); }
}

/**
 * Updates the rune swap UI.
 */
function updateRuneSwapUI() {
    try {
        if (!currentActiveRuneDisplay || !unlockedRunesContainer || !playerData) return;
        const currentRuneInfo = ELEMENTAL_TYPES[playerData.rune] || {name: playerData.rune, icon: '❓'};
        currentActiveRuneDisplay.innerHTML = `<div class="active-rune"><img src="${runeIcons[playerData.rune] || (heroAvatars ? heroAvatars.Default : '')}" alt="${playerData.rune} Rune" class="rune-icon"><div class="active-rune-info"><h3>${playerData.rune} Rune</h3><p>Active</p></div></div>`;
        unlockedRunesContainer.innerHTML = ''; 
        const availableToSwap = playerData.unlockedRunes.filter(r => r !== playerData.rune);
        if (!availableToSwap.length) { unlockedRunesContainer.innerHTML = '<p><i>No other runes unlocked.</i></p>'; return; }
        availableToSwap.forEach(runeName => { 
            const runeDiv = document.createElement('div'); runeDiv.className = 'unlocked-rune-choice';
            const runeDetails = ELEMENTAL_TYPES[runeName] || {name: runeName, icon: '❓'};
            runeDiv.innerHTML = `<img src="${runeIcons[runeName] || (heroAvatars ? heroAvatars.Default : '')}" alt="${runeName} Rune" class="rune-icon"><div class="rune-info"><h3>${runeName} Rune</h3><p class="rune-element-details">Strong: ${runeDetails.strong?.join(', ')||'N/A'}<br>Weak: ${runeDetails.weak?.join(', ')||'N/A'}</p></div>`;
            const swapBtn = document.createElement('button'); swapBtn.className='action-button swap-button'; swapBtn.textContent='Attune'; swapBtn.onclick=()=>{if(typeof swapToRune==='function')swapToRune(runeName);};
            runeDiv.appendChild(swapBtn); unlockedRunesContainer.appendChild(runeDiv);
        });
    } catch (e) { console.error("Script.js: Error updating rune swap UI:", e); if(typeof showError === 'function') showError("Error updating rune swap.", e); }
}

/**
 * Swaps the player's active rune.
 */
function swapToRune(newRune) {
    try {
        if (!playerData.unlockedRunes.includes(newRune)) { if(typeof addLogMessage === 'function') addLogMessage(`Rune ${newRune} not unlocked.`, "warning"); return; }
        if (playerData.rune === newRune) { if(typeof addLogMessage === 'function') addLogMessage(`Already using ${newRune} Rune.`, "info"); if (runeSwapModal) runeSwapModal.style.display = 'none'; return; }
        const oldRune = playerData.rune;
        playerData.rune = newRune;
        playerData.avatar = heroAvatars[newRune] || heroAvatars.Default;
        if(typeof definePlayerSkills === 'function') definePlayerSkills(newRune);
        else console.error("Script.js: definePlayerSkills missing for rune swap.");
        if (playerRuneDisplay) playerRuneDisplay.textContent = newRune;
        if(typeof updatePlayerStatsUI === 'function') updatePlayerStatsUI(); 
        if(typeof addLogMessage === 'function') addLogMessage(`Swapped from ${oldRune} to ${newRune} Rune!`, "event-critical");
        if (runeSwapModal) { runeSwapModal.style.display = 'none'; runeSwapModal.setAttribute('aria-hidden', 'true'); }
    } catch (e) { console.error("Script.js: Error swapping rune:", e); if(typeof showError === 'function') showError("Error swapping rune.", e); }
}

/**
 * Adds a message to the game log.
 * This is the base version. combat-log-enhancements.js might override this.
 */
function addLogMessage(message, type = "info") {
    if (!gameLog) { 
        console.log(`LOG (${type}): ${message}`); 
        return;
    }
    try {
        const logEntry = document.createElement('div'); 
        logEntry.className = `log-entry log-${type}`; 
        logEntry.textContent = message;
        gameLog.appendChild(logEntry); 
        gameLog.scrollTop = gameLog.scrollHeight;
        const maxEntries = 100; 
        while (gameLog.children.length > maxEntries) {
            if (gameLog.firstChild) gameLog.removeChild(gameLog.firstChild); 
            else break; 
        }
    } catch (error) {
        console.error("Script.js: Error adding log message:", error.message, error.stack, {message, type});
        console.log(`LOG (${type}) (UI-Error): ${message}`);
    }
}

// --- Final Log Message for Script.js ---
console.log("Script.js: All parts loaded. Initialization via DOMContentLoaded has proceeded.");

// --- END OF SCRIPT.JS (ALL PLANNED PARTS) ---
