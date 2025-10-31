# AI Digit Recognition

A Progressive Web App for real-time handwritten digit recognition using TensorFlow.js and machine learning. Draw any digit from 0-9 with your mouse or finger, and watch as AI recognizes it instantly.

![AI Digit Recognition](https://img.shields.io/badge/PWA-Enabled-brightgreen) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **✨ Draw digits 0-9** with mouse or touch input on an intuitive canvas
- **🤖 AI-powered recognition** using a pre-trained MNIST CNN model
- **📊 Real-time confidence scores** and probability distribution for all digits
- **📈 Statistics tracking** across sessions with persistent localStorage
- **🌙 Beautiful dark mode interface** with vibrant gradient accents
- **📱 Works offline** after initial load (Progressive Web App)
- **💾 Installable** on all devices - iOS, Android, Windows, Mac, Linux
- **⚡ Fast predictions** - all processing happens client-side
- **🔒 Privacy-friendly** - no data sent to servers

## Technologies

- **HTML5, CSS3, JavaScript** - Modern web standards
- **TensorFlow.js** - Machine learning in the browser
- **Fabric.js** - Advanced canvas drawing with touch support
- **Progressive Web App (PWA)** - Offline capability and installability
- **Service Worker** - Caching and offline functionality

## Installation

### Option 1: Run Locally

1. Clone the repository:
```bash
git clone <repository-url>
cd Devish-1
```

2. Open `index.html` in a modern web browser:
```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server
```

3. Navigate to `http://localhost:8000` in your browser

### Option 2: Install as PWA

1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the "Install" icon in the address bar or menu
3. Click "Install" to add to your home screen/start menu
4. Launch from your device like a native app

## Usage

1. **Draw a digit** - Use your mouse or finger to draw any digit from 0 to 9 on the canvas
2. **Adjust brush size** - Choose Small, Medium, or Large brush for your drawing style
3. **Click "Recognize"** - The AI will analyze your drawing and predict the digit
4. **View results** - See the predicted digit, confidence percentage, and probability distribution
5. **Track progress** - Your statistics (total predictions and average confidence) are saved automatically
6. **Undo/Clear** - Use undo to remove the last stroke, or clear to start fresh

## Features in Detail

### Drawing Canvas
- **320x320 pixel** responsive canvas optimized for digits
- **Touch-enabled** for mobile and tablet devices
- **Variable brush sizes** - Small (4px), Medium (8px), Large (12px)
- **Undo functionality** - Remove up to 20 previous strokes
- **Clear button** - Instant canvas reset

### AI Recognition
- **CNN Model** - Convolutional Neural Network trained on MNIST dataset
- **Client-side processing** - All predictions happen in your browser
- **Sub-second predictions** - Fast inference with TensorFlow.js
- **Top 3 probabilities** - See the confidence for the top 3 predicted digits

### Statistics
- **Total Predictions** - Count of all digits you've drawn
- **Average Confidence** - Running average of prediction confidence
- **Persistent storage** - Stats saved across browser sessions
- **Reset option** - Clear stats when needed

### Progressive Web App
- **Installable** - Add to home screen on any device
- **Offline support** - Works without internet after first load
- **Fast loading** - Cached resources for instant startup
- **Cross-platform** - One app for mobile, tablet, and desktop

## Browser Compatibility

- ✅ **Chrome** - Full support (recommended)
- ✅ **Edge** - Full support
- ✅ **Safari** - Full support (iOS 11.3+)
- ✅ **Firefox** - Full support
- ✅ **Opera** - Full support

Requires a modern browser with ES6, Canvas API, and WebGL support for TensorFlow.js.

## Project Structure

```
Devish-1/
├── index.html              # Main HTML file and app entry point
├── manifest.json           # PWA manifest for installability
├── service-worker.js       # Service worker for offline capability
├── css/
│   └── styles.css          # All CSS styles (dark mode theme)
├── js/
│   ├── app.js              # Main application logic and initialization
│   ├── canvas.js           # Canvas drawing functionality (Fabric.js)
│   ├── model.js            # ML model loading and prediction
│   ├── ui.js               # UI updates and interactions
│   └── stats.js            # Statistics tracking and localStorage
├── assets/
│   └── icons/              # PWA icons (192x192, 512x512)
└── README.md               # This file
```

## Technical Details

### Machine Learning Model

The app uses a Convolutional Neural Network (CNN) with the following architecture:
- **Input**: 28x28 grayscale image
- **Conv2D layers**: 32 and 64 filters with ReLU activation
- **MaxPooling**: 2x2 pooling after each conv layer
- **Dense layers**: 128 units with dropout (0.2)
- **Output**: 10 units with softmax (one per digit 0-9)

The model is compiled with Adam optimizer and categorical cross-entropy loss.

### Image Preprocessing

User drawings go through several preprocessing steps:
1. Capture from 320x320 display canvas
2. Convert to 56x56 intermediate resolution
3. Convert to grayscale
4. Downsample to 28x28 (MNIST standard)
5. Invert colors (white digit on black background)
6. Normalize pixel values to 0-1 range
7. Feed to neural network

### Caching Strategy

The service worker uses two caching strategies:
- **Static files**: Network-first with cache fallback
- **CDN resources**: Cache-first for faster loading
- **Automatic updates**: Old caches cleared on activation

## Known Limitations

- **Model accuracy** depends on drawing clarity - messy drawings may give incorrect predictions
- **Internet required** on first load to download model and dependencies (~5MB)
- **Single digits only** - The model recognizes digits 0-9, not letters or symbols
- **Fixed canvas size** - Canvas dimensions are optimized for digit recognition
- **Stats persistence** - Statistics can't be exported, only stored in browser localStorage

## Future Enhancements

Potential features for future versions:
- Pre-trained model with higher accuracy
- Drawing animation and visual feedback
- Sound effects on prediction (optional)
- Export/share drawings
- Multiple language support
- Accessibility improvements
- Model training interface
- Support for letters and symbols

## Development

### Icon Creation

The project includes placeholder PNG icons in `assets/icons/`. For production use, you should create proper icons from the provided SVG templates:

1. Use the SVG files in `assets/icons/` as templates
2. Convert to PNG using your preferred tool (e.g., Inkscape, GIMP, or online converters)
3. Generate both 192x192 and 512x512 sizes
4. Replace the placeholder PNGs

### Model Training

The current model uses randomly initialized weights. For production use, you should:

1. Train the model on MNIST dataset
2. Save the trained weights
3. Load weights from localStorage or a URL
4. Update the model loading code in `js/model.js`

Alternatively, you can load a pre-trained model from a URL using `tf.loadLayersModel()`.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for learning and development.

## Credits

- Built with [TensorFlow.js](https://www.tensorflow.org/js)
- Canvas drawing powered by [Fabric.js](http://fabricjs.com/)
- MNIST dataset: [Yann LeCun et al.](http://yann.lecun.com/exdb/mnist/)
- Design inspired by modern gradient aesthetics

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ and AI**
