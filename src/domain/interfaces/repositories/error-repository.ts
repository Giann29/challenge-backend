import { Error } from "../../entities/error";

export interface ErrorRepository {
  save(row: Error): Promise<Boolean>;
  findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }>;
}
