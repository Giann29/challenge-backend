import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { Error } from "../entities/error";

export class GetTaskErrorsImpl {
  constructor(private errorRepository: ErrorRepository) {}

  async execute(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }> {
    const result = await this.errorRepository.findByTaskId(taskId, page, limit);
    if (result.errors.length === 0) {
      throw new Error("Errors not found for the task id: " + taskId);
    }
    return result;
  }
}
