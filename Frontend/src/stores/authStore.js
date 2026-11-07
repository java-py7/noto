import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { applyTheme, DEFAULT_THEME_ID } from '../lib/themes';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isConfigured: isSupabaseConfigured,

  initialize: async () => {
    // 1. Initial theme load from localStorage
    const savedTheme = localStorage.getItem('noto_theme') || DEFAULT_THEME_ID;
    applyTheme(savedTheme);

    if (!isSupabaseConfigured) {
      // Offline / Local development session fallback
      const savedUser = localStorage.getItem('noto_local_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          set({
            user: parsed,
            profile: {
              username: parsed.username || 'Notebook Keeper',
              avatar_url: parsed.avatar_url || '',
              selected_theme: savedTheme,
              notification_preferences: {
                email_notifications: true,
                task_reminders: true,
                weekly_summary: false,
              },
            },
            loading: false,
          });
          return;
        } catch {
          // ignore error
        }
      }
      set({ user: null, profile: null, loading: false });
      return;
    }

    try {
      // 2. Fetch live Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, session: null, profile: null });
      }

      // 3. Subscribe to auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user, session });
          await get().fetchProfile(session.user.id);
        } else {
          set({ user: null, session: null, profile: null });
        }
      });
    } catch (err) {
      console.error('Supabase auth initialization error:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        set({ profile: data });
        if (data.selected_theme) {
          applyTheme(data.selected_theme);
        }
      } else {
        // Create initial profile if trigger did not execute
        const user = get().user;
        const initialUsername = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
        const initialTheme = localStorage.getItem('noto_theme') || DEFAULT_THEME_ID;

        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: initialUsername,
            selected_theme: initialTheme,
          })
          .select()
          .single();

        if (newProfile) {
          set({ profile: newProfile });
        }
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  },

  signIn: async ({ email, password }) => {
    set({ loading: true });

    if (!isSupabaseConfigured) {
      // Simulated local authentication when env credentials are not yet entered
      const mockUser = {
        id: 'local-dev-user-01',
        email,
        username: email.split('@')[0] || 'Vintage Penman',
        avatar_url: '',
      };
      localStorage.setItem('noto_local_user', JSON.stringify(mockUser));
      const currentTheme = localStorage.getItem('noto_theme') || DEFAULT_THEME_ID;
      set({
        user: mockUser,
        profile: {
          username: mockUser.username,
          avatar_url: '',
          selected_theme: currentTheme,
          notification_preferences: {
            email_notifications: true,
            task_reminders: true,
            weekly_summary: false,
          },
        },
        loading: false,
      });
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        set({ user: data.user, session: data.session });
        await get().fetchProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async ({ email, password, username }) => {
    set({ loading: true });

    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'local-dev-user-01',
        email,
        username: username || email.split('@')[0],
        avatar_url: '',
      };
      localStorage.setItem('noto_local_user', JSON.stringify(mockUser));
      set({
        user: mockUser,
        profile: {
          username: mockUser.username,
          avatar_url: '',
          selected_theme: localStorage.getItem('noto_theme') || DEFAULT_THEME_ID,
          notification_preferences: {
            email_notifications: true,
            task_reminders: true,
            weekly_summary: false,
          },
        },
        loading: false,
      });
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('noto_local_user');
      set({ user: null, session: null, profile: null });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      return { error: null, message: 'Password reset simulation successful.' };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  updatePassword: async (newPassword) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) return { error: 'No authenticated user' };

    const newProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    set({ profile: newProfile });

    if (updates.selected_theme) {
      applyTheme(updates.selected_theme);
    }

    if (!isSupabaseConfigured) {
      const localUser = JSON.parse(localStorage.getItem('noto_local_user') || '{}');
      if (updates.username) localUser.username = updates.username;
      if (updates.avatar_url) localUser.avatar_url = updates.avatar_url;
      localStorage.setItem('noto_local_user', JSON.stringify(localUser));
      return { data: newProfile, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      set({ profile: data });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  },
}));

