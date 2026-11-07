import { useState, useMemo } from 'react';
import Layout from '../components/layout';
import TodoModal from '../components/todos/TodoModal';
import DeleteTodoDialog from '../components/todos/DeleteTodoDialog';
import SortableTodoItem from '../components/todos/SortableTodoItem';
import { useTodosStore } from '../stores/todosStore';
import { useAuthStore } from '../stores/authStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Search,
  CheckCircle2,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Todos() {
  const { user } = useAuthStore();
  const {
    todos,
    toggleComplete,
    deleteTodo,
    clearCompleted,
    reorderTodos,
    getCategories,
    getStats,
  } = useTodosStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  // Filters & Views
  const [activeView, setActiveView] = useState('all'); // 'all', 'today', 'upcoming', 'overdue', 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('manual'); // 'manual', 'due_date_asc', 'priority_desc', 'created_desc', 'title_asc'

  const categories = getCategories();
  const stats = getStats();
  const todayStr = new Date().toISOString().split('T')[0];

  // Sensors for Desktop and Mobile Drag and Drop
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 180,
      tolerance: 6,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  const displayedTodos = useMemo(() => {
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    return todos
      .filter((todo) => {
        if (activeView === 'today') {
          if (todo.due_date !== todayStr || todo.is_completed) return false;
        } else if (activeView === 'upcoming') {
          if (!todo.due_date || todo.due_date <= todayStr || todo.is_completed) return false;
        } else if (activeView === 'overdue') {
          if (!todo.due_date || todo.due_date >= todayStr || todo.is_completed) return false;
        } else if (activeView === 'completed') {
          if (!todo.is_completed) return false;
        }

        if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = todo.title?.toLowerCase().includes(q);
          const matchDesc = todo.description?.toLowerCase().includes(q);
          const matchCat = todo.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (activeView === 'all') {
          if (!a.is_completed && b.is_completed) return -1;
          if (a.is_completed && !b.is_completed) return 1;
        }

        if (sortBy === 'priority_desc') {
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        }
        if (sortBy === 'created_desc') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'due_date_asc') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }
        // Default: manual drag-and-drop order
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      });
  }, [todos, activeView, priorityFilter, categoryFilter, searchQuery, sortBy, todayStr]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayedTodos.findIndex((t) => t.id === active.id);
    const newIndex = displayedTodos.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(displayedTodos, oldIndex, newIndex);
      await reorderTodos(reordered);
      toast.success('Task priority sequence rearranged!');
    }
  };

  const handleOpenAdd = () => {
    setSelectedTodo(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (todo) => {
    setSelectedTodo(todo);
    setModalOpen(true);
  };

  const handlePromptDelete = (todo) => {
    setTodoToDelete(todo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;
    await deleteTodo(todoToDelete.id);
    toast.success('Task erased from ledger.');
    setDeleteDialogOpen(false);
    setTodoToDelete(null);
    if (modalOpen) setModalOpen(false);
  };

  const handleToggleComplete = async (id) => {
    await toggleComplete(id);
    toast.success('Task status updated!');
  };

  const handleClearCompleted = async () => {
    if (stats.completed === 0) {
      toast.error('No completed tasks to purge.');
      return;
    }
    await clearCompleted(user?.id);
    toast.success('All completed tasks purged from ledger.');
  };

  return (
    <Layout onNewTodo={handleOpenAdd}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px dashed var(--theme-border-strong)',
            paddingBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                margin: '0 0 6px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--theme-text)',
              }}
            >
              Task Management
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--theme-text-muted)',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              Drag handles to prioritize and resequence daily assignments
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {stats.completed > 0 && (
              <button
                type="button"
                className="vintage-btn vintage-btn-secondary"
                onClick={handleClearCompleted}
                style={{ padding: '12px 16px', fontSize: '0.88rem' }}
                title="Purge all completed records"
              >
                <CheckCheck size={16} /> Purge Completed
              </button>
            )}

            <button
              type="button"
              className="vintage-btn"
              onClick={handleOpenAdd}
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <Plus size={18} /> New Todo Assignment
            </button>
          </div>
        </div>

        {/* Views Toolbar */}
        <div
          className="vintage-card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border-strong)',
          }}
        >
          {/* Main 5 Views */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${stats.total})` },
              { id: 'today', label: `Today (${stats.dueToday})` },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'overdue', label: `Overdue (${stats.overdue})` },
              { id: 'completed', label: `Done (${stats.completed})` },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.88rem',
                  fontWeight: activeView === v.id ? 700 : 500,
                  cursor: 'pointer',
                  border: '1.5px solid var(--theme-border-strong)',
                  backgroundColor:
                    activeView === v.id
                      ? 'var(--theme-border-strong)'
                      : 'var(--theme-surface)',
                  color:
                    activeView === v.id
                      ? 'var(--theme-btn-text)'
                      : 'var(--theme-text)',
                  boxShadow: activeView === v.id ? '2px 2px 0px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Search, Filter & Sort */}
          <div className="todos-toolbar-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div
              className="todos-search-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid var(--theme-border-strong)',
                borderRadius: '3px',
                padding: '4px 10px',
                backgroundColor: 'var(--theme-surface)',
                width: '160px',
              }}
            >
              <Search size={15} style={{ color: 'var(--theme-text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  paddingLeft: '6px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.88rem',
                  width: '100%',
                  color: 'var(--theme-text)',
                }}
              />
            </div>

            {/* Priority Filter */}
            <select
              className="todos-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: '3px',
                border: '1.5px solid var(--theme-border-strong)',
                backgroundColor: 'var(--theme-surface)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Category Filter */}
            <select
              className="todos-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: '3px',
                border: '1.5px solid var(--theme-border-strong)',
                backgroundColor: 'var(--theme-surface)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              className="todos-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: '3px',
                border: '1.5px solid var(--theme-border-strong)',
                backgroundColor: 'var(--theme-surface)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="manual">Manual Sequence (Drag & Drop)</option>
              <option value="due_date_asc">Earliest Due Date</option>
              <option value="priority_desc">Highest Priority</option>
              <option value="created_desc">Newly Added</option>
              <option value="title_asc">Title (A &rarr; Z)</option>
            </select>
          </div>
        </div>

        {/* Tasks Drag and Drop List */}
        {displayedTodos.length === 0 ? (
          <div
            className="vintage-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            <CheckCircle2
              size={48}
              style={{
                margin: '0 auto 16px auto',
                color: 'var(--theme-text-muted)',
              }}
            />
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              No Tasks In This Ledger View
            </h2>
            <p
              style={{
                margin: '0 auto 24px auto',
                color: 'var(--theme-text-muted)',
                fontSize: '1rem',
                fontStyle: 'italic',
                maxWidth: '480px',
              }}
            >
              {searchQuery
                ? `No tasks correspond to your search query "${searchQuery}".`
                : activeView === 'overdue'
                ? 'No tasks are currently overdue. Exemplary ledger discipline!'
                : activeView === 'today'
                ? 'No pending duties scheduled for today.'
                : activeView === 'completed'
                ? 'No completed tasks recorded in your archive.'
                : 'Your todo ledger is empty. Inscribe your first assignment now.'}
            </p>
            <button type="button" className="vintage-btn" onClick={handleOpenAdd}>
              <Plus size={16} /> Inscribe New Task
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayedTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayedTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    todayStr={todayStr}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleOpenEdit}
                    onDelete={handlePromptDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Todo Modal */}
      <TodoModal
        isOpen={modalOpen}
        todo={selectedTodo}
        onClose={() => {
          setModalOpen(false);
          setSelectedTodo(null);
        }}
        onDelete={(id) => {
          const t = todos.find((item) => item.id === id);
          if (t) handlePromptDelete(t);
        }}
      />

      {/* Delete Dialog */}
      <DeleteTodoDialog
        isOpen={deleteDialogOpen}
        todoTitle={todoToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setTodoToDelete(null);
        }}
      />

      <style>{`
        @media (max-width: 640px) {
          .todos-toolbar-controls {
            width: 100% !important;
          }
          .todos-search-box {
            width: 100% !important;
          }
          .todos-select {
            flex: 1 1 calc(50% - 6px) !important;
            width: 100% !important;
          }
        }
      `}</style>
    </Layout>
  );
}
