import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, bots } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

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

    // Fetch bot names for tasks with botId
    const tasksWithBotNames = await Promise.all(
      filtered.map(async (task) => {
        if (task.botId) {
          const bot = await db.query.bots.findFirst({
            where: eq(bots.id, task.botId),
          });
          return { ...task, botName: bot?.name };
        }
        return task;
      })
    );

    return NextResponse.json({ tasks: tasksWithBotNames, total: tasksWithBotNames.length });
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
