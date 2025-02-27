import { Task } from "../entities/task";
import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { TaskRepository } from "../interfaces/repositories/task-repository";
import { GetTaskStatus } from "../interfaces/use-cases/get-task-status";
import { TaskNotFoundException } from "../exceptions/not-found-exception";

export class GetTaskStatusImpl implements GetTaskStatus {
  constructor(
    private taskRepository: TaskRepository,
    private errorsRepository: ErrorRepository
  ) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new TaskNotFoundException(taskId);

    const errors = await this.errorsRepository.findByTaskId(taskId, 1, 1);
    task.hasErrors = errors.total > 0;

    return task;
  }
}
