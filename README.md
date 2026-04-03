# 🎌 Anime Tracker

A beautiful, responsive web application to track your anime watching progress. Works seamlessly on desktop and mobile devices with smooth scrollytelling effects and optional cloud storage.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Responsive](https://img.shields.io/badge/responsive-yes-brightgreen)

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile devices
- **Scrollytelling Effects** - Smooth animations and transitions as you scroll
- **Dark Theme** - Eye-friendly gradient design optimized for anime aesthetics
- **Touch-Optimized** - Enhanced touch interactions for mobile devices

### 📊 Tracking Features
- **Track Watching Status** - watching, completed, plan-to-watch, dropped, on-hold
- **Episode Progress** - Visual progress bars for episode tracking
- **Rating System** - Rate your anime from 0-10 with visual star display
- **Personal Notes** - Keep notes about each anime
- **Smart Search** - Search by title or notes instantly
- **Filter by Status** - Quick filters for each watching status

### 💾 Storage Options
- **Local Storage** - Works offline with browser localStorage (default)
- **Cloud Storage** - Optional Firebase integration for cross-device sync
- **No Account Required** - Start tracking immediately with local storage

### 🎯 Ergonomic Design
- Smooth scroll behavior with parallax effects
- Fade-in animations as elements appear
- Grid and table view options
- Accessible design following WCAG guidelines
- Touch-friendly buttons (44px minimum)
- Optimized for reduced motion preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- A modern web browser

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rajdangui/anime-tracker.git
   cd anime-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   Desktop: http://localhost:3000
   Mobile: http://[your-local-ip]:3000
   ```

That's it! The app is ready to use with local storage.

## 📱 Mobile Access

To access from your phone on the same network:

1. Find your computer's local IP address:
   - **Windows:** `ipconfig` → Look for IPv4 Address
   - **Mac/Linux:** `ifconfig` or `ip addr` → Look for inet address
   - Example: `192.168.1.100`

2. On your phone, open: `http://192.168.1.100:3000`

3. For easier access, add to your phone's home screen:
   - **iOS:** Share → Add to Home Screen
   - **Android:** Menu → Add to Home Screen

## ☁️ Optional: Firebase Cloud Storage

To enable cross-device sync with Firebase:

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database

2. **Get your config:**
   - Project Settings → General → Your apps
   - Copy the Firebase configuration

3. **Update the config:**
   - Edit `public/js/storage.js`
   - Replace the Firebase config object (around line 24):
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     databaseURL: "your-database-url",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Restart the server** and your data will now sync to Firebase!

## 🎮 Usage

### Adding Anime
1. Click the **"➕ Add Anime"** button
2. Fill in the details:
   - Title (required)
   - Status (watching, completed, etc.)
   - Total episodes
   - Current episode
   - Rating (0-10)
   - Personal notes
3. Click **"Add Anime"**

### Viewing Your List
- **Filter by Status:** Click any status button in the sidebar
- **Search:** Type in the search bar to filter by title or notes
- **Switch Views:** Toggle between Grid and Table view
- **See Statistics:** Real-time stats in the sidebar

### Updating Progress
1. Click the **✏️ edit icon** on any anime card
2. Update the fields you want to change
3. Click **"Update Anime"**

### Deleting Anime
1. Click the **🗑️ delete icon** on any anime card
2. Confirm the deletion

## 📊 Status Types

| Emoji | Status | Description |
|-------|--------|-------------|
| 📺 | Watching | Currently watching |
| ✅ | Completed | Finished watching |
| 📋 | Plan to Watch | Planning to watch |
| ⏸️ | On Hold | Temporarily paused |
| ❌ | Dropped | Stopped watching |

## 🎨 Responsive Breakpoints

- **Desktop:** 1024px and above - Full sidebar and grid layout
- **Tablet:** 768px - 1024px - Adapted layout
- **Mobile:** Below 768px - Stacked layout with horizontal scrolling filters
- **Small Mobile:** Below 480px - Optimized for small screens

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Technologies Used

### Frontend
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern responsive design with animations
- **HTML5** - Semantic markup

### Backend
- **Express.js** - Fast, minimal web server
- **Helmet.js** - Security headers
- **Compression** - Gzip compression for better performance

### Storage
- **localStorage** - Browser-based storage (default)
- **Firebase Realtime Database** - Optional cloud storage

## 📂 Project Structure

```
anime-tracker/
├── public/              # Web application files
│   ├── css/
│   │   └── styles.css   # Responsive styles with scrollytelling
│   ├── js/
│   │   ├── app.js       # Main application logic
│   │   └── storage.js   # Storage abstraction layer
│   ├── assets/          # Images and icons
│   └── index.html       # Single page application
├── server.js            # Express web server
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔒 Security

- Content Security Policy (CSP) enabled
- Helmet.js for security headers
- No backend storage of personal data
- Data stored locally or in your own Firebase

## 🎯 Accessibility

- Semantic HTML for screen readers
- ARIA labels where appropriate
- Keyboard navigation support
- Respects `prefers-reduced-motion`
- High contrast mode support
- Touch targets minimum 44px

## 📝 Development

### Run in development mode:
```bash
npm run dev
```

### Environment variables:
```bash
PORT=3000  # Change the port (optional)
```

## 🚀 Deployment

### Deploy to any hosting service:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Heroku:**
```bash
git push heroku main
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

**Traditional Hosting:**
Just upload the `public/` folder to any static hosting service!

## 🎬 Scrollytelling Effects

The app features smooth scrollytelling animations:
- **Fade-in animations** as cards appear in viewport
- **Parallax header** that changes on scroll
- **Staggered card animations** for visual appeal
- **Smooth scroll behavior** throughout
- **Intersection Observer API** for performance

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

ISC License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Inspired by the anime tracking community
- Built with modern web standards
- Designed for anime enthusiasts

---

**Enjoy tracking your anime journey! 🎌✨**

For issues or questions, visit: https://github.com/rajdangui/anime-tracker/issues
#   a n i m e - t r a c k e r  
 