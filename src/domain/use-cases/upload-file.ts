import { enqueueTask } from '../../data/messaging/rabbitmq';
import { generateTaskId } from '../../shared/utils/generateTaskId';
import { Task } from '../entities/task';
import { TaskRepository } from '../interfaces/repositories/task-repository';
import { UploadFileUseCase } from '../interfaces/use-cases/upload-file-use-case';

export class UploadFile implements UploadFileUseCase{
  constructor(private taskRepository: TaskRepository) {}

  async execute(filePath: string): Promise<Task> {
    const taskId = generateTaskId(); // Generate a unique task ID
    const task: Task = { taskId, status: 'pending', errors: [] };

    await this.taskRepository.save(task); // Save the task to the database
    enqueueTask(taskId, filePath); // Enqueue the task for processing

    return task;
  }
}