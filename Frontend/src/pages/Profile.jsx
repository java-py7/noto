import { useState } from 'react';
import Layout from '../components/layout';
import { useAuthStore } from '../stores/authStore';
import { useNotesStore } from '../stores/notesStore';
import { useTodosStore } from '../stores/todosStore';
import {
  Mail,
  Calendar,
  CheckCircle2,
  StickyNote,
  CheckSquare,
  Check,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_SEALS = [
  { id: 'quill', label: 'Classic Quill', emoji: '🪶' },
  { id: 'seal', label: 'Wax Seal', emoji: '📜' },
  { id: 'fountain', label: 'Fountain Pen', emoji: '✒️' },
  { id: 'typewriter', label: 'Typewriter', emoji: '⌨️' },
  { id: 'book', label: 'Archival Ledger', emoji: '📖' },
  { id: 'hourglass', label: 'Hourglass', emoji: '⏳' },
];

export default function Profile() {
  const { user, profile, updateProfile } = useAuthStore();
  const { notes } = useNotesStore();
  const { getStats } = useTodosStore();

  const [usernameInput, setUsernameInput] = useState(
    profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || ''
  );
  const [selectedSeal, setSelectedSeal] = useState(profile?.avatar_url || '🪶');
  const [saving, setSaving] = useState(false);

  const stats = getStats();
  const totalNotes = notes.length;
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Archived Ledger Founding';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        username: usernameInput.trim(),
        avatar_url: selectedSeal,
      });

      if (error) {
        toast.error(error.message || 'Failed to update ledger records.');
      } else {
        toast.success('Keeper profile credentials revised!');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header Bar */}
        <div
          style={{
            borderBottom: '2px dashed var(--theme-border-strong)',
            paddingBottom: '20px',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              margin: '0 0 6px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--theme-text)',
            }}
          >
            Keeper Credentials
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--theme-text-muted)',
              fontStyle: 'italic',
              fontSize: '1rem',
            }}
          >
            Review personal correspondence credentials, archival statistics & account ledger history
          </p>
        </div>

        {/* Identity Overview Card */}
        <div
          className="vintage-card"
          style={{
            padding: 'clamp(20px, 4vw, 32px)',
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border-strong)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar Seal Display */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '6px',
              border: '2px solid var(--theme-border-strong)',
              backgroundColor: 'var(--theme-surface)',
              color: 'var(--theme-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.6rem',
              boxShadow: '4px 4px 0px var(--theme-border-strong)',
              flexShrink: 0,
            }}
          >
            {selectedSeal || '🪶'}
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--theme-text)' }}>
                {profile?.username || usernameInput}
              </h2>
              <span
                className="vintage-badge"
                style={{
                  backgroundColor: 'var(--theme-border-strong)',
                  color: 'var(--theme-btn-text)',
                  borderColor: 'var(--theme-border-strong)',
                }}
              >
                Archivist
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
                fontSize: '0.92rem',
                color: 'var(--theme-text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} />
                <span>{user?.email || 'archive@noto.internal'}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--theme-text)',
                  }}
                >
                  (Verified)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} />
                <span>Member since {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Statistics Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="vintage-card" style={{ padding: '20px', backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
                Cabinet Notes
              </span>
              <StickyNote size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {totalNotes}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>
              Inscribed manuscripts
            </p>
          </div>

          <div className="vintage-card" style={{ padding: '20px', backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
                Total Duties
              </span>
              <CheckSquare size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.total}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>
              Recorded assignments
            </p>
          </div>

          <div className="vintage-card" style={{ padding: '20px', backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
                Discharged Duties
              </span>
              <CheckCircle2 size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {stats.completed}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>
              Completed tasks
            </p>
          </div>

          <div className="vintage-card" style={{ padding: '20px', backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
                Fulfillment Rate
              </span>
              <Award size={18} color="var(--theme-text)" />
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                marginTop: '8px',
                color: 'var(--theme-text)',
              }}
            >
              {completionRate}%
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>
              Overall ledger quotient
            </p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="vintage-card" style={{ padding: 'clamp(20px, 4vw, 32px)', backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border-strong)' }}>
          <div
            style={{
              borderBottom: '1.5px dashed var(--theme-border-strong)',
              paddingBottom: '14px',
              marginBottom: '24px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.3rem', textTransform: 'uppercase', color: 'var(--theme-text)' }}>
              Revise Archival Credentials
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                color: 'var(--theme-text-muted)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}
            >
              Update your publicly visible pen name and stationery seal
            </p>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-text-muted)',
                  marginBottom: '8px',
                }}
              >
                Pen Name / Username
              </label>
              <input
                type="text"
                className="vintage-input"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter pen name"
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-text-muted)',
                  marginBottom: '8px',
                }}
              >
                Select Personal Stationery Seal
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {AVATAR_SEALS.map((seal) => (
                  <button
                    key={seal.id}
                    type="button"
                    onClick={() => setSelectedSeal(seal.emoji)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border:
                        selectedSeal === seal.emoji
                          ? '2px solid var(--theme-border-strong)'
                          : '1px solid var(--theme-border)',
                      backgroundColor:
                        selectedSeal === seal.emoji
                          ? 'var(--theme-highlight)'
                          : 'var(--theme-surface)',
                      cursor: 'pointer',
                      boxShadow:
                        selectedSeal === seal.emoji
                          ? '2px 2px 0px var(--theme-border-strong)'
                          : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{seal.emoji}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      {seal.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                className="vintage-btn"
                disabled={saving}
                style={{ padding: '12px 24px' }}
              >
                <Check size={16} />
                {saving ? 'Sealing Records...' : 'Save Credentials'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
