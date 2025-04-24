async function searchTikTok() {
  const keyword = document.getElementById("keyword").value.trim();
  const result = document.getElementById("result");
  result.innerHTML = "Searching...";

  if (!keyword) {
    result.innerHTML = "Please enter keywords.";
    return;
  }

  const payload = {
    keywords: keyword,
    count: 10000, // Request 5 videos
    hd: 1,
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
    `).join(""); // Join to combine all video items into a single string of HTML

  } catch (error) {
    result.innerHTML = "Failed to fetch videos.";
    console.error(error);
  }
}
