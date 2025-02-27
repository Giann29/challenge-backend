import { Row } from "../entities/row";
import { RowRepository } from "../interfaces/repositories/row-repository";

export class GetTaskDataImpl {
  constructor(private rowRepository: RowRepository) {}

  async execute(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Row[] | null> {
    const result = await this.rowRepository.findByTaskId(taskId, page, limit);
    if (!result || result.length === 0) {
      throw new Error("Data not found for the task id: " + taskId);
    }
    return result;
  }
}
