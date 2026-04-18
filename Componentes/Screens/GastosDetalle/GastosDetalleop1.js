import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";

export default function GastosDetalle({ navigation }) {
  const { colors, fonts } = useTheme();
  const [datositem, setDatositem] = useState({});
  const [detallegastos, setDetallegastos] = useState([]);
  const [detallemedios, setDetallemedios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { params: { item } } = useRoute();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setDatositem(item);
      setDetallegastos(item["DetalleGastos"] || []);
      setDetallemedios(item["DetalleMediosPagos"] || []);
    });
    return unsubscribe;
  }, [navigation]);

  const tieneComprobante = !!datositem.UrlImg;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.card}>

        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.logoWrap}>
            <LogoEmpresa imagePath={item.LogoEmpresa} />
          </View>
          <View style={styles.empresaInfo}>
            <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.text }]}>
              {datositem.NombreEmpresa}
            </Text>
            <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
              Reg. {datositem.FechaRegistro}
            </Text>
          </View>
          <View style={[styles.totalBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.totalLabel, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.primary }]}>
              Gs. {Number(datositem.TotalMovimiento).toLocaleString("es-ES")}
            </Text>
          </View>
        </View>

        {/* FECHA GASTO */}
        <View style={[styles.rowFecha, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowLabel, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
            Fecha gasto
          </Text>
          <Text style={[styles.rowValue, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.text }]}>
            {datositem.FechaGasto}
          </Text>
        </View>

        {/* SECCIÓN GASTOS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.textsub }]}>
            DETALLE DE GASTOS
          </Text>
          {Object.keys(detallegastos).map((key) => (
            <View key={key} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
                {detallegastos[key].NombreGasto}
              </Text>
              <Text style={[styles.rowValue, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.text }]}>
                Gs. {Number(detallegastos[key].MontoGasto).toLocaleString("es-ES")}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* SECCIÓN MEDIOS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.textsub }]}>
            MEDIOS DE PAGO
          </Text>
          {Object.keys(detallemedios).map((key) => (
            <View key={key} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.textsub }]}>
                {detallemedios[key].NombreMedioPago}
              </Text>
              <Text style={[styles.rowValue, { fontFamily: fonts.balsamiqbold.fontFamily, color: colors.text }]}>
                Gs. {Number(detallemedios[key].MontoMedioPago).toLocaleString("es-ES")}
              </Text>
            </View>
          ))}
        </View>

        {/* BOTÓN COMPROBANTE (solo si existe URL) */}
        {tieneComprobante && (
          <TouchableOpacity
            style={[styles.comprobanteBtn, { borderColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.comprobanteBtnText, { fontFamily: fonts.balsamiqregular.fontFamily, color: colors.primary }]}>
              📎 Ver comprobante adjunto
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL IMAGEN COMPROBANTE */}
      {tieneComprobante && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: datositem.UrlImg }}
                style={styles.comprobanteImg}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={[styles.cerrarBtn, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cerrarBtnText, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  logoWrap: { flexShrink: 0 },
  empresaInfo: { flex: 1, paddingHorizontal: 8 },
  nombreEmpresa: { fontSize: 13 },
  fechaRegistro: { fontSize: 11, marginTop: 2 },
  totalBadge: {
    borderRadius: 10,
    padding: 8,
    alignItems: "flex-end",
  },
  totalLabel: { fontSize: 10 },
  totalAmount: { fontSize: 13, marginTop: 2 },
  rowFecha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 12 },
  divider: { height: 0.5, marginHorizontal: 16 },
  comprobanteBtn: {
    margin: 16,
    marginTop: 8,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  comprobanteBtnText: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  comprobanteImg: { width: "100%", height: 500 },
  cerrarBtn: {
    padding: 14,
    alignItems: "center",
  },
  cerrarBtnText: { color: "#fff", fontSize: 14 },
});