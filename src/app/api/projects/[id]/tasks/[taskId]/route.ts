import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { recalculateUserPoints } from "@/lib/points";

// PATCH /api/projects/[id]/tasks/[taskId] — update task status or title
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  await connectDB();
  const { id, taskId } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.status !== undefined) update["tasks.$.status"] = body.status;
  if (body.title !== undefined) update["tasks.$.title"] = body.title;
  if (body.description !== undefined) update["tasks.$.description"] = body.description;
  if (body.priority !== undefined) update["tasks.$.priority"] = body.priority;
  if (body.status === "done") update["tasks.$.completedAt"] = new Date();
  if (body.status === "todo" || body.status === "inprogress") update["tasks.$.completedAt"] = null;

  const project = await Project.findOneAndUpdate(
    { _id: id, "tasks._id": taskId },
    { $set: update },
    { new: true }
  ).lean();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Recalculate user points (totalPoints = total completed tasks)
  if (body.status !== undefined && (project as any)?.userId) {
    recalculateUserPoints(String((project as any).userId)).catch(() => {});
  }

  return NextResponse.json(project);
}

// DELETE /api/projects/[id]/tasks/[taskId] — remove a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  await connectDB();
  const { id, taskId } = await params;

  const project = await Project.findByIdAndUpdate(
    id,
    { $pull: { tasks: { _id: taskId } } },
    { new: true }
  ).lean();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Recalculate user points after task deletion
  if ((project as any)?.userId) {
    recalculateUserPoints(String((project as any).userId)).catch(() => {});
  }

  return NextResponse.json(project);
}
