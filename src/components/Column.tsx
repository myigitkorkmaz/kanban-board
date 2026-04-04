import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task, Column as ColumnType, TeamMember, Label } from '../types';

interface Props {
  column: ColumnType;
  tasks: Task[];
  members: TeamMember[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
}

export function Column({ column, tasks, members, labels, onTaskClick, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="column" data-over={isOver}>
      {/* Header */}
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" style={{ backgroundColor: column.color }} />
          <span className="column-title">{column.title}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button
          className="column-add-btn"
          onClick={() => onAddTask(column.id)}
          title="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="column-body">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              labels={labels}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column-empty">
            <div className="column-empty-dot" style={{ borderColor: column.color + '44' }} />
            <p>No tasks yet</p>
            <button onClick={() => onAddTask(column.id)}>Add one</button>
          </div>
        )}
      </div>

      <style>{`
        .column {
          display: flex;
          flex-direction: column;
          width: 300px;
          min-width: 300px;
          max-height: calc(100vh - 140px);
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .column[data-over="true"] {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent), inset 0 0 40px var(--accent-glow);
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .column-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .column-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .column-title {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .column-count {
          background: var(--bg-4);
          color: var(--text-3);
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
          font-family: var(--font-display);
        }
        .column-add-btn {
          background: transparent;
          color: var(--text-3);
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
        }
        .column-add-btn:hover {
          background: var(--bg-4);
          color: var(--text);
        }
        .column-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 80px;
        }
        .column-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px 16px;
          color: var(--text-3);
          font-size: 13px;
          text-align: center;
        }
        .column-empty-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px dashed;
          opacity: 0.5;
        }
        .column-empty button {
          background: transparent;
          color: var(--accent-2);
          font-size: 12px;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--accent) + '44';
          transition: background 0.15s;
        }
        .column-empty button:hover {
          background: var(--accent-glow);
        }
      `}</style>
    </div>
  );
}
