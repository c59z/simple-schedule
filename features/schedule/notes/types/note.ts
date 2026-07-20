export type ScheduleDayNote = {
  noteDate: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleDayNoteSummary = {
  noteDate: string;
  title: string;
  preview: string;
  updatedAt: Date;
};
