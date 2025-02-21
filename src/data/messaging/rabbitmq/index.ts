// src/frameworks/rabbitmq/index.ts
import amqp from "amqplib";

const RABBITMQ_URI =
  process.env.RABBITMQ_URI || "mongodb://localhost:27017/challenge";

export async function enqueueTask(taskId: string, filePath: string) {
  const connection = await amqp.connect(RABBITMQ_URI);
  const channel = await connection.createChannel();
  const queue = "file_processing";

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify({ taskId, filePath })),
    { persistent: true }
  );
}
