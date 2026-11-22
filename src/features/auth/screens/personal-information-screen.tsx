import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_COUNTRY_CODE, toE164 } from '../domain/phone-number';
import {
  AuthApiError,
  register,
  requestLoginOtp,
  type RegisterRequest,
} from '../services/auth-api';
import { useAuthStore } from '../store/auth-store';

type PersonalInformationScreenProps = {
  onSuccess?: () => void;
};

export function PersonalInformationScreen({
  onSuccess,
}: PersonalInformationScreenProps) {
  const registration = useAuthStore((state) => state.registration);
  const setRegistrationPersonalDetails = useAuthStore(
    (state) => state.setRegistrationPersonalDetails,
  );
  const setRegistrationExistingAccount = useAuthStore(
    (state) => state.setRegistrationExistingAccount,
  );

  const [firstName, setFirstName] = useState(registration.firstName);
  const [lastName, setLastName] = useState(registration.lastName);
  const [fleetOperatorCode, setFleetOperatorCode] = useState(
    registration.fleetOperatorCode,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const accountType = registration.accountType || 'passenger';
  const isDriver = accountType === 'van-driver';

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (!isDriver || fleetOperatorCode.trim().length === 8);

  const accountTypeLabel =
    accountType === 'passenger'
      ? 'Passenger'
      : accountType === 'van-driver'
        ? 'Van driver'
        : 'Fleet operator';

  async function handleSubmit() {
    if (isSubmitting || !isFormValid) {
      return;
    }

    if (!registration.mobileNumber) {
      setErrorMessage(
        'Mobile number is missing. Please go back to the first step.',
      );
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const formattedPhone = toE164(
      registration.mobileNumber,
      DEFAULT_COUNTRY_CODE,
    );
    const cleanedFleetCode = fleetOperatorCode.trim().toUpperCase();

    setRegistrationPersonalDetails({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fleetOperatorCode: cleanedFleetCode,
    });

    const userTypeMapped =
      accountType === 'van-driver'
        ? 'VAN_DRIVER'
        : accountType === 'fleet-operator'
          ? 'FLEET_OPERATOR'
          : 'PASSENGER';

    const requestPayload: RegisterRequest = {
      userType: userTypeMapped,
      personalDetails: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: formattedPhone,
        ...(isDriver ? { fleetOperatorCode: cleanedFleetCode } : {}),
      },
    };

    try {
      await register(requestPayload);

      if (onSuccess) {
        onSuccess();
        return;
      }

      router.push('/register/verify');
    } catch (error) {
      // If 409 Conflict: phone number is already registered (matches web behavior)
      if (error instanceof AuthApiError && error.status === 409) {
        try {
          await requestLoginOtp(formattedPhone);
          setRegistrationExistingAccount(true);
          router.replace('/register/verify');
          return;
        } catch (otpError) {
          setErrorMessage(
            `This number already has an account, but we could not request a login code. ${
              otpError instanceof Error ? otpError.message : 'Please try again.'
            }`,
          );
          return;
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please check your information and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top navigation row */}
          <View style={styles.navRow}>
            <Pressable
              accessibilityHint="Go back to account type screen"
              accessibilityLabel="Back"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backArrow}>&lt;</Text>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
          </View>

          {/* Central Auth Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>V</Text>
            </View>
            <Text style={styles.brandName}>vanmo</Text>
          </View>

          {/* Personal Info Card */}
          <View style={styles.card}>
            <Text style={styles.eyebrow}>
              {accountTypeLabel.toUpperCase()} REGISTRATION
            </Text>
            <Text style={styles.title}>Personal information</Text>
            <Text style={styles.subtitle}>
              Tell us a little about yourself to set up your VandGo account.
            </Text>

            <View style={styles.formSection}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  accessibilityLabel="First name"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  editable={!isSubmitting}
                  onChangeText={setFirstName}
                  placeholder="Your first name"
                  placeholderTextColor="#8B9590"
                  style={styles.input}
                  value={firstName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  accessibilityLabel="Last name"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  editable={!isSubmitting}
                  onChangeText={setLastName}
                  placeholder="Your last name"
                  placeholderTextColor="#8B9590"
                  style={styles.input}
                  value={lastName}
                />
              </View>

              {isDriver && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Fleet operator code</Text>
                  <TextInput
                    accessibilityHint="Enter the 8-character fleet code provided by your operator"
                    accessibilityLabel="Fleet operator code"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    maxLength={8}
                    onChangeText={(text) =>
                      setFleetOperatorCode(text.toUpperCase())
                    }
                    placeholder="e.g. ABCD2345"
                    placeholderTextColor="#8B9590"
                    style={[styles.input, styles.monoInput]}
                    value={fleetOperatorCode}
                  />
                  <Text style={styles.helperText}>
                    Enter the 8-character code from your fleet operator to link
                    your driver account.
                  </Text>
                </View>
              )}

              {Boolean(errorMessage) && (
                <View
                  accessibilityLabel="Error message"
                  accessibilityRole="alert"
                  style={styles.errorBanner}
                >
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <Pressable
                accessibilityHint="Submits your registration details"
                accessibilityLabel="Continue"
                accessibilityRole="button"
                accessibilityState={{ disabled: !isFormValid || isSubmitting }}
                disabled={!isFormValid || isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
                  pressed &&
                    isFormValid &&
                    !isSubmitting &&
                    styles.submitButtonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Continue</Text>
                    <Text style={styles.submitButtonArrow}>&gt;</Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
              <Link href="/register/account-type" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.backLink}>Back to account type</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Bottom link back to home */}
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="link"
              style={({ pressed }) => [styles.homeLink, pressed && styles.pressed]}
            >
              <Text style={styles.homeLinkText}>Back to VandGo home</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6ED',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  navRow: {
    width: '100%',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17634C',
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#17634C',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#D8F36A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#104633',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  brandMarkText: {
    color: '#152322',
    fontSize: 24,
    fontWeight: '800',
  },
  brandName: {
    color: '#172A22',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(23, 99, 76, 0.1)',
    padding: 24,
    shadowColor: '#104F3F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  eyebrow: {
    color: '#17634C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#172A22',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: 8,
  },
  subtitle: {
    color: '#5A6B63',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  formSection: {
    marginTop: 24,
    gap: 18,
  },
  fieldGroup: {
    width: '100%',
  },
  label: {
    color: '#172A22',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(23, 99, 76, 0.2)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#172A22',
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 3,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: '#68736F',
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#17634C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonPressed: {
    backgroundColor: '#104633',
    transform: [{ scale: 0.99 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(23, 99, 76, 0.1)',
    marginTop: 24,
    marginBottom: 20,
  },
  cardFooter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    color: '#17634C',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  homeLink: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeLinkText: {
    color: '#5A6B63',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
});
