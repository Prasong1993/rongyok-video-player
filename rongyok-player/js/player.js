class RongyokPlayer {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('player-container');
    this.videoEl = options.videoElement || document.getElementById('video-element');
    this.videoId = null;
    this.videoTitle = null;
    this.pagePath = null;
    this.isFullscreen = false;
    this.autoSaveInterval = null;
    console.log('[RongyokPlayer] Initialized');
  }

  /**
   * เปิด Fullscreen Player
   */
  loadVideoFullscreen(videoUrl, videoId, videoTitle, videoType = 'mp4') {
    console.log('[RongyokPlayer] Loading fullscreen:', { videoUrl, videoId, videoTitle });
    
    this.videoId = videoId;
    this.videoTitle = videoTitle;

    // สร้าง Fullscreen UI
    this._createFullscreenUI(videoUrl, videoType);
    
    // บันทึกประวัติ
    Storage.addHistory({
      id: videoId,
      title: videoTitle,
      timestamp: Date.now()
    });

    this.isFullscreen = true;
  }

  /**
   * สร้าง Fullscreen Player UI
   */
  _createFullscreenUI(videoUrl, videoType) {
    // ลบ player เก่า ถ้ามี
    const oldPlayer = document.getElementById('rongyok-fullscreen-player');
    if (oldPlayer) oldPlayer.remove();

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

    // ===== HEADER =====
    const header = document.createElement('div');
    header.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
      padding: 16px 20px;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Prompt', sans-serif;
      z-index: 100001;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    // Title
    const title = document.createElement('h1');
    title.textContent = this.videoTitle || 'วิดีโอ';
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

    // Controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    // Fullscreen button
    const fsBtn = document.createElement('button');
    fsBtn.innerHTML = '⛶';
    fsBtn.style.cssText = `
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
    fsBtn.onmouseover = () => fsBtn.style.background = 'rgba(255,255,255,0.3)';
    fsBtn.onmouseout = () => fsBtn.style.background = 'rgba(255,255,255,0.2)';
    fsBtn.onclick = () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.error('FS error:', err));
      } else {
        document.exitFullscreen();
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
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(200,50,50,0.4)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
    closeBtn.onclick = () => this._closeFullscreen(container);
    controls.appendChild(closeBtn);

    header.appendChild(controls);
    container.appendChild(header);

    // ===== VIDEO WRAPPER =====
    const videoWrapper = document.createElement('div');
    videoWrapper.style.cssText = `
      width: 95%;
      max-width: 1400px;
      height: auto;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Video element
    const video = document.createElement('video');
    video.id = 'rongyok-fullscreen-video';
    video.style.cssText = `
      width: 100%;
      height: auto;
      display: block;
      background: #000;
    `;
    video.controls = true;
    video.autoplay = true;
    video.playsinline = true;
    video.webkit-playsinline = true;

    // Set source
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = videoType === 'mp4' ? 'video/mp4' : 'application/x-mpegURL';
    video.appendChild(source);

    videoWrapper.appendChild(video);
    container.appendChild(videoWrapper);

    // ===== BOTTOM INFO BAR =====
    const infoBar = document.createElement('div');
    infoBar.id = 'rongyok-info-bar';
    infoBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
      padding: 20px;
      color: #aaa;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      text-align: center;
      z-index: 100000;
    `;
    infoBar.textContent = '00:00 / 00:00';
    container.appendChild(infoBar);

    // เพิ่มเข้า DOM
    document.body.appendChild(container);

    // ===== UPDATE TIME DISPLAY =====
    setInterval(() => {
      if (video && infoBar) {
        const current = this._formatTime(video.currentTime);
        const duration = this._formatTime(video.duration);
        infoBar.textContent = `⏱️ ${current} / ${duration}`;
      }
    }, 500);

    // ===== AUTO-SAVE PROGRESS =====
    this._startAutoSave(video);

    // ===== RESTORE PROGRESS =====
    this._restoreProgress(video);

    // ===== SAVE ON PAUSE/ENDED =====
    video.addEventListener('pause', () => this._saveProgress(video));
    video.addEventListener('ended', () => this._saveProgress(video));
  }

  /**
   * เริ่ม auto-save
   */
  _startAutoSave(video) {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    
    this.autoSaveInterval = setInterval(() => {
      if (video && video.currentTime > 10) {
        Storage.saveProgress(this.videoId, video.currentTime, video.duration);
      }
    }, 5000); // save ทุก 5 วินาที
  }

  /**
   * บันทึกความคืบหน้า
   */
  _saveProgress(video) {
    if (video && this.videoId) {
      Storage.saveProgress(this.videoId, video.currentTime, video.duration);
      console.log('[RongyokPlayer] Progress saved:', {
        id: this.videoId,
        time: video.currentTime.toFixed(1),
        duration: video.duration.toFixed(1)
      });
    }
  }

  /**
   * กู้คืนความคืบหน้า
   */
  _restoreProgress(video) {
    const saved = Storage.getProgress(this.videoId);
    if (saved && saved.time > 0) {
      video.addEventListener('canplay', () => {
        video.currentTime = saved.time;
        console.log('[RongyokPlayer] Restored progress:', saved.time);
      }, { once: true });
    }
  }

  /**
   * ปิด fullscreen
   */
  _closeFullscreen(container) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    container.remove();
    this.isFullscreen = false;
    console.log('[RongyokPlayer] Fullscreen closed');
  }

  /**
   * แปลงวินาทีเป็น MM:SS
   */
  _formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

window.RongyokPlayer = RongyokPlayer;
