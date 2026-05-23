import React, { useState, useEffect, useContext, useMemo,useRef,useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Surface } from 'react-native-paper';
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
import Esperando from "../../Procesando/Espera";
import Notificacion from "../../Notificacion/Notificacion";
import Empty from "../../Empty/Empty";
import { useApi } from "../../../Apis/useApi";
import CabeceraListados from "../../CabeceraListados/CabeceraListados";
export default function ListadoCategoriasGastos({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();
  

  const [datacategorias, setDatacategorias] = useState([]);
  const [dataresumen, setDataresumen] = useState([]);
  const [datacategoriasresult, setDatacategoriasresult] = useState([]);

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { asignar_opciones_alerta } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [titulo,setTitulo]=useState('CARGANDO CATEGORIAS')
  const [busquedaVisible,setBusquedaVisible]=useState(false)
  const[estadonotificacion,setEstadonotificacion]=useState(false)
  const[bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                        titulo:'',
                                                        is_error:false,
                                                        estado_actualizar:'recarga_conceptos_categorias',
                                                        valor_estado:'',
                                                        navnivel1:'RootNavigator',
                                                        navnivel2:'TabBasicosGroup',
                                                        navnivel3:'ListadoCategoriasGastos',
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
    const endpoint = `ref/ListadoCategoriasUser/0/`;

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
      
      setDatacategorias(registros);
      setDataresumen(result.data.resumen)
      setDatacategoriasresult(registros)
      setReady(true);
    } else {
      const msj = result.data?.message || 'Error en la solicitud';
      
      setReady(true)
      
      setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'LISTADO DE CETAGORIAS',
          mensaje: msj,
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)
    }
    actualizarEstadocomponente('recarga_conceptos_categorias',false)
  };



  const onOk=()=>{
    setEstadonotificacion(false)
  }
  const activar_busqueda=()=>{
    setBusquedaVisible(true)
  }
  const desactivar_busqueda=()=>{
    buscarCategoria('')
    setBusquedaVisible(false)
  }

  

  useFocusEffect(
    useCallback(() => {
      
      if (estadocomponente.recarga_conceptos_categorias) {
        console.log("categorias carga!")
        cargardatos();
      } else {
        setReady(true);
        console.log("categorias NO carga!")
        
      }
    }, [estadocomponente.recarga_conceptos_categorias])
  );

  

  const buscarCategoria = (texto) => {
    setQuery(texto);
    if (!texto.trim()) {
      setDatacategoriasresult(datacategorias);
      return;
    }
    const termino = texto.toLowerCase().trim();
    const filtrados = datacategorias.filter((item) => {
      const matchCategoria = item.NombreCategoria?.toLowerCase().includes(termino);
      const matchGasto = item.DetalleGastos?.some((g) =>
        g.NombreGasto?.toLowerCase().includes(termino)
      );
      
      return matchCategoria || matchGasto 
    });
    setDatacategoriasresult(filtrados);
  };
  // ── Totales dinámicos de la búsqueda activa ──
  const totalFiltrado = useMemo(() => {
    return datacategoriasresult.reduce((sum, item) => sum + (Number(item.TotalGastoCategoria) || 0), 0);
  }, [datacategoriasresult]);

  const hayBusqueda = query.trim().length > 0;

  if (!ready) return <Esperando titulo={titulo}/>;
  
  return (
    <View style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo}}>
      {estadonotificacion && <Notificacion navigation={navigation} bodynotificacion={bodynotificacion} onOk={onOk} />}

      {/* ═══ BARRA DE RESUMEN COMPACTA ═══ */}
      <CabeceraListados
          titulo="Categorias Gastos"
          data_resumen={{
            titulo_total: 'Total Categoria',
            totalGeneral: dataresumen?.TotalGeneral,
            titulo_cantidad: 'Cant Registros',
            cantidadRegistros: dataresumen?.CantidadCategorias
          }}
          destinoNavegacion="RegistroCategoria"
          parametroNavegacion={{ IdCategoria: 0 }}
          busquedaActiva={busquedaVisible}
          activar_busqueda={activar_busqueda}
          desactivar_busqueda={desactivar_busqueda}  
      />

      

      {/* ═══ BUSCADOR ═══ */}
      {busquedaVisible && (

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
            onChangeText={buscarCategoria}
            placeholder="Por categoria, concepto gasto..."
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
            <TouchableOpacity onPress={() => buscarCategoria('')} style={{ padding: 4 }}>
              <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ═══ INDICADOR DE RESULTADOS DE BÚSQUEDA ═══ */}
      {hayBusqueda && (
        <View style={styles.resultadoBusqueda}>
          <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 12 }}>
            {datacategoriasresult.length} resultado{datacategoriasresult.length !== 1 ? 's' : ''} · Total filtrado:{' '}
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color }}>
              Gs. {totalFiltrado.toLocaleString('es-ES')}
            </Text>
          </Text>
        </View>
      )}

      {/* ═══ LISTA ═══ */}
      { datacategoriasresult.length> 0? (

        <FlatList
          data={datacategoriasresult}
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
                      onPress={() => { navigation.navigate('DetalleCategoriaGasto', { item }); }}
                      activeOpacity={0.85}
                  >
                      
                      <View style={styles.columnaInfo}>
                          <Text style={[styles.nombreEmpresa, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color}]}>
                              {item.NombreCategoria}
                          </Text>
  
                          <Text style={[styles.fechaRegistro, { fontFamily: estilos.font_normal, color:estilos.font_sub_color}]}>
                              {item.FechaRegistro}
                          </Text>
  
                          <Text style={[styles.idRegistro, { fontFamily: estilos.font_normal, color:estilos.font_sub_color}]}>
                              ID: {item.Id}
                          </Text>
  
                      </View>
  
                      <View style={styles.columnaTotal}>
                          <Text style={[styles.totalMovimiento, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color}]}>
                              Gs. {Number(item.TotalGastoCategoria).toLocaleString('es-ES')}
                          </Text>
                          <Text style={[styles.fechaRegistro, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color}]}>
                              Cant: {item.CantidadGastosCategoria}
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