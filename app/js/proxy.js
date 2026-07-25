const Proxy = {
  PROXIES: [
    'https://corsproxy.io/?url=',
    'https://api.allorigins.win/raw?url='
  ],
  BASE_URL: 'https://rongyok.com',
  VIDEO_PATTERNS: [
    /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/gi,
    /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/gi
  ],
  TOKEN_PARAMS: ['token', 'expires', 't', 'e', 'auth'],

  async fetchHtml(url) {
    for (const proxy of this.PROXIES) {
      try {
        const res = await fetch(proxy + encodeURIComponent(url), {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(10000)
        });
        if (res.ok) return res.text();
      } catch (e) {
        console.error('[Proxy] Fetch error:', e);
      }
    }
    throw new Error('ไม่สามารถดึงข้อมูลได้');
  },

  extractVideoLinks(html) {
    const links = new Set();
    for (const pattern of this.VIDEO_PATTERNS) {
      const matches = html.match(pattern) || [];
      matches.forEach(url => {
        const hasToken = this.TOKEN_PARAMS.some(p => url.includes(`${p}=`));
        links.add(JSON.stringify({
          url,
          type: url.includes('.m3u8') ? 'hls' : 'mp4',
          hasToken
        }));
      });
    }
    return Array.from(links).map(s => JSON.parse(s));
  },

  async getHomeList() {
    try {
      const html = await this.fetchHtml(this.BASE_URL);
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return [...temp.querySelectorAll('a[href*="/watch"]')]
        .map(a => ({
          id: a.href.split('/').filter(Boolean).pop() || Math.random(),
          title: a.textContent.trim() || 'ไม่มีชื่อ',
          path: a.getAttribute('href').startsWith('/') ? a.getAttribute('href') : `/${a.getAttribute('href')}`
        }))
        .filter(i => i.id && i.title)
        .slice(0, 50); // จำกัด 50 รายการ
    } catch (e) {
      console.error('[Proxy] Error:', e);
      return [];
    }
  },

  async getVideoSources(path) {
    try {
      const html = await this.fetchHtml(this.BASE_URL + path);
      const links = this.extractVideoLinks(html);
      return { success: links.length > 0, links };
    } catch (e) {
      console.error('[Proxy] Error:', e);
      return { success: false, links: [] };
    }
  }
};
