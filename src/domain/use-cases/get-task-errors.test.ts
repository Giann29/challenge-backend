import { GetTaskErrorsImpl } from "./get-task-errors";
import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { Error } from "../entities/error";

describe("GetTaskErrorsImpl", () => {
  let getTaskErrors: GetTaskErrorsImpl;
  let errorRepository: jest.Mocked<ErrorRepository>;

  beforeEach(() => {
    errorRepository = {
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorRepository>;

    getTaskErrors = new GetTaskErrorsImpl(errorRepository);
  });

  it("should return the task errors", async () => {
    const taskId = "12345";
    const errors: Error[] = [{ taskId, row: 1, col: 2 }];
    const total = errors.length;

    errorRepository.findByTaskId.mockResolvedValue({ errors, total });

    const result = await getTaskErrors.execute(taskId, 1, 10);

    expect(result).toEqual({ errors, total });
    expect(errorRepository.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
  });

  it("should throw an error if no errors are found", async () => {
    const taskId = "12345";

    errorRepository.findByTaskId.mockResolvedValue({ errors: [], total: 0 });

    await expect(getTaskErrors.execute(taskId, 1, 10)).rejects.toThrow(
      "Errors not found for the task id: " + taskId
    );
  });
});
