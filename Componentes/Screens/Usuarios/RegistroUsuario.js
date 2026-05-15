import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { TextInput, Button, Surface, Portal, Dialog, PaperProvider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';
import { useNavigation } from "@react-navigation/native";
import RegistroUser from '../../../Apis/ApiRegistroUsuario';
import Handelstorage from '../../../Storage/HandelStorage';

export default function RegistroUsuario() {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmarContrasena, setVerConfirmarContrasena] = useState(false);
  const [mensajeerror, setMensajeerror] = useState('');
  
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
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

  const validarFormulario = () => {
    if (!nombre.trim() || !apellido.trim() || !usuario.trim() || !correo.trim() || !contrasena.trim()) {
      setMensajeerror('Todos los campos son obligatorios');
      return false;
    }
    if (contrasena !== confirmarContrasena) {
      setMensajeerror('Las contraseñas no coinciden');
      return false;
    }
    if (contrasena.length < 1) {
      setMensajeerror('La contraseña debe tener al menos 1 caracteres');
      return false;
    }
    return true;
  };

  const ingresar = async () => {
    if (!validarFormulario()) {
      showDialog();
      return;
    }

    actualizarEstadocomponente('tituloloading', 'REGISTRANDO USUARIO');
    actualizarEstadocomponente('loading', true);

    try {
      const datos = await RegistroUser(nombre, apellido, usuario, correo, contrasena);
      
      const resp = datos['status'];

      if (resp === 201) {
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
        setMensajeerror(handleError(datos['data']['message']));
        showDialog();
      }
    } catch (error) {
      setMensajeerror('Error de conexión. Intente nuevamente.');
      showDialog();
    } finally {
      actualizarEstadocomponente('tituloloading', '');
      actualizarEstadocomponente('loading', false);
    }
  };

  const texto_normal = fonts.balsamiqregular.fontFamily;
  const texto_negrita = fonts.balsamiqbold.fontFamily;

  const inputTheme = {
    fonts: {
      bodyLarge: { fontFamily: texto_normal },
    }
  };

  const inputProps = {
    mode: "outlined",
    style: [styles.input, { backgroundColor: colors.screen_componente_estilos.color_fondo }],
    outlineStyle: { borderRadius: 15 },
    contentStyle: { fontFamily: texto_normal, color: colors.screen_componente_estilos.color_texto },
    theme: inputTheme,
    outlineColor: colors.navigation_estilos.color_fondo,
    activeOutlineColor: colors.navigation_estilos.color_fondo,
    dense: true,
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.screen_componente_estilos.color_fondo }]}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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

            <View style={styles.centerContainer}>
              <View style={styles.headerContainer}>
                <Text
                  style={[
                    styles.subtitulo,
                    {
                      fontFamily: texto_normal,
                      color: colors.navigation_estilos.color_fondo,
                    },
                  ]}
                >
                  Registrarse
                </Text>
              </View>

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
                    <TextInput
                      label="Nombre"
                      value={nombre}
                      onChangeText={setNombre}
                      {...inputProps}
                      left={<TextInput.Icon icon="account" size={20} />}
                    />

                    <TextInput
                      label="Apellido"
                      value={apellido}
                      onChangeText={setApellido}
                      {...inputProps}
                      left={<TextInput.Icon icon="account" size={20} />}
                    />

                    <TextInput
                      label="Usuario"
                      value={usuario}
                      onChangeText={setUsuario}
                      autoCapitalize="none"
                      {...inputProps}
                      left={<TextInput.Icon icon="account-circle" size={20} />}
                    />

                    <TextInput
                      label="Correo"
                      value={correo}
                      onChangeText={setCorreo}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      {...inputProps}
                      left={<TextInput.Icon icon="email" size={20} />}
                    />

                    <TextInput
                      label="Contraseña"
                      value={contrasena}
                      onChangeText={setContrasena}
                      secureTextEntry={!verContrasena}
                      {...inputProps}
                      left={<TextInput.Icon icon="lock" size={20} />}
                      right={
                        <TextInput.Icon
                          icon={verContrasena ? 'eye-off' : 'eye'}
                          size={20}
                          onPress={() => setVerContrasena(!verContrasena)}
                        />
                      }
                    />

                    <TextInput
                      label="Repetir Contraseña"
                      value={confirmarContrasena}
                      onChangeText={setConfirmarContrasena}
                      secureTextEntry={!verConfirmarContrasena}
                      {...inputProps}
                      left={<TextInput.Icon icon="lock-check" size={20} />}
                      right={
                        <TextInput.Icon
                          icon={verConfirmarContrasena ? 'eye-off' : 'eye'}
                          size={20}
                          onPress={() => setVerConfirmarContrasena(!verConfirmarContrasena)}
                        />
                      }
                    />

                    <Button
                      mode="contained"
                      style={[
                        styles.botonRegistro,
                        {
                          backgroundColor: colors.screen_componente_estilos.color_fondo_botones,
                          borderColor: colors.navigation_estilos.color_fondo,
                        },
                      ]}
                      contentStyle={styles.botonContenido}
                      buttonColor={colors.screen_componente_estilos.color_fondo_botones}
                      textColor={colors.screen_componente_estilos.color_texto}
                      labelStyle={{
                        fontFamily: texto_negrita,
                        fontSize: 16,
                        letterSpacing: 0.5,
                      }}
                      onPress={ingresar}
                    >
                      Registro
                    </Button>

                    <Button
                      mode="text"
                      textColor={colors.navigation_estilos.color_fondo}
                      labelStyle={{
                        fontSize: 14,
                        fontFamily: texto_negrita,
                        textDecorationLine: 'underline',
                      }}
                      onPress={() => navigate('Login')}
                    >
                      Volver a Login
                    </Button>
                  </View>
                </ImageBackground>
              </Surface>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 42,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 30,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
  },
  imageStyle: {
    opacity: 0.3,
    resizeMode: 'cover',
  },
  formContainer: {
    padding: 20,
    paddingHorizontal: 16,
  },
  cardTitulo: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    height: 42,
  },
  botonRegistro: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 0.5,
  },
  botonContenido: {
    paddingVertical: 4,
  },
});