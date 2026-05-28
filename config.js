/**
 * Rongyok Video Player - Configuration
 * Adjust these settings to customize player behavior
 */

const RONGYOK_CONFIG = {
    // ====== Player Settings ======
    PLAYER: {
        // Auto-play next episode when current ends
        AUTO_PLAY_NEXT: true,
        
        // Start video in fullscreen
        AUTO_FULLSCREEN: false,
        
        // Mute by default
        AUTO_MUTE: false,
        
        // Default playback speed (0.25 - 2)
        DEFAULT_SPEED: 1,
        
        // Default volume (0 - 1)
        DEFAULT_VOLUME: 0.8,
        
        // Show skip intro button (if available)
        SHOW_SKIP_INTRO: true,
        
        // Skip intro duration (seconds)
        SKIP_INTRO_DURATION: 90
    },

    // ====== Auto-Save Settings ======
    AUTO_SAVE: {
        // Enable auto-save feature
        ENABLED: true,
        
        // Save interval (milliseconds)
        INTERVAL: 5000, // 5 seconds
        
        // Minimum watched duration before saving (seconds)
        MIN_DURATION: 5,
        
        // Auto-resume from last position
        AUTO_RESUME: true,
        
        // Resume threshold (start video if within X seconds of last position)
        RESUME_THRESHOLD: 3
    },

    // ====== Storage Settings ======
    STORAGE: {
        // Storage key prefix
        KEY_PREFIX: 'rongyok_',
        
        // Watch history key
        HISTORY_KEY: 'rongyok_watch_history',
        
        // Preferences key
        PREFS_KEY: 'rongyok_preferences',
        
        // Bookmarks key
        BOOKMARKS_KEY: 'rongyok_bookmarks',
        
        // Maximum history entries per series
        MAX_HISTORY: 100,
        
        // Clear old entries after (days)
        CLEAR_AFTER_DAYS: 90
    },

    // ====== UI Settings ======
    UI: {
        // Show info box with playback info
        SHOW_INFO_BOX: true,
        
        // Show episode list sidebar
        SHOW_SIDEBAR: true,
        
        // Show episode number on overlay
        SHOW_EPISODE_NUMBER: true,
        
        // Theme (dark/light)
        THEME: 'dark',
        
        // Primary color (hex)
        PRIMARY_COLOR: '#667eea',
        
        // Secondary color (hex)
        SECONDARY_COLOR: '#764ba2'
    },

    // ====== Keyboard Shortcuts ======
    SHORTCUTS: {
        // Enable keyboard shortcuts
        ENABLED: true,
        
        // Play/Pause: Space
        PLAY_PAUSE: ' ',
        
        // Next episode: N
        NEXT_EPISODE: 'n',
        
        // Previous episode: P
        PREVIOUS_EPISODE: 'p',
        
        // Volume up: Up Arrow
        VOLUME_UP: 'ArrowUp',
        
        // Volume down: Down Arrow
        VOLUME_DOWN: 'ArrowDown',
        
        // Seek forward 10s: Right Arrow
        SEEK_FORWARD: 'ArrowRight',
        
        // Seek backward 10s: Left Arrow
        SEEK_BACKWARD: 'ArrowLeft',
        
        // Toggle fullscreen: F
        FULLSCREEN: 'f',
        
        // Speed up: +
        SPEED_UP: '+',
        
        // Speed down: -
        SPEED_DOWN: '-'
    },

    // ====== API & Network ======
    NETWORK: {
        // Request timeout (milliseconds)
        TIMEOUT: 10000,
        
        // Retry failed requests
        RETRY_FAILED: true,
        
        // Number of retries
        MAX_RETRIES: 3,
        
        // Retry delay (milliseconds)
        RETRY_DELAY: 1000
    },

    // ====== Debug ======
    DEBUG: {
        // Enable debug logging
        ENABLED: false,
        
        // Log level (debug/info/warn/error)
        LEVEL: 'info',
        
        // Show debug panel
        SHOW_PANEL: false
    }
};

// Export for use in scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RONGYOK_CONFIG;
}
