import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';

import Alerta from "../../Procesando/Alerta";
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
import Generarpeticion from "../../../Apis/ApiPeticiones";
import { useApi } from "../../../Apis/useApi";

export default function ListadoMovimientosIngresos({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  const { sesiondatadate } = useContext(AuthContext);
  const [dataingresos, setDataingresos] = useState([]);
  const [dataresumen, setDataresumen] = useState([]);

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { asignar_opciones_alerta } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const [ready,setReady]=useState(false)

  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });

  const cargardatos = async () => {
    
    setReady(false)
    actualizarEstadocomponente('tituloloading', 'CARGANDO INGRESOS');
    actualizarEstadocomponente('loading', true);
    const anno_storage = sesiondatadate.dataanno;
    const mes_storage = sesiondatadate.datames;
    const endpoint = `operaciones/ListadoMovimientosIngresosMesUser/${anno_storage}/${mes_storage}/`;

    const result = await apiRequest(endpoint, 'GET', {});
    
    
    
    if (result.sessionExpired) {
            return; // SI LA SESION NO ES VALIDA
        }
    if (result.resp_correcta) {
      const registros = result.data.detalle;
      if (Object.keys(registros).length > 0) {
        registros.forEach((elemento) => {
          elemento.key = elemento.Id;
          elemento.recarga = 'no';
        });
      }
      setDataingresos(registros);
      setDataresumen(result.data.resumen)
      

    } else{
        const msj = result.data?.message || 'Error en la solicitud'; // toma el error
        asignar_opciones_alerta(true, 'ERROR', msj, 'GASTOS', '', false); // muestra el mensaje en la alerta personalizada
        actualizarEstadocomponente('alerta_estado', true);
      }
    actualizarEstadocomponente('tituloloading', '');
    actualizarEstadocomponente('loading',  false);
    setReady(true)
  };

  useEffect(() => {
    cargardatos();
  }, [estadocomponente.bandera_registro_ingreso]);

  useEffect(() => {
         
          const unsubscribe = navigation.addListener('focus', () => {
        
          const asignar_componente=async()=>{
            
            actualizarEstadocomponente('ComponenteActivoBottonTab', 'ListadoMovimientosIngresos');
  
             
          }
          
          asignar_componente()
          
        })
        return unsubscribe;
  
  
        }, []);

  if(ready){
    return (
      
  
        <View style={{ flex: 1, backgroundColor: colors.screen_componente_estilos.color_fondo}}>
  
          {estadocomponente.alerta_estado && <Alerta />}
  
           {/* // --- RESUMEN CARDS ---// */}
  
           
            <View style={styles.resumenContenedor}>
              
              <View style={[styles.resumenCard, styles.resumenCardIngreso]}>
                <View style={styles.resumenRow}>
                  
                  <View style={styles.resumenColumnaIcono}>
                    <View style={[styles.resumenIcono, styles.resumenIconoIngreso]}>
                      <Text style={styles.resumenIconoTexto}>↓</Text>
                    </View>
                  </View>
                  
                  
                  <View style={styles.resumenColumnaTextos}>
                    <Text style={[styles.resumenLabel, styles.resumenLabelIngreso, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Total Income
                    </Text>
                    <Text style={[styles.resumenMonto, styles.resumenMontoIngreso, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Gs. {Number(dataresumen[0]?.TotalIngresos).toLocaleString('es-ES')}
                    </Text>
                    <Text style={[styles.resumenCantidad, styles.resumenCantidadIngreso, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Cant registros: {Number(dataresumen[0]?.CantidadIngresos).toLocaleString('es-ES')}
                    </Text>
                  </View>
                </View>
              </View>
  
              
              <View style={[styles.resumenCard, styles.resumenCardGasto]}>
                <View style={styles.resumenRow}>
                  
                  <View style={styles.resumenColumnaIcono}>
                    <View style={[styles.resumenIcono, styles.resumenIconoGasto]}>
                      <Text style={styles.resumenIconoTexto}>↑</Text>
                    </View>
                  </View>
                  
                  
                  <View style={styles.resumenColumnaTextos}>
                    <Text style={[styles.resumenLabel, styles.resumenLabelGasto, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Total Gastos
                    </Text>
                    <Text style={[styles.resumenMonto, styles.resumenMontoGasto, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Gs. {Number(dataresumen[0]?.TotalGastos).toLocaleString('es-ES')}
                    </Text>
                    <Text style={[styles.resumenCantidad, styles.resumenCantidadGasto, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                      Cant registros: {Number(dataresumen[0]?.CantidadGastos).toLocaleString('es-ES')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
  
          
         
  
              <FlatList
              
                data={dataingresos}
                contentContainerStyle={styles.flatlistContenido}
                style={{ flex: 1,}}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      style={[styles.contenedordatos,{
                        backgroundColor: colors.screen_componente_estilos.color_fondo_cards,
                        borderRightColor:colors.screen_componente_estilos.color_borde_cards,
                        borderBottomColor:colors.screen_componente_estilos.color_borde_cards
                      }]}
                      onPress={() => { navigate('DetalleMovimientoIngreso', { item }); }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.columnaLogo}>
                        <LogoEmpresa imagePath={item.LogoEmpresa} />
                      </View>
                      <View style={styles.columnaInfo}>
                        <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.screen_componente_estilos.color_texto}]}>
                          {item.NombreEmpresa}
                        </Text>
                        <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.screen_componente_estilos.color_texto_subtitulo }]}>
                          {item.FechaRegistro}
                        </Text>
                        <Text style={[styles.idRegistro, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.screen_componente_estilos.color_texto_subtitulo }]}>
                          ID: {item.Id}
                        </Text>
                      </View>
                      <View style={styles.columnaTotal}>
                        <Text style={[styles.totalMovimiento, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.screen_componente_estilos.color_texto }]}>
                          Gs. {Number(item.MontoIngreso).toLocaleString('es-ES')}
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
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  resumenColumnaTextos: {
  flex: 1, // Ocupa el resto del espacio
},
resumenCantidad: {
  fontSize: 11,
  marginTop: 4,
  opacity: 0.8,
},
  resumenColumnaIcono: {
    width: 40, // Ancho fijo para la columna del icono
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 10,
    //backgroundColor: '#1e2336',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    //borderRightColor: '#c9a84c',
    borderBottomWidth: 1,
    //borderBottomColor: '#c9a84c',
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
  idRegistro: {
    fontSize: 9,
  },
  totalMovimiento: {
    fontSize: 13,
    textAlign: 'right',
  },
});