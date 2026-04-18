import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";

export default function GastosDetalle({ navigation }) {
  const { fonts } = useTheme();
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
    <ScrollView style={styles.scroll} bounces={false}>

      {/* HERO */}
      <View style={styles.hero}>
        {/* Logo + Empresa */}
        <View style={styles.heroTop}>
          <View style={styles.logoWrap}>
            <LogoEmpresa imagePath={item.LogoEmpresa} />
          </View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={[styles.nombreEmpresa, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
              {datositem.NombreEmpresa}
            </Text>
            <Text style={[styles.fechaRegistro, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
              Reg. {datositem.FechaRegistro}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.heroTotal}>
          <Text style={[styles.heroTotalLabel, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
            TOTAL GASTO
          </Text>
          <Text style={[styles.heroTotalAmount, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
            Gs. {Number(datositem.TotalMovimiento).toLocaleString("es-ES")}
          </Text>
          <Text style={[styles.heroFechaGasto, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
            Gasto realizado el {datositem.FechaGasto}
          </Text>
        </View>
      </View>

      {/* TARJETAS */}
      <View style={styles.cardsContainer}>

        {/* CARD GASTOS */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
            DETALLE DE GASTOS
          </Text>
          {Object.keys(detallegastos).map((key, idx) => (
            <View key={key} style={[styles.cardRow, idx > 0 && styles.cardRowBorder]}>
              <Text style={[styles.cardRowLabel, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                {detallegastos[key].NombreGasto}
              </Text>
              <Text style={[styles.cardRowAmount, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
                Gs. {Number(detallegastos[key].MontoGasto).toLocaleString("es-ES")}
              </Text>
            </View>
          ))}
        </View>

        {/* CARD MEDIOS */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
            MEDIOS DE PAGO
          </Text>
          {Object.keys(detallemedios).map((key, idx) => (
            <View key={key} style={[styles.cardRow, idx > 0 && styles.cardRowBorder]}>
              <Text style={[styles.cardRowLabel, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
                {detallemedios[key].NombreMedioPago}
              </Text>
              <Text style={[styles.cardRowAmount, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
                Gs. {Number(detallemedios[key].MontoMedioPago).toLocaleString("es-ES")}
              </Text>
            </View>
          ))}
        </View>

        {/* BOTÓN COMPROBANTE */}
        {tieneComprobante && (
          <TouchableOpacity style={styles.comprobanteBtn} onPress={() => setModalVisible(true)}>
            <Text style={[styles.comprobanteBtnText, { fontFamily: fonts.balsamiqregular.fontFamily }]}>
              📎 Ver comprobante adjunto
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {/* MODAL IMAGEN COMPROBANTE */}
      {tieneComprobante && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { fontFamily: fonts.balsamiqbold.fontFamily }]}>
                Comprobante
              </Text>
              <ScrollView style={{ flex: 1 }}>
                <Image
                  source={{ uri: datositem.UrlImg }}
                  style={styles.comprobanteImg}
                  resizeMode="contain"
                />
              </ScrollView>
              <TouchableOpacity style={styles.cerrarBtn} onPress={() => setModalVisible(false)}>
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
  scroll: {
    flex: 1,
    backgroundColor: '#13161f',       // fondo negro azulado general
  },

  // ── HERO ──────────────────────────────────────────
  hero: {
    backgroundColor: '#1a1f2e',       // negro azulado más claro para el hero
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
    color: '#ffffff',
  },
  fechaRegistro: {
    fontSize: 11,
    color: '#8a8fa8',                 // gris azulado apagado
    marginTop: 3,
  },
  heroTotal: {
    alignItems: 'center',
  },
  heroTotalLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#8a8fa8',                 // gris apagado
  },
  heroTotalAmount: {
    fontSize: 34,
    color: '#3AB884',                 // verde brillante
    marginTop: 6,
  },
  heroFechaGasto: {
    fontSize: 12,
    color: '#8a8fa8',
    marginTop: 8,
  },

  // ── TARJETAS ──────────────────────────────────────
  cardsContainer: {
    padding: 14,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e2336',       // gris oscuro azulado para las tarjetas
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2a2f45',           // borde apenas visible
    padding: 14,
  },
  cardTitle: {
    fontSize: 10,
    letterSpacing: 1.1,
    color: '#8a8fa8',                 // gris apagado
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
    borderTopColor: '#2a2f45',
  },
  cardRowLabel: {
    fontSize: 13,
    color: '#ffffff',
  },
  cardRowAmount: {
    fontSize: 13,
    color: '#ffffff',
  },

  // ── BOTÓN COMPROBANTE ─────────────────────────────
  comprobanteBtn: {
    borderWidth: 0.5,
    borderColor: '#3AB884',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  comprobanteBtnText: {
    fontSize: 13,
    color: '#3AB884',
  },

  // ── MODAL ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e2336',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2a2f45',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  comprobanteImg: {
    width: '100%',
    height: 460,
  },
  cerrarBtn: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#3AB884',
  },
  cerrarBtnText: {
    color: '#fff',
    fontSize: 14,
  },
});