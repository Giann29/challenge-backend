import { TasksDataSource } from "../../data/data-sources/interfaces/data-sources/tasks-datasource";
import { Task } from "../entities/task";
import { TaskRepository } from "../interfaces/repositories/task-repository";

export class TaskRepositoryImpl implements TaskRepository {
  tasksDataSource: TasksDataSource;

  constructor(tasksDataSource: TasksDataSource) {
    this.tasksDataSource = tasksDataSource;
  }

  async save(task: Task): Promise<Boolean> {
    const result = await this.tasksDataSource.create(task);
    return result;
  }

  async findById(taskId: string): Promise<Task | null> {
    const result = await this.tasksDataSource.findById(taskId);
    return result;
  }
  async update(taskId: string, task: Partial<Task>): Promise<boolean> {
    const result = await this.tasksDataSource.update(taskId, task);
    return result;
  }
}
