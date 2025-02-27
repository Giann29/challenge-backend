import { GetTaskStatusImpl } from "./get-task-status";
import { TaskRepository } from "../interfaces/repositories/task-repository";
import { ErrorRepository } from "../interfaces/repositories/error-repository";
import { Task } from "../entities/task";

describe("GetTaskStatusImpl", () => {
  let getTaskStatus: GetTaskStatusImpl;
  let taskRepository: jest.Mocked<TaskRepository>;
  let errorRepository: jest.Mocked<ErrorRepository>;

  beforeEach(() => {
    taskRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    errorRepository = {
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorRepository>;

    getTaskStatus = new GetTaskStatusImpl(taskRepository, errorRepository);
  });

  it("should return the task status", async () => {
    const taskId = "12345";
    const task: Task = { taskId, status: "done", hasErrors: false };
    const errors = { errors: [], total: 0 };

    taskRepository.findById.mockResolvedValue(task);
    errorRepository.findByTaskId.mockResolvedValue(errors);

    const result = await getTaskStatus.execute(taskId);

    expect(result).toEqual(task);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(errorRepository.findByTaskId).toHaveBeenCalledWith(taskId, 1, 1);
  });

  it("should throw an error if the task is not found", async () => {
    const taskId = "12345";

    taskRepository.findById.mockResolvedValue(null);

    await expect(getTaskStatus.execute(taskId)).rejects.toThrow(
      "Task not found."
    );
  });
});
