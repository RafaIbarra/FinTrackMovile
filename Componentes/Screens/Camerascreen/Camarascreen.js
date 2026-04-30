import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);

  // --- Tomar foto con la cámara ---
  const tomarFoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);

    // Guardar en galería (opcional)
    const { granted: mediaGranted } = await MediaLibrary.requestPermissionsAsync();
    if (mediaGranted) {
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  };

  // --- Seleccionar foto de la galería ---
  const seleccionarDeGaleria = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) return;

    setImageUri(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>

      {/* Botones */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={tomarFoto}>
          <Text style={styles.btnText}>📷 Cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={seleccionarDeGaleria}>
          <Text style={styles.btnText}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      {/* Preview de la imagen */}
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.uri} numberOfLines={2}>{imageUri}</Text>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: '#555',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  uri: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});