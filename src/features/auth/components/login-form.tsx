import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DEFAULT_COUNTRY_CODE,
  isValidMobileNumber,
  toE164,
} from '../domain/phone-number';
import { PhoneNumberInput } from './phone-number-input';

type LoginFormProps = {
  onSubmit: (formattedPhone: string, mobileNumber: string) => void | Promise<void>;
  isLoading?: boolean;
};

export function LoginForm({
  onSubmit,
  isLoading: propLoading = false,
}: LoginFormProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = propLoading || isSubmitting;
  const isComplete = mobileNumber.length === 10;

  function handleMobileNumberChange(sanitized: string) {
    setMobileNumber(sanitized);
    if (errorMessage) {
      setErrorMessage('');
    }
  }

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    if (!isValidMobileNumber(mobileNumber)) {
      setErrorMessage('Enter a valid 10-digit mobile number starting with 9.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    const fullPhoneNumber = toE164(mobileNumber, DEFAULT_COUNTRY_CODE);

    try {
      await onSubmit(fullPhoneNumber, mobileNumber);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not request a login code. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
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
        accessibilityHint="Requests a verification code for your mobile number"
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
});
