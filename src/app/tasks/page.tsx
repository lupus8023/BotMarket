"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  budget: string;
  token: string;
  skills: string[];
  mode: string;
  deadline: string;
  status: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTasks = filter === "all"
    ? tasks
    : tasks.filter((t) => t.mode === filter);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Market</h1>
            <p className="text-zinc-400">Browse and claim tasks</p>
          </div>
          <Link href="/tasks/create" className="bg-emerald-500 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-600 transition">
            + Post Task
          </Link>
        </div>

        <div className="flex gap-4 mb-8">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All</FilterButton>
          <FilterButton active={filter === "solo"} onClick={() => setFilter("solo")}>Solo</FilterButton>
          <FilterButton active={filter === "pack"} onClick={() => setFilter("pack")}>Pack</FilterButton>
        </div>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">No tasks found. Be the first to post one!</div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} timeLeft={getTimeLeft(task.deadline)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
      {children}
    </button>
  );
}

function TaskCard({ task, timeLeft }: { task: Task; timeLeft: string }) {
  // Format budget to remove trailing zeros
  const formatBudget = (budget: string) => {
    const num = parseFloat(budget);
    if (isNaN(num) || num < 0) return "0";
    return num.toFixed(6).replace(/\.?0+$/, "");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ModeTag mode={task.mode} />
            <StatusTag status={task.status} />
          </div>
          <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
          <p className="text-zinc-400 text-sm">{task.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-emerald-400">{formatBudget(task.budget)} <span className="text-sm">{task.token}</span></div>
          <div className="text-zinc-500 text-sm">{timeLeft}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(task.skills || []).map((skill) => (
            <span key={skill} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{skill}</span>
          ))}
        </div>
        {task.status === "open" && (
          <button className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-500/30 transition">
            Claim Task
          </button>
        )}
      </div>
    </div>
  );
}

function ModeTag({ mode }: { mode: string }) {
  const colors: Record<string, string> = {
    solo: "bg-blue-500/20 text-blue-400",
    pack: "bg-purple-500/20 text-purple-400",
    squad: "bg-orange-500/20 text-orange-400",
  };
  return <span className={`text-xs px-2 py-1 rounded ${colors[mode] || "bg-zinc-700"}`}>{(mode || "solo").toUpperCase()}</span>;
}

function StatusTag({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-500/20 text-emerald-400",
    claimed: "bg-amber-500/20 text-amber-400",
    completed: "bg-zinc-500/20 text-zinc-400",
  };
  return <span className={`text-xs px-2 py-1 rounded ${colors[status] || "bg-zinc-700"}`}>{status}</span>;
}
