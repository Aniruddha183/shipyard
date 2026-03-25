import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

// POST /api/projects/[id]/tasks — add task
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const { title, description, priority } = await req.json();

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const validPriorities = ["low", "medium", "high", "critical"];
  const taskPriority = validPriorities.includes(priority) ? priority : "medium";

  const project = await Project.findByIdAndUpdate(
    id,
    { $push: { tasks: { title, description: description || "", priority: taskPriority, status: "todo" } } },
    { new: true }
  ).lean();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}
