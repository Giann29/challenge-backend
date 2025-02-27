import { GetTaskDataImpl } from "./get-task-data";
import { RowRepository } from "../interfaces/repositories/row-repository";
import { TaskDataNotFoundException } from "../exceptions/not-found-exception";
import { Row } from "../entities/row";

describe("GetTaskDataImpl", () => {
  let rowRepository: jest.Mocked<RowRepository>;
  let getTaskData: GetTaskDataImpl;

  beforeEach(() => {
    rowRepository = {
      findByTaskId: jest.fn(),
    } as unknown as jest.Mocked<RowRepository>;

    getTaskData = new GetTaskDataImpl(rowRepository);
  });

  it("should return rows if found", async () => {
    const taskId = "123";
    const rows: Row[] = [{ taskId, name: "test", age: 25, nums: [1, 2, 3] }];
    rowRepository.findByTaskId.mockResolvedValue(rows);

    const result = await getTaskData.execute(taskId, 1, 10);

    expect(rowRepository.findByTaskId).toHaveBeenCalledWith(taskId, 1, 10);
    expect(result).toEqual(rows);
  });

  it("should throw TaskDataNotFoundException if no rows found", async () => {
    const taskId = "nonexistent";
    rowRepository.findByTaskId.mockResolvedValue([]);

    await expect(getTaskData.execute(taskId, 1, 10)).rejects.toThrow(
      TaskDataNotFoundException
    );
    await expect(getTaskData.execute(taskId, 1, 10)).rejects.toMatchObject({
      message: expect.stringContaining(taskId),
    });
  });
});
