import {
  AuthApiError,
  getApiBaseUrl,
  register,
  requestLoginOtp,
  verifyOtp,
} from '../services/auth-api';

describe('Auth API Client', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('determines base url with fallback', () => {
    const url = getApiBaseUrl();
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
  });

  describe('requestLoginOtp', () => {
    it('calls POST /api/auth/login with E.164 phone number', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 202,
        text: () => Promise.resolve(JSON.stringify({ message: 'OTP sent' })),
      } as unknown as Response);

      const result = await requestLoginOtp('+639201234567', 'http://localhost:3001');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ phoneNumber: '+639201234567' }),
        }),
      );
      expect(result.message).toBe('OTP sent');
    });

    it('throws AuthApiError with error message on backend failure', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            JSON.stringify({ message: 'phoneNumber must be in E.164 format' }),
          ),
      } as unknown as Response);

      await expect(
        requestLoginOtp('invalid', 'http://localhost:3001'),
      ).rejects.toThrow(AuthApiError);
    });

    it('handles network / connection failures gracefully', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

      await expect(
        requestLoginOtp('+639201234567', 'http://localhost:3001'),
      ).rejects.toThrow('Unable to reach backend at http://localhost:3001/api/auth/login');
    });
  });

  describe('register', () => {
    it('calls POST /api/auth/register with registration payload', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 202,
        text: () => Promise.resolve(JSON.stringify({ message: 'Registration accepted.' })),
      } as unknown as Response);

      const result = await register(
        {
          userType: 'PASSENGER',
          personalDetails: {
            firstName: 'Maria',
            lastName: 'Santos',
            phoneNumber: '+639201234567',
          },
        },
        'http://localhost:3001',
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      expect(result.message).toBe('Registration accepted.');
    });
  });

  describe('verifyOtp', () => {
    it('calls POST /api/auth/verify-otp with phone and token', async () => {
      const mockSession = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'bearer',
        userType: 'PASSENGER',
        isOnboarded: true,
        isAgreedTermsConditions: true,
      };

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockSession)),
      } as unknown as Response);

      const session = await verifyOtp(
        '+639201234567',
        '123456',
        'http://localhost:3001',
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ phoneNumber: '+639201234567', token: '123456' }),
        }),
      );
      expect(session.accessToken).toBe('mock-jwt-token');
      expect(session.userType).toBe('PASSENGER');
    });

    it('throws AuthApiError on invalid OTP code', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () =>
          Promise.resolve(
            JSON.stringify({ message: 'Invalid or expired verification code' }),
          ),
      } as unknown as Response);

      await expect(
        verifyOtp('+639201234567', '000000', 'http://localhost:3001'),
      ).rejects.toThrow('Invalid or expired verification code');
    });
  });
});
