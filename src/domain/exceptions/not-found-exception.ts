import { BaseException } from "./base-exception";

export class TaskNotFoundException extends BaseException {
  constructor(taskId: string) {
    super(`Task not found with id: ${taskId}`, 404, "TASK_NOT_FOUND");
  }
}

export class TaskDataNotFoundException extends BaseException {
  constructor(taskId: string) {
    super(`Data not found for task id: ${taskId}`, 404, "TASK_DATA_NOT_FOUND");
  }
}

export class TaskErrorsNotFoundException extends BaseException {
  constructor(taskId: string) {
    super(
      `Errors not found for task id: ${taskId}`,
      404,
      "TASK_ERRORS_NOT_FOUND"
    );
  }
}
