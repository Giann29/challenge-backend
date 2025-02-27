import { Row } from "../entities/row";
import { RowRepository } from "../interfaces/repositories/row-repository";
import { TaskDataNotFoundException } from "../exceptions/not-found-exception";

export class GetTaskDataImpl {
  constructor(private rowRepository: RowRepository) {}

  async execute(taskId: string, page: number, limit: number): Promise<Row[]> {
    const result = await this.rowRepository.findByTaskId(taskId, page, limit);
    if (!result || result.length === 0) {
      throw new TaskDataNotFoundException(taskId);
    }
    return result;
  }
}
