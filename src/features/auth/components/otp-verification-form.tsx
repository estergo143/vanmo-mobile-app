import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { isValidOtp } from '../domain/phone-number';
import { OtpInput } from './otp-input';

type OtpVerificationFormProps = {
  onSubmit: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  isLoading?: boolean;
};

export function OtpVerificationForm({
  onSubmit,
  onResend,
  isLoading: propLoading = false,
}: OtpVerificationFormProps) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = propLoading || isSubmitting;

  useEffect(() => {
    if (!resendStatus) {
      return;
    }
    const timer = setTimeout(() => setResendStatus(''), 4000);
    return () => clearTimeout(timer);
  }, [resendStatus]);

  const isComplete = code.length === 6;

  function handleCodeChange(newCode: string) {
    setCode(newCode);
    if (errorMessage) {
      setErrorMessage('');
    }
  }

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    if (!isValidOtp(code)) {
      setErrorMessage('Enter the six-digit code sent to your mobile number.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Verification failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!onResend || isLoading) {
      return;
    }
    try {
      await onResend();
      setResendStatus('A new verification code has been sent.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to resend code. Please try again.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <OtpInput
        disabled={isLoading}
        hasError={Boolean(errorMessage)}
        onChangeText={handleCodeChange}
        value={code}
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

      {Boolean(resendStatus) && (
        <View
          accessibilityLabel="Status message"
          accessibilityRole="status"
          style={styles.statusBanner}
        >
          <Text style={styles.statusText}>{resendStatus}</Text>
        </View>
      )}

      <Pressable
        accessibilityHint="Submits your 6-digit verification code"
        accessibilityLabel="Continue"
        accessibilityRole="button"
        accessibilityState={{ disabled: !isComplete || isLoading }}
        disabled={!isComplete || isLoading}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          (!isComplete || isLoading) && styles.submitButtonDisabled,
          pressed && isComplete && !isLoading && styles.submitButtonPressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Continue</Text>
            <Text style={styles.submitButtonArrow}>&gt;</Text>
          </>
        )}
      </Pressable>

      {Boolean(onResend) && (
        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn&apos;t receive a code? </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={handleResend}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.resendButtonText}>Resend code</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  statusBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusText: {
    color: '#065F46',
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
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  resendPrompt: {
    color: '#68736F',
    fontSize: 13,
  },
  resendButtonText: {
    color: '#17634C',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
