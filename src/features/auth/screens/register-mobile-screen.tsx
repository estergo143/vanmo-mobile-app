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
import { PhoneNumberInput } from '../components/phone-number-input';
import { isValidMobileNumber } from '../domain/phone-number';
import { useAuthStore } from '../store/auth-store';

type RegisterMobileScreenProps = {
  onSuccess?: (mobileNumber: string) => void;
};

export function RegisterMobileScreen({ onSuccess }: RegisterMobileScreenProps) {
  const setRegistrationMobileNumber = useAuthStore(
    (state) => state.setRegistrationMobileNumber,
  );
  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isComplete = mobileNumber.length === 10;

  function handleMobileNumberChange(sanitized: string) {
    setMobileNumber(sanitized);
    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function handleSubmit() {
    if (!isValidMobileNumber(mobileNumber)) {
      setErrorMessage('Enter a valid 10-digit mobile number starting with 9.');
      return;
    }

    setErrorMessage('');
    setRegistrationMobileNumber(mobileNumber);

    if (onSuccess) {
      onSuccess(mobileNumber);
      return;
    }

    router.push('/register/account-type');
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

          {/* Registration Card */}
          <View style={styles.card}>
            <Text style={styles.eyebrow}>CREATE AN ACCOUNT</Text>
            <Text style={styles.title}>Create your VandGo account</Text>
            <Text style={styles.subtitle}>
              Register with your mobile number to get started.
            </Text>

            <View style={styles.formSection}>
              <PhoneNumberInput
                hasError={Boolean(errorMessage)}
                onChangeText={handleMobileNumberChange}
                value={mobileNumber}
              />

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
                accessibilityHint="Continue to choose account type"
                accessibilityLabel="Register with mobile number"
                accessibilityRole="button"
                accessibilityState={{ disabled: !isComplete }}
                disabled={!isComplete}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  !isComplete && styles.submitButtonDisabled,
                  pressed && isComplete && styles.submitButtonPressed,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  Register with mobile number
                </Text>
                <Text style={styles.submitButtonArrow}>&gt;</Text>
              </Pressable>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
              <Text style={styles.footerPrompt}>Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.loginLink}>Log in</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerPrompt: {
    color: '#68736F',
    fontSize: 14,
  },
  loginLink: {
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
