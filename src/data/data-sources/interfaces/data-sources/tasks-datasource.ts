import { Task } from "../../../../domain/entities/task";

export interface TasksDataSource {
    create(contact: Task): Promise<boolean>;
    findById(taskId: string): Promise<Task>;
}