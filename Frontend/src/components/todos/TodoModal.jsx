import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTodosStore } from '../../stores/todosStore';
import { X, Calendar, Clock, Flag, Folder, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function TodoModalForm({ todo, onClose, onDelete }) {
  const { user } = useAuthStore();
  const { createTodo, updateTodo } = useTodosStore();

  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState(
    todo?.due_date || new Date().toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState(todo?.due_time || '');
  const [priority, setPriority] = useState(todo?.priority || 'medium');
  const [category, setCategory] = useState(todo?.category || 'General');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please specify a title for the task duty.');
      return;
    }

    setSubmitting(true);
    try {
      if (todo) {
        const { error } = await updateTodo(todo.id, {
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate || null,
          due_time: dueTime || null,
          priority,
          category: category.trim() || 'General',
        });
        if (error) throw new Error(error);
        toast.success('Task updated in ledger!');
      } else {
        const { error } = await createTodo(
          {
            title: title.trim(),
            description: description.trim(),
            due_date: dueDate || null,
            due_time: dueTime || null,
            priority,
            category: category.trim() || 'General',
          },
          user?.id || 'local-dev-user-01'
        );
        if (error) throw new Error(error);
        toast.success('Duty entered into ledger!');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="vintage-card"
      style={{
        maxWidth: '560px',
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
          <Flag size={20} color="var(--theme-text)" />
          <h2
            style={{
              margin: 0,
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              color: 'var(--theme-text)',
            }}
          >
            {todo ? 'Revise Task Duty' : 'New Todo Assignment'}
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
            Task Duty Title
          </label>
          <input
            type="text"
            className="vintage-input"
            placeholder="e.g. Audit ledger accounts & inventory"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: '1.05rem', fontWeight: 600 }}
            required
          />
        </div>

        {/* Description */}
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
            Duty Details & Notes (Optional)
          </label>
          <textarea
            className="vintage-input"
            rows={3}
            placeholder="Inscribe instructions, references, or contextual memos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Date & Time Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              <Calendar size={14} /> Due Date
            </label>
            <input
              type="date"
              className="vintage-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

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
              <Clock size={14} /> Due Time
            </label>
            <input
              type="time"
              className="vintage-input"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>

        {/* Priority & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Priority */}
          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                color: 'var(--theme-text-muted)',
                marginBottom: '6px',
              }}
            >
              Urgency Priority
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'low', label: 'Low' },
                { id: 'medium', label: 'Med' },
                { id: 'high', label: 'High' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.82rem',
                    fontWeight: priority === p.id ? 800 : 500,
                    cursor: 'pointer',
                    border: '1.5px solid var(--theme-border-strong)',
                    backgroundColor:
                      priority === p.id
                        ? 'var(--theme-border-strong)'
                        : 'var(--theme-surface)',
                    color:
                      priority === p.id
                        ? 'var(--theme-btn-text)'
                        : 'var(--theme-text)',
                    boxShadow: priority === p.id ? '2px 2px 0px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
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
              <Folder size={14} /> Category
            </label>
            <input
              type="text"
              className="vintage-input"
              placeholder="General, Work, Personal"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1.5px dashed var(--theme-border-strong)',
            paddingTop: '18px',
            marginTop: '10px',
          }}
        >
          {todo && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
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
              <Trash2 size={16} /> Discard Task
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
              {submitting ? 'Recording...' : todo ? 'Update Task' : 'Enter In Ledger'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TodoModal({ isOpen, todo, onClose, onDelete }) {
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
      <TodoModalForm
        key={todo?.id || 'new_todo'}
        todo={todo}
        onClose={onClose}
        onDelete={onDelete}
      />
    </div>
  );
}
