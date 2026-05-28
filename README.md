# Rongyok Video Player 🎬

Auto-play video player for rongyok.com with advanced features including resume functionality, playlist management, and modern UI.

## ✨ Features

### 🎮 Player Features
- ✅ **Auto-play next episode** - Automatically plays the next episode when current ends
- ✅ **Resume playback** - Remembers where you left off
- ✅ **Seek slider** - Jump to any time in the video
- ✅ **Volume control** - Adjust audio levels
- ✅ **Playback speed** - 0.25x to 2x speed control
- ✅ **Fullscreen mode** - Immersive viewing
- ✅ **Progress tracking** - Visual progress bar with buffering indicator
- ✅ **Episode list** - Quick navigation between episodes
- ✅ **Dark theme** - Easy on the eyes
- ✅ **Mobile compatible** - Works on all devices

### 💾 Data Persistence
- Auto-save current timestamp every 5 seconds
- Resume from last watched position
- Track watch history per series
- Local storage (no cloud sync needed)

## 📦 Installation

### Method 1: Userscript (Recommended)

**Requirements:**
- Browser: Chrome, Firefox, Edge, Safari
- Extension: [Tampermonkey](https://www.tampermonkey.net/)

**Steps:**
1. Install Tampermonkey for your browser
2. Click here to install: [rongyok-player.user.js](./rongyok-player.user.js)
3. Tampermonkey will prompt - click "Install"
4. Done! The script auto-activates on rongyok.com

### Method 2: Standalone Player

1. Download `player.html`
2. Open in any web browser
3. Paste video URLs to play

## 🚀 Quick Start

### Using Userscript
1. Visit any series on [rongyok.com](https://rongyok.com)
2. Video will auto-load with enhanced controls
3. Click play - enhanced player takes over
4. Video progress saves automatically
5. Close and reopen - continues from where you left off!

### Using Standalone Player
1. Open `player.html` in browser
2. Paste Discord CDN video URL
3. Click "Load Video"
4. Enjoy enhanced controls

## 🎯 Controls

| Control | Action |
|---------|--------|
| **Play/Pause** | Click video or spacebar |
| **Seek** | Click on progress bar or drag slider |
| **Volume** | Use volume slider |
| **Speed** | Select from speed menu (0.25x - 2x) |
| **Fullscreen** | Click fullscreen button |
| **Episodes** | Click episode number in sidebar |
| **Next/Previous** | Arrow buttons in controls |

## 💾 Data Storage

All data stored locally in browser:
- Video timestamps
- Watch history
- Playback preferences
- Series bookmarks

**No data sent to external servers!**

## 🔧 Configuration

### Auto-save interval
Edit in script (line ~30):
```javascript
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds
```

### Storage keys
- `rongyok_watchHistory` - Watch timestamps
- `rongyok_preferences` - User settings
- `rongyok_bookmarks` - Saved series

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best performance |
| Firefox | ✅ Full | Full support |
| Safari | ✅ Full | iOS & macOS |
| Edge | ✅ Full | Chromium-based |
| Opera | ✅ Full | Chromium-based |

## ⚙️ Advanced Usage

### Export Watch History
```javascript
const history = JSON.parse(localStorage.getItem('rongyok_watchHistory'));
console.log(history);
```

### Clear All Data
```javascript
localStorage.removeItem('rongyok_watchHistory');
localStorage.removeItem('rongyok_preferences');
localStorage.removeItem('rongyok_bookmarks');
```

### Reset Specific Series
```javascript
const history = JSON.parse(localStorage.getItem('rongyok_watchHistory') || '{}');
delete history['series_id_here'];
localStorage.setItem('rongyok_watchHistory', JSON.stringify(history));
```

## 🐛 Troubleshooting

### Player not loading?
1. Check Tampermonkey is enabled
2. Refresh page (Ctrl+Shift+R)
3. Check console for errors (F12)
4. Disable other video scripts

### Video not playing?
1. Check internet connection
2. Try different episode
3. Clear browser cache
4. Check video URL is valid

### Progress not saving?
1. Check browser allows local storage
2. Not in private/incognito mode
3. Check storage quota not full
4. Browser privacy settings

## 📋 File Structure

```
rongyok-video-player/
├── README.md                    # This file
├── rongyok-player.user.js      # Main Userscript
├── player.html                  # Standalone player
├── assets/
│   ├── style.css               # Player styling
│   └── player.js               # Player logic
└── config.js                    # Configuration
```

## 🔐 Privacy & Security

✅ **No tracking** - All data stored locally
✅ **No ads** - Clean viewing experience
✅ **Open source** - Code is transparent
✅ **No authentication** - Works offline
✅ **No external calls** - Except video CDN

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📞 Support

Having issues? 
1. Check [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Check browser console (F12) for errors

## 🎬 Demo

Visit: https://rongyok.com/watch/?series_id=7732

The script auto-activates with enhanced player!

---

**Made with ❤️ for better streaming experience**

*Last updated: 2026*
