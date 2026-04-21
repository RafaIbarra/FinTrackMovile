import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
// ── Datos en duro ────────────────────────────────────────────────────────────
const DATA_INGRESOS = [
  { x: "Sem 1", y: 2600 },
  { x: "Sem 2", y: 1000 },
  { x: "Sem 3", y: 2100 },
  { x: "Sem 4", y: 2000 },
];

const DATA_GASTOS = [
  { x: "Sem 1", y: 1200 },
  { x: "Sem 2", y: 800 },
  { x: "Sem 3", y: 900 },
  { x: "Sem 4", y: 900 },
];

const TRANSACCIONES = [
  { id: 1, nombre: "Shopping",  fecha: "30 Abr 2025", monto: -1550, color: "#f97316" },
  { id: 2, nombre: "Laptop",    fecha: "28 Abr 2025", monto: -1200, color: "#8b5cf6" },
  { id: 3, nombre: "Salario",   fecha: "25 Abr 2025", monto: 5000,  color: "#22c55e" },
  { id: 4, nombre: "Freelance", fecha: "20 Abr 2025", monto: 3500,  color: "#3b82f6" },
];

// ── Colores ───────────────────────────────────────────────────────────────────
const C = {
  fondo:        "#f8f7ff",
  cardIngresos: "#f0eeff",
  cardGastos:   "#fff0ee",
  barraIngreso: "#7c3aed",
  barraGasto:   "#f97316",
  texto:        "#1a1a2e",
  subtexto:     "#9090a0",
  tabActivo:    "#f97316",
  tabInactivo:  "#f0eeff",
  tabTextoAct:  "#fff",
  tabTextoInac: "#7c3aed",
};

export default function GraficaOverview({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  const [tabActiva, setTabActiva] = useState("gastos");

  const totalIngresos = DATA_INGRESOS.reduce((a, b) => a + b.y, 0);
  const totalGastos   = DATA_GASTOS.reduce((a, b) => a + b.y, 0);

  return (
    <ScrollView style={[styles.scroll]} contentContainerStyle={styles.contenido}>

      {/* TÍTULO */}
      <Text style={styles.titulo}>Overview</Text>
      <Text style={styles.periodo}>Abr 01 – Abr 30</Text>

      {/* CARDS RESUMEN */}
      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: C.cardIngresos }]}>
          <Text style={[styles.cardLabel, { color: C.subtexto }]}>Total Ingresos</Text>
          <View style={styles.cardRow}>
            <View style={[styles.cardIcono, { backgroundColor: C.barraIngreso }]}>
              <Text style={styles.cardIconoText}>↓</Text>
            </View>
            <Text style={[styles.cardMonto, { color: C.texto }]}>
              Gs. {totalIngresos.toLocaleString("es-ES")}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: C.cardGastos }]}>
          <Text style={[styles.cardLabel, { color: C.subtexto }]}>Total Gastos</Text>
          <View style={styles.cardRow}>
            <View style={[styles.cardIcono, { backgroundColor: C.barraGasto }]}>
              <Text style={styles.cardIconoText}>↑</Text>
            </View>
            <Text style={[styles.cardMonto, { color: C.texto }]}>
              Gs. {totalGastos.toLocaleString("es-ES")}
            </Text>
          </View>
        </View>
      </View>

      {/* GRÁFICA */}
      <Text style={styles.subtitulo}>Estadísticas</Text>
      <View style={styles.graficaWrap}>
        <VictoryChart
          width={340}
          height={220}
          domainPadding={{ x: 30 }}
          theme={VictoryTheme.clean}
          padding={{ top: 10, bottom: 40, left: 50, right: 20 }}
          
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: { fontSize: 11, fill: C.subtexto, fontFamily: "System" },
              grid: { stroke: "transparent" },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t / 1000}k`}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: { fontSize: 11, fill: C.subtexto, fontFamily: "System" },
              grid: { stroke: "#e8e8f0", strokeDasharray: "4,4" },
            }}
          />
          <VictoryGroup offset={14} colorScale={[C.barraIngreso, C.barraGasto]}>
            <VictoryBar
              data={DATA_INGRESOS}
              cornerRadius={{ top: 5 }}
              barWidth={12}
            />
            <VictoryBar
              data={DATA_GASTOS}
              cornerRadius={{ top: 5 }}
              barWidth={12}
            />
          </VictoryGroup>
        </VictoryChart>

        {/* Leyenda */}
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: C.barraIngreso }]} />
            <Text style={styles.leyendaText}>Ingresos</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: C.barraGasto }]} />
            <Text style={styles.leyendaText}>Gastos</Text>
          </View>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: tabActiva === "ingresos" ? C.tabActivo : C.tabInactivo }]}
          onPress={() => setTabActiva("ingresos")}
        >
          <Text style={[styles.tabText, { color: tabActiva === "ingresos" ? C.tabTextoAct : C.tabTextoInac }]}>
            Ingresos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: tabActiva === "gastos" ? C.tabActivo : C.tabInactivo }]}
          onPress={() => setTabActiva("gastos")}
        >
          <Text style={[styles.tabText, { color: tabActiva === "gastos" ? C.tabTextoAct : C.tabTextoInac }]}>
            Gastos
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA TRANSACCIONES */}
      {TRANSACCIONES
        .filter(t => tabActiva === "ingresos" ? t.monto > 0 : t.monto < 0)
        .map(t => (
          <View key={t.id} style={styles.transaccionRow}>
            <View style={[styles.transaccionIcono, { backgroundColor: t.color + "22" }]}>
              <Text style={{ fontSize: 18 }}>{t.monto > 0 ? "💰" : "🛒"}</Text>
            </View>
            <View style={styles.transaccionInfo}>
              <Text style={styles.transaccionNombre}>{t.nombre}</Text>
              <Text style={styles.transaccionFecha}>{t.fecha}</Text>
            </View>
            <Text style={[styles.transaccionMonto, { color: t.monto > 0 ? "#22c55e" : "#ef4444" }]}>
              {t.monto > 0 ? "+" : ""}Gs. {Math.abs(t.monto).toLocaleString("es-ES")}
            </Text>
          </View>
        ))
      }

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: C.fondo,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.texto,
    textAlign: "center",
    marginBottom: 2,
  },
  periodo: {
    fontSize: 12,
    color: C.subtexto,
    textAlign: "center",
    marginBottom: 20,
  },

  // Cards
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardIcono: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cardMonto: {
    fontSize: 13,
    fontWeight: "bold",
    flexShrink: 1,
  },

  // Gráfica
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.texto,
    marginBottom: 4,
  },
  graficaWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  leyenda: {
    flexDirection: "row",
    gap: 20,
    marginTop: -8,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaText: {
    fontSize: 11,
    color: C.subtexto,
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    backgroundColor: C.cardIngresos,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Transacciones
  transaccionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0ee",
    gap: 12,
  },
  transaccionIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionNombre: {
    fontSize: 14,
    fontWeight: "600",
    color: C.texto,
  },
  transaccionFecha: {
    fontSize: 11,
    color: C.subtexto,
    marginTop: 2,
  },
  transaccionMonto: {
    fontSize: 14,
    fontWeight: "bold",
  },
});