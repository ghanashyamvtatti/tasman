export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  subTasks: SubTask[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}