import { create } from 'zustand';
import type { AuthSession } from '../services/auth-api';

export type RegistrationAccountType =
  | 'passenger'
  | 'van-driver'
  | 'fleet-operator';

export type RegistrationData = {
  mobileNumber: string;
  accountType: RegistrationAccountType | null;
  firstName: string;
  lastName: string;
  fleetOperatorCode: string;
  isExistingAccount: boolean;
};

type AuthState = {
  session: AuthSession | null;
  pendingMobileNumber: string | null;
  registration: RegistrationData;
  setPendingMobileNumber: (mobileNumber: string | null) => void;
  setSession: (session: AuthSession | null) => void;
  setRegistrationMobileNumber: (mobileNumber: string) => void;
  setRegistrationAccountType: (accountType: RegistrationAccountType) => void;
  setRegistrationPersonalDetails: (details: {
    firstName: string;
    lastName: string;
    fleetOperatorCode?: string;
  }) => void;
  setRegistrationExistingAccount: (isExisting: boolean) => void;
  resetRegistration: () => void;
  logout: () => void;
};

const initialRegistration: RegistrationData = {
  mobileNumber: '',
  accountType: null,
  firstName: '',
  lastName: '',
  fleetOperatorCode: '',
  isExistingAccount: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  pendingMobileNumber: null,
  registration: initialRegistration,
  setPendingMobileNumber: (pendingMobileNumber) => set({ pendingMobileNumber }),
  setSession: (session) => set({ session }),
  setRegistrationMobileNumber: (mobileNumber) =>
    set((state) => ({
      registration: {
        ...state.registration,
        mobileNumber,
        isExistingAccount: false,
      },
    })),
  setRegistrationAccountType: (accountType) =>
    set((state) => ({
      registration: {
        ...state.registration,
        accountType,
      },
    })),
  setRegistrationPersonalDetails: ({ firstName, lastName, fleetOperatorCode = '' }) =>
    set((state) => ({
      registration: {
        ...state.registration,
        firstName,
        lastName,
        fleetOperatorCode,
      },
    })),
  setRegistrationExistingAccount: (isExistingAccount) =>
    set((state) => ({
      registration: {
        ...state.registration,
        isExistingAccount,
      },
    })),
  resetRegistration: () => set({ registration: initialRegistration }),
  logout: () =>
    set({
      session: null,
      pendingMobileNumber: null,
      registration: initialRegistration,
    }),
}));
