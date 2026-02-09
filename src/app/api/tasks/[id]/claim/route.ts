import { NextRequest, NextResponse } from "next/server";

// Shared task store (in production, use database)
const claimedTasks = new Map<string, string>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already claimed
  if (claimedTasks.has(id)) {
    return NextResponse.json(
      { error: "Task already claimed" },
      { status: 409 }
    );
  }

  // Claim the task
  const botId = "bot_from_token"; // Extract from token in production
  claimedTasks.set(id, botId);

  return NextResponse.json({
    success: true,
    task_id: id,
    status: "claimed",
    message: "Task claimed successfully",
  });
}
