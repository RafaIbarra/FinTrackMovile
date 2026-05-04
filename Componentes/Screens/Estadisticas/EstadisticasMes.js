import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { Surface } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';
import Handelstorage from '../../../Storage/HandelStorage';
import { useApi } from '../../../Apis/useApi';
import Alerta from '../../Procesando/Alerta';
import Switch from '../../Switch/Switch';
import SegmentedToggle from '../../Switch/SegmentedToggle';
// Victory Native (legacy - basado en SVG, funciona en Expo Go)
import {
    VictoryPie,
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryScatter,
    VictoryTheme,
    VictoryLabel,
    VictoryGroup,
    VictoryTooltip,
    VictoryContainer
} from "victory-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EstadisticasMes({ navigation }) {
    const { colors, fonts } = useTheme();
    const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
    const { asignar_opciones_alerta } = useContext(AuthContext);
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { reiniciarvalores } = useContext(AuthContext);
    const { sesiondatadate } = useContext(AuthContext);
    const [ready, setReady] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [leyendacategoria, setLeyendacategoria] = useState(false);
    const [leyendaconceptos, setLeyendaconceptos] = useState(false);
    const [leyendamedios, setLeyendamedios] = useState(false);
    const [leyendasemana, setLeyendasemana] = useState(false);

    const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });

    const estilos = {
        font_normal: fonts.balsamiqregular.fontFamily,
        font_negrita: fonts.balsamiqbold.fontFamily,
        font_color: colors.screen_componente_estilos.color_texto,
        font_importe_color: colors.screen_componente_estilos.color_texto_importante,
        font_sub_color: colors.screen_componente_estilos.color_texto_subtitulo,
        pantalla_color_fondo: colors.screen_componente_estilos.color_fondo,
        cards_color_fondo: colors.screen_componente_estilos.color_fondo_cards,
        cards_color_border: colors.screen_componente_estilos.color_borde_cards,
        boton_color_fondo: colors.screen_componente_estilos.color_fondo_botones,
        boton_color_borde: colors.screen_componente_estilos.color_borde_botones,
    };

    const CHART_COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#6C5CE7', '#A29BFE', '#FD79A8'
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }).format(value);
    };

    const cargardatos = async () => {
        setReady(false);
        actualizarEstadocomponente('tituloloading', 'CARGANDO ESTADISTICAS');
        actualizarEstadocomponente('loading', true);
        const anno_storage = sesiondatadate.dataanno;
        const mes_storage = sesiondatadate.datames;
        const endpoint = `analitic/EstadisticaMes/${anno_storage}/${mes_storage}/`;

        const result = await apiRequest(endpoint, 'GET', {});
        
        
        if (result.sessionExpired) return;
        
        if (result.resp_correcta) {
            
            setStatsData(result.data);
        } else {
            const msj = result.data?.message || 'Error en la solicitud';
            asignar_opciones_alerta(true, 'ERROR', msj, 'Gastos', 'bandera_registro_gasto', false);
            actualizarEstadocomponente('alerta_estado', true);
        }
        actualizarEstadocomponente('tituloloading', '');
        actualizarEstadocomponente('loading', false);
        setReady(true);
    };

    useEffect(() => {
        cargardatos();
    }, [estadocomponente.bandera_registro_gasto, estadocomponente.bandera_registro_ingreso]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            actualizarEstadocomponente('ComponenteActivoBottonTab', 'EstadisticasMes');
        });
        return unsubscribe;
    }, []);

    // ==========================================
    // PREPARACIÓN DE DATOS
    // ==========================================

    // 1. ResultadoDelMes -> Pie Chart
    const resultadoMesPieData = useMemo(() => {
        if (!statsData?.ResultadoDelMes) return [];
        const { TotalGasto, TotalIngreso, Resultado } = statsData.ResultadoDelMes;
        return [
            { x: "Gastos", y: TotalGasto, label: `Gastos\n${formatCurrency(TotalGasto)}` },
            { x: "Ingresos", y: TotalIngreso, label: `Ingresos\n${formatCurrency(TotalIngreso)}` },
            // { x: "Resultado", y: Resultado, label: `Resultado\n${formatCurrency(Resultado)}` },
        ];
    }, [statsData]);

    // 2. GastosPorCategoria -> Bar Chart Horizontal
    const gastosCategoriaData = useMemo(() => {
        if (!statsData?.GastosPorCategoria) return [];
        return statsData.GastosPorCategoria.map((item, index) => ({
            x: item.CategoriaGasto,
            y: item.TotalCategoria,
            label: `${item.Porcentaje}%`,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [statsData]);

    // 3. GastosPorConceptos -> Bar Chart Horizontal
    const gastosConceptosData = useMemo(() => {
        if (!statsData?.GastosPorConceptos) return [];
        return statsData.GastosPorConceptos.map((item, index) => ({
            x: item.ConceptGasto,
            y: item.TotalConcepto,
            label: `${item.Porcentaje}%`,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [statsData]);

    // 4. ResumenMediosDePagos -> Bar Chart Vertical
    const mediosPagoData = useMemo(() => {
        if (!statsData?.ResumenMediosDePagos) return [];
        return statsData.ResumenMediosDePagos.map((item, index) => ({
            x: item.MedioPago,
            y: item.TotalMedioPago,
            label: `${item.Porcentaje}%`,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [statsData]);

    // 5. GastosSemana -> Scatter Plot
    const gastosSemanaData = useMemo(() => {
        if (!statsData?.GastosSemana) return [];
        return statsData.GastosSemana
            // .filter(item => item.TotalSemana > 0)
            .map((item, index) => ({
                x: item.NumeroSemana,
                y: item.TotalSemana,
                size: item.CantidadGastos + 5,
                label: item.Leyenda,
                fill: CHART_COLORS[index % CHART_COLORS.length]
            }));
        
    }, [statsData]);

    // 6. ConceptoIngresos -> Pie Chart
    const conceptosIngresosPieData = useMemo(() => {
        if (!statsData?.ConceptoIngresos) return [];
        return statsData.ConceptoIngresos.map((item, index) => ({
            x: item.NombreIngreso,
            y: item.TotalIngreso,
            label: `${item.NombreIngreso}\n${formatCurrency(item.TotalIngreso)}`,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [statsData]);

    const formatAxisTick = (value) => {
        if (value <= 0) return '0';
        if (value >= 1_000_000) {
            const millions = value / 1_000_000;
            // Si es entero o muy cercano (por decimales flotantes)
            if (Math.abs(millions - Math.round(millions)) < 0.01) {
                return `${Math.round(millions)}M`;
            }
            return `${millions.toFixed(1)}M`;
        }
        if (value >= 100_000) {
            return `${Math.round(value / 1_000)}k`;
        }
        // Menos de 100.000
        return value.toLocaleString('es-ES');
    };

    if (!ready || !statsData) {
        return (
            <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_color }}>
                    Cargando estadísticas...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo }}>
            {estadocomponente.alerta_estado && <Alerta />}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* TÍTULO */}
                {/* <Text style={[styles.titulo, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                    Estadísticas del Mes
                </Text>
                <Text style={[styles.subtitulo, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                    {sesiondatadate.datames}/{sesiondatadate.dataanno}
                </Text> */}

                {/* ========================================== */}
                {/* 1. RESULTADO DEL MES - PIE CHART           */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Resumen del Mes
                    </Text>
                    
                    <VictoryPie
                        data={resultadoMesPieData}
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        innerRadius={2}
                        padAngle={2}
                        cornerRadius={6}
                        colorScale={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                        style={{
                            labels: { 
                                fill: estilos.font_color, 
                                fontSize: 11, 
                                fontFamily: estilos.font_normal 
                            },
                            data: { stroke: estilos.cards_color_fondo, strokeWidth: 2 }
                        }}
                        labelComponent={
                            <VictoryLabel 
                                style={[{ fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }]} 
                            />
                        }
                    />

                    <View style={styles.resumenRow}>
                        <View style={styles.resumenItem}>
                            <Text style={[styles.resumenLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                Gastos
                            </Text>
                            <Text style={[styles.resumenValue, { fontFamily: estilos.font_negrita, color: '#FF6B6B' }]}>
                                {statsData.ResultadoDelMes.cantidadGasto} regs
                            </Text>
                            <Text style={[styles.resumenMonto, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(statsData.ResultadoDelMes.TotalGasto)}
                            </Text>
                        </View>
                        <View style={styles.resumenItem}>
                            <Text style={[styles.resumenLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                Ingresos
                            </Text>
                            <Text style={[styles.resumenValue, { fontFamily: estilos.font_negrita, color: '#4ECDC4' }]}>
                                {statsData.ResultadoDelMes.CantidadIngreso} regs
                            </Text>
                            <Text style={[styles.resumenMonto, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(statsData.ResultadoDelMes.TotalIngreso)}
                            </Text>
                        </View>
                        <View style={styles.resumenItem}>
                            <Text style={[styles.resumenLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                % Utilizado
                            </Text>
                            <Text style={[styles.resumenValue, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {statsData.ResultadoDelMes.PorcentajeUtilizado}%
                            </Text>
                            <Text style={[styles.resumenMonto, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(statsData.ResultadoDelMes.Resultado)}
                            </Text>
                        </View>
                    </View>
                </Surface>

                {/* ========================================== */}
                {/* 2. GASTOS POR CATEGORÍA - BARRAS HORIZONTALES */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Gastos por Categoría
                    </Text>
                    
                    <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 20, y: 20 }}
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        <VictoryAxis
                            dependentAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal },
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.5 }
                            }}
                            // tickFormat={(t) => `${(t / 1000).toFixed(0)}k`}
                            tickFormat={formatAxisTick}
                        />
                        <VictoryAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }
                            }}
                        />
                        <VictoryBar
                            horizontal
                            data={gastosCategoriaData}
                            style={{
                                data: { fill: ({ datum }) => datum.fill }
                            }}
                            labels={({ datum }) => formatCurrency(datum.y)}
                            labelComponent={
                                <VictoryLabel 
                                    dx={5} 
                                    style={[{ fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }]} 
                                />
                            }
                        />
                    </VictoryChart>
                    
                    <SegmentedToggle 
                        textoactivo='Ver leyenda'
                        textoinactivo='Ocultar leyenda'
                        value={leyendacategoria} 
                        onValueChange={setLeyendacategoria

                        }/>
                        { leyendacategoria && statsData.GastosPorCategoria.map((item, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <View style={styles.listItemLeft}>
                                <View style={[styles.listBullet, { backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }]} />
                                <Text style={[styles.listText, { fontFamily: estilos.font_normal, color: estilos.font_color }]}>
                                    {item.CategoriaGasto}
                                </Text>
                            </View>
                            <Text style={[styles.listValue, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(item.TotalCategoria)} ({item.Porcentaje}%)
                            </Text>
                        </View>
                    ))}
                        
                    
                </Surface>

                {/* ========================================== */}
                {/* 3. GASTOS POR CONCEPTOS - BARRAS HORIZONTALES */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border,overflow: 'visible'  }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Gastos por Conceptos
                    </Text>
                    
                    <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={280}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 20, y: 20 }}
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        <VictoryAxis
                            dependentAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal },
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.5 }
                            }}
                            tickFormat={formatAxisTick}
                        />
                        <VictoryAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 9, fontFamily: estilos.font_normal, angle: -30 }
                            }}
                        />
                        <VictoryBar
                            horizontal
                            data={gastosConceptosData}
                            style={{
                                data: { fill: ({ datum }) => datum.fill }
                            }}
                            labels={({ datum }) => `${datum.label}`}
                            labelComponent={
                                <VictoryLabel 
                                    dx={5} 
                                    style={[{ fill: estilos.font_color, fontSize: 9, fontFamily: estilos.font_normal }]} 
                                />
                            }
                        />
                    </VictoryChart>
                    <SegmentedToggle 
                        textoactivo='Ver leyenda'
                        textoinactivo='Ocultar leyenda'
                        value={leyendaconceptos} 
                        onValueChange={setLeyendaconceptos

                        }/>
                    { leyendaconceptos && statsData.GastosPorConceptos.map((item, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <View style={styles.listItemLeft}>
                                <View style={[styles.listBullet, { backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }]} />
                                <Text style={[styles.listText, { fontFamily: estilos.font_normal, color: estilos.font_color }]}>
                                    {item.ConceptGasto}
                                </Text>
                            </View>
                            <View style={styles.listItemRight}>
                                <Text style={[styles.listValue, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                    {formatCurrency(item.TotalConcepto)}
                                </Text>
                                <Text style={[styles.listSub, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    {item.CantidadConcepto} ops - {item.Porcentaje}%
                                </Text>
                            </View>
                        </View>
                    ))}
                    
                </Surface>

                {/* ========================================== */}
                {/* 4. RESUMEN MEDIOS DE PAGO - BARRAS VERTICALES */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Medios de Pago
                    </Text>
                    {/* <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 40, y: 20 }}
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        <VictoryAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal, angle: -30 },
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.2 } // Agrega esto para líneas verticales
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            style={{
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.2 } // Agrega esto para líneas horizontales
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            label="Monto"
                            style={{
                                axisLabel: { fill: estilos.font_sub_color, fontSize: 12, fontFamily: estilos.font_normal, padding: 40 },
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }
                            }}
                            // tickFormat={(t) => `${(t / 1000).toFixed(0)}k`}
                            tickFormat={formatAxisTick}
                        />
                        <VictoryBar
                            data={mediosPagoData}
                            style={{
                                data: { fill: ({ datum }) => datum.fill }
                            }}
                            // labels={({ datum }) => `${datum.label}`}
                            // labelComponent={
                            //     <VictoryLabel 
                            //         dy={-5} 
                            //         style={[{ fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }]} 
                            //     />
                            // }
                        />
                    </VictoryChart> */}
                    <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 40, y: 20 }}
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        {/* Eje X (categorías) */}
                        <VictoryAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal, angle: -30 },
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.2 }
                            }}
                        />

                        {/* Único eje Y (dependiente) */}
                        <VictoryAxis
                            dependentAxis
                            label="Monto"
                            style={{
                                axisLabel: { fill: estilos.font_sub_color, fontSize: 12, fontFamily: estilos.font_normal, padding: 40 },
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal },
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.2 }
                            }}
                            tickFormat={formatAxisTick}
                        />

                        <VictoryBar
                            data={mediosPagoData}
                            style={{
                                data: { fill: ({ datum }) => datum.fill }
                            }}
                            labels={({ datum }) => `${datum.label}`}
                            labelComponent={
                                <VictoryLabel 
                                    dx={5} 
                                    style={[{ fill: estilos.font_color, fontSize: 9, fontFamily: estilos.font_normal }]} 
                                />
                            }
                        />
                    </VictoryChart>
                    
                    {/* <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 40, y: 20 }}
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        
                        <VictoryAxis
                            style={{
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal, angle: -30 }
                            }}
                        />
                        <VictoryBar
                            data={mediosPagoData}
                            style={{
                                data: { fill: ({ datum }) => datum.fill }
                            }}
                            labels={({ datum }) => `${datum.label}`}
                            labelComponent={
                                <VictoryLabel 
                                    dy={-5} 
                                    style={[{ fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }]} 
                                />
                            }
                        />
                    </VictoryChart> */}
                    <SegmentedToggle 
                        textoactivo='Ver leyenda'
                        textoinactivo='Ocultar leyenda'
                        value={leyendamedios} 
                        onValueChange={setLeyendamedios

                        }/>
                    {leyendamedios && 
                        
                        <View style={styles.mediosGrid}>
                            {statsData.ResumenMediosDePagos.map((item, idx) => (
                                <View key={idx} style={styles.medioItem}>
                                    <Text style={[styles.medioLabel, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                                        {item.MedioPago}
                                    </Text>
                                    <Text style={[styles.medioValue, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                        {formatCurrency(item.TotalMedioPago)}
                                    </Text>
                                    <Text style={[styles.medioSub, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                        {item.Cantidad} transacciones • {item.Porcentaje}%
                                    </Text>
                                    <View style={styles.medioBarContainer}>
                                        <View style={[styles.medioBar, { width: `${item.Porcentaje}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                        
                    }
                </Surface>

                {/* ========================================== */}
                {/* 5. GASTOS POR SEMANA - SCATTER PLOT        */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Gastos por Semana
                    </Text>
                    
                    <VictoryChart
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 30, y: 30 }}
                        
                        containerComponent={<VictoryContainer responsive={true} />}
                    >
                        <VictoryAxis
                            // label="Semana"
                            style={{
                                axisLabel: { fill: estilos.font_sub_color, fontSize: 12, fontFamily: estilos.font_normal, padding: 30,angle:-30 },
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal, angle:-90, padding: 20},
                                grid: { stroke: estilos.cards_color_border, strokeWidth: 0.5 }
                            }}
                            tickFormat={(t) => `Sem ${t}    `}
                        />
                        <VictoryAxis
                            dependentAxis
                            label="Monto"
                            style={{
                                axisLabel: { fill: estilos.font_sub_color, fontSize: 12, fontFamily: estilos.font_normal, padding: 40 },
                                tickLabels: { fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }
                            }}
                            // tickFormat={(t) => `${(t / 1000).toFixed(0)}k`}
                            tickFormat={formatAxisTick}
                        />
                        <VictoryScatter
                            data={gastosSemanaData}
                            size={({ datum }) => datum.size}
                            style={{
                                data: { fill: ({ datum }) => datum.fill, stroke: estilos.cards_color_fondo, strokeWidth: 2 }
                            }}
                            labels={({ datum }) => datum.label}
                            labelComponent={
                                <VictoryTooltip
                                    flyoutStyle={{ fill: estilos.cards_color_fondo, stroke: estilos.cards_color_border }}
                                    style={[{ fill: estilos.font_color, fontSize: 10, fontFamily: estilos.font_normal }]}
                                />
                            }
                        />
                    </VictoryChart>
                    <SegmentedToggle 
                        textoactivo='Ver leyenda'
                        textoinactivo='Ocultar leyenda'
                        value={leyendasemana} 
                        onValueChange={setLeyendasemana

                        }/>
                    

                    { leyendasemana && statsData.GastosSemana.filter(i => i.TotalSemana > 0).map((item, idx) => (
                        <View key={idx} style={styles.semanaItem}>
                            <View style={styles.semanaHeader}>
                                <Text style={[styles.semanaTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                                    Semana {item.NumeroSemana}
                                </Text>
                                <Text style={[styles.semanaLeyenda, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    {item.Leyenda}
                                </Text>
                            </View>
                            <Text style={[styles.semanaTotal, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(item.TotalSemana)}
                            </Text>
                            <Text style={[styles.semanaCantidad, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                {item.CantidadGastos} gastos • {item.Porcentaje}%
                            </Text>
                        </View>
                    ))}
                       
                </Surface>

                {/* ========================================== */}
                {/* 6. CONCEPTO INGRESOS - PIE CHART           */}
                {/* ========================================== */}
                <Surface style={[styles.card, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                    <Text style={[styles.cardTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Ingresos por Concepto
                    </Text>
                    
                    <VictoryPie
                        data={conceptosIngresosPieData}
                        width={SCREEN_WIDTH - 64}
                        height={250}
                        innerRadius={2}
                        padAngle={2}
                        cornerRadius={6}
                        colorScale={CHART_COLORS}
                        style={{
                            labels: { 
                                fill: estilos.font_color, 
                                fontSize: 10, 
                                fontFamily: estilos.font_normal 
                            },
                            data: { stroke: estilos.cards_color_fondo, strokeWidth: 2 }
                        }}
                        labelComponent={
                            <VictoryLabel 
                                style={[{ fill: estilos.font_color, fontSize: 9, fontFamily: estilos.font_normal }]} 
                            />
                        }
                    />

                    <View style={styles.legendContainer}>
                        {statsData.ConceptoIngresos.map((item, idx) => (
                            <View key={idx} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }]} />
                                <View style={styles.legendTextContainer}>
                                    <Text style={[styles.legendText, { fontFamily: estilos.font_normal, color: estilos.font_color }]}>
                                        {item.NombreIngreso}
                                    </Text>
                                    <Text style={[styles.legendSub, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                        {formatCurrency(item.TotalIngreso)} • {item.Cantidad} regs • {item.Porcentaje}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Surface>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    titulo: {
        fontSize: 24,
        marginBottom: 4,
    },
    subtitulo: {
        fontSize: 16,
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        borderWidth: 0.5,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    resumenRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    resumenItem: {
        alignItems: 'center',
        flex: 1,
    },
    resumenLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    resumenValue: {
        fontSize: 13,
    },
    resumenMonto: {
        fontSize: 12,
        marginTop: 2,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    listBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    listText: {
        fontSize: 14,
    },
    listItemRight: {
        alignItems: 'flex-end',
    },
    listValue: {
        fontSize: 14,
    },
    listSub: {
        fontSize: 11,
        marginTop: 2,
    },
    mediosGrid: {
        gap: 12,
        marginTop: 12,
    },
    medioItem: {
        paddingVertical: 8,
    },
    medioLabel: {
        fontSize: 14,
        marginBottom: 2,
    },
    medioValue: {
        fontSize: 16,
        marginBottom: 2,
    },
    medioSub: {
        fontSize: 11,
        marginBottom: 6,
    },
    medioBarContainer: {
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    medioBar: {
        height: '100%',
        borderRadius: 3,
    },
    semanaItem: {
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    semanaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    semanaTitle: {
        fontSize: 14,
    },
    semanaLeyenda: {
        fontSize: 11,
    },
    semanaTotal: {
        fontSize: 16,
        marginBottom: 2,
    },
    semanaCantidad: {
        fontSize: 11,
    },
    legendContainer: {
        marginTop: 12,
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    legendTextContainer: {
        flex: 1,
    },
    legendText: {
        fontSize: 14,
    },
    legendSub: {
        fontSize: 11,
        marginTop: 2,
    }
});