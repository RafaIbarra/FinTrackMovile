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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={dataegresos}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.contenedordatos}
              onPress={() => { navigate('GastosDetalle', { item }); }}
              activeOpacity={0.85}
            >
              {/* Columna 1: Logo */}
              <View style={styles.columnaLogo}>
                <LogoEmpresa imagePath={item.LogoEmpresa} />
              </View>

              {/* Columna 2: NombreEmpresa y FechaRegistro */}
              <View style={styles.columnaInfo}>
                <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.text }]}>
                  {item.NombreEmpresa}
                </Text>
                <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
                  {item.FechaRegistro}
                </Text>
              </View>

              {/* Columna 3: TotalMovimiento */}
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
    borderRightColor: '#c9a84c',      // dorado derecha

    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c',     // dorado inferior más delgado
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