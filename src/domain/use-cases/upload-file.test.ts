import { UploadFile } from "./upload-file";
import { TaskRepository } from "../interfaces/repositories/task-repository";
import { Task } from "../entities/task";
import { enqueueTask } from "../../data/messaging/rabbitmq";
import { generateTaskId } from "../../shared/utils/generateTaskId";
import { TaskSaveException } from "../exceptions/database-exception";

// Mock external dependencies.
jest.mock("../../data/messaging/rabbitmq", () => ({
  enqueueTask: jest.fn(),
}));

jest.mock("../../shared/utils/generateTaskId", () => ({
  generateTaskId: jest.fn(),
}));

describe("UploadFile Use Case", () => {
  let taskRepository: jest.Mocked<TaskRepository>;
  let uploadFile: UploadFile;
  const fakeFilePath = "path/to/file.txt";
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // Create a mock implementation of TaskRepository
    taskRepository = {
      save: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    // Force generateTaskId() to return a fixed taskId.
    (generateTaskId as jest.Mock).mockReturnValue("test-task-01");

    // Clear any previous call history for enqueueTask.
    (enqueueTask as jest.Mock).mockClear();

    uploadFile = new UploadFile(taskRepository);
  });

  it("should create a new task, save it, enqueue the task, and return the task", async () => {
    // Simulate a successful save.
    taskRepository.save.mockResolvedValue(true);

    const result = await uploadFile.execute(fakeFilePath);

    expect(result).toEqual({ taskId: "test-task-01", status: "pending" });
    expect(taskRepository.save).toHaveBeenCalledWith({
      taskId: "test-task-01",
      status: "pending",
    });
    expect(enqueueTask).toHaveBeenCalledWith("test-task-01", fakeFilePath);
  });

  it("should throw TaskSaveException if taskRepository.save returns false", async () => {
    // Simulate a failure in saving the task.
    taskRepository.save.mockResolvedValue(false);

    await expect(uploadFile.execute(fakeFilePath)).rejects.toThrow(
      TaskSaveException
    );
    expect(taskRepository.save).toHaveBeenCalledWith({
      taskId: "test-task-01",
      status: "pending",
    });
    // Ensure enqueueTask is not called if saving fails.
    expect(enqueueTask).not.toHaveBeenCalled();
  });
});
