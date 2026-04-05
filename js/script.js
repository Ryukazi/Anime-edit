async function searchTikTok() {
  const keyword = document.getElementById("search").value.trim();
  const result = document.getElementById("result");
  result.innerHTML = "Searching...";

  if (!keyword) {
    result.innerHTML = "Please enter a keyword.";
    return;
  }

  const payload = {
    keywords: keyword,
    count: 10, // Request 5 videos
    region: 'ne'
  };

  try {
    const res = await fetch("https://tikwm.com/api/feed/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.code !== 0 || !data.data.videos.length) {
      result.innerHTML = "No videos found.";
      return;
    }

    const videos = data.data.videos;

    result.innerHTML = videos.map(video => `
      <div class="video-item">
        <h3>${video.title}</h3>
        <video controls src="${video.play}"></video>
        <p><strong>Author:</strong> ${video.author.nickname} (@${video.author.unique_id})</p>
        <p>❤️ ${video.digg_count} | 💬 ${video.comment_count} | 🔁 ${video.share_count} | ▶️ ${video.play_count}</p>
      </div>
    `).join("");

  } catch (error) {
    result.innerHTML = "Failed to fetch videos.";
    console.error(error);
  }
}
