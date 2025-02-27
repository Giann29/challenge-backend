import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import TasksRouter from "./tasks-router";
import { GetTaskStatus } from "../../domain/interfaces/use-cases/get-task-status";
import { GetTaskErrors } from "../../domain/interfaces/use-cases/get-task-errors";
import { GetTaskData } from "../../domain/interfaces/use-cases/get-task-data";

const validToken = jwt.sign(
  { permissions: ["READ_TASKS"] },
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
);
const invalidToken = "invalid.token.value";

// Mocks de casos de uso
const getStatusUseCase: jest.Mocked<GetTaskStatus> = {
  execute: jest.fn(),
};
const getTaskErrors: jest.Mocked<GetTaskErrors> = {
  execute: jest.fn(),
};
const getTaskData: jest.Mocked<GetTaskData> = {
  execute: jest.fn(),
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  // Se monta el router en la ruta /api/tasks
  app.use(
    "/api/tasks",
    TasksRouter(getStatusUseCase, getTaskErrors, getTaskData)
  );
  // Middleware para manejo de errores (opcional para tests)
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.statusCode || 500).json({
        status: "error",
        code: err.errorCode || "UNKNOWN_ERROR",
        message: err.message,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  );
  return app;
};

describe("Tasks Router", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks/status/:taskId", () => {
    it("should return the task status when the token is valid", async () => {
      const sampleTask = { taskId: "123", status: "done", hasErrors: false };
      getStatusUseCase.execute.mockResolvedValue({
        taskId: "123",
        status: "done",
        hasErrors: false,
      });

      const response = await request(buildApp())
        .get("/api/tasks/status/123")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        taskId: sampleTask.taskId,
        status: sampleTask.status,
        hasErrors: sampleTask.hasErrors,
      });
      expect(getStatusUseCase.execute).toHaveBeenCalledWith("123");
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(buildApp()).get("/api/tasks/status/123");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: "Unauthorized: No token provided",
      });
    });

    it("should return 401 if the token is invalid", async () => {
      const response = await request(buildApp())
        .get("/api/tasks/status/123")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: "Unauthorized: Invalid token",
      });
    });
  });

  describe("GET /api/tasks/data/:taskId", () => {
    it("should return the task data when the token is valid", async () => {
      const sampleRows = [
        { taskId: "123", name: "John", age: 30, nums: [1, 2, 3] },
        { taskId: "123", name: "Jane", age: 25, nums: [4, 5, 6] },
      ];
      const result = { rows: sampleRows, total: 2 };
      getTaskData.execute.mockResolvedValue(result);

      const response = await request(buildApp())
        .get("/api/tasks/data/123?page=1&limit=10")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(result);
      expect(getTaskData.execute).toHaveBeenCalledWith("123", 1, 10);
    });
  });

  describe("GET /api/tasks/errors/:taskId", () => {
    it("should return the task errors when the token is valid", async () => {
      const errorsResult = {
        errors: [{ taskId: "123", row: 1, col: 2 }],
        total: 1,
      };
      getTaskErrors.execute.mockResolvedValue(errorsResult);

      const response = await request(buildApp())
        .get("/api/tasks/errors/123?page=1&limit=10")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(errorsResult);
      expect(getTaskErrors.execute).toHaveBeenCalledWith("123", 1, 10);
    });
  });
});
