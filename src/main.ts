import express from "express";
import "dotenv/config";
import { connectToDatabase } from "./data/data-sources/mongodb/connection";
import uploadRouter from "./presentation/routers/upload-router";
import mongoose from "mongoose";
import { MongoDBTasksDataSource } from "./data/data-sources/mongodb/mongodb-tasks-data-source";
import { UploadFile } from "./domain/use-cases/upload-file";
import { TaskRepositoryImpl } from "./domain/repositories/task-repository";
import { MongoDBTasksDatabaseWrapper } from "./data/data-sources/mongodb/mongodb-tasks-database-wrapper";
import tasksRouter from "./presentation/routers/tasks-router";
import { GetTaskStatusImpl } from "./domain/use-cases/get-task-status";
import { MongoDBErrorsDatabaseWrapper } from "./data/data-sources/mongodb/mongodb-errors-database-wrapper";
import { MongoDBErrorsDataSource } from "./data/data-sources/mongodb/mongodb-errors-datasource";
import { ErrorRepositoryImpl } from "./domain/repositories/error-repository";
import { GetTaskErrorsImpl } from "./domain/use-cases/get-task-errors";
import { MongoDBRowsDatabaseWrapper } from "./data/data-sources/mongodb/mongodb-rows-database-wrapper";
import { MongoDBRowsDataSource } from "./data/data-sources/mongodb/mongodb-rows-datasource";
import { RowRepositoryImpl } from "./domain/repositories/row-repository";
import { GetTaskDataImpl } from "./domain/use-cases/get-task-data";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { checkPermissions } from "./middleware/check-permissions";

export const app = express();
const port = 3000;

async function initializeDependencies() {
  // Connect to the database
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase();
  }

  // Set up the database wrapper (Mongoose in this case)
  const tasksdatabaseWrapper = new MongoDBTasksDatabaseWrapper();
  const errorsDatabaseWrapper = new MongoDBErrorsDatabaseWrapper();
  const rowsDatabaseWrapper = new MongoDBRowsDatabaseWrapper();

  // Initialize the data source and repository
  const tasksDataSource = new MongoDBTasksDataSource(tasksdatabaseWrapper);
  const errorsDataSource = new MongoDBErrorsDataSource(errorsDatabaseWrapper);
  const rowsDataSource = new MongoDBRowsDataSource(rowsDatabaseWrapper);
  const taskRepository = new TaskRepositoryImpl(tasksDataSource);
  const errorsRepository = new ErrorRepositoryImpl(errorsDataSource);
  const rowRepository = new RowRepositoryImpl(rowsDataSource);
  const uploadFileUseCase = new UploadFile(taskRepository);
  const getStatusUseCase = new GetTaskStatusImpl(
    taskRepository,
    errorsRepository
  );
  const getTaskErrorsUseCase = new GetTaskErrorsImpl(errorsRepository);
  const getTaskDataUseCase = new GetTaskDataImpl(rowRepository);

  app.use(express.json());

  app.use(
    "/api/upload",
    uploadRouter(uploadFileUseCase),
    checkPermissions(["UPLOAD_FILES"])
  );
  app.use(
    "/api/tasks",
    tasksRouter(getStatusUseCase, getTaskErrorsUseCase, getTaskDataUseCase),
    checkPermissions(["READ_TASKS"])
  );

  app.use("*", notFoundHandler);

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
