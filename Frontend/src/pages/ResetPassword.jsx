import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { updatePassword } = useAuthStore();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Passcode must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passcodes do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMsg(error.message || 'Failed to update passcode.');
      } else {
        toast.success('Passcode securely revised!');
        navigate('/dashboard');
      }
    } catch {
      setErrorMsg('An error occurred during passcode reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--theme-bg, #F5F5F4)',
        padding: '20px',
      }}
    >
      <div
        className="vintage-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '40px 32px',
          borderColor: 'var(--theme-border-strong, #252525)',
          boxShadow: '6px 6px 0px var(--theme-border-strong, #252525)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-highlight, #E5E5E4)',
              color: 'var(--theme-primary, #252525)',
              marginBottom: '12px',
            }}
          >
            <KeyRound size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', margin: 0, textTransform: 'uppercase' }}>
            New Passcode
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              color: 'var(--theme-text-muted, #777777)',
              fontSize: '0.95rem',
              fontStyle: 'italic',
            }}
          >
            Enter your revised secret credentials below.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #B91C1C',
              color: '#991B1B',
              borderRadius: '3px',
              fontSize: '0.9rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--theme-text-muted, #777777)',
                marginBottom: '6px',
              }}
            >
              New Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="vintage-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--theme-text-muted, #777777)',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--theme-text-muted, #777777)',
                marginBottom: '6px',
              }}
            >
              Confirm New Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="vintage-input"
                placeholder="Re-enter passcode"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--theme-text-muted, #777777)',
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="vintage-btn"
            disabled={submitting}
            style={{ width: '100%', marginTop: '10px' }}
          >
            <ShieldCheck size={18} />
            {submitting ? 'Updating Passcode...' : 'Save New Passcode'}
          </button>
        </form>
      </div>
    </div>
  );
}

