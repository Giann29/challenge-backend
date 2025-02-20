import request from "supertest";
import { app } from "../../main";
import { TaskRepositoryImpl } from "../../domain/repositories/task-repository";
import { MongoDBTasksDataSource } from "../../data/data-sources/mongodb/mongodb-tasks-data-source";
import { DatabaseWrapper } from "../../data/data-sources/interfaces/data-sources/database-wrapper";
import mongoose from 'mongoose';
import amqp from 'amqplib';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe("POST /upload", () => {
  let taskRepository: TaskRepositoryImpl;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri, {} as mongoose.ConnectOptions);

    const databaseWrapper: DatabaseWrapper = {
        find: async (query: object) => {
            if (!mongoose.connection.db) {
                throw new Error('Database connection is not ready.');
            }
            return mongoose.connection.db.collection('tasks').find(query).toArray();
        },
        findById: async (id: string) => {
            if (!mongoose.connection.db) {
                throw new Error('Database connection is not ready.');
            }
            return mongoose.connection.db.collection('tasks').findOne({ taskId: id });
        },
        insertOne: async (doc: any) => {
            if (!mongoose.connection.db) {
                throw new Error('Database connection is not ready.');
            }
            return mongoose.connection.db.collection('tasks').insertOne(doc);
        },
    };

    const tasksDataSource = new MongoDBTasksDataSource(databaseWrapper);
    taskRepository = new TaskRepositoryImpl(tasksDataSource);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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
  });

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/api/upload");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No file uploaded.");
  });
});