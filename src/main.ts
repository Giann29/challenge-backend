import express from "express";
import "dotenv/config";
import { connectToDatabase } from "./data/data-sources/mongodb/connection";
import uploadRouter from "./presentation/routers/upload-router";
import mongoose from "mongoose";
import { MongoDBTasksDataSource } from "./data/data-sources/mongodb/mongodb-tasks-data-source";
import { UploadFile } from "./domain/use-cases/upload-file";
import { TaskRepositoryImpl } from "./domain/repositories/task-repository";
import { MongoDBTasksDatabaseWrapper } from "./data/data-sources/mongodb/mongodb-tasks-database-wrapper";

export const app = express();
const port = 3000;

async function initializeDependencies() {
  // Connect to the database
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase();
  }

  // Set up the database wrapper (Mongoose in this case)
  const tasksdatabaseWrapper = new MongoDBTasksDatabaseWrapper();

  // Initialize the data source and repository
  const tasksDataSource = new MongoDBTasksDataSource(tasksdatabaseWrapper);
  const taskRepository = new TaskRepositoryImpl(tasksDataSource);
  const uploadFileUseCase = new UploadFile(taskRepository);

  // Attach the task router
  app.use("/api", uploadRouter(taskRepository, uploadFileUseCase));
}

// Start the server
async function startServer() {
  const PORT = process.env.PORT || 3000;

  await initializeDependencies();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Handle startup errors
startServer().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
