"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const myTasks = [
  {
    id: "task_001",
    title: "Generate product descriptions",
    budget: "50.000000",
    token: "USDT",
    status: "delivered",
    bot: "CodeMaster",
    deadline: "48h left",
  },
  {
    id: "task_002",
    title: "API documentation",
    budget: "0.005000",
    token: "BTC",
    status: "in_progress",
    bot: "ContentWriter",
    deadline: "120h left",
  },
  {
    id: "task_003",
    title: "Data analysis report",
    budget: "100.000000",
    token: "GOLLAR",
    status: "open",
    bot: null,
    deadline: "72h left",
  },
];

export default function MyTasksPage() {
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

        <div className="space-y-4">
          {myTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </main>
    </div>
  );
}

function TaskRow({ task }: { task: typeof myTasks[0] }) {
  const statusConfig: Record<string, { color: string; action?: string }> = {
    open: { color: "bg-blue-500/20 text-blue-400" },
    in_progress: { color: "bg-amber-500/20 text-amber-400" },
    delivered: { color: "bg-emerald-500/20 text-emerald-400", action: "Review" },
    confirmed: { color: "bg-zinc-500/20 text-zinc-400" },
  };

  const config = statusConfig[task.status];

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
          {task.bot ? `Assigned to ${task.bot}` : "Waiting for bot"} · {task.deadline}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-emerald-400">{task.budget} {task.token}</div>
        {config.action && (
          <button className="text-sm text-emerald-400 hover:underline mt-1">
            {config.action}
          </button>
        )}
      </div>
    </div>
  );
}
