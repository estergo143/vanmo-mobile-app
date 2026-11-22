import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  DEFAULT_COUNTRY_CODE,
  isValidMobileNumber,
  sanitizeMobileNumber,
  toE164,
} from '../domain/phone-number';
import { LoginForm } from '../components/login-form';
import { LoginScreen } from '../screens/login-screen';
import { requestLoginOtp } from '../services/auth-api';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('../services/auth-api', () => ({
  requestLoginOtp: jest.fn().mockResolvedValue({ message: 'OTP sent' }),
}));

describe('Phone Number Domain Logic', () => {
  it('has +63 as the default country code for Philippines', () => {
    expect(DEFAULT_COUNTRY_CODE).toBe('+63');
  });

  it('sanitizes standard 10-digit mobile number', () => {
    expect(sanitizeMobileNumber('9201234567')).toBe('9201234567');
  });

  it('strips leading 0 when user inputs an 11-digit number', () => {
    expect(sanitizeMobileNumber('09201234567')).toBe('9201234567');
  });

  it('strips country code 63 when user inputs a 12-digit number', () => {
    expect(sanitizeMobileNumber('639201234567')).toBe('9201234567');
  });

  it('strips spaces, dashes, and special formatting', () => {
    expect(sanitizeMobileNumber('0920-123-4567')).toBe('9201234567');
    expect(sanitizeMobileNumber('+63 (920) 123 4567')).toBe('9201234567');
  });

  it('limits to 10 digits', () => {
    expect(sanitizeMobileNumber('92012345679999')).toBe('9201234567');
  });

  it('validates 10-digit mobile numbers starting with 9', () => {
    expect(isValidMobileNumber('9201234567')).toBe(true);
    expect(isValidMobileNumber('8201234567')).toBe(false); // does not start with 9
    expect(isValidMobileNumber('920123456')).toBe(false); // 9 digits
    expect(isValidMobileNumber('09201234567')).toBe(false); // 11 digits
  });

  it('converts national number to E.164 format', () => {
    expect(toE164('9201234567')).toBe('+639201234567');
  });
});

describe('LoginForm', () => {
  it('displays default country code +63 and country flag', async () => {
    const { getByText } = await render(<LoginForm onSubmit={jest.fn()} />);

    expect(getByText('+63')).toBeTruthy();
    expect(getByText('🇵🇭')).toBeTruthy();
  });

  it('keeps submit button disabled until 10 digits are entered', async () => {
    const { getByRole, getByLabelText } = await render(
      <LoginForm onSubmit={jest.fn()} />,
    );

    expect(getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.changeText(getByLabelText('Mobile number'), '9201234');
    expect(getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.changeText(getByLabelText('Mobile number'), '9201234567');
    expect(getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('submits valid mobile number with +63 country code', async () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText } = await render(
      <LoginForm onSubmit={onSubmit} />,
    );

    await fireEvent.changeText(getByLabelText('Mobile number'), '9201234567');
    await fireEvent.press(getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledWith('+639201234567', '9201234567');
  });

  it('shows error if 10-digit number does not start with 9', async () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText, getByText } = await render(
      <LoginForm onSubmit={onSubmit} />,
    );

    // 10 digits starting with 8
    await fireEvent.changeText(getByLabelText('Mobile number'), '8201234567');
    await fireEvent.press(getByRole('button', { name: 'Continue' }));

    expect(
      getByText('Enter a valid 10-digit mobile number starting with 9.'),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('LoginScreen', () => {
  it('renders welcome back heading without passenger-specific restriction', async () => {
    const { getByText, queryByText } = await render(<LoginScreen />);

    expect(queryByText('PASSENGER ACCOUNT')).toBeNull();
    expect(getByText('Welcome back')).toBeTruthy();
    expect(
      getByText('Sign in with your mobile number to book your next ride.'),
    ).toBeTruthy();
  });

  it('hooks up to requestLoginOtp and navigates to verify screen on submit', async () => {
    const { getByRole, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByLabelText('Mobile number'), '9201234567');
    await fireEvent.press(getByRole('button', { name: 'Continue' }));

    expect(requestLoginOtp).toHaveBeenCalledWith('+639201234567');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/login/verify',
      params: { mobileNumber: '9201234567' },
    });
  });
});
