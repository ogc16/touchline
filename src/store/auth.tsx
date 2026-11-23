import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  promptOpen: boolean;
  promptTitle: string;
  openAuthPrompt: (title?: string) => void;
  closeAuthPrompt: () => void;
  requireAuth: (title?: string) => boolean;
}

interface StoredCredential {
  name: string;
  digest: string;
}

interface StoredAuth {
  user: AuthUser | null;
  credentials: Record<string, StoredCredential>;
}

const STORAGE_KEY = 'touchline.auth.v1';
export const DEMO_EMAIL = 'demo@touchline.app';
export const DEMO_PASSWORD = 'demo1234';

const DEMO_USER: AuthUser = {
  id: 'demo-user',
  name: 'Demo Bettor',
  email: DEMO_EMAIL,
};

export const DEMO_USERS: AuthUser[] = [
  DEMO_USER,
  { id: 'demo-user-alex', name: 'Alex Kim', email: 'alex@touchline.app' },
  { id: 'demo-user-maya', name: 'Maya Silva', email: 'maya@touchline.app' },
  { id: 'demo-user-jonah', name: 'Jonah Okafor', email: 'jonah@touchline.app' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function digestPassword(email: string, password: string): string {
  const source = `touchline:${email.toLowerCase()}:${password}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function defaultStore(): StoredAuth {
  const credentials: Record<string, StoredCredential> = {};
  DEMO_USERS.forEach((demoUser) => {
    credentials[demoUser.email] = {
      name: demoUser.name,
      digest: digestPassword(demoUser.email, DEMO_PASSWORD),
    };
  });
  return { user: null, credentials };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return initials || 'TB';
}

async function persist(next: StoredAuth): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

async function loadStored(): Promise<StoredAuth> {
  const fallback = defaultStore();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    return {
      user: parsed.user ?? null,
      credentials: { ...fallback.credentials, ...(parsed.credentials ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [store, setStore] = useState<StoredAuth>(defaultStore);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState('Sign in to continue');

  const users = useMemo(() => {
    const byEmail = new Map(DEMO_USERS.map((demoUser) => [demoUser.email, demoUser]));
    Object.entries(store.credentials).forEach(([email, credential]) => {
      byEmail.set(email, {
        id: `local-${email}`,
        name: credential.name,
        email,
      });
    });
    return Array.from(byEmail.values());
  }, [store.credentials]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        const stored = await loadStored();
        if (!active) {
          return;
        }
        setStore(stored);
        setUser(stored.user);
        setStatus(stored.user ? 'authenticated' : 'guest');
      })();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();
      if (!isValidEmail(normalized)) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }
      const record = store.credentials[normalized];
      if (!record || record.digest !== digestPassword(normalized, password)) {
        return { ok: false, error: 'Email or password is incorrect.' };
      }
      const nextUser: AuthUser = {
        id: `local-${normalized}`,
        name: record.name,
        email: normalized,
      };
      const next = { ...store, user: nextUser };
      setStore(next);
      setUser(nextUser);
      setStatus('authenticated');
      await persist(next);
      return { ok: true };
    },
    [store],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const trimmedName = name.trim();
      const normalized = email.trim().toLowerCase();
      if (trimmedName.length < 2) {
        return { ok: false, error: 'Enter your name.' };
      }
      if (!isValidEmail(normalized)) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }
      if (store.credentials[normalized]) {
        return { ok: false, error: 'An account with that email already exists.' };
      }
      const nextUser: AuthUser = {
        id: `local-${normalized}`,
        name: trimmedName,
        email: normalized,
      };
      const next: StoredAuth = {
        user: nextUser,
        credentials: {
          ...store.credentials,
          [normalized]: {
            name: trimmedName,
            digest: digestPassword(normalized, password),
          },
        },
      };
      setStore(next);
      setUser(nextUser);
      setStatus('authenticated');
      await persist(next);
      return { ok: true };
    },
    [store],
  );

  const signOut = useCallback(async () => {
    const next = { ...store, user: null };
    setStore(next);
    setUser(null);
    setStatus('guest');
    await persist(next);
  }, [store]);

  const continueAsGuest = useCallback(async () => {
    setPromptOpen(false);
    if (status === 'authenticated') {
      await signOut();
    }
  }, [signOut, status]);

  const openAuthPrompt = useCallback((title?: string) => {
    setPromptTitle(title ?? 'Sign in to continue');
    setPromptOpen(true);
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setPromptOpen(false);
  }, []);

  const requireAuth = useCallback(
    (title?: string): boolean => {
      if (status === 'authenticated') {
        return true;
      }
      openAuthPrompt(title);
      return false;
    },
    [openAuthPrompt, status],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      users,
      isAuthenticated: status === 'authenticated' && user !== null,
      isGuest: status === 'guest',
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      promptOpen,
      promptTitle,
      openAuthPrompt,
      closeAuthPrompt,
      requireAuth,
    }),
    [
      status,
      user,
      users,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      promptOpen,
      promptTitle,
      openAuthPrompt,
      closeAuthPrompt,
      requireAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
