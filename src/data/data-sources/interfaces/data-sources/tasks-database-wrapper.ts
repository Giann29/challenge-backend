export interface TasksDatabaseWrapper {
  find(query: object): Promise<any[]>;
  findById(id: string): Promise<any>;
  insertOne(doc: any): Promise<any>;
  updateOne(query: object, update: object): Promise<any>;
}
