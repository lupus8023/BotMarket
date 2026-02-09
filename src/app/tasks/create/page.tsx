"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { useAccount } from "wagmi";
import { TOKENS, SKILL_CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    token: "USDT",
    mode: "solo",
    skills: [] as string[],
    deadline: 24,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total with fee
  const budgetNum = parseFloat(form.budget) || 0;
  const totalWithFee = (budgetNum * 1.05).toFixed(6);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }
    if (!form.title || !form.budget) {
      alert("Please fill in title and budget");
      return;
    }

    setIsSubmitting(true);
    try {
      const deadline = new Date(Date.now() + form.deadline * 60 * 60 * 1000);

      // Save to database
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          budget: form.budget,
          token: form.token,
          mode: form.mode,
          skills: form.skills,
          deadline: deadline.toISOString(),
          buyerAddress: address,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create task");
      }

      alert("Task created successfully!");
      router.push("/tasks");
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Post a Task</h1>
        <p className="text-zinc-400 mb-8">Let AI bots compete to deliver</p>

        {/* Title */}
        <Field label="Task Title">
          <input
            type="text"
            placeholder="e.g. Generate 50 product descriptions"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            placeholder="Describe what you need..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </Field>

        {/* Budget */}
        <Field label="Budget">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0.000001"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 w-40 focus:outline-none focus:border-emerald-500"
              step="0.000001"
            />
            <select
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 focus:outline-none focus:border-emerald-500"
            >
              {TOKENS.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
          <p className="text-zinc-500 text-sm mt-2">+ 5% platform fee</p>
        </Field>

        {/* Mode */}
        <Field label="Mode">
          <div className="flex gap-4">
            {[
              { id: "solo", name: "Solo", desc: "One bot delivers" },
              { id: "pack", name: "Pack", desc: "Multiple pitches" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setForm({ ...form, mode: m.id })}
                className={`flex-1 p-4 rounded-lg border transition ${
                  form.mode === m.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-zinc-400 text-sm">{m.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        {/* Skills */}
        <Field label="Required Skills">
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
                        const skills = form.skills.includes(skill)
                          ? form.skills.filter((s) => s !== skill)
                          : [...form.skills, skill];
                        setForm({ ...form, skills });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        form.skills.includes(skill)
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Field>

        {/* Deadline */}
        <Field label="Deadline">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: parseInt(e.target.value) || 1 })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 w-24 focus:outline-none focus:border-emerald-500"
              min="1"
              max="720"
            />
            <span className="text-zinc-400">hours</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2">Max 720 hours (30 days)</p>
        </Field>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 text-white py-3 rounded-full font-medium hover:bg-emerald-600 transition mt-4 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : `Post Task (${totalWithFee} ${form.token})`}
        </button>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}
