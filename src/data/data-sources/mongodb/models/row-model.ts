import { Schema, model } from "mongoose";
import { Row } from "../../../../domain/entities/row";

const RowSchema = new Schema<Row>({
  taskId: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  nums: { type: [Number], required: true },
});

export const RowModel = model<Row>("Row", RowSchema);
