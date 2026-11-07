import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Palette, Menu, X, StickyNote, CheckSquare } from 'lucide-react';
import GlobalSearch from './common/GlobalSearch';
import { useAuthStore } from '../stores/authStore';
import { getTheme } from '../lib/themes';
import noteLogo from '../assets/note-logo.png';

export default function Navbar({ isOpen, toggleSidebar, onNewNote, onNewTodo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const { profile } = useAuthStore();
  const currentTheme = getTheme(profile?.selected_theme || localStorage.getItem('noto_theme') || 'default');

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: isOpen ? '260px' : '72px',
        height: '70px',
        backgroundColor: 'var(--theme-header-bg)',
        borderBottom: '2px solid var(--theme-border-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box',
        zIndex: 900,
        transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
      }}
      className="noto-navbar"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--theme-text)',
          }}
          aria-label="Toggle navigation"
        >
          <Menu size={24} />
        </button>

        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src={noteLogo}
            alt="NoTo"
            style={{
              height: '34px',
              width: 'auto',
              borderRadius: '3px',
              border: '1.5px solid var(--theme-border-strong)',
              boxShadow: '1.5px 1.5px 0px var(--theme-border-strong)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '1px',
                lineHeight: 1,
                color: 'var(--theme-text)',
              }}
            >
              NoTo
            </span>
            <span
              className="brand-subtitle"
              style={{
                fontSize: '0.68rem',
                fontStyle: 'italic',
                color: 'var(--theme-text-muted)',
                letterSpacing: '0.3px',
              }}
            >
              Note Your Todos
            </span>
          </div>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div
        className="nav-search-container"
        style={{
          position: 'relative',
          flex: '1',
          maxWidth: '460px',
          margin: '0 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--theme-surface)',
            border: '2px solid var(--theme-border-strong)',
            boxShadow: searchFocused ? '3px 3px 0px var(--theme-border-strong)' : 'none',
            borderRadius: '3px',
            padding: '0 12px',
            height: '40px',
            transition: 'all 0.15s ease',
          }}
        >
          <Search size={17} style={{ color: 'var(--theme-text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search notes and todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '0 10px',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.95rem',
              color: 'var(--theme-text)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'var(--theme-text-muted)',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchTerm.trim().length > 0 && (
          <GlobalSearch
            query={searchTerm}
            onClose={() => setSearchTerm('')}
            onSelectNote={() => {
              setSearchTerm('');
              navigate('/notes');
            }}
            onSelectTodo={() => {
              setSearchTerm('');
              navigate('/todos');
            }}
          />
        )}
      </div>

      {/* Right Actions & Active Theme Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => {
            if (onNewNote) onNewNote();
            else navigate('/notes');
          }}
          className="vintage-btn"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          title="Compose New Sticky Note"
        >
          <StickyNote size={15} />
          <span className="btn-label-text">+ Note</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNewTodo) onNewTodo();
            else navigate('/todos');
          }}
          className="vintage-btn vintage-btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          title="Create New Task"
        >
          <CheckSquare size={15} />
          <span className="btn-label-text">+ Task</span>
        </button>

        {/* Active Theme Indicator Button */}
        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            padding: '7px 12px',
            borderRadius: '3px',
            border: '2px solid var(--theme-border-strong)',
            backgroundColor: 'var(--theme-surface)',
            color: 'var(--theme-text)',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            boxShadow: '1.5px 1.5px 0px var(--theme-border-strong)',
          }}
          title={`Active Theme: ${currentTheme.name} (Click to change)`}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: currentTheme.primaryLight,
              border: `1.5px solid ${currentTheme.deepColor}`,
              flexShrink: 0,
            }}
          />
          <span className="theme-name-text">{currentTheme.name}</span>
          <Palette size={14} style={{ color: 'var(--theme-text-muted)' }} />
        </Link>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .noto-navbar {
            left: 0 !important;
            padding: 0 16px !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .btn-label-text {
            display: none;
          }
          .theme-name-text {
            display: none;
          }
        }
        @media (max-width: 520px) {
          .noto-navbar {
            padding: 0 10px !important;
          }
          .brand-subtitle {
            display: none !important;
          }
          .nav-search-container {
            margin: 0 6px !important;
          }
        }
      `}</style>
    </header>
  );
}
