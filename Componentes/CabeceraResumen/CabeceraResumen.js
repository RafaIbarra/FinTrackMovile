import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Surface } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';

export default function CabeceraResumen({ 
  titulo_total, 
  totalGeneral, 
  titulo_cantidad, 
  cantidadRegistros, 
  destinoNavegacion,
  parametroNavegacion = { Id: 0 }
}) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();

  const estilos = {
    font_normal: fonts.balsamiqregular.fontFamily,
    font_negrita: fonts.balsamiqbold.fontFamily,
    font_color: colors.screen_componente_estilos.color_texto,
    font_importe_color: colors.screen_componente_estilos.color_texto_importante,
    pantalla_color_fondo: colors.screen_componente_estilos.color_fondo,
    boton_color_borde: colors.screen_componente_estilos.color_borde_botones,
  };

  return (
    
    <Surface style={[styles.card, { backgroundColor: estilos.pantalla_color_fondo }]} elevation={3}>
       
      <View style={styles.resumenBarra}>
        {/* <View style={styles.resumenItem}>
          <Text style={[styles.resumenLabel, { fontFamily: estilos.font_normal }]}>
            {titulo_total}
          </Text>
          <Text style={[styles.resumenMonto, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
            Gs. {Number(totalGeneral).toLocaleString('es-ES')}
          </Text>
        </View> */}

        <View style={styles.resumenSeparador} />

        <View style={styles.resumenItem}>
          <Text style={[styles.resumenLabel, { fontFamily: estilos.font_normal }]}>
            {titulo_cantidad}
          </Text>
          <Text style={[styles.resumenMonto, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
            {Number(cantidadRegistros).toLocaleString('es-ES')}
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity
        style={[
          styles.botonAgregar,
          {
            backgroundColor: colors.navigation_estilos.color_fondo,
            borderColor: estilos.boton_color_borde,
          }
        ]}
        onPress={() => navigate(destinoNavegacion, parametroNavegacion)}
        activeOpacity={0.8}
      >
        <Text style={{ fontFamily: estilos.font_negrita, color: colors.navigation_estilos.color_texto, fontSize: 22 }}>
          +
        </Text>
      </TouchableOpacity> */}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  botonAgregar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumenBarra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    paddingVertical: 10,
    backgroundColor: '#EEE9FD',
    borderRadius: 10,
    width: '75%'
  },
  resumenItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumenSeparador: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  resumenLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  resumenMonto: {
    fontSize: 15,
  },
});