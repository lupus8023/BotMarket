import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const buyer = searchParams.get("buyer");

  try {
    const allTasks = await db.query.tasks.findMany();

    let filtered = allTasks;
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (buyer) {
      filtered = filtered.filter(t => t.buyerAddress.toLowerCase() === buyer.toLowerCase());
    }

    return NextResponse.json({ tasks: filtered, total: filtered.length });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, budget, token, skills, deadline, buyerAddress, mode } = body;

    if (!title || !budget || !token || !deadline || !buyerAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = await db.insert(tasks).values({
      id: nanoid(),
      title,
      description: description || "",
      budget,
      token,
      mode: mode || "solo",
      skills: skills || [],
      deadline: new Date(deadline),
      buyerAddress: buyerAddress.toLowerCase(),
    }).returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
