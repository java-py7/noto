import { LogOut, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="vintage-card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '28px',
          backgroundColor: 'var(--theme-surface, #FFFFFF)',
          borderColor: 'var(--theme-border-strong, #252525)',
          boxShadow: '6px 6px 0px var(--theme-border-strong, #252525)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--theme-text-muted, #777777)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-highlight, #E5E5E4)',
              color: 'var(--theme-primary, #252525)',
              marginBottom: '12px',
            }}
          >
            <LogOut size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase' }}>
            Close Ledger?
          </h2>
          <p
            style={{
              margin: '8px 0 0 0',
              color: 'var(--theme-text-muted, #777777)',
              fontSize: '0.95rem',
              lineHeight: 1.4,
            }}
          >
            Are you sure you wish to conclude your session? Your drafts and task updates remain
            safely cataloged.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="vintage-btn vintage-btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Stay In Ledger
          </button>
          <button
            type="button"
            className="vintage-btn vintage-btn-danger"
            onClick={onLogout}
            style={{ flex: 1 }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
