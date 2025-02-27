import { UploadFile } from "./upload-file";
import { TaskRepository } from "../interfaces/repositories/task-repository";
import { Task } from "../entities/task";
import { enqueueTask } from "../../data/messaging/rabbitmq";
import { generateTaskId } from "../../shared/utils/generateTaskId";

jest.mock("../../data/messaging/rabbitmq");
jest.mock("../../shared/utils/generateTaskId");

describe("UploadFile", () => {
  let uploadFile: UploadFile;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    uploadFile = new UploadFile(taskRepository);
  });

  it("should upload a file and return a task", async () => {
    const taskId = "12345";
    const filePath = "path/to/file";
    const task: Task = { taskId, status: "pending" };

    (generateTaskId as jest.Mock).mockReturnValue(taskId);
    taskRepository.save.mockResolvedValue(true);

    const result = await uploadFile.execute(filePath);

    expect(result).toEqual(task);
    expect(taskRepository.save).toHaveBeenCalledWith(task);
    expect(enqueueTask).toHaveBeenCalledWith(taskId, filePath);
  });

  it("should throw an error if saving the task fails", async () => {
    const taskId = "12345";
    const filePath = "path/to/file";

    (generateTaskId as jest.Mock).mockReturnValue(taskId);
    taskRepository.save.mockResolvedValue(false);

    await expect(uploadFile.execute(filePath)).rejects.toThrow(
      "Failed to save the task."
    );
  });
});
