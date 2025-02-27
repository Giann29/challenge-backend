import { Task } from "../../../domain/entities/task";
import { TasksDatabaseWrapper } from "../interfaces/data-sources/tasks-database-wrapper";
import { TasksDataSource } from "../interfaces/data-sources/tasks-datasource";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

export class MongoDBTasksDataSource implements TasksDataSource {
  private database: TasksDatabaseWrapper;

  constructor(database: TasksDatabaseWrapper) {
    this.database = database;
  }

  async create(task: Task): Promise<boolean> {
    try {
      const result = await this.database.insertOne(task);
      return result !== null;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        "MongoDBTasksDataSource.create"
      );
    }
  }

  async findById(taskId: string): Promise<Task | null> {
    try {
      const result = await this.database.findById(taskId);
      return result;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDataSource.findById: ${taskId}`
      );
    }
  }

  async update(taskId: string, task: Partial<Task>): Promise<boolean> {
    try {
      const result = await this.database.updateOne({ taskId }, task);
      return result !== null;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDataSource.update: ${taskId}`
      );
    }
  }
}
