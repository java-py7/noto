import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';

const LOCAL_NOTES_KEY = 'noto_local_notes';

const INITIAL_SAMPLE_NOTES = [
  {
    id: 'sample-note-1',
    user_id: 'local-dev-user-01',
    title: 'Welcome to NoTo Ledger',
    content: 'NoTo is your dedicated vintage journal for thoughts, dispatch memos, and critical todos. Pin essential notes to the top of your cabinet archive.',
    category: 'Welcome',
    tags: ['welcome', 'guide'],
    color: 'var(--theme-note-base)',
    is_pinned: true,
    is_archived: false,
    order_index: 0,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-note-2',
    user_id: 'local-dev-user-01',
    title: 'Ink & Paper Stationery Rules',
    content: '1. Organize by category\n2. Flag urgent matters in the Todo section\n3. Switch vintage themes in Settings to match your writing desk ambiance.',
    category: 'Stationery',
    tags: ['rules', 'craft'],
    color: 'var(--theme-note-base)',
    is_pinned: false,
    is_archived: false,
    order_index: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-note-3',
    user_id: 'local-dev-user-01',
    title: 'Telegram Dispatch Draft',
    content: 'Review monthly inventory logs before Friday afternoon. Ship the vintage fountain pen nibs to the restoration guild.',
    category: 'Work',
    tags: ['urgent', 'shipment'],
    color: 'var(--theme-note-base)',
    is_pinned: false,
    is_archived: false,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useNotesStore = create((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  activeFilter: 'active', // 'all', 'active', 'pinned', 'archived'
  categoryFilter: 'all',
  searchQuery: '',
  sortBy: 'manual', // 'manual', 'updated_desc', 'created_desc', 'title_asc'

  fetchNotes: async (userId) => {
    if (!userId) {
      set({ notes: [], loading: false });
      return;
    }

    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(LOCAL_NOTES_KEY);
      const localNotes = stored ? JSON.parse(stored) : INITIAL_SAMPLE_NOTES;
      set({ notes: localNotes, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], loading: false });
    } catch (err) {
      console.error('Error fetching notes:', err);
      const stored = localStorage.getItem(LOCAL_NOTES_KEY);
      set({ notes: stored ? JSON.parse(stored) : [], loading: false, error: err.message });
    }
  },

  createNote: async (noteData, userId) => {
    const currentNotes = get().notes;
    const nextOrderIndex = currentNotes.length > 0
      ? Math.max(...currentNotes.map((n) => n.order_index ?? 0)) + 1
      : 0;

    const newNote = {
      ...noteData,
      user_id: userId,
      tags: noteData.tags || [],
      is_pinned: Boolean(noteData.is_pinned),
      is_archived: false,
      order_index: nextOrderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const id = 'note_' + Date.now();
      const created = { ...newNote, id };
      const updatedNotes = [created, ...currentNotes];
      set({ notes: updatedNotes });
      localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(updatedNotes));
      return { data: created, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;
      set({ notes: [data, ...currentNotes] });
      return { data, error: null };
    } catch (err) {
      console.error('Error creating note:', err);
      return { data: null, error: err.message };
    }
  },

  updateNote: async (id, updates) => {
    const previousNotes = get().notes;
    const optimisticNotes = previousNotes.map((n) =>
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    );
    set({ notes: optimisticNotes });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(optimisticNotes));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error updating note:', err);
      set({ notes: previousNotes });
      return { error: err.message };
    }
  },

  reorderNotes: async (reorderedNotes) => {
    const indexed = reorderedNotes.map((note, idx) => ({
      ...note,
      order_index: idx,
    }));
    set({ notes: indexed });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(indexed));
      return;
    }

    try {
      // Persist order_index updates
      for (const item of indexed) {
        await supabase
          .from('notes')
          .update({ order_index: item.order_index })
          .eq('id', item.id);
      }
    } catch (err) {
      console.error('Error persisting reordered notes:', err);
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    return get().updateNote(id, { is_pinned: !note.is_pinned });
  },

  toggleArchive: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    return get().updateNote(id, { is_archived: !note.is_archived });
  },

  deleteNote: async (id) => {
    const previousNotes = get().notes;
    const remainingNotes = previousNotes.filter((n) => n.id !== id);
    set({ notes: remainingNotes });

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(remainingNotes));
      return { error: null };
    }

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting note:', err);
      set({ notes: previousNotes });
      return { error: err.message };
    }
  },

  setFilter: (activeFilter) => set({ activeFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),

  getFilteredNotes: () => {
    const { notes, activeFilter, categoryFilter, searchQuery, sortBy } = get();

    return notes
      .filter((note) => {
        // Status filter
        if (activeFilter === 'active' && note.is_archived) return false;
        if (activeFilter === 'pinned' && (!note.is_pinned || note.is_archived)) return false;
        if (activeFilter === 'archived' && !note.is_archived) return false;

        // Category filter
        if (categoryFilter !== 'all' && note.category !== categoryFilter) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title?.toLowerCase().includes(q);
          const matchContent = note.content?.toLowerCase().includes(q);
          const matchCategory = note.category?.toLowerCase().includes(q);
          const matchTags = note.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchCategory && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned always on top if viewing active or all
        if (activeFilter !== 'archived') {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
        }

        if (sortBy === 'created_desc') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'updated_desc') {
          return new Date(b.updated_at) - new Date(a.updated_at);
        }
        // Default: manual drag-and-drop order
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      });
  },

  getCategories: () => {
    const { notes } = get();
    const categories = new Set(['General']);
    notes.forEach((n) => {
      if (n.category) categories.add(n.category);
    });
    return Array.from(categories);
  },
}));
