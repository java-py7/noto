import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
import { useAuthStore } from '../stores/authStore';
import { useNotesStore } from '../stores/notesStore';
import { useTodosStore } from '../stores/todosStore';

export default function Layout({ children, onNewNote, onNewTodo }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      return false;
    }
    const saved = localStorage.getItem('noto_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { user } = useAuthStore();
  const { fetchNotes } = useNotesStore();
  const { fetchTodos } = useTodosStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotes(user.id);
      fetchTodos(user.id);
    }
  }, [user?.id, fetchNotes, fetchTodos]);

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('noto_sidebar_open', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg, #F5F5F4)',
        color: 'var(--theme-text, #252525)',
      }}
    >
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '100vh',
          paddingLeft: isOpen ? '260px' : '72px',
          transition: 'padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          width: '100%',
        }}
        className="layout-main"
      >
        <Navbar
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          onNewNote={onNewNote}
          onNewTodo={onNewTodo}
        />

        <main
          style={{
            flex: 1,
            paddingTop: '90px',
            paddingBottom: '40px',
            paddingLeft: '28px',
            paddingRight: '28px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
          className="layout-main-content"
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .layout-main {
            padding-left: 0 !important;
          }
          .layout-main-content {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: 82px !important;
          }
        }
      `}</style>
    </div>
  );
}
