import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";

/** Recalculate totalPoints as the total number of completed tasks across all projects */
export async function recalculateUserPoints(userId: string) {
  await connectDB();

  // Count all tasks with status "done" across every project belonging to this user
  const projects = await Project.find({ userId }).select("tasks");
  const completedTasks = projects.reduce((acc: number, p: any) => {
    return acc + (p.tasks?.filter((t: any) => t.status === "done").length ?? 0);
  }, 0);

  await User.findByIdAndUpdate(userId, {
    totalPoints: completedTasks,
    lastActiveDate: new Date(),
  });
}

/** Daily streak check — call from cron */
export async function processStreaks() {
  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Users who were active today → increment streak
  await User.updateMany(
    { lastActiveDate: { $gte: today } },
    { $inc: { streak: 1 } }
  );

  // Users who were NOT active today → reset streak
  await User.updateMany(
    { $or: [{ lastActiveDate: { $lt: today } }, { lastActiveDate: null }] },
    { streak: 0 }
  );
}

/** Recalculate ranks based on total points */
export async function recalculateRanks() {
  await connectDB();
  const users = await User.find().sort({ totalPoints: -1 });
  const bulkOps = users.map((user, index) => ({
    updateOne: {
      filter: { _id: user._id },
      update: { rank: index + 1 },
    },
  }));
  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps);
  }
}
