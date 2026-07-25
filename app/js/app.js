const App = {
  videoList: [],
  player: null,
  currentTab: 'home',

  async init() {
    console.log('[App] Initializing Rongyok Player v4');
    this.player = new RongyokPlayer();
    this._setupEventListeners();
    await this.loadList();
  },

  _setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.tab;
        document.getElementById(`${tab}-tab`).classList.add('active');
        this.currentTab = tab;
        
        if (tab === 'history') this.renderHistory();
        if (tab === 'bookmarks') this.renderBookmarks();
      });
    });

    // Search
    document.getElementById('search-input').addEventListener('input', e => {
      this.filterVideos(e.target.value);
    });

    // Refresh
    document.getElementById('refresh-btn').addEventListener('click', async () => {
      const btn = document.getElementById('refresh-btn');
      btn.classList.add('loading');
      await this.loadList();
      btn.classList.remove('loading');
    });

    // Clear buttons
    document.getElementById('clear-history-btn').addEventListener('click', () => {
      if (confirm('ลบประวัติการดูทั้งหมด?')) {
        Storage.clearHistory();
        this.renderHistory();
      }
    });

    document.getElementById('clear-bookmarks-btn').addEventListener('click', () => {
      if (confirm('ลบที่คั่นทั้งหมด?')) {
        Storage.clearBookmarks();
        this.renderBookmarks();
      }
    });
  },

  async loadList() {
    const listEl = document.getElementById('video-list');
    listEl.innerHTML = '<div class="loading">⏳ กำลังโหลดรายการ...</div>';
    try {
      this.videoList = await Proxy.getHomeList();
      this.renderVideos(this.videoList);
    } catch (err) {
      console.error('[App] Error:', err);
      listEl.innerHTML = '<div class="loading">❌ ไม่สามารถโหลดรายการได้</div>';
    }
  },

  renderVideos(videos) {
    const listEl = document.getElementById('video-list');
    listEl.innerHTML = '';
    
    if (videos.length === 0) {
      listEl.innerHTML = '<div class="empty-state">ไม่พบรายการวิดีโอ</div>';
      return;
    }

    videos.forEach(v => {
      const progress = Storage.getProgress(v.id);
      const isBookmarked = Storage.isBookmarked(v.id);
      
      const card = document.createElement('div');
      card.className = 'video-card';
      
      const thumb = document.createElement('div');
      thumb.className = 'video-card-thumb';
      thumb.textContent = '🎬';
      
      const content = document.createElement('div');
      content.className = 'video-card-content';
      
      const title = document.createElement('div');
      title.className = 'video-card-title';
      title.textContent = v.title;
      
      const meta = document.createElement('div');
      meta.className = 'video-card-meta';
      meta.textContent = '🎞️ MP4';
      
      if (progress) {
        const progressPercent = (progress.time / progress.duration * 100).toFixed(0);
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = progressPercent + '%';
        progressBar.appendChild(fill);
        meta.appendChild(progressBar);
        meta.innerHTML = `🎞️ MP4 • ${progressPercent}%<br>` + meta.innerHTML;
      }
      
      const actions = document.createElement('div');
      actions.className = 'video-card-actions';
      
      const playBtn = document.createElement('button');
      playBtn.className = 'action-btn';
      playBtn.textContent = '▶️ เล่น';
      playBtn.onclick = (e) => {
        e.stopPropagation();
        this.playVideo(v);
      };
      
      const bookmarkBtn = document.createElement('button');
      bookmarkBtn.className = 'action-btn' + (isBookmarked ? ' bookmarked' : '');
      bookmarkBtn.textContent = isBookmarked ? '⭐ บันทึก' : '☆ บันทึก';
      bookmarkBtn.onclick = (e) => {
        e.stopPropagation();
        this.toggleBookmark(v, bookmarkBtn);
      };
      
      actions.appendChild(playBtn);
      actions.appendChild(bookmarkBtn);
      
      content.appendChild(title);
      content.appendChild(meta);
      content.appendChild(actions);
      
      card.appendChild(thumb);
      card.appendChild(content);
      card.onclick = () => this.playVideo(v);
      
      listEl.appendChild(card);
    });
  },

  renderHistory() {
    const history = Storage.getHistory();
    const historyEl = document.getElementById('history-list');
    
    if (history.length === 0) {
      historyEl.innerHTML = '<div class="empty-state">ยังไม่มีประวัติการดู</div>';
      return;
    }

    historyEl.innerHTML = '';
    history.forEach(v => {
      const card = this._createVideoCard(v, true);
      historyEl.appendChild(card);
    });
  },

  renderBookmarks() {
    const bookmarks = Storage.getBookmarks();
    const bookmarksEl = document.getElementById('bookmarks-list');
    
    if (bookmarks.length === 0) {
      bookmarksEl.innerHTML = '<div class="empty-state">ยังไม่มีที่คั่น</div>';
      return;
    }

    bookmarksEl.innerHTML = '';
    bookmarks.forEach(v => {
      const card = this._createVideoCard(v, false);
      bookmarksEl.appendChild(card);
    });
  },

  _createVideoCard(v, isHistory) {
    const progress = Storage.getProgress(v.id);
    const isBookmarked = Storage.isBookmarked(v.id);
    
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const thumb = document.createElement('div');
    thumb.className = 'video-card-thumb';
    thumb.textContent = '🎬';
    
    const content = document.createElement('div');
    content.className = 'video-card-content';
    
    const title = document.createElement('div');
    title.className = 'video-card-title';
    title.textContent = v.title;
    
    const meta = document.createElement('div');
    meta.className = 'video-card-meta';
    
    if (progress) {
      const progressPercent = (progress.time / progress.duration * 100).toFixed(0);
      meta.textContent = `🎞️ ${progressPercent}% • ${new Date(v.timestamp).toLocaleDateString('th-TH')}`;
    } else {
      meta.textContent = new Date(v.timestamp).toLocaleDateString('th-TH');
    }
    
    const actions = document.createElement('div');
    actions.className = 'video-card-actions';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'action-btn';
    playBtn.textContent = '▶️ เล่น';
    playBtn.onclick = (e) => {
      e.stopPropagation();
      this.playVideo(v);
    };
    
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'action-btn' + (isBookmarked ? ' bookmarked' : '');
    bookmarkBtn.textContent = isBookmarked ? '⭐ บันทึก' : '☆ บันทึก';
    bookmarkBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleBookmark(v, bookmarkBtn);
    };
    
    actions.appendChild(playBtn);
    actions.appendChild(bookmarkBtn);
    
    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(actions);
    
    card.appendChild(thumb);
    card.appendChild(content);
    card.onclick = () => this.playVideo(v);
    
    return card;
  },

  filterVideos(query) {
    const filtered = this.videoList.filter(v => 
      v.title.toLowerCase().includes(query.toLowerCase())
    );
    this.renderVideos(filtered);
  },

  async playVideo(video) {
    console.log('[App] Playing:', video);
    const listEl = document.getElementById('video-list');
    const originalContent = listEl.innerHTML;
    listEl.innerHTML = '<div class="loading">⏳ กำลังดึง MP4...</div>';

    const res = await Proxy.getVideoSources(video.path);
    
    if (!res.success || res.links.length === 0) {
      listEl.innerHTML = originalContent;
      alert('❌ ไม่พบลิงก์วิดีโอ');
      return;
    }

    let videoLink = res.links.find(l => l.type === 'mp4' && l.hasToken);
    if (!videoLink) videoLink = res.links.find(l => l.type === 'mp4');
    if (!videoLink) videoLink = res.links[0];

    listEl.innerHTML = originalContent;

    Storage.addHistory(video);
    this.player.loadVideoFullscreen(
      videoLink.url,
      video.id,
      video.title,
      videoLink.type
    );
  },

  toggleBookmark(video, btn) {
    if (Storage.isBookmarked(video.id)) {
      Storage.removeBookmark(video.id);
      btn.classList.remove('bookmarked');
      btn.textContent = '☆ บันทึก';
    } else {
      Storage.addBookmark(video);
      btn.classList.add('bookmarked');
      btn.textContent = '⭐ บันทึก';
    }
  }
};

window.addEventListener('load', () => App.init());
