import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RideRequestForm } from '../components/ride-request-form';
import type { RideRequest } from '../domain/ride-request';

export function RideRequestScreen() {
  const [request, setRequest] = useState<RideRequest | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>&lt;</Text>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>LET&apos;S GET YOU THERE</Text>
        <Text style={styles.title}>Plan your ride</Text>
        <Text style={styles.subtitle}>
          Add your pickup and drop-off locations.
        </Text>

        {request ? (
          <View style={styles.confirmation}>
            <Text style={styles.confirmationTitle}>You&apos;re all set to go</Text>
            <Text style={styles.locationLabel}>PICKUP</Text>
            <Text style={styles.location}>{request.pickup}</Text>
            <Text style={styles.locationLabel}>DROP-OFF</Text>
            <Text style={styles.location}>{request.dropoff}</Text>
            <Text style={styles.note}>
              Ride search is ready to connect to your booking service.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRequest(null)}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.editButtonText}>Edit locations</Text>
            </Pressable>
          </View>
        ) : (
          <RideRequestForm onSubmit={setRequest} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 30,
  },
  backArrow: {
    color: '#263A35',
    fontSize: 22,
  },
  backLabel: {
    color: '#4E5B56',
    fontSize: 14,
    fontWeight: '600',
  },
  eyebrow: {
    color: '#58655F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  title: {
    color: '#152322',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 9,
  },
  subtitle: {
    color: '#68736F',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  confirmation: {
    padding: 20,
    marginTop: 30,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  confirmationTitle: {
    color: '#172322',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  locationLabel: {
    color: '#758079',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  location: {
    color: '#293833',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  note: {
    color: '#68736F',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  editButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F0F4E9',
  },
  editButtonText: {
    color: '#263A35',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
