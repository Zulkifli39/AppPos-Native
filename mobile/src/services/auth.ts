import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiRequest, authTokenStorageKey, setApiAuthToken } from '../lib/api';
import type { AppUser, AuthSession } from '../types/pos';

const authSessionStorageKey = 'native_pos_auth_session';

export async function signInWithUsername(username: string, password: string): Promise<AppUser> {
  const session = await apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: {
      username: username.trim(),
      password: password.trim(),
    },
  });

  setApiAuthToken(session.token);
  await AsyncStorage.setItem(authTokenStorageKey, session.token);
  await AsyncStorage.setItem(authSessionStorageKey, JSON.stringify(session));

  return session.user;
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const rawSession = await AsyncStorage.getItem(authSessionStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;
    setApiAuthToken(session.token);
    return session;
  } catch (_error) {
    await signOut();
    return null;
  }
}

export async function signOut(): Promise<void> {
  setApiAuthToken(null);
  await AsyncStorage.removeItem(authTokenStorageKey);
  await AsyncStorage.removeItem(authSessionStorageKey);
}
