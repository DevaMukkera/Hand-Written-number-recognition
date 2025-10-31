/**
 * Main Application
 * Orchestrates initialization and handles loading/error states
 */

(function() {
    'use strict';

    // State
    let modelLoaded = false;
    let currentAttempt = 1;
    const MAX_ATTEMPTS = 3;

    // DOM Elements
    let loadingScreen, errorScreen, appContainer;
    let loadingStatus, retryButton;

    /**
     * Initialize the application
     */
    async function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Cache DOM elements
        loadingScreen = document.getElementById('loading-screen');
        errorScreen = document.getElementById('error-screen');
        appContainer = document.getElementById('app-container');
        loadingStatus = document.getElementById('loading-status');
        retryButton = document.getElementById('retry-button');

        // Attach retry button handler
        retryButton.addEventListener('click', retry);

        // Start loading
        console.log('Initializing AI Digit Recognition App...');
        await loadModel();
    }

    /**
     * Load model with retry logic
     */
    async function loadModel() {
        try {
            updateLoadingStatus('Loading AI Model...');

            // Attempt to load model
            await ModelManager.init();

            modelLoaded = true;
            console.log('Model loaded successfully');

            // Initialize other components
            await initializeApp();

        } catch (error) {
            console.error(`Model load attempt ${currentAttempt} failed:`, error);

            // Retry logic
            if (currentAttempt < MAX_ATTEMPTS) {
                currentAttempt++;
                const delay = Math.pow(2, currentAttempt - 2) * 1000; // Exponential backoff

                updateLoadingStatus(`Retrying... (Attempt ${currentAttempt}/${MAX_ATTEMPTS})`);

                // Wait before retry
                await sleep(delay);
                await loadModel();
            } else {
                // Show error after max attempts
                showError();
            }
        }
    }

    /**
     * Initialize all app components
     */
    async function initializeApp() {
        try {
            // Initialize canvas
            CanvasManager.init();

            // Initialize UI
            UIManager.init();

            // Initialize stats
            StatsManager.init();

            // Hide loading screen, show app
            hideLoading();
            showApp();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            showError();
        }
    }

    /**
     * Update loading status text
     * @param {string} message - Status message
     */
    function updateLoadingStatus(message) {
        if (loadingStatus) {
            loadingStatus.textContent = message;
        }
    }

    /**
     * Hide loading screen
     */
    function hideLoading() {
        if (loadingScreen) {
            loadingScreen.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show main app container
     */
    function showApp() {
        if (appContainer) {
            appContainer.style.display = 'grid';
            appContainer.classList.add('fade-in');
        }
    }

    /**
     * Show error screen
     */
    function showError() {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (errorScreen) {
            errorScreen.style.display = 'flex';
            errorScreen.classList.add('fade-in');
        }
    }

    /**
     * Retry loading (reload page)
     */
    function retry() {
        window.location.reload();
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Start initialization
    init();
})();
