import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/theme.css'
import './App.css'

createRoot(document.getElementById('root')).render(
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--theme-surface, #FFFFFF)',
          color: 'var(--theme-text, #252525)',
          border: '1.5px solid var(--theme-border-strong, #252525)',
          borderRadius: '4px',
          boxShadow: '3px 3px 0px var(--theme-btn-shadow, #252525)',
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: '0.95rem',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: 'var(--theme-primary, #252525)',
            secondary: 'var(--theme-surface, #FFFFFF)',
          },
        },
        error: {
          iconTheme: {
            primary: '#B91C1C',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
    <App />
  </>
);
