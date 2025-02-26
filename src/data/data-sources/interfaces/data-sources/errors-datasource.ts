import { Error } from "../../../../domain/entities/error";
export interface ErrorsDataSource {
  create(error: Error): Promise<boolean>;
  findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }>;
}
