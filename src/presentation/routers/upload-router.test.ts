import express from "express";
import request from "supertest";
import fs from "fs/promises";
import UploadRouter from "./upload-router";
import { UploadFileUseCase } from "../../domain/interfaces/use-cases/upload-file-use-case";
import { TaskSaveException } from "../../domain/exceptions/database-exception";
import { errorHandler } from "../../middleware/error-handler";

// Mocks for use case dependencies are assumed to be set up in jest.config.js or similar.
jest.mock("../../data/messaging/rabbitmq");
jest.mock("../../shared/utils/generateTaskId");

describe("Upload Router", () => {
  let app: express.Application;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy to suppress error logs from appearing in test output
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    app = express();
    // Middleware to simulate an authenticated user with proper permissions
    app.use((req, res, next) => {
      req.user = { permissions: ["READ_TASKS", "UPLOAD_FILES"] };
      next();
    });
    app.use(express.json());
    // Mount the UploadRouter at root
    app.use("/", UploadRouter(uploadFileUseCase));
    // Error handler to catch thrown errors
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

  it("should upload a file and return a taskId and filePath", async () => {
    const taskId = "12345";
    // Simulate successful task creation
    uploadFileUseCase.execute.mockResolvedValue({ taskId, status: "pending" });

    const response = await request(app)
      .post("/upload")
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      taskId,
      filePath: expect.any(String),
    });
    expect(uploadFileUseCase.execute).toHaveBeenCalledWith(expect.any(String));

    // Optionally, clean up the uploaded file if needed.
    if (response.body.filePath) {
      await fs.unlink(response.body.filePath);
    }
  });

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/upload");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "No file uploaded." });
  });

  it("should return 403 if permissions are missing", async () => {
    const appNoPermissions = express();
    // Simulate a user without required permissions
    appNoPermissions.use((req, res, next) => {
      req.user = { permissions: [] };
      next();
    });
    appNoPermissions.use(express.json());
    appNoPermissions.use("/", UploadRouter(uploadFileUseCase));
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

    const response = await request(appNoPermissions)
      .post("/upload")
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden: You do not have permission to access this resource.",
    });
  });

  it("should return 500 if there is an error during file upload", async () => {
    // Simulate failure in the upload use case
    uploadFileUseCase.execute.mockRejectedValue(new TaskSaveException());

    const response = await request(app)
      .post("/upload")
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      status: "error",
      code: "TASK_SAVE_ERROR",
      message: "Failed to save the task",
      path: "/upload",
      timestamp: expect.any(String),
    });
    // Optionally, verify that the error has been reported to console.error.
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
