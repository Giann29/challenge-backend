import { Row } from "../../../../domain/entities/row";

export interface RowDataSource {
  create(contact: Row): Promise<boolean>;
  findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ rows: Row[]; total: number }>;
}
