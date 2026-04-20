import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
import Generarpeticion from "../../../Apis/ApiPeticiones";

export default function Gastos({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  const { sesiondatadate } = useContext(AuthContext);
  const [dataegresos, setDataegresos] = useState([]);

  const cargardatos = async () => {
    const anno_storage = sesiondatadate.dataanno;
    const mes_storage = sesiondatadate.datames;
    const endpoint = `operaciones/ListadoMovimientoGastosMesUser/${anno_storage}/${mes_storage}/`;
    const result = await Generarpeticion(endpoint, 'GET', {});
    const respuesta = result['resp'];
    console.log("PRINCIPAL GASTOS")
    if (respuesta === 200) {
      const registros = result['data'];
      if (Object.keys(registros).length > 0) {
        registros.forEach((elemento) => {
          elemento.key = elemento.Id;
          elemento.recarga = 'no';
        });
      }
      setDataegresos(registros);
    } else {
      console.log("error en la peticion");
    }
  };

  useEffect(() => {
    cargardatos();
  }, []);

  return (
    

      <View style={{ flex: 1, backgroundColor: colors.background}}>

        {/* RESUMEN CARDS */}
        <View style={styles.resumenContenedor}>

          <View style={[styles.resumenCard, styles.resumenCardIngreso]}>
            <View style={styles.resumenFila}>
              <View style={[styles.resumenIcono, styles.resumenIconoIngreso]}>
                <Text style={styles.resumenIconoTexto}>↓</Text>
              </View>
              <Text style={[styles.resumenLabel, styles.resumenLabelIngreso,{ fontFamily: fonts.balsamiqregular.fontFamily}]}>Total Income</Text>
            </View>
            <Text style={[styles.resumenMonto, styles.resumenMontoIngreso,{ fontFamily: fonts.balsamiqregular.fontFamily}]}>Gs. 8.500.000</Text>
          </View>

          <View style={[styles.resumenCard, styles.resumenCardGasto]}>
            <View style={styles.resumenFila}>
              <View style={[styles.resumenIcono, styles.resumenIconoGasto]}>
                <Text style={styles.resumenIconoTexto}>↑</Text>
              </View>
              <Text style={[styles.resumenLabel, styles.resumenLabelGasto,{ fontFamily: fonts.balsamiqregular.fontFamily}]}>Total Expenses</Text>
            </View>
            <Text style={[styles.resumenMonto, styles.resumenMontoGasto,{ fontFamily: fonts.balsamiqregular.fontFamily}]}>Gs. 3.800.000</Text>
          </View>

        </View>

        
       

              <FlatList
              
                data={dataegresos}
                contentContainerStyle={styles.flatlistContenido}
                style={{ flex: 1,}}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      style={styles.contenedordatos}
                      onPress={() => { navigate('GastosDetalle', { item }); }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.columnaLogo}>
                        <LogoEmpresa imagePath={item.LogoEmpresa} />
                      </View>
                      <View style={styles.columnaInfo}>
                        <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.text }]}>
                          {item.NombreEmpresa}
                        </Text>
                        <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
                          {item.FechaRegistro}
                        </Text>
                      </View>
                      <View style={styles.columnaTotal}>
                        <Text style={[styles.totalMovimiento, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.text }]}>
                          Gs. {Number(item.TotalMovimiento).toLocaleString('es-ES')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={item => item.key}
              />
          
        
      </View>
    
  );
}

const styles = StyleSheet.create({

  // --- RESUMEN ---
  resumenContenedor: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 12,
    marginBottom: 16,
    gap: 10,
  },
  resumenCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  resumenCardIngreso: {
    backgroundColor: '#EEE9FD',
  },
  resumenCardGasto: {
    backgroundColor: '#FDEEE9',
  },
  resumenFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  resumenIcono: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenIconoIngreso: {
    backgroundColor: '#7B5EA7',
  },
  resumenIconoGasto: {
    backgroundColor: '#E05C5C',
  },
  resumenIconoTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  resumenLabel: {
    fontSize: 11,
  },
  resumenLabelIngreso: {
    color: '#7B5EA7',
  },
  resumenLabelGasto: {
    color: '#E05C5C',
  },
  resumenMonto: {
    fontSize: 15,
    fontWeight: '700',
  },
  resumenMontoIngreso: {
    color: '#3D2A6E',
  },
  resumenMontoGasto: {
    color: '#8B1A1A',
  },

  // --- LISTA ---
  contenedordatos: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#1e2336',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderRightColor: '#c9a84c',
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c',
  },
  flatlistContenido: {
  paddingBottom: 16,   // espacio para el BottomTab (height 65 + margen)
  paddingTop: 4,       // pequeño respiro del resumen cards
  
},
  columnaLogo: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  columnaInfo: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  columnaTotal: {
    flex: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  nombreEmpresa: {
    fontSize: 12,
    marginBottom: 4,
  },
  fechaRegistro: {
    fontSize: 11,
  },
  totalMovimiento: {
    fontSize: 13,
    textAlign: 'right',
  },
});