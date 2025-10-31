/**
 * Model Manager
 * Handles TensorFlow.js model loading and digit prediction
 */

const ModelManager = (function() {
    'use strict';

    // State
    let model = null;
    let isLoaded = false;

    /**
     * Initialize and load the MNIST model
     * @returns {Promise} Resolves when model is loaded
     */
    async function init() {
        try {
            console.log('Loading MNIST model...');

            // Build a simple MNIST CNN model
            model = tf.sequential({
                layers: [
                    // Convolutional layer 1
                    tf.layers.conv2d({
                        inputShape: [28, 28, 1],
                        filters: 32,
                        kernelSize: 3,
                        activation: 'relu',
                    }),
                    tf.layers.maxPooling2d({ poolSize: 2 }),

                    // Convolutional layer 2
                    tf.layers.conv2d({
                        filters: 64,
                        kernelSize: 3,
                        activation: 'relu',
                    }),
                    tf.layers.maxPooling2d({ poolSize: 2 }),

                    // Flatten and dense layers
                    tf.layers.flatten(),
                    tf.layers.dense({ units: 128, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.2 }),
                    tf.layers.dense({ units: 10, activation: 'softmax' })
                ]
            });

            // Compile the model
            model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Attempt to load pre-trained weights from localStorage
            try {
                await model.loadWeights('indexeddb://mnist-model');
                console.log('Loaded pre-trained weights from cache');
            } catch (e) {
                console.log('No cached weights found, using initialized model');
                // Model will use randomly initialized weights
                // In production, you would load pre-trained weights or train the model
            }

            isLoaded = true;
            console.log('Model ready');
            return true;
        } catch (error) {
            console.error('Failed to load model:', error);
            throw error;
        }
    }

    /**
     * Preprocess canvas image data for model input
     * @param {ImageData} imageData - Raw image data from canvas
     * @returns {tf.Tensor} Preprocessed tensor
     */
    function preprocessCanvas(imageData) {
        return tf.tidy(() => {
            // Convert ImageData to tensor
            let tensor = tf.browser.fromPixels(imageData, 1);

            // Resize to 28x28
            tensor = tf.image.resizeBilinear(tensor, [28, 28]);

            // Normalize to 0-1 range
            tensor = tensor.div(255.0);

            // Invert colors (MNIST expects white digit on black background)
            // Canvas has black digit on white background, so we invert
            tensor = tf.sub(1.0, tensor);

            // Reshape to [1, 28, 28, 1] (batch_size, height, width, channels)
            tensor = tensor.expandDims(0);

            return tensor;
        });
    }

    /**
     * Predict digit from canvas image data
     * @param {ImageData} imageData - Image data from canvas
     * @returns {Object} Prediction results
     */
    async function predict(imageData) {
        if (!isLoaded || !model) {
            throw new Error('Model not loaded');
        }

        let preprocessedTensor;
        let predictionTensor;

        try {
            // Preprocess the image
            preprocessedTensor = preprocessCanvas(imageData);

            // Run prediction
            predictionTensor = model.predict(preprocessedTensor);

            // Get probabilities as array
            const probabilities = await predictionTensor.data();

            // Create array of {digit, probability} objects
            const predictions = Array.from(probabilities).map((prob, index) => ({
                digit: index,
                probability: prob * 100 // Convert to percentage
            }));

            // Sort by probability descending
            predictions.sort((a, b) => b.probability - a.probability);

            // Get top 3
            const topThree = predictions.slice(0, 3);

            // Get top prediction
            const topPrediction = {
                digit: topThree[0].digit,
                confidence: Math.round(topThree[0].probability * 10) / 10 // Round to 1 decimal
            };

            return {
                topPrediction,
                topThree: topThree.map(p => ({
                    digit: p.digit,
                    probability: Math.round(p.probability * 10) / 10
                }))
            };
        } finally {
            // Clean up tensors to prevent memory leaks
            if (preprocessedTensor) {
                preprocessedTensor.dispose();
            }
            if (predictionTensor) {
                predictionTensor.dispose();
            }
        }
    }

    /**
     * Check if model is loaded
     * @returns {boolean}
     */
    function isModelLoaded() {
        return isLoaded;
    }

    // Public API
    return {
        init,
        predict,
        isModelLoaded
    };
})();
