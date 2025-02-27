import request from "supertest";
import express from "express";
import uploadRouter from "./upload-router";
import { UploadFileUseCase } from "../../domain/interfaces/use-cases/upload-file-use-case";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

describe("Upload Router", () => {
  let app: express.Application;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;

  beforeEach(() => {
    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    app = express();
    app.use(express.json());
    app.use("/api", uploadRouter(uploadFileUseCase));
  });

  it("should upload a file and return a task ID", async () => {
    const taskId = "12345";

    uploadFileUseCase.execute.mockResolvedValue({ taskId, status: "pending" });

    const response = await request(app)
      .post("/api/upload")
      .attach("file", "test/Mixed.xlsx");

    expect(response.status).toBe(200);
    expect(response.body.taskId).toBe(taskId);

    await fs.unlink(`${response.body.filePath}`);
  });

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/api/upload");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No file uploaded.");
  });

  it("should return 500 if there is an error during file upload", async () => {
    const filePath = path.join(__dirname, "test-file.txt");
    await fs.writeFile(filePath, "test content");

    uploadFileUseCase.execute.mockRejectedValue(
      new Error("Failed to upload file.")
    );

    const response = await request(app)
      .post("/api/upload")
      .attach("file", filePath);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Failed to upload file.");

    await fs.unlink(filePath);
  });
});
