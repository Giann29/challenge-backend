import { MongoDBTasksDataSource } from "./mongodb-tasks-data-source";
import { TasksDatabaseWrapper } from "../interfaces/data-sources/tasks-database-wrapper";
import { Task } from "../../../domain/entities/task";

describe("MongoDBTasksDataSource", () => {
  let tasksDataSource: MongoDBTasksDataSource;
  let databaseWrapper: jest.Mocked<TasksDatabaseWrapper>;

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
    } as unknown as jest.Mocked<TasksDatabaseWrapper>;

    tasksDataSource = new MongoDBTasksDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should create a task and return true", async () => {
      const task: Task = { taskId: "1", status: "pending" };
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "1" });

      const result = await tasksDataSource.create(task);

      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(task);
    });

    it("should return false if creating a task fails", async () => {
      const task: Task = { taskId: "1", status: "pending" };
      databaseWrapper.insertOne.mockResolvedValue(null);

      const result = await tasksDataSource.create(task);

      expect(result).toBe(false);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(task);
    });
  });

  describe("findById", () => {
    it("should find a task by taskId and return it", async () => {
      const task: Task = { taskId: "1", status: "pending" };
      databaseWrapper.findById.mockResolvedValue(task);

      const result = await tasksDataSource.findById("1");

      expect(result).toEqual(task);
      expect(databaseWrapper.findById).toHaveBeenCalledWith("1");
    });

    it("should return null if task is not found", async () => {
      databaseWrapper.findById.mockResolvedValue(null);

      const result = await tasksDataSource.findById("1");

      expect(result).toBeNull();
      expect(databaseWrapper.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a task and return true", async () => {
      const taskUpdate: Partial<Task> = { status: "done" };
      databaseWrapper.updateOne.mockResolvedValue(true);

      const result = await tasksDataSource.update("1", taskUpdate);

      expect(result).toBe(true);
      expect(databaseWrapper.updateOne).toHaveBeenCalledWith(
        { taskId: "1" },
        taskUpdate
      );
    });

    it("should return false if updating a task fails", async () => {
      const taskUpdate: Partial<Task> = { status: "done" };
      databaseWrapper.updateOne.mockResolvedValue(null);

      const result = await tasksDataSource.update("1", taskUpdate);

      expect(result).toBe(false);
      expect(databaseWrapper.updateOne).toHaveBeenCalledWith(
        { taskId: "1" },
        taskUpdate
      );
    });
  });
});
