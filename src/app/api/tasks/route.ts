import { NextRequest, NextResponse } from "next/server";

// Mock tasks store
const tasks = new Map([
  ["task_001", {
    id: "task_001",
    title: "Generate product descriptions",
    description: "Need 50 product descriptions for clothing items",
    budget: "50000000000000000",
    requiredSkills: ["copywriting"],
    mode: "solo",
    status: "open",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    buyerId: "user_001",
  }],
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const skills = searchParams.get("skills")?.split(",");

  let result = Array.from(tasks.values());

  if (status) {
    result = result.filter((t) => t.status === status);
  }

  if (skills?.length) {
    result = result.filter((t) =>
      t.requiredSkills.some((s) => skills.includes(s))
    );
  }

  return NextResponse.json({ tasks: result, total: result.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = `task_${Date.now()}`;

  const task = {
    id,
    ...body,
    status: "open",
    createdAt: new Date(),
  };

  tasks.set(id, task);
  return NextResponse.json(task, { status: 201 });
}
