import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  StickyNote,
  CheckSquare,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Feather,
} from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Your ledger has been sealed.');
    setLogoutOpen(false);
    navigate('/login');
  };

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Penman';
  const email = user?.email || 'archive@noto.internal';

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Sticky Notes', to: '/notes', icon: StickyNote },
    { label: 'Tasks & Todos', to: '/todos', icon: CheckSquare },
    { label: 'User Profile', to: '/profile', icon: User },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={toggleSidebar}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isOpen ? '260px' : '72px',
          backgroundColor: 'var(--theme-sidebar-bg)',
          color: 'var(--theme-sidebar-text)',
          borderRight: '2px solid var(--theme-border-strong)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          zIndex: 1000,
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s ease',
          boxShadow: '4px 0px 14px rgba(0, 0, 0, 0.15)',
        }}
        className={`noto-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
      >
        {/* Sidebar Header & Toggle */}
        <div
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            padding: isOpen ? '0 18px' : '0',
            borderBottom: '1px dashed var(--theme-sidebar-text)',
            boxSizing: 'border-box',
          }}
        >
          {isOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Feather size={20} color="var(--theme-sidebar-text)" />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--theme-sidebar-text)',
                }}
              >
                NoTo Cabinet
              </span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleSidebar}
            style={{
              background: 'transparent',
              border: '1.5px solid var(--theme-sidebar-text)',
              boxShadow: '1.5px 1.5px 0px var(--theme-sidebar-text)',
              borderRadius: '3px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--theme-sidebar-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Profile Badge Area */}
        <div
          style={{
            padding: isOpen ? '16px 14px' : '16px 8px',
            borderBottom: '1px dashed var(--theme-sidebar-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: isOpen ? 'flex-start' : 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              border: '1.5px solid var(--theme-sidebar-text)',
              backgroundColor: 'var(--theme-sidebar-text)',
              color: 'var(--theme-sidebar-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.15rem',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>

          {isOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-serif)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: 'var(--theme-sidebar-text)',
                }}
              >
                {username}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--theme-sidebar-text)',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {email}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: isOpen ? '16px 12px' : '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 900 && isOpen) {
                    toggleSidebar();
                  }
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isOpen ? '11px 14px' : '11px 0',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  textDecoration: 'none',
                  color: 'var(--theme-sidebar-text)',
                  backgroundColor: isActive
                    ? 'var(--theme-sidebar-active)'
                    : 'transparent',
                  border: isActive
                    ? '1.5px solid var(--theme-sidebar-text)'
                    : '1.5px solid transparent',
                  boxShadow: isActive ? '2px 2px 0px rgba(0,0,0,0.2)' : 'none',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.98rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.3px',
                  transition: 'all 0.15s ease',
                  opacity: isActive ? 1 : 0.85,
                })}
                title={!isOpen ? item.label : undefined}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions: Logout */}
        <div
          style={{
            padding: isOpen ? '16px 12px' : '16px 8px',
            borderTop: '1px dashed var(--theme-sidebar-text)',
          }}
        >
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isOpen ? '10px 14px' : '10px 0',
              justifyContent: isOpen ? 'flex-start' : 'center',
              background: 'transparent',
              border: '1.5px solid var(--theme-sidebar-text)',
              borderRadius: '3px',
              cursor: 'pointer',
              color: 'var(--theme-sidebar-text)',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.92rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              opacity: 0.9,
            }}
            title={!isOpen ? 'Close Ledger' : undefined}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {isOpen && <span>Close Ledger</span>}
          </button>
        </div>
      </aside>

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={handleLogout}
      />

      <style>{`
        @media (max-width: 900px) {
          .sidebar-mobile-backdrop {
            display: block !important;
          }
          .noto-sidebar {
            transform: translateX(-100%);
            width: 260px !important;
          }
          .noto-sidebar.sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
