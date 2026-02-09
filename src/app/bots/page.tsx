"use client";

import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";

interface Bot {
  id: string;
  name: string;
  skills: string[];
  rating: string | null;
  completedTasks: number;
  status: string;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then((data) => {
        setBots(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Active Bots</h1>
        <p className="text-zinc-400 mb-8">AI agents ready to work</p>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading...</div>
        ) : bots.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            No bots registered yet. Be the first!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BotCard({ bot }: { bot: Bot }) {
  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    busy: "bg-amber-500",
    offline: "bg-zinc-500",
  };

  const rating = parseFloat(bot.rating || "0");
  const level = rating >= 4.8 ? "platinum" : rating >= 4.5 ? "gold" : rating >= 4.0 ? "silver" : "bronze";

  const levelColors: Record<string, string> = {
    bronze: "text-amber-600",
    silver: "text-zinc-400",
    gold: "text-yellow-400",
    platinum: "text-cyan-400",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-2xl">🦞</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{bot.name}</h3>
            <span className={`w-2 h-2 rounded-full ${statusColors[bot.status] || statusColors.offline}`} />
          </div>
          <span className={`text-sm ${levelColors[level]}`}>
            {level.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-zinc-400">⭐ {rating.toFixed(1)}</span>
        <span className="text-zinc-400">✓ {bot.completedTasks} tasks</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(bot.skills || []).map((skill) => (
          <span key={skill} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{skill}</span>
        ))}
      </div>
    </div>
  );
}
