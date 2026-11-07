/**
 * Export utilities for NoTo user data
 */

export function exportDataAsJSON(notes, todos, profile) {
  const payload = {
    exportedAt: new Date().toISOString(),
    system: 'NoTo — Note Your Todos Archive',
    profile: {
      username: profile?.username || 'Keeper',
      selectedTheme: profile?.selected_theme || 'default',
    },
    notes: notes.map((n) => ({
      title: n.title,
      content: n.content,
      category: n.category,
      tags: n.tags,
      isPinned: n.is_pinned,
      isArchived: n.is_archived,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    })),
    todos: todos.map((t) => ({
      title: t.title,
      description: t.description,
      dueDate: t.due_date,
      dueTime: t.due_time,
      priority: t.priority,
      category: t.category,
      isCompleted: t.is_completed,
      completedAt: t.completed_at,
      createdAt: t.created_at,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `noto-ledger-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportNotesAsCSV(notes) {
  const headers = ['Title', 'Category', 'Content', 'Pinned', 'Archived', 'Created At', 'Updated At'];
  const rows = notes.map((n) => [
    `"${(n.title || '').replace(/"/g, '""')}"`,
    `"${(n.category || '').replace(/"/g, '""')}"`,
    `"${(n.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    n.is_pinned ? 'Yes' : 'No',
    n.is_archived ? 'Yes' : 'No',
    n.created_at || '',
    n.updated_at || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `noto-notes-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTodosAsCSV(todos) {
  const headers = ['Title', 'Description', 'Due Date', 'Due Time', 'Priority', 'Category', 'Completed', 'Completed At'];
  const rows = todos.map((t) => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    t.due_date || '',
    t.due_time || '',
    t.priority || 'medium',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.is_completed ? 'Completed' : 'Pending',
    t.completed_at || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `noto-todos-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

