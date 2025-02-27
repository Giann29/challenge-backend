import { MongoDBTasksDataSource } from "./mongodb-tasks-data-source";
import { TasksDatabaseWrapper } from "../interfaces/data-sources/tasks-database-wrapper";
import { Task } from "../../../domain/entities/task";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

describe("MongoDBTasksDataSource", () => {
  let databaseWrapper: jest.Mocked<TasksDatabaseWrapper>;
  let tasksDataSource: MongoDBTasksDataSource;

  const sampleTask: Task = {
    taskId: "123",
    status: "pending",
    hasErrors: false,
  };

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<TasksDatabaseWrapper>;

    tasksDataSource = new MongoDBTasksDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should return true if task is created successfully", async () => {
      // Simula una respuesta exitosa del wrapper
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "abcd" });

      const result = await tasksDataSource.create(sampleTask);
      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(sampleTask);
    });

    it("should throw QueryExecutionException on error", async () => {
      const error = new Error("Insert failed");
      databaseWrapper.insertOne.mockRejectedValue(error);

      await expect(tasksDataSource.create(sampleTask)).rejects.toThrow(
        QueryExecutionException
      );
      // También se puede verificar parte del mensaje si es necesario:
      await expect(tasksDataSource.create(sampleTask)).rejects.toThrow(
        /MongoDBTasksDataSource\.create/
      );
    });
  });

  describe("findById", () => {
    it("should return a task if found", async () => {
      databaseWrapper.findById.mockResolvedValue(sampleTask);
      const result = await tasksDataSource.findById(sampleTask.taskId);
      expect(result).toEqual(sampleTask);
      expect(databaseWrapper.findById).toHaveBeenCalledWith(sampleTask.taskId);
    });

    it("should throw QueryExecutionException on error", async () => {
      const error = new Error("Find failed");
      databaseWrapper.findById.mockRejectedValue(error);

      await expect(tasksDataSource.findById("nonexistent")).rejects.toThrow(
        QueryExecutionException
      );
      await expect(tasksDataSource.findById("nonexistent")).rejects.toThrow(
        /MongoDBTasksDataSource\.findById: nonexistent/
      );
    });
  });

  describe("update", () => {
    it("should return true if update is successful", async () => {
      // Simula una respuesta exitosa (por ejemplo, updateOne retorna objeto no nulo)
      databaseWrapper.updateOne.mockResolvedValue({ modifiedCount: 1 });
      const updateFields: Partial<Task> = { status: "done" };

      const result = await tasksDataSource.update(
        sampleTask.taskId,
        updateFields
      );
      expect(result).toBe(true);
      expect(databaseWrapper.updateOne).toHaveBeenCalledWith(
        { taskId: sampleTask.taskId },
        updateFields
      );
    });

    it("should return false if update result is null", async () => {
      databaseWrapper.updateOne.mockResolvedValue(null);
      const updateFields: Partial<Task> = { status: "done" };

      const result = await tasksDataSource.update(
        sampleTask.taskId,
        updateFields
      );
      expect(result).toBe(false);
    });

    it("should throw QueryExecutionException on error", async () => {
      const error = new Error("Update failed");
      databaseWrapper.updateOne.mockRejectedValue(error);
      const updateFields: Partial<Task> = { status: "done" };

      await expect(
        tasksDataSource.update(sampleTask.taskId, updateFields)
      ).rejects.toThrow(QueryExecutionException);
      await expect(
        tasksDataSource.update(sampleTask.taskId, updateFields)
      ).rejects.toThrow(
        new RegExp(`MongoDBTasksDataSource.update: ${sampleTask.taskId}`)
      );
    });
  });
});
