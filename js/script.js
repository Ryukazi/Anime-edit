// js/script.js — improved wiring/UX and safe rendering

// === CONFIG ===
// If you run a server-side proxy (recommended), set API_PROXY to its URL (e.g. 'https://your-domain.com/api/search')
// If empty, the code will attempt to call tikwm directly (may fail due to CORS).
const API_PROXY = ''; // set this to a proxy URL if available

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const heroSearch = document.getElementById('heroSearch');
  const clearBtn = document.getElementById('clearSearch');
  const searchInput = document.getElementById('search');
  const result = document.getElementById('result');
  const emptyState = document.getElementById('emptyState');
  const status = document.getElementById('status');
  const liveRegion = document.getElementById('liveRegion');

  // Wire form submit
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await searchTikTok(searchInput.value.trim());
  });

  // Hero CTA button focuses the input (then users can press Enter) or triggers quick search
  heroSearch.addEventListener('click', () => {
    searchInput.focus();
    // Optionally trigger a default quick search:
    // searchInput.value = 'anime'; searchForm.requestSubmit();
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.hidden = true;
    result.innerHTML = '';
    emptyState.hidden = true;
    status.textContent = '';
  });

  // Show/hide clear button based on input
  searchInput.addEventListener('input', () => {
    clearBtn.hidden = !searchInput.value.trim();
  });

  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // If you want a sample quick search on load, uncomment:
  // searchInput.value = 'anime'; searchForm.requestSubmit();
});

async function searchTikTok(keyword) {
  const result = document.getElementById('result');
  const emptyState = document.getElementById('emptyState');
  const status = document.getElementById('status');
  const liveRegion = document.getElementById('liveRegion');

  emptyState.hidden = true;
  result.innerHTML = '';
  status.textContent = '';
  liveRegion.textContent = 'Searching';

  if (!keyword) {
    status.textContent = 'Please enter a keyword.';
    liveRegion.textContent = 'Please enter a keyword.';
    return;
  }

  // show loading
  result.innerHTML = `<div class="loading">Searching for “${escapeHtml(keyword)}”…</div>`;

  const payload = {
    keywords: keyword,
    count: 10,
    region: 'ne'
  };

  // choose endpoint: proxy (recommended) or direct
  const endpoint = API_PROXY || 'https://tikwm.com/api/feed/search';

  try {
    const fetchOptions = API_PROXY
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), mode: 'cors' };

    const res = await fetch(endpoint, fetchOptions);

    if (!res.ok) {
      throw new Error(`Network response was not ok (${res.status})`);
    }

    const data = await res.json();

    // The API's structure may vary — make this robust
    const videos = (data && data.data && data.data.videos) || (data && data.videos) || [];

    if (!videos.length) {
      result.innerHTML = '';
      emptyState.hidden = false;
      status.textContent = 'No videos found.';
      liveRegion.textContent = 'No videos found';
      return;
    }

    status.textContent = `Showing ${videos.length} results for "${keyword}"`;
    liveRegion.textContent = `Found ${videos.length} results`;

    // Render results — build DOM nodes (safer than innerHTML)
    const fragment = document.createDocumentFragment();

    videos.forEach(video => {
      const item = document.createElement('article');
      item.className = 'video-item';

      // Title
      const title = document.createElement('h3');
      title.textContent = video.title || (video.desc || 'Untitled');
      item.appendChild(title);

      // Thumbnail or small preview: prefer video.cover or video.cover_thumb if present
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'video-thumb';
      thumb.setAttribute('aria-label', `Open video ${title.textContent}`);
      thumb.dataset.play = video.play || video.video || video.url || '';
      // show a poster if available
      if (video.cover) {
        const img = document.createElement('img');
        img.src = video.cover;
        img.alt = title.textContent;
        thumb.appendChild(img);
      } else {
        thumb.textContent = 'Play preview';
      }
      item.appendChild(thumb);

      // Meta
      const meta = document.createElement('p');
      meta.className = 'meta';
      const author = video.author && (video.author.nickname || video.author.unique_id) ? (video.author.nickname || video.author.unique_id) : 'Unknown';
      meta.textContent = `Author: ${author} — ❤️ ${video.digg_count || 0} • 💬 ${video.comment_count || 0}`;
      item.appendChild(meta);

      fragment.appendChild(item);

      // Click to open overlay player
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.play;
        if (!src) {
          alert('No playable URL available for this video.');
          return;
        }
        openPlayer(src, title.textContent);
      });
    });

    result.innerHTML = '';
    result.appendChild(fragment);

  } catch (err) {
    console.error(err);
    result.innerHTML = '';
    document.getElementById('status').textContent = 'Failed to fetch videos. See console for details.';
    liveRegion.textContent = 'Failed to fetch videos';
    // If likely a CORS error, give a hint:
    if (err.message && err.message.toLowerCase().includes('network')) {
      const hint = document.createElement('div');
      hint.className = 'error-hint';
      hint.innerHTML = 'This may be due to CORS. Run a server-side proxy or set API_PROXY in js/script.js.';
      document.getElementById('result').appendChild(hint);
    }
  }
}

// Utility: set up and open the player overlay (player.js will hook into this)
function openPlayer(src, title = '') {
  // Player overlay exists in index.html with id=playerOverlay and video id=playerVideo
  const overlay = document.getElementById('playerOverlay');
  const videoEl = document.getElementById('playerVideo');
  const playerTitle = document.querySelector('.player-inner .player-title');

  if (!overlay || !videoEl) {
    alert('Player not available on this page.');
    return;
  }

  videoEl.src = src;
  videoEl.title = title;
  videoEl.currentTime = 0;
  videoEl.play().catch(() => { /* autoplay may be blocked; user can press play */ });

  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.focus?.();
}

// Small helper to avoid basic HTML injection in text nodes
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
