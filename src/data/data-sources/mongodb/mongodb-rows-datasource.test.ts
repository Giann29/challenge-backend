import { MongoDBRowsDataSource } from "./mongodb-rows-datasource";
import { RowDatabaseWrapper } from "../interfaces/data-sources/row-database-wrapper";
import { Row } from "../../../domain/entities/row";
import { QueryExecutionException } from "../../../domain/exceptions/database-exception";

describe("MongoDBRowsDataSource", () => {
  let databaseWrapper: jest.Mocked<RowDatabaseWrapper>;
  let rowsDataSource: MongoDBRowsDataSource;
  const sampleRow: Row = {
    taskId: "123",
    name: "John Doe",
    age: 30,
    nums: [1, 2, 3],
  };

  beforeEach(() => {
    databaseWrapper = {
      insertOne: jest.fn(),
      findByTaskId: jest.fn(),
      countErrorsByTaskId: jest.fn(), // Añadir esta línea para incluir el mock de countErrorsByTaskId
    } as unknown as jest.Mocked<RowDatabaseWrapper>;

    rowsDataSource = new MongoDBRowsDataSource(databaseWrapper);
  });

  describe("create", () => {
    it("should return true if row is created successfully", async () => {
      // Simulación de respuesta exitosa
      databaseWrapper.insertOne.mockResolvedValue({ insertedId: "abc123" });

      const result = await rowsDataSource.create(sampleRow);
      expect(result).toBe(true);
      expect(databaseWrapper.insertOne).toHaveBeenCalledWith(sampleRow);
    });

    it("should throw QueryExecutionException when insertOne fails", async () => {
      const error = new Error("Insert failed");
      databaseWrapper.insertOne.mockRejectedValue(error);

      await expect(rowsDataSource.create(sampleRow)).rejects.toThrow(
        QueryExecutionException
      );
      await expect(rowsDataSource.create(sampleRow)).rejects.toThrow(
        /MongoDBRowsDataSource\.create/
      );
    });
  });

  describe("findByTaskId", () => {
    it("should return an object with rows and total when found", async () => {
      const rows: Row[] = [sampleRow];
      const total = 1;
      databaseWrapper.findByTaskId.mockResolvedValue(rows);
      databaseWrapper.countErrorsByTaskId.mockResolvedValue(total); // Simulación de respuesta exitosa para countErrorsByTaskId

      const result = await rowsDataSource.findByTaskId("123", 1, 10);
      expect(result).toEqual({ rows, total });
      expect(databaseWrapper.findByTaskId).toHaveBeenCalledWith("123", 1, 10);
    });

    it("should throw QueryExecutionException when findByTaskId fails", async () => {
      const error = new Error("Find failed");
      databaseWrapper.findByTaskId.mockRejectedValue(error);

      await expect(rowsDataSource.findByTaskId("123", 1, 10)).rejects.toThrow(
        QueryExecutionException
      );
      await expect(rowsDataSource.findByTaskId("123", 1, 10)).rejects.toThrow(
        /MongoDBRowsDataSource\.findByTaskId: 123/
      );
    });
  });
});
