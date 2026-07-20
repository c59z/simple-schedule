export type ScheduleTodo = {
  id: string;
  todoDate: string;
  title: string;
  details: string | null;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleTodoInput = {
  todoDate: string;
  title: string;
  details?: string | null;
};

export type ScheduleTodoUpdate = {
  title?: string;
  details?: string | null;
  isCompleted?: boolean;
};

export type ScheduleTodoDaySummary = {
  todoDate: string;
  totalCount: number;
  completedCount: number;
  firstTitle: string;
};
