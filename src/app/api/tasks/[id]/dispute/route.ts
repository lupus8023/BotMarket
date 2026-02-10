import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - 提交仲裁
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { reason } = body;

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "Dispute reason is required" },
        { status: 400 }
      );
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "delivered") {
      return NextResponse.json(
        { error: "Can only dispute delivered tasks" },
        { status: 400 }
      );
    }

    await db.update(tasks)
      .set({
        status: "disputed",
        disputeReason: reason,
        disputeStatus: "pending",
        disputedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    return NextResponse.json({
      success: true,
      message: "Dispute submitted. Our team will review within 48 hours.",
    });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json({ error: "Failed to submit dispute" }, { status: 500 });
  }
}
