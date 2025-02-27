import express from "express";
import multer from "multer";
import { UploadFileUseCase } from "../../domain/interfaces/use-cases/upload-file-use-case";
import { checkPermissions } from "../../middleware/check-permissions"; // Import the permission middleware

export default function UploadRouter(uploadFileUseCase: UploadFileUseCase) {
  const router = express.Router();

  const upload = multer({ dest: "uploads/" }); // Configure multer for file uploads

  router.post(
    "/upload",
    checkPermissions(["UPLOAD_FILES"]),
    upload.single("file"),
    async (req, res, next) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      try {
        const task = await uploadFileUseCase.execute(file.path);
        res.json({ taskId: task.taskId, filePath: file.path }); // Send the response
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
