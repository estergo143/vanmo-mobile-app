import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type AuthUserType = 'PASSENGER' | 'VAN_DRIVER' | 'FLEET_OPERATOR';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userType: AuthUserType;
  firstName?: string;
  lastName?: string;
  isOnboarded: boolean;
  isAgreedTermsConditions: boolean;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

function getDevHostIp(): string | null {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
        ?.manifest2?.extra?.expoGo?.debuggerHost;
    if (typeof hostUri === 'string' && hostUri.includes(':')) {
      return hostUri.split(':')[0];
    }
  } catch {
    // In environments where Constants is unavailable or unpopulated
  }
  return null;
}

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  const devIp = getDevHostIp();
  if (devIp && Platform.OS !== 'web') {
    return `http://${devIp}:3001`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

const DEFAULT_TIMEOUT_MS = 8000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AuthApiError(
        `Connection timed out (${timeoutMs / 1000}s) connecting to ${url}. Please ensure your backend is running.`,
        408,
      );
    }
    const reason =
      error instanceof Error ? error.message : 'Network request failed';
    throw new AuthApiError(
      `Unable to reach backend at ${url} (${reason}). Please ensure the backend is running on port 3001.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message: unknown };
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ');
    }
  }
  return fallback;
}

export type RegisterRequest = {
  userType: 'PASSENGER' | 'VAN_DRIVER' | 'FLEET_OPERATOR';
  personalDetails: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    fleetOperatorCode?: string;
  };
};

/**
 * Registers a new passenger, van driver, or fleet operator.
 * Endpoint: POST /api/auth/register
 */
export async function register(
  request: RegisterRequest,
  baseUrl: string = getApiBaseUrl(),
): Promise<{ message: string }> {
  const url = `${baseUrl}/api/auth/register`;

  console.log(`[AuthApi] Registering user at ${url}`, {
    userType: request.userType,
    phoneNumber: request.personalDetails.phoneNumber,
  });

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  console.log(`[AuthApi] Register response status: ${response.status}`);

  let data: unknown;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // response text was not JSON
    }
  }

  if (!response.ok) {
    const errorMsg = parseErrorMessage(
      data,
      `Registration failed (${response.status}).`,
    );
    console.error(`[AuthApi] Register error: ${errorMsg}`);
    throw new AuthApiError(errorMsg, response.status);
  }

  return (data as { message: string }) || { message: 'Registration accepted.' };
}

/**
 * Initiates login by requesting an OTP code from the backend.
 * Endpoint: POST /api/auth/login
 */
export async function requestLoginOtp(
  phoneNumber: string,
  baseUrl: string = getApiBaseUrl(),
): Promise<{ message: string }> {
  const url = `${baseUrl}/api/auth/login`;

  console.log(`[AuthApi] Requesting login OTP for ${phoneNumber} at ${url}`);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  console.log(`[AuthApi] Login OTP response status: ${response.status}`);

  let data: unknown;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // response text was not JSON
    }
  }

  if (!response.ok) {
    const errorMsg = parseErrorMessage(
      data,
      `Login request failed (${response.status}).`,
    );
    console.error(`[AuthApi] Login OTP error: ${errorMsg}`);
    throw new AuthApiError(errorMsg, response.status);
  }

  return (data as { message: string }) || { message: 'OTP sent successfully.' };
}

/**
 * Verifies the OTP code with the backend and returns the session credentials.
 * Endpoint: POST /api/auth/verify-otp
 */
export async function verifyOtp(
  phoneNumber: string,
  token: string,
  baseUrl: string = getApiBaseUrl(),
): Promise<AuthSession> {
  const url = `${baseUrl}/api/auth/verify-otp`;

  console.log(`[AuthApi] Verifying OTP for ${phoneNumber} at ${url}`);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, token }),
  });

  console.log(`[AuthApi] Verify OTP response status: ${response.status}`);

  let data: unknown;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // response text was not JSON
    }
  }

  if (!response.ok) {
    const errorMsg = parseErrorMessage(
      data,
      `Verification failed (${response.status}).`,
    );
    console.error(`[AuthApi] Verify OTP error: ${errorMsg}`);
    throw new AuthApiError(errorMsg, response.status);
  }

  const session = data as AuthSession;
  if (!session || !session.accessToken || !session.userType) {
    throw new AuthApiError('The authentication service returned an invalid session.', 502);
  }

  return session;
}
