class RongyokPlayer {
  constructor() {
    this.videoId = null;
    this.videoTitle = null;
  }

  loadVideoFullscreen(videoUrl, videoId, videoTitle, videoType = 'mp4') {
    console.log('[Player] Loading:', { videoUrl, videoId, videoTitle });
    
    this.videoId = videoId;
    this.videoTitle = videoTitle;
    this._createFullscreenUI(videoUrl, videoType);
  }

  _createFullscreenUI(videoUrl, videoType) {
    const oldPlayer = document.getElementById('rongyok-fullscreen-player');
    if (oldPlayer) oldPlayer.remove();

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
    title.textContent = this.videoTitle;
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
        container.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    };
    controls.appendChild(fsBtn);

    // Close Button
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
    closeBtn.onclick = () => this._closePlayer(container);
    controls.appendChild(closeBtn);

    header.appendChild(controls);
    container.appendChild(header);

    // Video
    const videoWrapper = document.createElement('div');
    videoWrapper.style.cssText = 'width: 95%; max-width: 1400px; height: auto;';

    const video = document.createElement('video');
    video.id = 'rongyok-fullscreen-video';
    video.style.cssText = 'width: 100%; height: auto; display: block; background: #000;';
    video.controls = true;
    video.autoplay = true;
    video.playsinline = true;

    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = videoType === 'mp4' ? 'video/mp4' : 'application/x-mpegURL';
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

    // Update time
    setInterval(() => {
      if (video && infoBar) {
        infoBar.textContent = `⏱️ ${this._formatTime(video.currentTime)} / ${this._formatTime(video.duration)}`;
      }
    }, 500);

    // Auto-save
    this._startAutoSave(video);
    this._restoreProgress(video);

    video.addEventListener('pause', () => this._saveProgress(video));
    video.addEventListener('ended', () => this._saveProgress(video));
  }

  _startAutoSave(video) {
    this._saveInterval = setInterval(() => {
      if (video && video.currentTime > 10) {
        this._saveProgress(video);
      }
    }, 5000);
  }

  _saveProgress(video) {
    if (video && this.videoId) {
      Storage.saveProgress(this.videoId, video.currentTime, video.duration);
    }
  }

  _restoreProgress(video) {
    const saved = Storage.getProgress(this.videoId);
    if (saved && saved.time > 10) {
      video.addEventListener('canplay', () => {
        video.currentTime = saved.time;
      }, { once: true });
    }
  }

  _formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  _closePlayer(container) {
    if (this._saveInterval) clearInterval(this._saveInterval);
    container.remove();
  }
}

window.RongyokPlayer = RongyokPlayer;
