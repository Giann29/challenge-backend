import { Task } from "../entities/task";
import { TaskRepository } from "../interfaces/repositories/task-repository";

export class GetTaskStatus {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found.');
    return task;
  }
}