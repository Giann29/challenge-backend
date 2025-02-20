import express from 'express';
import 'dotenv/config';
import { connectToDatabase } from './data/data-sources/mongodb/connection';
import uploadRouter from './presentation/routers/upload-router';
import mongoose from 'mongoose';
import { DatabaseWrapper } from './data/data-sources/interfaces/data-sources/database-wrapper';
import { MongoDBTasksDataSource } from './data/data-sources/mongodb/mongodb-tasks-data-source';
import { TaskRepository } from './domain/interfaces/repositories/task-repository';
import { UploadFile } from './domain/use-cases/upload-file';
import { TaskRepositoryImpl } from './domain/repositories/task-repository';

export const app = express();
const port = 3000;

async function initializeDependencies() {
  // Connect to the database
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase();
  }

  // Set up the database wrapper (Mongoose in this case)
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

  // Initialize the data source and repository
  const tasksDataSource = new MongoDBTasksDataSource(databaseWrapper);
  const taskRepository = new TaskRepositoryImpl(tasksDataSource);
  const uploadFileUseCase = new UploadFile(taskRepository)

  // Attach the task router
  app.use('/api', uploadRouter(taskRepository, uploadFileUseCase));
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
  console.error('Failed to start the server:', error);
  process.exit(1);
});