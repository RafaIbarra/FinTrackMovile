import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';

import Alerta from "../../Procesando/Alerta";
import LogoEmpresa from "../../LogoEmpresa/LogoEmpresa";
import { useApi } from "../../../Apis/useApi";

export default function ListadoMovimientosIngresos({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  const { sesiondatadate } = useContext(AuthContext);

  const [dataingresos, setDataingresos] = useState([]);
  const [dataresumen, setDataresumen] = useState([]);
  const [dataingresosresult, setDataingresosresult] = useState([]);

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { asignar_opciones_alerta } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');

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
    setReady(false)
    actualizarEstadocomponente('tituloloading', 'CARGANDO INGRESOS');
    actualizarEstadocomponente('loading', true);
    const anno_storage = sesiondatadate.dataanno;
    const mes_storage = sesiondatadate.datames;
    const endpoint = `operaciones/ListadoMovimientosIngresosMesUser/${anno_storage}/${mes_storage}/`;

    const result = await apiRequest(endpoint, 'GET', {});
    

    if (result.sessionExpired) {
      return;
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
      setDataingresosresult(registros)
    } else {
      const msj = result.data?.message || 'Error en la solicitud';
      asignar_opciones_alerta(true, 'ERROR', msj, 'INGRESOS', '', false);
      actualizarEstadocomponente('alerta_estado', true);
    }
    actualizarEstadocomponente('tituloloading', '');
    actualizarEstadocomponente('loading', false);
    setReady(true);
  };

  useEffect(() => {
    cargardatos();
  }, [estadocomponente.bandera_registro_ingreso]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      actualizarEstadocomponente('ComponenteActivoBottonTab', 'ListadoMovimientosIngresos');
    });
    return unsubscribe;
  }, []);

  const buscarIngresos = (texto) => {
    setQuery(texto);
    if (!texto.trim()) {
      setDataingresosresult(dataingresos);
      return;
    }
    const termino = texto.toLowerCase().trim();
    const filtrados = dataingresos.filter((item) => {
      const matchEmpresa = item.NombreEmpresa?.toLowerCase().includes(termino);
      const matchIngreso = item.NombreIngreso?.toLowerCase().includes(termino);
        
      return matchEmpresa || matchIngreso
    });
    setDataingresosresult(filtrados);
  };

  // ── Totales dinámicos de la búsqueda activa ──
  const totalFiltrado = useMemo(() => {
    return dataingresosresult.reduce((sum, item) => sum + (Number(item.MontoIngreso) || 0), 0);
  }, [dataingresosresult]);

  const hayBusqueda = query.trim().length > 0;

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen_componente_estilos.color_fondo }}>
      {estadocomponente.alerta_estado && <Alerta />}

      {/* ═══ BARRA DE RESUMEN COMPACTA ═══ */}

      <View 
      
      style={{
        marginBottom: 10,
        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        // Android
        elevation: 2,
      }}
      >

        <View style={styles.resumenBarra}>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabelBarra, { fontFamily: estilos.font_normal }]}>Total Ingreso</Text>
            <Text style={[styles.resumenMontoBarra, { fontFamily: estilos.font_negrita, color: '#7B5EA7' }]}>
              Gs. {Number(dataresumen[0]?.TotalIngresos).toLocaleString('es-ES')}
            </Text>
          </View>
          <View style={styles.resumenSeparador} />
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabelBarra, { fontFamily: estilos.font_normal }]}>Registros</Text>
            <Text style={[styles.resumenMontoBarra, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
              {Number(dataresumen[0]?.CantidadIngresos).toLocaleString('es-ES')}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══ BUSCADOR ═══ */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.screen_componente_estilos.color_fondo_cards,
            borderColor: colors.screen_componente_estilos.color_borde_cards,
          },
        ]}
      >
        <Text style={{ marginRight: 6, color: estilos.font_sub_color }}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={buscarIngresos}
          placeholder="Por empresa, concepto..."
          underlineColorAndroid="transparent"
          placeholderTextColor={estilos.font_sub_color}
          style={{
            fontFamily: estilos.font_normal,
            color: estilos.font_color,
            flex: 1,
            paddingVertical: 2,
            height: '70%',
            paddingLeft: 5,
          }}
        />
        {hayBusqueda && (
          <TouchableOpacity onPress={() => buscarIngresos('')} style={{ padding: 4 }}>
            <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ═══ INDICADOR DE RESULTADOS DE BÚSQUEDA ═══ */}
      {hayBusqueda && (
        <View style={styles.resultadoBusqueda}>
          <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 12 }}>
            {dataingresosresult.length} resultado{dataingresosresult.length !== 1 ? 's' : ''} · Total filtrado:{' '}
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color }}>
              Gs. {totalFiltrado.toLocaleString('es-ES')}
            </Text>
          </Text>
        </View>
      )}

      {/* ═══ LISTA ═══ */}
      <FlatList
        data={dataingresosresult}
        contentContainerStyle={styles.flatlistContenido}
        style={{ flex: 1 }}
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

const styles = StyleSheet.create({
  // ═══ RESUMEN COMPACTO ═══
  resumenBarra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    paddingVertical: 10,
    backgroundColor: '#EEE9FD', // tinte muy suave del color gasto
    borderRadius: 10,
  },
  resumenItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumenSeparador: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  resumenLabelBarra: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  resumenMontoBarra: {
    fontSize: 15,
  },

  // ═══ BUSCADOR ═══
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 38,
    marginLeft: 12,
    marginRight: 12,
  },

  // ═══ RESULTADO BÚSQUEDA ═══
  resultadoBusqueda: {
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  // ═══ LISTA ═══
  contenedordatos: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 1,
  },
  flatlistContenido: {
    paddingBottom: 16,
    paddingTop: 4,
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