import { ErrorsDataSource } from "../../data/data-sources/interfaces/data-sources/errors-datasource";
import { Error } from "../entities/error";
import { ErrorRepository } from "../interfaces/repositories/error-repository";

export class ErrorRepositoryImpl implements ErrorRepository {
  errorsDataSource: ErrorsDataSource;

  constructor(errorsDataSource: ErrorsDataSource) {
    this.errorsDataSource = errorsDataSource;
  }

  async save(error: Error): Promise<boolean> {
    const result = await this.errorsDataSource.create(error);
    return result;
  }

  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }> {
    const result = await this.errorsDataSource.findByTaskId(
      taskId,
      page,
      limit
    );
    return result;
  }
}
