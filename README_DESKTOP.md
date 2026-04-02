# Anime Tracker Desktop Application

A beautiful desktop application to track your anime watching progress with online cloud storage support via Firebase.

## ✨ Features

- 🖥️ **Native Desktop Application** - Built with Electron for Windows, macOS, and Linux
- ☁️ **Cloud Sync** - Optional Firebase integration for online storage and cross-device sync
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations
- 📋 **Multiple Views** - Grid and table layouts for viewing your anime list
- 📺 **Track Watching Status** - watching, completed, plan-to-watch, dropped, on-hold
- ⭐ **Rate Your Anime** - 0-10 scale with visual star ratings
- 📊 **Rich Statistics** - Real-time stats showing your anime watching habits
- 🔍 **Smart Search** - Search by title or notes
- 🎯 **Progress Tracking** - Visual progress bars for episode tracking
- 💬 **Add Notes** - Keep personal notes about each anime
- 🌈 **Color-Coded Status** - Each status has its own color and emoji
- ⚡ **Fast & Responsive** - Smooth UI with instant updates

## 📦 Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/rajdangui/anime-tracker.git
cd anime-tracker
```

2. Install dependencies:
```bash
npm install
```

3. **(Optional) Configure Firebase for Online Storage:**

   To enable cloud sync:

   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

   b. Enable Firebase Realtime Database in your project

   c. Copy your Firebase configuration

   d. Edit `src/firebase-config.js` and replace the placeholder values with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com"
   };
   ```

   If you don't configure Firebase, the app will use local storage automatically.

## 🚀 Usage

### Running in Development Mode

```bash
npm run electron-dev
```

This will launch the application in development mode with DevTools enabled.

### Running in Production Mode

```bash
npm run electron
```

### Building Installers

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage
```

The built installers will be in the `dist` folder.

## 📱 Using the Application

### Main Interface

- **Sidebar Navigation**: Filter anime by status (All, Watching, Completed, etc.)
- **Statistics Panel**: View real-time stats about your collection
- **Search Bar**: Quickly find anime by title or notes
- **View Toggle**: Switch between grid and table layouts

### Adding Anime

1. Click the "➕ Add Anime" button
2. Fill in the details:
   - Title (required)
   - Status (watching, completed, etc.)
   - Total episodes
   - Current episode
   - Rating (0-10)
   - Notes
3. Click "Add Anime" to save

### Editing Anime

1. Click the ✏️ (edit) icon on any anime card
2. Modify the details
3. Click "Update Anime" to save changes

### Deleting Anime

1. Click the 🗑️ (delete) icon on any anime card
2. Confirm the deletion in the popup

## 💾 Data Storage

The application supports two storage modes:

### Local Storage (Default)
- Data is stored in `~/.anime-tracker/anime-list.json`
- Works offline
- Data stays on your device
- No configuration needed

### Firebase Cloud Storage (Optional)
- Data is stored in Firebase Realtime Database
- Syncs across multiple devices
- Accessible from anywhere
- Requires Firebase configuration
- Automatic fallback to local storage if Firebase is unavailable

## 🎨 Status Values

The following status values are supported:

- 📺 **watching** - Currently watching (Cyan)
- ✅ **completed** - Finished watching (Green)
- 📋 **plan-to-watch** - Planning to watch (Yellow)
- ⏸️ **on-hold** - Temporarily paused (Magenta)
- ❌ **dropped** - Stopped watching (Red)

## 🛠️ Technologies Used

- **Electron** - Desktop application framework
- **Node.js** - Backend runtime
- **Firebase** - Cloud database (optional)
- **HTML/CSS/JavaScript** - Frontend UI
- **Gradient Design** - Modern visual aesthetics

## 📋 CLI Version

The original CLI version is still available. You can use it by running:

```bash
node src/index.js interactive
```

See the CLI documentation in the original README for more details.

## 🔧 Development

### Project Structure

```
anime-tracker/
├── electron/           # Electron main process
│   ├── main.js        # Main process entry point
│   └── preload.js     # Preload script (context bridge)
├── renderer/          # Renderer process (UI)
│   ├── index.html    # Main HTML
│   ├── styles.css    # Styles
│   └── app.js        # Frontend logic
├── src/              # Shared business logic
│   ├── storage.js    # Data storage layer
│   ├── utils.js      # Utilities
│   ├── firebase-config.js  # Firebase configuration
│   └── index.js      # CLI entry point (legacy)
└── package.json      # Dependencies and scripts
```

### Adding Features

1. Backend logic goes in `src/storage.js`
2. IPC handlers go in `electron/main.js`
3. API exposure goes in `electron/preload.js`
4. Frontend logic goes in `renderer/app.js`
5. UI goes in `renderer/index.html` and `renderer/styles.css`

## 🐛 Troubleshooting

### Firebase Connection Issues

If Firebase isn't connecting:
1. Check your `src/firebase-config.js` configuration
2. Verify Firebase Realtime Database is enabled in your Firebase project
3. Check your internet connection
4. The app will automatically fallback to local storage

### Build Issues

If builds fail:
1. Make sure all dependencies are installed: `npm install`
2. Try deleting `node_modules` and `package-lock.json`, then reinstall
3. Check that you have the required build tools for your platform

### Data Migration

To migrate from local to Firebase or vice versa:
1. Export your local data from `~/.anime-tracker/anime-list.json`
2. Configure your desired storage method
3. Manually import data through the UI or by placing it in the appropriate location

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please use the [GitHub Issues](https://github.com/rajdangui/anime-tracker/issues) page.
