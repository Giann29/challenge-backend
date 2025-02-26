import { Schema, model } from "mongoose";
import { Task } from "../../../../domain/entities/task";

const taskSchema = new Schema<Task>({
  taskId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending",
  },
});

export const TaskModel = model<Task>("Task", taskSchema);
