import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { useAuthStore } from '../stores/authStore';
import { useNotesStore } from '../stores/notesStore';
import { useTodosStore } from '../stores/todosStore';
import NoteModal from '../components/notes/NoteModal';
import TodoModal from '../components/todos/TodoModal';
import {
  StickyNote,
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const { notes } = useNotesStore();
  const { todos, toggleComplete, getStats } = useTodosStore();

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Penman';

  const stats = getStats();
  const totalNotes = notes.filter((n) => !n.is_archived).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const recentNotes = [...notes]
    .filter((n) => !n.is_archived)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 4);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTodos = [...todos]
    .filter((t) => !t.is_completed)
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 5);

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setNoteModalOpen(true);
  };

  const handleEditTodo = (todo) => {
    setSelectedTodo(todo);
    setTodoModalOpen(true);
  };

  const handleCheckTodo = async (id, e) => {
    e.stopPropagation();
    await toggleComplete(id);
    toast.success('Task ledger updated!');
  };

  return (
    <Layout
      onNewNote={() => {
        setSelectedNote(null);
        setNoteModalOpen(true);
      }}
      onNewTodo={() => {
        setSelectedTodo(null);
        setTodoModalOpen(true);
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Section */}
        <section
          className="vintage-card"
          style={{
            padding: 'clamp(20px, 4vw, 32px)',
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border-strong)',
            boxShadow: '4px 4px 0px var(--theme-border-strong)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '18px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--theme-text-muted)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                marginBottom: '8px',
              }}
            >
              <Calendar size={16} />
              <span>{todayFormatted}</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--theme-text)',
              }}
            >
              Good Day, {username}
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--theme-text-muted)',
                fontSize: '1rem',
                fontStyle: 'italic',
                maxWidth: '600px',
              }}
            >
              &ldquo;The habit of writing down one&rsquo;s thoughts and duties is the true mark of a disciplined mind.&rdquo;
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="vintage-btn"
              onClick={() => {
                setSelectedNote(null);
                setNoteModalOpen(true);
              }}
            >
              <Plus size={16} />
              New Sticky Note
            </button>
            <button
              type="button"
              className="vintage-btn vintage-btn-secondary"
              onClick={() => {
                setSelectedTodo(null);
                setTodoModalOpen(true);
              }}
            >
              <Plus size={16} />
              New Todo Task
            </button>
          </div>
        </section>

        {/* Overview Statistics Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Total Notes */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Total Notes
              </span>
              <StickyNote size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {totalNotes}
            </div>
          </div>

          {/* Total Todos */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Total Tasks
              </span>
              <CheckSquare size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.total}
            </div>
          </div>

          {/* Pending Tasks */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Pending
              </span>
              <Clock size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.pending}
            </div>
          </div>

          {/* Completed Tasks */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Completed
              </span>
              <CheckCircle2 size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.completed}
            </div>
          </div>

          {/* Due Today */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Due Today
              </span>
              <Calendar size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.dueToday}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div
            className="vintage-card"
            style={{
              padding: '18px',
              backgroundColor: 'var(--theme-surface)',
              borderLeft: '4px solid var(--theme-border-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--theme-text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                Overdue
              </span>
              <AlertCircle size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.overdue}
            </div>
          </div>
        </section>

        {/* Main Content Grid: Recent Notes & Upcoming Tasks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Recent Notes Panel */}
          <section
            className="vintage-card"
            style={{
              padding: '22px',
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1.5px dashed var(--theme-border-strong)',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StickyNote size={19} color="var(--theme-text)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--theme-text)' }}>
                  Recent Manuscripts
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/notes')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                View Cabinet <ArrowRight size={14} />
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <BookOpen
                  size={36}
                  style={{ margin: '0 auto 12px auto', color: 'var(--theme-text-muted)' }}
                />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--theme-text)' }}>
                  No Notes Recorded Yet
                </h3>
                <p
                  style={{
                    color: 'var(--theme-text-muted)',
                    fontSize: '0.92rem',
                    fontStyle: 'italic',
                    marginBottom: '18px',
                  }}
                >
                  Your cabinet ledger is pristine. Inscribe your first thoughts or instructions.
                </p>
                <button
                  type="button"
                  className="vintage-btn"
                  onClick={() => {
                    setSelectedNote(null);
                    setNoteModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Compose Note
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleEditNote(note)}
                    style={{
                      position: 'relative',
                      padding: '16px 18px',
                      backgroundColor: 'var(--theme-surface)',
                      border: '1.5px solid var(--theme-border-strong)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px var(--theme-border-strong)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '4px 4px 0px var(--theme-border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '2px 2px 0px var(--theme-border-strong)';
                    }}
                  >
                    {note.is_pinned && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '18px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--theme-pin)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                        title="Pinned Note"
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3
                        style={{
                          margin: '0 0 6px 0',
                          fontSize: '1.05rem',
                          fontFamily: 'var(--font-serif)',
                          fontWeight: 700,
                          color: 'var(--theme-text)',
                        }}
                      >
                        {note.title}
                      </h3>
                      <span
                        className="vintage-badge"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 8px',
                          backgroundColor: 'var(--theme-highlight)',
                          borderColor: 'var(--theme-border-strong)',
                          color: 'var(--theme-text)',
                        }}
                      >
                        {note.category || 'General'}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        color: 'var(--theme-text)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {note.content}
                    </p>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--theme-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      Updated {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Tasks Panel */}
          <section
            className="vintage-card"
            style={{
              padding: '22px',
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1.5px dashed var(--theme-border-strong)',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={19} color="var(--theme-text)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--theme-text)' }}>
                  Urgent & Upcoming Duties
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/todos')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                All Tasks <ArrowRight size={14} />
              </button>
            </div>

            {upcomingTodos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <CheckCircle2
                  size={36}
                  style={{ margin: '0 auto 12px auto', color: 'var(--theme-text)' }}
                />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--theme-text)' }}>
                  All Duties Discharged!
                </h3>
                <p
                  style={{
                    color: 'var(--theme-text-muted)',
                    fontSize: '0.92rem',
                    fontStyle: 'italic',
                    marginBottom: '18px',
                  }}
                >
                  No pending duties in your immediate ledger.
                </p>
                <button
                  type="button"
                  className="vintage-btn vintage-btn-secondary"
                  onClick={() => {
                    setSelectedTodo(null);
                    setTodoModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Add Task
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingTodos.map((todo) => {
                  const isOverdue = todo.due_date && todo.due_date < todayStr;
                  const isToday = todo.due_date === todayStr;

                  return (
                    <div
                      key={todo.id}
                      onClick={() => handleEditTodo(todo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        backgroundColor: 'var(--theme-surface)',
                        border: '1.5px solid var(--theme-border-strong)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px var(--theme-border-strong)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleCheckTodo(todo.id, e)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          border: '2px solid var(--theme-border-strong)',
                          backgroundColor: 'var(--theme-surface)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          flexShrink: 0,
                        }}
                        title="Mark Complete"
                      />

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--theme-text)',
                          }}
                        >
                          {todo.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            fontSize: '0.78rem',
                            color: isOverdue ? 'var(--theme-border-strong)' : 'var(--theme-text-muted)',
                            fontWeight: isOverdue ? 700 : 500,
                            marginTop: '2px',
                          }}
                        >
                          {isOverdue && <strong>[OVERDUE] {todo.due_date}</strong>}
                          {isToday && <strong>[TODAY] {todo.due_time ? `@ ${todo.due_time}` : ''}</strong>}
                          {!isOverdue && !isToday && (
                            <span>{todo.due_date ? `Due ${todo.due_date}` : 'No deadline'}</span>
                          )}
                          <span>&bull;</span>
                          <span>{todo.category}</span>
                        </div>
                      </div>

                      <span
                        className="vintage-badge"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 7px',
                          textTransform: 'uppercase',
                          backgroundColor: 'var(--theme-highlight)',
                          color: 'var(--theme-text)',
                          borderColor: 'var(--theme-border-strong)',
                        }}
                      >
                        {todo.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Note Creation / Edit Modal */}
      <NoteModal
        isOpen={noteModalOpen}
        note={selectedNote}
        onClose={() => {
          setNoteModalOpen(false);
          setSelectedNote(null);
        }}
      />

      {/* Todo Creation / Edit Modal */}
      <TodoModal
        isOpen={todoModalOpen}
        todo={selectedTodo}
        onClose={() => {
          setTodoModalOpen(false);
          setSelectedTodo(null);
        }}
      />
    </Layout>
  );
}
