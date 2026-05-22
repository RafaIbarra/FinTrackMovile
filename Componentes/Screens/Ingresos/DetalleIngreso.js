import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";

import { useApi } from "../../../Apis/useApi";
import { AuthContext } from "../../../AuthContext";


import CabaceraRegistros from "../../CabeceraRegistros/CabaceraRegistros";
import Confirmacion from "../../Procesando/Confirmacion";
import Esperando from "../../Procesando/Espera";
import Notificacion from "../../Notificacion/Notificacion";



import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function DetalleIngreso({ navigation }) {
  const { colors, fonts } = useTheme();

  // ── Estados genéricos ─────────────────────────────
  const [registroPrincipal, setRegistroPrincipal] = useState({});
  
  const [modalVisible, setModalVisible] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

  const [tituloespera, setTituloespera] = useState('');
  const [ready, setReady] = useState(false);
  const[estadonotificacion,setEstadonotificacion]=useState(false)
  const[bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                        titulo:'',
                                                        is_error:false,
                                                        estado_actualizar:'recarga_conceptos_ingresos',
                                                        valor_estado:'',
                                                        navnivel1:'TabBasicosGroup',
                                                        navnivel2:'StackIngresosGroup',
                                                        navnivel3:'ListadoIngresos',
                                                        })

  const {
    estadocomponente,
    actualizarEstadocomponente,
    
    activarsesion,
    setActivarsesion,
    reiniciarvalores,
  } = useContext(AuthContext);

  const apiRequest = useApi({
    setActivarsesion,
    reiniciarvalores,
    actualizarEstadocomponente,
  });

  const {
    params: { item },
  } = useRoute();

  const handleEdit = () => {
    const IdIngreso = item.Id;
    //const IdCategoria = 0;
    navigation.navigate("RegistroIngreso", { IdIngreso });
  };

  const handleYes = () => {
    setMostrarConfirmacion(false);
    setConfirmarEliminacion(true);
  };

  const handleNo = () => {
    setMostrarConfirmacion(false);
    setConfirmarEliminacion(false);
  };

  const handleDelete = () => {
    const id_del = registroPrincipal.Id;
    setMensajeConfirmacion(`Desea eliminar el ingreso con ID ${id_del}?`);
    setMostrarConfirmacion(true);
    
    // eliminarRegistro()
    // navigation.goBack();
  };

  const onOk=()=>{
    setEstadonotificacion(false)
  }

  const eliminarRegistro = async () => {
    const id_del = registroPrincipal.Id;
    
    setReady(false)
    setTituloespera("Eliminando Ingreso..")

    const endpoint = `ref/OperacionesIngresoUser/${id_del}/`;
    const metodo = "DELETE";
    const result = await apiRequest(endpoint, metodo, {});

    if (result.sessionExpired) {
      
      return;
    }

    if (result.resp_correcta) {
      setReady(true);
      const nuevo = true;
      const mensajeExito = "Ingreso Eliminado";
      setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO INGRESOS',
          mensaje: mensajeExito,
          is_error: false,
          valor_estado:nuevo
        }));
        setEstadonotificacion(true)
      
      
      

    } else {
      const msj = result.data?.message || 'Error en la solicitud';
        
      setReady(true);
      setBodynotificacion(prevState => ({
        ...prevState,
        titulo:'REGISTRO INGRESOS',
        mensaje: msj,
        is_error: true,
        valor_estado:''
      }));
      setEstadonotificacion(true)
        
    }

    
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setReady(true);
      setRegistroPrincipal(item);
      
    });
    return unsubscribe;
  }, [navigation, item]);

  useEffect(() => {
    if (confirmarEliminacion) {
      eliminarRegistro();
    }
  }, [confirmarEliminacion]);

  if (!ready) return <Esperando titulo={tituloespera}/>;
  if (ready){

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.screen_componente_estilos.color_fondo,
        }}
      >
        
        {estadonotificacion && <Notificacion navigation={navigation} bodynotificacion={bodynotificacion} onOk={onOk} />}
  
        {mostrarConfirmacion && (
          <Confirmacion
            title="Detalle Ingreso"
            question={mensajeConfirmacion}
            navigation={navigation}
            onYes={handleYes}
            onNo={handleNo}
          />
        )}
  
        <CabaceraRegistros
          title={`Detalle Ingreso`}
          navigation={navigation}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showbottons={true}
        />
        
        <ScrollView style={styles.scroll} bounces={false}>
          {/* ═══════════════════════════════════════════════
              HERO — Enfoque en Nombre + ID
          ═══════════════════════════════════════════════ */}
          <View
            style={[
              styles.hero,
              {
                backgroundColor:
                  colors.screen_componente_estilos.color_fondo_cards,
              },
            ]}
          >
            {/* Fila superior: Nombre grande + ID */}
            <View style={styles.heroTop}>
              <Text
                style={[
                  styles.nombreRegistro,
                  {
                    fontFamily: fonts.balsamiqbold.fontFamily,
                    color: colors.screen_componente_estilos.color_texto,
                  },
                ]}
              >
                {registroPrincipal.NombreIngreso}
              </Text>
  
              <View style={styles.idBadge}>
                <Text
                  style={[
                    styles.idText,
                    {
                      fontFamily: fonts.balsamiqregular.fontFamily,
                      color:
                        colors.screen_componente_estilos.color_texto_subtitulo,
                    },
                  ]}
                >
                  ID {registroPrincipal.Id}
                </Text>
              </View>
  
              <Text
                style={[
                  styles.fechaRegistro,
                  {
                    fontFamily: fonts.balsamiqregular.fontFamily,
                    color:
                      colors.screen_componente_estilos.color_texto_subtitulo,
                  },
                ]}
              >
                Registrado el {registroPrincipal.FechaRegistro}
              </Text>
            </View>
  
            {/* Fila inferior: Totales y métricas */}
            <View
              style={[
                styles.heroMeta,
                {
                  borderTopColor:
                    colors.screen_componente_estilos.color_fondo,
                },
              ]}
            >
              
              <View style={{ alignItems: "center" }}>
                <Text
                  style={[
                    styles.metaLabel,
                    {
                      fontFamily: fonts.balsamiqregular.fontFamily,
                      color:
                        colors.screen_componente_estilos
                          .color_texto_subtitulo,
                    },
                  ]}
                >
                  REGISTROS
                </Text>
                <Text
                  style={[
                    styles.metaValue,
                    {
                      fontFamily: fonts.balsamiqbold.fontFamily,
                      color:
                        colors.screen_componente_estilos.color_texto,
                    },
                  ]}
                >
                  {registroPrincipal.CantidadConcepto ?? 0}
                </Text>
              </View>
  
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.metaLabel,
                    {
                      fontFamily: fonts.balsamiqregular.fontFamily,
                      color:
                        colors.screen_componente_estilos
                          .color_texto_subtitulo,
                    },
                  ]}
                >
                  TOTAL
                </Text>
                <Text
                  style={[
                    styles.totalAmount,
                    {
                      fontFamily: fonts.balsamiqbold.fontFamily,
                      color:
                        colors.screen_componente_estilos
                          .color_texto_importante,
                    },
                  ]}
                >
                  Gs.{" "}
                  {Number(
                    registroPrincipal.TotalIngreso
                  ).toLocaleString("es-ES")}
                </Text>
              </View>
  
  
            </View>
  
            {/* <View style={[
                styles.heroMeta,
                {
                  borderTopColor:
                    colors.screen_componente_estilos.color_fondo,
                },
              ]}>
                <Text>
                   {registroPrincipal.Observacion}
                </Text>
  
            </View> */}
            <View style={[styles.observacionContainer,{borderTopColor: colors.screen_componente_estilos.color_fondo}]}>
                <Text
                  style={[
                    styles.observacionLabel,
                    {
                      fontFamily: fonts.balsamiqregular.fontFamily,
                      color: colors.screen_componente_estilos.color_texto_subtitulo,
                    },
                  ]}
                >
                  TIPO INGRESO:
                </Text>
                <View
                  style={[
                    styles.observacionBubble,
                    {
                      backgroundColor: colors.screen_componente_estilos.color_fondo,
                      borderColor: colors.screen_componente_estilos.color_borde_cards || '#2a2f45',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.observacionText,
                      {
                        fontFamily: fonts.balsamiqregular.fontFamily,
                        color: colors.screen_componente_estilos.color_texto,
                      },
                    ]}
                  >
                    {registroPrincipal.NombreTipoIngreso || "Sin observación"}
                  </Text>
                </View>
            </View>
  
            <View style={[styles.observacionContainer,{borderTopColor: colors.screen_componente_estilos.color_fondo}]}>
                <Text
                  style={[
                    styles.observacionLabel,
                    {
                      fontFamily: fonts.balsamiqregular.fontFamily,
                      color: colors.screen_componente_estilos.color_texto_subtitulo,
                    },
                  ]}
                >
                  OBSERVACIÓN
                </Text>
                <View
                  style={[
                    styles.observacionBubble,
                    {
                      backgroundColor: colors.screen_componente_estilos.color_fondo,
                      borderColor: colors.screen_componente_estilos.color_borde_cards || '#2a2f45',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.observacionText,
                      {
                        fontFamily: fonts.balsamiqregular.fontFamily,
                        color: colors.screen_componente_estilos.color_texto,
                      },
                    ]}
                  >
                    {registroPrincipal.Observacion || "Sin observación"}
                  </Text>
                </View>
            </View>
  
  
          </View>
  
        
  
          
          {/* Espacio inferior para scroll cómodo */}
          <View style={{ height: 24 }} />
        </ScrollView>
  
       
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  // ── HERO ──────────────────────────────────────────
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroTop: {
    marginBottom: 4,
    alignItems: 'center',
    
  },
  nombreRegistro: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  idBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  idText: {
    fontSize: 12,
    letterSpacing: 0.5,

  },
  fechaRegistro: {
    fontSize: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  heroMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 20,
  },
  sinDatosContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 32,
  gap: 8,
},
sinDatosTexto: {
  fontSize: 14,
  textAlign: 'center',
},

  // ── CARDS / TABLA ─────────────────────────────────
  cardsContainer: {
    padding: 14,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  cardTitle: {
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  observacionContainer: {
  marginTop: 18,
  paddingTop: 14,
  borderTopWidth: 1,
  
},
observacionLabel: {
  fontSize: 10,
  letterSpacing: 0.8,
  marginBottom: 8,
},
observacionBubble: {
  minHeight: 50,
  width: '100%',
  padding: 10,
  borderRadius: 16,
  borderWidth: 1,
  justifyContent: 'center',
},
observacionText: {
  fontSize: 14,
  lineHeight: 15,
  textAlign: 'left',
},


});