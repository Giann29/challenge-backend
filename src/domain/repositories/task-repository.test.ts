import { TaskRepositoryImpl } from "./task-repository";
import { TasksDataSource } from "../../data/data-sources/interfaces/data-sources/tasks-datasource";
import { Task } from "../entities/task";

describe("TaskRepositoryImpl", () => {
  let taskRepository: TaskRepositoryImpl;
  let tasksDataSource: jest.Mocked<TasksDataSource>;

  beforeEach(() => {
    tasksDataSource = {
      create: jest.fn(),
      findById: jest.fn<Promise<Task | null>, [string]>(),
      update: jest.fn<Promise<boolean>, [string, Partial<Task>]>(),
    } as jest.Mocked<TasksDataSource>;

    taskRepository = new TaskRepositoryImpl(tasksDataSource);
  });

  describe("save", () => {
    it("should save a task and return true", async () => {
      const task: Task = { taskId: "1", status: "pending" };
      tasksDataSource.create.mockResolvedValue(true);

      const result = await taskRepository.save(task);

      expect(result).toBe(true);
      expect(tasksDataSource.create).toHaveBeenCalledWith(task);
    });
  });

  describe("findById", () => {
    it("should find a task by taskId and return it", async () => {
      const task: Task = { taskId: "1", status: "pending" };
      tasksDataSource.findById.mockResolvedValue(task);

      const result = await taskRepository.findById("1");

      expect(result).toEqual(task);
      expect(tasksDataSource.findById).toHaveBeenCalledWith("1");
    });

    it("should return null if task is not found", async () => {
      tasksDataSource.findById.mockResolvedValue(null);

      const result = await taskRepository.findById("1");

      expect(result).toBeNull();
      expect(tasksDataSource.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a task and return true", async () => {
      const taskUpdate: Partial<Task> = { status: "done" };
      tasksDataSource.update.mockResolvedValue(true);

      const result = await taskRepository.update("1", taskUpdate);

      expect(result).toBe(true);
      expect(tasksDataSource.update).toHaveBeenCalledWith("1", taskUpdate);
    });
  });
});
