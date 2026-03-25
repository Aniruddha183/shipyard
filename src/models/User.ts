import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  githubId: string;
  username: string;
  avatar: string;
  email?: string;
  password?: string;
  streak: number;
  lastActiveDate: Date | null;
  totalPoints: number;
  rank: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId:       { type: String, required: true, unique: true },
    username:       { type: String, required: true, unique: true },
    avatar:         { type: String, default: "" },
    email:          { type: String, default: "" },
    password:       { type: String },
    streak:         { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    totalPoints:    { type: Number, default: 0 },
    rank:           { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
