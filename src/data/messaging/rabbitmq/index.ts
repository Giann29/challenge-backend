// src/frameworks/rabbitmq/index.ts
import amqp from 'amqplib';

export async function enqueueTask(taskId: string, filePath: string) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'file_processing';

  console.log("File path: ", filePath);

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify({ taskId, filePath })), { persistent: true });

  console.log(`Task ${taskId} enqueued.`);
}