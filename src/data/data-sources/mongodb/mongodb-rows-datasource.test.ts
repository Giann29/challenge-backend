import { MongoDBRowsDataSource } from "./mongodb-rows-datasource";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { Row } from "../../../domain/entities/row";

describe("MongoDBRowsDataSource", () => {
  let rowsDataSource: MongoDBRowsDataSource;
  let databaseWrapper: jest.Mocked<RowDatabaseWrapper>;

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<RowDatabaseWrapper>;

    rowsDataSource = new MongoDBRowsDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should create a row and return true", async () => {
      const row: Row = {
        taskId: "1",
        name: "John Doe",
        age: 30,
        nums: [1, 2, 3],
      };
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "1" });

      const result = await rowsDataSource.create(row);

      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(row);
    });

    it("should return false if creating a row fails", async () => {
      const row: Row = {
        taskId: "1",
        name: "John Doe",
        age: 30,
        nums: [1, 2, 3],
      };
      databaseWrapper.insertOne.mockResolvedValue(null);

      const result = await rowsDataSource.create(row);

      expect(result).toBe(false);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(row);
    });
  });

  describe("findByTaskId", () => {
    it("should return rows for a given taskId", async () => {
      const taskId = "1";
      const rows: Row[] = [
        { taskId, name: "John Doe", age: 30, nums: [1, 2, 3] },
        { taskId, name: "Jane Doe", age: 25, nums: [4, 5, 6] },
      ];
      databaseWrapper.findByTaskId.mockResolvedValue(rows);

      const result = await rowsDataSource.findByTaskId(taskId, 1, 10);

      expect(result).toEqual(rows);
      expect(databaseWrapper.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });

    it("should return null if no rows are found", async () => {
      const taskId = "1";
      databaseWrapper.findByTaskId.mockResolvedValue(null);

      const result = await rowsDataSource.findByTaskId(taskId, 1, 10);

      expect(result).toBeNull();
      expect(databaseWrapper.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });
  });
});
