// Example: Speed Control
const videoElements = document.querySelectorAll('video');
videoElements.forEach(video => {
  video.addEventListener('mouseenter', () => {
    video.playbackRate = 1.25;
  });
  video.addEventListener('mouseleave', () => {
    video.playbackRate = 1;
  });
});
