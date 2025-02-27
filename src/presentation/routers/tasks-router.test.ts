import express from "express";
import request from "supertest";
import TasksRouter from "./tasks-router";
import { GetTaskStatus } from "../../domain/interfaces/use-cases/get-task-status";
import { GetTaskErrors } from "../../domain/interfaces/use-cases/get-task-errors";
import { GetTaskData } from "../../domain/interfaces/use-cases/get-task-data";
import { Task } from "../../domain/entities/task";
import { Row } from "../../domain/entities/row";
import { Error as TaskError } from "../../domain/entities/error";
import {
  TaskNotFoundException,
  TaskDataNotFoundException,
  TaskErrorsNotFoundException,
} from "../../domain/exceptions/not-found-exception";
import { errorHandler } from "../../middleware/error-handler";

describe("Tasks Router", () => {
  let app: express.Application;
  let getStatusUseCase: jest.Mocked<GetTaskStatus>;
  let getTaskErrors: jest.Mocked<GetTaskErrors>;
  let getTaskData: jest.Mocked<GetTaskData>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    getStatusUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTaskStatus>;
    getTaskErrors = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTaskErrors>;
    getTaskData = { execute: jest.fn() } as unknown as jest.Mocked<GetTaskData>;

    app = express();
    // Simulate the permissions middleware
    app.use((req, res, next) => {
      req.user = { permissions: ["READ_TASKS", "UPLOAD_FILES"] };
      next();
    });
    app.use(express.json());
    app.use(
      "/api/tasks",
      TasksRouter(getStatusUseCase, getTaskErrors, getTaskData)
    );
    // Errors middleware
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        errorHandler(err, req, res, next);
      }
    );
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("GET /api/tasks/status/:taskId", () => {
    it("should return the task status with proper data", async () => {
      const task: Task = { taskId: "123", status: "done", hasErrors: false };
      getStatusUseCase.execute.mockResolvedValue(task);

      const response = await request(app).get("/api/tasks/status/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        taskId: "123",
        status: "done",
        hasErrors: false,
      });
      expect(getStatusUseCase.execute).toHaveBeenCalledWith("123");
    });

    it("should return 404 if task is not found", async () => {
      const taskId = "404";
      getStatusUseCase.execute.mockRejectedValue(
        new TaskNotFoundException(taskId)
      );

      const response = await request(app).get(`/api/tasks/status/${taskId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: "error",
        code: "TASK_NOT_FOUND",
        message: `Task not found with id: ${taskId}`,
        path: `/api/tasks/status/${taskId}`,
        timestamp: expect.any(String),
      });
    });

    it("should return 403 if permissions are missing", async () => {
      // Creates a new instance of the app without the permissions
      const appNoPermissions = express();
      appNoPermissions.use((req, res, next) => {
        req.user = { permissions: [] };
        next();
      });
      appNoPermissions.use(express.json());
      appNoPermissions.use(
        "/api/tasks",
        TasksRouter(getStatusUseCase, getTaskErrors, getTaskData)
      );
      appNoPermissions.use(
        (
          err: any,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          errorHandler(err, req, res, next);
        }
      );

      const response = await request(appNoPermissions).get(
        "/api/tasks/status/123"
      );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: "Forbidden: You do not have permission to access this resource.",
      });
    });
  });

  describe("GET /api/tasks/data/:taskId", () => {
    it("should return the task data", async () => {
      const rows: Row[] = [
        { taskId: "123", name: "John", age: 30, nums: [1, 2, 3] },
        { taskId: "123", name: "Jane", age: 25, nums: [4, 5, 6] },
      ];
      getTaskData.execute.mockResolvedValue(rows);

      const response = await request(app).get(
        "/api/tasks/data/123?page=1&limit=10"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(rows);
      expect(getTaskData.execute).toHaveBeenCalledWith("123", 1, 10);
    });

    it("should return 404 if no task data is found", async () => {
      const taskId = "404";
      getTaskData.execute.mockRejectedValue(
        new TaskDataNotFoundException(taskId)
      );

      const response = await request(app).get(
        `/api/tasks/data/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: "error",
        code: "TASK_DATA_NOT_FOUND",
        message: `Data not found for task id: ${taskId}`,
        path: `/api/tasks/data/${taskId}`,
        timestamp: expect.any(String),
      });
    });
  });

  describe("GET /api/tasks/errors/:taskId", () => {
    it("should return the task errors", async () => {
      const errorsResult = {
        errors: [{ taskId: "123", row: 1, col: 2 } as TaskError],
        total: 1,
      };
      getTaskErrors.execute.mockResolvedValue(errorsResult);

      const response = await request(app).get(
        "/api/tasks/errors/123?page=1&limit=10"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(errorsResult);
      expect(getTaskErrors.execute).toHaveBeenCalledWith("123", 1, 10);
    });

    it("should return 404 if no task errors are found", async () => {
      const taskId = "404";
      getTaskErrors.execute.mockRejectedValue(
        new TaskErrorsNotFoundException(taskId)
      );

      const response = await request(app).get(
        `/api/tasks/errors/${taskId}?page=1&limit=10`
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: "error",
        code: "TASK_ERRORS_NOT_FOUND",
        message: `Errors not found for task id: ${taskId}`,
        path: `/api/tasks/errors/${taskId}`,
        timestamp: expect.any(String),
      });
    });
  });
});
