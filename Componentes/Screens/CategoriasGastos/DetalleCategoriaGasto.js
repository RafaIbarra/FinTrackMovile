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

import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
import CabaceraRegistros from "../../CabeceraRegistros/CabaceraRegistros";
import Confirmacion from "../../Procesando/Confirmacion";
import Alerta from "../../Procesando/Alerta";

import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function DetalleCategoriaGasto({ navigation }) {
  const { colors, fonts } = useTheme();

  // ── Estados genéricos ─────────────────────────────
  const [registroPrincipal, setRegistroPrincipal] = useState({});
  const [listaDetalles, setListaDetalles] = useState([]);
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
    const IdCategoria = item.Id;
    //const IdCategoria = 0;
    navigation.navigate("RegistroCategoria", { IdCategoria });
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
    setMensajeConfirmacion(`Desea eliminar la categoria con ID ${id_del}?`);
    setMostrarConfirmacion(true);
  };

  const eliminarRegistro = async () => {
    const id_del = registroPrincipal.Id;
    actualizarEstadocomponente("tituloloading", "Eliminando Categoria..");
    actualizarEstadocomponente("loading", true);

    const endpoint = `ref/OperacionesCategoriasGastosUser/${id_del}/`;
    const metodo = "DELETE";
    const result = await apiRequest(endpoint, metodo, {});

    if (result.sessionExpired) {
      actualizarEstadocomponente("tituloloading", "");
      actualizarEstadocomponente("loading", false);
      return;
    }

    if (result.resp_correcta) {
      const nuevo = !estadocomponente.bandera_registro_categoria;
      const mensajeExito = "Categoria Eliminada";
      asignar_opciones_alerta(
        false,
        "REGISTRO CATEGORIAS",
        mensajeExito,
        "TabBasicosGroup",
        "Categorias",
        "bandera_registro_categoria",
        nuevo
      );
      actualizarEstadocomponente("alerta_estado", true);
    } else {
      const msj = result.data?.message || "Error en la solicitud";
      asignar_opciones_alerta(
        true,
        "ERROR",
        msj,
        "Gastos",
        "bandera_registro_gasto",
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
      setListaDetalles(item?.DetalleGastos || []);
    });
    return unsubscribe;
  }, [navigation, item]);

  useEffect(() => {
    if (confirmarEliminacion) {
      eliminarRegistro();
    }
  }, [confirmarEliminacion]);

  const tieneComprobante = !!registroPrincipal.UrlImg;

  // ── Anchos de columna para la tabla ───────────────
  const COL_ID = 45;
  const COL_NOMBRE = 130;
  const COL_TOTAL = 110;
  const COL_CANT = 90;
  const COL_PORC = 80;

  const renderTablaHeader = () => (
    <View
      style={[
        styles.tablaRow,
        styles.tablaHeader,
        {
          borderBottomColor:
            colors.screen_componente_estilos.color_texto_subtitulo,
        },
      ]}
    >
      <Text
        style={[
          styles.tablaHeaderText,
          { width: COL_ID, fontFamily: fonts.balsamiqbold.fontFamily },
        ]}
      >
        ID
      </Text>
      <Text
        style={[
          styles.tablaHeaderText,
          {
            width: COL_NOMBRE,
            textAlign: "left",
            fontFamily: fonts.balsamiqbold.fontFamily,
          },
        ]}
      >
        CONCEPTO
      </Text>
      <Text
        style={[
          styles.tablaHeaderText,
          {
            width: COL_TOTAL,
            textAlign: "right",
            fontFamily: fonts.balsamiqbold.fontFamily,
          },
        ]}
      >
        TOTAL
      </Text>
      <Text
        style={[
          styles.tablaHeaderText,
          {
            width: COL_CANT,
            textAlign: "center",
            fontFamily: fonts.balsamiqbold.fontFamily,
          },
        ]}
      >
        CANT.
      </Text>
      <Text
        style={[
          styles.tablaHeaderText,
          {
            width: COL_PORC,
            textAlign: "right",
            fontFamily: fonts.balsamiqbold.fontFamily,
          },
        ]}
      >
        %
      </Text>
    </View>
  );

  const renderTablaFila = (fila, idx) => (
    <View
      key={fila.Id ?? idx}
      style={[
        styles.tablaRow,
        {
          borderBottomColor: colors.screen_componente_estilos.color_fondo,
        },
        idx === listaDetalles.length - 1 && { borderBottomWidth: 0 },
      ]}
    >
      <Text
        style={[
          styles.tablaCell,
          {
            width: COL_ID,
            fontFamily: fonts.balsamiqregular.fontFamily,
            color: colors.screen_componente_estilos.color_texto_subtitulo,
          },
        ]}
      >
        {fila.Id}
      </Text>
      <Text
        style={[
          styles.tablaCell,
          {
            width: COL_NOMBRE,
            textAlign: "left",
            fontFamily: fonts.balsamiqregular.fontFamily,
            color: colors.screen_componente_estilos.color_texto,
          },
        ]}
      >
        {fila.NombreGasto}
      </Text>
      <Text
        style={[
          styles.tablaCell,
          {
            width: COL_TOTAL,
            textAlign: "right",
            fontFamily: fonts.balsamiqbold.fontFamily,
            color: colors.screen_componente_estilos.color_texto,
          },
        ]}
      >
        Gs. {Number(fila.TotalConcepto).toLocaleString("es-ES")}
      </Text>
      <Text
        style={[
          styles.tablaCell,
          {
            width: COL_CANT,
            textAlign: "center",
            fontFamily: fonts.balsamiqregular.fontFamily,
            color: colors.screen_componente_estilos.color_texto_subtitulo,
          },
        ]}
      >
        {fila.CantidadRegistrosConcepto}
      </Text>
      <Text
        style={[
          styles.tablaCell,
          {
            width: COL_PORC,
            textAlign: "right",
            fontFamily: fonts.balsamiqbold.fontFamily,
            color: colors.screen_componente_estilos.color_texto_importante,
          },
        ]}
      >
        {fila.PorcentajeConcepto}%
      </Text>
    </View>
  );

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
          title="Detalle Categoria"
          question={mensajeConfirmacion}
          navigation={navigation}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}

      <CabaceraRegistros
        title={`Detalle de la categoria`}
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
                styles.nombreCategoria,
                {
                  fontFamily: fonts.balsamiqbold.fontFamily,
                  color: colors.screen_componente_estilos.color_texto,
                },
              ]}
            >
              {registroPrincipal.NombreCategoria}
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
            <View>
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
                CONCEPTOS
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
                {registroPrincipal.CantidadConceptoGastos ?? 0}
              </Text>
            </View>

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
                {registroPrincipal.CantidadGastosCategoria ?? 0}
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
                  registroPrincipal.TotalGastoCategoria
                ).toLocaleString("es-ES")}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            TABLA DE DETALLES — Scroll horizontal
        ═══════════════════════════════════════════════ */}

        {listaDetalles.length > 0 ? (
        <View style={styles.cardsContainer}>
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  colors.screen_componente_estilos.color_fondo_cards,
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                {
                  fontFamily: fonts.balsamiqbold.fontFamily,
                  color:
                    colors.screen_componente_estilos
                      .color_texto_subtitulo,
                },
              ]}
            >
              DETALLE DE CONCEPTOS
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={styles.tablaScrollContent}
            >
              <View style={styles.tablaWrapper}>
                {renderTablaHeader()}
                {listaDetalles.map((fila, idx) => renderTablaFila(fila, idx))}
              </View>
            </ScrollView>
          </View>
        </View>
        ):(
        <View style={styles.sinDatosContainer}>
        <MaterialCommunityIcons
          name="inbox-remove-outline"
          size={40}
          color={colors.screen_componente_estilos.color_texto_subtitulo}
        />
        <Text
          style={[
            styles.sinDatosTexto,
            {
              fontFamily: fonts.balsamiqregular.fontFamily,
              color: colors.screen_componente_estilos.color_texto_subtitulo,
            },
          ]}
        >
          Sin Gastos asociados
        </Text>
      </View>)
      }
        {/* Espacio inferior para scroll cómodo */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════
          MODAL COMPROBANTE (se mantiene la funcionalidad)
      ═══════════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor:
                  colors.screen_componente_estilos.color_fondo_cards,
              },
            ]}
          >
            <View
              style={[
                styles.modalHandle,
                {
                  backgroundColor:
                    colors.screen_componente_estilos.color_fondo,
                },
              ]}
            />
            <Text
              style={[
                styles.modalTitle,
                {
                  fontFamily: fonts.balsamiqbold.fontFamily,
                  color: colors.screen_componente_estilos.color_texto,
                },
              ]}
            >
              Comprobante
            </Text>
            {tieneComprobante && (
              <Image
                source={{ uri: registroPrincipal.UrlImg }}
                style={styles.comprobanteImg}
              />
            )}
            <TouchableOpacity
              style={[
                styles.cerrarBtn,
                {
                  borderColor:
                    colors.screen_componente_estilos.color_texto_importante,
                },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[
                  styles.cerrarBtnText,
                  {
                    fontFamily: fonts.balsamiqbold.fontFamily,
                    color:
                      colors.screen_componente_estilos
                        .color_texto_importante,
                  },
                ]}
              >
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  nombreCategoria: {
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

  // Tabla
  tablaScrollContent: {
    paddingBottom: 4,
  },
  tablaWrapper: {
    minWidth: "100%",
  },
  tablaHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 2,
  },
  tablaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  tablaHeaderText: {
    fontSize: 10,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  tablaCell: {
    fontSize: 12,
    textAlign: "center",
  },

  // ── MODAL ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  comprobanteImg: {
    width: "100%",
    height: 460,
    resizeMode: "contain",
  },
  cerrarBtn: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
    alignItems: "center",
  },
  cerrarBtnText: {
    fontSize: 14,
  },
});