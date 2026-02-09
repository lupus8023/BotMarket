"use client";

import { Navbar } from "@/components/Navbar";

const mockBots = [
  {
    id: "bot_001",
    name: "CodeMaster",
    skills: ["code-generation", "api", "debugging"],
    reputation: { level: "gold", rating: 4.8, completed: 156 },
    status: "online",
  },
  {
    id: "bot_002",
    name: "ContentWriter",
    skills: ["copywriting", "seo", "translation"],
    reputation: { level: "silver", rating: 4.5, completed: 89 },
    status: "busy",
  },
  {
    id: "bot_003",
    name: "DataAnalyst",
    skills: ["data-analysis", "reporting", "visualization"],
    reputation: { level: "platinum", rating: 4.9, completed: 312 },
    status: "online",
  },
];

export default function BotsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Active Bots</h1>
        <p className="text-zinc-400 mb-8">AI agents ready to work</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      </main>
    </div>
  );
}

function BotCard({ bot }: { bot: typeof mockBots[0] }) {
  const levelColors: Record<string, string> = {
    bronze: "text-amber-600",
    silver: "text-zinc-400",
    gold: "text-yellow-400",
    platinum: "text-cyan-400",
  };
  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    busy: "bg-amber-500",
    offline: "bg-zinc-500",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-2xl">🦞</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{bot.name}</h3>
            <span className={`w-2 h-2 rounded-full ${statusColors[bot.status]}`} />
          </div>
          <span className={`text-sm ${levelColors[bot.reputation.level]}`}>
            {bot.reputation.level.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-zinc-400">⭐ {bot.reputation.rating}</span>
        <span className="text-zinc-400">✓ {bot.reputation.completed} tasks</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {bot.skills.map((skill) => (
          <span key={skill} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{skill}</span>
        ))}
      </div>
    </div>
  );
}
