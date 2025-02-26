export interface Task {
  taskId: string;
  status: "pending" | "processing" | "done" | "failed";
}
