import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  isValidOtp,
  maskMobileNumber,
} from '../domain/phone-number';
import { OtpVerificationForm } from '../components/otp-verification-form';
import { OtpVerificationScreen } from '../screens/otp-verification-screen';
import { requestLoginOtp, verifyOtp } from '../services/auth-api';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({
    mobileNumber: '9201234567',
  }),
}));

jest.mock('../services/auth-api', () => ({
  requestLoginOtp: jest.fn().mockResolvedValue({ message: 'OTP resent' }),
  verifyOtp: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    tokenType: 'bearer',
    userType: 'PASSENGER',
    isOnboarded: true,
    isAgreedTermsConditions: true,
  }),
}));

describe('OTP Domain Utilities', () => {
  it('masks mobile number while displaying country code and last 4 digits', () => {
    expect(maskMobileNumber('9201234567')).toBe('+63 *** *** 4567');
  });

  it('validates 6-digit OTP code', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
    expect(isValidOtp('1234567')).toBe(false);
    expect(isValidOtp('abcdef')).toBe(false);
  });
});

describe('OtpVerificationForm', () => {
  it('keeps continue button disabled until 6 digits are entered', async () => {
    const { getByRole, getByLabelText } = await render(
      <OtpVerificationForm onSubmit={jest.fn()} />,
    );

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    await fireEvent.changeText(
      getByLabelText('6-digit verification code'),
      '12345',
    );
    expect(continueButton).toBeDisabled();

    await fireEvent.changeText(
      getByLabelText('6-digit verification code'),
      '123456',
    );
    expect(continueButton).not.toBeDisabled();
  });

  it('submits 6-digit verification code', async () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText } = await render(
      <OtpVerificationForm onSubmit={onSubmit} />,
    );

    await fireEvent.changeText(
      getByLabelText('6-digit verification code'),
      '654321',
    );
    await fireEvent.press(getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledWith('654321');
  });

  it('handles resend code request', async () => {
    const onResend = jest.fn().mockResolvedValue(undefined);
    const { getByRole, getByText } = await render(
      <OtpVerificationForm onResend={onResend} onSubmit={jest.fn()} />,
    );

    await fireEvent.press(getByRole('button', { name: 'Resend code' }));

    expect(onResend).toHaveBeenCalled();
    expect(getByText('A new verification code has been sent.')).toBeTruthy();
  });
});

describe('OtpVerificationScreen', () => {
  it('renders title, eyebrow, and masked mobile number', async () => {
    const { getByText } = await render(
      <OtpVerificationScreen mobileNumber="9201234567" />,
    );

    expect(getByText('SIGN IN')).toBeTruthy();
    expect(getByText('Enter your login code')).toBeTruthy();
    expect(getByText('+63 *** *** 4567')).toBeTruthy();
    expect(
      getByText(
        'Check your mobile number for the verification code.',
      ),
    ).toBeTruthy();
  });

  it('hooks up to verifyOtp endpoint when 6 digits are submitted', async () => {
    const { getByRole, getByLabelText } = await render(
      <OtpVerificationScreen mobileNumber="9201234567" />,
    );

    await fireEvent.changeText(
      getByLabelText('6-digit verification code'),
      '123456',
    );
    await fireEvent.press(getByRole('button', { name: 'Continue' }));

    expect(verifyOtp).toHaveBeenCalledWith('+639201234567', '123456');
  });
});
