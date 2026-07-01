// ==UserScript==
// @name         Rongyok Fullscreen Player
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  Fullscreen video player with auto-resume for rongyok.com
// @author       Prasong1993
// @match        https://rongyok.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @icon         https://rongyok.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        STORAGE_KEY: 'rongyok_watch_history',
        AUTO_SAVE_INTERVAL: 5000,
        DEBUG: false,
        MIN_WATCH_TIME: 10
    };

    const Logger = {
        log: (msg, data) => {
            if (CONFIG.DEBUG) console.log(`[Rongyok FS] ${msg}`, data || '');
        },
        error: (msg, data) => {
            console.error(`[Rongyok FS] ${msg}`, data || '');
        }
    };

    // ========== Storage ==========
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

    // ========== Video Detector ==========
    const VideoDetector = {
        findVideoElement: function() {
            let video = document.querySelector('video');
            if (video) return video;

            const iframes = document.querySelectorAll('iframe');
            for (let iframe of iframes) {
                try {
                    if (iframe.contentDocument) {
                        video = iframe.contentDocument.querySelector('video');
                        if (video) return video;
                    }
                } catch (e) {
                    // Cross-origin, skip
                }
            }

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
            const url = new URL(window.location.href);
            const episodeParam = url.searchParams.get('ep');
            const seriesParam = url.searchParams.get('series_id');
            
            if (seriesParam && episodeParam) {
                return `${seriesParam}_ep${episodeParam}`;
            }
            
            return window.location.pathname.replace(/\//g, '_');
        },
        getVideoTitle: function() {
            // พยายามหาชื่อจากหลายที่
            let title = document.querySelector('h1')?.textContent || 
                       document.querySelector('[class*="title"]')?.textContent ||
                       document.querySelector('[class*="episode"]')?.textContent ||
                       document.title;
            
            return title.trim().substring(0, 100);
        }
    };

    // ========== Fullscreen Player UI ==========
    const FullscreenPlayer = {
        playerContainer: null,
        originalVideo: null,
        clonedVideo: null,
        autoSaveInterval: null,
        isActive: false,

        createPlayerUI: function(videoElement) {
            // Container หลัก
            const container = document.createElement('div');
            container.id = 'rongyok-fullscreen-player';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            `;

            // Header with title
            const header = document.createElement('div');
            header.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
                padding: 20px;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                z-index: 100001;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            // Title
            const title = document.createElement('h1');
            title.textContent = VideoDetector.getVideoTitle();
            title.style.cssText = `
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            header.appendChild(title);

            // Controls container
            const controls = document.createElement('div');
            controls.style.cssText = `
                display: flex;
                gap: 12px;
                align-items: center;
            `;

            // Fullscreen button
            const fsBtn = document.createElement('button');
            fsBtn.innerHTML = '⛶';
            fsBtn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: #fff;
                width: 40px;
                height: 40px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            fsBtn.onmouseover = () => fsBtn.style.background = 'rgba(255,255,255,0.3)';
            fsBtn.onmouseout = () => fsBtn.style.background = 'rgba(255,255,255,0.2)';
            fsBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => {
                        Logger.error('Fullscreen error:', err);
                    });
                    fsBtn.innerHTML = '⛶';
                } else {
                    document.exitFullscreen();
                    fsBtn.innerHTML = '⛶';
                }
            };
            controls.appendChild(fsBtn);

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: #fff;
                width: 40px;
                height: 40px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 20px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,0,0,0.3)';
            closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.onclick = () => this.closePlayer();
            controls.appendChild(closeBtn);

            header.appendChild(controls);
            container.appendChild(header);

            // Clone video element
            const videoWrapper = document.createElement('div');
            videoWrapper.style.cssText = `
                width: 90%;
                max-width: 1200px;
                height: auto;
                background: #000;
            `;

            const clonedVideo = videoElement.cloneNode(true);
            clonedVideo.style.cssText = `
                width: 100%;
                height: auto;
                display: block;
                background: #000;
            `;
            clonedVideo.controls = true;
            clonedVideo.autoplay = false;
            videoWrapper.appendChild(clonedVideo);
            container.appendChild(videoWrapper);

            // Bottom info
            const infoBar = document.createElement('div');
            infoBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                padding: 20px;
                color: #ccc;
                font-size: 12px;
                font-family: monospace;
                text-align: center;
            `;
            infoBar.id = 'rongyok-info-bar';
            container.appendChild(infoBar);

            return { container, video: clonedVideo, infoBar };
        },

        activate: function() {
            if (this.isActive) return;

            const originalVideo = VideoDetector.findVideoElement();
            if (!originalVideo) {
                Logger.log('Video not found, retrying...');
                setTimeout(() => this.activate(), 1000);
                return;
            }

            Logger.log('Activating fullscreen player');

            const { container, video, infoBar } = this.createPlayerUI(originalVideo);
            document.body.appendChild(container);

            this.playerContainer = container;
            this.originalVideo = originalVideo;
            this.clonedVideo = video;
            this.isActive = true;

            // Sync playback
            this.syncPlayback();

            // Restore progress
            this.restoreProgress();

            // Start auto-save
            this.startAutoSave();

            // Update info bar
            this.updateInfoBar();
        },

        syncPlayback: function() {
            if (!this.originalVideo || !this.clonedVideo) return;

            // Clone → Original
            this.clonedVideo.addEventListener('play', () => {
                if (this.originalVideo.paused) {
                    this.originalVideo.play().catch(e => Logger.error('Play error:', e));
                }
            });

            this.clonedVideo.addEventListener('pause', () => {
                if (!this.originalVideo.paused) {
                    this.originalVideo.pause();
                }
            });

            this.clonedVideo.addEventListener('seeked', () => {
                this.originalVideo.currentTime = this.clonedVideo.currentTime;
            });

            this.clonedVideo.addEventListener('volumechange', () => {
                this.originalVideo.volume = this.clonedVideo.volume;
                this.originalVideo.muted = this.clonedVideo.muted;
            });

            // Original → Clone (update display)
            this.originalVideo.addEventListener('timeupdate', () => {
                if (Math.abs(this.clonedVideo.currentTime - this.originalVideo.currentTime) > 0.5) {
                    this.clonedVideo.currentTime = this.originalVideo.currentTime;
                }
            });

            Logger.log('Playback sync enabled');
        },

        restoreProgress: function() {
            if (!this.clonedVideo) return;

            const videoId = VideoDetector.getVideoId();
            const progress = Storage.getVideoProgress(videoId);

            if (progress && progress.currentTime > CONFIG.MIN_WATCH_TIME) {
                Logger.log('Restoring progress:', progress);

                if (this.clonedVideo.readyState >= 2) {
                    this.clonedVideo.currentTime = progress.currentTime;
                    this.originalVideo.currentTime = progress.currentTime;
                } else {
                    this.clonedVideo.addEventListener('canplay', () => {
                        this.clonedVideo.currentTime = progress.currentTime;
                        this.originalVideo.currentTime = progress.currentTime;
                    }, { once: true });
                }
            }
        },

        startAutoSave: function() {
            if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);

            this.autoSaveInterval = setInterval(() => {
                if (this.clonedVideo && this.clonedVideo.currentTime > CONFIG.MIN_WATCH_TIME) {
                    const videoId = VideoDetector.getVideoId();
                    Storage.saveVideoProgress(
                        videoId,
                        this.clonedVideo.currentTime,
                        this.clonedVideo.duration,
                        VideoDetector.getVideoTitle()
                    );
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);

            Logger.log('Auto-save started');
        },

        updateInfoBar: function() {
            const infoBar = document.getElementById('rongyok-info-bar');
            if (!infoBar || !this.clonedVideo) return;

            setInterval(() => {
                if (this.isActive && this.clonedVideo) {
                    const current = this.formatTime(this.clonedVideo.currentTime);
                    const duration = this.formatTime(this.clonedVideo.duration);
                    infoBar.textContent = `${current} / ${duration}`;
                }
            }, 1000);
        },

        formatTime: function(seconds) {
            if (isNaN(seconds)) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        closePlayer: function() {
            Logger.log('Closing fullscreen player');

            // Save progress
            if (this.clonedVideo) {
                const videoId = VideoDetector.getVideoId();
                Storage.saveVideoProgress(
                    videoId,
                    this.clonedVideo.currentTime,
                    this.clonedVideo.duration,
                    VideoDetector.getVideoTitle()
                );
            }

            // Cleanup
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
            }

            if (this.playerContainer) {
                this.playerContainer.remove();
                this.playerContainer = null;
            }

            this.isActive = false;
            Logger.log('Fullscreen player closed');
        }
    };

    // ========== Trigger Button ==========
    const TriggerButton = {
        createButton: function() {
            const btn = document.createElement('button');
            btn.id = 'rongyok-player-trigger';
            btn.innerHTML = '📺 เปิด Fullscreen Player';
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 12px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                z-index: 9998;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;

            btn.onmouseover = () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
            };

            btn.onmouseout = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            };

            btn.onclick = () => {
                FullscreenPlayer.activate();
                btn.style.display = 'none';
            };

            document.body.appendChild(btn);
            Logger.log('Trigger button added');
        }
    };

    // ========== Initialization ==========
    function init() {
        Logger.log('Initializing Rongyok Fullscreen Player v3...');

        // Wait for video to be available
        const waitForVideo = setInterval(() => {
            if (VideoDetector.findVideoElement()) {
                clearInterval(waitForVideo);
                TriggerButton.createButton();
                Logger.log('Ready to activate');
            }
        }, 500);

        setTimeout(() => clearInterval(waitForVideo), 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Observer for dynamic content
    const observer = new MutationObserver(() => {
        if (!document.getElementById('rongyok-player-trigger') && VideoDetector.findVideoElement()) {
            TriggerButton.createButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        if (FullscreenPlayer.isActive) {
            FullscreenPlayer.closePlayer();
        }
    });

    Logger.log('Rongyok Fullscreen Player v3 script loaded');
})();
