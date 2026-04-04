import React, { useState } from 'react';
import { Users, Tag, BarChart2, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { TeamMember, Label, Task } from '../types';
import { LABEL_COLORS } from '../types';

interface Props {
  tasks: Task[];
  members: TeamMember[];
  labels: Label[];
  onCreateMember: (name: string, color: string) => Promise<void>;
  onCreateLabel: (name: string, color: string) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onDeleteLabel: (id: string) => Promise<void>;
  filterLabel: string | null;
  filterPriority: string | null;
  filterMember: string | null;
  searchQuery: string;
  onFilterLabel: (id: string | null) => void;
  onFilterPriority: (p: string | null) => void;
  onFilterMember: (id: string | null) => void;
  onSearch: (q: string) => void;
}

const MEMBER_COLORS = [
  '#7c6cfc', '#ef4444', '#f59e0b', '#10b981',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
];

export function Sidebar({
  tasks, members, labels,
  onCreateMember, onCreateLabel, onDeleteMember, onDeleteLabel,
  filterLabel, filterPriority, filterMember, searchQuery,
  onFilterLabel, onFilterPriority, onFilterMember, onSearch
}: Props) {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [statsOpen, setStatsOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  async function submitMember() {
    if (!newMemberName.trim()) return;
    await onCreateMember(newMemberName.trim(), newMemberColor);
    setNewMemberName('');
    setShowMemberForm(false);
  }

  async function submitLabel() {
    if (!newLabelName.trim()) return;
    await onCreateLabel(newLabelName.trim(), newLabelColor);
    setNewLabelName('');
    setShowLabelForm(false);
  }

  return (
    <aside className="sidebar">
      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => setStatsOpen(s => !s)}>
          <BarChart2 size={14} />
          <span>Stats</span>
          {statsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        {statsOpen && (
          <div className="stats-grid fade-in">
            <div className="stat-card">
              <span className="stat-value">{total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: '#10b981' }}>{done}</span>
              <span className="stat-label">Done</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: '#ef4444' }}>{overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>
        )}
      </div>

      {/* Priority filter */}
      <div className="sidebar-section">
        <div className="section-header-static">
          <span>Priority</span>
        </div>
        <div className="filter-chips">
          {['high', 'normal', 'low'].map(p => {
            const colors = { high: '#ef4444', normal: '#3b82f6', low: '#64748b' };
            const color = colors[p as keyof typeof colors];
            return (
              <button
                key={p}
                className="filter-chip"
                data-active={filterPriority === p}
                style={{ '--fc': color } as any}
                onClick={() => onFilterPriority(filterPriority === p ? null : p)}
              >
                <span className="filter-chip-dot" style={{ backgroundColor: color }} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Members */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => setMembersOpen(s => !s)}>
          <Users size={14} />
          <span>Team</span>
          {membersOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <button
            className="section-add-btn"
            onClick={e => { e.stopPropagation(); setShowMemberForm(s => !s); }}
            title="Add member"
          >
            <Plus size={13} />
          </button>
        </button>
        {membersOpen && (
          <div className="fade-in">
            {showMemberForm && (
              <div className="mini-form">
                <input
                  className="mini-input"
                  placeholder="Name..."
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitMember()}
                  autoFocus
                />
                <div className="color-row">
                  {MEMBER_COLORS.map(c => (
                    <button
                      key={c}
                      className="color-dot-btn"
                      data-active={newMemberColor === c}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewMemberColor(c)}
                    />
                  ))}
                </div>
                <div className="mini-form-actions">
                  <button className="mini-cancel" onClick={() => setShowMemberForm(false)}>Cancel</button>
                  <button className="mini-submit" onClick={submitMember}>Add</button>
                </div>
              </div>
            )}
            <div className="member-list">
              {members.length === 0 && <p className="sidebar-empty">No team members</p>}
              {members.map(m => (
                <div
                  key={m.id}
                  className="member-row"
                  data-active={filterMember === m.id}
                  onClick={() => onFilterMember(filterMember === m.id ? null : m.id)}
                >
                  <span className="member-avatar-sm" style={{ backgroundColor: m.color }}>{m.initials}</span>
                  <span className="member-name">{m.name}</span>
                  <button
                    className="row-delete-btn"
                    onClick={e => { e.stopPropagation(); onDeleteMember(m.id); }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => setLabelsOpen(s => !s)}>
          <Tag size={14} />
          <span>Labels</span>
          {labelsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <button
            className="section-add-btn"
            onClick={e => { e.stopPropagation(); setShowLabelForm(s => !s); }}
          >
            <Plus size={13} />
          </button>
        </button>
        {labelsOpen && (
          <div className="fade-in">
            {showLabelForm && (
              <div className="mini-form">
                <input
                  className="mini-input"
                  placeholder="Label name..."
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitLabel()}
                  autoFocus
                />
                <div className="color-row">
                  {LABEL_COLORS.map(c => (
                    <button
                      key={c}
                      className="color-dot-btn"
                      data-active={newLabelColor === c}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewLabelColor(c)}
                    />
                  ))}
                </div>
                <div className="mini-form-actions">
                  <button className="mini-cancel" onClick={() => setShowLabelForm(false)}>Cancel</button>
                  <button className="mini-submit" onClick={submitLabel}>Add</button>
                </div>
              </div>
            )}
            <div className="label-list">
              {labels.length === 0 && <p className="sidebar-empty">No labels</p>}
              {labels.map(l => (
                <div
                  key={l.id}
                  className="label-row"
                  data-active={filterLabel === l.id}
                  onClick={() => onFilterLabel(filterLabel === l.id ? null : l.id)}
                >
                  <span className="label-color-dot" style={{ backgroundColor: l.color }} />
                  <span className="label-name">{l.name}</span>
                  <button
                    className="row-delete-btn"
                    onClick={e => { e.stopPropagation(); onDeleteLabel(l.id); }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sidebar {
          width: 220px;
          min-width: 220px;
          height: calc(100vh - 64px);
          overflow-y: auto;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-right: 1px solid var(--border);
        }
        .sidebar-search {
          padding: 4px 4px 8px;
        }
        .search-input {
          width: 100%;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          padding: 8px 10px;
          font-size: 13px;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: var(--border-2); }
        .search-input::placeholder { color: var(--text-3); }
        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 4px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: var(--text-3);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-family: var(--font-display);
          padding: 4px 4px;
          border-radius: var(--radius-sm);
          width: 100%;
          transition: background 0.15s, color 0.15s;
        }
        .section-header:hover { background: var(--bg-3); color: var(--text-2); }
        .section-header span:first-of-type { flex: 1; text-align: left; }
        .section-header-static {
          color: var(--text-3);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-family: var(--font-display);
          padding: 4px 4px;
        }
        .section-add-btn {
          background: transparent;
          color: var(--text-3);
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
        }
        .section-add-btn:hover { background: var(--bg-4); color: var(--text); }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding: 4px;
        }
        .stat-card {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 6px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
        }
        .stat-label {
          font-size: 10px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .filter-chips {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 4px;
        }
        .filter-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          color: var(--text-2);
          font-size: 12.5px;
          padding: 5px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          transition: all 0.15s;
          text-align: left;
        }
        .filter-chip:hover { background: var(--bg-3); }
        .filter-chip[data-active="true"] {
          background: color-mix(in srgb, var(--fc) 12%, transparent);
          border-color: color-mix(in srgb, var(--fc) 30%, transparent);
          color: var(--fc);
        }
        .filter-chip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .mini-form {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 4px 0;
          animation: fadeIn 0.15s ease;
        }
        .mini-input {
          background: var(--bg-4);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          padding: 7px 10px;
          font-size: 12.5px;
          width: 100%;
        }
        .mini-input::placeholder { color: var(--text-3); }
        .color-row {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        .color-dot-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: transform 0.1s, border-color 0.1s;
        }
        .color-dot-btn:hover { transform: scale(1.2); }
        .color-dot-btn[data-active="true"] { border-color: white; transform: scale(1.15); }
        .mini-form-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }
        .mini-cancel {
          background: transparent;
          color: var(--text-3);
          font-size: 12px;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .mini-cancel:hover { color: var(--text); }
        .mini-submit {
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          transition: opacity 0.15s;
        }
        .mini-submit:hover { opacity: 0.9; }
        .member-list, .label-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 0 4px;
        }
        .sidebar-empty {
          font-size: 12px;
          color: var(--text-3);
          padding: 4px 4px;
          font-style: italic;
        }
        .member-row, .label-row {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 5px 7px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .member-row:hover, .label-row:hover { background: var(--bg-3); }
        .member-row[data-active="true"], .label-row[data-active="true"] {
          background: var(--accent-glow);
          border-color: var(--accent) + '44';
        }
        .member-avatar-sm {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: white;
          font-family: var(--font-display);
          flex-shrink: 0;
        }
        .member-name, .label-name {
          font-size: 12.5px;
          color: var(--text-2);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label-color-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .row-delete-btn {
          background: transparent;
          color: var(--text-3);
          padding: 2px;
          border-radius: 3px;
          display: flex;
          opacity: 0;
          transition: opacity 0.15s, background 0.15s;
        }
        .member-row:hover .row-delete-btn,
        .label-row:hover .row-delete-btn { opacity: 1; }
        .row-delete-btn:hover { background: #ef444422; color: #ef4444; }
      `}</style>
    </aside>
  );
}
