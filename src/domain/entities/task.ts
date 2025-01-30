export interface Task {
    taskId: string;
    status: 'pending' | 'processing' | 'done';
    errors: Error[];
}