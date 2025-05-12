document.getElementById('toggleMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('header').classList.toggle('dark-mode');
  document.querySelector('button').classList.toggle('dark-mode');
});
