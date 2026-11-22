import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createRideRequest,
  isRideRequestReady,
  type RideRequest,
} from '../domain/ride-request';

type RideRequestFormProps = {
  onSubmit: (request: RideRequest) => void;
};

export function RideRequestForm({ onSubmit }: RideRequestFormProps) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const isReady = isRideRequestReady(pickup, dropoff);

  function handleSubmit() {
    if (!isReady) {
      return;
    }

    onSubmit(createRideRequest(pickup, dropoff));
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pickup</Text>
        <TextInput
          accessibilityLabel="Pickup location"
          autoCapitalize="words"
          autoComplete="street-address"
          onChangeText={setPickup}
          placeholder="Where should we meet you?"
          placeholderTextColor="#8B9590"
          returnKeyType="next"
          style={styles.input}
          value={pickup}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Drop-off</Text>
        <TextInput
          accessibilityLabel="Drop-off location"
          autoCapitalize="words"
          autoComplete="street-address"
          onChangeText={setDropoff}
          placeholder="Where are you going?"
          placeholderTextColor="#8B9590"
          returnKeyType="done"
          style={styles.input}
          value={dropoff}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !isReady }}
        disabled={!isReady}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !isReady && styles.submitButtonDisabled,
          pressed && isReady && styles.pressed,
        ]}
      >
        <Text style={[styles.submitButtonText, !isReady && styles.disabledText]}>
          Find a van
        </Text>
      </Pressable>
      <Text style={styles.helperText}>
        You can review your ride details before confirming.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 28,
    paddingBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#293833',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
  },
  input: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E7E2',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: '#172322',
    fontSize: 15,
  },
  submitButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 17,
    backgroundColor: '#D8F36A',
  },
  submitButtonDisabled: {
    backgroundColor: '#E7EAE5',
  },
  submitButtonText: {
    color: '#172322',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledText: {
    color: '#89918D',
  },
  helperText: {
    color: '#78817D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
