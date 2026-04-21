import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Alert, ImageBackground } from 'react-native';
import { TextInput, Button, Surface, Portal, Dialog, PaperProvider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import Iniciarsesion from '../../../Apis/ApiInicioSesion';
import Handelstorage from '../../../Storage/HandelStorage';
import ComprobarStorage from '../../../Storage/VerificarStorage';
import Generarpeticion from '../../../Apis/ApiPeticiones';

export default function Login() {
  const { colors, fonts } = useTheme();
  const [ready, setReady] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [mensajeerror, setMensajeerror] = useState('');
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { versionsys, setVersionsys } = useContext(AuthContext);
  const { sesiondata, setSesiondata } = useContext(AuthContext);
  const { sesiondatadate, setSesiondatadate } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const { periodo, setPeriodo } = useContext(AuthContext);
  const { actualizarEstadocomponente } = useContext(AuthContext);

  const [visibledialogo, setVisibledialogo] = useState(false);
  const showDialog = () => setVisibledialogo(true);
  const hideDialog = () => setVisibledialogo(false);

  const handleError = (errorObject) => {
    if (typeof errorObject === 'object' && errorObject !== null) {
      return Object.entries(errorObject)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
    }
    return String(errorObject);
  };

  const ingresar = async () => {
    const datos = await Iniciarsesion(usuario, contrasena, '', '');
    const resp = datos['status'];

    if (resp === 200) {
      const userdata = {
        token: datos['data']['token'],
        sesion: datos['data']['sesion'],
        refresh: datos['data']['refresh'],
        user_name: datos['data']['user_name'],
      };

      await Handelstorage('agregar', userdata, '');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const datestorage = await Handelstorage('obtenerdate');

      setSesiondata(datos['data']['datauser']);
      setSesiondatadate(datestorage);
      const anno_storage = datestorage['dataanno'];

      setPeriodo(datestorage['dataperiodo']);
      actualizarEstadocomponente('DiaActual', datos['data'].dia_actual);
      setActivarsesion(true);

      if (anno_storage === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const datestorage2 = await Handelstorage('obtenerdate');
        setPeriodo(datestorage2['dataperiodo']);
        setSesiondatadate(datestorage2);
      }

      reiniciarvalores();
    } else {
      showDialog(true);
      setMensajeerror(handleError(datos['data']['message']));
    }
  };

  const handleContrasenaChange = (text) => {
    setContrasena(text);
  };

  const cargardatos = async () => {
    setReady(false);
    const endpoint = 'sessions/ComprobarSession/';
    actualizarEstadocomponente('tituloloading', 'Comprobando Sesion..');
    actualizarEstadocomponente('loading', true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const result = await Generarpeticion(endpoint, 'GET', {});
      const respuesta = result['resp'];
      const datosstarage = await ComprobarStorage();
      const credenciales = datosstarage['datosesion'];

      if (credenciales) {
        const result = await Generarpeticion(endpoint, 'GET', {});
        const respuesta = result['resp'];

        if (respuesta === 200) {
          setSesiondata(result['data']);
          const datestorage = await Handelstorage('obtenerdate');
          setSesiondatadate(datestorage);
          setPeriodo(datestorage['dataperiodo']);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setActivarsesion(true);
        } else {
          await Handelstorage('borrar');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setActivarsesion(false);
          actualizarEstadocomponente('tituloloading', '');
          actualizarEstadocomponente('loading', false);
        }
      } else {
        setActivarsesion(false);
        actualizarEstadocomponente('tituloloading', '');
        actualizarEstadocomponente('loading', false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al conectarse al servidor');
      setReady(false);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    cargardatos();
  }, []);

  const texto_normal = fonts.balsamiqregular.fontFamily;
  const texto_negrita = fonts.balsamiqbold.fontFamily;

  const inputTheme = {
    fonts: {
      bodyLarge: { fontFamily: texto_normal },
    }
    
  };

  return (
    <PaperProvider>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.screen_componente_estilos.color_fondo },
        ]}
      >
        <Portal>
          <Dialog visible={visibledialogo} onDismiss={hideDialog}>
            <Dialog.Icon icon="alert-circle" size={50} color="red" />
            <Dialog.Title>ERROR</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{mensajeerror}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Text
          style={[
            styles.titulo,
            {
              fontFamily: texto_negrita,
              color: colors.navigation_estilos.color_fondo,
            },
          ]}
        >
          FinTrack
        </Text>
        <Text
          style={[
            styles.subtitulo,
            {
              fontFamily: texto_normal,
              color: colors.screen_componente_estilos.color_texto,
            },
          ]}
        >
          Controlá tus finanzas
        </Text>

        <Surface
          style={[
            styles.card,
            { backgroundColor: colors.screen_componente_estilos.color_fondo_cards },
          ]}
          elevation={2}
        >
          <ImageBackground
            source={require('../../../assets/logoapp.png')}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.formContainer}>
              <Text
                style={[
                  styles.cardTitulo,
                  {
                    fontFamily: texto_normal,
                    color: colors.screen_componente_estilos.color_texto,
                  },
                ]}
              >
                Iniciar sesión
              </Text>

              <TextInput
                label="Usuario"
                value={usuario}
                onChangeText={setUsuario}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 15 }}  // ← Agrega esta línea
                contentStyle={{ fontFamily: texto_normal }}
                theme={inputTheme}
                outlineColor={colors.navigation_estilos.color_fondo}
                activeOutlineColor={colors.navigation_estilos.color_fondo}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="Contraseña"
                value={contrasena}
                onChangeText={handleContrasenaChange}
                mode="outlined"
                secureTextEntry={!verContrasena}
                style={styles.input}
                outlineStyle={{ borderRadius: 15 }} 
                contentStyle={{ fontFamily: texto_normal }}
                theme={inputTheme}
                outlineColor={colors.navigation_estilos.color_fondo}
                activeOutlineColor={colors.navigation_estilos.color_fondo}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={verContrasena ? 'eye-off' : 'eye'}
                    onPress={() => setVerContrasena(!verContrasena)}
                  />
                }
              />

              <Text
                style={[
                  styles.olvidaste,
                  {
                    fontFamily: texto_normal,
                    color: colors.navigation_estilos.color_fondo,
                  },
                ]}
              >
                ¿Olvidaste tu contraseña?
              </Text>

              <Button
                mode="contained"
                style={
                  {
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: colors.screen_componente_estilos.color_fondo_botones,
                    borderWidth: 0.5,
                    borderColor:  colors.navigation_estilos.color_fondo

                  }
                }
                contentStyle={styles.botonContenido}
                buttonColor="#7C3AED"
                textColor={colors.screen_componente_estilos.color_texto}
                labelStyle={{
                  fontFamily: texto_negrita,
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
                onPress={() => ingresar()}
              >
                Ingresar
              </Button>

              <Button
                mode="text"
                textColor={ colors.navigation_estilos.color_fondo}
                labelStyle={{
                  fontSize: 14,
                  fontFamily: texto_negrita,
                }}
              >
                ¿No tenés cuenta? Registrate
              </Button>
            </View>
          </ImageBackground>
        </Surface>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 42,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.3,
    resizeMode: 'cover',
  },
  formContainer: {
    padding: 24,
  },
  cardTitulo: {
    fontSize: 22,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius:50
  },
  olvidaste: {
    textAlign: 'right',
    fontSize: 13,
    marginBottom: 20,
  },
  boton: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderColor: '#7C3AED',
    borderWidth: 0.5,
  },
  botonContenido: {
    paddingVertical: 6,
  },
});