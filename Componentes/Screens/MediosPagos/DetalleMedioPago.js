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
import Alerta from "../../Procesando/Alerta";

import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function DetalleMedioPago({ navigation }) {
  const { colors, fonts } = useTheme();

  // ── Estados genéricos ─────────────────────────────
  const [registroPrincipal, setRegistroPrincipal] = useState({});
  
  const [modalVisible, setModalVisible] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

  const {
    estadocomponente,
    actualizarEstadocomponente,
    asignar_opciones_alerta,
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
    const IdMedio = item.Id;
    //const IdCategoria = 0;
    navigation.navigate("RegistroMedioPago", { IdMedio });
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
    setMensajeConfirmacion(`Desea eliminar el medio de pago con ID ${id_del}?`);
    setMostrarConfirmacion(true);
  };

  const eliminarRegistro = async () => {
    const id_del = registroPrincipal.Id;
    actualizarEstadocomponente("tituloloading", "Eliminando MedioPago..");
    actualizarEstadocomponente("loading", true);

    const endpoint = `ref/OperacionesMediosPagosUser/${id_del}/`;
    const metodo = "DELETE";
    const result = await apiRequest(endpoint, metodo, {});

    if (result.sessionExpired) {
      actualizarEstadocomponente("tituloloading", "");
      actualizarEstadocomponente("loading", false);
      return;
    }

    if (result.resp_correcta) {
      const nuevo = !estadocomponente.bandera_registro_medio_pago;
      const mensajeExito = "Categoria Eliminada";
      asignar_opciones_alerta(
        false,
        "REGISTRO MEDIOS PAGOS",
        mensajeExito,
        "TabBasicosGroup",
        "MediosPagos",
        "bandera_registro_medio_pago",
        nuevo
      );
      actualizarEstadocomponente("alerta_estado", true);
    } else {
      const msj = result.data?.message || "Error en la solicitud";
      asignar_opciones_alerta(
        true,
        "ERROR",
        msj,
        "Medios",
        "bandera_registro_medio_pago",
        false
      );
      actualizarEstadocomponente("alerta_estado", true);
    }

    actualizarEstadocomponente("tituloloading", "");
    actualizarEstadocomponente("loading", false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setRegistroPrincipal(item);
      
    });
    return unsubscribe;
  }, [navigation, item]);

  useEffect(() => {
    if (confirmarEliminacion) {
      eliminarRegistro();
    }
  }, [confirmarEliminacion]);

  

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.screen_componente_estilos.color_fondo,
      }}
    >
      {estadocomponente.alerta_estado && <Alerta />}

      {mostrarConfirmacion && (
        <Confirmacion
          title="Detalle Medio Pago"
          question={mensajeConfirmacion}
          navigation={navigation}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}

      <CabaceraRegistros
        title={`Detalle Medio Pago`}
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
              {registroPrincipal.NombreMedioPago}
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
                {registroPrincipal.CantidadPagoMedio ?? 0}
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
                  registroPrincipal.TotalPagoMedio
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
  fontSize: 12,
  lineHeight: 15,
  textAlign: 'left',
},


});