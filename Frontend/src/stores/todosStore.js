import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';

const LOCAL_TODOS_KEY = 'noto_local_todos';

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_SAMPLE_TODOS = [
  {
    id: 'sample-todo-1',
    user_id: 'local-dev-user-01',
    title: 'Review ledger accounts & inventory logs',
    description: 'Ensure all ink manuscript records match quarterly tallies.',
    due_date: getTodayString(),
    due_time: '17:00',
    priority: 'high',
    category: 'Work',
    is_completed: false,
    completed_at: null,
    order_index: 0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-todo-2',
    user_id: 'local-dev-user-01',
    title: 'Source antique vellum stationery paper',
    description: 'Contact local mill for archival quality parchment rolls.',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    due_time: '14:30',
    priority: 'medium',
    category: 'Stationery',
    is_completed: false,
    completed_at: null,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-todo-3',
    user_id: 'local-dev-user-01',
    title: 'Fountain pen nib inspection & cleaning',
    description: 'Ultrasonic cleanse the gold nibs and flush with distilled water.',
    due_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    due_time: '11:00',
    priority: 'low',
    category: 'Personal',
    is_completed: true,
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    order_index: 2,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const useTodosStore = create((set, get) => ({
  todos: [],
  loading: false,
  error: null,
  activeView: 'all', // 'all', 'today', 'upcoming', 'overdue', 'completed'
  priorityFilter: 'all', // 'all', 'high', 'medium', 'low'
  categoryFilter: 'all',
  searchQuery: '',
  sortBy: 'manual', // 'manual', 'due_date_asc', 'priority_desc', 'created_desc', 'title_asc'

  fetchTodos: async (userId) => {
    if (!userId) {
      set({ todos: [], loading: false });
      return;
    }

    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(LOCAL_TODOS_KEY);
      const localTodos = stored ? JSON.parse(stored) : INITIAL_SAMPLE_TODOS;
      set({ todos: localTodos, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ todos: data || [], loading: false });
    } catch (err) {
      console.error('Error fetching todos:', err);
      const stored = localStorage.getItem(LOCAL_TODOS_KEY);
      set({ todos: stored ? JSON.parse(stored) : [], loading: false, error: err.message });
    }
  },

  createTodo: async (todoData, userId) => {
    const currentTodos = get().todos;
    const nextOrderIndex = currentTodos.length > 0
      ? Math.max(...currentTodos.map((t) => t.order_index ?? 0)) + 1
      : 0;

    const newTodo = {
      ...todoData,
      user_id: userId,
      priority: todoData.priority || 'medium',
      category: todoData.category || 'General',
      is_completed: false,
      completed_at: null,
      order_index: nextOrderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const id = 'todo_' + Date.now();
      const created = { ...newTodo, id };
      const updatedTodos = [created, ...currentTodos];
      set({ todos: updatedTodos });
      localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(updatedTodos));
      return { data: created, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()
        .single();

      if (error) throw error;
      set({ todos: [data, ...currentTodos] });
      return { data, error: null };
    } catch (err) {
      console.error('Error creating todo:', err);
      return { data: null, error: err.message };
    }
  },

  updateTodo: async (id, updates) => {
    const previousTodos = get().todos;
    const optimisticTodos = previousTodos.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    );
    set({ todos: optimisticTodos });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(optimisticTodos));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('todos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error updating todo:', err);
      set({ todos: previousTodos });
      return { error: err.message };
    }
  },

  reorderTodos: async (reorderedTodos) => {
    const indexed = reorderedTodos.map((todo, idx) => ({
      ...todo,
      order_index: idx,
    }));
    set({ todos: indexed });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(indexed));
      return;
    }

    try {
      for (const item of indexed) {
        await supabase
          .from('todos')
          .update({
            order_index: item.order_index,
            category: item.category,
          })
          .eq('id', item.id);
      }
    } catch (err) {
      console.error('Error persisting reordered todos:', err);
    }
  },

  toggleComplete: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    const nextCompleted = !todo.is_completed;
    const completed_at = nextCompleted ? new Date().toISOString() : null;

    return get().updateTodo(id, {
      is_completed: nextCompleted,
      completed_at,
    });
  },

  deleteTodo: async (id) => {
    const previousTodos = get().todos;
    const remainingTodos = previousTodos.filter((t) => t.id !== id);
    set({ todos: remainingTodos });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(remainingTodos));
      return { error: null };
    }

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting todo:', err);
      set({ todos: previousTodos });
      return { error: err.message };
    }
  },

  clearCompleted: async (userId) => {
    const previousTodos = get().todos;
    const remainingTodos = previousTodos.filter((t) => !t.is_completed);
    set({ todos: remainingTodos });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(remainingTodos));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', userId)
        .eq('is_completed', true);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error clearing completed:', err);
      set({ todos: previousTodos });
      return { error: err.message };
    }
  },

  setView: (activeView) => set({ activeView }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),

  getFilteredTodos: () => {
    const { todos, activeView, priorityFilter, categoryFilter, searchQuery, sortBy } = get();
    const today = getTodayString();

    const priorityWeights = { high: 3, medium: 2, low: 1 };

    return todos
      .filter((todo) => {
        // View filter
        if (activeView === 'today') {
          if (todo.due_date !== today || todo.is_completed) return false;
        } else if (activeView === 'upcoming') {
          if (!todo.due_date || todo.due_date <= today || todo.is_completed) return false;
        } else if (activeView === 'overdue') {
          if (!todo.due_date || todo.due_date >= today || todo.is_completed) return false;
        } else if (activeView === 'completed') {
          if (!todo.is_completed) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;

        // Search query
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
        // Incomplete first if view is 'all'
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
  },

  getStats: () => {
    const { todos } = get();
    const today = getTodayString();

    const total = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const pending = total - completed;
    const overdue = todos.filter((t) => !t.is_completed && t.due_date && t.due_date < today).length;
    const dueToday = todos.filter((t) => !t.is_completed && t.due_date === today).length;

    return { total, completed, pending, overdue, dueToday };
  },

  getCategories: () => {
    const { todos } = get();
    const categories = new Set(['General', 'Work', 'Personal', 'Stationery']);
    todos.forEach((t) => {
      if (t.category) categories.add(t.category);
    });
    return Array.from(categories);
  },
}));
