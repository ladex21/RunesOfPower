"use strict"; // Enforce stricter parsing and error handling

// --- DEBUGGING & VERSION INFO ---
const GAME_VERSION = "1.0.1";
console.log("Runes of Power v" + GAME_VERSION + " initializing...");
const DEBUG_MODE = true;

// Debug logging function for development
function debugLog(message) {
    if (DEBUG_MODE) console.log("DEBUG: " + message);
}

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
    skillMastery: {},
    version: GAME_VERSION
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
window.gameInitialized = false;
window.uiInitialized = false;

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
    // This function initializes the error display system
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
        
        // Make sure we have an error logger
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
                window.onerror = (msg, src, line, col, err) => { 
                    if(typeof showError === 'function') showError(`Unhandled: ${msg} @ ${src}:${line}`, err); 
                    return true; 
                };
                window.onunhandledrejection = evt => { 
                    if(typeof showError === 'function') showError(`Unhandled Promise: ${evt.reason}`, evt.reason); 
                };
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

// Initialize early error display during component initialization
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

// --- Fallback Error Functions ---
// Fallback showError if not provided by other means
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

// --- ALL OTHER GAME DATA CONSTANTS ---
// These can come after the critical playerData and heroAvatars.

const PLAYER_BASE_HP = 100;
const PLAYER_HP_PER_LEVEL = 34;
const PLAYER_BASE_MANA = 55;
const PLAYER_MANA_PER_LEVEL = 15;
const PLAYER_BASE_ATTACK_POWER = 7;
const PLAYER_ATTACK_POWER_PER_LEVEL = 4;
const PLAYER_BASE_DEFENSE = 3;
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

// Define crucial game assets
const runeIcons = { 
    Fire: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23FF6347'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🔥%3C/text%3E%3C/svg%3E",
    Water: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234682B4'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E💧%3C/text%3E%3C/svg%3E",
    Nature: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%233CB371'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E🌿%3C/text%3E%3C/svg%3E",
    Light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23FFFACD'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='black' text-anchor='middle' dominant-baseline='middle'%3E✨%3C/text%3E%3C/svg%3E",
    Dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234B0082'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌑%3C/text%3E%3C/svg%3E"
};

const monsterSprites = {
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

const ELEMENTAL_TYPES = {
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

const GAME_AREAS = {
    town: { name: "Runehaven", description: "A small town where adventurers gather.", backgroundImage: "https://placehold.co/800x200/7B9E89/FFFFFF?text=Runehaven&font=pressstart2p", shops: ["generalStore", "magicEmporium", "blacksmith"], monsters: [], isSafe: true },
    forest: { name: "Whispering Woods", description: "An ancient forest.", backgroundImage: "https://placehold.co/800x200/2E8B57/FFFFFF?text=Whispering+Woods&font=pressstart2p", shops: [], monsters: ["Forest Wisp", "Vine Crawler"], isSafe: false, recommendedLevel: 1, dominantElement: "Nature" },
    volcano: { name: "Ember Peaks", description: "An active volcano.", backgroundImage: "https://placehold.co/800x200/B22222/FFFFFF?text=Ember+Peaks&font=pressstart2p", shops: [], monsters: ["Tiny Flame Imp", "Blaze Hound"], isSafe: false, recommendedLevel: 3, dominantElement: "Fire" },
    lake: { name: "Crystal Lake", description: "A serene, dangerous lake.", backgroundImage: "https://placehold.co/800x200/4169E1/FFFFFF?text=Crystal+Lake&font=pressstart2p", shops: [], monsters: ["Puddle Sprite", "Deep One"], isSafe: false, recommendedLevel: 2, dominantElement: "Water" },
    cavern: { name: "Stone Hollow", description: "Dark, rocky caverns.", backgroundImage: "https://placehold.co/800x200/696969/FFFFFF?text=Stone+Hollow&font=pressstart2p", shops: [], monsters: ["Stone Golem"], isSafe: false, recommendedLevel: 4, dominantElement: "Earth" },
    temple: { name: "Temple of Radiance", description: "A sacred, light-filled temple.", backgroundImage: "https://placehold.co/800x200/FFD700/000000?text=Temple+of+Radiance&font=pressstart2p", shops: ["holyShrine"], monsters: ["Sun Seeker"], isSafe: false, recommendedLevel: 5, dominantElement: "Light" },
    crypt: { name: "Shadow Crypt", description: "An ancient, dark crypt.", backgroundImage: "https://placehold.co/800x200/483D8B/FFFFFF?text=Shadow+Crypt&font=pressstart2p", shops: [], monsters: ["Shadow Pup"], isSafe: false, recommendedLevel: 6, dominantElement: "Dark" }
};

const SHOP_TYPES = {
    generalStore: { name: "General Store", description: "Basic supplies.", inventory: ["health_potion_s", "health_potion_m", "mana_potion_s", "mana_potion_m", "revival_stone"] },
    magicEmporium: { name: "Magic Emporium", description: "Magical items.", inventory: ["mana_potion_l", "elemental_charm", "spell_scroll", "rune_fragment"] },
    blacksmith: { name: "Blacksmith", description: "Weapons and armor.", inventory: ["basic_sword", "reinforced_shield", "leather_armor", "iron_helmet"] },
    holyShrine: { name: "Holy Shrine", description: "Sacred items.", inventory: ["holy_water", "blessed_amulet", "warding_charm", "purification_scroll"] }
};

const shopItems = [
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

const monsterTemplates = [
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

const bossMonsterTemplates = [
    { name: "GRONK, Earth Titan", type: "Earth", baseMaxHp: 220, baseAttack: 15, baseDefense: 8, expReward: 120, goldReward: 80, spriteKey: "GronkBoss", skills: [ { name: "Titan Slam", damageMultiplier: 1.5, type: "Earth", chance: 0.6, description: "A devastating slam." }, { name: "Earthquake", damageMultiplier: 1.2, type: "Earth", chance: 0.3, aoe: true, description: "Shakes the ground." }, { name: "Stone Skin", damageMultiplier: 0, type: "Buff", effect: "defense_up", chance: 0.2, description: "Boosts Defense." } ], isBoss: true },
    { name: "VOIDMAW, Hungering Dark", type: "Dark", baseMaxHp: 180, baseAttack: 20, baseDefense: 6, expReward: 150, goldReward: 100, spriteKey: "VoidmawBoss", skills: [ { name: "Shadow Claw", damageMultiplier: 1.4, type: "Dark", chance: 0.5, description: "Dark claws." }, { name: "Devouring Void", damageMultiplier: 1.0, type: "Dark", chance: 0.3, effect: "hp_drain", description: "Drains life." }, { name: "Nightmare Veil", damageMultiplier: 0, type: "Debuff", effect: "accuracy_down", chance: 0.2, description: "Lowers accuracy." } ], isBoss: true }
];

// --- Function Definitions ---

/**
 * Sets up event listeners for the rune selection buttons.
 */
function setupRuneSelectionButtons() {
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
        window.gameInitialized = true;

    } catch (error) {
        console.error("Script.js: FATAL ERROR during DOMContentLoaded:", error.message, error.stack);
        if (typeof showError === 'function') showError("FATAL DOMContentLoaded ERROR: " + error.message, error);
        else alert("FATAL DOMContentLoaded ERROR. Check console. Error: " + error.message);
    }
});

// --- Utility and Core Setup Functions (assignDOMElements, validateDOMElements, initialUISetup, etc.) ---
function assignDOMElements() {
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
        window.uiInitialized = true;
    } catch (error) {
        console.error("Script.js: Error during initialUISetup:", error.message, error.stack);
        if (typeof showError === 'function') showError("Error during initial UI setup: " + error.message, error);
    }
}

function setupGlobalErrorHandlers() {
    window.onerror = function(message, source, lineno, colno, error) { const srcFile = source ? source.substring(source.lastIndexOf('/')+1) : 'unknown'; const msg = `Unhandled: ${message} @ ${srcFile}:${lineno}:${colno}`; console.error(msg, error); if(typeof showError==='function')showError(msg,error); return true; };
    window.onunhandledrejection = function(event) { const reason = event.reason || "Unhandled rejection"; let msg = "Unhandled Promise Rejection: "; let errObj = null; if(reason instanceof Error){msg+=reason.message; errObj=reason;}else if(typeof reason === 'string'){msg+=reason; errObj=new Error(reason);}else{try{msg+=JSON.stringify(reason);}catch(e){msg+="Non-serializable reason";}errObj=new Error(msg);} console.error(msg,errObj); if(typeof showError==='function')showError(msg,errObj);};
    console.log("Script.js: Global error handlers set up.");
}

function hideAllModals() {
    try { const modals = document.querySelectorAll('.modal'); modals.forEach(m => { if(m && m.style) {m.style.display = 'none'; m.setAttribute('aria-hidden', 'true');}}); } catch(e) {console.error("Error in hideAllModals:", e);}
}

function hideAllScreens() {
    try { const screens = document.querySelectorAll('.screen'); screens.forEach(s => { if(s && s.style) {s.classList.remove('active'); s.setAttribute('aria-hidden', 'true'); s.style.display='none'; s.style.opacity='0'; s.style.visibility='hidden';}}); } catch(e) {console.error("Error in hideAllScreens:", e); if(typeof showError==='function')showError("Error hiding screens",e);}
}

function activateScreen(screenId) {
    try { if(typeof hideAllScreens==='function')hideAllScreens(); else console.warn("hideAllScreens missing in activateScreen"); const screenEl = document.getElementById(screenId); if(!screenEl || !screenEl.style){console.error(`Screen ${screenId} not found/invalid.`); if(typeof showError==='function')showError(`Screen ${screenId} missing.`); return false;} screenEl.style.display='flex'; void screenEl.offsetWidth; screenEl.classList.add('active'); screenEl.setAttribute('aria-hidden','false'); setTimeout(()=>{screenEl.style.opacity='1'; screenEl.style.visibility='visible';},10); console.log(`Script.js: Screen ${screenId} activated.`); return true; } catch(e){console.error(`Error activating ${screenId}:`,e); if(typeof showError==='function')showError(`Error activating ${screenId}`,e); return false;}
}

// --- Game Logic Functions ---

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
        const baseSkillValues = {
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
                ]; 
                break;
            case 'Water':
                elementalSkills = [
                    { id: "water_aqua_jet", name: "Aqua Jet", manaCost: 9, description: "Swiftly strike with water.", icon: "💧", effects: { damage: baseSkillValues.aquaJetDamage, type: "Water", target: "enemy" } },
                    { id: "water_tidal_crash", name: "Tidal Crash", manaCost: 20, description: "A powerful wave.", icon: "🌊", effects: { damage: baseSkillValues.tidalCrashDamage, type: "Water", target: "enemy" } },
                    { id: "water_soothing_mist", name: "Soothing Mist", manaCost: 16, description: "Healing mist restores health.", icon: "🌫️", effects: { heal: baseSkillValues.soothingMistHeal, type: "Water", target: "self" } }
                ]; 
                break;
            case 'Nature':
                elementalSkills = [
                    { id: "nature_vine_lash", name: "Vine Lash", manaCost: 10, description: "Strike with a thorny vine.", icon: "🌿", effects: { damage: baseSkillValues.vineLashDamage, type: "Nature", target: "enemy" } },
                    { id: "nature_earth_spike", name: "Earth Spike", manaCost: 18, description: "Summon a spike from the ground.", icon: "🌱", effects: { damage: baseSkillValues.earthSpikeDamage, type: "Nature", target: "enemy" } },
                    { id: "nature_regenerate", name: "Regenerate", manaCost: 16, description: "Natural healing powers.", icon: "🍃", effects: { heal: baseSkillValues.regenerateHeal, type: "Nature", target: "self" } }
                ]; 
                break;
            case 'Light':
                elementalSkills = [
                    { id: "light_holy_spark", name: "Holy Spark", manaCost: 10, description: "A spark of divine light.", icon: "✨", effects: { damage: baseSkillValues.holySparkDamage, type: "Light", target: "enemy" } },
                    { id: "light_divine_shield", name: "Divine Shield", manaCost: 15, description: "Creates a protective barrier.", icon: "🛡️", effects: { buff: "defense_up", value: baseSkillValues.divineShieldValue, duration: 3, type: "Light", target: "self" } },
                    { id: "light_flash_heal", name: "Flash Heal", manaCost: 18, description: "Quick burst of healing light.", icon: "💫", effects: { heal: baseSkillValues.flashHeal, type: "Light", target: "self" } }
                ]; 
                break;
            case 'Dark':
                elementalSkills = [
                    { id: "dark_shadow_bolt", name: "Shadow Bolt", manaCost: 10, description: "A bolt of dark energy.", icon: "🌑", effects: { damage: baseSkillValues.shadowBoltDamage, type: "Dark", target: "enemy" } },
                    { id: "dark_void_blast", name: "Void Blast", manaCost: 20, description: "Unleash the void.", icon: "⚫", effects: { damage: baseSkillValues.lifeDrainDamage * 1.5, type: "Dark", target: "enemy" } },
                    { id: "dark_life_drain", name: "Life Drain", manaCost: 15, description: "Drain life from the enemy.", icon: "💀", effects: { damage: baseSkillValues.lifeDrainDamage, heal: true, healPercent: baseSkillValues.lifeDrainHealPercent, type: "Dark", target: "enemy" } }
                ]; 
                break;
            default:
                console.warn(`Script.js: Unknown rune type "${rune}", using default skills.`);
                elementalSkills = [
                    { id: "basic_strike", name: "Basic Strike", manaCost: 10, description: "A basic magical strike.", icon: "⚡", effects: { damage: 10, type: "Normal", target: "enemy" } },
                    { id: "power_blast", name: "Power Blast", manaCost: 18, description: "A stronger magical blast.", icon: "💥", effects: { damage: 18, type: "Normal", target: "enemy" } },
                    { id: "recover", name: "Recover", manaCost: 15, description: "Basic healing magic.", icon: "❤️", effects: { heal: 20, type: "Normal", target: "self" } }
                ];
        }

        // Add the universal melee attack skill to all characters
        const meleeAttack = getMeleeAttackSkill();
        
        // Combine melee attack with elemental skills
        playerData.skills = [meleeAttack, ...elementalSkills];
        
        // Create skill buttons 
        if (typeof createSkillButtons === 'function') {
            createSkillButtons();
        } else {
            console.error("Script.js: createSkillButtons function is missing!");
            if (typeof showError === 'function') {
                showError("Cannot create skill buttons: Function missing.");
            }
        }
        
        console.log(`Script.js: ${playerData.skills.length} skills defined for ${rune} rune.`);
    } catch (error) {
        console.error(`Script.js: Error defining skills for ${rune} rune:`, error.message, error.stack);
        if (typeof showError === 'function') {
            showError(`Error defining ${rune} skills: ${error.message}`);
        }
    }
}

function createSkillButtons() {
    try {
        if (!skillButtonsArea) {
            console.error("Script.js: skillButtonsArea element not found. Cannot create skill buttons.");
            return;
        }
        
        // Clear any existing buttons
        skillButtonsArea.innerHTML = '';
        
        if (!playerData.skills || !Array.isArray(playerData.skills) || playerData.skills.length === 0) {
            console.warn("Script.js: No skills found in playerData.skills.");
            if (typeof addLogMessage === 'function') {
                addLogMessage("No skills available.", "warning");
            }
            return;
        }
        
        playerData.skills.forEach(skill => {
            // Create a button for each skill
            const button = document.createElement('button');
            button.id = `skill-button-${skill.id}`;
            button.className = 'skill-button';
            button.dataset.skillId = skill.id;
            button.title = `${skill.name}: ${skill.description}` + 
                        (skill.manaCost > 0 ? ` (${skill.manaCost} MP)` : '');
            
            // Add icon and name to the button
            const iconSpan = document.createElement('span');
            iconSpan.className = 'skill-icon';
            iconSpan.textContent = skill.icon || '?';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'skill-name';
            nameSpan.textContent = skill.name;
            
            const costSpan = document.createElement('span');
            costSpan.className = 'skill-cost';
            costSpan.textContent = skill.manaCost > 0 ? `${skill.manaCost} MP` : 'Free';
            
            button.appendChild(iconSpan);
            button.appendChild(nameSpan);
            button.appendChild(costSpan);
            
            // Set button click handler
            button.addEventListener('click', function() {
                if (typeof useSkill === 'function') {
                    useSkill(skill.id);
                } else {
                    console.error("Script.js: useSkill function is missing!");
                    if (typeof showError === 'function') {
                        showError("Cannot use skill: Function missing.");
                    }
                }
            });
            
            // Add to the skill buttons area
            skillButtonsArea.appendChild(button);
        });
        
        console.log(`Script.js: Created ${playerData.skills.length} skill buttons.`);
        
        // Update buttons to show which ones are available based on mana
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        } else {
            console.warn("Script.js: updateSkillButtonsAvailability function is missing.");
        }
    } catch (error) {
        console.error("Script.js: Error creating skill buttons:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error creating skill buttons: " + error.message, error);
        }
    }
}

function updateSkillButtonsAvailability() {
    try {
        const skillButtons = document.querySelectorAll('.skill-button');
        if (!skillButtons || skillButtons.length === 0) {
            console.warn("Script.js: No skill buttons found to update availability.");
            return;
        }
        
        if (!playerData) {
            console.error("Script.js: playerData missing in updateSkillButtonsAvailability.");
            return;
        }
        
        // Update each button's appearance based on mana cost
        skillButtons.forEach(button => {
            const skillId = button.dataset.skillId;
            if (!skillId) {
                console.warn("Script.js: Skill button missing skill-id data attribute.");
                return;
            }
            
            // Find the skill in the player's skills
            const skill = playerData.skills.find(s => s.id === skillId);
            if (!skill) {
                console.warn(`Script.js: Skill with ID ${skillId} not found in player skills.`);
                return;
            }
            
            // Check if the player has enough mana and if we're in combat
            const hasEnoughMana = playerData.mana >= skill.manaCost;
            const inCombat = window.currentMonster !== null && !window.gameOver;
            const isPlayerTurnInCombat = window.isPlayerTurn && !window.combatLock;
            
            // Update button style and disabled state
            button.disabled = !hasEnoughMana || !inCombat || !isPlayerTurnInCombat;
            
            if (!hasEnoughMana) {
                button.classList.add('insufficient-mana');
                button.classList.remove('available');
            } else if (!inCombat) {
                button.classList.remove('insufficient-mana');
                button.classList.remove('available');
            } else if (!isPlayerTurnInCombat) {
                button.classList.remove('insufficient-mana');
                button.classList.remove('available');
                button.classList.add('waiting');
            } else {
                button.classList.remove('insufficient-mana');
                button.classList.add('available');
                button.classList.remove('waiting');
            }
        });
        
        console.log("Script.js: Skill button availability updated.");
    } catch (error) {
        console.error("Script.js: Error updating skill button availability:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error updating skill buttons: " + error.message, error);
        }
    }
}

function useSkill(skillId) {
    try {
        // Check if we're in combat and it's the player's turn
        if (!currentMonster) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("No monster to use skill on!", "warning");
            }
            return;
        }
        
        if (window.gameOver) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("Game over! Cannot use skills.", "warning");
            }
            return;
        }
        
        if (!window.isPlayerTurn) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("It's not your turn yet!", "warning");
            }
            return;
        }
        
        if (window.combatLock) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("Please wait...", "info");
            }
            return;
        }
        
        // Find the skill in the player's skills
        const skill = playerData.skills.find(s => s.id === skillId);
        if (!skill) {
            console.error(`Script.js: Skill with ID ${skillId} not found.`);
            if (typeof showError === 'function') {
                showError(`Skill "${skillId}" not found.`);
            }
            return;
        }
        
        // Check if the player has enough mana
        if (playerData.mana < skill.manaCost) {
            if (typeof addLogMessage === 'function') {
                addLogMessage(`Not enough mana! Needed: ${skill.manaCost}`, "warning");
            }
            return;
        }
        
        // Lock combat to prevent multiple skill uses
        window.combatLock = true;
        
        // Use mana
        if (skill.manaCost > 0) {
            playerData.mana -= skill.manaCost;
            if (typeof addLogMessage === 'function') {
                addLogMessage(`Using ${skill.name}! (-${skill.manaCost} MP)`, "player-action");
            }
        } else if (typeof addLogMessage === 'function') {
            addLogMessage(`Using ${skill.name}!`, "player-action");
        }
        
        // Update UI
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        
        // Process skill effects
        if (skill.effects) {
            // Apply status effects from skill if any
            if (typeof processTurnStatusEffects === 'function') {
                processTurnStatusEffects(); // Process any active effects before skill use
            }
            
            // Check for skill mastery
            let masteryBonus = 0;
            if (playerData.skillMastery && playerData.skillMastery[skill.id]) {
                masteryBonus = playerData.skillMastery[skill.id] * 0.05; // 5% bonus per mastery level
            }
            
            // Check for skill boost status effect
            let skillBoost = 0;
            const skillBoostEffect = playerData.statusEffects.find(e => e.type === "skill_boost");
            if (skillBoostEffect) {
                skillBoost = skillBoostEffect.value || 0;
                // Remove the one-time boost
                playerData.statusEffects = playerData.statusEffects.filter(e => e.type !== "skill_boost");
                if (typeof updatePlayerStatusEffectsUI === 'function') {
                    updatePlayerStatusEffectsUI();
                }
            }
            
            // Process damage effects
            if (skill.effects.damage) {
                let damage = skill.effects.damage;
                
                // Scale damage with level and attack power
                damage = Math.round(damage * (1 + (playerData.level - 1) * 0.15)); // +15% per level
                damage = Math.round(damage * (1 + playerData.attackPower / 20)); // Scale with attack
                
                // Apply elemental boost if the skill type matches the player's rune
                if (skill.effects.type === playerData.rune && playerData.elementalBoostPercent > 0) {
                    const elementalBoost = 1 + playerData.elementalBoostPercent;
                    damage = Math.round(damage * elementalBoost);
                    if (typeof addLogMessage === 'function') {
                        addLogMessage(`${playerData.rune} affinity bonus: +${Math.round(playerData.elementalBoostPercent * 100)}%!`, "buff");
                    }
                }
                
                // Apply mastery and skill boost
                if (masteryBonus > 0 || skillBoost > 0) {
                    const totalBoost = 1 + masteryBonus + skillBoost;
                    damage = Math.round(damage * totalBoost);
                    if (typeof addLogMessage === 'function') {
                        if (masteryBonus > 0 && skillBoost > 0) {
                            addLogMessage(`Skill mastery and boost: +${Math.round((masteryBonus + skillBoost) * 100)}% damage!`, "buff");
                        } else if (masteryBonus > 0) {
                            addLogMessage(`Skill mastery: +${Math.round(masteryBonus * 100)}% damage!`, "buff");
                        } else if (skillBoost > 0) {
                            addLogMessage(`Skill boost: +${Math.round(skillBoost * 100)}% damage!`, "buff");
                        }
                    }
                }
                
                // Apply type effectiveness
                let typeMultiplier = 1.0;
                if (ELEMENTAL_TYPES[skill.effects.type] && ELEMENTAL_TYPES[currentMonster.type]) {
                    if (ELEMENTAL_TYPES[skill.effects.type].strong.includes(currentMonster.type)) {
                        typeMultiplier = 1.5;
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${skill.effects.type} is super effective against ${currentMonster.type}!`, "effectiveness");
                        }
                    } else if (ELEMENTAL_TYPES[skill.effects.type].weak.includes(currentMonster.type)) {
                        typeMultiplier = 0.5;
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${skill.effects.type} is not very effective against ${currentMonster.type}...`, "effectiveness");
                        }
                    }
                    damage = Math.round(damage * typeMultiplier);
                }
                
                // Apply monster defense reduction
                damage = Math.max(1, damage - currentMonster.defense);
                
                // Deal damage to monster
                if (typeof damageMonster === 'function') {
                    damageMonster(damage, skill.effects.type);
                } else {
                    console.error("Script.js: damageMonster function is missing!");
                    if (typeof showError === 'function') {
                        showError("Cannot damage monster: Function missing.");
                    }
                    window.combatLock = false;
                    return;
                }
                
                // Life drain effect (heal player based on damage dealt)
                if (skill.effects.heal && skill.effects.healPercent) {
                    const healAmount = Math.round(damage * skill.effects.healPercent);
                    if (healAmount > 0) {
                        playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${skill.name} drained ${healAmount} HP!`, "heal");
                        }
                        if (typeof updatePlayerStatsUI === 'function') {
                            updatePlayerStatsUI();
                        }
                    }
                }
            }
            
            // Process healing effects
            if (skill.effects.heal && !skill.effects.healPercent) { // Direct healing, not life drain
                let healAmount = skill.effects.heal;
                
                // Scale healing with level and bonus factors
                healAmount = Math.round(healAmount * (1 + (playerData.level - 1) * 0.1)); // +10% per level
                
                // Apply mastery and skill boost
                if (masteryBonus > 0 || skillBoost > 0) {
                    const totalBoost = 1 + masteryBonus + skillBoost;
                    healAmount = Math.round(healAmount * totalBoost);
                    if (typeof addLogMessage === 'function') {
                        if (masteryBonus > 0 && skillBoost > 0) {
                            addLogMessage(`Skill mastery and boost: +${Math.round((masteryBonus + skillBoost) * 100)}% healing!`, "buff");
                        } else if (masteryBonus > 0) {
                            addLogMessage(`Skill mastery: +${Math.round(masteryBonus * 100)}% healing!`, "buff");
                        } else if (skillBoost > 0) {
                            addLogMessage(`Skill boost: +${Math.round(skillBoost * 100)}% healing!`, "buff");
                        }
                    }
                }
                
                const oldHP = playerData.hp;
                playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
                const actualHeal = playerData.hp - oldHP;
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${skill.name} restored ${actualHeal} HP!`, "heal");
                }
                
                if (typeof updatePlayerStatsUI === 'function') {
                    updatePlayerStatsUI();
                }
            }
            
            // Process buff/debuff effects
            if (skill.effects.buff) {
                const buffType = skill.effects.buff;
                const buffValue = skill.effects.value || 0;
                const buffDuration = skill.effects.duration || 3; // Default 3 turns
                
                // Apply the buff
                playerData.statusEffects.push({
                    type: buffType,
                    value: buffValue,
                    duration: buffDuration,
                    description: `${skill.name} effect`,
                    isBuff: true
                });
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${skill.name} gives ${buffType.replace(/_/g, ' ')} +${buffValue} for ${buffDuration} turns!`, "buff");
                }
                
                if (typeof updatePlayerStatusEffectsUI === 'function') {
                    updatePlayerStatusEffectsUI();
                }
            }
            
            // Process debuff effects on monster
            if (skill.effects.debuff) {
                const debuffType = skill.effects.debuff;
                const debuffValue = skill.effects.value || 0;
                const debuffDuration = skill.effects.duration || 3; // Default 3 turns
                
                // Apply the debuff to monster
                if (!currentMonster.statusEffects) {
                    currentMonster.statusEffects = [];
                }
                
                currentMonster.statusEffects.push({
                    type: debuffType,
                    value: debuffValue,
                    duration: debuffDuration,
                    description: `${skill.name} effect`,
                    isBuff: false
                });
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${skill.name} inflicts ${debuffType.replace(/_/g, ' ')} on ${currentMonster.name}!`, "debuff");
                }
                
                if (typeof updateMonsterStatusEffectsUI === 'function') {
                    updateMonsterStatusEffectsUI();
                }
            }
            
            // Handle mana regeneration from melee attacks
            if (skill.effects.manaRegen) {
                const manaRegen = skill.effects.manaRegen;
                playerData.mana = Math.min(playerData.maxMana, playerData.mana + manaRegen);
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`Regenerated ${manaRegen} MP!`, "info");
                }
                
                if (typeof updatePlayerStatsUI === 'function') {
                    updatePlayerStatsUI();
                }
            }
        }
        
        // Check if monster is defeated
        if (currentMonster && currentMonster.hp <= 0) {
            // Monster defeated, end combat and give rewards
            if (typeof handleMonsterDefeated === 'function') {
                setTimeout(() => {
                    handleMonsterDefeated();
                }, 500);
            } else {
                console.error("Script.js: handleMonsterDefeated function is missing!");
                if (typeof showError === 'function') {
                    showError("Cannot handle monster defeat: Function missing.");
                }
                window.combatLock = false;
            }
        } else {
            // Monster still alive, switch to monster's turn
            window.isPlayerTurn = false;
            
            // Update UI to reflect turn change
            if (typeof updateSkillButtonsAvailability === 'function') {
                updateSkillButtonsAvailability();
            }
            
            // Monster takes its turn
            setTimeout(() => {
                if (typeof monsterTurn === 'function') {
                    monsterTurn();
                } else {
                    console.error("Script.js: monsterTurn function is missing!");
                    if (typeof showError === 'function') {
                        showError("Cannot process monster turn: Function missing.");
                    }
                    // Emergency fallback - return to player's turn
                    window.isPlayerTurn = true;
                    window.combatLock = false;
                    if (typeof updateSkillButtonsAvailability === 'function') {
                        updateSkillButtonsAvailability();
                    }
                }
            }, 1000); // 1 second delay before monster's turn
        }
        
    } catch (error) {
        console.error(`Script.js: Error using skill ${skillId}:`, error.message, error.stack);
        if (typeof showError === 'function') {
            showError(`Error using skill: ${error.message}`, error);
        }
        // Emergency unlock
        window.combatLock = false;
        window.isPlayerTurn = true;
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
    }
}

/**
 * Applies damage to the current monster.
 * @param {number} amount - The amount of damage to deal.
 * @param {string} damageType - The elemental type of the damage.
 */
function damageMonster(amount, damageType) {
    try {
        if (!currentMonster) {
            console.warn("Script.js: No monster to damage.");
            return;
        }
        
        // Ensure amount is a valid number
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error(`Script.js: Invalid damage amount: ${amount}`);
            amount = 1; // Fallback to minimal damage
        }
        
        // Apply damage
        const oldHP = currentMonster.hp;
        currentMonster.hp = Math.max(0, currentMonster.hp - amount);
        const actualDamage = oldHP - currentMonster.hp;
        
        // Log the damage
        if (typeof addLogMessage === 'function') {
            addLogMessage(`You dealt ${actualDamage} ${damageType || 'Normal'} damage to ${currentMonster.name}!`, "damage");
        }
        
        // Update monster HP display
        if (typeof updateMonsterStatsUI === 'function') {
            updateMonsterStatsUI();
        }
        
        // Visual feedback
        if (monsterSprite) {
            monsterSprite.classList.add('damaged');
            setTimeout(() => {
                monsterSprite.classList.remove('damaged');
            }, 300);
        }
        
        console.log(`Script.js: Monster damaged for ${actualDamage} ${damageType || 'Normal'} damage.`);
    } catch (error) {
        console.error("Script.js: Error damaging monster:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error damaging monster: " + error.message, error);
        }
    }
}

/**
 * Handles monster defeat, including rewards and next steps.
 */
function handleMonsterDefeated() {
    try {
        if (!currentMonster) {
            console.warn("Script.js: No monster to handle defeat for.");
            return;
        }
        
        // Log monster defeat
        if (typeof addLogMessage === 'function') {
            addLogMessage(`You defeated ${currentMonster.name}!`, "success");
        }
        
        // Update monster sprite to show defeat
        if (monsterSprite && monsterSprites && monsterSprites.Victory) {
            monsterSprite.src = monsterSprites.Victory;
            monsterSprite.alt = "Victory";
        }
        
        // Calculate and award experience
        let expReward = currentMonster.expReward || 10;
        
        // Bosses give extra exp
        if (currentMonster.isBoss) {
            expReward = Math.round(expReward * 1.5);
        }
        
        // Award exp
        if (typeof addExperience === 'function') {
            addExperience(expReward);
        } else {
            console.warn("Script.js: addExperience function is missing.");
            // Basic fallback
            playerData.exp += expReward;
            if (typeof addLogMessage === 'function') {
                addLogMessage(`Gained ${expReward} EXP!`, "exp-gain");
            }
            if (typeof updatePlayerStatsUI === 'function') {
                updatePlayerStatsUI();
            }
        }
        
        // Calculate and award gold
        const goldReward = currentMonster.goldReward || 5;
        playerData.gold += goldReward;
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Found ${goldReward} gold!`, "gold-gain");
        }
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        
        // Heal on victory and restore some mana
        const healAmount = Math.round(playerData.maxHp * HEAL_ON_DEFEAT_PERCENT_HP);
        const manaRestore = Math.round(playerData.maxMana * REGEN_ON_DEFEAT_PERCENT_MANA);
        
        playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
        playerData.mana = Math.min(playerData.maxMana, playerData.mana + manaRestore);
        
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Victory restores ${healAmount} HP and ${manaRestore} MP!`, "heal");
        }
        
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        
        // Update monster defeat count
        if (!currentMonster.isBoss) {
            window.regularMonsterDefeatCount++;
        }
        
        // Potentially get item drops
        if (Math.random() < 0.3) { // 30% chance of item drop
            const possibleDrops = ["health_potion_s", "mana_potion_s"];
            if (Math.random() < 0.1) { // 10% chance of better drop within the 30%
                possibleDrops.push("health_potion_m", "mana_potion_m");
            }
            
            const randomDrop = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
            const droppedItem = shopItems.find(item => item.id === randomDrop);
            
            if (droppedItem) {
                addItemToInventory(droppedItem);
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${currentMonster.name} dropped a ${droppedItem.name}!`, "item-gain");
                }
            }
        }
        
        // Determine next action after a short delay
        setTimeout(() => {
            // Clear current monster
            window.currentMonster = null;
            
            // Check if we should spawn a boss
            const bossInterval = BOSS_MONSTER_INTERVAL || 10;
            if (regularMonsterDefeatCount > 0 && regularMonsterDefeatCount % bossInterval === 0) {
                // Spawn a boss monster
                if (typeof spawnBossMonster === 'function') {
                    if (typeof addLogMessage === 'function') {
                        addLogMessage("A powerful boss approaches...", "event-critical");
                    }
                    spawnBossMonster();
                } else {
                    console.warn("Script.js: spawnBossMonster function is missing.");
                    // Fallback to regular monster
                    spawnNewMonster();
                }
            } else {
                // Spawn a regular monster
                if (typeof spawnNewMonster === 'function') {
                    spawnNewMonster();
                } else {
                    console.error("Script.js: spawnNewMonster function is missing!");
                    if (typeof showError === 'function') {
                        showError("Cannot spawn new monster: Function missing.");
                    }
                    // Return to town as a fallback
                    if (typeof enterTown === 'function' && typeof GAME_AREAS !== 'undefined' && GAME_AREAS.town) {
                        enterTown(GAME_AREAS.town);
                    } else {
                        console.error("Script.js: Cannot return to town: Functions or data missing.");
                    }
                }
            }
            
            // Unlock combat
            window.combatLock = false;
            window.isPlayerTurn = true;
        }, 1500); // 1.5 second delay before next action
        
    } catch (error) {
        console.error("Script.js: Error handling monster defeat:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing victory: " + error.message, error);
        }
        // Emergency unlock
        window.combatLock = false;
        window.isPlayerTurn = true;
    }
}

/**
 * Adds an item to the player's inventory.
 * @param {Object} item - The item to add.
 */
function addItemToInventory(item) {
    try {
        if (!item || !item.id) {
            console.warn("Script.js: Invalid item to add to inventory.");
            return false;
        }
        
        if (!playerData.inventory) {
            playerData.inventory = [];
        }
        
        // Create a deep copy of the item
        const itemCopy = JSON.parse(JSON.stringify(item));
        
        // Add a unique inventory ID to distinguish between identical items
        itemCopy.inventoryId = 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        // Add the item
        playerData.inventory.push(itemCopy);
        
        console.log(`Script.js: Added ${item.name} to inventory.`);
        return true;
    } catch (error) {
        console.error("Script.js: Error adding item to inventory:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error adding item: " + error.message, error);
        }
        return false;
    }
}

/**
 * Adds experience to the player and handles level ups.
 * @param {number} amount - The amount of experience to add.
 */
function addExperience(amount) {
    try {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            console.warn(`Script.js: Invalid experience amount: ${amount}`);
            return;
        }
        
        // Add the experience
        playerData.exp += amount;
        
        // Log the experience gain
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Gained ${amount} EXP!`, "exp-gain");
        }
        
        // Check for level up
        if (playerData.exp >= playerData.nextLevelExp) {
            levelUp();
        } else {
            // Just update the UI
            if (typeof updatePlayerStatsUI === 'function') {
                updatePlayerStatsUI();
            }
        }
    } catch (error) {
        console.error("Script.js: Error adding experience:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error adding experience: " + error.message, error);
        }
    }
}

/**
 * Handles player level up, including stat increases.
 */
function levelUp() {
    try {
        // Store old stats for comparison
        const oldLevel = playerData.level;
        const oldMaxHp = playerData.maxHp;
        const oldMaxMana = playerData.maxMana;
        const oldAttack = playerData.attackPower;
        const oldDefense = playerData.defense;
        
        // Increase level
        playerData.level++;
        
        // Calculate leftover exp and new threshold
        playerData.exp = playerData.exp - playerData.nextLevelExp;
        
        // Calculate new exp threshold using the curve factor
        playerData.nextLevelExp = Math.floor(
            INITIAL_EXP_TO_LEVEL * Math.pow(EXP_CURVE_FACTOR, playerData.level - 1) + 
            EXP_CURVE_FLAT_ADDITION * (playerData.level - 1)
        );
        
        // Increase stats
        playerData.maxHp = PLAYER_BASE_HP + (playerData.level - 1) * PLAYER_HP_PER_LEVEL;
        playerData.maxMana = PLAYER_BASE_MANA + (playerData.level - 1) * PLAYER_MANA_PER_LEVEL;
        playerData.attackPower = PLAYER_BASE_ATTACK_POWER + (playerData.level - 1) * PLAYER_ATTACK_POWER_PER_LEVEL;
        playerData.defense = PLAYER_BASE_DEFENSE + (playerData.level - 1) * PLAYER_DEFENSE_PER_LEVEL;
        
        // Apply any equipment bonuses
        if (typeof recalculatePlayerStats === 'function') {
            recalculatePlayerStats();
        }
        
        // Fully restore HP and MP on level up
        playerData.hp = playerData.maxHp;
        playerData.mana = playerData.maxMana;
        
        // Log the level up
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Level Up! You are now level ${playerData.level}!`, "level-up");
        }
        
        // Update UI
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        
        // Show level up modal if it exists
        if (levelUpModal && typeof levelUpModal.style !== 'undefined') {
            // Fill in the modal with level up information
            if (newLevelDisplay) newLevelDisplay.textContent = playerData.level;
            if (oldHpDisplay) oldHpDisplay.textContent = oldMaxHp;
            if (newHpDisplay) newHpDisplay.textContent = playerData.maxHp;
            if (oldMpDisplay) oldMpDisplay.textContent = oldMaxMana;
            if (newMpDisplay) newMpDisplay.textContent = playerData.maxMana;
            if (oldAttackDisplay) oldAttackDisplay.textContent = oldAttack;
            if (newAttackDisplay) newAttackDisplay.textContent = playerData.attackPower;
            if (oldDefenseDisplay) oldDefenseDisplay.textContent = oldDefense;
            if (newDefenseDisplay) newDefenseDisplay.textContent = playerData.defense;
            
            // Show the modal
            levelUpModal.style.display = 'block';
        }
        
        // Check for recursive level up (if we gained enough exp for another level)
        if (playerData.exp >= playerData.nextLevelExp) {
            // Recursively call levelUp again
            levelUp();
        }
    } catch (error) {
        console.error("Script.js: Error leveling up:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error leveling up: " + error.message, error);
        }
    }
}

/**
 * Recalculates player stats including equipment bonuses.
 */
function recalculatePlayerStats() {
    try {
        // Start with base stats for the player's level
        let baseMaxHp = PLAYER_BASE_HP + (playerData.level - 1) * PLAYER_HP_PER_LEVEL;
        let baseMaxMana = PLAYER_BASE_MANA + (playerData.level - 1) * PLAYER_MANA_PER_LEVEL;
        let baseAttack = PLAYER_BASE_ATTACK_POWER + (playerData.level - 1) * PLAYER_ATTACK_POWER_PER_LEVEL;
        let baseDefense = PLAYER_BASE_DEFENSE + (playerData.level - 1) * PLAYER_DEFENSE_PER_LEVEL;
        
        // Reset elemental boost
        playerData.elementalBoostPercent = 0;
        
        // Apply equipment bonuses
        for (const slot in playerData.equipment) {
            const equippedItem = playerData.equipment[slot];
            if (equippedItem && equippedItem.stats) {
                // Add stat bonuses
                if (equippedItem.stats.maxHp) baseMaxHp += equippedItem.stats.maxHp;
                if (equippedItem.stats.maxMana) baseMaxMana += equippedItem.stats.maxMana;
                if (equippedItem.stats.attackPower) baseAttack += equippedItem.stats.attackPower;
                if (equippedItem.stats.defense) baseDefense += equippedItem.stats.defense;
                
                // Special effects
                if (equippedItem.stats.elementalBoostPercent) {
                    playerData.elementalBoostPercent += equippedItem.stats.elementalBoostPercent;
                }
            }
        }
        
        // Update player stats
        playerData.maxHp = baseMaxHp;
        playerData.maxMana = baseMaxMana;
        playerData.attackPower = baseAttack;
        playerData.defense = baseDefense;
        
        // Ensure current HP and MP don't exceed maximum
        playerData.hp = Math.min(playerData.hp, playerData.maxHp);
        playerData.mana = Math.min(playerData.mana, playerData.maxMana);
        
        console.log("Script.js: Player stats recalculated with equipment bonuses.");
    } catch (error) {
        console.error("Script.js: Error recalculating player stats:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error calculating stats: " + error.message, error);
        }
    }
}

/**
 * Spawns a new regular monster for combat.
 */
function spawnNewMonster() {
    try {
        // Clear any current monster
        window.currentMonster = null;
        
        // Reset combat state
        window.combatLock = false;
        window.isPlayerTurn = true;
        
        // Select monster template based on current area
        const areaMonsterPool = getAreaMonsterPool();
        if (!areaMonsterPool || areaMonsterPool.length === 0) {
            console.error("Script.js: No monsters available for current area.");
            if (typeof addLogMessage === 'function') {
                addLogMessage("No monsters in this area!", "warning");
            }
            return;
        }
        
        // Select a random monster from the pool
        const randomIndex = Math.floor(Math.random() * areaMonsterPool.length);
        const monsterTemplate = areaMonsterPool[randomIndex];
        
        // Create monster instance based on template
        const monster = createMonsterFromTemplate(monsterTemplate);
        
        // Set as current monster
        window.currentMonster = monster;
        
        // Update UI
        if (typeof updateMonsterStatsUI === 'function') {
            updateMonsterStatsUI();
        }
        
        // Update skill buttons
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
        
        // Log monster encounter
        if (typeof addLogMessage === 'function') {
            addLogMessage(`A ${monster.name} appears!`, "event");
        }
        
        console.log(`Script.js: Spawned new monster: ${monster.name}`);
    } catch (error) {
        console.error("Script.js: Error spawning new monster:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error spawning monster: " + error.message, error);
        }
    }
}

/**
 * Spawns a boss monster for combat.
 */
function spawnBossMonster() {
    try {
        // Clear any current monster
        window.currentMonster = null;
        
        // Reset combat state
        window.combatLock = false;
        window.isPlayerTurn = true;
        
        // Select a boss template
        const bossPool = bossMonsterTemplates || [];
        if (bossPool.length === 0) {
            console.error("Script.js: No boss monsters defined.");
            // Fallback to regular monster
            spawnNewMonster();
            return;
        }
        
        // Select a random boss or based on player's level
        let bossTemplate;
        if (playerData.level <= 5) {
            // For low level players, always use the first (easier) boss
            bossTemplate = bossPool[0];
        } else if (playerData.level > 10) {
            // For high level players, randomly select any boss
            const randomIndex = Math.floor(Math.random() * bossPool.length);
            bossTemplate = bossPool[randomIndex];
        } else {
            // For mid level players, select from the first 2 bosses
            const randomIndex = Math.floor(Math.random() * Math.min(2, bossPool.length));
            bossTemplate = bossPool[randomIndex];
        }
        
        // Create boss instance
        const boss = createMonsterFromTemplate(bossTemplate);
        
        // Give boss some extra stats for being a boss
        boss.maxHp = Math.round(boss.maxHp * 1.2); // 20% more HP
        boss.hp = boss.maxHp;
        boss.attackPower = Math.round(boss.attackPower * 1.1); // 10% more attack
        
        // Set as current monster
        window.currentMonster = boss;
        
        // Update UI
        if (typeof updateMonsterStatsUI === 'function') {
            updateMonsterStatsUI();
        }
        
        // Update skill buttons
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
        
        // Log boss encounter
        if (typeof addLogMessage === 'function') {
            addLogMessage(`BOSS BATTLE: ${boss.name} challenges you!`, "event-critical");
        }
        
        console.log(`Script.js: Spawned boss monster: ${boss.name}`);
    } catch (error) {
        console.error("Script.js: Error spawning boss monster:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error spawning boss: " + error.message, error);
        }
    }
}

/**
 * Gets a pool of monsters appropriate for the current area.
 * @returns {Array} - Array of monster templates.
 */
function getAreaMonsterPool() {
    try {
        // Get current area info
        const area = GAME_AREAS[currentArea] || GAME_AREAS.forest; // Default to forest if area not found
        
        // If we're in town, return an empty pool (no monsters in town)
        if (area.isSafe) {
            return [];
        }
        
        // Get monster templates based on area
        let areaMonsterPool = [];
        
        // If area has specific monsters defined, use those
        if (area.monsters && area.monsters.length > 0) {
            // Find monsters in templates that match area.monsters names
            areaMonsterPool = monsterTemplates.filter(template => 
                area.monsters.includes(template.name));
        }
        
        // If no specific monsters or none matched, use monsters of matching elemental type
        if (areaMonsterPool.length === 0 && area.dominantElement) {
            areaMonsterPool = monsterTemplates.filter(template => 
                template.type === area.dominantElement);
        }
        
        // If still no monsters, use all available monsters
        if (areaMonsterPool.length === 0) {
            areaMonsterPool = monsterTemplates;
        }
        
        // Filter by player level - only show monsters that are appropriate level
        const maxLevelDiff = 3; // Allow monsters up to 3 levels above player
        areaMonsterPool = areaMonsterPool.filter(monster => {
            // Estimate monster level based on stats
            const estimatedLevel = Math.max(1, Math.floor(monster.baseMaxHp / 15));
            return estimatedLevel <= playerData.level + maxLevelDiff;
        });
        
        // If still no monsters (unlikely), return all
        if (areaMonsterPool.length === 0) {
            console.warn("Script.js: No suitable monsters for area, using all templates.");
            return monsterTemplates;
        }
        
        return areaMonsterPool;
    } catch (error) {
        console.error("Script.js: Error getting area monster pool:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error getting monsters: " + error.message, error);
        }
        return monsterTemplates; // Fallback to all monsters
    }
}

/**
 * Creates a monster instance from a template.
 * @param {Object} template - The monster template.
 * @returns {Object} - The monster instance.
 */
function createMonsterFromTemplate(template) {
    try {
        if (!template) {
            console.error("Script.js: Invalid monster template.");
            // Create a basic fallback monster
            return {
                name: "Unknown Creature",
                type: "Normal",
                level: playerData.level,
                maxHp: 30 + playerData.level * 5,
                hp: 30 + playerData.level * 5,
                attackPower: 5 + playerData.level,
                defense: 2,
                expReward: 10,
                goldReward: 5,
                spriteKey: "DefaultMonster",
                skills: [{ name: "Attack", damageMultiplier: 1.0, type: "Normal", chance: 1.0 }],
                statusEffects: []
            };
        }
        
        // Calculate level-scaled stats
        const monsterLevel = playerData.level;
        const hpScaling = template.baseMaxHp + (monsterLevel - 1) * MONSTER_HP_SCALING_PER_PLAYER_LEVEL;
        const attackScaling = template.baseAttack + (monsterLevel - 1) * MONSTER_ATTACK_SCALING_PER_PLAYER_LEVEL;
        const defenseScaling = template.baseDefense + (monsterLevel - 1) * MONSTER_DEFENSE_SCALING_PER_PLAYER_LEVEL;
        
        // Create the monster instance
        const monster = {
            name: template.name,
            type: template.type,
            level: monsterLevel,
            maxHp: Math.round(hpScaling),
            hp: Math.round(hpScaling),
            attackPower: Math.round(attackScaling),
            defense: Math.round(defenseScaling),
            expReward: template.expReward + (monsterLevel - 1) * 2,
            goldReward: template.goldReward + (monsterLevel - 1),
            spriteKey: template.spriteKey || "DefaultMonster",
            skills: template.skills || [{ name: "Attack", damageMultiplier: 1.0, type: "Normal", chance: 1.0 }],
            statusEffects: [],
            isBoss: template.isBoss || false
        };
        
        return monster;
    } catch (error) {
        console.error("Script.js: Error creating monster from template:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error creating monster: " + error.message, error);
        }
        
        // Create a very basic monster as fallback
        return {
            name: "Strange Creature",
            type: "Normal",
            level: playerData.level,
            maxHp: 30,
            hp: 30,
            attackPower: 5,
            defense: 2,
            expReward: 10,
            goldReward: 5,
            spriteKey: "DefaultMonster",
            skills: [{ name: "Attack", damageMultiplier: 1.0, type: "Normal", chance: 1.0 }],
            statusEffects: []
        };
    }
}

/**
 * Executes the monster's turn in combat.
 */
function monsterTurn() {
    try {
        if (!currentMonster) {
            console.warn("Script.js: No monster for turn.");
            window.isPlayerTurn = true;
            window.combatLock = false;
            return;
        }
        
        if (window.gameOver) {
            console.warn("Script.js: Game over during monster turn.");
            return;
        }
        
        // Process any status effects that should apply before monster action
        if (typeof processTurnStatusEffects === 'function') {
            processTurnStatusEffects(true); // True means we're starting the monster's turn
        }
        
        // Check if the monster is still alive after status effects
        if (currentMonster.hp <= 0) {
            // Monster was defeated by status effects
            if (typeof handleMonsterDefeated === 'function') {
                handleMonsterDefeated();
            }
            return;
        }
        
        // Select a skill for the monster to use
        const skill = selectMonsterSkill();
        if (!skill) {
            console.warn("Script.js: Monster has no skills to use.");
            // Default to a basic attack
            executeMonsterAttack({
                name: "Basic Attack",
                damageMultiplier: 1.0,
                type: "Normal"
            });
        } else {
            executeMonsterAttack(skill);
        }
        
        // Check if player is defeated
        if (playerData.hp <= 0) {
            // Player defeated
            handlePlayerDefeated();
            return;
        }
        
        // End monster turn and switch back to player
        setTimeout(() => {
            window.isPlayerTurn = true;
            window.combatLock = false;
            
            // Update UI to reflect turn change
            if (typeof updateSkillButtonsAvailability === 'function') {
                updateSkillButtonsAvailability();
            }
            
            // Process status effects for the start of player's turn
            if (typeof processTurnStatusEffects === 'function') {
                processTurnStatusEffects(false); // False means we're starting the player's turn
            }
            
            // Log turn change
            if (typeof addLogMessage === 'function') {
                addLogMessage("Your turn!", "turn-change");
            }
        }, 1000); // 1 second delay before player's turn
        
    } catch (error) {
        console.error("Script.js: Error during monster turn:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing monster turn: " + error.message, error);
        }
        // Emergency recovery
        window.isPlayerTurn = true;
        window.combatLock = false;
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
    }
}

/**
 * Selects a skill for the monster to use.
 * @returns {Object} - The selected skill.
 */
function selectMonsterSkill() {
    try {
        if (!currentMonster || !currentMonster.skills || currentMonster.skills.length === 0) {
            return null;
        }
        
        // Create a weighted probability table based on skill chances
        const skillPool = [];
        currentMonster.skills.forEach(skill => {
            const chance = skill.chance || 0.5; // Default to 50% chance if not specified
            const entries = Math.floor(chance * 100); // Convert to number of entries (1-100)
            for (let i = 0; i < entries; i++) {
                skillPool.push(skill);
            }
        });
        
        // Select a random skill from the weighted pool
        if (skillPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * skillPool.length);
            return skillPool[randomIndex];
        }
        
        // Fallback to first skill
        return currentMonster.skills[0];
    } catch (error) {
        console.error("Script.js: Error selecting monster skill:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error selecting monster action: " + error.message, error);
        }
        // Return a basic attack as fallback
        return { name: "Desperate Attack", damageMultiplier: 0.8, type: "Normal" };
    }
}

/**
 * Executes a monster's attack or skill.
 * @param {Object} skill - The skill to execute.
 */
function executeMonsterAttack(skill) {
    try {
        if (!skill) {
            console.warn("Script.js: No skill provided for monster attack.");
            return;
        }
        
        // Log the monster's action
        if (typeof addLogMessage === 'function') {
            addLogMessage(`${currentMonster.name} uses ${skill.name}!`, "monster-action");
        }
        
        // Check if it's a non-damaging effect (buff/debuff)
        if (skill.effect) {
            executeMonsterEffect(skill);
            return;
        }
        
        // Check if it's a damage skill
        if (typeof skill.damageMultiplier !== 'undefined') {
            // Calculate base damage
            let damage = Math.round(currentMonster.attackPower * skill.damageMultiplier);
            
            // Apply type effectiveness
            if (skill.type && skill.type !== "Normal") {
                let typeMultiplier = 1.0;
                
                // Check elemental effectiveness
                if (ELEMENTAL_TYPES[skill.type] && playerData.rune) {
                    if (ELEMENTAL_TYPES[skill.type].strong.includes(playerData.rune)) {
                        typeMultiplier = 1.5;
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${skill.type} is super effective against ${playerData.rune}!`, "effectiveness");
                        }
                    } else if (ELEMENTAL_TYPES[skill.type].weak.includes(playerData.rune)) {
                        typeMultiplier = 0.5;
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${skill.type} is not very effective against ${playerData.rune}...`, "effectiveness");
                        }
                    }
                }
                
                damage = Math.round(damage * typeMultiplier);
            }
            
            // Apply player defense reduction
            damage = Math.max(1, damage - playerData.defense);
            
            // Deal damage to player
            damagePlayer(damage, skill.type);
            
            // Apply additional effects if any
            if (skill.effect) {
                executeMonsterEffect(skill);
            }
        }
    } catch (error) {
        console.error("Script.js: Error executing monster attack:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing monster attack: " + error.message, error);
        }
    }
}

/**
 * Executes a monster skill effect (buff/debuff).
 * @param {Object} skill - The skill with the effect.
 */
function executeMonsterEffect(skill) {
    try {
        if (!skill || !skill.effect) {
            return;
        }
        
        switch (skill.effect) {
            case "attack_up":
                // Boost monster's attack
                const attackBoost = Math.ceil(currentMonster.attackPower * 0.2); // 20% boost
                currentMonster.attackPower += attackBoost;
                if (!currentMonster.statusEffects) currentMonster.statusEffects = [];
                currentMonster.statusEffects.push({
                    type: "attack_up",
                    value: attackBoost,
                    duration: 3, // 3 turns
                    description: `${skill.name} effect`,
                    isBuff: true
                });
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${currentMonster.name}'s attack increased!`, "buff");
                }
                break;
                
            case "defense_up":
                // Boost monster's defense
                const defenseBoost = Math.ceil(currentMonster.defense * 0.3); // 30% boost
                currentMonster.defense += defenseBoost;
                if (!currentMonster.statusEffects) currentMonster.statusEffects = [];
                currentMonster.statusEffects.push({
                    type: "defense_up",
                    value: defenseBoost,
                    duration: 3, // 3 turns
                    description: `${skill.name} effect`,
                    isBuff: true
                });
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${currentMonster.name}'s defense increased!`, "buff");
                }
                break;
                
            case "defense_down":
                // Reduce player defense
                const defenseReduction = Math.ceil(playerData.defense * 0.2); // 20% reduction
                playerData.defense = Math.max(1, playerData.defense - defenseReduction);
                playerData.statusEffects.push({
                    type: "defense_down",
                    value: -defenseReduction,
                    duration: 2, // 2 turns
                    description: `${skill.name} effect`,
                    isBuff: false
                });
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`Your defense was reduced!`, "debuff");
                }
                if (typeof updatePlayerStatsUI === 'function') {
                    updatePlayerStatsUI();
                }
                break;
                
            case "poison_dot":
                // Apply poison damage over time
                const poisonDamage = Math.ceil(playerData.maxHp * 0.05); // 5% max HP
                playerData.statusEffects.push({
                    type: "poison_dot",
                    value: poisonDamage,
                    duration: skill.duration || 3, // Default 3 turns
                    description: `${skill.name} poison`,
                    isBuff: false
                });
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`You've been poisoned!`, "debuff");
                }
                if (typeof updatePlayerStatusEffectsUI === 'function') {
                    updatePlayerStatusEffectsUI();
                }
                break;
                
            case "accuracy_down":
                // Reduce player accuracy (chance to miss)
                playerData.statusEffects.push({
                    type: "accuracy_down",
                    value: 0.25, // 25% chance to miss
                    duration: 2, // 2 turns
                    description: `${skill.name} effect`,
                    isBuff: false
                });
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`Your accuracy was reduced!`, "debuff");
                }
                if (typeof updatePlayerStatusEffectsUI === 'function') {
                    updatePlayerStatusEffectsUI();
                }
                break;
                
            case "hp_drain":
                // Steal HP from player
                const drainAmount = Math.ceil(playerData.maxHp * 0.1); // 10% max HP
                damagePlayer(drainAmount, "Dark");
                currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + drainAmount);
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`${currentMonster.name} drains ${drainAmount} HP from you!`, "debuff");
                }
                if (typeof updateMonsterStatsUI === 'function') {
                    updateMonsterStatsUI();
                }
                break;
                
            default:
                console.warn(`Script.js: Unknown monster effect "${skill.effect}".`);
                break;
        }
        
        // Update status effect displays
        if (typeof updateMonsterStatusEffectsUI === 'function') {
            updateMonsterStatusEffectsUI();
        }
        
    } catch (error) {
        console.error("Script.js: Error executing monster effect:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing monster effect: " + error.message, error);
        }
    }
}

/**
 * Applies damage to the player.
 * @param {number} amount - The amount of damage to deal.
 * @param {string} damageType - The elemental type of the damage.
 */
function damagePlayer(amount, damageType) {
    try {
        if (!playerData) {
            console.warn("Script.js: No player data for damage.");
            return;
        }
        
        // Ensure amount is a valid number
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error(`Script.js: Invalid player damage amount: ${amount}`);
            amount = 1; // Fallback to minimal damage
        }
        
        // Apply damage
        const oldHP = playerData.hp;
        playerData.hp = Math.max(0, playerData.hp - amount);
        const actualDamage = oldHP - playerData.hp;
        
        // Log the damage
        if (typeof addLogMessage === 'function') {
            addLogMessage(`${currentMonster.name} dealt ${actualDamage} ${damageType || 'Normal'} damage to you!`, "damage-taken");
        }
        
        // Update player HP display
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        
        // Visual feedback
        if (playerAvatar) {
            playerAvatar.classList.add('damaged');
            setTimeout(() => {
                playerAvatar.classList.remove('damaged');
            }, 300);
        }
        
        console.log(`Script.js: Player damaged for ${actualDamage} ${damageType || 'Normal'} damage.`);
    } catch (error) {
        console.error("Script.js: Error damaging player:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing player damage: " + error.message, error);
        }
    }
}

/**
 * Processes status effects at the start of a turn.
 * @param {boolean} isMonsterTurn - True if starting monster turn, false if starting player turn.
 */
function processTurnStatusEffects(isMonsterTurn) {
    try {
        // Process player status effects
        if (!isMonsterTurn && playerData.statusEffects && playerData.statusEffects.length > 0) {
            const keepEffects = [];
            
            // Process each effect
            playerData.statusEffects.forEach(effect => {
                // Process effect based on type
                switch (effect.type) {
                    case "poison_dot":
                        // Apply poison damage
                        const poisonDamage = effect.value || Math.ceil(playerData.maxHp * 0.05);
                        playerData.hp = Math.max(0, playerData.hp - poisonDamage);
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`You take ${poisonDamage} poison damage!`, "damage-taken");
                        }
                        break;
                        
                    case "defense_down":
                    case "accuracy_down":
                        // These effects don't need processing every turn
                        break;
                        
                    case "defense_up":
                    case "attack_up":
                        // These effects don't need processing every turn
                        break;
                        
                    default:
                        console.warn(`Script.js: Unknown player status effect "${effect.type}".`);
                        break;
                }
                
                // Decrease duration
                effect.duration--;
                
                // Keep effect if duration > 0
                if (effect.duration > 0) {
                    keepEffects.push(effect);
                } else {
                    // Remove effect and revert any stats if needed
                    if (effect.type === "defense_down" && effect.value < 0) {
                        playerData.defense -= effect.value; // Restore defense (double negative)
                    } else if (effect.type === "attack_up" && effect.value > 0) {
                        playerData.attackPower -= effect.value; // Remove attack boost
                    } else if (effect.type === "defense_up" && effect.value > 0) {
                        playerData.defense -= effect.value; // Remove defense boost
                    }
                    
                    if (typeof addLogMessage === 'function') {
                        addLogMessage(`${effect.type.replace(/_/g, ' ')} effect expired.`, "info");
                    }
                }
            });
            
            // Update player status effects
            playerData.statusEffects = keepEffects;
            
            // Update UI
            if (typeof updatePlayerStatsUI === 'function') {
                updatePlayerStatsUI();
            }
            if (typeof updatePlayerStatusEffectsUI === 'function') {
                updatePlayerStatusEffectsUI();
            }
            
            // Check if player died from status effects
            if (playerData.hp <= 0) {
                handlePlayerDefeated();
                return; // Don't continue processing
            }
        }
        
        // Process monster status effects
        if (isMonsterTurn && currentMonster && currentMonster.statusEffects && currentMonster.statusEffects.length > 0) {
            const keepEffects = [];
            
            // Process each effect
            currentMonster.statusEffects.forEach(effect => {
                // Process effect based on type
                switch (effect.type) {
                    case "poison_dot":
                        // Apply poison damage
                        const poisonDamage = effect.value || Math.ceil(currentMonster.maxHp * 0.05);
                        currentMonster.hp = Math.max(0, currentMonster.hp - poisonDamage);
                        if (typeof addLogMessage === 'function') {
                            addLogMessage(`${currentMonster.name} takes ${poisonDamage} poison damage!`, "damage");
                        }
                        break;
                        
                    default:
                        // Other effects don't need processing every turn
                        break;
                }
                
                // Decrease duration
                effect.duration--;
                
                // Keep effect if duration > 0
                if (effect.duration > 0) {
                    keepEffects.push(effect);
                } else {
                    // Remove effect and revert any stats if needed
                    if (effect.type === "defense_down" && effect.value < 0) {
                        currentMonster.defense -= effect.value; // Restore defense (double negative)
                    } else if (effect.type === "attack_up" && effect.value > 0) {
                        currentMonster.attackPower -= effect.value; // Remove attack boost
                    } else if (effect.type === "defense_up" && effect.value > 0) {
                        currentMonster.defense -= effect.value; // Remove defense boost
                    }
                    
                    if (typeof addLogMessage === 'function') {
                        addLogMessage(`${currentMonster.name}'s ${effect.type.replace(/_/g, ' ')} effect expired.`, "info");
                    }
                }
            });
            
            // Update monster status effects
            currentMonster.statusEffects = keepEffects;
            
            // Update UI
            if (typeof updateMonsterStatsUI === 'function') {
                updateMonsterStatsUI();
            }
            if (typeof updateMonsterStatusEffectsUI === 'function') {
                updateMonsterStatusEffectsUI();
            }
            
            // Check if monster died from status effects
            if (currentMonster.hp <= 0) {
                if (typeof handleMonsterDefeated === 'function') {
                    handleMonsterDefeated();
                }
                return; // Don't continue processing
            }
        }
    } catch (error) {
        console.error("Script.js: Error processing status effects:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing status effects: " + error.message, error);
        }
    }
}

/**
 * Handles player defeat.
 */
function handlePlayerDefeated() {
    try {
        // Check for revival stone
        if (playerData.hasRevivalStone) {
            // Use revival stone to restore player
            playerData.hasRevivalStone = false;
            playerData.hp = Math.floor(playerData.maxHp * 0.5); // Restore 50% HP
            playerData.mana = Math.floor(playerData.maxMana * 0.3); // Restore 30% MP
            
            if (typeof addLogMessage === 'function') {
                addLogMessage("Revival Stone activates! You've been given another chance!", "event-critical");
            }
            
            // Return to player's turn
            window.isPlayerTurn = true;
            window.combatLock = false;
            
            // Update UI
            if (typeof updatePlayerStatsUI === 'function') {
                updatePlayerStatsUI();
            }
            if (typeof updateSkillButtonsAvailability === 'function') {
                updateSkillButtonsAvailability();
            }
            
            return;
        }
        
        // Player is defeated
        window.gameOver = true;
        window.combatLock = true;
        window.isPlayerTurn = false;
        
        // Log defeat
        if (typeof addLogMessage === 'function') {
            addLogMessage("You have been defeated!", "event-critical");
            addLogMessage("Game Over - Refresh to start a new game.", "info");
        }
        
        // Update UI
        if (monsterSprite && monsterSprites && monsterSprites.GameOver) {
            monsterSprite.src = monsterSprites.GameOver;
            monsterSprite.alt = "Game Over";
        }
        
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        if (typeof updateMonsterStatsUI === 'function') {
            updateMonsterStatsUI();
        }
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
        
        console.log("Script.js: Player defeated. Game over.");
    } catch (error) {
        console.error("Script.js: Error handling player defeat:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error processing defeat: " + error.message, error);
        }
    }
}

/**
 * Adds a message to the game log.
 * @param {string} message - The message to add.
 * @param {string} type - The type of message (success, error, info, etc).
 */
function addLogMessage(message, type = "info") {
    try {
        if (!gameLog) {
            console.warn("Script.js: gameLog element not found.");
            return;
        }
        
        // Create a new log message element
        const logLine = document.createElement('div');
        logLine.className = `log-message ${type}`;
        logLine.textContent = message;
        
        // Add to log
        gameLog.appendChild(logLine);
        
        // Scroll to bottom
        gameLog.scrollTop = gameLog.scrollHeight;
        
        // Remove old messages if too many
        while (gameLog.children.length > 50) {
            gameLog.removeChild(gameLog.firstChild);
        }
    } catch (error) {
        console.error("Script.js: Error adding log message:", error.message, error.stack);
        // Don't use showError here as it might cause an infinite loop if showError uses addLogMessage
        console.error(`Failed to add log message: ${message}`);
    }
}

/**
 * Opens the shop modal.
 */
function openShop() {
    try {
        if (!shopModal) {
            console.error("Script.js: shopModal element not found.");
            if (typeof showError === 'function') {
                showError("Cannot open shop: UI element missing.");
            }
            return;
        }
        
        // Update player gold display in shop
        if (typeof updateShopPlayerGold === 'function') {
            updateShopPlayerGold();
        }
        
        // Populate shop items
        if (typeof populateShopItems === 'function') {
            populateShopItems();
        } else {
            console.error("Script.js: populateShopItems function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot load shop items: Function missing.");
            }
        }
        
        // Show the modal
        shopModal.style.display = 'block';
    } catch (error) {
        console.error("Script.js: Error opening shop:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error opening shop: " + error.message, error);
        }
    }
}

/**
 * Populates the shop with items.
 * @param {string} category - Optional category to filter items.
 */
function populateShopItems(category = 'all') {
    try {
        if (!shopItemsContainer) {
            console.error("Script.js: shopItemsContainer element not found.");
            return;
        }
        
        // Clear existing items
        shopItemsContainer.innerHTML = '';
        
        // Get items for current area
        const shopInventory = getShopInventoryForCurrentArea();
        
        // Filter items by category
        let filteredItems = shopInventory;
        if (category !== 'all') {
            filteredItems = shopInventory.filter(item => item.type === category);
        }
        
        // Create item elements
        filteredItems.forEach(item => {
            // Create the item element
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            itemDiv.dataset.itemId = item.id;
            
            // Item icon
            const iconSpan = document.createElement('span');
            iconSpan.className = 'shop-item-icon';
            iconSpan.textContent = item.icon || '?';
            
            // Item details
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'shop-item-details';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'shop-item-name';
            nameSpan.textContent = item.name;
            
            const descSpan = document.createElement('span');
            descSpan.className = 'shop-item-description';
            descSpan.textContent = item.description;
            
            detailsDiv.appendChild(nameSpan);
            detailsDiv.appendChild(descSpan);
            
            // Item price
            const priceDiv = document.createElement('div');
            priceDiv.className = 'shop-item-price';
            priceDiv.textContent = `${item.cost} gold`;
            
            // Buy button
            const buyButton = document.createElement('button');
            buyButton.className = 'shop-buy-button';
            buyButton.textContent = 'Buy';
            buyButton.disabled = playerData.gold < item.cost;
            
            // Add click handler to buy button
            buyButton.addEventListener('click', function() {
                buyItem(item.id);
            });
            
            // Assemble the item element
            itemDiv.appendChild(iconSpan);
            itemDiv.appendChild(detailsDiv);
            itemDiv.appendChild(priceDiv);
            itemDiv.appendChild(buyButton);
            
            // Add to container
            shopItemsContainer.appendChild(itemDiv);
        });
        
        console.log(`Script.js: Shop populated with ${filteredItems.length} items.`);
    } catch (error) {
        console.error("Script.js: Error populating shop items:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error loading shop items: " + error.message, error);
        }
    }
}

/**
 * Gets the shop inventory for the current area.
 * @returns {Array} - Array of items available in the current area.
 */
function getShopInventoryForCurrentArea() {
    try {
        // Default to town shop if not in a specific area
        const area = GAME_AREAS[currentArea] || GAME_AREAS.town;
        
        // Get shop types for the area
        const areaShops = area.shops || [];
        
        // If no shops in area, return an empty array
        if (areaShops.length === 0) {
            return [];
        }
        
        // Collect all items from area shops
        let inventoryIds = [];
        areaShops.forEach(shopType => {
            const shop = SHOP_TYPES[shopType];
            if (shop && shop.inventory) {
                inventoryIds = inventoryIds.concat(shop.inventory);
            }
        });
        
        // Remove duplicates
        inventoryIds = [...new Set(inventoryIds)];
        
        // Get item objects for each ID
        const inventory = inventoryIds.map(id => {
            return shopItems.find(item => item.id === id);
        }).filter(item => item !== undefined);
        
        return inventory;
    } catch (error) {
        console.error("Script.js: Error getting shop inventory:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error loading shop inventory: " + error.message, error);
        }
        return [];
    }
}

/**
 * Filters shop items by category.
 * @param {string} category - The category to filter by.
 */
function filterShopItems(category) {
    try {
        if (typeof populateShopItems === 'function') {
            populateShopItems(category);
        } else {
            console.error("Script.js: populateShopItems function is missing.");
        }
    } catch (error) {
        console.error("Script.js: Error filtering shop items:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error filtering shop: " + error.message, error);
        }
    }
}

/**
 * Buys an item from the shop.
 * @param {string} itemId - The ID of the item to buy.
 */
function buyItem(itemId) {
    try {
        // Find the item
        const item = shopItems.find(i => i.id === itemId);
        if (!item) {
            console.error(`Script.js: Item with ID ${itemId} not found.`);
            if (typeof addLogMessage === 'function') {
                addLogMessage("Item not found.", "error");
            }
            return;
        }
        
        // Check if player has enough gold
        if (playerData.gold < item.cost) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("Not enough gold!", "warning");
            }
            return;
        }
        
        // Pay for the item
        playerData.gold -= item.cost;
        
        // Add to inventory or use immediately depending on item type
        if (item.type === 'consumable') {
            if (typeof addLogMessage === 'function') {
                addLogMessage(`Purchased ${item.name}. Use it now?`, "info");
            }
            
            // Add to inventory
            if (typeof addItemToInventory === 'function') {
                if (addItemToInventory(item)) {
                    if (typeof addLogMessage === 'function') {
                        addLogMessage(`${item.name} added to inventory.`, "success");
                    }
                }
            } else {
                console.error("Script.js: addItemToInventory function is missing.");
                if (typeof showError === 'function') {
                    showError("Cannot add item to inventory: Function missing.");
                }
            }
        } else {
            // Equipment or special item
            if (typeof addItemToInventory === 'function') {
                if (addItemToInventory(item)) {
                    if (typeof addLogMessage === 'function') {
                        addLogMessage(`${item.name} added to inventory.`, "success");
                    }
                }
            } else {
                console.error("Script.js: addItemToInventory function is missing.");
                if (typeof showError === 'function') {
                    showError("Cannot add item to inventory: Function missing.");
                }
            }
        }
        
        // Update UI
        if (typeof updateShopPlayerGold === 'function') {
            updateShopPlayerGold();
        }
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        if (typeof populateShopItems === 'function') {
            populateShopItems();
        }
        
        console.log(`Script.js: Purchased ${item.name} for ${item.cost} gold.`);
    } catch (error) {
        console.error("Script.js: Error buying item:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error purchasing item: " + error.message, error);
        }
    }
}

/**
 * Opens the inventory modal.
 */
function openInventory() {
    try {
        if (!inventoryModal) {
            console.error("Script.js: inventoryModal element not found.");
            if (typeof showError === 'function') {
                showError("Cannot open inventory: UI element missing.");
            }
            return;
        }
        
        // Populate inventory
        if (typeof populateInventory === 'function') {
            populateInventory();
        } else {
            console.error("Script.js: populateInventory function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot load inventory: Function missing.");
            }
        }
        
        // Show the modal
        inventoryModal.style.display = 'block';
    } catch (error) {
        console.error("Script.js: Error opening inventory:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error opening inventory: " + error.message, error);
        }
    }
}

/**
 * Populates the inventory with items.
 */
function populateInventory() {
    try {
        if (!inventoryItemsContainer || !equipmentSlotsContainer) {
            console.error("Script.js: Inventory UI elements not found.");
            return;
        }
        
        // Clear existing items
        inventoryItemsContainer.innerHTML = '';
        equipmentSlotsContainer.innerHTML = '';
        
        // Create equipment slots
        const equipmentSlots = [
            { id: 'weapon', name: 'Weapon', icon: '🗡️' },
            { id: 'shield', name: 'Shield', icon: '🛡️' },
            { id: 'armor', name: 'Armor', icon: '👕' },
            { id: 'accessory', name: 'Accessory', icon: '💍' }
        ];
        
        equipmentSlots.forEach(slot => {
            // Create slot element
            const slotDiv = document.createElement('div');
            slotDiv.className = 'equipment-slot';
            slotDiv.dataset.slotId = slot.id;
            
            // Slot label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'slot-label';
            labelDiv.textContent = `${slot.icon} ${slot.name}:`;
            
            // Slot content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'slot-content';
            
            const equippedItem = playerData.equipment[slot.id];
            if (equippedItem) {
                // Item icon
                const iconSpan = document.createElement('span');
                iconSpan.className = 'item-icon';
                iconSpan.textContent = equippedItem.icon || '?';
                
                // Item name
                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = equippedItem.name;
                
                // Unequip button
                const unequipButton = document.createElement('button');
                unequipButton.className = 'unequip-button';
                unequipButton.textContent = 'Unequip';
                unequipButton.addEventListener('click', function() {
                    unequipItem(slot.id);
                });
                
                contentDiv.appendChild(iconSpan);
                contentDiv.appendChild(nameSpan);
                contentDiv.appendChild(unequipButton);
            } else {
                contentDiv.textContent = 'Nothing equipped';
            }
            
            slotDiv.appendChild(labelDiv);
            slotDiv.appendChild(contentDiv);
            
            // Add to container
            equipmentSlotsContainer.appendChild(slotDiv);
        });
        
        // Add inventory items
        if (playerData.inventory && playerData.inventory.length > 0) {
            playerData.inventory.forEach(item => {
                // Create item element
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.dataset.itemId = item.id;
                itemDiv.dataset.inventoryId = item.inventoryId;
                
                // Item icon
                const iconSpan = document.createElement('span');
                iconSpan.className = 'item-icon';
                iconSpan.textContent = item.icon || '?';
                
                // Item details
                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'item-details';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.textContent = item.name;
                
                const descSpan = document.createElement('span');
                descSpan.className = 'item-description';
                descSpan.textContent = item.description;
                
                detailsDiv.appendChild(nameSpan);
                detailsDiv.appendChild(descSpan);
                
                // Action buttons
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'item-actions';
                
                if (item.type === 'consumable') {
                    // Use button for consumables
                    const useButton = document.createElement('button');
                    useButton.className = 'use-item-button';
                    useButton.textContent = 'Use';
                    useButton.addEventListener('click', function() {
                        useItem(item.inventoryId);
                    });
                    actionsDiv.appendChild(useButton);
                } else if (['weapon', 'shield', 'armor', 'accessory'].includes(item.type)) {
                    // Equip button for equipment
                    const equipButton = document.createElement('button');
                    equipButton.className = 'equip-item-button';
                    equipButton.textContent = 'Equip';
                    equipButton.addEventListener('click', function() {
                        equipItem(item.inventoryId);
                    });
                    actionsDiv.appendChild(equipButton);
                }
                
                // Assemble the item element
                itemDiv.appendChild(iconSpan);
                itemDiv.appendChild(detailsDiv);
                itemDiv.appendChild(actionsDiv);
                
                // Add to container
                inventoryItemsContainer.appendChild(itemDiv);
            });
        } else {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-inventory';
            emptyDiv.textContent = 'Your inventory is empty.';
            inventoryItemsContainer.appendChild(emptyDiv);
        }
        
        console.log("Script.js: Inventory populated.");
    } catch (error) {
        console.error("Script.js: Error populating inventory:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error loading inventory: " + error.message, error);
        }
    }
}

/**
 * Uses an item from the inventory.
 * @param {string} inventoryId - The inventory ID of the item to use.
 */
function useItem(inventoryId) {
    try {
        if (!playerData.inventory) {
            console.warn("Script.js: No inventory in playerData.");
            return;
        }
        
        // Find the item
        const itemIndex = playerData.inventory.findIndex(item => item.inventoryId === inventoryId);
        if (itemIndex === -1) {
            console.error(`Script.js: Item with inventory ID ${inventoryId} not found.`);
            if (typeof addLogMessage === 'function') {
                addLogMessage("Item not found.", "error");
            }
            return;
        }
        
        const item = playerData.inventory[itemIndex];
        
        // Use the item effect
        if (item.effect && typeof item.effect === 'function') {
            const effectResult = item.effect();
            
            // Remove from inventory if consumed
            if (effectResult === true) {
                playerData.inventory.splice(itemIndex, 1);
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`Used ${item.name}.`, "success");
                }
            }
        } else {
            if (typeof addLogMessage === 'function') {
                addLogMessage(`${item.name} has no effect.`, "warning");
            }
        }
        
        // Update UI
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        if (typeof populateInventory === 'function') {
            populateInventory();
        }
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
        
        console.log(`Script.js: Used item ${item.name}.`);
    } catch (error) {
        console.error("Script.js: Error using item:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error using item: " + error.message, error);
        }
    }
}

/**
 * Equips an item from the inventory.
 * @param {string} inventoryId - The inventory ID of the item to equip.
 */
function equipItem(inventoryId) {
    try {
        if (!playerData.inventory) {
            console.warn("Script.js: No inventory in playerData.");
            return;
        }
        
        // Find the item
        const itemIndex = playerData.inventory.findIndex(item => item.inventoryId === inventoryId);
        if (itemIndex === -1) {
            console.error(`Script.js: Item with inventory ID ${inventoryId} not found.`);
            if (typeof addLogMessage === 'function') {
                addLogMessage("Item not found.", "error");
            }
            return;
        }
        
        const item = playerData.inventory[itemIndex];
        
        // Check if it's equipment
        if (!['weapon', 'shield', 'armor', 'accessory'].includes(item.type)) {
            if (typeof addLogMessage === 'function') {
                addLogMessage(`${item.name} cannot be equipped.`, "warning");
            }
            return;
        }
        
        // Get the equipment slot from item.type or item.slot
        const slot = item.slot || item.type;
        
        // Check for currently equipped item
        const currentEquipped = playerData.equipment[slot];
        if (currentEquipped) {
            // Add current item back to inventory
            addItemToInventory(currentEquipped);
        }
        
        // Remove from inventory
        playerData.inventory.splice(itemIndex, 1);
        
        // Equip the item
        playerData.equipment[slot] = item;
        
        // Recalculate stats with equipment
        if (typeof recalculatePlayerStats === 'function') {
            recalculatePlayerStats();
        }
        
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Equipped ${item.name}.`, "success");
        }
        
        // Update UI
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        if (typeof populateInventory === 'function') {
            populateInventory();
        }
        
        console.log(`Script.js: Equipped ${item.name}.`);
    } catch (error) {
        console.error("Script.js: Error equipping item:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error equipping item: " + error.message, error);
        }
    }
}

/**
 * Unequips an item.
 * @param {string} slot - The equipment slot to unequip.
 */
function unequipItem(slot) {
    try {
        if (!playerData.equipment) {
            console.warn("Script.js: No equipment in playerData.");
            return;
        }
        
        // Check if something is equipped in the slot
        const equippedItem = playerData.equipment[slot];
        if (!equippedItem) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("Nothing to unequip.", "warning");
            }
            return;
        }
        
        // Add to inventory
        if (typeof addItemToInventory === 'function') {
            if (addItemToInventory(equippedItem)) {
                // Remove from equipment
                playerData.equipment[slot] = null;
                
                // Recalculate stats without equipment
                if (typeof recalculatePlayerStats === 'function') {
                    recalculatePlayerStats();
                }
                
                if (typeof addLogMessage === 'function') {
                    addLogMessage(`Unequipped ${equippedItem.name}.`, "success");
                }
                
                // Update UI
                if (typeof updatePlayerStatsUI === 'function') {
                    updatePlayerStatsUI();
                }
                if (typeof populateInventory === 'function') {
                    populateInventory();
                }
            }
        } else {
            console.error("Script.js: addItemToInventory function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot unequip item: Function missing.");
            }
        }
        
        console.log(`Script.js: Unequipped ${equippedItem.name}.`);
    } catch (error) {
        console.error("Script.js: Error unequipping item:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error unequipping item: " + error.message, error);
        }
    }
}

/**
 * Shows the area selection screen.
 */
function showAreaSelection() {
    try {
        if (!areaSelectionScreen) {
            console.error("Script.js: areaSelectionScreen element not found.");
            if (typeof showError === 'function') {
                showError("Cannot show area selection: UI element missing.");
            }
            return;
        }
        
        // Populate area selection
        if (typeof populateAreaSelection === 'function') {
            populateAreaSelection();
        } else {
            console.error("Script.js: populateAreaSelection function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot load areas: Function missing.");
            }
        }
        
        // Show the area selection screen
        if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') {
            window.ScreenManager.activateScreen('area-selection-screen');
        } else if (typeof activateScreen === 'function') {
            activateScreen('area-selection-screen');
        } else {
            console.warn("Script.js: No screen activation function found, using direct styling.");
            if(typeof hideAllScreens === 'function') hideAllScreens();
            areaSelectionScreen.style.display = 'flex';
            areaSelectionScreen.classList.add('active');
            areaSelectionScreen.setAttribute('aria-hidden', 'false');
            areaSelectionScreen.style.opacity = '1';
            areaSelectionScreen.style.visibility = 'visible';
        }
        
        console.log("Script.js: Showed area selection screen.");
    } catch (error) {
        console.error("Script.js: Error showing area selection:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error showing area selection: " + error.message, error);
        }
    }
}

/**
 * Populates the area selection screen with available areas.
 */
function populateAreaSelection() {
    try {
        const areasContainer = document.getElementById('area-selection-container');
        if (!areasContainer) {
            console.error("Script.js: area-selection-container element not found.");
            return;
        }
        
        // Clear existing areas
        areasContainer.innerHTML = '';
        
        // Add areas
        for (const areaKey in GAME_AREAS) {
            const area = GAME_AREAS[areaKey];
            
            // Skip town as it's always accessible via a different button
            if (areaKey === 'town') continue;
            
            // Create area element
            const areaDiv = document.createElement('div');
            areaDiv.className = 'area-option';
            areaDiv.dataset.areaKey = areaKey;
            
            // Area name and description
            const nameHeading = document.createElement('h3');
            nameHeading.className = 'area-name';
            nameHeading.textContent = area.name;
            
            const descPara = document.createElement('p');
            descPara.className = 'area-description';
            descPara.textContent = area.description;
            
            // Recommendation
            const recommendationDiv = document.createElement('div');
            recommendationDiv.className = 'area-recommendation';
            
            let recommendationText = '';
            if (area.recommendedLevel) {
                recommendationText = `Recommended Level: ${area.recommendedLevel}`;
                
                // Add danger indicator if player is under-leveled
                if (playerData.level < area.recommendedLevel) {
                    recommendationText += ' (Danger!)';
                    recommendationDiv.classList.add('danger');
                } else if (playerData.level > area.recommendedLevel + 2) {
                    recommendationText += ' (Easy)';
                    recommendationDiv.classList.add('easy');
                }
            }
            recommendationDiv.textContent = recommendationText;
            
            // Dominant element
            const elementDiv = document.createElement('div');
            elementDiv.className = 'area-element';
            if (area.dominantElement) {
                const element = ELEMENTAL_TYPES[area.dominantElement];
                if (element) {
                    elementDiv.textContent = `Dominant Element: ${area.dominantElement} ${element.icon}`;
                    elementDiv.style.color = element.color;
                    
                    // Check if player's rune is strong against this element
                    if (playerData.rune && ELEMENTAL_TYPES[playerData.rune] && 
                        ELEMENTAL_TYPES[playerData.rune].strong.includes(area.dominantElement)) {
                        const advantageSpan = document.createElement('span');
                        advantageSpan.className = 'element-advantage';
                        advantageSpan.textContent = ' (Advantage!)';
                        elementDiv.appendChild(advantageSpan);
                    }
                    // Check if player's rune is weak against this element
                    else if (playerData.rune && ELEMENTAL_TYPES[playerData.rune] && 
                             ELEMENTAL_TYPES[playerData.rune].weak.includes(area.dominantElement)) {
                        const disadvantageSpan = document.createElement('span');
                        disadvantageSpan.className = 'element-disadvantage';
                        disadvantageSpan.textContent = ' (Disadvantage!)';
                        elementDiv.appendChild(disadvantageSpan);
                    }
                }
            }
            
            // Enter button
            const enterButton = document.createElement('button');
            enterButton.className = 'enter-area-button';
            enterButton.textContent = 'Enter Area';
            enterButton.dataset.areaKey = areaKey;
            
            // Add click handler
            enterButton.addEventListener('click', function() {
                enterArea(areaKey);
            });
            
            // Assemble area element
            areaDiv.appendChild(nameHeading);
            areaDiv.appendChild(descPara);
            areaDiv.appendChild(recommendationDiv);
            areaDiv.appendChild(elementDiv);
            areaDiv.appendChild(enterButton);
            
            // Add background image if provided
            if (area.backgroundImage) {
                areaDiv.style.backgroundImage = `url(${area.backgroundImage})`;
                areaDiv.style.backgroundSize = 'cover';
                areaDiv.style.backgroundPosition = 'center';
                areaDiv.style.color = 'white';
                areaDiv.style.textShadow = '1px 1px 2px black';
            }
            
            // Add to container
            areasContainer.appendChild(areaDiv);
        }
        
        console.log("Script.js: Areas populated in selection screen.");
    } catch (error) {
        console.error("Script.js: Error populating area selection:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error loading areas: " + error.message, error);
        }
    }
}

/**
 * Enters an area to start combat.
 * @param {string} areaKey - The key of the area to enter.
 */
function enterArea(areaKey) {
    try {
        // Check if area exists
        if (!GAME_AREAS[areaKey]) {
            console.error(`Script.js: Area with key ${areaKey} not found.`);
            if (typeof addLogMessage === 'function') {
                addLogMessage("Area not found.", "error");
            }
            return;
        }
        
        const area = GAME_AREAS[areaKey];
        
        // Set current area
        window.currentArea = areaKey;
        
        // Return to game screen
        if (window.ScreenManager && typeof window.ScreenManager.activateScreen === 'function') {
            window.ScreenManager.activateScreen('game-screen');
        } else if (typeof activateScreen === 'function') {
            activateScreen('game-screen');
        } else {
            console.warn("Script.js: No screen activation function found, using direct styling.");
            if(typeof hideAllScreens === 'function') hideAllScreens();
            gameScreen.style.display = 'flex';
            gameScreen.classList.add('active');
            gameScreen.setAttribute('aria-hidden', 'false');
            gameScreen.style.opacity = '1';
            gameScreen.style.visibility = 'visible';
        }
        
        // Log area entry
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Entering ${area.name}...`, "event");
            
            // Add warning if under-leveled
            if (area.recommendedLevel && playerData.level < area.recommendedLevel) {
                addLogMessage(`Warning: This area is recommended for level ${area.recommendedLevel}+`, "warning");
            }
            
            // Add element advantage/disadvantage message
            if (area.dominantElement && playerData.rune) {
                if (ELEMENTAL_TYPES[playerData.rune] && 
                    ELEMENTAL_TYPES[playerData.rune].strong.includes(area.dominantElement)) {
                    addLogMessage(`Your ${playerData.rune} rune is strong against the ${area.dominantElement} creatures here!`, "success");
                }
                else if (ELEMENTAL_TYPES[playerData.rune] && 
                         ELEMENTAL_TYPES[playerData.rune].weak.includes(area.dominantElement)) {
                    addLogMessage(`Your ${playerData.rune} rune is weak against the ${area.dominantElement} creatures here!`, "warning");
                }
            }
        }
        
        // Spawn a monster for combat
        if (typeof spawnNewMonster === 'function') {
            spawnNewMonster();
        } else {
            console.error("Script.js: spawnNewMonster function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot start combat: Function missing.");
            }
        }
        
        console.log(`Script.js: Entered area: ${area.name}`);
    } catch (error) {
        console.error("Script.js: Error entering area:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error entering area: " + error.message, error);
        }
    }
}

/**
 * Enters the town area.
 * @param {Object} townArea - The town area object.
 */
function enterTown(townArea) {
    try {
        if (!townArea) {
            console.error("Script.js: Town area object not provided.");
            return;
        }
        
        // Set current area to town
        window.currentArea = 'town';
        
        // Clear current monster
        window.currentMonster = null;
        
        // Update UI
        if (typeof updateMonsterStatsUI === 'function') {
            updateMonsterStatsUI();
        }
        if (typeof updateSkillButtonsAvailability === 'function') {
            updateSkillButtonsAvailability();
        }
        
        // Log town entry
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Entered ${townArea.name}. You are safe here.`, "event");
            addLogMessage("You can shop, swap runes, or leave town.", "info");
        }
        
        console.log(`Script.js: Entered town: ${townArea.name}`);
    } catch (error) {
        console.error("Script.js: Error entering town:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error entering town: " + error.message, error);
        }
    }
}

/**
 * Opens the rune swap modal.
 */
function openRuneSwapModal() {
    try {
        if (!runeSwapModal) {
            console.error("Script.js: runeSwapModal element not found.");
            if (typeof showError === 'function') {
                showError("Cannot open rune swap: UI element missing.");
            }
            return;
        }
        
        // Check if player has multiple runes
        if (!playerData.unlockedRunes || playerData.unlockedRunes.length <= 1) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("You have not unlocked any additional runes yet.", "warning");
            }
            return;
        }
        
        // Populate rune swap modal
        if (typeof populateRuneSwapModal === 'function') {
            populateRuneSwapModal();
        } else {
            console.error("Script.js: populateRuneSwapModal function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot load runes: Function missing.");
            }
        }
        
        // Show the modal
        runeSwapModal.style.display = 'block';
    } catch (error) {
        console.error("Script.js: Error opening rune swap modal:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error opening rune swap: " + error.message, error);
        }
    }
}

/**
 * Populates the rune swap modal with unlocked runes.
 */
function populateRuneSwapModal() {
    try {
        if (!currentActiveRuneDisplay || !unlockedRunesContainer) {
            console.error("Script.js: Rune swap UI elements not found.");
            return;
        }
        
        // Display current rune
        currentActiveRuneDisplay.innerHTML = '';
        
        if (playerData.rune && runeIcons[playerData.rune]) {
            const currentRuneImg = document.createElement('img');
            currentRuneImg.src = runeIcons[playerData.rune];
            currentRuneImg.alt = playerData.rune + ' Rune';
            currentRuneImg.className = 'current-rune-icon';
            
            const currentRuneName = document.createElement('div');
            currentRuneName.className = 'current-rune-name';
            currentRuneName.textContent = `Current: ${playerData.rune} Rune`;
            
            currentActiveRuneDisplay.appendChild(currentRuneImg);
            currentActiveRuneDisplay.appendChild(currentRuneName);
        } else {
            currentActiveRuneDisplay.textContent = 'No rune equipped';
        }
        
        // Display unlocked runes
        unlockedRunesContainer.innerHTML = '';
        
        if (playerData.unlockedRunes && playerData.unlockedRunes.length > 0) {
            playerData.unlockedRunes.forEach(rune => {
                // Skip current rune
                if (rune === playerData.rune) return;
                
                // Create rune element
                const runeDiv = document.createElement('div');
                runeDiv.className = 'unlocked-rune';
                runeDiv.dataset.rune = rune;
                
                // Rune icon
                if (runeIcons[rune]) {
                    const runeImg = document.createElement('img');
                    runeImg.src = runeIcons[rune];
                    runeImg.alt = rune + ' Rune';
                    runeImg.className = 'rune-icon';
                    runeDiv.appendChild(runeImg);
                }
                
                // Rune name
                const runeName = document.createElement('div');
                runeName.className = 'rune-name';
                runeName.textContent = rune + ' Rune';
                runeDiv.appendChild(runeName);
                
                // Switch button
                const switchButton = document.createElement('button');
                switchButton.className = 'switch-rune-button';
                switchButton.textContent = 'Switch';
                switchButton.addEventListener('click', function() {
                    switchRune(rune);
                });
                runeDiv.appendChild(switchButton);
                
                // Add to container
                unlockedRunesContainer.appendChild(runeDiv);
            });
        } else {
            unlockedRunesContainer.textContent = 'No additional runes unlocked.';
        }
        
        console.log("Script.js: Rune swap modal populated.");
    } catch (error) {
        console.error("Script.js: Error populating rune swap modal:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error loading runes: " + error.message, error);
        }
    }
}

/**
 * Switches the player's active rune.
 * @param {string} newRune - The new rune to switch to.
 */
function switchRune(newRune) {
    try {
        // Validate rune
        if (!newRune || !playerData.unlockedRunes.includes(newRune)) {
            if (typeof addLogMessage === 'function') {
                addLogMessage("Invalid rune selection.", "error");
            }
            return;
        }
        
        // Check if we're in town
        if (currentArea !== 'town') {
            if (typeof addLogMessage === 'function') {
                addLogMessage("You can only switch runes in town!", "warning");
            }
            return;
        }
        
        // Save old rune for logging
        const oldRune = playerData.rune;
        
        // Update rune
        playerData.rune = newRune;
        
        // Update avatar
        if (heroAvatars[newRune]) {
            playerData.avatar = heroAvatars[newRune];
        } else if (heroAvatars.Default) {
            playerData.avatar = heroAvatars.Default;
        }
        
        // Update skills
        if (typeof definePlayerSkills === 'function') {
            definePlayerSkills(newRune);
        } else {
            console.error("Script.js: definePlayerSkills function is missing.");
            if (typeof showError === 'function') {
                showError("Cannot update skills: Function missing.");
            }
        }
        
        // Close the modal
        if (runeSwapModal) {
            runeSwapModal.style.display = 'none';
        }
        
        // Log the change
        if (typeof addLogMessage === 'function') {
            addLogMessage(`Switched from ${oldRune} Rune to ${newRune} Rune!`, "event-critical");
            addLogMessage("Your skills have been updated.", "info");
        }
        
        // Update UI
        if (typeof updatePlayerStatsUI === 'function') {
            updatePlayerStatsUI();
        }
        if (playerRuneDisplay) {
            playerRuneDisplay.textContent = newRune;
        }
        
        console.log(`Script.js: Switched from ${oldRune} to ${newRune} rune.`);
    } catch (error) {
        console.error("Script.js: Error switching rune:", error.message, error.stack);
        if (typeof showError === 'function') {
            showError("Error switching rune: " + error.message, error);
        }
    }
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 * @param {Error|Object} error - Optional error object with stack trace.
 */
function showError(message, error = null) {
    try {
        console.error("Script.js Error:", message, error);
        
        // Make sure the error display elements exist
        if (!errorLogDisplay || !errorMessageSpan) {
            if (typeof document.getElementById === 'function') {
                errorLogDisplay = document.getElementById('error-log-display');
                errorMessageSpan = document.getElementById('error-message-span');
                errorExpandButton = document.getElementById('error-expand-button');
                errorDetails = document.getElementById('error-details');
                errorStack = document.getElementById('error-stack');
            }
            
            // If still not found, fallback to alert
            if (!errorLogDisplay || !errorMessageSpan) {
                console.warn("Script.js: Error display elements not found, using alert fallback.");
                alert("Error: " + message + (error ? `\nDetails: ${error.message || error}` : ''));
                return;
            }
        }
        
        // Display the error message
        errorMessageSpan.textContent = message;
        
        // Handle stack trace if provided
        if (error && errorStack) {
            let stackText = '';
            
            if (typeof error === 'string') {
                stackText = error;
            } else if (error instanceof Error) {
                stackText = error.stack || error.toString();
            } else if (error.message) {
                stackText = error.message;
                if (error.stack) stackText += '\n\n' + error.stack;
            } else {
                try {
                    stackText = JSON.stringify(error, null, 2);
                } catch (e) {
                    stackText = "Error details could not be stringified.";
                }
            }
            
            errorStack.textContent = stackText;
            
            // Show expand button
            if (errorExpandButton) {
                errorExpandButton.style.display = 'inline-block';
            }
            
            // Hide details by default
            if (errorDetails) {
                errorDetails.style.display = 'none';
            }
        } else {
            // No stack trace, hide expand button and details
            if (errorExpandButton) {
                errorExpandButton.style.display = 'none';
            }
            if (errorDetails) {
                errorDetails.style.display = 'none';
            }
        }
        
        // Show error display
        errorLogDisplay.style.display = 'block';
        
        // Log error to game log if available
        if (typeof addLogMessage === 'function') {
            addLogMessage("An error occurred: " + message, "error");
        }
        
        // Add to error history
        addToErrorHistory(message, error);
    } catch (displayError) {
        // Last resort if showError itself fails
        console.error("CRITICAL: showError function failed:", displayError.message, displayError.stack);
        alert("Critical Error: " + message + "\nAdditional error in error display system.");
    }
}

/**
 * Maintains a history of errors.
 * @type {Array}
 */
window.errorHistory = window.errorHistory || [];

/**
 * Maximum number of errors to keep in history.
 * @type {number}
 */
const ERROR_HISTORY_MAX = 20;

/**
 * Adds an error to the error history.
 * @param {string} message - The error message.
 * @param {Error|Object} error - The error object.
 */
function addToErrorHistory(message, error) {
    try {
        if (!window.errorHistory) {
            window.errorHistory = [];
        }
        
        // Add timestamp to the error
        const timestamp = new Date().toISOString();
        
        // Create error entry
        const errorEntry = {
            timestamp: timestamp,
            message: message,
            details: error ? (error.message || String(error)) : null,
            stack: error && error.stack ? error.stack : null
        };
        
        // Add to history
        window.errorHistory.unshift(errorEntry);
        
        // Limit history size
        if (window.errorHistory.length > ERROR_HISTORY_MAX) {
            window.errorHistory.pop();
        }
        
        console.log(`Script.js: Added error to history. Total errors: ${window.errorHistory.length}`);
    } catch (e) {
        console.error("Script.js: Error adding to error history:", e.message, e.stack);
    }
}

/**
 * Shows the error history modal.
 */
function showErrorHistory() {
    try {
        // Check if we have a history modal
        const errorHistoryModal = document.getElementById('error-history-modal');
        if (!errorHistoryModal) {
            // Create a modal if it doesn't exist
            createErrorHistoryModal();
            return;
        }
        
        // Get the container for error entries
        const errorHistoryContainer = document.getElementById('error-history-container');
        if (!errorHistoryContainer) {
            console.error("Script.js: error-history-container element not found.");
            return;
        }
        
        // Clear existing entries
        errorHistoryContainer.innerHTML = '';
        
        // Add error entries
        if (window.errorHistory && window.errorHistory.length > 0) {
            window.errorHistory.forEach((error, index) => {
                // Create error entry element
                const entryDiv = document.createElement('div');
                entryDiv.className = 'error-history-entry';
                
                // Error timestamp and message
                const headerDiv = document.createElement('div');
                headerDiv.className = 'error-entry-header';
                
                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'error-timestamp';
                
                // Format timestamp to be more readable
                let formattedTime = error.timestamp;
                try {
                    const date = new Date(error.timestamp);
                    formattedTime = date.toLocaleTimeString();
                } catch (e) {
                    // Use original if parsing fails
                }
                
                timestampSpan.textContent = formattedTime;
                
                const messageSpan = document.createElement('span');
                messageSpan.className = 'error-message';
                messageSpan.textContent = error.message;
                
                headerDiv.appendChild(timestampSpan);
                headerDiv.appendChild(messageSpan);
                
                // Toggle button for details
                const toggleButton = document.createElement('button');
                toggleButton.className = 'error-details-toggle';
                toggleButton.textContent = 'Details';
                toggleButton.addEventListener('click', function() {
                    const detailsDiv = this.nextElementSibling;
                    if (detailsDiv) {
                        const isVisible = detailsDiv.style.display === 'block';
                        detailsDiv.style.display = isVisible ? 'none' : 'block';
                        this.textContent = isVisible ? 'Details' : 'Hide';
                    }
                });
                
                // Error details
                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'error-details';
                detailsDiv.style.display = 'none';
                
                if (error.details) {
                    const detailsPara = document.createElement('p');
                    detailsPara.textContent = error.details;
                    detailsDiv.appendChild(detailsPara);
                }
                
                if (error.stack) {
                    const stackPre = document.createElement('pre');
                    stackPre.className = 'error-stack';
                    stackPre.textContent = error.stack;
                    detailsDiv.appendChild(stackPre);
                }
                
                // Assemble the entry
                entryDiv.appendChild(headerDiv);
                entryDiv.appendChild(toggleButton);
                entryDiv.appendChild(detailsDiv);
                
                // Add to container
                errorHistoryContainer.appendChild(entryDiv);
            });
        } else {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-error-history';
            emptyDiv.textContent = 'No errors recorded.';
            errorHistoryContainer.appendChild(emptyDiv);
        }
        
        // Show the modal
        errorHistoryModal.style.display = 'block';
    } catch (error) {
        console.error("Script.js: Error showing error history:", error.message, error.stack);
        alert("Error showing error history: " + error.message);
    }
}

/**
 * Creates the error history modal if it doesn't exist.
 */
function createErrorHistoryModal() {
    try {
        // Check if the modal already exists
        if (document.getElementById('error-history-modal')) {
            // Just show it if it exists
            showErrorHistory();
            return;
        }
        
        // Create the modal
        const modalDiv = document.createElement('div');
        modalDiv.id = 'error-history-modal';
        modalDiv.className = 'modal';
        
        // Modal content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'modal-content';
        
        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'modal-header';
        
        const titleHeading = document.createElement('h2');
        titleHeading.textContent = 'Error History';
        
        const closeButton = document.createElement('span');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            modalDiv.style.display = 'none';
        });
        
        headerDiv.appendChild(titleHeading);
        headerDiv.appendChild(closeButton);
        
        // Container for error entries
        const containerDiv = document.createElement('div');
        containerDiv.id = 'error-history-container';
        containerDiv.className = 'error-history-container';
        
        // Close button
        const closeButtonDiv = document.createElement('div');
        closeButtonDiv.className = 'modal-footer';
        
        const dismissButton = document.createElement('button');
        dismissButton.id = 'close-error-history-button';
        dismissButton.className = 'modal-close-button';
        dismissButton.textContent = 'Dismiss';
        dismissButton.addEventListener('click', function() {
            modalDiv.style.display = 'none';
        });
        
        closeButtonDiv.appendChild(dismissButton);
        
        // Assemble the modal
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(containerDiv);
        contentDiv.appendChild(closeButtonDiv);
        modalDiv.appendChild(contentDiv);
        
        // Add to document
        document.body.appendChild(modalDiv);
        
        // Set up error history button if it exists
        const errorHistoryButton = document.getElementById('error-history-button');
        if (errorHistoryButton) {
            errorHistoryButton.addEventListener('click', showErrorHistory);
        }
        
        // Show the error history
        showErrorHistory();
    } catch (error) {
        console.error("Script.js: Error creating error history modal:", error.message, error.stack);
        alert("Error creating error history modal: " + error.message);
    }
}