// ==UserScript==
// @name         Rongyok Auto Fullscreen Player
// @namespace    http://tampermonkey.net/
// @version      4.0.0
// @description  Auto-open fullscreen player when watching rongyok.com videos (MP4)
// @author       Prasong1993
// @match        https://rongyok.com/watch/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @icon         https://rongyok.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        STORAGE_KEY: 'rongyok_watch_history_v4',
        AUTO_SAVE_INTERVAL: 5000,
        DEBUG: true,
        MIN_WATCH_TIME: 10
    };

    const Logger = {
        log: (msg, data) => {
            console.log(`%c[Rongyok Auto FS]%c ${msg}`, 'color: #00d9ff; font-weight: bold', 'color: inherit', data || '');
        },
        error: (msg, data) => {
            console.error(`%c[Rongyok Auto FS]%c ${msg}`, 'color: #ff6b6b; font-weight: bold', 'color: inherit', data || '');
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
            let title = document.querySelector('h1')?.textContent || 
                       document.querySelector('[class*="title"]')?.textContent ||
                       document.querySelector('[class*="episode"]')?.textContent ||
                       document.title;
            
            return (title || 'วิดีโอ').trim().substring(0, 100);
        },

        extractMP4: function(html) {
            // ค้นหา MP4 ลิงก์จาก HTML
            const patterns = [
                /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/gi,
                /"src"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/gi,
                /'src'\s*:\s*'(https?:\/\/[^']+\.mp4[^']*)'/gi,
                /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/gi
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    return match[0].replace(/["']/g, '');
                }
            }

            return null;
        }
    };

    // ========== Proxy to Extract Video ==========
    const VideoExtractor = {
        PROXIES: [
            'https://corsproxy.io/?url=',
            'https://api.allorigins.win/raw?url='
        ],

        async fetchHtml(url) {
            for (const proxy of this.PROXIES) {
                try {
                    const res = await fetch(proxy + encodeURIComponent(url), {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    if (res.ok) return res.text();
                } catch (e) {
                    Logger.error('Proxy fetch error:', e);
                }
            }
            throw new Error('ไม่สามารถดึงข้อมูลได้');
        },

        async getMP4Url() {
            try {
                Logger.log('Extracting MP4 from page...');
                const html = await this.fetchHtml(window.location.href);
                const mp4Url = VideoDetector.extractMP4(html);
                
                if (mp4Url) {
                    Logger.log('✅ Found MP4:', mp4Url.substring(0, 80) + '...');
                    return mp4Url;
                }

                Logger.error('MP4 not found in page');
                return null;
            } catch (err) {
                Logger.error('Failed to extract MP4:', err);
                return null;
            }
        }
    };

    // ========== Fullscreen Player Creator ==========
    const FullscreenPlayer = {
        isActive: false,
        autoSaveInterval: null,
        clonedVideo: null,

        async activate() {
            if (this.isActive) return;

            Logger.log('Activating fullscreen player...');

            // ดึง MP4 URL
            const mp4Url = await VideoExtractor.getMP4Url();
            if (!mp4Url) {
                Logger.error('Failed to get MP4 URL');
                return;
            }

            this.createUI(mp4Url);
            this.isActive = true;
        },

        createUI(videoUrl) {
            const videoId = VideoDetector.getVideoId();
            const videoTitle = VideoDetector.getVideoTitle();

            Logger.log('Creating fullscreen UI', { videoId, videoTitle });

            // ลบ player เก่า ถ้ามี
            const oldPlayer = document.getElementById('rongyok-auto-fs-player');
            if (oldPlayer) oldPlayer.remove();

            // Container
            const container = document.createElement('div');
            container.id = 'rongyok-auto-fs-player';
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

            // Header
            const header = document.createElement('div');
            header.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
                padding: 16px 20px;
                color: #fff;
                z-index: 100001;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;

            const title = document.createElement('h1');
            title.textContent = videoTitle;
            title.style.cssText = `
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: calc(100% - 100px);
            `;
            header.appendChild(title);

            const controls = document.createElement('div');
            controls.style.cssText = 'display: flex; gap: 10px;';

            // FS Button
            const fsBtn = this.createButton('⛶');
            fsBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => Logger.error('FS error:', err));
                } else {
                    document.exitFullscreen();
                }
            };
            controls.appendChild(fsBtn);

            // Close Button
            const closeBtn = this.createButton('✕');
            closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(200,50,50,0.4)';
            closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.onclick = () => this.close(container);
            controls.appendChild(closeBtn);

            header.appendChild(controls);
            container.appendChild(header);

            // Video Wrapper
            const videoWrapper = document.createElement('div');
            videoWrapper.style.cssText = 'width: 95%; max-width: 1400px; height: auto;';

            const video = document.createElement('video');
            video.id = 'rongyok-auto-fs-video';
            video.style.cssText = 'width: 100%; height: auto; display: block; background: #000;';
            video.controls = true;
            video.autoplay = true;
            video.playsinline = true;

            const source = document.createElement('source');
            source.src = videoUrl;
            source.type = 'video/mp4';
            video.appendChild(source);

            videoWrapper.appendChild(video);
            container.appendChild(videoWrapper);

            // Info Bar
            const infoBar = document.createElement('div');
            infoBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
                padding: 20px;
                color: #aaa;
                font-size: 12px;
                font-family: monospace;
                text-align: center;
            `;
            infoBar.textContent = '00:00 / 00:00';
            container.appendChild(infoBar);

            document.body.appendChild(container);
            this.clonedVideo = video;

            // Update time display
            setInterval(() => {
                if (video && infoBar) {
                    infoBar.textContent = `⏱️ ${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
                }
            }, 500);

            // Auto-save
            this.startAutoSave(video, videoId);

            // Restore progress
            this.restoreProgress(video, videoId);

            // Save on pause/ended
            video.addEventListener('pause', () => this.saveProgress(video, videoId));
            video.addEventListener('ended', () => this.saveProgress(video, videoId));

            Logger.log('✅ Fullscreen player created');
        },

        createButton(text) {
            const btn = document.createElement('button');
            btn.innerHTML = text;
            btn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: #fff;
                width: 36px;
                height: 36px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.3)';
            btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.2)';
            return btn;
        },

        startAutoSave(video, videoId) {
            if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = setInterval(() => {
                if (video && video.currentTime > CONFIG.MIN_WATCH_TIME) {
                    this.saveProgress(video, videoId);
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);
        },

        saveProgress(video, videoId) {
            if (video && videoId) {
                Storage.saveVideoProgress(
                    videoId,
                    video.currentTime,
                    video.duration,
                    VideoDetector.getVideoTitle()
                );
            }
        },

        restoreProgress(video, videoId) {
            const saved = Storage.getVideoProgress(videoId);
            if (saved && saved.currentTime > CONFIG.MIN_WATCH_TIME) {
                video.addEventListener('canplay', () => {
                    video.currentTime = saved.currentTime;
                    Logger.log('Progress restored:', saved.currentTime);
                }, { once: true });
            }
        },

        formatTime(seconds) {
            if (isNaN(seconds)) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        close(container) {
            if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
            if (this.clonedVideo) {
                this.saveProgress(this.clonedVideo, VideoDetector.getVideoId());
            }
            container.remove();
            this.isActive = false;
            Logger.log('Fullscreen player closed');
        }
    };

    // ========== Initialization ==========
    async function init() {
        Logger.log('🚀 Rongyok Auto Fullscreen Player v4 activated');
        
        // รอสักครู่เพื่อให้หน้าโหลด
        await new Promise(resolve => setTimeout(resolve, 2000));

        // เปิด fullscreen player
        await FullscreenPlayer.activate();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (FullscreenPlayer.autoSaveInterval) {
            clearInterval(FullscreenPlayer.autoSaveInterval);
        }
    });

    Logger.log('✅ Script loaded and ready');
})();
