import React, { useEffect, useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_COUNTRY_CODE, maskMobileNumber, toE164 } from '../domain/phone-number';
import { OtpVerificationForm } from '../components/otp-verification-form';
import { requestLoginOtp, verifyOtp } from '../services/auth-api';
import { useAuthStore } from '../store/auth-store';

type OtpVerificationScreenProps = {
  mobileNumber?: string;
  mode?: 'login' | 'registration';
  onSuccess?: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
};

export function OtpVerificationScreen({
  mobileNumber: propMobileNumber,
  mode: propMode,
  onSuccess,
  onResend,
}: OtpVerificationScreenProps) {
  const searchParams = useLocalSearchParams<{
    mobileNumber?: string;
    mode?: 'login' | 'registration';
  }>();
  const storePendingMobile = useAuthStore((state) => state.pendingMobileNumber);
  const storeRegistrationMobile = useAuthStore(
    (state) => state.registration.mobileNumber,
  );
  const isExistingAccount = useAuthStore(
    (state) => state.registration.isExistingAccount,
  );
  const setSession = useAuthStore((state) => state.setSession);
  const [isVerified, setIsVerified] = useState(false);

  const mode = propMode || searchParams.mode || 'login';
  const isRegistration = mode === 'registration';

  useEffect(() => {
    if (!isVerified) {
      return;
    }
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1200);
    return () => clearTimeout(timer);
  }, [isVerified]);

  const activeMobileNumber =
    propMobileNumber ||
    searchParams.mobileNumber ||
    (isRegistration ? storeRegistrationMobile : storePendingMobile) ||
    '';
  const maskedPhone = maskMobileNumber(activeMobileNumber);

  async function handleVerifySubmit(code: string) {
    if (onSuccess) {
      await onSuccess(code);
      return;
    }

    const fullPhoneNumber = toE164(activeMobileNumber, DEFAULT_COUNTRY_CODE);
    const session = await verifyOtp(fullPhoneNumber, code);
    setSession(session);
    setIsVerified(true);
  }

  async function handleResendCode() {
    if (onResend) {
      await onResend();
      return;
    }

    if (!activeMobileNumber) {
      throw new Error('No mobile number available to resend code.');
    }

    const fullPhoneNumber = toE164(activeMobileNumber, DEFAULT_COUNTRY_CODE);
    await requestLoginOtp(fullPhoneNumber);
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
              accessibilityHint="Go back to the previous screen"
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

          {/* Verification Card */}
          <View style={styles.card}>
            <Text style={styles.eyebrow}>
              {isRegistration
                ? isExistingAccount
                  ? 'ACCOUNT ALREADY REGISTERED'
                  : 'VERIFY YOUR ACCOUNT'
                : 'SIGN IN'}
            </Text>
            <Text style={styles.title}>
              {isRegistration
                ? isExistingAccount
                  ? 'Verify and sign in'
                  : 'Enter your verification code'
                : 'Enter your login code'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegistration && isExistingAccount
                ? 'This number already has an account. We sent a login code to '
                : 'Enter the 6-digit code sent to '}
              <Text style={styles.phoneNumberHighlight}>{maskedPhone}</Text>.
            </Text>

            {isVerified ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Code Verified!</Text>
                <Text style={styles.successDescription}>
                  Signing you in to vanmo...
                </Text>
              </View>
            ) : (
              <View style={styles.formSection}>
                <OtpVerificationForm
                  onResend={handleResendCode}
                  onSubmit={handleVerifySubmit}
                />
              </View>
            )}

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
              <Text style={styles.footerPrompt}>Didn&apos;t get the right number? </Text>
              <Link href={isRegistration ? '/register' : '/login'} asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.changeLink}>Change mobile number</Text>
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
    fontSize: 30,
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
  phoneNumberHighlight: {
    color: '#172A22',
    fontWeight: '700',
  },
  formSection: {
    marginTop: 24,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(23, 99, 76, 0.1)',
    marginTop: 24,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  footerPrompt: {
    color: '#68736F',
    fontSize: 14,
  },
  changeLink: {
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
  successBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F0F9F5',
    borderWidth: 1,
    borderColor: 'rgba(23, 99, 76, 0.2)',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17634C',
    marginBottom: 6,
  },
  successDescription: {
    fontSize: 14,
    color: '#172A22',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
