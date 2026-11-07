import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../stores/authStore';
import { UserPlus, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters.')
      .max(30, 'Username cannot exceed 30 characters.'),
    email: z.string().email('Please enter a valid correspondence email.'),
    password: z.string().min(6, 'Passcode must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your passcode.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passcodes do not match.',
    path: ['confirmPassword'],
  });

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const { signUp, user, loading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user && !registeredSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, registeredSuccess]);

  const onSubmit = async (formData) => {
    setAuthError('');
    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (error) {
        setAuthError(error.message || 'Unable to register new ledger.');
      } else {
        setRegisteredSuccess(true);
        toast.success('Ledger record inscribed successfully!');
      }
    } catch {
      setAuthError('An error occurred during account creation.');
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
      <div
        className="vintage-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '40px 32px',
          borderColor: 'var(--theme-border-strong, #252525)',
          boxShadow: '6px 6px 0px var(--theme-border-strong, #252525)',
          boxSizing: 'border-box',
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
              marginBottom: '14px',
            }}
          >
            <UserPlus size={32} />
          </div>
          <h1
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--theme-text-muted, #777777)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
            }}
          >
            Claim your personal NoTo stationery archive
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

        {registeredSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2
              size={48}
              color="var(--theme-primary, #252525)"
              style={{ margin: '0 auto 16px auto' }}
            />
            <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Registration Inscribed</h2>
            <p
              style={{
                color: 'var(--theme-text-muted, #777777)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              Your ledger has been initiated. If your Supabase configuration requires email
              confirmation, please inspect your correspondence inbox to confirm your address before
              logging in.
            </p>
            <button
              type="button"
              className="vintage-btn"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                Pen Name / Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
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
                  type="text"
                  {...register('username')}
                  className="vintage-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Arthur Pendelton"
                />
              </div>
              {errors.username && (
                <p style={{ color: '#B91C1C', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                  {errors.username.message}
                </p>
              )}
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
                Secret Passcode
              </label>
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
                  placeholder="Min 6 characters"
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
                Confirm Passcode
              </label>
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
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="vintage-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Re-enter passcode"
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
              {errors.confirmPassword && (
                <p style={{ color: '#B91C1C', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="vintage-btn"
              disabled={isSubmitting || loading}
              style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            >
              <UserPlus size={18} />
              {isSubmitting ? 'Inscribing Record...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="vintage-divider-dashed" />

        <p
          style={{
            textAlign: 'center',
            margin: 0,
            fontSize: '0.95rem',
            color: 'var(--theme-text-muted, #777777)',
          }}
        >
          Already hold a ledger?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--theme-primary, #252525)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
