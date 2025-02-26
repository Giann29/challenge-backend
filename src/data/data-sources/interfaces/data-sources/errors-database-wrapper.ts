export interface ErrorDatabaseWrapper {
  insertOne(doc: any): Promise<any>;
  findByTaskId(taskId: string, page: number, limit: number): Promise<any[]>;
  countErrorsByTaskId(taskId: string): Promise<number>;
}
