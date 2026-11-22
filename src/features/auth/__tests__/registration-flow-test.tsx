import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/auth-store';
import { register, requestLoginOtp, AuthApiError } from '../services/auth-api';
import { RegisterMobileScreen } from '../screens/register-mobile-screen';
import { AccountTypeScreen } from '../screens/account-type-screen';
import { PersonalInformationScreen } from '../screens/personal-information-screen';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

jest.mock('../services/auth-api', () => ({
  ...jest.requireActual('../services/auth-api'),
  register: jest.fn().mockResolvedValue({ message: 'Registration accepted.' }),
  requestLoginOtp: jest.fn().mockResolvedValue({ message: 'OTP sent' }),
  verifyOtp: jest.fn().mockResolvedValue({
    accessToken: 'mock-token',
    userType: 'PASSENGER',
  }),
}));

describe('Registration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().resetRegistration();
  });

  describe('Step 1: RegisterMobileScreen', () => {
    it('requires a valid 10-digit mobile number starting with 9', async () => {
      const { getByRole, getByLabelText, getByText } = await render(
        <RegisterMobileScreen />,
      );

      const submitButton = getByRole('button', {
        name: 'Register with mobile number',
      });
      expect(submitButton).toBeDisabled();

      await fireEvent.changeText(
        getByLabelText('Mobile number'),
        '9201234567',
      );
      expect(submitButton).not.toBeDisabled();

      await fireEvent.press(submitButton);

      expect(useAuthStore.getState().registration.mobileNumber).toBe(
        '9201234567',
      );
      expect(router.push).toHaveBeenCalledWith('/register/account-type');
    });

    it('shows error if 10-digit number is invalid', async () => {
      const { getByRole, getByLabelText, getByText } = await render(
        <RegisterMobileScreen />,
      );

      await fireEvent.changeText(
        getByLabelText('Mobile number'),
        '8201234567',
      );
      await fireEvent.press(
        getByRole('button', { name: 'Register with mobile number' }),
      );

      expect(
        getByText('Enter a valid 10-digit mobile number starting with 9.'),
      ).toBeTruthy();
    });
  });

  describe('Step 2: AccountTypeScreen', () => {
    it('allows choosing between passenger, driver, and fleet operator', async () => {
      const { getByRole, getByText } = await render(<AccountTypeScreen />);

      const continueButton = getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeDisabled();

      // Select Passenger
      await fireEvent.press(getByRole('radio', { name: 'Passenger account' }));
      expect(continueButton).not.toBeDisabled();
      expect(useAuthStore.getState().registration.accountType).toBe('passenger');

      // Select Van driver
      await fireEvent.press(getByRole('radio', { name: 'Van driver account' }));
      expect(useAuthStore.getState().registration.accountType).toBe('van-driver');

      await fireEvent.press(continueButton);
      expect(router.push).toHaveBeenCalledWith(
        '/register/personal-information',
      );
    });
  });

  describe('Step 3: PersonalInformationScreen', () => {
    it('submits passenger registration details to register API', async () => {
      useAuthStore.getState().setRegistrationMobileNumber('9201234567');
      useAuthStore.getState().setRegistrationAccountType('passenger');

      const { getByRole, getByLabelText } = await render(
        <PersonalInformationScreen />,
      );

      const continueButton = getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeDisabled();

      await fireEvent.changeText(getByLabelText('First name'), 'Maria');
      await fireEvent.changeText(getByLabelText('Last name'), 'Santos');

      expect(continueButton).not.toBeDisabled();
      await fireEvent.press(continueButton);

      expect(register).toHaveBeenCalledWith({
        userType: 'PASSENGER',
        personalDetails: {
          firstName: 'Maria',
          lastName: 'Santos',
          phoneNumber: '+639201234567',
        },
      });
      expect(router.push).toHaveBeenCalledWith('/register/verify');
    });

    it('requires 8-character fleet operator code for driver registration', async () => {
      useAuthStore.getState().setRegistrationMobileNumber('9201234567');
      useAuthStore.getState().setRegistrationAccountType('van-driver');

      const { getByRole, getByLabelText } = await render(
        <PersonalInformationScreen />,
      );

      const continueButton = getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeDisabled();

      await fireEvent.changeText(getByLabelText('First name'), 'Juan');
      await fireEvent.changeText(getByLabelText('Last name'), 'Dela Cruz');
      expect(continueButton).toBeDisabled(); // still disabled, fleet code needed

      await fireEvent.changeText(
        getByLabelText('Fleet operator code'),
        'ABCD1234',
      );
      expect(continueButton).not.toBeDisabled();

      await fireEvent.press(continueButton);

      expect(register).toHaveBeenCalledWith({
        userType: 'VAN_DRIVER',
        personalDetails: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phoneNumber: '+639201234567',
          fleetOperatorCode: 'ABCD1234',
        },
      });
      expect(router.push).toHaveBeenCalledWith('/register/verify');
    });

    it('handles 409 conflict when number is already registered by sending login OTP', async () => {
      (register as jest.Mock).mockRejectedValueOnce(
        new AuthApiError('User already exists', 409),
      );

      useAuthStore.getState().setRegistrationMobileNumber('9201234567');
      useAuthStore.getState().setRegistrationAccountType('passenger');

      const { getByRole, getByLabelText } = await render(
        <PersonalInformationScreen />,
      );

      await fireEvent.changeText(getByLabelText('First name'), 'Maria');
      await fireEvent.changeText(getByLabelText('Last name'), 'Santos');
      await fireEvent.press(getByRole('button', { name: 'Continue' }));

      expect(requestLoginOtp).toHaveBeenCalledWith('+639201234567');
      expect(useAuthStore.getState().registration.isExistingAccount).toBe(true);
      expect(router.replace).toHaveBeenCalledWith('/register/verify');
    });
  });
});
