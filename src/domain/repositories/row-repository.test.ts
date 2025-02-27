import { RowRepositoryImpl } from "./row-repository";
import { RowDataSource } from "../../data/data-sources/interfaces/data-sources/row-datasource";
import { Row } from "../entities/row";

describe("RowRepositoryImpl", () => {
  let rowRepository: RowRepositoryImpl;
  let rowDataSource: jest.Mocked<RowDataSource>;

  beforeEach(() => {
    rowDataSource = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
    };
    rowRepository = new RowRepositoryImpl(rowDataSource);
  });

  describe("save", () => {
    it("should save a row and return true", async () => {
      const row: Row = {
        taskId: "task1",
        name: "John Doe",
        age: 30,
        nums: [1, 2, 3],
      };
      rowDataSource.create.mockResolvedValue(true);

      const result = await rowRepository.save(row);

      expect(result).toBe(true);
      expect(rowDataSource.create).toHaveBeenCalledWith(row);
    });

    it("should return false if saving a row fails", async () => {
      const row: Row = {
        taskId: "task1",
        name: "John Doe",
        age: 30,
        nums: [1, 2, 3],
      };
      rowDataSource.create.mockResolvedValue(false);

      const result = await rowRepository.save(row);

      expect(result).toBe(false);
      expect(rowDataSource.create).toHaveBeenCalledWith(row);
    });
  });

  describe("findByTaskId", () => {
    it("should return rows for a given taskId", async () => {
      const taskId = "task1";
      const rows: Row[] = [
        { taskId, name: "John Doe", age: 30, nums: [1, 2, 3] },
        { taskId, name: "Jane Doe", age: 25, nums: [4, 5, 6] },
      ];
      rowDataSource.findByTaskId.mockResolvedValue(rows);

      const result = await rowRepository.findByTaskId(taskId, 1, 10);

      expect(result).toEqual(rows);
      expect(rowDataSource.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });

    it("should return null if no rows are found", async () => {
      const taskId = "task1";
      rowDataSource.findByTaskId.mockResolvedValue(null);

      const result = await rowRepository.findByTaskId(taskId, 1, 10);

      expect(result).toBeNull();
      expect(rowDataSource.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });
  });
});
