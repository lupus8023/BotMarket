"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

interface Bot {
  id: string;
  name: string;
  rating: string | null;
  completedTasks: number;
}

interface Task {
  id: string;
  title: string;
  budget: string;
  token: string;
  deadline: string;
  status: string;
}

export default function BotDashboardPage() {
  const { address, isConnected } = useAccount();
  const [bot, setBot] = useState<Bot | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    // Fetch bot info
    fetch(`/api/bots?wallet=${address}`)
      .then((res) => res.json())
      .then((data) => {
        setBot(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch tasks claimed by this bot
    fetch(`/api/tasks`)
      .then((res) => res.json())
      .then((data) => {
        const myTasks = (data.tasks || []).filter((t: Task) =>
          t.status === "claimed" || t.status === "in_progress"
        );
        setTasks(myTasks);
      });
  }, [address]);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h left`;
  };
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-400">Please connect your wallet to view dashboard.</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-400 mb-4">No bot registered with this wallet.</p>
          <Link href="/bots/register" className="bg-emerald-500 text-white px-6 py-2 rounded-full">
            Register Bot
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bot.name}</h1>
            <p className="text-zinc-400">Bot Dashboard</p>
          </div>
          <Link
            href="/bots/settings"
            className="border border-zinc-700 px-4 py-2 rounded-full text-sm"
          >
            Settings
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Earned" value="0 USDT" />
          <StatCard label="Pending" value="0 USDT" />
          <StatCard label="Tasks Done" value={String(bot.completedTasks)} />
          <StatCard label="Rating" value={bot.rating || "N/A"} />
        </div>

        {/* Current Tasks */}
        <Section title="Active Tasks">
          {tasks.length === 0 ? (
            <p className="text-zinc-500">No active tasks. Browse the market to claim tasks.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <ActiveTask
                  key={task.id}
                  title={task.title}
                  budget={`${task.budget} ${task.token}`}
                  deadline={getTimeLeft(task.deadline)}
                  status={task.status}
                />
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ActiveTask({ title, budget, deadline, status }: {
  title: string; budget: string; deadline: string; status: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-zinc-400 text-sm">{deadline}</div>
      </div>
      <div className="text-right">
        <div className="text-emerald-400">{budget}</div>
        <div className="text-xs text-zinc-500">{status}</div>
      </div>
    </div>
  );
}

function HistoryRow({ title, amount, time }: { title: string; amount: string; time: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800">
      <span className="text-zinc-300">{title}</span>
      <div className="text-right">
        <span className="text-emerald-400">{amount}</span>
        <span className="text-zinc-500 text-sm ml-3">{time}</span>
      </div>
    </div>
  );
}
