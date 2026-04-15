import React,{useEffect,useContext,useState} from "react";
import { View, Text,  Image,StyleSheet } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { Button, Dialog, Portal,PaperProvider} from 'react-native-paper';



import Handelstorage from "../../Storage/HandelStorage";
import { AuthContext } from "../../AuthContext";

import Procesando from "../Procesando/Procesando";
import { useTheme } from '@react-navigation/native';

import { Entypo } from '@expo/vector-icons';

function DrawerContentInicio(props){

    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { reiniciarvalores } = useContext(AuthContext);
    
    const { versionsys,setVersionsys } = useContext(AuthContext);
    
    const {sesiondata, setSesiondata} = useContext(AuthContext);

    const { colors,fonts } = useTheme();

    const [guardando,setGuardando]=useState(false)
    const [visibledialogo, setVisibledialogo] = useState(false)
    const [mensajeerror,setMensajeerror]=useState('')

    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);
    
    const cerrar=async ()=>{

        setGuardando(true)
        
        await Handelstorage('borrar')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        
        const datosstarage=await Handelstorage('obtener');
        const tokenstorage=datosstarage['token']
        
        if(tokenstorage){
          
          await Handelstorage('borrar')
          await new Promise(resolve => setTimeout(resolve, 3000))

          const datosstarage2=await Handelstorage('obtener');
          const tokenstorage2=datosstarage2['token']
          if(tokenstorage2){
            
            setMensajeerror('Hubo en error al completar el cierre de sesion, favor intente de vuelta')
            showDialog(true)
          }else{
            reiniciarvalores()
            setActivarsesion(false)

          }

        }else{
          reiniciarvalores()
          setActivarsesion(false)
        }

        setGuardando(false)
      }
    
    
    
    

    useEffect(() => {

        const cargardatos = async()=>{

            
            const datestorage=await Handelstorage('obtener');
            
        }
        cargardatos()
      }, []);
    return(
      <PaperProvider >

        <View style={{flex: 1}} >
            {guardando &&(<Procesando></Procesando>)}
            <DrawerContentScrollView {...props} scrollEnabled={false}>
                 <View style={{marginTop:5,marginLeft:20,alignItems:'flex-start',alignContent:'flex-start'}}>
                  <View style={[styles.containerimagen,{borderColor:colors.background}]}>
                    <Image
                          source={require('../../assets/logoapp.png')} // Ruta de la imagen
                          style={styles.image}
                          resizeMode="cover" // La imagen se ajusta al tamaño del contenedor sin distorsión
                      />
                  </View>
                    <Text>
                         @{sesiondata[0].username}
                      </Text>
                      <Text >
                        
                      </Text>

                      

                      <Text >
                        
                      </Text>

                  </View>
            </DrawerContentScrollView>
            <View style={{alignContent:'center',alignItems:'center',marginBottom:10,marginLeft:5}}>
              <Button 
                        style={{width:'90%',height:40,
                          backgroundColor:colors.acctionsbotoncolor,
                          alignContent:'center',alignItems:'center',justifyContent:'center'
                          
                        }} 
                      
                        icon={() => {return <Entypo name="log-out" size={30} color="white" />}}
                        mode="elevated" 
                        textColor="white"
                        labelStyle={{
                            fontFamily: fonts.bodybold.fontFamily, // Asigna tu fuente aquí
                            fontSize: 16, // Ajusta el tamaño si es necesario
                          }}
                        onPress={cerrar}>
                            CERRAR SESION 
                </Button>
            </View>

        </View>
      </PaperProvider>
    )
}

const styles = StyleSheet.create({
    
    
  
    containerimagen: {
        width: 80, // Ancho del contenedor
        height: 80, // Altura del contenedor
        borderRadius: 75, // Hace que el borde sea circular (la mitad del ancho y la altura)
        borderWidth:2,
        // borderColor:'red',
        overflow: 'hidden', // Oculta el contenido que se desborda del contenedor circular
        marginLeft:0,
        marginTop:15,
        marginBottom:3,
    
      },
    image: {
        width: '100%', // La imagen ocupa todo el ancho del contenedor
        height: '100%', // La imagen ocupa todo el alto del contenedor
        
      },
    textodatos:{
      fontSize:14
    },
    textouser:{
      fontSize:18,
    //   fontWeight:'bold',
    //   fontStyle:'italic'
    }

    
  });

export default DrawerContentInicio