import { Task } from "../../entities/task";

export interface TaskRepository {
    save(task: Task): Promise<Boolean>;

    findById(taskId: string): Promise<Task | null>;
    
}