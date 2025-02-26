import request from "supertest";
import { app } from "../../main";
import { TaskRepositoryImpl } from "../../domain/repositories/task-repository";
import { MongoDBTasksDataSource } from "../../data/data-sources/mongodb/mongodb-tasks-data-source";
import { TasksDatabaseWrapper } from "../../data/data-sources/interfaces/data-sources/tasks-database-wrapper";
import mongoose from "mongoose";
import amqp from "amqplib";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoDBTasksDatabaseWrapper } from "../../data/data-sources/mongodb/mongodb-tasks-database-wrapper";
import fs from "fs/promises";

describe("POST /upload", () => {
  let taskRepository: TaskRepositoryImpl;
  let mongoServer: MongoMemoryServer;
  let connection: amqp.Connection;
  let channel: amqp.Channel;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri, {} as mongoose.ConnectOptions);

    const databaseWrapper = new MongoDBTasksDatabaseWrapper();
    const tasksDataSource = new MongoDBTasksDataSource(databaseWrapper);
    taskRepository = new TaskRepositoryImpl(tasksDataSource);

    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await channel.close();
    await connection.close();
  });

  it("should upload a file and return a task ID", async () => {
    console.log("Starting test: should upload a file and return a task ID");
    const response = await request(app)
      .post("/api/upload")
      .attach("file", "test/Mixed.xlsx"); // Ensure this file exists

    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.taskId).toBeDefined();

    // Verify the task was saved in the database
    const task = await taskRepository.findById(response.body.taskId);
    expect(task).toBeDefined();
    expect(task?.status).toBe("pending");

    // Delete the uploaded file
    await fs.unlink(`${response.body.filePath}`);

    // Remove the message from the queue
    const queue = "file_processing";
    await channel.assertQueue(queue, { durable: true });
    await new Promise<void>((resolve, reject) => {
      channel.consume(
        queue,
        (message) => {
          if (message) {
            channel.ack(message);
            resolve();
          } else {
            reject(new Error("No message found in the queue"));
          }
        },
        { noAck: false }
      );
    });
  }, 10000);

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/api/upload");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No file uploaded.");
  });
});
