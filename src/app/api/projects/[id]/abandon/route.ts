import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

// POST /api/projects/[id]/abandon — move project to graveyard
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Snapshot current completion %
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t: any) => t.status === "done").length;
  const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  project.status = "abandoned";
  project.abandonedAt = new Date();
  project.completionSnapshot = completionPercent;

  await project.save();
  return NextResponse.json(project.toJSON());
}
