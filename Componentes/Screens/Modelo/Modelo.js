import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Alert, ImageBackground,TouchableOpacity } from 'react-native';
import { TextInput, Button, Surface, Portal, Dialog, PaperProvider } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import Handelstorage from '../../../Storage/HandelStorage';
import Generarpeticion from '../../../Apis/ApiPeticiones';

export default function Modelo({ navigation }){
    const { colors, fonts } = useTheme();
    const { navigate } = useNavigation();


    const estilos={
        font_normal: fonts.balsamiqregular.fontFamily,
        font_negrita : fonts.balsamiqbold.fontFamily,

        font_color: colors.screen_componente_estilos.color_texto,
        font_importe_color: colors.screen_componente_estilos.color_texto_importante,   
        font_sub_color: colors.screen_componente_estilos.color_texto_subtitulo,   


        pantalla_color_fondo:colors.screen_componente_estilos.color_fondo,

        cards_color_fondo:colors.screen_componente_estilos.color_fondo_cards,
        cards_color_border:colors.screen_componente_estilos.color_borde_cards,

        boton_color_fondo:colors.screen_componente_estilos.color_fondo_botones,
        boton_color_borde:colors.screen_componente_estilos.color_borde_botones

        
    }
    const accion_boton=()=>{
        console.log('boton')
    }
    const cargardatos =async()=>{
        console.log("cargadatos")
    }
    useEffect(() => {
        cargardatos();
      }, []);
    return(
        <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo}}>
            <Text style={[,{fontFamily:estilos.font_normal,color:estilos.font_color}]}>
                Texto normal
            </Text>
            <Text style={[,{fontFamily:estilos.font_negrita,color:estilos.font_color}]}>
                Texto negrita
            </Text>
            <Text style={[,{fontFamily:estilos.font_normal,color:estilos.font_sub_color}]}>
                Sub titulo
            </Text>
            <Text style={[,{fontFamily:estilos.font_normal,color:estilos.font_importe_color}]}>
                Texto importnte
            </Text>
            <TouchableOpacity style={[styles.btn,
            {backgroundColor:estilos.boton_color_fondo,
            borderColor:estilos.boton_color_borde
            }
            ]} 
            onPress={() => accion_boton()}
            >
            <Text style={[ { fontFamily: estilos.font_normal,color:estilos.font_importe_color}]}>
            BOTON
            </Text>
        </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
btn: {
    borderWidth: 0.5,
    
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
});