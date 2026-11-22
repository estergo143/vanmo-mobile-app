import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>V</Text>
            </View>
            <Text style={styles.brandName}>vanmo</Text>
          </View>
          <Link href="/login" asChild>
            <Pressable
              accessibilityHint="Go to login page"
              accessibilityLabel="Sign in"
              accessibilityRole="button"
              style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
            >
              <Text style={styles.profileText}>Sign in</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR CITY, YOUR RIDE</Text>
          <Text style={styles.title}>Room for you.{'\n'}And your plans.</Text>
          <Text style={styles.subtitle}>
            The easy way to get there together.
          </Text>
        </View>

        <View style={styles.rideCard}>
          <View style={styles.routeIllustration}>
            <View style={styles.routeDot} />
            <View style={styles.routeLine} />
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.van}>
              <Text style={styles.vanText}>V</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Where are you headed?</Text>
          <Text style={styles.cardSubtitle}>
            Set your pickup and drop-off to get started.
          </Text>
          <Link href="/ride/request" asChild>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.bookButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.bookButtonText}>Book a van</Text>
              <Text style={styles.buttonArrow}>&gt;</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>More space. Less hassle.</Text>
          <Text style={styles.footerEmoji}>*</Text>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#D8F36A',
  },
  brandMarkText: {
    color: '#152322',
    fontSize: 20,
    fontWeight: '800',
  },
  brandName: {
    color: '#172322',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  profile: {
    height: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#E8EBE8',
  },
  profileText: {
    color: '#35433F',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    marginTop: 34,
  },
  eyebrow: {
    color: '#58655F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  title: {
    color: '#152322',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 47,
    marginTop: 12,
  },
  subtitle: {
    color: '#68736F',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  rideCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    shadowColor: '#172322',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  routeIllustration: {
    height: 106,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#F0F4E9',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderWidth: 3,
    borderColor: '#253A35',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  routeLine: {
    width: 80,
    height: 2,
    backgroundColor: '#A8B49D',
  },
  destinationDot: {
    borderColor: '#A4C73B',
    backgroundColor: '#D8F36A',
  },
  van: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    borderRadius: 14,
    backgroundColor: '#D8F36A',
  },
  vanText: {
    color: '#26332A',
    fontSize: 20,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#172322',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: '#68736F',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  bookButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    borderRadius: 17,
    backgroundColor: '#D8F36A',
  },
  bookButtonText: {
    color: '#172322',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#172322',
    fontSize: 20,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  footerText: {
    color: '#78817D',
    fontSize: 13,
    fontWeight: '500',
  },
  footerEmoji: {
    color: '#90AD37',
    fontSize: 14,
  },
});
