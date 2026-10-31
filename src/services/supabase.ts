import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PinnedRunState } from '../components/SimulationComparison';

// Initialize Supabase - reads from env vars (Vite exposes VITE_ prefixed vars)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  envUrl &&
  envAnonKey &&
  !envUrl.includes('your-project') &&
  !envAnonKey.includes('your_supabase_anon_key_here')
);

const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? envAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Supabase User type with convenience properties for UI components
export type SupabaseUser = User & {
  displayName?: string | null;
  photoURL?: string | null;
};

// Helper to enrich Supabase User with standard UI fields from metadata
export const enrichUser = (user: User | null): SupabaseUser | null => {
  if (!user) return null;
  const enriched = user as SupabaseUser;
  enriched.displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Authorized Researcher';
  enriched.photoURL =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;
  return enriched;
};

// Authentication helpers
export const ensureAuthenticated = async (): Promise<SupabaseUser | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return enrichUser(user);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return enrichUser(data.user);
  } catch (err) {
    console.warn('Anonymous sign-in skipped (offline mode or rules fallback):', err);
    return null;
  }
};

// Google Auth helpers
export const signInWithGoogle = async (): Promise<SupabaseUser | null> => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase credentials not configured in environment.');
    return null;
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    // OAuth redirects; after redirect, the session is available
    const { data: { user } } = await supabase.auth.getUser();
    return enrichUser(user);
  } catch (err) {
    console.warn('Google sign-in prevented or canceled, falling back to authenticated credentials:', err);
    const { data: { user } } = await supabase.auth.getUser();
    return enrichUser(user);
  }
};

export const logOut = async (): Promise<void> => {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign-out error:', err);
  }
};

// Persist Pinned Run to Supabase
export const savePinnedRunToSupabase = async (pinnedRun: PinnedRunState) => {
  if (!isSupabaseConfigured) {
    return;
  }
  try {
    await ensureAuthenticated();
    const { error } = await supabase
      .from('pinned_runs')
      .upsert({
        id: pinnedRun.id,
        name: pinnedRun.name,
        timestamp: pinnedRun.timestamp,
        config: pinnedRun.config,
        actual_test_mae: pinnedRun.actualTestMAE,
        actual_test_rmse: pinnedRun.actualTestRMSE,
        saved_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase write fallback (local storage remains active):', error);
  }
};

// Fetch historical pinned benchmarks from Supabase
export const fetchPinnedRunsFromSupabase = async (): Promise<Partial<PinnedRunState>[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }
  try {
    await ensureAuthenticated();
    const { data, error } = await supabase
      .from('pinned_runs')
      .select('*')
      .order('saved_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      timestamp: row.timestamp,
      config: row.config,
      actualTestMAE: row.actual_test_mae,
      actualTestRMSE: row.actual_test_rmse,
    }));
  } catch (error) {
    console.warn('Supabase read fallback:', error);
    return [];
  }
};

// Auth state listener helper (mirrors Firebase onAuthStateChanged pattern)
export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  if (!isSupabaseConfigured) {
    callback(null);
    return () => {};
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(enrichUser(session?.user ?? null));
  });
  return () => subscription.unsubscribe();
};
