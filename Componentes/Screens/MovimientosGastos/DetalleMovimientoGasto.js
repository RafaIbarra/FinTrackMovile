import React, { useState, useEffect,useContext } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image,StatusBar 
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";

import { useApi } from "../../../Apis/useApi";
import { AuthContext } from "../../../AuthContext";


import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
import CabaceraRegistros from "../../CabeceraRegistros/CabaceraRegistros";
import Confirmacion from "../../Procesando/Confirmacion";
import Alerta from "../../Procesando/Alerta";

import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';



export default function DetalleMovimientoGasto({ navigation }) {
  const { colors, fonts } = useTheme();
  const [datositem, setDatositem] = useState({});
  const [detallegastos, setDetallegastos] = useState([]);
  const [detallemedios, setDetallemedios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [CompsCabecera,setCompsCabecera]=useState([])

  const [showconfirmacion,setShowconfirmacion]=useState(false)
  const [mensajeconfirmacion,setMensajeconfirmacion]=useState(false)
  const [confirmaciondelete,setConfirmaciondelete]=useState(false)

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { asignar_opciones_alerta } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);

  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });

  const { params: { item } } = useRoute();

  const handleEdit = () => {
    
    const IdMovGasto=item.Id
    
    navigation.navigate('RegistroMovimientoGasto',{IdMovGasto});
    
  };
  
  const handleyes=()=>{
    setShowconfirmacion(false)
    setConfirmaciondelete(true)
  }
  const handleno=()=>{
    setShowconfirmacion(false)
    setConfirmaciondelete(false)
  }
  const handleDelete = () => {
    const id_del= datositem.Id
    setMensajeconfirmacion(`Desea eliminar el movimiento con ID ${id_del}?`)
    setShowconfirmacion(true)
    
  };

  const eliminar_registro =async()=>{
    const id_del= datositem.Id
    actualizarEstadocomponente('tituloloading', 'Eliminando Gasto..');
    actualizarEstadocomponente('loading', true);
    
    const endpoint = `operaciones/EliminarMovimientoGastoUser/${id_del}/` 
    const metodo = 'DELETE'
    const result = await apiRequest(endpoint, metodo, {});
    if (result.sessionExpired) {
        return; // Salimos de la función
      }
    if (result.resp_correcta) {
        
        const nuevo = !estadocomponente.bandera_registro_gasto;
        const mensajeExito =  'Movimiento Gasto Eliminado';
        asignar_opciones_alerta(false, 'REGISTRO GASTOS', mensajeExito, 'TabsGroup', 'ListadoMovimientosGastos', 'bandera_registro_gasto', nuevo);
        actualizarEstadocomponente('alerta_estado', true); 
        
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        asignar_opciones_alerta(true, 'ERROR', msj, 'Gastos', 'bandera_registro_gasto', false);
        actualizarEstadocomponente('alerta_estado', true);
      }
    actualizarEstadocomponente('tituloloading', '');
    actualizarEstadocomponente('loading', false);

  }
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      
      setDatositem(item);
      setDetallegastos(item["DetalleGastos"] || []);
      setDetallemedios(item["DetalleMediosPagos"] || []);
      
    });
    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
        if(confirmaciondelete){
          eliminar_registro();
        }
          
  }, [confirmaciondelete]);
  const tieneComprobante = !!datositem.UrlImg;

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen_componente_estilos.color_fondo}}>
      {estadocomponente.alerta_estado && <Alerta />}

      {showconfirmacion &&
          <Confirmacion
            title="Detalle del Gasto"
            question={mensajeconfirmacion}
            navigation={navigation}
            onYes={handleyes}
            onNo={handleno}
            
            
          />
      }
      <CabaceraRegistros
        title={`Detalle del Gasto`}
        navigation={navigation}
        onDelete={handleDelete}
        onEdit={handleEdit}
        showbottons={true}
        
      />
      
      
      <ScrollView style={styles.scroll} bounces={false}>

        
        <View style={[styles.hero,{backgroundColor:colors.screen_componente_estilos.color_fondo_cards,borderBottomWidth: 0.5}]}>
          
          <View style={[styles.heroTop]}>
            <View style={styles.logoWrap}>
              <LogoEmpresa imagePath={item.LogoEmpresa} />
            </View>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto }]}>
                {datositem.NombreEmpresa}
              </Text>
              <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily,color: colors.screen_componente_estilos.color_texto_subtitulo }]}>
                Reg. {datositem.FechaRegistro}
              </Text>
            </View>
          </View>

          
          <View style={[styles.heroTotal,
                {borderBottomWidth: 2,borderBottomColor:colors.screen_componente_estilos.color_fondo,
                  borderTopWidth:2,borderTopColor:colors.screen_componente_estilos.color_fondo

                }
                ]}>
            <Text style={[styles.heroTotalLabel, 
              { fontFamily: fonts.balsamiqregular.fontFamily,color: colors.screen_componente_estilos.color_texto_subtitulo,marginTop:5 }]}>
              TOTAL GASTO
            </Text>
            <Text style={[styles.heroTotalAmount, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto_importante }]}>
              Gs. {Number(datositem.TotalMovimiento).toLocaleString("es-ES")}
            </Text>
            <Text style={[styles.heroFechaGasto, 
              { fontFamily: fonts.balsamiqregular.fontFamily,color: colors.screen_componente_estilos.color_texto_subtitulo,marginBottom:5 }]}>
              Gasto realizado el {datositem.FechaGasto}
            </Text>
          </View>
        </View>

        
        <View style={[styles.cardsContainer]}>

          
          <View style={[styles.card,{backgroundColor:colors.screen_componente_estilos.color_fondo_cards}]}>
            <Text style={[styles.cardTitle, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto_subtitulo }]}>
              DETALLE DE GASTOS
            </Text>
            {Object.keys(detallegastos).map((key, idx) => (
              <View key={key} style={[styles.cardRow, idx > 0 && styles.cardRowBorder]}>
                <Text style={[styles.cardRowLabel, { fontFamily: fonts.balsamiqregular.fontFamily,color: colors.screen_componente_estilos.color_texto }]}>
                  {detallegastos[key].NombreGasto}
                </Text>
                <Text style={[styles.cardRowAmount, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto }]}>
                  Gs. {Number(detallegastos[key].MontoGasto).toLocaleString("es-ES")}
                </Text>
              </View>
            ))}
          </View>

          
          <View style={[styles.card,{backgroundColor:colors.screen_componente_estilos.color_fondo_cards}]}>
            <Text style={[styles.cardTitle, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto_subtitulo }]}>
              MEDIOS DE PAGO
            </Text>
            {Object.keys(detallemedios).map((key, idx) => (
              <View key={key} style={[styles.cardRow, idx > 0 && styles.cardRowBorder]}>
                <Text style={[styles.cardRowLabel, { fontFamily: fonts.balsamiqregular.fontFamily,color: colors.screen_componente_estilos.color_texto }]}>
                  {detallemedios[key].NombreMedioPago}
                </Text>
                <Text style={[styles.cardRowAmount, { fontFamily: fonts.balsamiqbold.fontFamily,color: colors.screen_componente_estilos.color_texto }]}>
                  Gs. {Number(detallemedios[key].MontoMedioPago).toLocaleString("es-ES")}
                </Text>
              </View>
            ))}
          </View>

          
          {tieneComprobante && (
            <TouchableOpacity style={[styles.comprobanteBtn,
            {backgroundColor:colors.screen_componente_estilos.color_fondo_botones,
            borderColor:colors.screen_componente_estilos.color_borde_botones
            }]
            } onPress={() => setModalVisible(true)}>
              <Text style={[styles.comprobanteBtnText, 
                { fontFamily: fonts.balsamiqregular.fontFamily,
                color:colors.screen_componente_estilos.color_texto_importante 
                }]}>
                📎 Ver comprobante adjunto
              </Text>
            </TouchableOpacity>
          )}

        </View>

        
        {tieneComprobante && (
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalSheet,{backgroundColor:colors.screen_componente_estilos.color_fondo_cards}]}>
                <View style={[styles.modalHandle,{backgroundColor:colors.screen_componente_estilos.color_fondo}]} />
                <Text style={[styles.modalTitle, { fontFamily: fonts.balsamiqbold.fontFamily,color:colors.screen_componente_estilos.color_texto }]}>
                  Comprobante
                </Text>
                <ScrollView style={{ flex: 1 }}>
                  <Image
                    source={{ uri: datositem.UrlImg }}
                    style={styles.comprobanteImg}
                    resizeMode="contain"
                  />
                </ScrollView>
                <TouchableOpacity style={[styles.cerrarBtn,
                  {backgroundColor:colors.screen_componente_estilos.color_fondo_botones,
                  borderColor:colors.screen_componente_estilos.color_borde_botones
                  }
                  ]} 
                  onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cerrarBtnText, { fontFamily: fonts.balsamiqbold.fontFamily,color:colors.screen_componente_estilos.color_texto_importante  }]}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    




      
      
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    //backgroundColor: '#13161f',       // fondo negro azulado general
  },
   customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  // ── HERO ──────────────────────────────────────────
  hero: {
    //backgroundColor: '#1a1f2e',       // negro azulado más claro para el hero
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  nombreEmpresa: {
    fontSize: 15,
    //color: '#ffffff',
  },
  fechaRegistro: {
    fontSize: 11,
    //color: '#8a8fa8',                 // gris azulado apagado
    marginTop: 3,
  },
  heroTotal: {
    alignItems: 'center',
  
    
  },
  heroTotalLabel: {
    fontSize: 15,
    letterSpacing: 1.2,
    
    //color: '#8a8fa8',                 // gris apagado
  },
  heroTotalAmount: {
    fontSize: 34,
   // color: '#3AB884',                 // verde brillante
    marginTop: 6,
  },
  heroFechaGasto: {
    fontSize: 12,
    //color: '#8a8fa8',
    marginTop: 8,
  },

  // ── TARJETAS ──────────────────────────────────────
  cardsContainer: {
    padding: 14,
    gap: 12,
  },
  card: {
    //backgroundColor: '#1e2336',       // gris oscuro azulado para las tarjetas
    borderRadius: 14,
    borderWidth: 0.5,
    //borderColor: '#2a2f45',           // borde apenas visible
    padding: 14,
  },
  cardTitle: {
    fontSize: 10,
    letterSpacing: 1.1,
    //color: '#8a8fa8',                 // gris apagado
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  cardRowBorder: {
    borderTopWidth: 0.5,
    //borderTopColor: '#2a2f45',
  },
  cardRowLabel: {
    fontSize: 13,
    //color: '#ffffff',
  },
  cardRowAmount: {
    fontSize: 13,
    //color: '#ffffff',
  },

  // ── BOTÓN COMPROBANTE ─────────────────────────────
  comprobanteBtn: {
    borderWidth: 0.5,
    //borderColor: '#3AB884',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  comprobanteBtnText: {
    fontSize: 13,
    //color: '#3AB884',
  },

  // ── MODAL ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    //backgroundColor: '#1e2336',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '88%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    //backgroundColor: '#2a2f45',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    //color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  comprobanteImg: {
    width: '100%',
  height: 460,                 // se respetará si el ScrollView tiene altura suficiente
  resizeMode: 'contain',
  },
  cerrarBtn: {
    marginTop: 16,
    borderRadius: 12,
     borderWidth: 0.5,
    padding: 14,
    alignItems: 'center',
    //backgroundColor: '#3AB884',
  },
  cerrarBtnText: {
    //color: '#fff',
    fontSize: 14,
  },
});