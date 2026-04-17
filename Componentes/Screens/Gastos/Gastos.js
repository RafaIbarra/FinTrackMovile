import React,{useState,useEffect,useContext,useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text, StyleSheet,FlatList,TouchableOpacity,SafeAreaView,Animated,TextInput    } from "react-native";
import dayjs from 'dayjs';
import Handelstorage from "../../../Storage/HandelStorage";
import Generarpeticion from "../../../Apis/ApiPeticiones";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
export default function Gastos ({ navigation  }){
     const { colors, fonts } = useTheme();
    const {sesiondatadate, setSesiondatadate} = useContext(AuthContext);
    const [dataegresos,setDataegresos]=useState([])

    const cargardatos=async()=>{
        
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
        <View style={{ flex: 1,backgroundColor: colors.background }}>
            
            <FlatList 
                          data={dataegresos}
                          renderItem={({item}) =>{
                              return(
                                  <TouchableOpacity  style={[styles.contenedordatos]} 
                                  
                                    
                                  
                                  >
                                      <View style={[styles.columna, { flex: 2 }]}> 
                                          <LogoEmpresa imagePath={item.LogoEmpresa}>

                                          </LogoEmpresa>
                                          <Text style={[styles.textocontenido,{fontFamily: fonts.balsamiqregular.fontFamily }]}> {item.NombreEmpresa}</Text>
                                          <Text style={[styles.textocontenido,{fontFamily: fonts.balsamiqregular.fontFamily }]}>Fecha Gasto: {item.FechaGasto}</Text>
                                          <Text style={[styles.textocontenido,{fontFamily: fonts.balsamiqregular.fontFamily }]}> Fecha Registro: {item.FechaRegistro}</Text>
                                          
                                          
                                      </View>

                                      <View style={[styles.columna, { flex: 1,marginTop:30 }]}> 

                                          <Text style={[styles.textototal,{fontFamily: fonts.balsamiqbold.fontFamily }]}> Gs.: {Number(item.TotalMovimiento).toLocaleString('es-ES')} </Text>
                                          
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
      fontSize:11,
      marginBottom:5,
      // color:'white'
    },
    
    


  });