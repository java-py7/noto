import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../stores/authStore';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import { LogIn, Eye, EyeOff, Lock, Mail, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid correspondence email.'),
  password: z.string().min(1, 'Please enter your account password.'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  const { signIn, user, loading, isConfigured } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (formData) => {
    setAuthError('');
    try {
      const { data, error } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setAuthError(error.message || 'Invalid email or passcode.');
      } else if (data?.user) {
        toast.success('Welcome back to your ledger!');
        navigate('/dashboard');
      }
    } catch {
      setAuthError('Authentication dispatch failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--theme-bg, #F5F5F4)',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {!isConfigured && (
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: 'var(--theme-surface, #FFFFFF)',
            border: '1px dashed var(--theme-border-strong, #252525)',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            borderRadius: '4px',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.05)',
            color: 'var(--theme-text-muted, #777777)',
          }}
        >
          <strong style={{ color: 'var(--theme-text, #252525)' }}>Archive Notice:</strong> Connect
          your Supabase project credentials in <code>.env</code> for live cloud database sync. Local
          archive mode is enabled.
        </div>
      )}

      <div
        className="vintage-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '40px 32px',
          borderColor: 'var(--theme-border-strong, #252525)',
          boxShadow: '6px 6px 0px var(--theme-border-strong, #252525)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-highlight, #E5E5E4)',
              color: 'var(--theme-primary, #252525)',
              marginBottom: '14px',
            }}
          >
            <BookOpen size={32} />
          </div>
          <h1
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--theme-text-muted, #777777)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
            }}
          >
            Open your personal stationery ledger & todo archive
          </p>
        </div>

        {authError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #B91C1C',
              color: '#991B1B',
              borderRadius: '3px',
              fontSize: '0.9rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              Correspondence Email
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
                {...register('email')}
                className="vintage-input"
                style={{ paddingLeft: '40px' }}
                placeholder="penman@noto.archive"
              />
            </div>
            {errors.email && (
              <p style={{ color: '#B91C1C', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-text-muted, #777777)',
                }}
              >
                Passcode
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--theme-primary, #252525)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                Forgot passcode?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
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
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="vintage-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="Enter secret passcode"
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
            {errors.password && (
              <p style={{ color: '#B91C1C', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="vintage-btn"
            disabled={isSubmitting || loading}
            style={{ width: '100%', padding: '14px', marginTop: '6px' }}
          >
            <LogIn size={18} />
            {isSubmitting ? 'Consulting Ledger...' : 'Access Ledger'}
          </button>
        </form>

        <div className="vintage-divider-dashed" />

        <p
          style={{
            textAlign: 'center',
            margin: 0,
            fontSize: '0.95rem',
            color: 'var(--theme-text-muted, #777777)',
          }}
        >
          New to the archive?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--theme-primary, #252525)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Create an Account
          </Link>
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />
    </div>
  );
}
