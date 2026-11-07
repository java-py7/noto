import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../../stores/notesStore';
import { useTodosStore } from '../../stores/todosStore';
import { StickyNote, CheckSquare, Search, X } from 'lucide-react';

export default function GlobalSearch({ query, onClose, onSelectNote, onSelectTodo }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { notes } = useNotesStore();
  const { todos } = useTodosStore();

  const trimmed = query.trim().toLowerCase();

  const matchedNotes = trimmed
    ? notes.filter((n) => {
        const titleMatch = n.title?.toLowerCase().includes(trimmed);
        const contentMatch = n.content?.toLowerCase().includes(trimmed);
        const categoryMatch = n.category?.toLowerCase().includes(trimmed);
        const tagsMatch = n.tags?.some((t) => t.toLowerCase().includes(trimmed));
        return titleMatch || contentMatch || categoryMatch || tagsMatch;
      })
    : [];

  const matchedTodos = trimmed
    ? todos.filter((t) => {
        const titleMatch = t.title?.toLowerCase().includes(trimmed);
        const descMatch = t.description?.toLowerCase().includes(trimmed);
        const catMatch = t.category?.toLowerCase().includes(trimmed);
        return titleMatch || descMatch || catMatch;
      })
    : [];

  const totalMatches = matchedNotes.length + matchedTodos.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!trimmed) return null;

  return (
    <div
      ref={dropdownRef}
      className="vintage-card"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-strong)',
        boxShadow: '4px 6px 0px var(--theme-border-strong)',
        maxHeight: '440px',
        overflowY: 'auto',
        zIndex: 1050,
        padding: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '8px',
          borderBottom: '1px dashed var(--theme-border-strong)',
          marginBottom: '8px',
          fontSize: '0.85rem',
          color: 'var(--theme-text-muted)',
        }}
      >
        <span>
          Found <strong>{totalMatches}</strong> dispatch results
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--theme-text)',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {totalMatches === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 12px' }}>
          <Search
            size={28}
            style={{ margin: '0 auto 8px auto', color: 'var(--theme-text-muted)' }}
          />
          <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--theme-text)' }}>
            No parchment notes or task records match &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {matchedNotes.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-text)',
                  marginBottom: '6px',
                }}
              >
                <StickyNote size={14} />
                Sticky Notes ({matchedNotes.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedNotes.slice(0, 5).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      onClose();
                      if (onSelectNote) onSelectNote(note);
                      else navigate('/notes');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--theme-surface-subtle, var(--theme-surface))',
                      border: '1px solid var(--theme-border-strong)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <strong style={{ fontSize: '0.92rem', color: 'var(--theme-text)' }}>
                        {note.title}
                      </strong>
                      <span
                        className="vintage-badge"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          border: '1px solid var(--theme-border-strong)',
                        }}
                      >
                        {note.category || 'General'}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.82rem',
                        color: 'var(--theme-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedTodos.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-text)',
                  marginBottom: '6px',
                }}
              >
                <CheckSquare size={14} />
                Tasks ({matchedTodos.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedTodos.slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => {
                      onClose();
                      if (onSelectTodo) onSelectTodo(todo);
                      else navigate('/todos');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--theme-surface-subtle, var(--theme-surface))',
                      border: '1px solid var(--theme-border-strong)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          textDecoration: todo.is_completed ? 'line-through' : 'none',
                          color: 'var(--theme-text)',
                        }}
                      >
                        {todo.title}
                      </span>
                      <span
                        className="vintage-badge"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          textTransform: 'capitalize',
                          border: '1px solid var(--theme-border-strong)',
                        }}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    {todo.due_date && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--theme-text-muted)',
                          marginTop: '3px',
                        }}
                      >
                        Due: {todo.due_date} {todo.due_time ? `@ ${todo.due_time}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
