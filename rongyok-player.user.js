// ==UserScript==
// @name         Rongyok Video Player Pro
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Auto-play video player for rongyok.com with resume functionality
// @author       Prasong1993
// @match        https://rongyok.com/watch/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @run-at       document-end
// @icon         https://rongyok.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // ====== Configuration ======
    const CONFIG = {
        AUTO_SAVE_INTERVAL: 5000, // 5 seconds
        AUTO_PLAY_NEXT: true,
        STORAGE_KEY: 'rongyok_watch_history',
        DEBUG: false
    };

    // ====== Utilities ======
    const Logger = {
        log: (msg, data) => CONFIG.DEBUG && console.log(`[Rongyok Player] ${msg}`, data || ''),
        error: (msg, data) => console.error(`[Rongyok Player] ${msg}`, data || ''),
        warn: (msg, data) => console.warn(`[Rongyok Player] ${msg}`, data || '')
    };

    // ====== Storage Management ======
    const Storage = {
        get: function(key, defaultValue = null) {
            const value = localStorage.getItem(key);
            try {
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                Logger.error('Storage error:', e);
                return false;
            }
        },
        addWatchHistory: function(seriesId, episodeNum, timestamp, title) {
            const history = this.get(CONFIG.STORAGE_KEY, {});
            history[seriesId] = {
                seriesId,
                episodeNum,
                timestamp,
                title,
                lastWatched: new Date().toISOString()
            };
            this.set(CONFIG.STORAGE_KEY, history);
            Logger.log('Watch history saved:', history[seriesId]);
        },
        getWatchHistory: function(seriesId) {
            const history = this.get(CONFIG.STORAGE_KEY, {});
            return history[seriesId] || null;
        }
    };

    // ====== Player Control ======
    const PlayerControl = {
        getCurrentEpisode: function() {
            const url = new URL(window.location.href);
            return parseInt(url.searchParams.get('ep')) || 1;
        },
        getSeriesId: function() {
            const url = new URL(window.location.href);
            return url.searchParams.get('series_id');
        },
        getVideoElement: function() {
            return document.querySelector('video');
        },
        getPlyrInstance: function() {
            const video = this.getVideoElement();
            return video?.plyr || null;
        },
        getCurrentTime: function() {
            const plyr = this.getPlyrInstance();
            return plyr?.currentTime || 0;
        },
        setCurrentTime: function(time) {
            const plyr = this.getPlyrInstance();
            if (plyr) {
                plyr.currentTime = time;
            }
        },
        getDuration: function() {
            const plyr = this.getPlyrInstance();
            return plyr?.duration || 0;
        },
        isPlaying: function() {
            const plyr = this.getPlyrInstance();
            return plyr?.playing || false;
        },
        play: function() {
            const plyr = this.getPlyrInstance();
            if (plyr) plyr.play();
        },
        pause: function() {
            const plyr = this.getPlyrInstance();
            if (plyr) plyr.pause();
        }
    };

    // ====== Video List Management ======
    const VideoListManager = {
        getAllVideos: function() {
            return window.__stay_video_list || [];
        },
        getCurrentVideo: function() {
            const videos = this.getAllVideos();
            return videos[0] || null;
        },
        getNextEpisodeUrl: function() {
            const currentEp = PlayerControl.getCurrentEpisode();
            const seriesId = PlayerControl.getSeriesId();
            return `https://rongyok.com/watch/?series_id=${seriesId}&ep=${currentEp + 1}`;
        },
        loadNextEpisode: function() {
            const nextUrl = this.getNextEpisodeUrl();
            Logger.log('Loading next episode:', nextUrl);
            window.location.href = nextUrl;
        }
    };

    // ====== Auto-Save Management ======
    const AutoSave = {
        saveInterval: null,
        start: function() {
            if (this.saveInterval) clearInterval(this.saveInterval);
            
            this.saveInterval = setInterval(() => {
                const seriesId = PlayerControl.getSeriesId();
                const episodeNum = PlayerControl.getCurrentEpisode();
                const currentTime = PlayerControl.getCurrentTime();
                const plyr = PlayerControl.getPlyrInstance();
                const title = plyr?.config?.title || 'Unknown';

                if (currentTime > 0) {
                    Storage.addWatchHistory(seriesId, episodeNum, currentTime, title);
                    Logger.log(`Auto-saved: EP${episodeNum} @ ${currentTime.toFixed(2)}s`);
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);
        },
        stop: function() {
            if (this.saveInterval) {
                clearInterval(this.saveInterval);
                this.saveInterval = null;
            }
        }
    };

    // ====== UI Enhancements ======
    const UIEnhancer = {
        createControlButton: function(text, onClick) {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.cssText = `
                padding: 8px 16px;
                background: #4b4b4b;
                color: #fff;
                border: 1px solid #666;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin: 0 4px;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => btn.style.background = '#666';
            btn.onmouseout = () => btn.style.background = '#4b4b4b';
            btn.onclick = onClick;
            return btn;
        },
        addInfoDisplay: function() {
            let infoBox = document.getElementById('rongyok-info-box');
            if (!infoBox) {
                infoBox = document.createElement('div');
                infoBox.id = 'rongyok-info-box';
                infoBox.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 12px 16px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 10000;
                    max-width: 300px;
                `;
                document.body.appendChild(infoBox);
            }
            
            const currentTime = PlayerControl.getCurrentTime();
            const duration = PlayerControl.getDuration();
            const ep = PlayerControl.getCurrentEpisode();
            
            infoBox.textContent = `EP${ep} | ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s | Auto-saving...`;
        },
        updateProgressInfo: function() {
            setInterval(() => {
                this.addInfoDisplay();
            }, 1000);
        }
    };

    // ====== Video Event Listeners ======
    const VideoEventListener = {
        attachListeners: function() {
            const plyr = PlayerControl.getPlyrInstance();
            if (!plyr) {
                Logger.warn('Plyr instance not found, retrying...');
                setTimeout(() => this.attachListeners(), 1000);
                return;
            }

            // Resume from last position
            const seriesId = PlayerControl.getSeriesId();
            const history = Storage.getWatchHistory(seriesId);
            if (history && history.episodeNum === PlayerControl.getCurrentEpisode()) {
                Logger.log('Resuming from:', history.timestamp);
                setTimeout(() => {
                    PlayerControl.setCurrentTime(history.timestamp);
                }, 500);
            }

            // Auto-play next episode on end
            plyr.on('ended', () => {
                Logger.log('Video ended');
                if (CONFIG.AUTO_PLAY_NEXT) {
                    Logger.log('Auto-playing next episode...');
                    setTimeout(() => {
                        VideoListManager.loadNextEpisode();
                    }, 2000);
                }
            });

            // Save on pause
            plyr.on('pause', () => {
                const currentTime = PlayerControl.getCurrentTime();
                Logger.log('Video paused at:', currentTime);
                Storage.addWatchHistory(
                    seriesId,
                    PlayerControl.getCurrentEpisode(),
                    currentTime,
                    document.title
                );
            });

            // Start auto-save
            AutoSave.start();
            UIEnhancer.updateProgressInfo();

            Logger.log('Video listeners attached');
        }
    };

    // ====== Initialization ======
    const init = function() {
        Logger.log('Initializing Rongyok Video Player Pro...');

        // Wait for video element to be available
        const waitForVideo = setInterval(() => {
            const video = PlayerControl.getVideoElement();
            const plyr = PlayerControl.getPlyrInstance();

            if (video && plyr) {
                clearInterval(waitForVideo);
                Logger.log('Video and Plyr found');
                VideoEventListener.attachListeners();
                UIEnhancer.addInfoDisplay();
            }
        }, 500);

        // Timeout after 30 seconds
        setTimeout(() => clearInterval(waitForVideo), 30000);
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        AutoSave.stop();
        Logger.log('Player cleaned up');
    });
})();
