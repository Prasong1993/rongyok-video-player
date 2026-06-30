// ==UserScript==
// @name         Rongyok Video Player v2
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Auto-resume & auto-save for rongyok.com (minimal UI, non-intrusive)
// @author       Prasong1993
// @match        https://rongyok.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @icon         https://rongyok.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // ======== Configuration ========
    const CONFIG = {
        STORAGE_KEY: 'rongyok_watch_history',
        AUTO_SAVE_INTERVAL: 5000, // 5 seconds
        DEBUG: false,
        MIN_WATCH_TIME: 10 // minimum 10 seconds to save
    };

    // ======== Logger ========
    const Logger = {
        log: (msg, data) => {
            if (CONFIG.DEBUG) console.log(`[Rongyok v2] ${msg}`, data || '');
        },
        error: (msg, data) => {
            console.error(`[Rongyok v2] ${msg}`, data || '');
        }
    };

    // ======== Storage Management ========
    const Storage = {
        get: function(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                Logger.error('Storage get error:', e);
                return defaultValue;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                Logger.log('Storage set:', { key, value });
                return true;
            } catch (e) {
                Logger.error('Storage set error:', e);
                return false;
            }
        },
        saveVideoProgress: function(videoId, currentTime, duration, title) {
            const history = this.get(CONFIG.STORAGE_KEY, {});
            history[videoId] = {
                videoId,
                currentTime,
                duration,
                title,
                savedAt: new Date().toISOString()
            };
            this.set(CONFIG.STORAGE_KEY, history);
        },
        getVideoProgress: function(videoId) {
            const history = this.get(CONFIG.STORAGE_KEY, {});
            return history[videoId] || null;
        }
    };

    // ======== Video Detector ========
    const VideoDetector = {
        findVideoElement: function() {
            // วิธี 1: ค้นหา video element โดยตรง
            let video = document.querySelector('video');
            if (video) return video;

            // วิธี 2: ค้นหา iframe และ video ข้างใน
            const iframes = document.querySelectorAll('iframe');
            for (let iframe of iframes) {
                try {
                    if (iframe.contentDocument) {
                        video = iframe.contentDocument.querySelector('video');
                        if (video) return video;
                    }
                } catch (e) {
                    // Cross-origin iframe, skip
                }
            }

            // วิธี 3: ค้นหาวิดีโอใน shadow DOM
            const allElements = document.querySelectorAll('*');
            for (let el of allElements) {
                if (el.shadowRoot) {
                    video = el.shadowRoot.querySelector('video');
                    if (video) return video;
                }
            }

            return null;
        },
        getVideoId: function() {
            // ใช้ URL หรือ title เป็น unique ID
            const url = new URL(window.location.href);
            const episodeParam = url.searchParams.get('ep');
            const seriesParam = url.searchParams.get('series_id');
            
            if (seriesParam && episodeParam) {
                return `${seriesParam}_ep${episodeParam}`;
            }
            
            // Fallback: ใช้ pathname
            return window.location.pathname.replace(/\//g, '_');
        }
    };

    // ======== Video Manager ========
    const VideoManager = {
        currentVideo: null,
        autoSaveInterval: null,
        isInitialized: false,

        initialize: function() {
            if (this.isInitialized) return;

            const video = VideoDetector.findVideoElement();
            if (!video) {
                Logger.log('Video element not found, retrying...');
                setTimeout(() => this.initialize(), 1000);
                return;
            }

            this.currentVideo = video;
            this.isInitialized = true;
            Logger.log('Video element found and initialized');

            // Restore progress
            this.restoreProgress();

            // Attach event listeners
            this.attachEventListeners();

            // Start auto-save
            this.startAutoSave();

            // Show status indicator
            this.showStatusIndicator();
        },

        restoreProgress: function() {
            if (!this.currentVideo) return;

            const videoId = VideoDetector.getVideoId();
            const progress = Storage.getVideoProgress(videoId);

            if (progress && progress.currentTime > CONFIG.MIN_WATCH_TIME) {
                Logger.log('Restoring progress:', progress);
                
                // Wait for video to be ready
                if (this.currentVideo.readyState >= 2) {
                    this.currentVideo.currentTime = progress.currentTime;
                    Logger.log(`Resumed at ${progress.currentTime.toFixed(1)}s`);
                } else {
                    this.currentVideo.addEventListener('canplay', () => {
                        this.currentVideo.currentTime = progress.currentTime;
                    }, { once: true });
                }
            }
        },

        attachEventListeners: function() {
            if (!this.currentVideo) return;

            // Save on pause
            this.currentVideo.addEventListener('pause', () => {
                this.saveCurrentProgress();
            });

            // Save on ended
            this.currentVideo.addEventListener('ended', () => {
                Logger.log('Video ended');
                this.saveCurrentProgress();
            });

            // Update UI
            this.currentVideo.addEventListener('timeupdate', () => {
                this.updateStatusIndicator();
            });

            Logger.log('Event listeners attached');
        },

        startAutoSave: function() {
            if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);

            this.autoSaveInterval = setInterval(() => {
                if (this.currentVideo && this.currentVideo.currentTime > CONFIG.MIN_WATCH_TIME) {
                    this.saveCurrentProgress();
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);

            Logger.log('Auto-save started');
        },

        saveCurrentProgress: function() {
            if (!this.currentVideo) return;

            const videoId = VideoDetector.getVideoId();
            const { currentTime, duration } = this.currentVideo;
            const title = document.title || 'Video';

            Storage.saveVideoProgress(videoId, currentTime, duration, title);
            Logger.log(`Progress saved: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
        },

        showStatusIndicator: function() {
            if (document.getElementById('rongyok-status-indicator')) return;

            const indicator = document.createElement('div');
            indicator.id = 'rongyok-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px 15px;
                border-radius: 6px;
                font-size: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                z-index: 9999;
                border-left: 3px solid #00d9ff;
                max-width: 250px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            indicator.textContent = '⏱️ Rongyok Player Ready';
            document.body.appendChild(indicator);

            Logger.log('Status indicator added');
        },

        updateStatusIndicator: function() {
            const indicator = document.getElementById('rongyok-status-indicator');
            if (!indicator || !this.currentVideo) return;

            const current = this.formatTime(this.currentVideo.currentTime);
            const duration = this.formatTime(this.currentVideo.duration);
            indicator.textContent = `⏱️ ${current} / ${duration}`;
        },

        formatTime: function(seconds) {
            if (isNaN(seconds)) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        cleanup: function() {
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
            this.saveCurrentProgress();
            Logger.log('Cleanup complete');
        }
    };

    // ======== Initialization ========
    function init() {
        Logger.log('Initializing Rongyok Video Player v2...');
        VideoManager.initialize();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Wait for late-loaded videos
    setTimeout(() => {
        if (!VideoManager.isInitialized) {
            Logger.log('Attempting late initialization...');
            init();
        }
    }, 3000);

    // Use MutationObserver for dynamically added videos
    const observer = new MutationObserver(() => {
        if (!VideoManager.isInitialized && VideoDetector.findVideoElement()) {
            init();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
    });

    // Cleanup before page unload
    window.addEventListener('beforeunload', () => {
        VideoManager.cleanup();
    });

    Logger.log('Rongyok Video Player v2 script loaded');
})();
