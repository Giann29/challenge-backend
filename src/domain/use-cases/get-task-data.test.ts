import { GetTaskDataImpl } from "./get-task-data";
import { RowRepository } from "../interfaces/repositories/row-repository";
import { TaskDataNotFoundException } from "../exceptions/not-found-exception";
import { Row } from "../entities/row";

describe("GetTaskDataImpl", () => {
  let rowRepository: jest.Mocked<RowRepository>;
  let getTaskData: GetTaskDataImpl;

  const sampleRows: Row[] = [
    { taskId: "task123", name: "John Doe", age: 30, nums: [1, 2, 3] },
    { taskId: "task123", name: "Jane Doe", age: 25, nums: [4, 5, 6] },
  ];

  beforeEach(() => {
    rowRepository = {
      findByTaskId: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<RowRepository>;

    getTaskData = new GetTaskDataImpl(rowRepository);
  });

  it("should return rows and total count for a given taskId", async () => {
    rowRepository.findByTaskId.mockResolvedValue({
      rows: sampleRows,
      total: 2,
    });

    const result = await getTaskData.execute("task123", 1, 10);

    expect(result).toEqual({ rows: sampleRows, total: 2 });
    expect(rowRepository.findByTaskId).toHaveBeenCalledWith("task123", 1, 10);
  });

  it("should throw TaskDataNotFoundException if no rows are found", async () => {
    rowRepository.findByTaskId.mockResolvedValue({ rows: [], total: 0 });

    await expect(getTaskData.execute("task123", 1, 10)).rejects.toThrow(
      TaskDataNotFoundException
    );
    expect(rowRepository.findByTaskId).toHaveBeenCalledWith("task123", 1, 10);
  });

  it("should throw TaskDataNotFoundException if result is null", async () => {
    rowRepository.findByTaskId.mockResolvedValue({ rows: [], total: 0 });

    await expect(getTaskData.execute("task123", 1, 10)).rejects.toThrow(
      TaskDataNotFoundException
    );
    expect(rowRepository.findByTaskId).toHaveBeenCalledWith("task123", 1, 10);
  });
});
