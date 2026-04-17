import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
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

      RobotoRegular: require('./assets/fonts/Roboto-Regular.ttf'),
      RobotoItalic: require('./assets/fonts/Roboto-Italic.ttf'),
      RobotoBold: require('./assets/fonts/Roboto-Bold.ttf'),

      MirandaRegular: require('./assets/fonts/MirandaSans-Regular.ttf'),
      MirandaItalic: require('./assets/fonts/MirandaSans-Italic.ttf'),
      MirandaBold: require('./assets/fonts/MirandaSans-Bold.ttf'),

      BalsamiqSansRegular: require('./assets/fonts/BalsamiqSans-Regular.ttf'),
      BalsamiqSansItalic: require('./assets/fonts/BalsamiqSans-Italic.ttf'),
      BalsamiqSansBold: require('./assets/fonts/BalsamiqSans-Bold.ttf'),

    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#fb7185" />
        <Text>Cargando fuentes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fecdd3',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fecdd3',
  },
});