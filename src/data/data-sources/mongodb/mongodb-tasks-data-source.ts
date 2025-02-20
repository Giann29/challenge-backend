import { Task } from "../../../domain/entities/task";
import { DatabaseWrapper } from "../interfaces/data-sources/database-wrapper";
import { TasksDataSource } from "../interfaces/data-sources/tasks-datasource";

export class MongoDBTasksDataSource implements TasksDataSource {
    private database: DatabaseWrapper
    constructor(database: DatabaseWrapper) {
        this.database = database
    }
    async create(task: Task): Promise<boolean> {
        const result = await this.database.insertOne(task)
        return result !== null
    }

    async findById(taskId: string): Promise<Task> {
        const result = await this.database.findById(taskId)
        return result;
    }
}
