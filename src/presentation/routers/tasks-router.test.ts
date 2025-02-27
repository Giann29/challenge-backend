import request from "supertest";
import express from "express";
import TasksRouter from "./tasks-router";
import { GetTaskStatus } from "../../domain/interfaces/use-cases/get-task-status";
import { GetTaskErrors } from "../../domain/interfaces/use-cases/get-task-errors";
import { GetTaskData } from "../../domain/interfaces/use-cases/get-task-data";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("Tasks Router", () => {
  let app: express.Application;
  let getStatusUseCase: GetTaskStatus;
  let getTaskErrors: GetTaskErrors;
  let getTaskData: GetTaskData;
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    getStatusUseCase = {
      execute: jest.fn(),
    } as unknown as GetTaskStatus;

    getTaskErrors = {
      execute: jest.fn(),
    } as unknown as GetTaskErrors;

    getTaskData = {
      execute: jest.fn(),
    } as unknown as GetTaskData;

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri, {} as mongoose.ConnectOptions);
    app = express();
    app.use(express.json());
    app.use(
      "/api/tasks",
      TasksRouter(getStatusUseCase, getTaskErrors, getTaskData)
    );
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("GET /api/tasks/status/:taskId", () => {
    it("should return the task status", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      const task = { taskId, status: "done", hasErrors: false };
      (getStatusUseCase.execute as jest.Mock).mockResolvedValue(task);

      const response = await request(app).get(`/api/tasks/status/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        taskId: task.taskId,
        status: task.status,
        hasErrors: task.hasErrors,
      });
      expect(getStatusUseCase.execute).toHaveBeenCalledWith(taskId);
    });

    it("should return 500 if there is an error", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      (getStatusUseCase.execute as jest.Mock).mockRejectedValue(
        new Error("Failed to get the task status.")
      );

      const response = await request(app).get(`/api/tasks/status/${taskId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to get the task status.",
      });
    });
  });

  describe("GET /api/tasks/errors/:taskId", () => {
    it("should return the task errors", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      const errors = { errors: [{ row: 1, col: 2 }], total: 1 };
      (getTaskErrors.execute as jest.Mock).mockResolvedValue(errors);

      const response = await request(app).get(
        `/api/tasks/errors/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(errors);
      expect(getTaskErrors.execute).toHaveBeenCalledWith(taskId, 1, 10);
    });

    it("should return 500 if there is an error", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      (getTaskErrors.execute as jest.Mock).mockRejectedValue(
        new Error("Failed to get the task errors.")
      );

      const response = await request(app).get(
        `/api/tasks/errors/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to get the task errors.",
      });
    });
  });

  describe("GET /api/tasks/data/:taskId", () => {
    it("should return the task data", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      const data = {
        rows: [{ taskId, name: "John Doe", age: 30, nums: [1, 2, 3] }],
        total: 1,
      };
      (getTaskData.execute as jest.Mock).mockResolvedValue(data);

      const response = await request(app).get(
        `/api/tasks/data/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(data);
      expect(getTaskData.execute).toHaveBeenCalledWith(taskId, 1, 10);
    });

    it("should return 500 if there is an error", async () => {
      const taskId = "ab03adf8-1b62-4d06-bcc6-636183a3cc58";
      (getTaskData.execute as jest.Mock).mockRejectedValue(
        new Error("Failed to get the task data.")
      );

      const response = await request(app).get(
        `/api/tasks/data/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to get the task data.",
      });
    });
  });
});
