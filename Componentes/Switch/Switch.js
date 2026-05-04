import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';

/**
 * CustomSwitch
 * @param {boolean} value - Estado actual (true = Ver leyenda, false = Ocultar leyenda)
 * @param {function} onValueChange - Callback que recibe el nuevo valor
 * @param {object} style - Estilos adicionales para el contenedor
 */
export default function Switch ({ value, onValueChange, style }) {
  // Animación del thumb (la bolita)
  const translateX = useRef(new Animated.Value(value ? 28 : 2)).current;
  
  // Animación del color de fondo
  const backgroundColor = useRef(
    new Animated.Value(value ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 28 : 2,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(backgroundColor, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  // Interpolación de color del track
  const trackColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#10B981'], // gray-200 → emerald-500
  });

  const handlePress = () => {
    onValueChange?.(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.label, !value && styles.labelActive]}>
          Ocultar leyenda
        </Text>
        <Text style={[styles.label, value && styles.labelActive]}>
          Ver leyenda
        </Text>
      </View>

      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.thumbInner} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  labelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  labelActive: {
    color: '#111827',
    fontWeight: '700',
  },
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
});

