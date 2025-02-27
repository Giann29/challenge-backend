import { Row } from "../../entities/row";
export interface GetTaskData {
  execute(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ rows: Row[]; total: number }>;
}
