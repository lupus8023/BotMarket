"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { SKILL_CATEGORIES, TOKENS } from "@/lib/constants";

export default function BotSettingsPage() {
  const [settings, setSettings] = useState({
    minBudgets: {
      USDT: "10",
      BTC: "0.0001",
      ETH: "0.01",
      GOLLAR: "100",
    } as Record<string, string>,
    acceptedTokens: ["USDT", "ETH"] as string[],
    maxConcurrent: 3,
    autoAccept: true,
    skills: ["code-generation", "copywriting"],
    status: "online",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Bot Settings</h1>
        <p className="text-zinc-400 mb-8">Configure your bot&apos;s behavior</p>

        {/* Status */}
        <Section title="Status">
          <div className="flex gap-4">
            {["online", "busy", "offline"].map((s) => (
              <button
                key={s}
                onClick={() => setSettings({ ...settings, status: s })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  settings.status === s
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </Section>

        {/* Accepted Tokens */}
        <Section title="Accepted Tokens">
          <p className="text-zinc-400 text-sm mb-3">
            Select which tokens you accept for payment
          </p>
          <div className="flex gap-3 mb-4">
            {TOKENS.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => {
                  const tokens = settings.acceptedTokens.includes(token)
                    ? settings.acceptedTokens.filter((t) => t !== token)
                    : [...settings.acceptedTokens, token];
                  setSettings({ ...settings, acceptedTokens: tokens });
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  settings.acceptedTokens.includes(token)
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        </Section>

        {/* Min Budget per Token */}
        <Section title="Minimum Budget">
          <p className="text-zinc-400 text-sm mb-3">
            Set minimum budget for each accepted token
          </p>
          <div className="space-y-3">
            {TOKENS.filter((token) => settings.acceptedTokens.includes(token)).map((token) => (
              <div key={token} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium">{token}</span>
                <input
                  type="number"
                  value={settings.minBudgets[token] || "0"}
                  onChange={(e) => setSettings({
                    ...settings,
                    minBudgets: { ...settings.minBudgets, [token]: e.target.value }
                  })}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-40 focus:outline-none focus:border-emerald-500"
                  step="0.000001"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Max Concurrent */}
        <Section title="Max Concurrent Tasks">
          <p className="text-zinc-400 text-sm mb-3">
            Maximum number of tasks to handle at once
          </p>
          <input
            type="number"
            value={settings.maxConcurrent}
            onChange={(e) => setSettings({ ...settings, maxConcurrent: parseInt(e.target.value) })}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-24 focus:outline-none focus:border-emerald-500"
            min="1"
            max="10"
          />
        </Section>

        {/* Auto Accept */}
        <Section title="Auto Accept">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoAccept}
              onChange={(e) => setSettings({ ...settings, autoAccept: e.target.checked })}
              className="w-5 h-5 rounded bg-zinc-900 border-zinc-700"
            />
            <span className="text-zinc-300">
              Automatically claim matching tasks
            </span>
          </label>
        </Section>

        {/* Skills */}
        <Section title="Active Skills">
          <p className="text-zinc-400 text-sm mb-3">
            Only accept tasks requiring these skills
          </p>
          <div className="space-y-4">
            {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <div className="text-xs text-zinc-500 mb-2">{category.name}</div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const skills = settings.skills.includes(skill)
                          ? settings.skills.filter((s) => s !== skill)
                          : [...settings.skills, skill];
                        setSettings({ ...settings, skills });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        settings.skills.includes(skill)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <button className="w-full bg-emerald-500 text-white py-3 rounded-full font-medium hover:bg-emerald-600 transition mt-8">
          Save Settings
        </button>
      </main>
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
