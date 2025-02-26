import { Row } from "../../../domain/entities/row";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { RowDataSource } from "../interfaces/data-sources/row-datasource";

export class MongoDBRowsDataSource implements RowDataSource {
  private database: RowDatabaseWrapper;
  constructor(database: RowDatabaseWrapper) {
    this.database = database;
  }
  async create(row: Row): Promise<boolean> {
    const result = await this.database.insertOne(row);
    return result !== null;
  }

  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Row[] | null> {
    const result = await this.database.findByTaskId(taskId, page, limit);
    return result;
  }
}
