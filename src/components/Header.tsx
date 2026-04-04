import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onNewTask: () => void;
}

export function Header({ onNewTask }: Props) {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-mark">
          <img src="/logo.png" alt="Sportlingo" width={26} height={26} style={{ objectFit: 'contain' }} />
        </div>
        <span className="logo-text">sportlingo</span>
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
          width: 34px;
          height: 34px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 16px rgba(192, 41, 43, 0.4);
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
          color: var(--accent-2);
          background: var(--bg-4);
          border: 1px solid var(--accent);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          opacity: 0.85;
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
