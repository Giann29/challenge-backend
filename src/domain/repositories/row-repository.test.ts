import { RowRepositoryImpl } from "./row-repository";
import { RowDataSource } from "../../data/data-sources/interfaces/data-sources/row-datasource";
import { Row } from "../entities/row";

describe("RowRepositoryImpl", () => {
  let rowDataSource: jest.Mocked<RowDataSource>;
  let rowRepository: RowRepositoryImpl;

  const sampleRow: Row = {
    taskId: "task123",
    name: "John Doe",
    age: 30,
    nums: [1, 2, 3],
  };

  beforeEach(() => {
    rowDataSource = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<RowDataSource>;

    rowRepository = new RowRepositoryImpl(rowDataSource);
  });

  describe("save", () => {
    it("should save a row and return true if successful", async () => {
      rowDataSource.create.mockResolvedValue(true);

      const result = await rowRepository.save(sampleRow);

      expect(result).toBe(true);
      expect(rowDataSource.create).toHaveBeenCalledWith(sampleRow);
    });

    it("should return false if saving the row fails", async () => {
      rowDataSource.create.mockResolvedValue(false);

      const result = await rowRepository.save(sampleRow);

      expect(result).toBe(false);
      expect(rowDataSource.create).toHaveBeenCalledWith(sampleRow);
    });
  });

  describe("findByTaskId", () => {
    it("should return rows and total count for a given taskId", async () => {
      const rows = [sampleRow];
      const total = 1;
      rowDataSource.findByTaskId.mockResolvedValue({ rows, total });

      const result = await rowRepository.findByTaskId("task123", 1, 10);

      expect(result).toEqual({ rows, total });
      expect(rowDataSource.findByTaskId).toHaveBeenCalledWith("task123", 1, 10);
    });

    it("should return an empty array and zero total if no rows are found", async () => {
      rowDataSource.findByTaskId.mockResolvedValue({ rows: [], total: 0 });

      const result = await rowRepository.findByTaskId("task123", 1, 10);

      expect(result).toEqual({ rows: [], total: 0 });
      expect(rowDataSource.findByTaskId).toHaveBeenCalledWith("task123", 1, 10);
    });
  });
});
