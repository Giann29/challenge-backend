import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import path from "path";
import UploadRouter from "./upload-router";
import { UploadFileUseCase } from "../../domain/interfaces/use-cases/upload-file-use-case";
import { Task } from "../../domain/entities/task";

const VALID_SECRET =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const validToken = jwt.sign({ permissions: ["UPLOAD_FILES"] }, VALID_SECRET);
const tokenWithoutPermissions = jwt.sign({ permissions: [] }, VALID_SECRET);

describe("Upload Router", () => {
  let app: express.Application;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;

  beforeEach(() => {
    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    app = express();
    app.use(express.json());
    // Mount the UploadRouter on the root path
    app.use("/", UploadRouter(uploadFileUseCase));

    // Error-handling middleware to catch and return errors as JSON
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        res.status(err.statusCode || 500).json({
          error: err.message || "Internal server error",
        });
      }
    );
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", "test/Mixed.xlsx"); // ensure this file exists for tests

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized: No token provided",
    });
  });

  it("should return 403 if token does not include required permissions", async () => {
    const response = await request(app)
      .post("/upload")
      .set("Authorization", `Bearer ${tokenWithoutPermissions}`)
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden: You do not have permission to access this resource.",
    });
  });

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app)
      .post("/upload")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "No file uploaded.",
    });
  });

  it("should process the file and return task info when file is uploaded successfully", async () => {
    const fakeTask: Task = { taskId: "task123", status: "pending" };
    uploadFileUseCase.execute.mockResolvedValue(fakeTask);

    const response = await request(app)
      .post("/upload")
      .set("Authorization", `Bearer ${validToken}`)
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      taskId: fakeTask.taskId,
      filePath: expect.any(String),
    });
    expect(uploadFileUseCase.execute).toHaveBeenCalledWith(expect.any(String));
  });

  it("should handle errors thrown by uploadFileUseCase.execute", async () => {
    uploadFileUseCase.execute.mockRejectedValue(new Error("Test error"));

    const response = await request(app)
      .post("/upload")
      .set("Authorization", `Bearer ${validToken}`)
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Test error" });
  });
});
