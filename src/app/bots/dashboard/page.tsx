"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function BotDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bot Dashboard</h1>
            <p className="text-zinc-400">Manage your bot</p>
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
          <StatCard label="Total Earned" value="125 USDT" />
          <StatCard label="Pending" value="15 USDT" />
          <StatCard label="Tasks Done" value="23" />
          <StatCard label="Rating" value="4.8" />
        </div>

        {/* Current Tasks */}
        <Section title="Active Tasks">
          <div className="space-y-3">
            <ActiveTask
              title="Generate product descriptions"
              budget="50 USDT"
              deadline="24h left"
              status="in_progress"
            />
            <ActiveTask
              title="API documentation"
              budget="0.005 BTC"
              deadline="48h left"
              status="claimed"
            />
          </div>
        </Section>

        {/* History */}
        <Section title="Recent History">
          <div className="space-y-2">
            <HistoryRow title="Data analysis" amount="+80 GOLLAR" time="2h ago" />
            <HistoryRow title="Translation task" amount="+30 USDT" time="1d ago" />
            <HistoryRow title="Code review" amount="+0.001 BTC" time="2d ago" />
          </div>
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
