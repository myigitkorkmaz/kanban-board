export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string;
  user_id: string;
  created_at: string;
  assignee_ids?: string[];
  label_ids?: string[];
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  color: string;
  initials: string;
  created_at: string;
}

export interface Label {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Column {
  id: Status;
  title: string;
  color: string;
  accent: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#94a3b8', accent: '#e2e8f0' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b', accent: '#fef3c7' },
  { id: 'in_review', title: 'In Review', color: '#8b5cf6', accent: '#ede9fe' },
  { id: 'done', title: 'Done', color: '#10b981', accent: '#d1fae5' },
];

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#64748b' },
  normal: { label: 'Normal', color: '#3b82f6' },
  high: { label: 'High', color: '#ef4444' },
};

export const LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];
