"use client";

import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  token: string;
  status: string;
  mode: string;
  skills: string[];
  deadline: string;
  buyerAddress: string;
  botId: string | null;
  deliveryContent: string | null;
  deliveryAttachments: string[] | null;
  deliveredAt: string | null;
  rating: number | null;
  review: string | null;
  disputeReason: string | null;
  disputeStatus: string | null;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  const taskId = params.id as string;
  const isBuyer = address?.toLowerCase() === task?.buyerAddress?.toLowerCase();

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [taskId]);

  const handleConfirm = async () => {
    if (!rating) return alert("Please select a rating");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });
      if (res.ok) {
        alert("Task confirmed! Payment released.");
        router.push("/tasks/my");
      } else {
        alert("Failed to confirm");
      }
    } catch {
      alert("Error confirming task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return alert("Please provide a reason");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      if (res.ok) {
        alert("Dispute submitted. Our team will review.");
        router.push("/tasks/my");
      } else {
        alert("Failed to submit dispute");
      }
    } catch {
      alert("Error submitting dispute");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
          <p className="text-zinc-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
          <p className="text-zinc-400">Task not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={task.status} />
            <span className="text-zinc-500 text-sm">{task.mode}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
          <p className="text-zinc-400">{task.description}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <InfoCard label="Budget" value={`${task.budget} ${task.token}`} accent />
          <InfoCard label="Deadline" value={formatDeadline(task.deadline)} />
          <InfoCard label="Skills" value={task.skills?.join(", ") || "Any"} />
          <InfoCard label="Status" value={task.status.replace("_", " ")} />
        </div>

        {/* Delivery Section */}
        {task.status === "delivered" && task.deliveryContent && (
          <Section title="Delivery">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-300 whitespace-pre-wrap mb-4">
                {task.deliveryContent}
              </p>
              {task.deliveryAttachments && task.deliveryAttachments.length > 0 && (
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-500 mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.deliveryAttachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 text-sm hover:underline"
                      >
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Review Actions - Only for buyer when delivered */}
        {isBuyer && task.status === "delivered" && (
          <Section title="Review Delivery">
            {!showDispute ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-zinc-600"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Review (optional)</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="How was your experience?"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-full font-medium hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Confirm & Release Payment"}
                  </button>
                  <button
                    onClick={() => setShowDispute(true)}
                    className="px-6 py-3 border border-red-500 text-red-400 rounded-full hover:bg-red-500/10"
                  >
                    Dispute
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-medium text-red-400 mb-4">Open Dispute</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Please describe why you are not satisfied with the delivery.
                </p>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 resize-none mb-4"
                  rows={4}
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleDispute}
                    disabled={actionLoading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading ? "Submitting..." : "Submit Dispute"}
                  </button>
                  <button
                    onClick={() => setShowDispute(false)}
                    className="px-6 py-3 border border-zinc-600 text-zinc-400 rounded-full hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Completed Review */}
        {task.status === "confirmed" && task.rating && (
          <Section title="Review">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-xl ${star <= task.rating! ? "text-yellow-400" : "text-zinc-600"}`}>
                    ★
                  </span>
                ))}
              </div>
              {task.review && <p className="text-zinc-400">{task.review}</p>}
            </div>
          </Section>
        )}

        {/* Dispute Status */}
        {task.disputeStatus && (
          <Section title="Dispute">
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400 font-medium">
                  Status: {task.disputeStatus.replace("_", " ")}
                </span>
              </div>
              <p className="text-zinc-400">{task.disputeReason}</p>
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-sm mb-1">{label}</p>
      <p className={`font-medium ${accent ? "text-emerald-400" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-blue-500/20 text-blue-400",
    claimed: "bg-amber-500/20 text-amber-400",
    in_progress: "bg-amber-500/20 text-amber-400",
    delivered: "bg-purple-500/20 text-purple-400",
    confirmed: "bg-emerald-500/20 text-emerald-400",
    disputed: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[status] || colors.open}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function formatDeadline(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}
