export type ScheduleTodo = {
  id: string;
  todoDate: string;
  title: string;
  details: string | null;
  isCompleted: boolean;
  isOptional: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleTodoInput = {
  isOptional?: boolean;
  todoDate: string;
  title: string;
  details?: string | null;
};

export type ScheduleTodoUpdate = {
  isOptional?: boolean;
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
