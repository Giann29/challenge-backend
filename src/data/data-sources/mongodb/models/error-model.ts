import { Schema, model } from "mongoose";
import { Error } from "../../../../domain/entities/error";

const ErrorSchema = new Schema<Error>({
  taskId: { type: String, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
});

export const ErrorModel = model<Error>("Error", ErrorSchema);
