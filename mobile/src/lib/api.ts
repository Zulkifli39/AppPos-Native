import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const authTokenStorageKey = 'native_pos_auth_token';
let authToken: string | null = null;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function parseResponse(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? 'Request API gagal.');
  }

  return data;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const { body, ...requestOptions } = options;
  const init: RequestInit = {
    ...requestOptions,
    headers,
  };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    init.body = JSON.stringify(body);
  }

  const token = authToken ?? (await AsyncStorage.getItem(authTokenStorageKey));

  if (token) {
    authToken = token;
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  return parseResponse(response) as Promise<T>;
}

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

export function toApiAssetUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

  if (trimmedUrl.startsWith('/')) {
    return `${apiOrigin}${trimmedUrl}`;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname)) {
      return `${apiOrigin}${parsedUrl.pathname}${parsedUrl.search}`;
    }

    return trimmedUrl;
  } catch (_error) {
    return trimmedUrl;
  }
}

export { authTokenStorageKey };
