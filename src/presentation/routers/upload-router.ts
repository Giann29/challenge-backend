import express from 'express'
import multer from 'multer';
import { Request, Response } from 'express'
import { UploadFileUseCase } from '../../domain/interfaces/use-cases/upload-file-use-case'
import { TaskRepository } from '../../domain/interfaces/repositories/task-repository'


export default function UploadRouter(
    taskRepository: TaskRepository,
    uploadFileUseCase: UploadFileUseCase
) {
    const router = express.Router()

    const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads

    router.post('/upload', upload.single('file'), async (req, res) => {
        const file = req.file;
        if (!file) {
          res.status(400).json({ error: 'No file uploaded.' });
          return;
        }
      
        try {
          const task = await uploadFileUseCase.execute(file.path);
          res.json({ taskId: task.taskId }); // Send the response
        } catch (error) {
          res.status(500).json({ error: 'Failed to upload file.' }); // Send the response
        }
      });

    return router
}