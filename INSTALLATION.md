# Installation Guide - Rongyok Video Player

## 🚀 Quick Install

### Option 1: Userscript (Recommended) ⭐

**Best for:** Automatic playback on rongyok.com

#### Requirements:
- Any modern browser (Chrome, Firefox, Edge, Safari)
- Tampermonkey extension installed

#### Steps:

1. **Install Tampermonkey**
   - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobp55f
   - Firefox: https://addons.mozilla.org/firefox/addon/tampermonkey/
   - Edge: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfohd
   - Safari: https://apps.apple.com/app/tampermonkey/id1482490089

2. **Install the Script**
   - Click: [rongyok-player.user.js](./rongyok-player.user.js)
   - Or copy URL: `https://raw.githubusercontent.com/Prasong1993/rongyok-video-player/main/rongyok-player.user.js`
   - Tampermonkey will show install dialog
   - Click "Install"

3. **Verify Installation**
   - Go to https://rongyok.com/watch/?series_id=7732
   - Video should load with enhanced controls
   - Check console (F12) for "Rongyok Video Player Pro" message

4. **Start Using**
   - Click play on any video
   - Player auto-saves progress
   - Close and reopen - resumes from last position!

---

### Option 2: Standalone Player

**Best for:** Playing downloaded videos or testing

#### Steps:

1. **Download player.html**
   ```bash
   # Using wget
   wget https://raw.githubusercontent.com/Prasong1993/rongyok-video-player/main/player.html
   
   # Or using curl
   curl -O https://raw.githubusercontent.com/Prasong1993/rongyok-video-player/main/player.html
   ```

2. **Open in Browser**
   - Double-click `player.html`
   - Or: File → Open → Select player.html
   - Or: Right-click → Open with → Browser

3. **Load Video**
   - Paste video URL (must be .mp4)
   - Add title (optional)
   - Click "Load Video"
   - Enjoy!

---

## 🔧 Manual Installation

### For Developers

#### Clone Repository
```bash
git clone https://github.com/Prasong1993/rongyok-video-player.git
cd rongyok-video-player
```

#### Install Dependencies (Optional)
```bash
npm install
```

#### Development
```bash
# Watch for changes
npm run watch

# Build
npm run build
```

---

## 🎯 Configuration

### Edit Script Settings

Open `rongyok-player.user.js` and modify:

```javascript
const CONFIG = {
    AUTO_SAVE_INTERVAL: 5000,    // Save every 5 seconds
    AUTO_PLAY_NEXT: true,        // Auto-play next episode
    DEBUG: false                 // Enable debug logging
};
```

### Global Config

Edit `config.js` for advanced settings:

```javascript
const RONGYOK_CONFIG = {
    PLAYER: {
        AUTO_PLAY_NEXT: true,
        DEFAULT_SPEED: 1,
        DEFAULT_VOLUME: 0.8
    },
    AUTO_SAVE: {
        ENABLED: true,
        INTERVAL: 5000
    }
};
```

---

## ✅ Verification

### Test Installation

**For Userscript:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for: `[Rongyok Player] Initializing...`
4. Should see: `[Rongyok Player] Video listeners attached`

**For Standalone:**
1. Open DevTools (F12)
2. Load a video
3. Check Console for errors
4. Video should play smoothly

---

## 🐛 Troubleshooting

### Issue: Script not loading

**Solution:**
```javascript
// Open console and run:
console.log(window.__stay_video_list); // Should show videos
console.log(window.Plyr); // Should show Plyr library
```

### Issue: Video not playing

**Solution:**
1. Check URL is valid Discord CDN link
2. Verify URL ends with `.mp4`
3. Check CORS headers
4. Try different video

### Issue: Progress not saving

**Solution:**
```javascript
// Check local storage:
localStorage.getItem('rongyok_watch_history')

// Clear and reset:
localStorage.removeItem('rongyok_watch_history');
```

### Issue: Auto-play not working

**Solution:**
1. Check browser autoplay settings
2. Disable adblocking for site
3. Check `AUTO_PLAY_NEXT: true` in config
4. Look for error in console (F12)

---

## 📱 Platform-Specific

### Chrome/Edge
```
Extensions → Manage Extensions
Search for Tampermonkey
Enable "Allow access to file URLs" if needed
```

### Firefox
```
Add-ons → Manage Extensions
Search for Tampermonkey
Grant permissions when prompted
```

### Safari
```
Safari → Preferences → Extensions
Enable Tampermonkey
Grant Full Website Access
```

### Mobile (Android)
```
Browser: Firefox + Tampermonkey
Or: Use standalone player.html
Note: Some features limited on mobile
```

### Mobile (iOS)
```
Browser: Safari
Tampermonkey not available
Alternative: Use standalone player.html
```

---

## 🔄 Update

### Auto-Update
Tampermonkey checks for updates automatically

### Manual Update
```bash
# Pull latest
git pull origin main

# Reinstall script in Tampermonkey
```

---

## 🗑️ Uninstall

### Userscript
1. Open Tampermonkey Dashboard
2. Find "Rongyok Video Player Pro"
3. Click trash icon
4. Confirm deletion

### Standalone
1. Simply delete `player.html` file
2. Clear browser cache if needed

---

## 📞 Support

Having issues? 

1. Check [Troubleshooting](#troubleshooting)
2. Open Issue on GitHub
3. Include:
   - Browser and version
   - Console errors (F12)
   - Steps to reproduce

---

## 🎓 Next Steps

- Read [README.md](./README.md) for features
- Check [config.js](./config.js) for customization
- View Console (F12) for debug info
- Report bugs on GitHub

**Happy watching!** 🍿
