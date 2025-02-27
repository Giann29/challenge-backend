import express from "express";
import { GetTaskStatus } from "../../domain/interfaces/use-cases/get-task-status";
import { GetTaskErrors } from "../../domain/interfaces/use-cases/get-task-errors";
import { GetTaskData } from "../../domain/interfaces/use-cases/get-task-data";

export default function TasksRouter(
  getStatusUseCase: GetTaskStatus,
  getTaskErrors: GetTaskErrors,
  getTaskData: GetTaskData
) {
  const router = express.Router();

  router.get("/status/:taskId", async (req, res) => {
    const { taskId } = req.params;
    try {
      const task = await getStatusUseCase.execute(taskId);
      res.json({
        taskId: task.taskId,
        status: task.status,
        hasErrors: task.hasErrors,
      }); // Send the response
    } catch (error) {
      res.status(500).json({ error: "Failed to get the task status." }); // Send the response
    }
  });

  router.get("/data/:taskId", async (req, res) => {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default values for page and limit
    try {
      const errors = await getTaskData.execute(
        taskId,
        Number(page),
        Number(limit)
      );
      res.json(errors);
    } catch (error) {
      res.status(500).json({ error: "Failed to get the task data." }); // Send the response
    }
  });

  router.get("/errors/:taskId", async (req, res) => {
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
      res.status(500).json({ error: "Failed to get the task errors." }); // Send the response
    }
  });

  return router;
}
