import React,{useState,useEffect,useContext,useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text, StyleSheet,FlatList,TouchableOpacity,SafeAreaView,Animated,TextInput    } from "react-native";
import { useRoute } from "@react-navigation/native";

import Handelstorage from "../../../Storage/HandelStorage";
import Generarpeticion from "../../../Apis/ApiPeticiones";
export default function GastosDetalle ({ navigation  }){
    const [datositem, setDatositem]=useState([])
     const [detallegastos,setDetallegastos]=useState([])
    const {params: { item },} = useRoute();
    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
        console.log(item)
        setDatositem(item)
        setDetallegastos(item['DetalleGastos'])
        })
        return unsubscribe;
         }, [navigation]);

    return(
        <View style={{ flex: 1 }}>
            <Text>
                {datositem.NombreEmpresa}
            </Text>
            <Text>
                {datositem.FechaGasto}
            </Text>
            <Text>
                {datositem.FechaRegistro}
            </Text>
            <Text>
                {datositem.TotalMovimiento}
            </Text>

            {Object.keys(detallegastos).map((key) => (
                <View  key={key} style={{flexDirection:'row',alignContent:'center',
                        alignItems:'center',justifyContent:'space-between',
                        borderBottomWidth:0.5,paddingBottom:5,borderColor:'white',
                        marginTop:10,marginBottom:10,marginRight:5
                        }}> 
                    <Text style={{ width:'35%'}}>  {detallegastos[key].NombreGasto}</Text>

                    <Text style={{ fontWeight:'bold'}}>
            
                        Gs. {Number(detallegastos[key].MontoGasto).toLocaleString('es-ES')}
                    </Text>

                    
                    


                </View>
                ))
            }
        </View>
    )
}

