import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  TextInput, Modal, FlatList, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert, Image
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import Handelstorage from '../../../Storage/HandelStorage';
import Generarpeticion from '../../../Apis/ApiPeticiones';

import Alerta from '../../Procesando/Alerta';
import Modelo from '../Modelo/Modelo';
import CabeceraRegistros from '../../CabeceraRegistros/CabaceraRegistros';

import { useApi } from '../../../Apis/useApi';
import IcnoAtras from '../../IconoAtras/IconoAtras';
import { useRoute } from "@react-navigation/native";

// ─── Íconos simples con caracteres unicode / texto para no depender de libs ──
const Icon = ({ name, size = 18, color = '#fff' }) => {
  const map = {
    camera: '📷',
    calendar: '📅',
    check: '✓',
    plus: '+',
    close: '✕',
    search: '🔍',
    distribute: '⇄',
    trash: '🗑',
    arrow: '›',
  };
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {map[name] ?? '•'}
    </Text>
  );
};

// ─── Separador ────────────────────────────────────────────────────────────────
const Divider = ({ color }) => (
  <View style={{ height: 1, backgroundColor: color, opacity: 0.15, marginVertical: 12 }} />
);

// ─── Modal genérico para selección (empresas / conceptos de ingreso) ──────────
const SelectorModal = ({ visible, onClose, data, onSelect, selected, title, estilos }) => {
  const [query, setQuery] = useState('');
  const filtered = data.filter((item) =>
    item.nombre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={[
              modalStyles.sheet,
              { backgroundColor: estilos.pantalla_color_fondo, maxHeight: '85%' },
            ]}
          >
            <View style={modalStyles.header}>
              <Text
                style={{
                  fontFamily: estilos.font_negrita,
                  color: estilos.font_importe_color,
                  fontSize: 16,
                  flex: 1,
                }}
              >
                {title}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                modalStyles.searchBox,
                {
                  backgroundColor: estilos.cards_color_fondo,
                  borderColor: estilos.cards_color_border,
                },
              ]}
            >
              <Text style={{ marginRight: 6, color: estilos.font_sub_color }}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar..."
                placeholderTextColor={estilos.font_sub_color}
                style={{
                  flex: 1,
                  fontFamily: estilos.font_normal,
                  color: estilos.font_color,
                  fontSize: 14,
                  paddingVertical: 0,
                }}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => {
                const sel = selected?.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    style={[
                      modalStyles.listItem,
                      {
                        backgroundColor: sel ? estilos.boton_color_fondo : 'transparent',
                        borderBottomColor: estilos.cards_color_border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: sel ? estilos.font_negrita : estilos.font_normal,
                        color: sel ? estilos.font_importe_color : estilos.font_color,
                        fontSize: 14,
                        flex: 1,
                      }}
                    >
                      {item.nombre}
                    </Text>
                    {sel && <Text style={{ color: estilos.font_importe_color, fontSize: 14 }}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: 'center',
                    color: estilos.font_sub_color,
                    fontFamily: estilos.font_normal,
                    marginTop: 24,
                    fontSize: 13,
                  }}
                >
                  Sin resultados
                </Text>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Modal calendario simple ─────────────────────────────────────────────────
const CalendarioModal = ({ visible, onClose, onSelect, estilos }) => {
  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth()); // 0-based
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['D','L','M','M','J','V','S'];

  const primero = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < primero; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const anteriorMes = () => {
    if (mes === 0) { setMes(11); setAño(a => a - 1); }
    else setMes(m => m - 1);
  };
  const siguienteMes = () => {
    if (mes === 11) { setMes(0); setAño(a => a + 1); }
    else setMes(m => m + 1);
  };

  const confirmar = () => {
    const pad = (n) => String(n).padStart(2, '0');
    onSelect(`${año}-${pad(mes + 1)}-${pad(diaSeleccionado)}`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View
            style={[
              modalStyles.sheet,
              { backgroundColor: estilos.pantalla_color_fondo, paddingBottom: 24, maxHeight: '85%' },
            ]}
          >
            <View style={modalStyles.header}>
              <Text
                style={{
                  fontFamily: estilos.font_negrita,
                  color: estilos.font_importe_color,
                  fontSize: 16,
                  flex: 1,
                }}
              >
                Seleccionar fecha
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={calStyles.navRow}>
              <TouchableOpacity onPress={anteriorMes} style={calStyles.navBtn}>
                <Text style={{ color: estilos.font_color, fontSize: 18 }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_color, fontSize: 15 }}>
                {meses[mes]} {año}
              </Text>
              <TouchableOpacity onPress={siguienteMes} style={calStyles.navBtn}>
                <Text style={{ color: estilos.font_color, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={calStyles.weekRow}>
              {diasSemana.map((d, i) => (
                <Text key={i} style={[calStyles.weekLabel, { color: estilos.font_sub_color, fontFamily: estilos.font_negrita }]}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={calStyles.grid}>
              {celdas.map((dia, i) => {
                const sel = dia === diaSeleccionado;
                return (
                  <TouchableOpacity
                    key={i}
                    disabled={!dia}
                    onPress={() => dia && setDiaSeleccionado(dia)}
                    style={[
                      calStyles.celda,
                      {
                        backgroundColor: sel ? estilos.boton_color_fondo : 'transparent',
                        borderColor: sel ? estilos.boton_color_borde : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: sel ? estilos.font_negrita : estilos.font_normal,
                        color: dia ? (sel ? estilos.font_importe_color : estilos.font_color) : 'transparent',
                        fontSize: 14,
                      }}
                    >
                      {dia ?? ' '}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                modalStyles.confirmBtn,
                {
                  marginTop: 12,
                  backgroundColor: estilos.boton_color_fondo,
                  borderColor: estilos.boton_color_borde,
                },
              ]}
              onPress={confirmar}
            >
              <Text
                style={{
                  fontFamily: estilos.font_negrita,
                  color: estilos.font_importe_color,
                  fontSize: 14,
                }}
              >
                Confirmar fecha
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function RegistroMovimientoIngreso({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();

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

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { asignar_opciones_alerta } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);

  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });
  const { params: { IdMovIngreso } } = useRoute();
  const [titulo, setTitulo] = useState('');
  const [mostraralerta, setMostraralerta] = useState(false);

  // ── Data registrada (para edición) ────────────────────────────────────────
  const [dataingresoregistrado, setDataingresoregistrado] = useState(null);
  const [dataempresaregistrada, setDataempresaregistrada] = useState();
  const [fechamovimiento, setFechamovimiento] = useState();

  // ── Data referencial ──────────────────────────────────────────────────────
  const [dataingresos, setDataingresos] = useState([]);
  const [dataempresas, setDataempresas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ── Selecciones del usuario ───────────────────────────────────────────────
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null); // { id, nombre, tipo }
  const [montoIngreso, setMontoIngreso] = useState(0);
  const [montoDisplay, setMontoDisplay] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  const hoyStr = (() => {
    const hoy = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  })();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);

  // ── Modales ───────────────────────────────────────────────────────────────
  const [modalIngresos, setModalIngresos] = useState(false);
  const [modalEmpresas, setModalEmpresas] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(false);

  const [enviando, setEnviando] = useState(false);

  //── CAMARA ────────────────────────────────────────────────────────────────
  const [imageUri, setImageUri] = useState(null);

  // --- Tomar foto con la cámara ---
  const tomarFoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);

    // Guardar en galería (opcional)
    const { granted: mediaGranted } = await MediaLibrary.requestPermissionsAsync();
    if (mediaGranted) {
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  };

  // --- Seleccionar foto de la galería ---
  const seleccionarDeGaleria = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) return;

    setImageUri(result.assets[0].uri);
  };

  // ── Helpers para formateo de montos ───────────────────────────────────────
  const formatearMiles = (valor) => {
    if (!valor && valor !== 0) return '';
    const str = valor.toString().replace(/\D/g, '');
    if (!str) return '';
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parsearMonto = (valorFormateado) => {
    const limpio = valorFormateado.replace(/\./g, '').replace(/,/g, '');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  };

  const actualizarMonto = (valor) => {
    const soloNums = valor.replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, '');
    const num = soloNums ? parseFloat(soloNums) : 0;
    setMontoIngreso(num);
    setMontoDisplay(soloNums ? formatearMiles(soloNums) : '');
  };

  // ── Carga datos ───────────────────────────────────────────────────────────
  const carga_movimiento_registrado = async () => {
    const endpoint = `operaciones/DatosReferencialesCargaMovimientoIngreso/${IdMovIngreso}/`;
    const result = await apiRequest(endpoint, 'GET', {});
    
    try {
      if (result.sessionExpired) {
        return; // SI LA SESION NO ES VALIDA
      }
      if (result.resp_correcta) {
        const mov = result.data[0];
        setDataingresoregistrado({
          id: mov.IngresoUsuario,
          monto: mov.MontoIngreso,
        });
        setDataempresaregistrada(mov.Empresa);
        setFechamovimiento(mov.FechaIngreso);
        setImageUri(mov.UrlImg);
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        asignar_opciones_alerta(true, 'ERROR', msj, 'Referenciales', '', false);
        actualizarEstadocomponente('alerta_estado', true);
      }
    } catch (e) {
      const msj = e || 'Error en la solicitud';
      asignar_opciones_alerta(true, 'ERROR', msj, 'Referenciales', '', false);
      actualizarEstadocomponente('alerta_estado', true);
    } finally {
      setCargando(false);
    }
  };

  const cargardatos = async () => {
    try {
      const endpoint = `operaciones/ReferencialesCargaIngreso/`;
      const result = await apiRequest(endpoint, 'GET', {});

      if (result.sessionExpired) {
        return;
      }
      if (result.resp_correcta) {
        const ingresos = (result.data.Ingresos || []).map((g) => ({
          id: g.Id,
          nombre: g.NombreIngreso,
          tipo: g.NombreTipoIngreso,
          tipoId: g.TipoIngreso,
          observacion: g.Observacion,
        }));
        const empresas = (result.data.Empresa || []).map((e) => ({
          id: e.Id,
          nombre: e.NombreEmpresa,
          urlImg: e.UrlImg,
        }));
        setDataingresos(ingresos);
        setDataempresas(empresas);

        // Seleccionar empresa con Id = 1 por defecto
        const empresaPorDefecto = empresas.find(e => e.id === 1);
        if (empresaPorDefecto) {
          setEmpresaSeleccionada(empresaPorDefecto);
        }
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        asignar_opciones_alerta(true, 'ERROR', msj, 'Referenciales', '', false);
        actualizarEstadocomponente('alerta_estado', true);
      }
    } catch (e) {
      const msj = e || 'Error en la solicitud';
      asignar_opciones_alerta(true, 'ERROR', msj, 'Referenciales', '', false);
      actualizarEstadocomponente('alerta_estado', true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargardatos();
  }, []);

  useEffect(() => {
    if (IdMovIngreso === 0) {
      setTitulo('Nuevo Movimiento Ingreso');
    } else {
      setTitulo(`Editar Movimiento ID: ${IdMovIngreso}`);
      carga_movimiento_registrado();
    }
  }, []);

  // ── Prellenar selecciones cuando los datos registrados y referenciales estén disponibles ──
  useEffect(() => {
    if (IdMovIngreso === 0) return;
    if (dataingresos.length === 0 || !dataingresoregistrado) return;

    // ── Concepto de Ingreso ─────────────────────────────────────────────────
    const ingRef = dataingresos.find((i) => i.id === dataingresoregistrado.id);
    if (ingRef) {
      setIngresoSeleccionado(ingRef);
      const monto = dataingresoregistrado.monto || 0;
      setMontoIngreso(monto);
      setMontoDisplay(monto > 0 ? formatearMiles(monto.toString()) : '');
    }
  }, [dataingresos, dataingresoregistrado]);

  useEffect(() => {
    if (IdMovIngreso === 0) return;
    if (dataempresas.length === 0 || !dataempresaregistrada) return;

    // ── Empresa ─────────────────────────────────────────────────────────────
    const empRef = dataempresas.find((e) => e.id === dataempresaregistrada);
    if (empRef) setEmpresaSeleccionada(empRef);
  }, [dataempresas, dataempresaregistrada]);

  useEffect(() => {
    if (IdMovIngreso === 0) return;
    if (!fechamovimiento) return;

    // ── Fecha ─────────────────────────────────────────────────────────────────
    setFechaSeleccionada(fechamovimiento);
  }, [fechamovimiento]);

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    if (!ingresoSeleccionado)
      return 'Seleccioná un concepto de ingreso.';
    if (!montoIngreso || isNaN(montoIngreso) || montoIngreso <= 0)
      return 'Ingresá un monto válido (mayor a 0).';
    if (!empresaSeleccionada) return 'Seleccioná una empresa.';
    if (!fechaSeleccionada) return 'Seleccioná una fecha.';
    return null;
  };

  const resetForm = () => {
    setIngresoSeleccionado(null);
    setMontoIngreso(0);
    setMontoDisplay('');
    setEmpresaSeleccionada(dataempresas.find(e => e.id === 1) || null);
    const hoy = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    setFechaSeleccionada(`${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`);
    setImageUri(null);
  };

  const cancelar = () => {
    navigation.goBack();
  };

  const guardar = async () => {
    const error = validar();
    if (error) { Alert.alert('Atención', error); return; }

    const esEdicion = IdMovIngreso > 0;

    const formData = new FormData();
    formData.append('codingreso', ingresoSeleccionado.id);
    formData.append('montoingreso', montoIngreso);
    formData.append('fecha', fechaSeleccionada);
    formData.append('empresa', empresaSeleccionada.id);
    formData.append('observacion', '');
    if (esEdicion) formData.append('IdMovIngreso', IdMovIngreso);

    if (imageUri) {
      formData.append('imagen', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'foto.jpg',
      });
    } else {
      formData.append('imagen', '');
    }

    try {
      setEnviando(true);
      actualizarEstadocomponente('tituloloading', esEdicion ? 'Actualizando Ingreso..' : 'Registrando Ingreso..');
      actualizarEstadocomponente('loading', true);

      const endpoint = esEdicion 
        ? `operaciones/EditarMovimientoIngresoUser/${IdMovIngreso}/` 
        : `operaciones/RegistroMovimientoIngresoUser/`;
      const metodo = esEdicion ? 'PUT' : 'POST';
      const result = await apiRequest(endpoint, metodo, formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      actualizarEstadocomponente('tituloloading', '');
      actualizarEstadocomponente('loading', false);

      if (result.sessionExpired) {
        return;
      }

      if (result.resp_correcta) {
        if (!esEdicion) resetForm();
        const nuevo = !estadocomponente.bandera_registro_ingreso;
        const mensajeExito = esEdicion ? 'Movimiento actualizado correctamente' : 'Registro correcto del movimiento';
        asignar_opciones_alerta(false, 'REGISTRO INGRESOS', mensajeExito, 'TabsGroup', 'ListadoMovimientosIngresos', 'bandera_registro_ingreso', nuevo);
        actualizarEstadocomponente('alerta_estado', true);
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        asignar_opciones_alerta(true, 'ERROR', msj, 'Ingresos', 'bandera_registro_ingreso', false);
        actualizarEstadocomponente('alerta_estado', true);
      }
    } catch (e) {
      asignar_opciones_alerta(true, 'ERROR', 'Ocurrió un error al guardar.', 'Ingresos', 'bandera_registro_ingreso', false);
      actualizarEstadocomponente('alerta_estado', true);
      Alert.alert('Error', 'Ocurrió un error al guardar.');
    } finally {
      setEnviando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: estilos.pantalla_color_fondo }}>
        <ActivityIndicator color={estilos.font_importe_color} size="large" />
        <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, marginTop: 12 }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {estadocomponente.alerta_estado && <Alerta />}
      <CabeceraRegistros
        title={titulo}
        navigation={navigation}
        onDelete={() => {}}
        onEdit={() => {}}
        showbottons={false}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ══ SECCIÓN: CONCEPTO DE INGRESO ═════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Concepto de Ingreso" paso="1">
          <TouchableOpacity
            style={[styles.selectorBtn, { borderColor: estilos.cards_color_border, backgroundColor: estilos.cards_color_fondo }]}
            onPress={() => setModalIngresos(true)}
          >
            <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 14, flex: 1 }}>
              {ingresoSeleccionado
                ? `${ingresoSeleccionado.nombre} (${ingresoSeleccionado.tipo})`
                : 'Seleccionar concepto de ingreso...'}
            </Text>
            <Text style={{ color: estilos.font_importe_color, fontSize: 18 }}>+</Text>
          </TouchableOpacity>

          {ingresoSeleccionado && (
            <View
              style={[
                styles.gastoRow,
                {
                  borderColor: estilos.cards_color_border,
                  backgroundColor: estilos.cards_color_fondo,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: estilos.font_normal,
                  color: estilos.font_color,
                  flex: 1,
                  fontSize: 13,
                }}
                numberOfLines={1}
              >
                {ingresoSeleccionado.nombre}
              </Text>
              <TextInput
                value={montoDisplay}
                onChangeText={(v) => actualizarMonto(v)}
                keyboardType="numeric"
                placeholder="Monto"
                placeholderTextColor={estilos.font_sub_color}
                style={[
                  styles.montoInput,
                  {
                    fontFamily: estilos.font_normal,
                    color: estilos.font_importe_color,
                    borderColor: estilos.cards_color_border,
                  },
                ]}
              />
              <TouchableOpacity onPress={() => { setIngresoSeleccionado(null); setMontoIngreso(0); setMontoDisplay(''); }} style={{ marginLeft: 8 }}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {ingresoSeleccionado && montoIngreso > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 12 }}>
                Monto ingresado
              </Text>
              <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 15 }}>
                {montoIngreso.toLocaleString('es-PY')}
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ══ SECCIÓN: EMPRESA ═════════════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Empresa" paso="2">
          <TouchableOpacity
            style={[styles.selectorBtn, { borderColor: estilos.cards_color_border, backgroundColor: estilos.cards_color_fondo }]}
            onPress={() => setModalEmpresas(true)}
          >
            <Text
              style={{
                fontFamily: estilos.font_normal,
                color: empresaSeleccionada ? estilos.font_color : estilos.font_sub_color,
                fontSize: 14,
                flex: 1,
              }}
            >
              {empresaSeleccionada ? empresaSeleccionada.nombre : 'Seleccionar empresa...'}
            </Text>
            <Text style={{ color: estilos.font_importe_color, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ══ SECCIÓN: FECHA ═══════════════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Fecha" paso="3">
          <TouchableOpacity
            style={[styles.selectorBtn, { borderColor: estilos.cards_color_border, backgroundColor: estilos.cards_color_fondo }]}
            onPress={() => setModalCalendario(true)}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>📅</Text>
            <Text
              style={{
                fontFamily: estilos.font_normal,
                color: fechaSeleccionada ? estilos.font_importe_color : estilos.font_sub_color,
                fontSize: 14,
                flex: 1,
              }}
            >
              {fechaSeleccionada || 'Seleccionar fecha...'}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ══ SECCIÓN: IMAGEN / COMPROBANTE ════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Comprobante" paso="4">
          <View style={camaraStyles.container_camara}>
            {/* Botones */}
            <View style={camaraStyles.buttons_camara}>
              <TouchableOpacity style={[camaraStyles.btn_camara,{backgroundColor:estilos.pantalla_color_fondo,borderWidth:0.5,borderColor:estilos.boton_color_borde}]} onPress={tomarFoto}>
                <Text style={[camaraStyles.btnText_camara,{color:estilos.font_color,fontFamily:estilos.font_normal}]}>📷 Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[camaraStyles.btn_camara,{backgroundColor:estilos.pantalla_color_fondo,borderWidth:0.5,borderColor:estilos.boton_color_borde}]} onPress={seleccionarDeGaleria}>
                <Text style={[camaraStyles.btnText_camara,{color:estilos.font_color,fontFamily:estilos.font_normal}]}>🖼️ Galería</Text>
              </TouchableOpacity>
            </View>

            {/* Preview de la imagen */}
            {imageUri && (
              <>
                <View style={camaraStyles.contenedor_img}>
                  <Image source={{ uri: imageUri }} style={camaraStyles.image_camara} />
                  <TouchableOpacity style={camaraStyles.btnEliminar} onPress={() => setImageUri(null)}>
                    <Text style={camaraStyles.btnEliminarTexto}>✕</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SectionCard>

        {/* ══ BOTÓN GUARDAR ════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={[
            styles.guardarBtn,
            {
              backgroundColor: estilos.boton_color_fondo,
              borderColor: estilos.boton_color_borde,
              opacity: enviando ? 0.6 : 1,
            },
          ]}
          onPress={guardar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color={estilos.font_importe_color} />
          ) : (
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 15 }}>
              {IdMovIngreso > 0 ? 'Actualizar movimiento' : 'Registrar movimiento'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* ── MODALES ───────────────────────────────────────────────────────── */}
      <SelectorModal
        visible={modalIngresos}
        onClose={() => setModalIngresos(false)}
        data={dataingresos}
        onSelect={setIngresoSeleccionado}
        selected={ingresoSeleccionado}
        title="Seleccionar concepto de ingreso"
        estilos={estilos}
      />

      <SelectorModal
        visible={modalEmpresas}
        onClose={() => setModalEmpresas(false)}
        data={dataempresas}
        onSelect={setEmpresaSeleccionada}
        selected={empresaSeleccionada}
        title="Seleccionar empresa"
        estilos={estilos}
      />

      <CalendarioModal
        visible={modalCalendario}
        onClose={() => setModalCalendario(false)}
        onSelect={setFechaSeleccionada}
        estilos={estilos}
      />
    </KeyboardAvoidingView>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
const SectionCard = ({ estilos, titulo, paso, children }) => (
  <View
    style={[
      styles.card,
      {
        backgroundColor: estilos.cards_color_fondo,
        borderColor: estilos.cards_color_border,
      },
    ]}
  >
    <View style={styles.cardHeader}>
      <View style={[styles.pasoBadge, { borderColor: estilos.boton_color_borde, backgroundColor: estilos.boton_color_fondo }]}>
        <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 11 }}>
          {paso}
        </Text>
      </View>
      <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_color, fontSize: 15, marginLeft: 8 }}>
        {titulo}
      </Text>
    </View>
    <View style={{ marginTop: 12 }}>{children}</View>
  </View>
);

// ─── Estilos base ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pasoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  gastoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  montoInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    minWidth: 90,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#aaa',
  },
  guardarBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 35,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  confirmBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
});

const calStyles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  weekLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  celda: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    marginVertical: 2,
  },
});

const camaraStyles = StyleSheet.create({
  container_camara: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  buttons_camara: {
    flexDirection: 'row',
    gap: 12,
  },
  btn_camara: {
     width:110,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondary_camara: {
    
  },
  btnText_camara: {
    
    fontSize: 13,
    fontWeight: '600',
  },
  contenedor_img: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 10,
    borderRadius: 12,
  },
  image_camara: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  btnEliminar: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEliminarTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  uri_camara: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});