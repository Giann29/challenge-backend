import { DatabaseWrapper } from "../interfaces/data-sources/database-wrapper";
import { TaskModel } from "./models/task-model";

export class MongoDBDatabaseWrapper implements DatabaseWrapper {
  async find(query: object): Promise<any[]> {
    return TaskModel.find(query).exec();
  }

  async findById(id: string): Promise<any> {
    return TaskModel.findOne({ taskId: id }).exec();
  }

  async insertOne(doc: any): Promise<any> {
    const task = new TaskModel(doc);
    await task.save();
    return { insertedId: task._id };
  }
  async updateOne(query: object, update: object): Promise<any> {
    const result = await TaskModel.updateOne(query, update);
    return result.modifiedCount > 0; // Return true if the task was updated
  }
}
