import express from "express";
import { checkPermissions } from "../../middleware/check-permissions"; // Import the permission middleware
import { GetTaskStatus } from "../../domain/interfaces/use-cases/get-task-status";
import { GetTaskErrors } from "../../domain/interfaces/use-cases/get-task-errors";
import { GetTaskData } from "../../domain/interfaces/use-cases/get-task-data";

export default function TasksRouter(
  getStatusUseCase: GetTaskStatus,
  getTaskErrors: GetTaskErrors,
  getTaskData: GetTaskData
) {
  const router = express.Router();

  router.get("/status/:taskId", checkPermissions, async (req, res, next) => {
    const { taskId } = req.params;
    try {
      const task = await getStatusUseCase.execute(taskId);
      res.json({
        taskId: task.taskId,
        status: task.status,
        hasErrors: task.hasErrors,
      }); // Send the response
    } catch (error) {
      next(error);
    }
  });

  router.get("/data/:taskId", checkPermissions, async (req, res, next) => {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default values for page and limit
    try {
      const data = await getTaskData.execute(
        taskId,
        Number(page),
        Number(limit)
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get("/errors/:taskId", checkPermissions, async (req, res, next) => {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default values for page and limit
    try {
      const errors = await getTaskErrors.execute(
        taskId,
        Number(page),
        Number(limit)
      );
      res.json(errors);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
