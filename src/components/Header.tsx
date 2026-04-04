import React from 'react';
import { Plus, Zap } from 'lucide-react';

interface Props {
  onNewTask: () => void;
}

export function Header({ onNewTask }: Props) {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-mark">
          <Zap size={16} fill="currentColor" />
        </div>
        <span className="logo-text">flow</span>
        <span className="logo-tag">board</span>
      </div>

      <div className="header-actions">
        <button className="new-task-btn" onClick={onNewTask}>
          <Plus size={15} />
          New Task
        </button>
      </div>

      <style>{`
        .header {
          height: 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-mark {
          width: 28px;
          height: 28px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
        }
        .logo-tag {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-3);
          background: var(--bg-3);
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .new-task-btn {
          background: var(--accent);
          color: white;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          font-weight: 600;
          font-family: var(--font-display);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .new-task-btn:hover { opacity: 0.9; }
        .new-task-btn:active { transform: scale(0.97); }
      `}</style>
    </header>
  );
}
