import { Row } from "../../../domain/entities/row";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { RowModel } from "./models/row-model";
import { TaskModel } from "./models/task-model";

export class MongoDBRowsDatabaseWrapper implements RowDatabaseWrapper {
  async findByTaskId(
    taskId: string,
    page: number,
    limit: number
  ): Promise<Row[]> {
    const skip = (page - 1) * limit;
    return RowModel.find({ taskId }).skip(skip).limit(limit).exec();
  }

  async insertOne(doc: any): Promise<any> {
    const row = new RowModel(doc);
    await row.save();
    return { insertedId: row._id };
  }
}
