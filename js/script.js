// js/script.js

// Use your own server-side proxy.
// For Vercel, create: /api/search.js
const API_PROXY = '/api/search';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const heroSearch = document.getElementById('heroSearch');
  const clearBtn = document.getElementById('clearSearch');
  const searchInput = document.getElementById('search');
  const result = document.getElementById('result');
  const emptyState = document.getElementById('emptyState');
  const status = document.getElementById('status');
  const liveRegion = document.getElementById('liveRegion');

  if (!searchForm || !searchInput || !result) {
    console.error('Required HTML elements are missing.');
    return;
  }

  // Search
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const keyword = searchInput.value.trim();

    if (keyword) {
      await searchTikTok(keyword);
    }
  });

  // Hero search button
  if (heroSearch) {
    heroSearch.addEventListener('click', () => {
      searchInput.focus();
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.hidden = true;
      result.innerHTML = '';
      if (emptyState) emptyState.hidden = true;
      if (status) status.textContent = '';
      if (liveRegion) liveRegion.textContent = '';
      searchInput.focus();
    });
  }

  // Clear button visibility
  searchInput.addEventListener('input', () => {
    if (clearBtn) {
      clearBtn.hidden = !searchInput.value.trim();
    }
  });

  // Current year
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});


async function searchTikTok(keyword) {
  const result = document.getElementById('result');
  const emptyState = document.getElementById('emptyState');
  const status = document.getElementById('status');
  const liveRegion = document.getElementById('liveRegion');

  if (!keyword) {
    if (status) status.textContent = 'Please enter a keyword.';
    if (liveRegion) liveRegion.textContent = 'Please enter a keyword.';
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  result.innerHTML = '';

  if (status) {
    status.textContent = `Searching for "${keyword}"...`;
  }

  if (liveRegion) {
    liveRegion.textContent = 'Searching';
  }

  // Loading UI
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = `Searching for "${keyword}"...`;
  result.appendChild(loading);

  const payload = {
    keywords: keyword,
    count: 10,
    region: 'ne'
  };

  try {
    const response = await fetch(API_PROXY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Read response as text first.
    // This prevents JSON parsing errors from hiding the real problem.
    const responseText = await response.text();

    console.log('Proxy status:', response.status);
    console.log('Proxy response:', responseText);

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}: ${responseText.slice(0, 300)}`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Server returned invalid JSON.');
    }

    // Handle different possible response structures
    let videos = [];

    if (Array.isArray(data?.data?.videos)) {
      videos = data.data.videos;
    } else if (Array.isArray(data?.videos)) {
      videos = data.videos;
    } else if (Array.isArray(data?.data)) {
      videos = data.data;
    }

    console.log('Videos found:', videos);

    if (!videos.length) {
      result.innerHTML = '';

      if (emptyState) {
        emptyState.hidden = false;
      }

      if (status) {
        status.textContent = `No videos found for "${keyword}".`;
      }

      if (liveRegion) {
        liveRegion.textContent = 'No videos found.';
      }

      return;
    }

    result.innerHTML = '';

    if (status) {
      status.textContent =
        `Showing ${videos.length} results for "${keyword}"`;
    }

    if (liveRegion) {
      liveRegion.textContent =
        `Found ${videos.length} results`;
    }

    const fragment = document.createDocumentFragment();

    videos.forEach((video, index) => {
      const item = createVideoItem(video, index);
      fragment.appendChild(item);
    });

    result.appendChild(fragment);

  } catch (error) {
    console.error('Search error:', error);

    result.innerHTML = '';

    const errorBox = document.createElement('div');
    errorBox.className = 'error-hint';

    errorBox.textContent =
      `Failed to fetch videos: ${error.message}`;

    result.appendChild(errorBox);

    if (status) {
      status.textContent = 'Failed to fetch videos.';
    }

    if (liveRegion) {
      liveRegion.textContent = 'Failed to fetch videos.';
    }
  }
}


function createVideoItem(video, index) {
  const item = document.createElement('article');
  item.className = 'video-item';

  // --------------------------------
  // TITLE
  // --------------------------------

  const title = document.createElement('h3');

  const titleText =
    video.title ||
    video.desc ||
    video.description ||
    `TikTok Video ${index + 1}`;

  title.textContent = titleText;

  item.appendChild(title);


  // --------------------------------
  // VIDEO URL
  // --------------------------------

  const videoUrl =
    video.play ||
    video.play_url ||
    video.playUrl ||
    video.video ||
    video.video_url ||
    video.videoUrl ||
    video.url ||
    '';


  // --------------------------------
  // THUMBNAIL
  // --------------------------------

  const thumb = document.createElement('button');

  thumb.type = 'button';
  thumb.className = 'video-thumb';

  thumb.setAttribute(
    'aria-label',
    `Play ${titleText}`
  );

  if (videoUrl) {
    thumb.dataset.play = videoUrl;
  }

  const thumbnailUrl =
    video.cover ||
    video.cover_url ||
    video.coverUrl ||
    video.thumbnail ||
    video.thumbnail_url ||
    '';


  if (thumbnailUrl) {
    const img = document.createElement('img');

    img.src = thumbnailUrl;
    img.alt = titleText;
    img.loading = 'lazy';

    img.onerror = () => {
      img.remove();
      thumb.textContent = '▶ Play Video';
    };

    thumb.appendChild(img);

  } else {
    thumb.textContent = '▶ Play Video';
  }


  // --------------------------------
  // CLICK PLAYER
  // --------------------------------

  thumb.addEventListener('click', () => {

    if (!videoUrl) {
      alert('No playable video URL was returned by the API.');
      return;
    }

    openPlayer(videoUrl, titleText);
  });

  item.appendChild(thumb);


  // --------------------------------
  // AUTHOR
  // --------------------------------

  const meta = document.createElement('p');

  meta.className = 'meta';

  const author =
    video.author?.nickname ||
    video.author?.unique_id ||
    video.author?.uniqueId ||
    video.nickname ||
    video.unique_id ||
    'Unknown';


  const likes =
    video.digg_count ??
    video.diggCount ??
    video.likes ??
    0;


  const comments =
    video.comment_count ??
    video.commentCount ??
    video.comments ??
    0;


  meta.textContent =
    `@${author}  •  ❤️ ${likes}  •  💬 ${comments}`;

  item.appendChild(meta);

  return item;
}


// ========================================
// PLAYER
// ========================================

function openPlayer(src, title = '') {

  const overlay =
    document.getElementById('playerOverlay');

  const videoEl =
    document.getElementById('playerVideo');

  const playerTitle =
    document.querySelector('.player-inner .player-title');


  if (!overlay || !videoEl) {
    alert('Player not available on this page.');
    return;
  }


  if (playerTitle) {
    playerTitle.textContent = title;
  }


  videoEl.pause();

  videoEl.src = src;

  videoEl.load();

  overlay.hidden = false;

  overlay.setAttribute(
    'aria-hidden',
    'false'
  );


  videoEl.play().catch(() => {
    // Browser blocked autoplay.
    // User can press play.
  });
}


// ========================================
// CLOSE PLAYER
// ========================================

function closePlayer() {

  const overlay =
    document.getElementById('playerOverlay');

  const videoEl =
    document.getElementById('playerVideo');


  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
  }


  if (overlay) {
    overlay.hidden = true;

    overlay.setAttribute(
      'aria-hidden',
      'true'
    );
  }
}


// ========================================
// PLAYER BUTTONS
// ========================================

document.addEventListener('click', (event) => {

  const target = event.target;

  if (
    target.matches('#closePlayer') ||
    target.matches('.player-close')
  ) {
    closePlayer();
  }

});


// ESCAPE CLOSE
document.addEventListener('keydown', (event) => {

  if (event.key === 'Escape') {

    const overlay =
      document.getElementById('playerOverlay');

    if (overlay && !overlay.hidden) {
      closePlayer();
    }
  }

});
