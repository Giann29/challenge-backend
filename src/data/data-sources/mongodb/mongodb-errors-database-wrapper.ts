import { ErrorDatabaseWrapper } from "../interfaces/data-sources/errors-database-wrapper";
import { Error } from "../../../domain/entities/error";
import { ErrorModel } from "./models/error-model";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

export class MongoDBErrorsDatabaseWrapper implements ErrorDatabaseWrapper {
  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Error[]> {
    try {
      const skip = (page - 1) * limit;
      return await ErrorModel.find({ taskId }).skip(skip).limit(limit).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `findByTaskId: ${taskId}`
      );
    }
  }

  async insertOne(doc: any): Promise<any> {
    try {
      const error = new ErrorModel(doc);
      await error.save();
      return { insertedId: error._id };
    } catch (err) {
      throw new QueryExecutionException(err as globalThis.Error, "insertOne");
    }
  }

  async countErrorsByTaskId(taskId: string): Promise<number> {
    try {
      return await ErrorModel.countDocuments({ taskId }).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `countErrorsByTaskId: ${taskId}`
      );
    }
  }
}
