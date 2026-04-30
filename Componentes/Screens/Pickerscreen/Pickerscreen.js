import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

export default function PickerScreen() {
  const [imageUri, setImageUri] = useState(null);

  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      alert('Se necesita permiso de cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      // asset.uri     → ruta local
      // asset.width / asset.height
      setImageUri(asset.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="📷 Abrir cámara" onPress={openCamera} />
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.uri}>{imageUri}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  image: { width: 300, height: 300, borderRadius: 12, resizeMode: 'cover' },
  uri: { fontSize: 10, color: '#666', paddingHorizontal: 24, textAlign: 'center' },
});