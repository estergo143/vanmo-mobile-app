import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCounterStore } from './src/stores/counterStore';

export default function App() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>React Native + Zustand</Text>
        <Text style={styles.title}>Counter</Text>
        <Text accessibilityLiveRegion="polite" style={styles.count}>
          {count}
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Decrease count"
            accessibilityRole="button"
            onPress={decrement}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>−</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Increase count"
            accessibilityRole="button"
            onPress={increment}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>+</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={reset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  eyebrow: {
    color: '#52617a',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#14213d',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },
  count: {
    color: '#315efb',
    fontSize: 72,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf1ff',
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: '#315efb',
  },
  buttonText: {
    color: '#315efb',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 36,
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  resetText: {
    color: '#52617a',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
