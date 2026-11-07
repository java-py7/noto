import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Mail, KeyRound, X, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Unable to send recovery email.');
      } else {
        setSubmitted(true);
        toast.success('Recovery dispatch transmitted!');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        className="vintage-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '30px',
          backgroundColor: 'var(--theme-surface, #FFFFFF)',
          borderColor: 'var(--theme-border-strong, #252525)',
          boxShadow: '6px 6px 0px var(--theme-border-strong, #252525)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--theme-text-muted, #777777)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            <KeyRound size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase' }}>
            Recover Access
          </h2>
          <p
            style={{
              margin: '8px 0 0 0',
              color: 'var(--theme-text-muted, #777777)',
              fontSize: '0.95rem',
              fontStyle: 'italic',
            }}
          >
            Enter your registered correspondence email to receive a password reset dispatch.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2
              size={42}
              color="var(--theme-primary, #252525)"
              style={{ margin: '0 auto 12px auto' }}
            />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem' }}>Dispatch Sent</h3>
            <p
              style={{
                color: 'var(--theme-text-muted, #777777)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
              }}
            >
              If an account is associated with <strong>{email}</strong>, a recovery seal has been
              sent with instructions to choose a new secret passcode.
            </p>
            <button
              type="button"
              className="vintage-btn"
              onClick={handleClose}
              style={{ marginTop: '20px', width: '100%' }}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

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
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--theme-text-muted, #777777)',
                  }}
                />
                <input
                  type="email"
                  className="vintage-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="penman@noto.archive"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="vintage-btn vintage-btn-secondary"
                onClick={handleClose}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="vintage-btn"
                disabled={submitting}
                style={{ flex: 1.5 }}
              >
                {submitting ? 'Transmitting...' : 'Send Recovery'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

