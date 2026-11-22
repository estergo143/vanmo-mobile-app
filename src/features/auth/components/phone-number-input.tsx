import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_COUNTRY_FLAG,
  sanitizeMobileNumber,
} from '../domain/phone-number';

type PhoneNumberInputProps = {
  value: string;
  onChangeText: (sanitizedValue: string) => void;
  countryCode?: string;
  countryFlag?: string;
  disabled?: boolean;
  hasError?: boolean;
};

export function PhoneNumberInput({
  value,
  onChangeText,
  countryCode = DEFAULT_COUNTRY_CODE,
  countryFlag = DEFAULT_COUNTRY_FLAG,
  disabled = false,
  hasError = false,
}: PhoneNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(text: string) {
    const sanitized = sanitizeMobileNumber(text);
    onChangeText(sanitized);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mobile number</Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        <View style={styles.countryCodeBadge} accessibilityLabel={`Country code ${countryCode}`}>
          <Text style={styles.flagText}>{countryFlag}</Text>
          <Text style={styles.countryCodeText}>{countryCode}</Text>
        </View>

        <TextInput
          accessibilityHint="Enter your 10-digit Philippine mobile number starting with 9"
          accessibilityLabel="Mobile number"
          autoComplete="tel-national"
          data-testid="mobile-number-input"
          editable={!disabled}
          inputMode="numeric"
          keyboardType="phone-pad"
          maxLength={10}
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          placeholder="9XXXXXXXXX"
          placeholderTextColor="#8B9590"
          returnKeyType="done"
          style={styles.textInput}
          value={value}
        />
      </View>

      <Text style={styles.helperText}>
        Enter your 10-digit number, without the leading zero (e.g. 9201234567).
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
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(23, 99, 76, 0.2)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#17634C',
  },
  inputWrapperError: {
    borderColor: '#DC2626',
  },
  inputWrapperDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(23, 99, 76, 0.15)',
    backgroundColor: '#FAFCF8',
    gap: 6,
  },
  flagText: {
    fontSize: 16,
  },
  countryCodeText: {
    color: '#172A22',
    fontSize: 15,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#172A22',
    fontWeight: '500',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: '#68736F',
    lineHeight: 18,
  },
});
