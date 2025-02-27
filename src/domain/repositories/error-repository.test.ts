import { ErrorRepositoryImpl } from "./error-repository";
import { ErrorsDataSource } from "../../data/data-sources/interfaces/data-sources/errors-datasource";
import { Error } from "../entities/error";

describe("ErrorRepositoryImpl", () => {
  let errorRepository: ErrorRepositoryImpl;
  let errorsDataSource: jest.Mocked<ErrorsDataSource>;

  beforeEach(() => {
    errorsDataSource = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
    };
    errorRepository = new ErrorRepositoryImpl(errorsDataSource);
  });

  describe("save", () => {
    it("should save an error and return true", async () => {
      const error: Error = {
        taskId: "task1",
        row: 1,
        col: 2,
      };
      errorsDataSource.create.mockResolvedValue(true);

      const result = await errorRepository.save(error);

      expect(result).toBe(true);
      expect(errorsDataSource.create).toHaveBeenCalledWith(error);
    });

    it("should return false if saving an error fails", async () => {
      const error: Error = {
        taskId: "task1",
        row: 1,
        col: 2,
      };
      errorsDataSource.create.mockResolvedValue(false);

      const result = await errorRepository.save(error);

      expect(result).toBe(false);
      expect(errorsDataSource.create).toHaveBeenCalledWith(error);
    });
  });

  describe("findByTaskId", () => {
    it("should return errors for a given taskId", async () => {
      const taskId = "task1";
      const errors: Error[] = [
        { taskId, row: 1, col: 2 },
        { taskId, row: 2, col: 3 },
      ];
      const total = errors.length;
      errorsDataSource.findByTaskId.mockResolvedValue({ errors, total });

      const result = await errorRepository.findByTaskId(taskId, 1, 10);

      expect(result).toEqual({ errors, total });
      expect(errorsDataSource.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });

    it("should return an empty array if no errors are found", async () => {
      const taskId = "task1";
      errorsDataSource.findByTaskId.mockResolvedValue({ errors: [], total: 0 });

      const result = await errorRepository.findByTaskId(taskId, 1, 10);

      expect(result).toEqual({ errors: [], total: 0 });
      expect(errorsDataSource.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    });
  });
});
