import { GetTaskErrorsImpl } from "./get-task-errors";
import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { TaskErrorsNotFoundException } from "../exceptions/not-found-exception";
import { Error as TaskError } from "../entities/error";

describe("GetTaskErrorsImpl", () => {
  let errorRepository: jest.Mocked<ErrorRepository>;
  let getTaskErrors: GetTaskErrorsImpl;

  beforeEach(() => {
    errorRepository = {
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorRepository>;

    getTaskErrors = new GetTaskErrorsImpl(errorRepository);
  });

  it("should return the task errors if found", async () => {
    const taskId = "12345";
    const errors: TaskError[] = [
      { taskId, row: 1, col: 2 },
      { taskId, row: 2, col: 3 },
    ];
    const total = errors.length;

    errorRepository.findByTaskId.mockResolvedValue({ errors, total });

    const result = await getTaskErrors.execute(taskId, 1, 10);

    expect(errorRepository.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    expect(result).toEqual({ errors, total });
  });

  it("should throw TaskErrorsNotFoundException if no errors are found", async () => {
    const taskId = "12345";

    errorRepository.findByTaskId.mockResolvedValue({ errors: [], total: 0 });

    await expect(getTaskErrors.execute(taskId, 1, 10)).rejects.toThrow(
      TaskErrorsNotFoundException
    );
    await expect(getTaskErrors.execute(taskId, 1, 10)).rejects.toMatchObject({
      message: `Errors not found for task id: ${taskId}`,
      statusCode: 404,
      errorCode: "TASK_ERRORS_NOT_FOUND",
    });
  });
});
