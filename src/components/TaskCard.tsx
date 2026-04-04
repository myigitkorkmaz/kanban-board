import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, Flag, GripVertical } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns';
import type { Task, TeamMember, Label } from '../types';
import { PRIORITY_CONFIG } from '../types';

interface Props {
  task: Task;
  members: TeamMember[];
  labels: Label[];
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, members, labels, onClick, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const assignees = members.filter(m => task.assignee_ids?.includes(m.id));
  const taskLabels = labels.filter(l => task.label_ids?.includes(l.id));
  const priority = PRIORITY_CONFIG[task.priority || 'normal'];

  const dueStatus = (() => {
    if (!task.due_date) return null;
    const date = parseISO(task.due_date);
    if (task.status === 'done') return null;
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    return null;
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      onClick={onClick}
      data-dragging={isSortableDragging}
    >
      {/* Drag handle */}
      <div className="drag-handle" {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
        <GripVertical size={14} />
      </div>

      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="task-card-labels">
          {taskLabels.map(label => (
            <span
              key={label.id}
              className="task-label-chip"
              style={{ backgroundColor: label.color + '22', color: label.color, borderColor: label.color + '44' }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="task-card-title">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      {/* Footer row */}
      <div className="task-card-footer">
        <div className="task-card-meta">
          {/* Priority */}
          <span className="task-priority-badge" style={{ color: priority.color }}>
            <Flag size={11} />
            {priority.label}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span
              className="task-due-badge"
              data-status={dueStatus}
            >
              <Calendar size={11} />
              {dueStatus === 'overdue' ? 'Overdue' : dueStatus === 'today' ? 'Today' : formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="task-assignees">
            {assignees.slice(0, 3).map((m, i) => (
              <div
                key={m.id}
                className="assignee-avatar"
                title={m.name}
                style={{ backgroundColor: m.color, zIndex: 3 - i, marginLeft: i > 0 ? '-6px' : 0 }}
              >
                {m.initials}
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="assignee-avatar assignee-overflow">+{assignees.length - 3}</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .task-card {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 12px 12px 32px;
          cursor: pointer;
          position: relative;
          transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
          animation: fadeIn 0.2s ease;
        }
        .task-card:hover {
          border-color: var(--border-2);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .drag-handle {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-3);
          opacity: 0;
          transition: opacity 0.15s;
          cursor: grab;
          padding: 4px 2px;
        }
        .task-card:hover .drag-handle { opacity: 1; }
        .drag-handle:active { cursor: grabbing; }
        .task-card-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 7px;
        }
        .task-label-chip {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
          border: 1px solid;
          font-family: var(--font-display);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .task-card-title {
          font-family: var(--font-display);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .task-card-desc {
          font-size: 12px;
          color: var(--text-3);
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .task-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
        }
        .task-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .task-priority-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 500;
          opacity: 0.85;
        }
        .task-due-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: var(--text-3);
        }
        .task-due-badge[data-status="overdue"] {
          color: #ef4444;
          font-weight: 600;
        }
        .task-due-badge[data-status="today"] {
          color: #f59e0b;
          font-weight: 600;
        }
        .task-assignees {
          display: flex;
          align-items: center;
        }
        .assignee-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          font-family: var(--font-display);
          color: white;
          border: 2px solid var(--bg-3);
          position: relative;
        }
        .assignee-overflow {
          background: var(--bg-4);
          color: var(--text-2);
          font-size: 9px;
          margin-left: -6px;
        }
      `}</style>
    </div>
  );
}
