import React, { useState } from 'react';
import { Link, router } from 'expo-router';
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
import { LoginForm } from '../components/login-form';
import { requestLoginOtp } from '../services/auth-api';
import { useAuthStore } from '../store/auth-store';

type LoginScreenProps = {
  onSuccess?: (phoneE164: string, nationalNumber: string) => void | Promise<void>;
};

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);
  const setPendingMobileNumber = useAuthStore(
    (state) => state.setPendingMobileNumber,
  );

  async function handleLoginSubmit(
    fullPhoneNumber: string,
    nationalNumber: string,
  ) {
    if (onSuccess) {
      await onSuccess(fullPhoneNumber, nationalNumber);
      return;
    }

    await requestLoginOtp(fullPhoneNumber);
    setPendingMobileNumber(nationalNumber);
    setSubmittedPhone(fullPhoneNumber);
    router.push({
      pathname: '/login/verify',
      params: { mobileNumber: nationalNumber },
    });
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

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in with your mobile number to book your next ride.
            </Text>

            {submittedPhone ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Verification Code Sent</Text>
                <Text style={styles.successDescription}>
                  We sent a 6-digit code to{' '}
                  <Text style={styles.successPhone}>{submittedPhone}</Text>.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSubmittedPhone(null)}
                  style={({ pressed }) => [
                    styles.changeNumberButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.changeNumberText}>Use a different number</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formSection}>
                <LoginForm onSubmit={handleLoginSubmit} />
              </View>
            )}

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
              <Text style={styles.footerPrompt}>New to VandGo? </Text>
              <Link href="/register" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.registerLink}>Register</Text>
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
  title: {
    color: '#172A22',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: '#5A6B63',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
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
  },
  footerPrompt: {
    color: '#68736F',
    fontSize: 14,
  },
  registerLink: {
    color: '#17634C',
    fontSize: 14,
    fontWeight: '700',
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
  successPhone: {
    fontWeight: '700',
    color: '#17634C',
  },
  changeNumberButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  changeNumberText: {
    color: '#17634C',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
});
