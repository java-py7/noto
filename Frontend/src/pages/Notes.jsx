import { useState, useMemo } from 'react';
import Layout from '../components/layout';
import NoteModal from '../components/notes/NoteModal';
import DeleteNoteDialog from '../components/notes/DeleteNoteDialog';
import SortableNoteCard from '../components/notes/SortableNoteCard';
import { useNotesStore } from '../stores/notesStore';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Search,
  ArrowUpDown,
  BookOpen,
  Folder,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notes() {
  const {
    notes,
    togglePin,
    toggleArchive,
    deleteNote,
    reorderNotes,
    getCategories,
  } = useNotesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Filters & Sorting Controls
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'pinned', 'archived'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('manual'); // 'manual', 'updated_desc', 'created_desc', 'title_asc'

  const categories = getCategories();

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

  // Filtered & Sorted notes
  const displayedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (statusFilter === 'active' && note.is_archived) return false;
        if (statusFilter === 'pinned' && (!note.is_pinned || note.is_archived)) return false;
        if (statusFilter === 'archived' && !note.is_archived) return false;

        if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;

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
        if (statusFilter !== 'archived') {
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
  }, [notes, statusFilter, selectedCategory, searchQuery, sortBy]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayedNotes.findIndex((n) => n.id === active.id);
    const newIndex = displayedNotes.findIndex((n) => n.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(displayedNotes, oldIndex, newIndex);
      await reorderNotes(reordered);
      toast.success('Manuscript sequence reorganized!');
    }
  };

  const handleOpenAdd = () => {
    setSelectedNote(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handlePromptDelete = (note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    await deleteNote(noteToDelete.id);
    toast.success('Manuscript discarded from archive.');
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
    if (modalOpen) setModalOpen(false);
  };

  const handleTogglePin = async (id) => {
    await togglePin(id);
    toast.success('Pin position adjusted.');
  };

  const handleToggleArchive = async (id) => {
    await toggleArchive(id);
    toast.success('Archive classification updated.');
  };

  return (
    <Layout onNewNote={handleOpenAdd}>
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
              Cabinet Archive
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--theme-text-muted)',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              Drag pins to resequence manuscripts across your archive ledger
            </p>
          </div>

          <button
            type="button"
            className="vintage-btn"
            onClick={handleOpenAdd}
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
          >
            <Plus size={18} /> New Sticky Note
          </button>
        </div>

        {/* Filter & Search Toolbar */}
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
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'active', label: 'Active Notes' },
              { id: 'pinned', label: 'Pinned' },
              { id: 'archived', label: 'Archived' },
              { id: 'all', label: 'All Records' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.88rem',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  border: '1.5px solid var(--theme-border-strong)',
                  backgroundColor: statusFilter === tab.id
                    ? 'var(--theme-border-strong)'
                    : 'var(--theme-surface)',
                  color: statusFilter === tab.id
                    ? 'var(--theme-btn-text)'
                    : 'var(--theme-text)',
                  boxShadow: statusFilter === tab.id ? '2px 2px 0px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="notes-toolbar-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div
              className="notes-search-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid var(--theme-border-strong)',
                borderRadius: '3px',
                padding: '4px 10px',
                backgroundColor: 'var(--theme-surface)',
                width: '180px',
              }}
            >
              <Search size={15} style={{ color: 'var(--theme-text-muted)' }} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  paddingLeft: '8px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.88rem',
                  width: '100%',
                  color: 'var(--theme-text)',
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="notes-select-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={15} color="var(--theme-text-muted)" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
            </div>

            {/* Sort Select */}
            <div className="notes-select-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={15} color="var(--theme-text-muted)" />
              <select
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
                <option value="updated_desc">Recently Modified</option>
                <option value="created_desc">Newly Penned</option>
                <option value="title_asc">Title (A &rarr; Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drag and Drop Grid */}
        {displayedNotes.length === 0 ? (
          <div
            className="vintage-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            <BookOpen
              size={48}
              style={{
                margin: '0 auto 16px auto',
                color: 'var(--theme-text-muted)',
              }}
            />
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              No Manuscripts In This Drawer
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
                ? `No parchment notes correspond to your search query "${searchQuery}".`
                : statusFilter === 'archived'
                ? 'Your archive drawer holds no archived notes.'
                : statusFilter === 'pinned'
                ? 'No notes are currently pinned to the head of your board.'
                : 'Your cabinet ledger is completely empty. Pin your first note now.'}
            </p>
            <button type="button" className="vintage-btn" onClick={handleOpenAdd}>
              <Plus size={16} /> Compose New Note
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayedNotes.map((n) => n.id)}
              strategy={rectSortingStrategy}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px',
                }}
                className="noto-notes-grid"
              >
                {displayedNotes.map((note) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onTogglePin={handleTogglePin}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handlePromptDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Editor Modal */}
      <NoteModal
        isOpen={modalOpen}
        note={selectedNote}
        onClose={() => {
          setModalOpen(false);
          setSelectedNote(null);
        }}
        onDelete={(id) => {
          const noteObj = notes.find((n) => n.id === id);
          if (noteObj) handlePromptDelete(noteObj);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNoteDialog
        isOpen={deleteDialogOpen}
        noteTitle={noteToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setNoteToDelete(null);
        }}
      />

      <style>{`
        @media (max-width: 640px) {
          .noto-notes-grid {
            grid-template-columns: 1fr !important;
          }
          .notes-toolbar-controls {
            width: 100% !important;
          }
          .notes-search-box {
            width: 100% !important;
          }
          .notes-select-group {
            flex: 1 1 calc(50% - 6px) !important;
          }
          .notes-select-group select {
            width: 100% !important;
          }
        }
      `}</style>
    </Layout>
  );
}
