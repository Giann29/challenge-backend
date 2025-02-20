import amqp from 'amqplib';
import path from 'path';
import ExcelJS from 'exceljs';
import { TaskRepository } from '../../../domain/interfaces/repositories/task-repository';
import { Error } from '../../../domain/entities/error';

async function startWorker(taskRepository: TaskRepository) {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'file_processing';

    await channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const { taskId, filePath } = JSON.parse(content);

        console.log(`Received message for task ${taskId} with file path ${filePath}`);

        // Process the file
        await processFile(taskRepository, taskId, filePath);

        // Acknowledge the message
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in worker:', error);
  }
}

async function processFile(taskRepository: TaskRepository, taskId: string, filePath: string) {
  const fullPath = path.join(__dirname, '../../uploads', filePath);
  console.log(`Processing file at ${fullPath}`);

  const workbook = new ExcelJS.Workbook();
  const errors: Error[] = [];

  try {
    await workbook.xlsx.readFile(fullPath);
    const worksheet = workbook.worksheets[0];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip the header row

      const nombre = row.getCell(1).text;
      const edad = row.getCell(2).text;
      const nums = row.getCell(3).text;

      // Validate the row
      const rowErrors = validateRow(nombre, edad, nums, rowNumber);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      }
    });

    // Find the task by ID
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Update the task status and errors
    task.status = 'done';
    task.errors = errors;

    // Save the updated task
    await taskRepository.save(task);

    console.log(`File processing completed for task ${taskId}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

function validateRow(nombre: string, edad: string, nums: string, rowNumber: number): Error[] {
  const errors: Error[] = [];

  // Validate Nombre (should be a non-empty string)
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    errors.push({ row: rowNumber, col: 1 });
  }

  // Validate Edad (should be a number)
  if (isNaN(Number(edad))) {
    errors.push({ row: rowNumber, col: 2 });
  }

  // Validate Nums (should be a comma-separated list of numbers)
  const numsArray = nums.split(',').map(Number);
  if (numsArray.some(isNaN)) {
    errors.push({ row: rowNumber, col: 3 });
  }

  return errors;
}

// Initialize the repository and start the worker
const taskRepository = new TaskRepository(); // Replace with your actual repository implementation
startWorker(taskRepository);