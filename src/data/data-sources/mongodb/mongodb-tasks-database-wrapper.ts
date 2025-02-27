import { TasksDatabaseWrapper } from "../interfaces/data-sources/tasks-database-wrapper";
import { TaskModel } from "./models/task-model";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

export class MongoDBTasksDatabaseWrapper implements TasksDatabaseWrapper {
  async find(query: object): Promise<any[]> {
    try {
      return await TaskModel.find(query).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDatabaseWrapper.find: ${JSON.stringify(query)}`
      );
    }
  }

  async findById(id: string): Promise<any> {
    try {
      return await TaskModel.findOne({ taskId: id }).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDatabaseWrapper.findById: ${id}`
      );
    }
  }

  async insertOne(doc: any): Promise<any> {
    try {
      const task = new TaskModel(doc);
      await task.save();
      return { insertedId: task._id };
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDatabaseWrapper.insertOne: ${JSON.stringify(doc)}`
      );
    }
  }

  async updateOne(query: object, update: object): Promise<any> {
    try {
      const result = await TaskModel.updateOne(query, update);
      return result.modifiedCount > 0;
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `MongoDBTasksDatabaseWrapper.updateOne: ${JSON.stringify(query)}`
      );
    }
  }
}
