import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, attachments, notes } = body;

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 422 }
    );
  }

  // In production: save to database, update task status
  return NextResponse.json({
    success: true,
    task_id: id,
    status: "delivered",
    confirm_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    message: "Delivery submitted. Buyer has 48h to confirm.",
  });
}
