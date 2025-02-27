import { Task } from "../../entities/task";

export interface GetTaskStatus {
  execute(taskId: string): Promise<Task>;
}
