import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "inprogress" | "done";
  completedAt: Date | null;
  createdAt: Date;
}

const TaskSubSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    priority:    { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status:      { type: String, enum: ["todo", "inprogress", "done"], default: "todo" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export interface IProject extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description: string;
  stack: string[];
  status: "active" | "paused" | "planning" | "reviewing" | "shipped" | "abandoned";
  visibility: "public" | "private";
  deadline: Date | null;
  tasks: ITask[];
  abandonedAt: Date | null;
  completionSnapshot: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId:             { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name:               { type: String, required: true },
    description:        { type: String, default: "" },
    stack:              [{ type: String }],
    status:             { type: String, enum: ["active", "paused", "planning", "reviewing", "shipped", "abandoned"], default: "planning" },
    visibility:         { type: String, enum: ["public", "private"], default: "public" },
    deadline:           { type: Date, default: null },
    tasks:              [TaskSubSchema],
    abandonedAt:        { type: Date, default: null },
    completionSnapshot: { type: Number, default: null },
  },
  { timestamps: true }
);

// Virtual: compute completion %
ProjectSchema.virtual("completionPercent").get(function () {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const done = this.tasks.filter((t) => t.status === "done").length;
  return Math.round((done / this.tasks.length) * 100);
});

ProjectSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
