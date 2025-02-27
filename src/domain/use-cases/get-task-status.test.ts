import { GetTaskStatusImpl } from "./get-task-status";
import { TaskRepository } from "../interfaces/repositories/task-repository";
import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { TaskNotFoundException } from "../exceptions/not-found-exception";
import { Task } from "../entities/task";

describe("GetTaskStatusImpl", () => {
  let taskRepository: jest.Mocked<TaskRepository>;
  let errorsRepository: jest.Mocked<ErrorRepository>;
  let getTaskStatus: GetTaskStatusImpl;

  beforeEach(() => {
    taskRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    errorsRepository = {
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorRepository>;

    getTaskStatus = new GetTaskStatusImpl(taskRepository, errorsRepository);
  });

  it("should return the task status with hasErrors set to false when no errors exist", async () => {
    const taskId = "12345";
    const task: Task = { taskId, status: "done" };
    const errorsResult = { errors: [], total: 0 };

    taskRepository.findById.mockResolvedValue(task);
    errorsRepository.findByTaskId.mockResolvedValue(errorsResult);

    const result = await getTaskStatus.execute(taskId);

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(errorsRepository.findByTaskId).toHaveBeenCalledWith(taskId, 1, 1);
    expect(result).toEqual({ ...task, hasErrors: false });
  });

  it("should return the task status with hasErrors set to true when errors exist", async () => {
    const taskId = "12345";
    const task: Task = { taskId, status: "done" };
    const errorsResult = { errors: [{ taskId, row: 1, col: 2 }], total: 1 };

    taskRepository.findById.mockResolvedValue(task);
    errorsRepository.findByTaskId.mockResolvedValue(errorsResult);

    const result = await getTaskStatus.execute(taskId);

    expect(result).toEqual({ ...task, hasErrors: true });
  });

  it("should throw TaskNotFoundException if the task is not found", async () => {
    const taskId = "nonexistent";
    taskRepository.findById.mockResolvedValue(null);

    await expect(getTaskStatus.execute(taskId)).rejects.toThrow(
      TaskNotFoundException
    );
    await expect(getTaskStatus.execute(taskId)).rejects.toMatchObject({
      message: `Task not found with id: ${taskId}`,
      statusCode: 404,
      errorCode: "TASK_NOT_FOUND",
    });
  });
});
