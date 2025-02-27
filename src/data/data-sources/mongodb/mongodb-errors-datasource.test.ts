import { MongoDBErrorsDataSource } from "./mongodb-errors-datasource";
import { ErrorDatabaseWrapper } from "../interfaces/data-sources/errors-database-wrapper";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";
import { Error as DomainError } from "../../../domain/entities/error";

describe("MongoDBErrorsDataSource", () => {
  let databaseWrapper: jest.Mocked<ErrorDatabaseWrapper>;
  let errorsDataSource: MongoDBErrorsDataSource;

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      countErrorsByTaskId: jest.fn(),
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<ErrorDatabaseWrapper>;

    errorsDataSource = new MongoDBErrorsDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should return true if error is created successfully", async () => {
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "abc123" });
      const sampleError: DomainError = { taskId: "123", row: 1, col: 2 };

      const result = await errorsDataSource.create(sampleError);

      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(sampleError);
    });

    it("should throw QueryExecutionException on error during creation", async () => {
      const sampleError: DomainError = { taskId: "123", row: 1, col: 2 };
      const error = new Error("Insertion error");
      databaseWrapper.insertOne.mockRejectedValue(error);

      await expect(errorsDataSource.create(sampleError)).rejects.toThrow(
        QueryExecutionException
      );
      await expect(errorsDataSource.create(sampleError)).rejects.toThrow(
        "MongoDBErrorsDataSource.create"
      );
    });
  });

  describe("findByTaskId", () => {
    it("should return errors and total when found", async () => {
      const taskId = "123";
      const page = 1;
      const limit = 10;
      const errorsArray: DomainError[] = [{ taskId, row: 1, col: 2 }];
      const total = 5;

      databaseWrapper.countErrorsByTaskId.mockResolvedValue(total);
      databaseWrapper.findByTaskId.mockResolvedValue(errorsArray);

      const result = await errorsDataSource.findByTaskId(taskId, page, limit);

      expect(result).toEqual({ errors: errorsArray, total });
      expect(databaseWrapper.countErrorsByTaskId).toHaveBeenCalledWith(taskId);
      expect(databaseWrapper.findByTaskId).toHaveBeenCalledWith(
        taskId,
        page,
        limit
      );
    });

    it("should throw QueryExecutionException on error during findByTaskId", async () => {
      const taskId = "123";
      const page = 1;
      const limit = 10;
      const error = new Error("Find failed");

      databaseWrapper.countErrorsByTaskId.mockRejectedValue(error);

      await expect(
        errorsDataSource.findByTaskId(taskId, page, limit)
      ).rejects.toThrow(QueryExecutionException);
      await expect(
        errorsDataSource.findByTaskId(taskId, page, limit)
      ).rejects.toThrow(
        `MongoDBErrorsDataSource.findByTaskId [taskId: ${taskId}]`
      );
    });
  });
});
