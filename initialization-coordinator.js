/**
 * Initialization Coordinator for Runes of Power RPG
 * Manages proper loading sequence of game components
 * Version: 1.2 - Added safety timeouts, enhanced error recovery, better logging
 */

(function() {
    // Wrap the entire coordinator in a try-catch to handle its own potential errors.
    try {
        console.log("Initialization Coordinator (v1.2) starting...");

        // Ensure this script doesn't run its main logic multiple times if re-included accidentally.
        if (window.gameInitRegistry && window.gameInitRegistry.version === "1.2.coordinator") {
            console.warn("Initialization Coordinator (v1.2) already started. Skipping redundant execution.");
            return;
        }

        // Track initialization state with proper dependencies
        const initState = {
            // First, handle error setup so we can properly display errors
            scriptErrorSetup: false, 
            // Then handle game state which other components depend on
            gameState: false,
            // Next handle screen management which is critical for UI
            enhancedScreen: false,
            screenTransitions: false,
            // Then UI components
            runeButtons: false,
            skillButtons: false,
            combatLog: false,
            portraits: false,
            // Last, the auxiliary components
            battleScreen: false,
            recovery: false
        };

        // Define the order of initialization
        const initPriority = [
            'scriptErrorSetup',    // HIGHEST PRIORITY: Sets up visual error reporting
            'gameState',           // Basic game data structures and constants
            'enhancedScreen',      // Enhanced screen management, should come early
            'screenTransitions',   // Older screen transition logic, may be superseded by enhancedScreen
            'runeButtons',         // Rune selection logic
            'skillButtons',        // Skill button setup
            'combatLog',           // Combat log UI and functions
            'portraits',           // Player/Monster portrait UI
            'battleScreen',        // Battle screen specific logic
            'recovery'             // Game recovery mechanisms (like F5 or button)
        ];

        // Keep track of attempted components to prevent infinite loops
        const componentAttempts = {};
        initPriority.forEach(component => {
            componentAttempts[component] = 0;
        });

        // Maximum attempts per component before marking as failed and moving on
        const MAX_ATTEMPTS = 3;

        // Setup global initialization registry
        window.gameInitRegistry = {
            version: "1.2.coordinator",
            
            markInitialized: function(component) {
                try {
                    if (initState.hasOwnProperty(component)) {
                        if (initState[component]) {
                            console.warn(`Initialization Coordinator: Component '${component}' was already marked as initialized.`);
                        } else {
                            console.log(`Initialization Coordinator: Component '${component}' marked as initialized.`);
                            initState[component] = true;
                            
                            // Clear any safety timeout that might be running for this component
                            if (window.currentInitTimeout) {
                                clearTimeout(window.currentInitTimeout);
                                window.currentInitTimeout = null;
                            }
                            
                            // Run the next component in sequence
                            setTimeout(() => this.runNextComponent(), 10);
                        }
                    } else {
                        console.warn(`Initialization Coordinator: Unknown component '${component}' cannot be marked. Add it to initState and initPriority.`);
                    }
                } catch (error) {
                    console.error("Error in markInitialized:", error);
                    // Just in case, try to continue with the next component
                    setTimeout(() => this.runNextComponent(), 50);
                }
            },

            isInitialized: function(component) {
                if (initState.hasOwnProperty(component)) {
                    return initState[component] === true;
                }
                console.warn(`Initialization Coordinator: Checked unknown component '${component}'.`);
                return false;
            },

            allInitialized: function() {
                const allInit = initPriority.every(comp => initState[comp] === true);
                if (allInit) {
                    console.log("Initialization Coordinator: All priority components initialized.");
                }
                return allInit;
            },

            forceMarkAsInitialized: function(component) {
                if (initState.hasOwnProperty(component)) {
                    console.warn(`Initialization Coordinator: FORCING component '${component}' to be marked as initialized due to failures.`);
                    initState[component] = true;
                }
            },

            runNextComponent: function() {
                try {
                    for (const component of initPriority) {
                        if (!initState[component]) {
                            // Check if we've tried this component too many times
                            if (componentAttempts[component] >= MAX_ATTEMPTS) {
                                console.error(`Initialization Coordinator: Component '${component}' failed after ${MAX_ATTEMPTS} attempts. Marking as failed and moving on.`);
                                this.forceMarkAsInitialized(component);
                                // Add a message to the game log if possible
                                if (typeof window.addLogMessage === 'function') {
                                    window.addLogMessage(`Warning: ${component} failed to initialize.`, "warning");
                                }
                                // Continue to the next component
                                continue;
                            }
                            
                            componentAttempts[component]++;
                            console.log(`Initialization Coordinator: Attempting to initialize ${component} (attempt ${componentAttempts[component]} of ${MAX_ATTEMPTS})`);
                            
                            // Set a safety timeout - if component doesn't report back in 5 seconds, retry or skip
                            const safetyTimeout = setTimeout(() => {
                                console.warn(`Component ${component} did not initialize in time`);
                                if (componentAttempts[component] >= MAX_ATTEMPTS) {
                                    this.forceMarkAsInitialized(component);
                                }
                                this.runNextComponent(); // Try again or move to next component
                            }, 5000);
                            
                            // Store the timeout so it can be cleared when component reports success
                            window.currentInitTimeout = safetyTimeout;
                            
                            // Dispatch the initialization event
                            try {
                                const event = new CustomEvent('init-component', { detail: { component } });
                                document.dispatchEvent(event);
                                console.log(`Initialization Coordinator: 'init-component' dispatched for ${component}`);
                            } catch (dispatchError) {
                                console.error(`Error dispatching init event for ${component}:`, dispatchError);
                                // Clear the timeout since we're going to run next component immediately
                                clearTimeout(safetyTimeout);
                                window.currentInitTimeout = null;
                                continue; // Try the next component
                            }
                            
                            return; // Exit after attempting one component
                        }
                    }
                    
                    // If we get here, all components have been processed
                    this.finalizeInitialization();
                } catch (error) {
                    console.error("Error in runNextComponent:", error);
                    // Try to recover by delaying next attempt
                    setTimeout(() => this.runNextComponent(), 500);
                }
            },
            
            finalizeInitialization: function() {
                if (this.allInitialized()) {
                    console.log("Initialization Coordinator: All components initialized successfully!");
                } else {
                    console.warn("Initialization Coordinator: Some components failed to initialize.");
                    // Log which components failed
                    for (const component of initPriority) {
                        if (!initState[component]) {
                            console.error(`Component '${component}' failed to initialize.`);
                        }
                    }
                }
                
                // Dispatch the all-components-initialized event
                try {
                    const allDoneEvent = new CustomEvent('all-components-initialized');
                    document.dispatchEvent(allDoneEvent);
                    console.log("Initialization Coordinator: 'all-components-initialized' event dispatched.");
                } catch (error) {
                    console.error("Error dispatching all-components-initialized event:", error);
                }
                
                // Add a final message to the game log
                if (typeof window.addLogMessage === 'function') {
                    window.addLogMessage("Game initialized.", "info");
                }
                
                // Add a second check for any screen being visible
                setTimeout(() => {
                    try {
                        const anyScreenVisible = Array.from(document.querySelectorAll('.screen')).some(screen => {
                            return screen.classList.contains('active') && 
                                   screen.style.display !== 'none' &&
                                   screen.style.visibility !== 'hidden';
                        });
                        
                        if (!anyScreenVisible) {
                            console.warn("No visible screens after initialization! Attempting emergency restore.");
                            // Try different methods to restore screens
                            if (window.ScreenManager && typeof window.ScreenManager.emergencyRestore === 'function') {
                                window.ScreenManager.emergencyRestore();
                            } else if (typeof window.emergencyRestoreGameScreen === 'function') {
                                window.emergencyRestoreGameScreen();
                            } else {
                                // Last resort
                                const runeScreen = document.getElementById('rune-selection-screen');
                                if (runeScreen) {
                                    runeScreen.style.display = 'flex';
                                    runeScreen.classList.add('active');
                                    runeScreen.style.opacity = '1';
                                    runeScreen.style.visibility = 'visible';
                                    console.log("Manually restored rune selection screen as emergency fallback");
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error in finalization screen check:", error);
                    }
                }, 1000);
            }
        };

        // Start the initialization sequence
        console.log("Initialization Coordinator: Starting initialization sequence");
        setTimeout(() => {
            if (window.gameInitRegistry && typeof window.gameInitRegistry.runNextComponent === 'function') {
                window.gameInitRegistry.runNextComponent();
            } else {
                console.error("Initialization Coordinator: gameInitRegistry was not properly set up on window by the time setTimeout executed.");
                alert("CRITICAL COORDINATOR FAULT: gameInitRegistry missing. Game cannot start.");
            }
        }, 100); 

        console.log("Initialization Coordinator (v1.2) setup complete. Waiting for components...");

    } catch (e) {
        // Last resort catch for errors *within the coordinator itself*
        console.error("FATAL ERROR IN INITIALIZATION COORDINATOR:", e.message, e.stack);
        // Try to display this on the screen if basic error UI is somehow available
        const errorLog = document.getElementById('error-log-display');
        const errorMsgSpan = document.getElementById('error-message-span');
        if (errorLog && errorMsgSpan) {
            errorMsgSpan.textContent = "FATAL COORDINATOR ERROR: " + e.message;
            errorLog.style.display = 'block';
            const errorStackEl = document.getElementById('error-stack');
            if(errorStackEl) errorStackEl.textContent = e.stack || "No stack trace.";
        } else {
            alert("FATAL ERROR IN INITIALIZATION COORDINATOR. Game cannot load. Check console. " + e.message);
        }
        
        // Desperate attempt to display rune selection screen
        try {
            const runeScreen = document.getElementById('rune-selection-screen');
            if (runeScreen) {
                runeScreen.style.display = 'flex';
                runeScreen.classList.add('active');
            }
        } catch (displayError) {
            // Nothing more we can do
        }
    }
})();