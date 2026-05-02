import React, { useState, useEffect, useContext, use } from 'react';
import { View, StyleSheet, Text, Alert, ImageBackground, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { TextInput, Button, Surface, Portal, Dialog, PaperProvider } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import Handelstorage from '../../../Storage/HandelStorage';
import { useApi } from '../../../Apis/useApi';

import Alerta from '../../Procesando/Alerta';

// ─── Helper para formatear números como moneda ───────────────────────────────
const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('es-PY');
};

export default function ResumenMovimientos({ navigation }) {
    const { colors, fonts } = useTheme();
    const { navigate } = useNavigation();
    const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
    const { asignar_opciones_alerta } = useContext(AuthContext);
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { reiniciarvalores } = useContext(AuthContext);
    const { sesiondatadate } = useContext(AuthContext);
    const [ready, setReady] = useState(false);

    // ─── Estado para la data ────────────────────────────────────────────────
    const [dataResumen, setDataResumen] = useState(null);
    const [resultado,serResultado]=useState([])
    const [filasTipos,setFilasTipos]=useState([])
    const [colorbarra,setColorbarra]=useState('#CCCCCC')

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

    const cargardatos = async () => {
        setReady(false);
        actualizarEstadocomponente('tituloloading', 'CARGANDO RESUMEN');
        actualizarEstadocomponente('loading', true);
        const anno_storage = sesiondatadate.dataanno;
        const mes_storage = sesiondatadate.datames;
        const endpoint = `analitic/ResumenMovimientoMes/${anno_storage}/${mes_storage}/`;

        const result = await apiRequest(endpoint, 'GET', {});

        if (result.sessionExpired) {
            return;
        }
        if (result.resp_correcta) {
            const data=result.data
            setDataResumen(result.data);
            serResultado(result.data.ResultadoDelMes)
            const filas_Tipos = [];
            if (data.ResumenPorTipos) {
                data.ResumenPorTipos.ConceptoIngresos?.forEach(item => {
                    filas_Tipos.push({
                        concepto: item.NombreIngreso,
                        ingreso: item.TotalIngreso,
                        egreso: 0,
                        tipo: 'ingreso',
                        cantidad: item.Cantidad,
                        porcentaje: item.Porcentaje
                    });
                });
                data.ResumenPorTipos.GastosPorCategoria?.forEach(item => {
                    filas_Tipos.push({
                        concepto: item.CategoriaGasto,
                        ingreso: 0,
                        egreso: item.TotalCategoria,
                        tipo: 'gasto',
                        cantidad: item.Cantidad,
                        porcentaje: item.Porcentaje
                    });
                });
            }
            setFilasTipos(filas_Tipos)

            console.log(result.data.ResultadoDelMes.PorcentajeUtilizado)

            const valor = parseFloat(result.data.ResultadoDelMes.PorcentajeUtilizado);
            if (isNaN(valor)) {
                setColorbarra('#CCCCCC'); // Gris por defecto si no es válido
            }
            
            if (valor >= 0.00 && valor <= 20.00) {
                setColorbarra ('#2ECC71'); // Verde
            } else if (valor >= 20.01 && valor <= 50.00) {
                setColorbarra('#3498DB'); // Azul
            } else if (valor >= 50.01 && valor <= 90.00) {
                setColorbarra('#F1C40F'); // Amarillo claro
            } else if (valor >= 90.01 && valor <= 100.00) {
                setColorbarra ('#E67E22'); // Naranja fuerte
            } else if (valor > 100.00) {
                setColorbarra('#E74C3C'); // Rojo
            }




        } else {
            const msj = result.data?.message || 'Error en la solicitud';
            asignar_opciones_alerta(true, 'ERROR', msj, 'GASTOS', '', false);
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
            actualizarEstadocomponente('ComponenteActivoBottonTab', 'ResumenMovimientos');
        });
        return unsubscribe;
    }, []);

  
    

    // ─── Render item para FlatList de Conceptos ─────────────────────────────
    const renderConceptoItem = ({ item }) => (
        <View style={styles.flatListRow}>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_color, flex: 2 }]}>
                {item.ConceptGasto}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_importe_color, flex: 1.5, textAlign: 'right' }]}>
                {formatCurrency(item.TotalConcepto)}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color, flex: 1, textAlign: 'center' }]}>
                {item.CantidadConcepto}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color, flex: 1, textAlign: 'right' }]}>
                {item.Porcentaje}%
            </Text>
        </View>
    );

    // ─── Render item para FlatList de Medios de Pago ────────────────────────
    const renderMedioItem = ({ item }) => (
        <View style={styles.flatListRow}>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_color, flex: 2 }]}>
                {item.MedioPago}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_importe_color, flex: 1.5, textAlign: 'right' }]}>
                {formatCurrency(item.TotalMedioPago)}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color, flex: 1, textAlign: 'center' }]}>
                {item.Cantidad}
            </Text>
            <Text style={[styles.cellText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color, flex: 1, textAlign: 'right' }]}>
                {item.Porcentaje}%
            </Text>
        </View>
    );

    if(ready){

        return (
            <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo }}>
                {/* Para ver la alerta */}
                {estadocomponente.alerta_estado && <Alerta />}
    
                <ScrollView
                    style={styles.mainScroll}
                    contentContainerStyle={styles.mainScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ═══════════════════════════════════════════════════════════════
                        1. RESULTADO DEL MES — Sección principal, lo más notorio
                       ═══════════════════════════════════════════════════════════════ */}
                    <Surface style={[styles.heroCard, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={5}>
                        <Text style={[styles.heroTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                            Resultado del Mes
                        </Text>
    
                        <View style={styles.heroRow}>
                            <View style={styles.heroBox}>
                                <Text style={[styles.heroLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    Ingresos
                                </Text>
                                <Text style={[styles.heroValueIngreso, { fontFamily: estilos.font_negrita, color: '#2ECC71' }]}>
                                    +{formatCurrency(resultado.TotalIngreso)}
                                </Text>
                                <Text style={[styles.heroSub, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    {resultado.CantidadIngreso} registro(s)
                                </Text>
                            </View>
    
                            <View style={styles.heroBox}>
                                <Text style={[styles.heroLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    Gastos
                                </Text>
                                <Text style={[styles.heroValueGasto, { fontFamily: estilos.font_negrita, color: '#E74C3C' }]}>
                                    -{formatCurrency(resultado.TotalGasto)}
                                </Text>
                                <Text style={[styles.heroSub, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                    {resultado.cantidadGasto} registro(s)
                                </Text>
                            </View>
                        </View>
    
                        <View style={styles.heroDivider} />
    
                        <View style={styles.heroResultRow}>
                            <Text style={[styles.heroResultLabel, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                Resultado Neto
                            </Text>
                            <Text style={[styles.heroResultValue, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
                                {formatCurrency(resultado.Resultado)}
                            </Text>
                        </View>
    
                        <View style={styles.heroProgressContainer}>
                            <View style={styles.heroProgressBarBg}>
                                <View style={[styles.heroProgressBarFill, { width: `${Math.min(resultado.PorcentajeUtilizado, 100)}%`,backgroundColor:colorbarra }]} />
                            </View>
                            <Text style={[styles.heroProgressText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                                {resultado.PorcentajeUtilizado}% utilizado del presupuesto
                            </Text>
                        </View>
                    </Surface>
    
                    {/* ═══════════════════════════════════════════════════════════════
                        2. RESUMEN POR TIPOS — Tabla con ScrollView propia
                       ═══════════════════════════════════════════════════════════════ */}
                    <Text style={[styles.sectionTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Resumen por Tipos
                    </Text>
    
                    <Surface style={[styles.tableCard, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={3}>
                        {/* Cabecera de tabla */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 2 }]}>Concepto</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1.5, textAlign: 'right' }]}>Ingreso</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1.5, textAlign: 'right' }]}>Egreso</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 0.8, textAlign: 'center' }]}></Text>
                        </View>
    
                        <ScrollView
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                            style={styles.tableScroll}
                        >
                            {filasTipos.map((fila, index) => (
                                <View key={`fila-${index}`} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                                    <Text style={[styles.tableCell, { fontFamily: estilos.font_normal, color: estilos.font_color, flex: 2 }]}>
                                        {fila.concepto}
                                    </Text>
                                    <Text style={[styles.tableCell, { fontFamily: estilos.font_normal, color: '#2ECC71', flex: 1.5, textAlign: 'right' }]}>
                                        {fila.ingreso > 0 ? formatCurrency(fila.ingreso) : '-'}
                                    </Text>
                                    <Text style={[styles.tableCell, { fontFamily: estilos.font_normal, color: '#E74C3C', flex: 1.5, textAlign: 'right' }]}>
                                        {fila.egreso > 0 ? formatCurrency(fila.egreso) : '-'}
                                    </Text>
                                    <View style={[styles.tableCellArrow, { flex: 0.8 }]}>
                                        <Text style={[
                                            styles.arrowSymbol,
                                            { color: fila.tipo === 'ingreso' ? '#2ECC71' : '#E74C3C' }
                                        ]}>
                                            {fila.tipo === 'ingreso' ? '↓' : '↑'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Surface>
    
                    {/* ═══════════════════════════════════════════════════════════════
                        3. RESUMEN CONCEPTOS DE GASTOS — FlatList
                       ═══════════════════════════════════════════════════════════════ */}
                    <Text style={[styles.sectionTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Conceptos de Gastos
                    </Text>
    
                    <Surface style={[styles.listCard, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={3}>
                        {/* Cabecera */}
                        <View style={styles.flatListHeader}>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 2 }]}>Concepto</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1.5, textAlign: 'right' }]}>Monto</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1, textAlign: 'center' }]}>Cant.</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1, textAlign: 'right' }]}>%</Text>
                        </View>
    
                        <FlatList
                            data={dataResumen.ResumenConceptosGastos}
                            renderItem={renderConceptoItem}
                            keyExtractor={(item, index) => `concepto-${index}`}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </Surface>
    
                    {/* ═══════════════════════════════════════════════════════════════
                        4. RESUMEN POR MEDIOS DE PAGO — FlatList
                       ═══════════════════════════════════════════════════════════════ */}
                    <Text style={[styles.sectionTitle, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
                        Medios de Pago
                    </Text>
    
                    <Surface style={[styles.listCard, { backgroundColor: estilos.cards_color_fondo, borderColor: estilos.cards_color_border }]} elevation={3}>
                        {/* Cabecera */}
                        <View style={styles.flatListHeader}>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 2 }]}>Medio</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1.5, textAlign: 'right' }]}>Monto</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1, textAlign: 'center' }]}>Cant.</Text>
                            <Text style={[styles.headerCell, { fontFamily: estilos.font_negrita, color: estilos.font_color, flex: 1, textAlign: 'right' }]}>%</Text>
                        </View>
    
                        <FlatList
                            data={dataResumen.ResumenPorMediosDePagos}
                            renderItem={renderMedioItem}
                            keyExtractor={(item, index) => `medio-${index}`}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </Surface>
    
                    {/* Espacio inferior */}
                    <View style={{ height: 24 }} />
    
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    // ─── ScrollView principal ───────────────────────────────────────────────
    mainScroll: {
        flex: 1,
    },
    mainScrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },

    // ─── Títulos de sección ─────────────────────────────────────────────────
    sectionTitle: {
        fontSize: 18,
        marginTop: 24,
        marginBottom: 10,
        marginLeft: 4,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 1. RESULTADO DEL MES — Hero Card
    // ═══════════════════════════════════════════════════════════════════════
    heroCard: {
        borderWidth: 0.5,
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 4,
    },
    heroTitle: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 16,
    },
    heroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    heroBox: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    heroLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    heroValueIngreso: {
        fontSize: 20,
    },
    heroValueGasto: {
        fontSize: 20,
    },
    heroSub: {
        fontSize: 12,
        marginTop: 2,
    },
    heroDivider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.3)',
        marginVertical: 12,
    },
    heroResultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroResultLabel: {
        fontSize: 16,
    },
    heroResultValue: {
        fontSize: 24,
    },
    heroProgressContainer: {
        marginTop: 4,
    },
    heroProgressBarBg: {
        height: 10,
        backgroundColor: 'rgba(128,128,128,0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    heroProgressBarFill: {
        height: '100%',
        // backgroundColor: '#3498DB',
        borderRadius: 5,
    },
    heroProgressText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 2. RESUMEN POR TIPOS — Tabla con ScrollView interna
    // ═══════════════════════════════════════════════════════════════════════
    tableCard: {
        borderWidth: 0.5,
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 4,
        maxHeight: 280,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.3)',
        marginBottom: 4,
    },
    headerCell: {
        fontSize: 13,
    },
    tableScroll: {
        maxHeight: 200,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128,128,128,0.15)',
    },
    tableRowEven: {
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    tableCell: {
        fontSize: 13,
    },
    tableCellArrow: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowSymbol: {
        fontSize: 22,
        fontWeight: 'bold',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 3 & 4. FLATLIST CARDS — Conceptos y Medios de Pago
    // ═══════════════════════════════════════════════════════════════════════
    listCard: {
        borderWidth: 0.5,
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 4,
    },
    flatListHeader: {
        flexDirection: 'row',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.3)',
        marginBottom: 4,
    },
    flatListRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128,128,128,0.15)',
    },
    cellText: {
        fontSize: 13,
    },
});