import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type OtpInputProps = {
  value: string;
  onChangeText: (code: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
};

export function OtpInput({
  value,
  onChangeText,
  length = 6,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    onChangeText(cleaned);
  }

  function handlePress() {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }

  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>6-digit verification code</Text>

      <Pressable
        accessibilityHint="Opens keyboard to enter the 6-digit verification code"
        accessibilityLabel="6-digit verification code input"
        accessibilityRole="button"
        onPress={handlePress}
        style={styles.gridContainer}
      >
        <View style={styles.slotsRow}>
          {digits.map((digit, index) => {
            const isCurrent = isFocused && index === Math.min(value.length, length - 1);
            const isFilled = digit.length > 0;

            return (
              <View
                key={index}
                style={[
                  styles.slot,
                  isFilled && styles.slotFilled,
                  isCurrent && styles.slotActive,
                  hasError && styles.slotError,
                  disabled && styles.slotDisabled,
                ]}
              >
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            );
          })}
        </View>

        <TextInput
          accessibilityHint="Type the 6-digit verification code sent to your phone"
          accessibilityLabel="6-digit verification code"
          autoComplete="one-time-code"
          autoFocus
          data-testid="otp-hidden-input"
          editable={!disabled}
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={length}
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          ref={inputRef}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          value={value}
        />
      </Pressable>

      <Text style={styles.helperText}>
        Check your mobile number for the verification code.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: '#172A22',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  gridContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(23, 99, 76, 0.2)',
    backgroundColor: '#FFFFFF',
  },
  slotFilled: {
    borderColor: '#17634C',
    backgroundColor: '#FAFCF8',
  },
  slotActive: {
    borderColor: '#17634C',
    backgroundColor: '#F0F9F5',
    borderWidth: 2,
    shadowColor: '#17634C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  slotError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  slotDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  digitText: {
    color: '#172A22',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.01,
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: '#68736F',
    lineHeight: 18,
  },
});
