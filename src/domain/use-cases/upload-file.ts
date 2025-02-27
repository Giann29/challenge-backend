import { TaskRepository } from "../interfaces/repositories/task-repository";
import { Task } from "../entities/task";
import { enqueueTask } from "../../data/messaging/rabbitmq";
import { generateTaskId } from "../../shared/utils/generateTaskId";
import { TaskSaveException } from "../exceptions/database-exception";

export class UploadFile {
  constructor(private taskRepository: TaskRepository) {}

  async execute(filePath: string): Promise<Task> {
    const taskId = generateTaskId();
    const task: Task = { taskId, status: "pending" };

    const saved = await this.taskRepository.save(task);
    if (!saved) {
      throw new TaskSaveException();
    }

    await enqueueTask(taskId, filePath);

    return task;
  }
}
