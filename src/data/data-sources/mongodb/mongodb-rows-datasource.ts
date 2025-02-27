import { Row } from "../../../domain/entities/row";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { RowDataSource } from "../interfaces/data-sources/row-datasource";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

export class MongoDBRowsDataSource implements RowDataSource {
  private database: RowDatabaseWrapper;

  constructor(database: RowDatabaseWrapper) {
    this.database = database;
  }

  async create(row: Row): Promise<boolean> {
    try {
      const result = await this.database.insertOne(row);
      return result !== null;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        "MongoDBRowsDataSource.create"
      );
    }
  }

  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Row[] | null> {
    try {
      const result = await this.database.findByTaskId(taskId, page, limit);
      return result;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBRowsDataSource.findByTaskId: ${taskId}`
      );
    }
  }
}
