import { BaseException } from "./base-exception";

export class TaskSaveException extends BaseException {
  constructor() {
    super("Failed to save the task", 500, "TASK_SAVE_ERROR");
  }
}

export class DatabaseConnectionException extends BaseException {
  constructor(message = "Failed to connect to the database") {
    super(message, 500, "DATABASE_CONNECTION_ERROR");
  }
}

export class QueryExecutionException extends BaseException {
  constructor(error: Error, query?: string) {
    super(
      `Query failed${query ? " [" + query + "]" : ""}: ${error.message}`,
      500,
      "QUERY_EXECUTION_ERROR"
    );
  }
}
