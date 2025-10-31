/**
 * UI Manager
 * Handles all UI interactions and updates
 */

const UIManager = (function() {
    'use strict';

    // State
    let isPredicting = false;

    // DOM Elements (cached)
    let recognizeBtn, clearBtn, undoBtn, resetStatsBtn;
    let brushButtons;
    let predictionValue, confidenceValue;
    let probabilityBarsContainer;
    let totalPredictionsEl, averageConfidenceEl;

    /**
     * Initialize UI manager
     */
    function init() {
        // Cache DOM elements
        recognizeBtn = document.getElementById('recognize-button');
        clearBtn = document.getElementById('clear-button');
        undoBtn = document.getElementById('undo-button');
        resetStatsBtn = document.getElementById('reset-stats-button');
        brushButtons = document.querySelectorAll('.btn-brush');
        predictionValue = document.getElementById('prediction-value');
        confidenceValue = document.getElementById('confidence-value');
        probabilityBarsContainer = document.getElementById('probability-bars-container');
        totalPredictionsEl = document.getElementById('total-predictions');
        averageConfidenceEl = document.getElementById('average-confidence');

        // Attach event listeners
        recognizeBtn.addEventListener('click', handleRecognize);
        clearBtn.addEventListener('click', handleClear);
        undoBtn.addEventListener('click', handleUndo);
        resetStatsBtn.addEventListener('click', handleResetStats);

        // Brush size buttons
        brushButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const size = parseInt(this.getAttribute('data-size'));
                handleBrushSizeChange(size, this);
            });
        });

        // Set initial button states
        disableRecognizeButton();

        // Set canvas change callback
        CanvasManager.setOnCanvasChange(function(isEmpty) {
            const canvasOverlay = document.querySelector('.canvas-overlay');

            if (isEmpty) {
                disableRecognizeButton();
                if (canvasOverlay) canvasOverlay.style.opacity = '1';
            } else {
                enableRecognizeButton();
                if (canvasOverlay) canvasOverlay.style.opacity = '0';
            }
        });

        // Load and display initial stats
        const stats = StatsManager.getStats();
        updateStatsDisplay(stats);

        console.log('UI initialized');
    }

    /**
     * Handle recognize button click
     */
    async function handleRecognize() {
        if (isPredicting) return;

        isPredicting = true;
        recognizeBtn.disabled = true;

        // Update button text
        const btnLabel = recognizeBtn.querySelector('.btn-label');
        if (btnLabel) {
            btnLabel.textContent = 'Analyzing...';
        }

        try {
            // Get image data from canvas
            const imageData = await CanvasManager.getImageData();

            // Run prediction
            const result = await ModelManager.predict(imageData);

            // Update displays with enhanced animations
            updatePredictionDisplay(result.topPrediction);
            updateProbabilityBars(result.topThree);

            // Update stats
            const stats = StatsManager.addPrediction(result.topPrediction.confidence);
            updateStatsDisplay(stats);

            // Success feedback
            showToast('✨ Prediction complete!');

        } catch (error) {
            console.error('Prediction error:', error);
            showToast('⚠️ Prediction failed, try again');
        } finally {
            isPredicting = false;
            recognizeBtn.disabled = false;

            // Restore button text
            if (btnLabel) {
                btnLabel.textContent = 'Recognize';
            }
        }
    }

    /**
     * Handle clear button click
     */
    function handleClear() {
        CanvasManager.clear();
        disableRecognizeButton();

        // Reset prediction display
        predictionValue.textContent = '?';
        confidenceValue.textContent = '—';
        probabilityBarsContainer.innerHTML = '';
    }

    /**
     * Handle undo button click
     */
    function handleUndo() {
        CanvasManager.undo();
        // Canvas change callback will handle button state
    }

    /**
     * Handle brush size change
     * @param {number} size - Brush size
     * @param {HTMLElement} clickedBtn - Clicked button element
     */
    function handleBrushSizeChange(size, clickedBtn) {
        // Update canvas brush size
        CanvasManager.setBrushSize(size);

        // Update UI - remove active class from all, add to clicked
        brushButtons.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');
    }

    /**
     * Handle reset stats button click
     */
    function handleResetStats() {
        const stats = StatsManager.reset();
        updateStatsDisplay(stats);
        showToast('Statistics reset');
    }

    /**
     * Update prediction display
     * @param {Object} prediction - Top prediction object
     */
    function updatePredictionDisplay(prediction) {
        // Fade out effect
        predictionValue.style.opacity = '0';
        predictionValue.style.transform = 'scale(0.8)';

        setTimeout(() => {
            predictionValue.textContent = prediction.digit;
            confidenceValue.textContent = prediction.confidence + '%';

            // Fade in and scale animation
            predictionValue.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            predictionValue.style.opacity = '1';
            predictionValue.style.transform = 'scale(1)';
        }, 150);

        // Add success animation class
        predictionValue.classList.add('fade-in');
        setTimeout(() => {
            predictionValue.classList.remove('fade-in');
        }, 500);
    }

    /**
     * Update probability bars
     * @param {Array} topThree - Array of top 3 predictions
     */
    function updateProbabilityBars(topThree) {
        // Clear existing bars
        probabilityBarsContainer.innerHTML = '';

        // Create bars for each prediction
        topThree.forEach((pred, index) => {
            const item = document.createElement('div');
            item.className = 'probability-item';

            const digit = document.createElement('div');
            digit.className = 'probability-digit';
            digit.textContent = pred.digit;

            const barContainer = document.createElement('div');
            barContainer.className = 'probability-bar-container';

            const bar = document.createElement('div');
            bar.className = 'probability-bar';
            if (index === 0) {
                bar.classList.add('top');
            } else {
                bar.classList.add('muted');
            }

            // Animate bar width
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = pred.probability + '%';
            }, 50);

            const percentage = document.createElement('div');
            percentage.className = 'probability-percentage';
            percentage.textContent = pred.probability + '%';

            barContainer.appendChild(bar);
            item.appendChild(digit);
            item.appendChild(barContainer);
            item.appendChild(percentage);
            probabilityBarsContainer.appendChild(item);
        });
    }

    /**
     * Update statistics display
     * @param {Object} stats - Stats object
     */
    function updateStatsDisplay(stats) {
        // Animate number changes
        animateValue(totalPredictionsEl, parseInt(totalPredictionsEl.textContent) || 0, stats.total, 300);
        animateValue(averageConfidenceEl, parseFloat(averageConfidenceEl.textContent) || 0, stats.average, 300, '%');
    }

    /**
     * Animate number transitions
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration in ms
     * @param {string} suffix - Optional suffix (e.g., '%')
     */
    function animateValue(element, start, end, duration, suffix = '') {
        if (start === end) return;

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current * 10) / 10 + suffix;
        }, 16);
    }

    /**
     * Enable recognize button
     */
    function enableRecognizeButton() {
        recognizeBtn.disabled = false;
    }

    /**
     * Disable recognize button
     */
    function disableRecognizeButton() {
        recognizeBtn.disabled = true;
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     */
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Public API
    return {
        init
    };
})();
