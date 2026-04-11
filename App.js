import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { AuthProvider } from './AuthContext';
import Navigation from './Navigation';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      SenRegular: require('./assets/fonts/Gwendolyn-Regular.ttf'),
      SenBold: require('./assets/fonts/Gwendolyn-Bold.ttf'),
      bodyRegular: require('./assets/fonts/Charm-Regular.ttf'),
      bodyBold: require('./assets/fonts/Charm-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fb7185" />
        <Text>Cargando fuentes...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fecdd3',
  },
});