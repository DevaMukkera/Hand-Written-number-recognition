/**
 * Statistics Manager
 * Handles tracking and persistence of prediction statistics
 */

const StatsManager = (function() {
    'use strict';

    // State
    let totalPredictions = 0;
    let totalConfidence = 0;
    let averageConfidence = 0;

    // localStorage key
    const STORAGE_KEY = 'digitRecognitionStats';

    /**
     * Initialize stats manager - load from localStorage
     */
    function init() {
        const data = load();
        if (data) {
            totalPredictions = data.totalPredictions || 0;
            totalConfidence = data.totalConfidence || 0;
            averageConfidence = data.averageConfidence || 0;
        }
        return getStats();
    }

    /**
     * Add a new prediction to stats
     * @param {number} confidence - Confidence percentage
     */
    function addPrediction(confidence) {
        totalPredictions += 1;
        totalConfidence += confidence;
        averageConfidence = totalConfidence / totalPredictions;
        save();
        return getStats();
    }

    /**
     * Get current stats
     * @returns {Object} Stats object
     */
    function getStats() {
        return {
            total: totalPredictions,
            average: Math.round(averageConfidence * 10) / 10 // Round to 1 decimal
        };
    }

    /**
     * Reset all statistics
     */
    function reset() {
        totalPredictions = 0;
        totalConfidence = 0;
        averageConfidence = 0;
        save();
        return getStats();
    }

    /**
     * Save stats to localStorage
     */
    function save() {
        try {
            const data = {
                totalPredictions,
                totalConfidence,
                averageConfidence
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save stats to localStorage:', error);
        }
    }

    /**
     * Load stats from localStorage
     * @returns {Object|null} Parsed stats or null
     */
    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load stats from localStorage:', error);
        }
        return null;
    }

    // Public API
    return {
        init,
        addPrediction,
        getStats,
        reset
    };
})();
