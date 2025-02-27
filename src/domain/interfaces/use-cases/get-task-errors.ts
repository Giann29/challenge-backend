import { Error } from "../../entities/error";
export interface GetTaskErrors {
  execute(
    taskId: string,
    page: number,
    limit: number
  ): Promise<{ errors: Error[]; total: number }>;
}
