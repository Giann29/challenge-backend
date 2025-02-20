import { Task } from "../../entities/task";

export interface UploadFileUseCase {
    execute(filePath: string): Promise<Task>;
}