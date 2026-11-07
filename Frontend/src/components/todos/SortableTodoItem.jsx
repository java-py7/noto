import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

export default function SortableTodoItem({
  todo,
  todayStr,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : todo.is_completed ? 0.72 : 1,
    zIndex: isDragging ? 50 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    border: '2px solid var(--theme-border-strong)',
    borderRadius: '3px',
    boxShadow: isDragging
      ? '6px 8px 16px var(--theme-border-strong)'
      : '2.5px 2.5px 0px var(--theme-border-strong)',
    boxSizing: 'border-box',
    touchAction: 'pan-y',
  };

  const isOverdue = !todo.is_completed && todo.due_date && todo.due_date < todayStr;
  const isToday = !todo.is_completed && todo.due_date === todayStr;

  return (
    <div ref={setNodeRef} style={style} className="noto-todo-item">
      {/* Drag Grip Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--theme-text-muted)',
          padding: '6px 4px',
          userSelect: 'none',
          flexShrink: 0,
          touchAction: 'none',
        }}
        title="Drag to rearrange task duty order"
      >
        <GripVertical size={18} />
      </div>

      {/* Completion Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(todo.id);
        }}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '3px',
          border: '2px solid var(--theme-border-strong)',
          backgroundColor: todo.is_completed
            ? 'var(--theme-border-strong)'
            : 'var(--theme-surface)',
          color: 'var(--theme-btn-text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0,
          boxShadow: '1px 1px 0px var(--theme-border-strong)',
          transition: 'all 0.15s ease',
        }}
        title={todo.is_completed ? 'Reopen assignment' : 'Mark as fulfilled'}
      >
        {todo.is_completed && <CheckCircle2 size={16} />}
      </button>

      {/* Task Info Area */}
      <div
        onClick={() => onEdit(todo)}
        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '1.05rem',
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
              padding: '1px 7px',
              textTransform: 'uppercase',
              border: '1px solid var(--theme-border-strong)',
              backgroundColor:
                todo.priority === 'high'
                  ? 'var(--theme-highlight)'
                  : 'var(--theme-surface)',
              color: 'var(--theme-text)',
              fontWeight: todo.priority === 'high' ? 800 : 600,
            }}
          >
            {todo.priority} Priority
          </span>

          <span
            className="vintage-badge"
            style={{
              fontSize: '0.65rem',
              padding: '1px 7px',
              border: '1px solid var(--theme-border-strong)',
              backgroundColor: 'var(--theme-surface)',
              color: 'var(--theme-text)',
            }}
          >
            {todo.category || 'General'}
          </span>
        </div>

        {todo.description && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.88rem',
              color: 'var(--theme-text-muted)',
              lineHeight: 1.4,
            }}
          >
            {todo.description}
          </p>
        )}

        {/* Due Date & Timestamp Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '4px',
            fontSize: '0.78rem',
            color: isOverdue
              ? 'var(--theme-border-strong)'
              : 'var(--theme-text-muted)',
            fontWeight: isOverdue ? 700 : 500,
          }}
        >
          {todo.due_date ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              <span>
                {isOverdue && <strong>[OVERDUE] </strong>}
                {isToday && <strong>[TODAY] </strong>}
                {todo.due_date} {todo.due_time ? `@ ${todo.due_time}` : ''}
              </span>
            </div>
          ) : (
            <span style={{ fontStyle: 'italic' }}>No specified deadline</span>
          )}

          {todo.is_completed && todo.completed_at && (
            <span>
              &bull; Fulfilled on {new Date(todo.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onEdit(todo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--theme-text-muted)',
          }}
          title="Revise task details"
        >
          <Edit3 size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(todo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--theme-border-strong)',
          }}
          title="Discard task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
