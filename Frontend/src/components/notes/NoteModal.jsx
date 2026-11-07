import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotesStore } from '../../stores/notesStore';
import { X, Pin, Tag, Folder, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function NoteModalForm({ note, onClose, onDelete }) {
  const { user } = useAuthStore();
  const { createNote, updateNote } = useNotesStore();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || 'General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(note?.tags || []);
  const [isPinned, setIsPinned] = useState(Boolean(note?.is_pinned));
  const [submitting, setSubmitting] = useState(false);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please provide a title for your manuscript note.');
      return;
    }

    setSubmitting(true);
    try {
      if (note) {
        const { error } = await updateNote(note.id, {
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || 'General',
          tags,
          is_pinned: isPinned,
        });
        if (error) throw new Error(error);
        toast.success('Manuscript note updated!');
      } else {
        const { error } = await createNote(
          {
            title: title.trim(),
            content: content.trim(),
            category: category.trim() || 'General',
            tags,
            is_pinned: isPinned,
          },
          user?.id || 'local-dev-user-01'
        );
        if (error) throw new Error(error);
        toast.success('New note pinned to cabinet archive!');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="vintage-card"
      style={{
        maxWidth: '620px',
        width: '100%',
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-strong)',
        boxShadow: '8px 8px 0px var(--theme-border-strong)',
        padding: 'clamp(20px, 4vw, 28px)',
        boxSizing: 'border-box',
        position: 'relative',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px dashed var(--theme-border-strong)',
          paddingBottom: '14px',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-pin)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              color: 'var(--theme-text)',
            }}
          >
            {note ? 'Edit Manuscript' : 'New Sticky Note'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--theme-text-muted)',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSave}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          paddingRight: '4px',
          flex: 1,
        }}
      >
        {/* Title */}
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--theme-text-muted)',
              marginBottom: '6px',
            }}
          >
            Note Title
          </label>
          <input
            type="text"
            className="vintage-input"
            placeholder="e.g. Rare Fountain Pen Restoration Journal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
            }}
            required
          />
        </div>

        {/* Content */}
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--theme-text-muted)',
              marginBottom: '6px',
            }}
          >
            Parchment Content
          </label>
          <textarea
            className="vintage-input"
            rows={7}
            placeholder="Inscribe details, telegram summaries, or daily recollections..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              resize: 'vertical',
              lineHeight: 1.55,
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Metadata Row: Category & Pin */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Category */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                color: 'var(--theme-text-muted)',
                marginBottom: '6px',
              }}
            >
              <Folder size={14} /> Category
            </label>
            <input
              type="text"
              className="vintage-input"
              placeholder="General, Work, Personal, Ideas"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                fontSize: '0.92rem',
              }}
            />
          </div>

          {/* Pin to Top */}
          <div style={{ paddingTop: '18px' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--theme-text)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--theme-border-strong)',
                  cursor: 'pointer',
                }}
              />
              <Pin size={16} /> Pin to top of cabinet
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              color: 'var(--theme-text-muted)',
              marginBottom: '6px',
            }}
          >
            <Tag size={14} /> Tags (Press Enter to add)
          </label>
          <input
            type="text"
            className="vintage-input"
            placeholder="Type tag and hit Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            style={{
              fontSize: '0.92rem',
            }}
          />
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--theme-highlight)',
                    borderRadius: '2px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--theme-text)',
                    border: '1px solid var(--theme-border-strong)',
                  }}
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      color: 'var(--theme-text)',
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1.5px dashed var(--theme-border-strong)',
            paddingTop: '18px',
            marginTop: '8px',
          }}
        >
          {note && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--theme-border-strong)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
              }}
            >
              <Trash2 size={16} /> Discard Note
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="vintage-btn vintage-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="vintage-btn" disabled={submitting}>
              <Check size={16} />
              {submitting ? 'Inscribing...' : note ? 'Save Changes' : 'Pin to Board'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NoteModal({ isOpen, note, onClose, onDelete }) {
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
        zIndex: 1100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <NoteModalForm
        key={note?.id || 'new_note'}
        note={note}
        onClose={onClose}
        onDelete={onDelete}
      />
    </div>
  );
}
