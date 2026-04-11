import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <View style={styles.container}>

      {/* Título */}
      <Text style={styles.titulo}>FinTrack</Text>
      <Text style={styles.subtitulo}>Controlá tus finanzas</Text>

      {/* Card del formulario */}
      <Surface style={styles.card} elevation={2}>

        <Text style={styles.cardTitulo}>Iniciar sesión</Text>

        <TextInput
          label="Usuario"
          value={usuario}
          onChangeText={setUsuario}
          mode="outlined"
          style={styles.input}
          outlineColor="#A78BFA"
          activeOutlineColor="#7C3AED"
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          label="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          mode="outlined"
          secureTextEntry={!verContrasena}
          style={styles.input}
          outlineColor="#A78BFA"
          activeOutlineColor="#7C3AED"
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={verContrasena ? 'eye-off' : 'eye'}
              onPress={() => setVerContrasena(!verContrasena)}
            />
          }
        />

        <Text style={styles.olvidaste}>¿Olvidaste tu contraseña?</Text>

        <Button
          mode="contained"
          style={styles.boton}
          contentStyle={styles.botonContenido}
          buttonColor="#7C3AED"
          labelStyle={styles.botonTexto}
        >
          Ingresar
        </Button>

        <Button
          mode="text"
          textColor="#7C3AED"
          labelStyle={styles.registrarTexto}
        >
          ¿No tenés cuenta? Registrate
        </Button>

      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 42,
    color: '#7C3AED',
    fontFamily: 'SenBold',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'bodyRegular',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  cardTitulo: {
    fontSize: 22,
    color: '#1F1F1F',
    fontFamily: 'SenRegular',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'bodyRegular',
  },
  olvidaste: {
    textAlign: 'right',
    color: '#7C3AED',
    fontFamily: 'bodyRegular',
    fontSize: 13,
    marginBottom: 20,
  },
  boton: {
    borderRadius: 12,
    marginBottom: 12,
  },
  botonContenido: {
    paddingVertical: 6,
  },
  botonTexto: {
    fontSize: 16,
    fontFamily: 'SenBold',
    letterSpacing: 0.5,
  },
  registrarTexto: {
    fontFamily: 'bodyRegular',
    fontSize: 14,
  },
});