const App = {
  videoList: [],
  player: null,

  async init() {
    console.log('[App] Initializing Rongyok Web Player v2');
    this._registerSW();
    this.player = new RongyokPlayer();
    await this.loadList();
  },

  _registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  },

  async loadList() {
    const listEl = document.getElementById('video-list');
    listEl.innerHTML = '<div class="loading">🔄 กำลังโหลดรายการจาก rongyok.com...</div>';
    try {
      this.videoList = await Proxy.getHomeList();
      this._renderList();
    } catch (err) {
      console.error('[App] Error loading list:', err);
      listEl.innerHTML = '<div class="loading">❌ ไม่สามารถโหลดรายการได้</div>';
    }
  },

  _renderList() {
    const listEl = document.getElementById('video-list');
    listEl.innerHTML = '';
    if (this.videoList.length === 0) {
      listEl.innerHTML = '<div class="loading">ไม่พบรายการวิดีโอ</div>';
      return;
    }
    this.videoList.forEach(v => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.dataset.id = v.id;
      div.dataset.path = v.path;
      div.dataset.title = v.title;
      div.innerHTML = `
        <h4>${v.title}</h4>
        <p>🎬 MP4 • กดเพื่อเล่น</p>
      `;
      div.onclick = () => this.play(v);
      listEl.appendChild(div);
    });
  },

  async play(video) {
    console.log('[App] Playing:', video);
    const listEl = document.getElementById('video-list');
    
    // แสดง loading
    listEl.innerHTML = '<div class="loading">⏳ กำลังดึง MP4 จาก rongyok.com...</div>';

    const res = await Proxy.getVideoSources(video.path);
    
    if (!res.success || res.links.length === 0) {
      listEl.innerHTML = '<div class="loading">❌ ไม่พบลิงก์วิดีโอ</div>';
      return;
    }

    // ค้นหา MP4 ก่อน (ลำดับความสำคัญ)
    let videoLink = res.links.find(l => l.type === 'mp4' && l.hasToken);
    if (!videoLink) {
      videoLink = res.links.find(l => l.type === 'mp4');
    }
    if (!videoLink) {
      videoLink = res.links[0];
    }

    console.log('[App] Selected link:', videoLink);
    
    // ส่งไปเล่นใน fullscreen player
    this.player.loadVideoFullscreen(
      videoLink.url,
      video.id,
      video.title,
      videoLink.type
    );

    // กลับไปแสดงรายการ หลังจากปิด player
  }
};

window.addEventListener('load', () => App.init());
window.App = App;
