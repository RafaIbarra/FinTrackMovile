import React, { useState, useEffect, useContext, useMemo,useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Surface } from 'react-native-paper';
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
import Esperando from "../../Procesando/Espera";
import Notificacion from "../../Notificacion/Notificacion";
import CabeceraListados from "../../CabeceraListados/CabeceraListados";
import Empty from "../../Empty/Empty"
import { useApi } from "../../../Apis/useApi";

export default function ListadosGastos({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  

  const [dataconceptosgastos, setDataconceptosgastos] = useState([]);
  const [dataresumen, setDataresumen] = useState([]);
  const [dataconceptosgastosresult, setDataconceptosgastosresult] = useState([]);

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const [busquedaVisible,setBusquedaVisible]=useState(false)
  const [query, setQuery] = useState('');
  const [titulo,setTitulo]=useState('CARGANDO GASTOS')
  const [ready, setReady] = useState(false);
  const[estadonotificacion,setEstadonotificacion]=useState(false)
  const[bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                        titulo:'',
                                                        is_error:false,
                                                        estado_actualizar:'recarga_conceptos_gastos',
                                                        valor_estado:'',
                                                        navnivel1:'RootNavigator',
                                                        navnivel2:'TabBasicosGroup',
                                                        navnivel3:'ListadosGastos',
                                                        })

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
    
    const endpoint = `ref/ListarGastosUser/0/`;

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
      
      setDataconceptosgastos(registros);
      setDataresumen(result.data.resumen)
      setDataconceptosgastosresult(registros)
      setReady(true);
    } else {
      const msj = result.data?.message || 'Error en la solicitud';
      setReady(true);
      setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'LISTADO DE GASTOS',
          mensaje: msj,
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)
      
    }
    actualizarEstadocomponente('recarga_conceptos_gastos',false)
    
  };
  const onOk=()=>{
    setEstadonotificacion(false)
  }

  const activar_busqueda=()=>{
    setBusquedaVisible(true)
  }
  const desactivar_busqueda=()=>{
    buscarConcepto('')
    setBusquedaVisible(false)
  }

  useFocusEffect(
      useCallback(() => {
        
        if (estadocomponente.recarga_conceptos_gastos) {
          
          cargardatos();
        } else {
          setReady(true);
          
          
        }
      }, [estadocomponente.recarga_conceptos_gastos])
  );

  

  const buscarConcepto = (texto) => {
    setQuery(texto);
    if (!texto.trim()) {
      setDataconceptosgastosresult(dataconceptosgastos);
      return;
    }
    const termino = texto.toLowerCase().trim();
    const filtrados = dataconceptosgastos.filter((item) => {
      const matchCategoria = item.NombreCategoria?.toLowerCase().includes(termino);
      const matchGasto = item.NombreGasto?.toLowerCase().includes(termino);
      
      
      return matchCategoria || matchGasto 
    });
    setDataconceptosgastosresult(filtrados);
  };
  // ── Totales dinámicos de la búsqueda activa ──
  const totalFiltrado = useMemo(() => {
    return dataconceptosgastosresult.reduce((sum, item) => sum + (Number(item.TotalConceptoGasto) || 0), 0);
  }, [dataconceptosgastosresult]);

  const hayBusqueda = query.trim().length > 0;

  if (!ready) return <Esperando titulo={titulo}/>;

  return (
    <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo}}>
      {estadonotificacion && <Notificacion navigation={navigation} bodynotificacion={bodynotificacion} onOk={onOk} />}

      <CabeceraListados
          titulo="Conceptos Gastos"
          data_resumen={{
            titulo_total: 'Total Gastos',
            totalGeneral: dataresumen?.TotalGeneral,
            titulo_cantidad: 'Cant Registros',
            cantidadRegistros: dataresumen?.CantidadGastos
          }}
          destinoNavegacion="RegistroGasto"
          parametroNavegacion={{ IdGasto: 0 }}
          busquedaActiva={busquedaVisible}
          activar_busqueda={activar_busqueda}
          desactivar_busqueda={desactivar_busqueda}  
      />

      

      {/* ═══ BUSCADOR ═══ */}
      {
        busquedaVisible && (
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: estilos.cards_color_fondo,
              borderColor: estilos.cards_color_border,
            },
          ]}
        >
          <Text style={{ marginRight: 6, color: estilos.font_sub_color }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={buscarConcepto}
            placeholder="Por concepto o categoria..."
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
            <TouchableOpacity onPress={() => buscarConcepto('')} style={{ padding: 4 }}>
              <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        )
      }

      {/* ═══ INDICADOR DE RESULTADOS DE BÚSQUEDA ═══ */}
      {hayBusqueda && (
        <View style={styles.resultadoBusqueda}>
          <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 12 }}>
            {dataconceptosgastosresult.length} resultado{dataconceptosgastosresult.length !== 1 ? 's' : ''} · Total filtrado:{' '}
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color }}>
              Gs. {totalFiltrado.toLocaleString('es-ES')}
            </Text>
          </Text>
        </View>
      )}

      {/* ═══ LISTA ═══ */}
      {dataconceptosgastosresult.length>0 ?(
        <FlatList
        data={dataconceptosgastosresult}
        contentContainerStyle={styles.flatlistContenido}
        style={{ flex: 1 }}
        renderItem={({ item }) => {
            return (
                <TouchableOpacity
                    style={[styles.contenedordatos,{
                    backgroundColor: estilos.cards_color_fondo,
                    borderRightColor: estilos.cards_color_border,
                    borderBottomColor:estilos.cards_color_border
                    }]}
                    // onPress={() => { navigate('DetalleGasto', { item }); }}
                    onPress={() => { navigation.navigate('DetalleGasto', { item }); }}
                    activeOpacity={0.85}
                >
                    
                    <View style={styles.columnaInfo}>
                        <Text style={[styles.nombreMedio, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color}]}>
                            {item.NombreGasto}
                        </Text>

                        <Text style={[styles.fechaRegistro, { fontFamily: estilos.font_normal, color:estilos.font_sub_color}]}>
                            {item.FechaRegistro}
                        </Text>

                        <Text style={[styles.idRegistro, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                            
                            {item.NombreCategoria}
                        </Text>

                    </View>

                    <View style={styles.columnaTotal}>
                        <Text style={[styles.totalMovimiento, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color}]}>
                            Gs. {Number(item.TotalConceptoGasto).toLocaleString('es-ES')}
                        </Text>
                        <Text style={[styles.fechaRegistro, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                            Cant: {item.CantidadConceptoGasto}
                        </Text>
                        <Text style={[styles.idRegistro, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                            ID: {item.Id}
                        </Text>
                     </View>
                </TouchableOpacity>
            );
        }}
        keyExtractor={item => item.key}
      />
      ):(
        <Empty />
      )
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  // ═══ RESUMEN COMPACTO ═══
  card: {
        marginBottom: 15,
    },
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
    gap:3
  },
  columnaTotal: {
    flex: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap:3
  },
  nombreMedio: {
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