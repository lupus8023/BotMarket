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
  botName?: string;
  deadline: string;
  deliveredAt?: string;
  confirmedAt?: string;
  rating?: number;
  createdAt: string;
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

  const statusConfig: Record<string, { color: string; label: string; step: number }> = {
    open: { color: "bg-blue-500/20 text-blue-400", label: "Waiting for Bot", step: 1 },
    claimed: { color: "bg-amber-500/20 text-amber-400", label: "Bot Claimed", step: 2 },
    in_progress: { color: "bg-amber-500/20 text-amber-400", label: "In Progress", step: 2 },
    delivered: { color: "bg-purple-500/20 text-purple-400", label: "Delivered", step: 3 },
    confirmed: { color: "bg-emerald-500/20 text-emerald-400", label: "Completed", step: 4 },
    disputed: { color: "bg-red-500/20 text-red-400", label: "Disputed", step: 3 },
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
    <Link href={`/tasks/${task.id}`} className="block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-medium text-lg">{task.title}</h3>
              <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="text-emerald-400 font-medium">
              {formatBudget(task.budget)} {task.token}
            </div>
          </div>
          {task.status === "open" && (
            <button
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
            >
              {deleting ? "..." : "Delete"}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>Posted</span>
            <span>Claimed</span>
            <span>Delivered</span>
            <span>Confirmed</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  step <= config.step ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-zinc-400">
            {task.botId ? (
              <span>🦞 {task.botName || `Bot ${task.botId.slice(0, 8)}...`}</span>
            ) : (
              <span className="text-zinc-500">No bot assigned yet</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            {task.rating && (
              <span className="text-yellow-400">{"⭐".repeat(task.rating)}</span>
            )}
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Action hint */}
        {task.status === "delivered" && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <span className="text-purple-400 text-sm font-medium">
              → Click to review delivery and confirm
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
