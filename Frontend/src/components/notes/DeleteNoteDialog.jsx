import { Trash2, X } from 'lucide-react';

export default function DeleteNoteDialog({ isOpen, noteTitle, onConfirm, onCancel }) {
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
      onClick={onCancel}
    >
      <div
        className="vintage-card"
        style={{
          maxWidth: '420px',
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
          onClick={onCancel}
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
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              marginBottom: '12px',
            }}
          >
            <Trash2 size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', textTransform: 'uppercase' }}>
            Discard Manuscript?
          </h2>
          <p
            style={{
              margin: '8px 0 0 0',
              color: 'var(--theme-text-muted, #777777)',
              fontSize: '0.95rem',
              lineHeight: 1.4,
            }}
          >
            Are you certain you wish to purge &ldquo;<strong>{noteTitle || 'this note'}</strong>&rdquo;
            from your ledger? This action cannot be revoked.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="vintage-btn vintage-btn-secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            Preserve Note
          </button>
          <button
            type="button"
            className="vintage-btn vintage-btn-danger"
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            <Trash2 size={16} /> Discard
          </button>
        </div>
      </div>
    </div>
  );
}
