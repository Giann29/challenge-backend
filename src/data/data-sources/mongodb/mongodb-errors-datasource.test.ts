import { MongoDBErrorsDataSource } from "./mongodb-errors-datasource";
import { ErrorDatabaseWrapper } from "../interfaces/data-sources/errors-database-wrapper";
import { Error } from "../../../domain/entities/error";

describe("MongoDBErrorsDataSource", () => {
  let errorsDataSource: MongoDBErrorsDataSource;
  let databaseWrapper: jest.Mocked<ErrorDatabaseWrapper>;

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      countErrorsByTaskId: jest.fn(),
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorDatabaseWrapper>;

    errorsDataSource = new MongoDBErrorsDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should create an error and return true", async () => {
      const error: Error = { taskId: "1", row: 1, col: 2 };
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "1" });

      const result = await errorsDataSource.create(error);

      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(error);
    });

    it("should return false if creating an error fails", async () => {
      const error: Error = { taskId: "1", row: 1, col: 2 };
      databaseWrapper.insertOne.mockResolvedValue(null);

      const result = await errorsDataSource.create(error);

      expect(result).toBe(false);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(error);
    });
  });

  describe("findByTaskId", () => {
    it("should return errors and total count for a given taskId", async () => {
      const taskId = "1";
      const errors: Error[] = [{ taskId, row: 1, col: 2 }];
      const total = errors.length;
      databaseWrapper.countErrorsByTaskId.mockResolvedValue(total);
      databaseWrapper.findByTaskId.mockResolvedValue(errors);

      const result = await errorsDataSource.findByTaskId(taskId, 1, 10);

      expect(result).toEqual({ errors, total });
      expect(databaseWrapper.countErrorsByTaskId).toHaveBeenCalledWith(taskId);
      expect(databaseWrapper.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });
  });
});
