import React, { useState, useEffect } from 'react';
import { X, Flag, Calendar, Users, Tag, Trash2, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Task, TeamMember, Label, Priority, Status, Comment, ActivityLog } from '../types';
import { PRIORITY_CONFIG, COLUMNS } from '../types';

interface Props {
  task?: Task | null;
  defaultStatus?: Status;
  members: TeamMember[];
  labels: Label[];
  comments: Comment[];
  activity: ActivityLog[];
  onSave: (data: Partial<Task>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddComment: (content: string) => Promise<void>;
  onClose: () => void;
  isNew?: boolean;
}

const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export function TaskModal({
  task, defaultStatus, members, labels, comments, activity,
  onSave, onDelete, onAddComment, onClose, isNew
}: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'normal');
  const [status, setStatus] = useState<Status>(task?.status || defaultStatus || 'todo');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignee_ids || []);
  const [labelIds, setLabelIds] = useState<string[]>(task?.label_ids || []);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim() || undefined, priority, status, due_date: dueDate || undefined, assignee_ids: assigneeIds, label_ids: labelIds });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    await onAddComment(commentText.trim());
    setCommentText('');
  }

  function toggleAssignee(id: string) {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleLabel(id: string) {
    setLabelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const activityLabels: Record<string, string> = {
    status_changed: 'Moved',
  };

  const columnLabels: Record<string, string> = {
    todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal scale-in">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            {!isNew && (
              <div className="modal-tabs">
                {(['details', 'comments', 'activity'] as const).map(tab => (
                  <button
                    key={tab}
                    className="modal-tab"
                    data-active={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'comments' ? <><MessageSquare size={13} /> Comments {comments.length > 0 && `(${comments.length})`}</> :
                     tab === 'activity' ? <><Clock size={13} /> Activity</> :
                     'Details'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-header-actions">
            {!isNew && onDelete && (
              <button className="modal-delete-btn" onClick={onDelete} title="Delete task">
                <Trash2 size={15} />
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* Details Tab */}
        {(isNew || activeTab === 'details') && (
          <div className="modal-body">
            {error && <div className="modal-error">{error}</div>}

            <input
              className="modal-title-input"
              placeholder="Task title..."
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              autoFocus
            />

            <textarea
              className="modal-desc-input"
              placeholder="Add a description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />

            <div className="modal-fields">
              {/* Status */}
              <div className="modal-field">
                <label>Status</label>
                <select
                  className="modal-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as Status)}
                >
                  {COLUMNS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="modal-field">
                <label><Flag size={13} /> Priority</label>
                <div className="priority-buttons">
                  {(['low', 'normal', 'high'] as Priority[]).map(p => (
                    <button
                      key={p}
                      className="priority-btn"
                      data-active={priority === p}
                      style={{ '--p-color': PRIORITY_CONFIG[p].color } as any}
                      onClick={() => setPriority(p)}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div className="modal-field">
                <label><Calendar size={13} /> Due Date</label>
                <input
                  type="date"
                  className="modal-date-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              {/* Assignees */}
              {members.length > 0 && (
                <div className="modal-field">
                  <label><Users size={13} /> Assignees</label>
                  <div className="member-chips">
                    {members.map(m => (
                      <button
                        key={m.id}
                        className="member-chip"
                        data-active={assigneeIds.includes(m.id)}
                        onClick={() => toggleAssignee(m.id)}
                      >
                        <span className="member-chip-avatar" style={{ backgroundColor: m.color }}>{m.initials}</span>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {labels.length > 0 && (
                <div className="modal-field">
                  <label><Tag size={13} /> Labels</label>
                  <div className="label-chips">
                    {labels.map(l => (
                      <button
                        key={l.id}
                        className="label-chip"
                        data-active={labelIds.includes(l.id)}
                        style={{ '--l-color': l.color } as any}
                        onClick={() => toggleLabel(l.id)}
                      >
                        <span className="label-dot" style={{ backgroundColor: l.color }} />
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {!isNew && activeTab === 'comments' && (
          <div className="modal-body">
            <div className="comments-list">
              {comments.length === 0 && <p className="empty-message">No comments yet. Be the first!</p>}
              {comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-you">You</span>
                    <span className="comment-time">{formatDistanceToNow(parseISO(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="comment-body">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="comment-input-row">
              <textarea
                className="comment-textarea"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleComment(); }}
              />
              <button className="comment-send-btn" onClick={handleComment} disabled={!commentText.trim()}>
                Send
              </button>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {!isNew && activeTab === 'activity' && (
          <div className="modal-body">
            {activity.length === 0 && <p className="empty-message">No activity yet.</p>}
            <div className="activity-list">
              {activity.map(a => (
                <div key={a.id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <span className="activity-text">
                      {a.action === 'status_changed'
                        ? <>Moved from <b>{columnLabels[a.old_value || ''] || a.old_value}</b> → <b>{columnLabels[a.new_value || ''] || a.new_value}</b></>
                        : a.action}
                    </span>
                    <span className="activity-time">{formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {(isNew || activeTab === 'details') && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isNew ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .modal {
          background: var(--bg-2);
          border: 1px solid var(--border-2);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .modal-tabs {
          display: flex;
          gap: 4px;
        }
        .modal-tab {
          background: transparent;
          color: var(--text-3);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.15s, color 0.15s;
        }
        .modal-tab:hover { background: var(--bg-3); color: var(--text-2); }
        .modal-tab[data-active="true"] { background: var(--bg-4); color: var(--text); }
        .modal-header-actions {
          display: flex;
          gap: 8px;
        }
        .modal-delete-btn, .modal-close-btn {
          background: transparent;
          color: var(--text-3);
          padding: 6px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
        }
        .modal-delete-btn:hover { background: #ef444422; color: #ef4444; }
        .modal-close-btn:hover { background: var(--bg-4); color: var(--text); }
        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-error {
          background: #ef444420;
          border: 1px solid #ef444440;
          color: #ef4444;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }
        .modal-title-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          padding: 4px 0 12px;
          width: 100%;
          transition: border-color 0.15s;
        }
        .modal-title-input:focus { border-color: var(--accent); }
        .modal-title-input::placeholder { color: var(--text-3); }
        .modal-desc-input {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-2);
          font-size: 13.5px;
          padding: 10px 12px;
          width: 100%;
          resize: vertical;
          transition: border-color 0.15s;
          line-height: 1.6;
        }
        .modal-desc-input:focus { border-color: var(--border-2); }
        .modal-desc-input::placeholder { color: var(--text-3); }
        .modal-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modal-field label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-display);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .modal-select, .modal-date-input {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          padding: 8px 10px;
          font-size: 13px;
          transition: border-color 0.15s;
          width: fit-content;
        }
        .modal-select:focus, .modal-date-input:focus { border-color: var(--border-2); }
        .priority-buttons {
          display: flex;
          gap: 6px;
        }
        .priority-btn {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-3);
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-display);
          transition: all 0.15s;
        }
        .priority-btn:hover { border-color: var(--p-color, var(--border-2)); color: var(--p-color, var(--text)); }
        .priority-btn[data-active="true"] {
          background: color-mix(in srgb, var(--p-color, var(--accent)) 15%, transparent);
          border-color: var(--p-color, var(--accent));
          color: var(--p-color, var(--accent));
        }
        .member-chips, .label-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .member-chip {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text-2);
          padding: 5px 12px 5px 6px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .member-chip:hover { border-color: var(--border-2); }
        .member-chip[data-active="true"] { border-color: var(--accent); background: var(--accent-glow); color: var(--text); }
        .member-chip-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: white;
          font-family: var(--font-display);
        }
        .label-chip {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text-2);
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .label-chip:hover { border-color: var(--l-color, var(--border-2)); }
        .label-chip[data-active="true"] {
          border-color: var(--l-color);
          background: color-mix(in srgb, var(--l-color) 15%, transparent);
          color: var(--l-color);
        }
        .label-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .btn-secondary {
          background: var(--bg-3);
          border: 1px solid var(--border);
          color: var(--text-2);
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
        }
        .btn-secondary:hover { border-color: var(--border-2); color: var(--text); }
        .btn-primary {
          background: var(--accent);
          color: white;
          padding: 8px 20px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-display);
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .empty-message {
          color: var(--text-3);
          font-size: 13px;
          text-align: center;
          padding: 24px 0;
        }
        .comment-item {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 14px;
        }
        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .comment-you {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-2);
          font-family: var(--font-display);
        }
        .comment-time {
          font-size: 11px;
          color: var(--text-3);
        }
        .comment-body {
          font-size: 13.5px;
          color: var(--text-2);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .comment-input-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }
        .comment-textarea {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          padding: 10px 12px;
          font-size: 13.5px;
          resize: none;
          transition: border-color 0.15s;
          line-height: 1.6;
          width: 100%;
        }
        .comment-textarea:focus { border-color: var(--border-2); }
        .comment-textarea::placeholder { color: var(--text-3); }
        .comment-send-btn {
          background: var(--accent);
          color: white;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          align-self: flex-end;
          font-family: var(--font-display);
          transition: opacity 0.15s;
        }
        .comment-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .comment-send-btn:hover:not(:disabled) { opacity: 0.9; }
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        .activity-list::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: var(--border);
        }
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          position: relative;
        }
        .activity-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: var(--bg-4);
          border: 2px solid var(--border-2);
          flex-shrink: 0;
          margin-top: 2px;
          position: relative;
          z-index: 1;
        }
        .activity-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activity-text {
          font-size: 13px;
          color: var(--text-2);
        }
        .activity-text b { color: var(--text); font-weight: 600; }
        .activity-time {
          font-size: 11px;
          color: var(--text-3);
        }
      `}</style>
    </div>
  );
}
