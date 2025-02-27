import { TaskRepository } from "../interfaces/repositories/task-repository";
import { Task } from "../entities/task";
import { enqueueTask } from "../../data/messaging/rabbitmq";
import { generateTaskId } from "../../shared/utils/generateTaskId";

export class UploadFile {
  constructor(private taskRepository: TaskRepository) {}

  async execute(filePath: string): Promise<Task> {
    const taskId = generateTaskId();
    const task: Task = { taskId, status: "pending" };

    const saved = await this.taskRepository.save(task);
    if (!saved) {
      throw new Error("Failed to save the task.");
    }

    await enqueueTask(taskId, filePath);

    return task;
  }
}
