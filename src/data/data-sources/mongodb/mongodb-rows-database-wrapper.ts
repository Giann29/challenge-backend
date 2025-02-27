import { Row } from "../../../domain/entities/row";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { RowModel } from "./models/row-model";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

export class MongoDBRowsDatabaseWrapper implements RowDatabaseWrapper {
  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Row[]> {
    try {
      const skip = (page - 1) * limit;
      return await RowModel.find({ taskId }).skip(skip).limit(limit).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `findByTaskId: ${taskId}`
      );
    }
  }

  async insertOne(doc: any): Promise<any> {
    try {
      const row = new RowModel(doc);
      await row.save();
      return { insertedId: row._id };
    } catch (err) {
      throw new QueryExecutionException(err as globalThis.Error, "insertOne");
    }
  }

  async countErrorsByTaskId(taskId: string): Promise<number> {
    try {
      return await RowModel.countDocuments({ taskId }).exec();
    } catch (err) {
      throw new QueryExecutionException(
        err as globalThis.Error,
        `countErrorsByTaskId: ${taskId}`
      );
    }
  }
}
