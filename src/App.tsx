import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useBoard } from './hooks/useBoard';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import type { Task, Status } from './types';
import { COLUMNS } from './types';

export default function App() {
  const board = useBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = board.tasks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }
    if (filterLabel) result = result.filter(t => t.label_ids?.includes(filterLabel));
    if (filterPriority) result = result.filter(t => t.priority === filterPriority);
    if (filterMember) result = result.filter(t => t.assignee_ids?.includes(filterMember));
    return result;
  }, [board.tasks, searchQuery, filterLabel, filterPriority, filterMember]);

  function getTasksByStatus(status: Status) {
    return filteredTasks.filter(t => t.status === status);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = board.tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const overColumn = COLUMNS.find(c => c.id === overId);
    if (overColumn) {
      board.moveTask(activeId, overColumn.id as Status);
      return;
    }

    // Check if dropped over another task
    const overTask = board.tasks.find(t => t.id === overId);
    if (overTask && overTask.id !== activeId) {
      if (overTask.status !== board.tasks.find(t => t.id === activeId)?.status) {
        board.moveTask(activeId, overTask.status);
      }
    }
  }

  async function handleOpenTask(task: Task) {
    setEditingTask(task);
    await board.fetchComments(task.id);
    await board.fetchActivity(task.id);
  }

  async function handleSaveTask(data: Partial<Task>) {
    if (editingTask) {
      await board.updateTask(editingTask.id, data, undefined);
    } else {
      await board.createTask(data as any);
    }
  }

  async function handleDeleteTask() {
    if (!editingTask) return;
    await board.deleteTask(editingTask.id);
    setEditingTask(null);
  }

  async function handleAddComment(content: string) {
    if (!editingTask) return;
    await board.addComment(editingTask.id, content);
  }

  function handleAddTaskInColumn(status: string) {
    setDefaultStatus(status as Status);
    setShowNewTask(true);
  }

  if (board.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Setting up your board...</p>
        <style>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: var(--text-3);
            font-family: var(--font-display);
            font-size: 14px;
          }
          .loading-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid var(--border);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (board.error) {
    return (
      <div className="error-screen">
        <p>⚠️ {board.error}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '8px' }}>
          Make sure your Supabase environment variables are set correctly.
        </p>
        <style>{`
          .error-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 24px;
            text-align: center;
            color: #ef4444;
            font-family: var(--font-display);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onNewTask={() => { setDefaultStatus('todo'); setShowNewTask(true); }} />

      <div className="app-body">
        <Sidebar
          tasks={board.tasks}
          members={board.members}
          labels={board.labels}
          onCreateMember={board.createMember}
          onCreateLabel={board.createLabel}
          onDeleteMember={board.deleteMember}
          onDeleteLabel={board.deleteLabel}
          filterLabel={filterLabel}
          filterPriority={filterPriority}
          filterMember={filterMember}
          searchQuery={searchQuery}
          onFilterLabel={setFilterLabel}
          onFilterPriority={setFilterPriority}
          onFilterMember={setFilterMember}
          onSearch={setSearchQuery}
        />

        <main className="board-area">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="board">
              {COLUMNS.map(col => (
                <Column
                  key={col.id}
                  column={col}
                  tasks={getTasksByStatus(col.id)}
                  members={board.members}
                  labels={board.labels}
                  onTaskClick={handleOpenTask}
                  onAddTask={handleAddTaskInColumn}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <div style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
                  <TaskCard
                    task={activeTask}
                    members={board.members}
                    labels={board.labels}
                    onClick={() => {}}
                    isDragging
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <TaskModal
          defaultStatus={defaultStatus}
          members={board.members}
          labels={board.labels}
          comments={[]}
          activity={[]}
          onSave={handleSaveTask}
          onAddComment={async () => {}}
          onClose={() => setShowNewTask(false)}
          isNew
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          members={board.members}
          labels={board.labels}
          comments={board.comments}
          activity={board.activity}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onClose={() => setEditingTask(null)}
        />
      )}

      <style>{`
        .app {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .app-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .board-area {
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 24px;
        }
        .board {
          display: flex;
          gap: 16px;
          height: 100%;
          min-width: max-content;
        }
      `}</style>
    </div>
  );
}
