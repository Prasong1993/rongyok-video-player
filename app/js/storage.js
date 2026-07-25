const Storage = {
  KEYS: {
    HISTORY: 'rongyok_history_v4',
    BOOKMARKS: 'rongyok_bookmarks_v4',
    PROGRESS: 'rongyok_progress_v4'
  },
  MAX_HISTORY: 100,
  MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 วัน

  _isExpired(ts) {
    return ts && (Date.now() - ts > this.MAX_AGE);
  },

  _getData(key) {
    try {
      const raw = localStorage.getItem(key);
      let data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) data = [];
      return data.filter(i => !this._isExpired(i.timestamp));
    } catch {
      return [];
    }
  },

  _setData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem(key);
      }
    }
  },

  // ===== HISTORY =====
  addHistory(video) {
    const list = this._getData(this.KEYS.HISTORY).filter(i => i.id !== video.id);
    list.unshift({
      ...video,
      timestamp: Date.now()
    });
    this._setData(this.KEYS.HISTORY, list.slice(0, this.MAX_HISTORY));
  },

  getHistory() {
    return this._getData(this.KEYS.HISTORY);
  },

  clearHistory() {
    localStorage.removeItem(this.KEYS.HISTORY);
  },

  // ===== BOOKMARKS =====
  addBookmark(video) {
    const list = this._getData(this.KEYS.BOOKMARKS);
    if (!list.find(i => i.id === video.id)) {
      list.unshift({ ...video, timestamp: Date.now() });
      this._setData(this.KEYS.BOOKMARKS, list);
    }
  },

  removeBookmark(videoId) {
    const list = this._getData(this.KEYS.BOOKMARKS).filter(i => i.id !== videoId);
    this._setData(this.KEYS.BOOKMARKS, list);
  },

  isBookmarked(videoId) {
    return this._getData(this.KEYS.BOOKMARKS).some(i => i.id === videoId);
  },

  getBookmarks() {
    return this._getData(this.KEYS.BOOKMARKS);
  },

  clearBookmarks() {
    localStorage.removeItem(this.KEYS.BOOKMARKS);
  },

  // ===== PROGRESS =====
  saveProgress(videoId, currentTime, duration) {
    if (!videoId || !duration || currentTime < 10) return;
    const list = this._getData(this.KEYS.PROGRESS).filter(i => i.id !== videoId);
    if (duration - currentTime > 10) {
      list.push({
        id: videoId,
        time: currentTime,
        duration,
        timestamp: Date.now()
      });
    }
    this._setData(this.KEYS.PROGRESS, list);
  },

  getProgress(videoId) {
    return this._getData(this.KEYS.PROGRESS).find(i => i.id === videoId) || null;
  },

  clearProgress() {
    localStorage.removeItem(this.KEYS.PROGRESS);
  }
};
