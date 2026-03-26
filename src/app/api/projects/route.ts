import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

// GET /api/projects — list projects (optionally by userId query param)
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  const visibility = searchParams.get("visibility");
  const sort = searchParams.get("sort") || "updatedAt";

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (status && status !== "all") filter.status = status;
  if (visibility && visibility !== "all") filter.visibility = visibility;
  // Exclude abandoned unless specifically requested
  if (!status) filter.status = { $ne: "abandoned" };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    updatedAt: { updatedAt: -1 },
    deadline: { deadline: 1 },
    name: { name: 1 },
  };

  const query = Project.find(filter);
  
  // We populate userId with username to display creator names
  query.populate("userId", "username");

  const projects = await query.sort(sortMap[sort] || { updatedAt: -1 });

  const result = projects.map(p => {
    const doc = p.toJSON();
    if (doc.userId && typeof doc.userId === "object" && "username" in doc.userId) {
      doc.username = (doc.userId as any).username;
      doc.userId = (doc.userId as any)._id.toString();
    }
    return doc;
  });

  return NextResponse.json(result);
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const { userId, name, description, stack, deadline, visibility, tasks } = body;

  if (!userId || !name) {
    return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
  }

  if (!tasks || tasks.length < 3) {
    return NextResponse.json({ error: "At least 3 initial tasks are required" }, { status: 400 });
  }

  const project = await Project.create({
    userId,
    name,
    description: description || "",
    stack: stack || [],
    status: "planning",
    visibility: visibility || "public",
    deadline: deadline ? new Date(deadline) : null,
    tasks: tasks.map((t: string | { title: string; description?: string; priority?: string }) => {
      if (typeof t === "string") return { title: t, description: "", priority: "medium", status: "todo" };
      return {
        title: t.title,
        description: t.description || "",
        priority: ["low", "medium", "high", "critical"].includes(t.priority || "") ? t.priority : "medium",
        status: "todo",
      };
    }),
  });

  return NextResponse.json(project, { status: 201 });
}
