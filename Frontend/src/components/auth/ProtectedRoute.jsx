import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Feather } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--theme-bg, #F5F5F4)',
          color: 'var(--theme-text, #252525)',
          fontFamily: "'EB Garamond', Georgia, serif",
          gap: '16px',
        }}
      >
        <div style={{ animation: 'spin 2s linear infinite' }}>
          <Feather size={36} color="var(--theme-primary, #252525)" />
        </div>
        <p style={{ fontStyle: 'italic', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          Consulting ledger...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(20deg); }
            100% { transform: rotate(0deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

