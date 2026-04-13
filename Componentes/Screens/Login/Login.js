import React, { useState,useEffect, useContext } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Surface,Portal,Dialog,PaperProvider } from 'react-native-paper';
import { AuthContext } from '../../../AuthContext';

import Iniciarsesion from '../../../Apis/ApiInicioSesion';
import Handelstorage from '../../../Storage/HandelStorage';
import ComprobarStorage from '../../../Storage/VerificarStorage';
export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const[mensajeerror,setMensajeerror]=useState('')
  const { activarsesion, setActivarsesion } = useContext(AuthContext);


  const [visibledialogo, setVisibledialogo] = useState(false)
  const showDialog = () => setVisibledialogo(true);
  const hideDialog = () => setVisibledialogo(false);
  const handleError = (errorObject) => {
    if (typeof errorObject === "object" && errorObject !== null) {
      return Object.entries(errorObject)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
        .join("\n");
    }
    return String(errorObject); // Si no es objeto, lo convierte a string directamente
  };


  const ingresar= async ()=>{
    
    //const pushToken = await getPushToken();
    // console.log('el token obtenido es, ', pushToken)
    // actualizarEstadocomponente('tituloloading','Iniciando Sesion..')
    // actualizarEstadocomponente('loading',true)
    const datos =await Iniciarsesion(usuario, contrasena,'','')
    
    const resp=datos['status']
    if(resp===200){
        
        // await AsyncStorage.setItem("user", (JSON.stringify(datos['data']['token'])));
        
        
        const userdata={
            token:datos['data']['token'],
            sesion:datos['data']['sesion'],
            refresh:datos['data']['refresh'],
            user_name:datos['data']['user_name'],
        }
        
        await Handelstorage('agregar',userdata,'')
        
        setActivarsesion(true)
        // const datestorage=await Handelstorage('obtenerdate');
        
        // const anno_storage=datestorage['dataanno']
        
        // setPeriodo(datestorage['dataperiodo'])
        
        // actualizarEstadocomponente('DiaActual',datos['data'].dia_actual)
        // if( anno_storage===0){

        //     await new Promise(resolve => setTimeout(resolve, 1500))
            
        //     const datestorage2=await Handelstorage('obtenerdate');
            
        //     setPeriodo(datestorage2['dataperiodo'])

        // }
        // reiniciarvalores()
        
        // setSesiondata(datos['data']['datauser'])
        // actualizarEstadocomponente('tituloloading','')
        // actualizarEstadocomponente('loading',false)
        // setActivarsesion(true)
        
       
    }else{
      
      showDialog(true)
      setMensajeerror( handleError(datos['data']['message']))
      // actualizarEstadocomponente('tituloloading','')
      // actualizarEstadocomponente('loading',false)

      // if (resp===400){
      //   showDialog(true)
      //   setMensajeerror( handleError(datos['data']['error']))
      // }else{
      //   const registros=datos['data']['error']
      //   showDialog(true)
      //   setMensajeerror( handleError(datos['data']['error']))
      //   setErrorversion(true)
      //   setLinkdescarga(registros.link)
      // }
      

      
        
    }

    
  }



  const handleContrasenaChange = (text) => {
    setContrasena(text);
     
  };


  return (
    <PaperProvider>

      <View style={styles.container}>
        <Portal>
    
              <Dialog visible={visibledialogo} onDismiss={hideDialog}>
                  <Dialog.Icon icon="alert-circle" size={50} color="red"/>
                  <Dialog.Title>ERROR</Dialog.Title>
                  <Dialog.Content>
                      <Text variant="bodyMedium">{mensajeerror}</Text>
                      
                  </Dialog.Content>
                  <Dialog.Actions>
                      <Button onPress={hideDialog}>OK</Button>
                      
                  </Dialog.Actions>
              </Dialog>
        </Portal>

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
            onChangeText={handleContrasenaChange}
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
            onPress={() => ingresar()}
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
    </PaperProvider>
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