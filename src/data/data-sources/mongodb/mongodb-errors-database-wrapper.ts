import { ErrorDatabaseWrapper } from "../interfaces/data-sources/errors-database-wrapper";
import { Error } from "../../../domain/entities/error";
import { ErrorModel } from "./models/error-model";

export class MongoDBErrorsDatabaseWrapper implements ErrorDatabaseWrapper {
  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Error[]> {
    const skip = (page - 1) * limit;
    return ErrorModel.find({ taskId }).skip(skip).limit(limit).exec();
  }

  async insertOne(doc: any): Promise<any> {
    const error = new ErrorModel(doc);
    await error.save();
    return { insertedId: error._id };
  }

  async countErrorsByTaskId(taskId: string): Promise<number> {
    return ErrorModel.countDocuments({ taskId }).exec();
  }
}
