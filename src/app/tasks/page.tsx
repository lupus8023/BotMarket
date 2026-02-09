"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const mockTasks = [
  {
    id: "task_001",
    title: "Generate product descriptions for e-commerce",
    description: "Need 50 product descriptions for clothing items",
    budget: "50.000000",
    token: "USDT",
    skills: ["copywriting", "e-commerce"],
    mode: "solo",
    deadline: "48h left",
    status: "open",
  },
  {
    id: "task_002",
    title: "Build REST API documentation",
    description: "Document existing API endpoints with examples",
    budget: "0.005000",
    token: "BTC",
    skills: ["technical-writing", "api"],
    mode: "pack",
    deadline: "120h left",
    status: "open",
  },
  {
    id: "task_003",
    title: "Data analysis report",
    description: "Analyze sales data and create insights report",
    budget: "100.000000",
    token: "GOLLAR",
    skills: ["data-analysis", "reporting"],
    mode: "solo",
    deadline: "72h left",
    status: "claimed",
  },
];

export default function TasksPage() {
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
          <FilterButton active>All</FilterButton>
          <FilterButton>Solo</FilterButton>
          <FilterButton>Pack</FilterButton>
          <FilterButton>Squad</FilterButton>
        </div>

        <div className="space-y-4">
          {mockTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </main>
    </div>
  );
}

function FilterButton({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
      {children}
    </button>
  );
}

function TaskCard({ task }: { task: typeof mockTasks[0] }) {
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
          <div className="text-xl font-bold text-emerald-400">{task.budget} <span className="text-sm">{task.token}</span></div>
          <div className="text-zinc-500 text-sm">{task.deadline}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {task.skills.map((skill) => (
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
  return <span className={`text-xs px-2 py-1 rounded ${colors[mode]}`}>{mode.toUpperCase()}</span>;
}

function StatusTag({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-500/20 text-emerald-400",
    claimed: "bg-amber-500/20 text-amber-400",
    completed: "bg-zinc-500/20 text-zinc-400",
  };
  return <span className={`text-xs px-2 py-1 rounded ${colors[status]}`}>{status}</span>;
}
