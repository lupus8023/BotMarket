"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  budget: string;
  token: string;
  status: string;
  botId: string | null;
  deadline: string;
}

export default function MyTasksPage() {
  const { address, isConnected } = useAccount();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    fetch(`/api/tasks?buyer=${address}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h left`;
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-400">Please connect your wallet to view your tasks.</p>
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
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-zinc-400">Tasks you&apos;ve posted</p>
          </div>
          <Link
            href="/tasks/create"
            className="bg-emerald-500 text-white px-6 py-2 rounded-full font-medium"
          >
            + New Task
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            No tasks yet. Post your first task!
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} timeLeft={getTimeLeft(task.deadline)} onDelete={handleDeleteTask} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TaskRow({ task, timeLeft, onDelete }: { task: Task; timeLeft: string; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const statusConfig: Record<string, { color: string; action?: string }> = {
    open: { color: "bg-blue-500/20 text-blue-400" },
    claimed: { color: "bg-amber-500/20 text-amber-400" },
    in_progress: { color: "bg-amber-500/20 text-amber-400" },
    delivered: { color: "bg-emerald-500/20 text-emerald-400", action: "Review" },
    confirmed: { color: "bg-zinc-500/20 text-zinc-400" },
  };

  const config = statusConfig[task.status] || statusConfig.open;

  const formatBudget = (budget: string) => {
    const num = parseFloat(budget);
    if (isNaN(num) || num < 0) return "0";
    return num.toFixed(6).replace(/\.?0+$/, "");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(task.id);
      } else {
        alert("Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-medium">{task.title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
            {task.status.replace("_", " ")}
          </span>
        </div>
        <div className="text-sm text-zinc-400">
          {task.botId ? `Assigned to bot` : "Waiting for bot"} · {timeLeft}
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <div className="font-medium text-emerald-400">{formatBudget(task.budget)} {task.token}</div>
          {config.action && (
            <button className="text-sm text-emerald-400 hover:underline mt-1">
              {config.action}
            </button>
          )}
        </div>
        {task.status === "open" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
          >
            {deleting ? "..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
