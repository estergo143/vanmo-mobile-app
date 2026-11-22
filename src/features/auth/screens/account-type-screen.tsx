import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAuthStore,
  type RegistrationAccountType,
} from '../store/auth-store';

type AccountTypeOption = {
  value: RegistrationAccountType;
  title: string;
  description: string;
  indexNumber: string;
};

const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    value: 'passenger',
    title: 'Passenger',
    description: 'Find routes and reserve a seat for your next trip.',
    indexNumber: '01',
  },
  {
    value: 'van-driver',
    title: 'Van driver',
    description: 'Drive trips and help passengers board with confidence.',
    indexNumber: '02',
  },
  {
    value: 'fleet-operator',
    title: 'Fleet operator',
    description: 'Manage your fleet and grow your transport business.',
    indexNumber: '03',
  },
];

type AccountTypeScreenProps = {
  onSuccess?: (accountType: RegistrationAccountType) => void;
};

export function AccountTypeScreen({ onSuccess }: AccountTypeScreenProps) {
  const storeAccountType = useAuthStore(
    (state) => state.registration.accountType,
  );
  const setRegistrationAccountType = useAuthStore(
    (state) => state.setRegistrationAccountType,
  );
  const [selectedType, setSelectedType] =
    useState<RegistrationAccountType | null>(storeAccountType);

  function handleSelect(type: RegistrationAccountType) {
    setSelectedType(type);
    setRegistrationAccountType(type);
  }

  function handleContinue() {
    if (!selectedType) {
      return;
    }

    setRegistrationAccountType(selectedType);

    if (onSuccess) {
      onSuccess(selectedType);
      return;
    }

    router.push('/register/personal-information');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

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

        {/* Account Type Card */}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SET UP YOUR ACCOUNT</Text>
          <Text style={styles.title}>How will you use VandGo?</Text>
          <Text style={styles.subtitle}>
            Choose the account type that best describes you.
          </Text>

          <View style={styles.optionsList}>
            <Text style={styles.listLabel}>I am registering as a</Text>

            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedType === option.value;
              return (
                <Pressable
                  accessibilityHint={option.description}
                  accessibilityLabel={`${option.title} account`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>
                      {option.indexNumber}
                    </Text>
                  </View>

                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityHint="Continue to enter personal information"
            accessibilityLabel="Continue"
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedType }}
            disabled={!selectedType}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.submitButton,
              !selectedType && styles.submitButtonDisabled,
              pressed && selectedType && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
            <Text style={styles.submitButtonArrow}>&gt;</Text>
          </Pressable>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <Text style={styles.footerPrompt}>Need to change your mobile number? </Text>
            <Link href="/register" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.changeLink}>Go back</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6ED',
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
  optionsList: {
    marginTop: 24,
    gap: 12,
  },
  listLabel: {
    color: '#172A22',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(23, 99, 76, 0.15)',
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  optionCardSelected: {
    borderColor: '#17634C',
    backgroundColor: '#F7FAF7',
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDF7D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    color: '#17634C',
    fontSize: 13,
    fontWeight: '700',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    color: '#172A22',
    fontSize: 16,
    fontWeight: '700',
  },
  optionDescription: {
    color: '#68736F',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(23, 99, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: '#17634C',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#17634C',
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#17634C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
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
  pressed: {
    opacity: 0.7,
  },
});
