import { Row } from "../../entities/row";

export interface RowRepository {
  save(row: Row): Promise<Boolean>;
  findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ rows: Row[]; total: number }>;
}
