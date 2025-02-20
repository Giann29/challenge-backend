// src/shared/utils/generateTaskId.test.ts
import { generateTaskId } from './generateTaskId';

test('generateTaskId should return a valid UUID', () => {
  const taskId = generateTaskId();
  expect(taskId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});