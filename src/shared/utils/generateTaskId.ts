// src/shared/utils/generateTaskId.ts
import { v4 as uuidv4 } from 'uuid';

export function generateTaskId(): string {
  return uuidv4(); // Generates a unique UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
}