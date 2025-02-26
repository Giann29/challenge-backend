import { Task } from "../../../domain/entities/task";
import { TasksDatabaseWrapper } from "../interfaces/data-sources/tasks-database-wrapper";
import { TasksDataSource } from "../interfaces/data-sources/tasks-datasource";

export class MongoDBTasksDataSource implements TasksDataSource {
  private database: TasksDatabaseWrapper;
  constructor(database: TasksDatabaseWrapper) {
    this.database = database;
  }
  async create(task: Task): Promise<boolean> {
    const result = await this.database.insertOne(task);
    return result !== null;
  }

  async findById(taskId: string): Promise<Task | null> {
    const result = await this.database.findById(taskId);
    return result;
  }
  async update(taskId: string, task: Partial<Task>): Promise<boolean> {
    const result = await this.database.updateOne({ taskId }, task);
    return result !== null;
  }
}
