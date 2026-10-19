/**
 * Tiny credential-based auth for the demo.
 * Replace with a real backend (Supabase, Firebase, your API) later —
 * the screens only need signIn / signUp / signOut / getSession.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = { id: string; email: string; name: string };

const SESSION_KEY = 'medicall.session.v1';
const USERS_KEY = 'medicall.users.v1';

// Hard-coded demo accounts so reviewers can log in immediately.
const DEMO_USERS: Array<{ email: string; password: string; name: string }> = [
  { email: 'demo@medicall.app', password: 'demo1234', name: 'Sarah Johnson' },
  { email: 'doctor@medicall.app', password: 'doctor1234', name: 'Dr. Amelia Hart' },
];

type StoredUser = { id: string; email: string; password: string; name: string };

async function loadUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const extra: StoredUser[] = raw ? JSON.parse(raw) : [];
  const seeded: StoredUser[] = DEMO_USERS.map((u, i) => ({ id: `demo-${i}`, ...u }));
  // demo users always available + any locally registered ones
  return [...seeded, ...extra];
}

async function saveExtraUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getSession(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function signIn(email: string, password: string): Promise<User> {
  const e = email.trim().toLowerCase();
  if (!e || !password) throw new Error('Email and password are required.');
  const users = await loadUsers();
  const match = users.find((u) => u.email.toLowerCase() === e && u.password === password);
  if (!match) throw new Error('Invalid email or password.');
  const user: User = { id: match.id, email: match.email, name: match.name };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const e = email.trim().toLowerCase();
  if (!name.trim()) throw new Error('Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error('Please enter a valid email.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');

  const raw = await AsyncStorage.getItem(USERS_KEY);
  const extra: StoredUser[] = raw ? JSON.parse(raw) : [];
  const all = await loadUsers();
  if (all.some((u) => u.email.toLowerCase() === e)) {
    throw new Error('An account with that email already exists.');
  }
  const newUser: StoredUser = { id: `u-${Date.now()}`, email: e, password, name: name.trim() };
  await saveExtraUsers([...extra, newUser]);
  const user: User = { id: newUser.id, email: newUser.email, name: newUser.name };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
