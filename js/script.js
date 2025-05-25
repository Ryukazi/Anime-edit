"use client";

import { useState } from "react";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

export default function TikTokApp() {
  const [tab, setTab] = useState("home");
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchTikTok = async () => {
    setLoading(true);
    setMessage("Searching...");
    setVideos([]);

    if (!keyword.trim()) {
      setMessage("Please enter a keyword.");
      setLoading(false);
      return;
    }

    const payload = {
      keywords: keyword,
      count: 5,
      region: "ne",
    };

    try {
      const res = await fetch("https://tikwm.com/api/feed/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.code !== 0 || !data.data.videos.length) {
        setMessage("No videos found.");
        setLoading(false);
        return;
      }

      setVideos(data.data.videos);
      setMessage("");
    } catch (error) {
      setMessage("Failed to fetch videos.");
      console.error(error);
    }

    setLoading(false);
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "discover", icon: Search, label: "Discover" },
    { id: "create", icon: Plus, label: "Create", isSpecial: true },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white pb-16">
      {/* Main Content */}
      <div className="p-4">
        {tab === "home" && <div className="text-center text-xl font-bold">Welcome Home!</div>}
        {tab === "create" && <div className="text-center text-xl font-bold">Create Video (Coming Soon)</div>}
        {tab === "messages" && <div className="text-center text-xl font-bold">Messages (Coming Soon)</div>}
        {tab === "profile" && <div className="text-center text-xl font-bold">Profile: LordDenish</div>}

        {tab === "discover" && (
          <div>
            <h1 className="text-xl font-bold mb-4">Discover TikTok Videos</h1>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter keyword..."
                className="p-2 bg-gray-800 rounded w-full"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                onClick={searchTikTok}
              >
                Search
              </button>
            </div>
            {loading && <p>{message}</p>}
            {!loading && message && <p>{message}</p>}

            <div className="grid gap-6 mt-4">
              {videos.map((video) => (
                <div key={video.id} className="bg-gray-900 p-4 rounded">
                  <h3 className="font-bold mb-2">{video.title}</h3>
                  <video controls src={video.play} className="w-full rounded mb-2" />
                  <p>
                    <strong>Author:</strong> {video.author.nickname} (@
                    {video.author.unique_id})
                  </p>
                  <p>
                    ❤️ {video.digg_count} | 💬 {video.comment_count} | 🔁{" "}
                    {video.share_count} | ▶️ {video.play_count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-black/80 backdrop-blur-lg border-t border-gray-800">
          <div className="flex items-center justify-around py-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center p-2 min-w-0 ${
                  item.isSpecial
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    : tab === item.id
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <item.icon size={item.isSpecial ? 28 : 24} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
