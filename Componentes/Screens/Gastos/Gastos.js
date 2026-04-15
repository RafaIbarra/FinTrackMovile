import React,{useState,useEffect,useContext,useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text, StyleSheet,FlatList,TouchableOpacity,SafeAreaView,Animated,TextInput    } from "react-native";
import dayjs from 'dayjs';
import Handelstorage from "../../../Storage/HandelStorage";
import Generarpeticion from "../../../Apis/ApiPeticiones";
import { AuthContext } from "../../../AuthContext";
export default function Gastos ({ navigation  }){
    const {sesiondatadate, setSesiondatadate} = useContext(AuthContext);
    const [dataegresos,setDataegresos]=useState([])

    const cargardatos=async()=>{
        console.log(sesiondatadate)
        anno_storage=sesiondatadate.dataanno
        mes_storage=sesiondatadate.datames
        const endpoint=`operaciones/ListadoMovimientoGastosMesUser/${anno_storage}/${mes_storage}/`
        const result = await Generarpeticion(endpoint, 'GET', {});
        const respuesta=result['resp']
        if (respuesta === 200) {
          
          
          const registros=result['data']
          if(Object.keys(registros).length>0){
                registros.forEach((elemento) => {
                
                elemento.key = elemento.Id;
                elemento.recarga='no'
                })
            }
          setDataegresos(registros)
          
        }else{
          console.log("error en la peticion")
        }
    }
   useEffect(() => {
   
       
   
       
       cargardatos()
       
     }, []);
    return(
        <View style={{ flex: 1 }}>
            <Text>
                Listado de gastos
            </Text>
            <FlatList 
                          data={dataegresos}
                          renderItem={({item}) =>{
                              return(
                                  <TouchableOpacity  style={[styles.contenedordatos]} 
                                  
                                    
                                  
                                  >
                                      <View style={[styles.columna, { flex: 2 }]}> 
                                          
                                          <Text style={[styles.textocontenido]}>Fecha Gasto: {item.FechaGasto}</Text>
                                          <Text style={[styles.textocontenido]}> Fecha Registro: {item.FechaRegistro}</Text>
                                          
                                          
                                      </View>

                                      <View style={[styles.columna, { flex: 1,marginTop:30 }]}> 

                                          <Text style={[styles.textototal]}> Gs.: {Number(item.TotalMovimiento).toLocaleString('es-ES')} </Text>
                                          
                                      </View>
                                  </TouchableOpacity >
                              )
                          }
                      }
                          keyExtractor={item => item.key}
                      />
        </View>
    )
}

const styles = StyleSheet.create({
    contenedordatos:{
        flexDirection: 'row',
        borderBottomWidth:1,
        borderRightWidth:3,
        marginBottom:10,
        marginRight:5,

        overflow: 'hidden', 
        height: 110,
        padding: 10,
        
        
    },
    textocontenido:{
      fontSize:12.5,
      marginBottom:5,
      // color:'white'
    },
    
    


  });