// js/player.js — player overlay controls

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('playerOverlay');
  const video = document.getElementById('playerVideo');
  const closeBtn = document.getElementById('playerClose');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const pipBtn = document.getElementById('pipBtn');

  if (!overlay || !video) return;

  // Close overlay
  closeBtn?.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  // Download
  downloadBtn?.addEventListener('click', () => {
    const src = video.src;
    if (!src) return alert('No video to download.');
    const a = document.createElement('a');
    a.href = src;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Share (Web Share API fallback)
  shareBtn?.addEventListener('click', async () => {
    const src = video.src;
    if (!src) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text: video.title || '', url: src });
      } catch (err) {
        console.warn('Share failed', err);
      }
    } else {
      // fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(src);
        alert('Video URL copied to clipboard');
      } catch {
        prompt('Copy the URL', src);
      }
    }
  });

  // Picture-in-Picture
  pipBtn?.addEventListener('click', async () => {
    try {
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (err) {
      console.warn('PIP failed', err);
    }
  });

  function closeOverlay() {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    video.pause();
    video.src = '';
  }
});
