/**
 * Canvas Manager
 * Handles drawing canvas using Fabric.js
 */

const CanvasManager = (function() {
    'use strict';

    // State
    let fabricCanvas = null;
    let drawingHistory = [];
    let isEmpty = true;
    let currentBrushSize = 8;
    const MAX_HISTORY = 20;

    // Callbacks
    let onCanvasChange = null;

    /**
     * Initialize Fabric.js canvas
     */
    function init() {
        // Initialize Fabric canvas
        fabricCanvas = new fabric.Canvas('drawing-canvas', {
            isDrawingMode: true,
            width: 320,
            height: 320
        });

        // Configure brush
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = 'black';
        fabricCanvas.freeDrawingBrush.width = currentBrushSize;

        // Set canvas background to white
        fabricCanvas.backgroundColor = '#ffffff';
        fabricCanvas.renderAll();

        // Listen to drawing events
        fabricCanvas.on('path:created', function(e) {
            isEmpty = false;
            saveState();
            if (onCanvasChange) {
                onCanvasChange(isEmpty);
            }
        });

        // Prevent touch scrolling when drawing
        const canvasElement = document.getElementById('drawing-canvas');
        canvasElement.addEventListener('touchstart', function(e) {
            e.preventDefault();
        }, { passive: false });

        canvasElement.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });

        console.log('Canvas initialized');
    }

    /**
     * Set brush size
     * @param {number} size - Brush size (4, 8, or 12)
     */
    function setBrushSize(size) {
        currentBrushSize = size;
        if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
            fabricCanvas.freeDrawingBrush.width = size;
        }
    }

    /**
     * Undo last drawing action
     */
    function undo() {
        const objects = fabricCanvas.getObjects();
        if (objects.length > 0) {
            // Remove the last object
            const lastObject = objects[objects.length - 1];
            fabricCanvas.remove(lastObject);
            fabricCanvas.renderAll();

            // Update history
            if (drawingHistory.length > 0) {
                drawingHistory.pop();
            }

            // Check if canvas is now empty
            if (fabricCanvas.getObjects().length === 0) {
                isEmpty = true;
                if (onCanvasChange) {
                    onCanvasChange(isEmpty);
                }
            }
        }
    }

    /**
     * Clear entire canvas
     */
    function clear() {
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = '#ffffff';
        fabricCanvas.renderAll();
        drawingHistory = [];
        isEmpty = true;
        if (onCanvasChange) {
            onCanvasChange(isEmpty);
        }
    }

    /**
     * Check if canvas is empty
     * @returns {boolean}
     */
    function isCanvasEmpty() {
        return isEmpty;
    }

    /**
     * Get canvas image data for model prediction
     * @returns {ImageData}
     */
    function getImageData() {
        // Create a temporary canvas at higher resolution
        const tempCanvas = document.createElement('canvas');
        const size = 56; // Higher resolution before downsampling
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext('2d');

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw the fabric canvas onto temp canvas (scaled)
        const fabricCanvasDataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1
        });

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                const imageData = ctx.getImageData(0, 0, size, size);
                resolve(imageData);
            };
            img.onerror = reject;
            img.src = fabricCanvasDataURL;
        });
    }

    /**
     * Save current canvas state to history
     */
    function saveState() {
        // For simplicity, we just track that a change occurred
        // In a more advanced version, we could save full canvas state
        drawingHistory.push(Date.now());

        // Limit history size
        if (drawingHistory.length > MAX_HISTORY) {
            drawingHistory.shift();
        }
    }

    /**
     * Set callback for canvas changes
     * @param {Function} callback - Called when canvas changes
     */
    function setOnCanvasChange(callback) {
        onCanvasChange = callback;
    }

    // Public API
    return {
        init,
        setBrushSize,
        undo,
        clear,
        isCanvasEmpty,
        getImageData,
        setOnCanvasChange
    };
})();
