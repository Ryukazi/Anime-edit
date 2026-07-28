// js/darkMode.js — improved toggling and remember preference
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleMode');
  if (!toggle) return;

  const applyMode = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    document.querySelector('header')?.classList.toggle('dark-mode', isDark);
    document.querySelectorAll('button').forEach(b => b.classList.toggle('dark-mode', isDark));
    toggle.setAttribute('aria-pressed', String(isDark));
  };

  // load saved
  const saved = localStorage.getItem('animeEditDark');
  applyMode(saved === 'true');

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.querySelector('header')?.classList.toggle('dark-mode', isDark);
    document.querySelectorAll('button').forEach(b => b.classList.toggle('dark-mode', isDark));
    toggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('animeEditDark', String(isDark));
  });
});
