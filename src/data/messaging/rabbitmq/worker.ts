import amqp from "amqplib";
import "dotenv/config";
import path from "path";
import ExcelJS from "exceljs";
import { TaskRepository } from "../../../domain/interfaces/repositories/task-repository";
import { MongoDBTasksDataSource } from "../../data-sources/mongodb/mongodb-tasks-data-source";
import { TaskRepositoryImpl } from "../../../domain/repositories/task-repository";
import { connectToDatabase } from "../../data-sources/mongodb/connection";
import { RowRepository } from "../../../domain/interfaces/repositories/row-repository";
import { Row } from "../../../domain/entities/row";
import { MongoDBTasksDatabaseWrapper } from "../../data-sources/mongodb/mongodb-tasks-database-wrapper";
import { MongoDBRowsDatabaseWrapper } from "../../data-sources/mongodb/mongodb-rows-database-wrapper";
import { MongoDBRowsDataSource } from "../../data-sources/mongodb/mongodb-rows-datasource";
import { RowRepositoryImpl } from "../../../domain/repositories/row-repository";

const RABBITMQ_URI =
  process.env.RABBITMQ_URI || "mongodb://localhost:27017/challenge";

async function startWorker(
  taskRepository: TaskRepository,
  rowsRepository: RowRepository
) {
  try {
    await connectToDatabase();

    const connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();
    const queue = "file_processing";

    await channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const { taskId, filePath } = JSON.parse(content);

        console.log(
          `Received message for task ${taskId} with file path ${filePath}`
        );

        // Process the file
        await processFile(taskRepository, rowsRepository, taskId, filePath);

        // Acknowledge the message
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error in worker:", error);
  }
}

async function processFile(
  taskRepository: TaskRepository,
  rowRepository: RowRepository,
  taskId: string,
  filePath: string
) {
  const fullPath = path.join("/app", filePath); // Ajusta la ruta aquí
  console.log(`Processing file at ${fullPath}`);

  const workbook = new ExcelJS.Workbook();
  const errors: { row: number; col: number }[] = [];

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
      } else {
        // Save valid data to Row
        const age = parseInt(edad, 10);
        if (isNaN(age)) {
          console.error(`Invalid age value at row ${rowNumber}: ${edad}`);
          errors.push({ row: rowNumber, col: 2 });
        } else {
          const row: Row = {
            taskId,
            name: nombre,
            age: age,
            nums: nums
              .split(",")
              .map(Number)
              .sort((a, b) => a - b),
          };
          rowRepository.save(row).catch((error) => {
            console.error("Error saving processed data:", error);
          });
        }
      }
    });

    // Find the task by ID
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Update the task status and errors
    task.status = "done";
    task.errors = errors;

    // Update the task status and errors
    await taskRepository.update(taskId, { status: "done", errors });

    console.log(`File processing completed for task ${taskId}`);
  } catch (error) {
    console.error("Error processing file:", error);

    // Update the task status to indicate failure
    await taskRepository.update(taskId, { status: "failed", errors: [] });
  }
}

function validateRow(
  nombre: string,
  edad: string,
  nums: string,
  rowNumber: number
): { row: number; col: number }[] {
  const errors: { row: number; col: number }[] = [];

  // Validate Nombre (should be a non-empty string and not a number)
  if (
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    !isNaN(Number(nombre))
  ) {
    errors.push({ row: rowNumber, col: 1 });
  }

  // Validate Edad (should be a number)
  if (isNaN(Number(edad))) {
    errors.push({ row: rowNumber, col: 2 });
  }

  // Validate Nums (should be a comma-separated list of numbers)
  const numsArray = nums.split(",").map(Number);
  if (numsArray.some(isNaN)) {
    errors.push({ row: rowNumber, col: 3 });
  }

  return errors;
}

// Initialize the tasks database wrapper
const tasksDatabaseWrapper = new MongoDBTasksDatabaseWrapper();

// Initialize the rows database wrapper
const rowsDatabaseWrapper = new MongoDBRowsDatabaseWrapper();

// Initialize the tasks data source
const tasksDataSource = new MongoDBTasksDataSource(tasksDatabaseWrapper);

//Initialize the rows data source
const rowsDataSource = new MongoDBRowsDataSource(rowsDatabaseWrapper);

// Initialize the repositories
const taskRepository = new TaskRepositoryImpl(tasksDataSource);
const rowRepository = new RowRepositoryImpl(rowsDataSource);

// Start the worker
startWorker(taskRepository, rowRepository);
