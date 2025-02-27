import { RowDataSource } from "../../data/data-sources/interfaces/data-sources/row-datasource";
import { Row } from "../entities/row";
import { RowRepository } from "../interfaces/repositories/row-repository";

export class RowRepositoryImpl implements RowRepository {
  rowsDataSource: RowDataSource;

  constructor(rowsDataSource: RowDataSource) {
    this.rowsDataSource = rowsDataSource;
  }
  async save(row: Row): Promise<Boolean> {
    const result = await this.rowsDataSource.create(row);
    return result;
  }

  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ rows: Row[]; total: number }> {
    return await this.rowsDataSource.findByTaskId(taskId, page, limit);
  }
}
