import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';

import Handelstorage from '../../../Storage/HandelStorage';
import Generarpeticion from '../../../Apis/ApiPeticiones';

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

// ─── Chip seleccionable ───────────────────────────────────────────────────────
const Chip = ({ label, selected, onPress, estilos }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      chipStyles.chip,
      {
        borderColor: selected ? estilos.boton_color_borde : estilos.cards_color_border,
        backgroundColor: selected ? estilos.boton_color_fondo : estilos.cards_color_fondo,
      },
    ]}
  >
    <Text
      style={{
        fontFamily: selected ? estilos.font_negrita : estilos.font_normal,
        color: selected ? estilos.font_importe_color : estilos.font_color,
        fontSize: 13,
      }}
    >
      {label}
    </Text>
    {selected && (
      <Text style={{ color: estilos.font_importe_color, marginLeft: 6, fontSize: 12 }}>✓</Text>
    )}
  </TouchableOpacity>
);

// ─── Modal genérico con buscador ─────────────────────────────────────────────
const SearchModal = ({ visible, onClose, data, onSelect, selected, title, estilos, multiSelect = false }) => {
  const [query, setQuery] = useState('');
  const filtered = data.filter((item) =>
    item.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const isSelected = (id) =>
    multiSelect ? selected.some((s) => s.id === id) : selected?.id === id;

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
              { backgroundColor: estilos.pantalla_color_fondo },
            ]}
          >
            {/* Header */}
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
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Buscador */}
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

            {/* Lista */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => {
                const sel = isSelected(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      if (!multiSelect) onClose();
                    }}
                    style={[
                      modalStyles.listItem,
                      {
                        backgroundColor: sel
                          ? estilos.boton_color_fondo
                          : 'transparent',
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
                    {sel && (
                      <Text style={{ color: estilos.font_importe_color, fontSize: 14 }}>✓</Text>
                    )}
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

            {multiSelect && (
              <TouchableOpacity
                style={[
                  modalStyles.confirmBtn,
                  {
                    backgroundColor: estilos.boton_color_fondo,
                    borderColor: estilos.boton_color_borde,
                  },
                ]}
                onPress={onClose}
              >
                <Text
                  style={{
                    fontFamily: estilos.font_negrita,
                    color: estilos.font_importe_color,
                    fontSize: 14,
                  }}
                >
                  Confirmar selección ({selected.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Modal distribución de medios ────────────────────────────────────────────
const DistribuirModal = ({ visible, onClose, medios, distribucion, onUpdate, totalGastos, estilos }) => {
  const [local, setLocal] = useState({});

  useEffect(() => {
    if (visible) setLocal({ ...distribucion });
  }, [visible]);

  const totalDistribuido = Object.values(local).reduce((a, b) => a + (parseFloat(b) || 0), 0);

  const guardar = () => {
    onUpdate(local);
    onClose();
  };

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
              { backgroundColor: estilos.pantalla_color_fondo },
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
                Distribuir medios de pago
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {medios.map((medio) => (
                <View key={medio.id} style={distStyles.row}>
                  <Text
                    style={{
                      fontFamily: estilos.font_normal,
                      color: estilos.font_color,
                      flex: 1,
                      fontSize: 14,
                    }}
                  >
                    {medio.nombre}
                  </Text>
                  <View
                    style={[
                      distStyles.inputWrap,
                      {
                        backgroundColor: estilos.cards_color_fondo,
                        borderColor: estilos.cards_color_border,
                      },
                    ]}
                  >
                    <TextInput
                      value={local[medio.id]?.toString() ?? ''}
                      onChangeText={(v) => setLocal((prev) => ({ ...prev, [medio.id]: v }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={estilos.font_sub_color}
                      style={{
                        fontFamily: estilos.font_normal,
                        color: estilos.font_color,
                        fontSize: 14,
                        minWidth: 90,
                        textAlign: 'right',
                        paddingVertical: 2,
                      }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Total */}
            <View
              style={[
                distStyles.totalRow,
                { borderTopColor: estilos.cards_color_border },
              ]}
            >
              <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 13 }}>
                Total distribuido
              </Text>
              <Text
                style={{
                  fontFamily: estilos.font_negrita,
                  color:
                    totalDistribuido === totalGastos
                      ? '#4caf50'
                      : estilos.font_importe_color,
                  fontSize: 15,
                }}
              >
                {totalDistribuido.toLocaleString('es-PY')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                modalStyles.confirmBtn,
                {
                  backgroundColor: estilos.boton_color_fondo,
                  borderColor: estilos.boton_color_borde,
                },
              ]}
              onPress={guardar}
            >
              <Text
                style={{
                  fontFamily: estilos.font_negrita,
                  color: estilos.font_importe_color,
                  fontSize: 14,
                }}
              >
                Confirmar distribución
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Modal calendario simple ──────────────────────────────────────────────────
const CalendarioModal = ({ visible, onClose, onSelect, estilos }) => {
  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth()); // 0-based
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['D','L','M','M','J','V','S'];

  const primero = new Date(año, mes, 1).getDay(); // día semana del 1ero
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
              { backgroundColor: estilos.pantalla_color_fondo, paddingBottom: 24 },
            ]}
          >
            {/* Header */}
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

            {/* Nav mes */}
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

            {/* Días semana */}
            <View style={calStyles.weekRow}>
              {diasSemana.map((d, i) => (
                <Text key={i} style={[calStyles.weekLabel, { color: estilos.font_sub_color, fontFamily: estilos.font_negrita }]}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Grilla */}
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
                        backgroundColor: sel
                          ? estilos.boton_color_fondo
                          : 'transparent',
                        borderColor: sel ? estilos.boton_color_borde : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: sel ? estilos.font_negrita : estilos.font_normal,
                        color: dia
                          ? sel
                            ? estilos.font_importe_color
                            : estilos.font_color
                          : 'transparent',
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
export default function GastosRegistroop1({ navigation }) {
  const { colors, fonts } = useTheme();

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

  // ── Data referencial ──────────────────────────────────────────────────────
  const [datagastos, setDatagastos] = useState([]);
  const [datamedios, setDatamedios] = useState([]);
  const [dataempresas, setDataempresas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ── Selecciones del usuario ───────────────────────────────────────────────
  const [gastosSeleccionados, setGastosSeleccionados] = useState([]); // [{id, nombre, monto}]
  const [medioSeleccionado, setMedioSeleccionado] = useState(null);   // id del medio activo (botón)
  const [distribucion, setDistribucion] = useState({});               // { idMedio: monto }
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  // ── Modales ───────────────────────────────────────────────────────────────
  const [modalGastos, setModalGastos] = useState(false);
  const [modalEmpresas, setModalEmpresas] = useState(false);
  const [modalDistribuir, setModalDistribuir] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(false);

  const [enviando, setEnviando] = useState(false);

  // ── Carga datos ───────────────────────────────────────────────────────────
  // Normaliza los campos de la API (Id, NombreGasto, etc.) a {id, nombre}
  const cargardatos = async () => {
    try {
      const result = await Generarpeticion('operaciones/ReferencialesCargaGasto/', 'GET', {});
      if (result['resp'] === 200) {
        const gastos = (result['data']['Gastos'] || []).map((g) => ({
          id: g.Id,
          nombre: g.NombreGasto,
          categoria: g.NombreCategoria,
          tipo: g.NombreTipoGasto,
        }));
        const medios = (result['data']['MediosPagos'] || []).map((m) => ({
          id: m.Id,
          nombre: m.NombreMedioPago,
        }));
        const empresas = (result['data']['Empresa'] || []).map((e) => ({
          id: e.Id,
          nombre: e.NombreEmpresa,
          urlImg: e.UrlImg,
        }));
        setDatagastos(gastos);
        setDatamedios(medios);
        setDataempresas(empresas);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los datos referenciales.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargardatos();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const totalGastos = gastosSeleccionados.reduce(
    (a, g) => a + (parseFloat(g.monto) || 0),
    0
  );

  const toggleGasto = (item) => {
    setGastosSeleccionados((prev) =>
      prev.some((g) => g.id === item.id)
        ? prev.filter((g) => g.id !== item.id)
        : [...prev, { ...item, monto: '' }]
    );
  };

  const actualizarMontoGasto = (id, valor) => {
    setGastosSeleccionados((prev) =>
      prev.map((g) => (g.id === id ? { ...g, monto: valor } : g))
    );
  };

  const eliminarGasto = (id) => {
    setGastosSeleccionados((prev) => prev.filter((g) => g.id !== id));
  };

  const seleccionarMedioBoton = (id) => {
    setMedioSeleccionado(id);
    setDistribucion({});
  };

  // ── Envío ─────────────────────────────────────────────────────────────────
  const validar = () => {
    if (gastosSeleccionados.length === 0)
      return 'Seleccioná al menos un gasto.';
    const sinMonto = gastosSeleccionados.some((g) => !g.monto || isNaN(parseFloat(g.monto)));
    if (sinMonto) return 'Completá el monto de todos los gastos.';
    if (datamedios.length > 1 && !medioSeleccionado && Object.keys(distribucion).length === 0)
      return 'Seleccioná o distribuí un medio de pago.';
    if (!empresaSeleccionada) return 'Seleccioná una empresa.';
    if (!fechaSeleccionada) return 'Seleccioná una fecha.';
    return null;
  };

  const construirMedios = () => {
    if (datamedios.length === 1) {
      return [{ idgasto: datamedios[0].id, monto: totalGastos }];
    }
    if (Object.keys(distribucion).length > 0) {
      return Object.entries(distribucion)
        .filter(([, m]) => parseFloat(m) > 0)
        .map(([id, monto]) => ({ idgasto: parseInt(id), monto: parseFloat(monto) }));
    }
    // medio único por botón
    return [{ idgasto: medioSeleccionado, monto: totalGastos }];
  };

  const guardar = async () => {
    const error = validar();
    if (error) { Alert.alert('Atención', error); return; }

    const body = {
      gastos: gastosSeleccionados.map((g) => ({
        idgasto: g.id,
        monto: parseFloat(g.monto),
      })),
      medios: construirMedios(),
      fecha: fechaSeleccionada,
      empresa: empresaSeleccionada.id,
      imagen: null,
    };

    try {
      setEnviando(true);
      const result = await Generarpeticion('operaciones/RegistroMovimientoGastoUser/', 'POST', body);
      if (result['resp'] === 200) {
        Alert.alert('Éxito', 'Movimiento registrado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo registrar el movimiento.');
      }
    } catch (e) {
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

  const hayDistribucion = Object.values(distribucion).some((v) => parseFloat(v) > 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── TÍTULO ───────────────────────────────────────────────────── */}
        <Text style={[styles.titulo, { fontFamily: estilos.font_negrita, color: estilos.font_importe_color }]}>
          Nuevo gasto
        </Text>

        {/* ══ SECCIÓN: GASTOS ══════════════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Gastos" paso="1">
          <TouchableOpacity
            style={[styles.selectorBtn, { borderColor: estilos.cards_color_border, backgroundColor: estilos.cards_color_fondo }]}
            onPress={() => setModalGastos(true)}
          >
            <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 14, flex: 1 }}>
              {gastosSeleccionados.length === 0
                ? 'Seleccionar gastos...'
                : `${gastosSeleccionados.length} gasto(s) seleccionado(s)`}
            </Text>
            <Text style={{ color: estilos.font_importe_color, fontSize: 18 }}>+</Text>
          </TouchableOpacity>

          {/* Lista de gastos seleccionados con input de monto */}
          {gastosSeleccionados.map((g) => (
            <View
              key={g.id}
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
                {g.nombre}
              </Text>
              <TextInput
                value={g.monto?.toString() ?? ''}
                onChangeText={(v) => actualizarMontoGasto(g.id, v)}
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
              <TouchableOpacity onPress={() => eliminarGasto(g.id)} style={{ marginLeft: 8 }}>
                <Text style={{ color: estilos.font_sub_color, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {gastosSeleccionados.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 12 }}>
                Total
              </Text>
              <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 15 }}>
                {totalGastos.toLocaleString('es-PY')}
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ══ SECCIÓN: MEDIOS DE PAGO ══════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Medio de pago" paso="2">
          {datamedios.length === 1 ? (
            // Un solo medio → mostrar info + toggle
            <View style={[styles.gastoRow, { borderColor: estilos.cards_color_border, backgroundColor: estilos.cards_color_fondo }]}>
              <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, flex: 1 }}>
                {datamedios[0].nombre}
              </Text>
              <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_color, fontSize: 13 }}>
                Total: {totalGastos.toLocaleString('es-PY')}
              </Text>
            </View>
          ) : (
            // Múltiples medios → botones
            <>
              <View style={styles.chipRow}>
                {datamedios.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.nombre}
                    selected={medioSeleccionado === m.id && !hayDistribucion}
                    onPress={() => seleccionarMedioBoton(m.id)}
                    estilos={estilos}
                  />
                ))}
              </View>

              {/* Botón distribuir */}
              <TouchableOpacity
                style={[
                  styles.distribuirBtn,
                  {
                    borderColor: hayDistribucion ? estilos.boton_color_borde : estilos.cards_color_border,
                    backgroundColor: hayDistribucion ? estilos.boton_color_fondo : 'transparent',
                  },
                ]}
                onPress={() => setModalDistribuir(true)}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>⇄</Text>
                <Text
                  style={{
                    fontFamily: estilos.font_normal,
                    color: hayDistribucion ? estilos.font_importe_color : estilos.font_sub_color,
                    fontSize: 14,
                  }}
                >
                  {hayDistribucion ? 'Distribución configurada ✓' : 'Distribuir entre medios'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </SectionCard>

        {/* ══ SECCIÓN: EMPRESA ═════════════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Empresa" paso="3">
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
        <SectionCard estilos={estilos} titulo="Fecha" paso="4">
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

        {/* ══ SECCIÓN: IMAGEN ══════════════════════════════════════════════ */}
        <SectionCard estilos={estilos} titulo="Comprobante" paso="5">
          <TouchableOpacity
            style={[
              styles.camaraBtn,
              {
                borderColor: estilos.cards_color_border,
                backgroundColor: estilos.cards_color_fondo,
              },
            ]}
            disabled
          >
            <Text style={{ fontSize: 28 }}>📷</Text>
            <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 13, marginTop: 6 }}>
              Adjuntar imagen
            </Text>
            <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 11, marginTop: 2, opacity: 0.6 }}>
              (próximamente)
            </Text>
          </TouchableOpacity>
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
              Registrar movimiento
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* ── MODALES ───────────────────────────────────────────────────────── */}
      <SearchModal
        visible={modalGastos}
        onClose={() => setModalGastos(false)}
        data={datagastos}
        onSelect={toggleGasto}
        selected={gastosSeleccionados}
        title="Seleccionar gastos"
        estilos={estilos}
        multiSelect
      />

      <SearchModal
        visible={modalEmpresas}
        onClose={() => setModalEmpresas(false)}
        data={dataempresas}
        onSelect={setEmpresaSeleccionada}
        selected={empresaSeleccionada}
        title="Seleccionar empresa"
        estilos={estilos}
        multiSelect={false}
      />

      <DistribuirModal
        visible={modalDistribuir}
        onClose={() => setModalDistribuir(false)}
        medios={datamedios}
        distribucion={distribucion}
        onUpdate={(d) => { setDistribucion(d); setMedioSeleccionado(null); }}
        totalGastos={totalGastos}
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
    marginBottom: 20,
    marginTop: 4,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distribuirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 10,
  },
  camaraBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  guardarBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
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
    maxHeight: '85%',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
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

const distStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
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