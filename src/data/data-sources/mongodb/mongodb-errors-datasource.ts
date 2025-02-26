import { Error } from "../../../domain/entities/error";
import { ErrorDatabaseWrapper } from "../interfaces/data-sources/errors-database-wrapper";
import { ErrorsDataSource } from "../interfaces/data-sources/errors-datasource";
import { ErrorModel } from "./models/error-model";

export class MongoDBErrorsDataSource implements ErrorsDataSource {
  private database: ErrorDatabaseWrapper;
  constructor(database: ErrorDatabaseWrapper) {
    this.database = database;
  }
  async create(error: Error): Promise<boolean> {
    const result = await this.database.insertOne(error);
    return result !== null;
  }

  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }> {
    const total = await this.database.countErrorsByTaskId(taskId);
    const errors = await this.database.findByTaskId(taskId, page, limit);
    return { errors, total };
  }
}
