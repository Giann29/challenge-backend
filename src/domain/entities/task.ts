export interface Task {
    taskId: string;
    status: 'pending' | 'processing' | 'done' | 'failed';
    errors: {row: number, col: number}[];
}