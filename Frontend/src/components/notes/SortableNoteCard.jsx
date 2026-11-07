import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pin, PinOff, Archive, ArchiveRestore, Trash2, Edit3, GripVertical } from 'lucide-react';

export default function SortableNoteCard({
  note,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '260px',
    backgroundColor: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    border: '2px solid var(--theme-border-strong)',
    borderRadius: '3px',
    padding: '24px 18px 14px 18px',
    boxShadow: isDragging
      ? '8px 12px 20px var(--theme-border-strong)'
      : '3px 3px 0px var(--theme-border-strong)',
    boxSizing: 'border-box',
    touchAction: 'pan-y',
  };

  const formattedDate = new Date(note.updated_at || note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="noto-note-card"
    >
      {/* Top Vintage Pin / Wax Seal Drag Indicator */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          cursor: 'grab',
          padding: '2px 8px',
          backgroundColor: 'var(--theme-surface)',
          border: '1.5px solid var(--theme-border-strong)',
          borderRadius: '10px',
          boxShadow: '1px 1px 0px var(--theme-border-strong)',
          userSelect: 'none',
          touchAction: 'none',
        }}
        title="Drag to rearrange manuscript position"
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: note.is_pinned ? 'var(--theme-pin)' : 'var(--theme-border-strong)',
            flexShrink: 0,
          }}
        />
        <GripVertical size={13} style={{ color: 'var(--theme-text)', opacity: 0.8 }} />
      </div>

      {/* Note Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
          marginTop: '6px',
        }}
      >
        <h3
          onClick={() => onEdit(note)}
          style={{
            margin: 0,
            fontSize: '1.18rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            color: 'var(--theme-text)',
            lineHeight: 1.3,
            cursor: 'pointer',
            flex: 1,
            paddingRight: '6px',
          }}
        >
          {note.title}
        </h3>

        <span
          className="vintage-badge"
          style={{
            fontSize: '0.65rem',
            padding: '2px 7px',
            backgroundColor: 'var(--theme-highlight)',
            borderColor: 'var(--theme-border-strong)',
            color: 'var(--theme-text)',
            flexShrink: 0,
          }}
        >
          {note.category || 'General'}
        </span>
      </div>

      {/* Note Body */}
      <div
        onClick={() => onEdit(note)}
        style={{
          flex: 1,
          fontSize: '0.95rem',
          lineHeight: 1.55,
          color: 'var(--theme-text)',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          cursor: 'pointer',
          marginBottom: '12px',
        }}
      >
        {note.content}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            marginBottom: '10px',
          }}
        >
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.72rem',
                fontStyle: 'italic',
                color: 'var(--theme-text-muted)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px dashed var(--theme-border-strong)',
          paddingTop: '8px',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-text-muted)',
            fontStyle: 'italic',
          }}
        >
          {formattedDate}
        </span>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: note.is_pinned ? 'var(--theme-border-strong)' : 'var(--theme-text-muted)',
            }}
            title={note.is_pinned ? 'Unpin from top' : 'Pin note to top'}
          >
            {note.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(note.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--theme-text-muted)',
            }}
            title={note.is_archived ? 'Restore to active board' : 'Archive note'}
          >
            {note.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--theme-text-muted)',
            }}
            title="Edit manuscript"
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--theme-border-strong)',
            }}
            title="Discard note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
