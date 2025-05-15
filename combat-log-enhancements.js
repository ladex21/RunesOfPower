/**
 * Combat Log Enhancements
 * This code implements color coding and improvements for the combat log
 */

// Ensure gameLog is defined in the global scope or passed appropriately.
// For now, assuming it's a global variable that will be available.
// let gameLog = document.getElementById('game-log'); // This might be too early.

// Enhanced log message function that applies the proper styling
function enhancedAddLogMessage(message, type = "info") {
    const gameLogElement = document.getElementById('game-log'); // Get gameLog each time
    if (!gameLogElement) {
        console.warn("gameLog element not found in enhancedAddLogMessage");
        // Fallback to console if gameLog is not available
        console.log(`[${type.toUpperCase()}] ${message}`);
        return null;
    }
    
    // Create a div instead of a p tag for better styling control
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    
    // Check if this is an important message type
    const importantTypes = ['success', 'error', 'event-critical', 'level-up'];
    if (importantTypes.includes(type)) {
        logEntry.classList.add('important-message');
    }
    
    // Add to the log
    gameLogElement.appendChild(logEntry);
    
    // Auto-scroll to the bottom
    gameLogElement.scrollTop = gameLogElement.scrollHeight;
    
    // Limit the number of entries to prevent memory/performance issues
    const maxEntries = 50;
    while (gameLogElement.children.length > maxEntries) {
        gameLogElement.removeChild(gameLogElement.firstChild);
    }
    
    // Play a sound effect based on message type if audio is enabled
    if (typeof playSoundForLogType === 'function') {
        playSoundForLogType(type);
    }
    
    return logEntry;
}

// Optional: Play different sound effects for different log message types
function playSoundForLogType(type) {
    // Check if sound effects are enabled
    const soundEnabled = localStorage.getItem('soundEffectsEnabled') === 'true';
    if (!soundEnabled) return;
    
    // Define sound effects for different message types
    const sounds = {
        'success': 'success-sound',
        'error': 'error-sound',
        'event-critical': 'critical-sound',
        'level-up': 'levelup-sound'
    };
    
    // Play the sound if available
    const soundId = sounds[type];
    if (soundId) {
        // This is a placeholder for actual sound implementation
        // You would implement actual audio playing here (e.g., using Tone.js or HTML5 Audio)
        console.log(`Playing sound: ${soundId} (placeholder)`);
    }
}

// Add filter buttons to the combat log
function addLogFilterButtons() {
    const gameLogContainer = document.getElementById('game-log-container');
    if (!gameLogContainer) {
        console.warn("game-log-container not found for filter buttons.");
        return;
    }
    
    // Create filter buttons container if it doesn't exist
    let filterContainer = gameLogContainer.querySelector('.log-filter-buttons');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.className = 'log-filter-buttons';
        
        // Define filter types
        const filterTypes = [
            { id: 'all', label: 'All' },
            { id: 'combat', label: 'Combat' },
            { id: 'rewards', label: 'Rewards' },
            { id: 'events', label: 'Events' }
        ];
        
        // Create filter buttons
        filterTypes.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'log-filter-button action-button'; // Added action-button for consistent styling
            button.dataset.filter = filter.id;
            button.textContent = filter.label;
            
            // Set active state for 'All' by default
            if (filter.id === 'all') {
                button.classList.add('active');
            }
            
            // Add click event
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterContainer.querySelectorAll('.log-filter-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Apply filter
                if (typeof filterLogMessages === 'function') {
                    filterLogMessages(filter.id);
                }
            });
            
            filterContainer.appendChild(button);
        });
        
        // Add filter container to the game log container (e.g., after the log itself)
        const gameLogElement = document.getElementById('game-log');
        if (gameLogElement && gameLogElement.parentNode === gameLogContainer) {
             gameLogContainer.appendChild(filterContainer); // Appends after the log entries div
        } else {
            gameLogContainer.appendChild(filterContainer); // Fallback if structure is different
        }
    }
}

// Filter log messages based on the selected filter
function filterLogMessages(filterId) {
    const gameLogElement = document.getElementById('game-log');
    if (!gameLogElement) return;

    const logEntries = gameLogElement.querySelectorAll('.log-entry');
    
    logEntries.forEach(entry => {
        // Show all entries if 'all' filter is selected
        if (filterId === 'all') {
            entry.style.display = '';
            return;
        }
        
        // Determine entry type based on its classes
        const isCombat = entry.classList.contains('combat-player') || 
                         entry.classList.contains('combat-monster') ||
                         entry.classList.contains('combat-info');
                         
        const isReward = entry.classList.contains('success') && 
                         (entry.textContent.toLowerCase().includes('gold') ||
                          entry.textContent.toLowerCase().includes('exp') ||
                          entry.textContent.toLowerCase().includes('recovered') ||
                          entry.textContent.toLowerCase().includes('gained'));
                         
        const isEvent = entry.classList.contains('event') ||
                        entry.classList.contains('event-critical') ||
                        entry.classList.contains('level-up');
        
        // Apply filter
        switch(filterId) {
            case 'combat':
                entry.style.display = isCombat ? '' : 'none';
                break;
            case 'rewards':
                entry.style.display = isReward ? '' : 'none';
                break;
            case 'events':
                entry.style.display = isEvent ? '' : 'none';
                break;
            default:
                entry.style.display = ''; // Default to show if filterId is unknown
        }
    });
    
    // Auto-scroll to the bottom after filtering
    gameLogElement.scrollTop = gameLogElement.scrollHeight;
}

// Apply enhanced styling to the combat log (potentially for existing entries if needed)
function applyEnhancedLogStyling() {
    const gameLogElement = document.getElementById('game-log');
    if (!gameLogElement) return;
    
    // Add a class to the game log for enhanced styling (if not already present via CSS file)
    // gameLogElement.classList.add('enhanced-log'); // This might be redundant if CSS handles it

    // This function might be used if you were converting old log entries.
    // For new entries, enhancedAddLogMessage handles the styling.
    // If you have plain <p> tags from old code, this could convert them.
    // For now, it's less critical if all new messages use enhancedAddLogMessage.
    console.log("applyEnhancedLogStyling called (currently minimal operation).");
}

// Initialize combat log enhancements
function initializeCombatLogEnhancements() {
    try {
        // Override the original addLogMessage function if it exists in the global scope
        if (typeof window.addLogMessage === 'function') {
            window.addLogMessage = function(message, type = "info") {
                return enhancedAddLogMessage(message, type);
            };
            console.log("Global addLogMessage overridden by enhancedAddLogMessage.");
        } else {
            // If no global addLogMessage exists, make enhancedAddLogMessage the global one.
            window.addLogMessage = enhancedAddLogMessage;
            console.log("enhancedAddLogMessage set as global addLogMessage.");
        }
        
        // Add filter buttons to the log
        addLogFilterButtons();
        
        // Apply enhanced styling to existing log entries
        applyEnhancedLogStyling();
        
        // Add sound toggle button
        addSoundToggleButton();
    } catch (error) {
        console.error("Error initializing combat log enhancements:", error);
    }
}

// Add a toggle button for sound effects
function addSoundToggleButton() {
    const gameLogContainer = document.getElementById('game-log-container');
    if (!gameLogContainer) {
        console.warn("game-log-container not found for sound toggle button.");
        return;
    }
    
    // Create sound toggle button if it doesn't exist
    if (!document.getElementById('sound-toggle-button')) {
        const soundEnabled = localStorage.getItem('soundEffectsEnabled') === 'true';
        
        const toggleButton = document.createElement('button');
        toggleButton.id = 'sound-toggle-button';
        toggleButton.className = 'action-button sound-toggle-btn'; // Use 'action-button' for consistent styling
        toggleButton.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
        // Basic styling, can be enhanced in CSS
        toggleButton.style.position = 'absolute';
        toggleButton.style.right = '5px';
        toggleButton.style.top = '5px'; // Positioned at top-right of game-log-container
        toggleButton.style.fontSize = '0.7em';
        toggleButton.style.padding = '3px 6px';
        toggleButton.style.zIndex = '10'; // Ensure it's above log entries
        
        toggleButton.addEventListener('click', () => {
            const currentSetting = localStorage.getItem('soundEffectsEnabled') === 'true';
            localStorage.setItem('soundEffectsEnabled', (!currentSetting).toString());
            toggleButton.textContent = !currentSetting ? '🔊 Sound On' : '🔇 Sound Off';
            if (typeof window.addLogMessage === 'function') {
                window.addLogMessage(`Sound effects ${!currentSetting ? 'enabled' : 'disabled'}.`, "system");
            }
        });
        
        // Prepend to keep it near the top, or append if preferred at bottom
        gameLogContainer.insertBefore(toggleButton, gameLogContainer.firstChild);
    }
}

// Hook into the initialUISetup function to initialize enhancements
document.addEventListener('DOMContentLoaded', function() {
    console.log("Combat Log Enhancements: DOMContentLoaded event fired.");
    // Fix to prevent conflicts: Use a safer way to get and override initialUISetup
    // Wait until the game is fully initialized before applying combat log enhancements
    let initEnhancementsAttempts = 0;
    const maxAttempts = 20; // Increased attempts
    
    function tryInitEnhancements() {
        console.log(`Combat Log: tryInitEnhancements attempt #${initEnhancementsAttempts + 1}`);
        if (initEnhancementsAttempts >= maxAttempts) {
            console.warn("Failed to initialize combat log enhancements after multiple attempts. Game log element might be missing or script.js is not setting up UI as expected.");
            return;
        }
        
        initEnhancementsAttempts++;
        
        // Check if gameLog exists, which indicates the UI is ready
        // Also check if critical functions from script.js are available, like initialUISetup
        const gameLogElement = document.getElementById('game-log');
        const initialUISetupExists = typeof window.initialUISetup === 'function';

        if (gameLogElement && initialUISetupExists) {
            console.log("Combat Log Enhancements: game-log found and initialUISetup exists. Initializing...");
            initializeCombatLogEnhancements();
            
            // Dynamically load CSS for enhanced combat log if not already linked in HTML
            // This is generally better handled by a <link> tag in HTML, but can be a fallback.
            if (!document.querySelector('link[href="enhanced-combat-log.css"]') && !document.getElementById('enhanced-log-styles-dynamic')) {
                console.log("Dynamically adding enhanced-log-styles.");
                const logStyles = document.createElement('style');
                logStyles.id = 'enhanced-log-styles-dynamic';
                // Basic styles to ensure functionality if CSS file fails to load
                logStyles.textContent = `
/* Dynamically Added Enhanced Log Styles */
.log-entry {
    margin-bottom: 6px;
    padding: 5px 8px;
    border-radius: 4px;
    border-left: 4px solid transparent;
    animation: logEntryFadeIn 0.3s ease-out;
    background-color: rgba(255, 255, 255, 0.03); /* Subtle background for entries */
}
@keyframes logEntryFadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
}
.log-entry.important-message {
    font-weight: bold; /* Make important messages stand out a bit more */
    animation: logEntryPulse 1.5s infinite alternate;
}
@keyframes logEntryPulse {
    from { background-color: rgba(255, 255, 255, 0.03); }
    to { background-color: rgba(255, 255, 255, 0.08); }
}
/* Basic type colors if main CSS fails */
.log-entry.info { border-left-color: #7f8c8d; }
.log-entry.success { border-left-color: #2ecc71; color: #2ecc71; }
.log-entry.warning { border-left-color: #f39c12; color: #f39c12; }
.log-entry.error { border-left-color: #e74c3c; color: #e74c3c; }
.log-entry.event { border-left-color: #3498db; color: #3498db; }
.log-entry.event-critical { border-left-color: #9b59b6; color: #9b59b6; font-weight: bold; }
.log-entry.combat-player { border-left-color: #2980b9; }
.log-entry.combat-monster { border-left-color: #c0392b; }
.log-entry.mana-regen { border-left-color: #1abc9c; color: #1abc9c; }
.log-entry.level-up { border-left-color: #f1c40f; color: #f1c40f; font-weight: bold; }
`;
                document.head.appendChild(logStyles);
            } else {
                console.log("Enhanced log styles already present (linked or dynamically added).");
            }
        } else {
            if (!gameLogElement) console.warn("Combat Log Enhancements: game-log element not found. Retrying...");
            if (!initialUISetupExists) console.warn("Combat Log Enhancements: initialUISetup function not found on window. Retrying...");
            // Try again in a short while
            setTimeout(tryInitEnhancements, 500); // Increased delay slightly
        }
    }
    
    // Start trying to initialize after a short delay to let other scripts run
    setTimeout(tryInitEnhancements, 700); // Increased initial delay
}); // This is the correct closing for the 'DOMContentLoaded' event listener's callback function and the event listener call itself.
