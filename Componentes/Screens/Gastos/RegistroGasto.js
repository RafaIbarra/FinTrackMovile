import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  TextInput, Platform, KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import { useApi } from '../../../Apis/useApi';
import { useRoute } from "@react-navigation/native";

import Notificacion from '../../Notificacion/Notificacion';
import Esperando from '../../Procesando/Espera';
import CabeceraRegistros from '../../CabeceraRegistros/CabaceraRegistros';


// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE RADIO BUTTON NATIVO
// ═══════════════════════════════════════════════════════════════════════════════
const RadioButtonGroup = ({ options, selectedValue, onChange, estilos }) => {
  return (
    <View style={radioStyles.container}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={radioStyles.optionRow}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <View
              style={[
                radioStyles.outerCircle,
                {
                  borderColor: isSelected
                    ? estilos.font_importe_color
                    : estilos.cards_color_border,
                },
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    radioStyles.innerCircle,
                    { backgroundColor: estilos.font_importe_color },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                radioStyles.label,
                {
                  fontFamily: estilos.font_normal,
                  color: isSelected ? estilos.font_color : estilos.font_sub_color,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const radioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  innerCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  label: {
    fontSize: 15,
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE SELECTOR DE CATEGORÍA (chips en grid)
// ═══════════════════════════════════════════════════════════════════════════════
const CategoriaSelector = ({ categorias, selectedId, onChange, estilos }) => {
  if (!categorias || categorias.length === 0) {
    return (
      <Text style={{ fontFamily: estilos.font_normal, color: estilos.font_sub_color, fontSize: 13 }}>
        Sin categorías disponibles
      </Text>
    );
  }

  return (
    <View style={chipStyles.grid}>
      {categorias.map((cat) => {
        const isSelected = selectedId === cat.Id;
        return (
          <TouchableOpacity
            key={cat.Id}
            onPress={() => onChange(cat.Id)}
            activeOpacity={0.75}
            style={[
              chipStyles.chip,
              {
                backgroundColor: isSelected
                  ? estilos.font_importe_color
                  : estilos.pantalla_color_fondo,
                borderColor: isSelected
                  ? estilos.font_importe_color
                  : estilos.cards_color_border,
              },
            ]}
          >
            {/* Indicador seleccionado */}
            {isSelected && (
              <Text style={chipStyles.chipCheck}>✓ </Text>
            )}
            <Text
              style={[
                chipStyles.chipText,
                {
                  fontFamily: isSelected ? estilos.font_negrita : estilos.font_normal,
                  color: isSelected ? '#fff' : estilos.font_color,
                },
              ]}
              numberOfLines={1}
            >
              {cat.NombreCategoria}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const chipStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chipText: {
    fontSize: 13,
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function RegistroGasto({ navigation }) {
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
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);

  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });
  const { params: { IdGasto } } = useRoute();

  const [titulocabecera, setTitulocabecera] = useState('');
  const [tituloespera, setTituloespera] = useState('');
  const [estadonotificacion, setEstadonotificacion] = useState(false);
  const [ready, setReady] = useState(false);
  const [bodynotificacion, setBodynotificacion] = useState({
    mensaje: '',
    titulo: '',
    is_error: false,
    estado_actualizar: 'bandera_registro_concepto_gasto',
    valor_estado: '',
    navnivel1: 'TabBasicosGroup',
    navnivel2: 'StackGastosGroup',
    navnivel3: 'ListadosGastos',
  });

  // ── Estados del formulario ────────────────────────────────────────────────
  const [nombregasto, setNombregasto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipogasto, setTipogasto] = useState(1);
  const [fecharegistro, setFecharegistro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // ── Categorías ────────────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null); // Id numérico

  const opcionesTipo = [
    { label: 'Fijo', value: 1 },
    { label: 'Ocasional', value: 2 },
  ];

  // ── Carga referenciales (categorías) ─────────────────────────────────────
  const carga_referenciales = async () => {
    const endpoint = `ref/DatosBasicosCategoriaUser/`;
    const result = await apiRequest(endpoint, 'GET', {});

    try {
      if (result.sessionExpired) return;
      if (result.resp_correcta) {
        setCategorias(result.data);
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        setBodynotificacion(prev => ({
          ...prev,
          titulo: 'REGISTRO GASTO',
          mensaje: msj,
          is_error: true,
          valor_estado: '',
        }));
        setEstadonotificacion(true);
      }
    } catch (e) {
      setBodynotificacion(prev => ({
        ...prev,
        titulo: 'REGISTRO GASTO',
        mensaje: 'Error cargando categorías',
        is_error: true,
        valor_estado: '',
      }));
      setEstadonotificacion(true);
    }
  };

  // ── Carga datos del gasto (edición) ──────────────────────────────────────
  const carga_registrado = async () => {
    setTituloespera('Carga de datos registrados');
    const endpoint = `ref/ListarGastosUser/${IdGasto}/`;
    const result = await apiRequest(endpoint, 'GET', {});

    try {
      if (result.sessionExpired) return;
      if (result.resp_correcta) {
        const mov = result.data['detalle'][0];
        setNombregasto(mov.NombreGasto);
        setDescripcion(mov.Observacion);
        setFecharegistro(mov.FechaRegistro);
        setTipogasto(mov.TipoGasto);
        setCategoriaSeleccionada(mov.Categoria); // 🔑 marca la categoría del gasto a editar
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        setBodynotificacion(prev => ({
          ...prev,
          titulo: 'REGISTRO GASTO',
          mensaje: msj,
          is_error: true,
          valor_estado: '',
        }));
        setEstadonotificacion(true);
      }
    } catch (e) {
      setBodynotificacion(prev => ({
        ...prev,
        titulo: 'REGISTRO GASTO',
        mensaje: 'Error cargando datos del gasto',
        is_error: true,
        valor_estado: '',
      }));
      setEstadonotificacion(true);
    }
  };

  // ── Efecto inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    const inicializar = async () => {
      setReady(false);
      if (IdGasto === 0) {
        setTitulocabecera('Nuevo Gasto');
        await carga_referenciales();
      } else {
        setTitulocabecera('Editar Gasto');
        // Carga en paralelo: categorías + datos del gasto
        await Promise.all([carga_referenciales(), carga_registrado()]);
      }
      setReady(true);
    };

    inicializar();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setNombregasto('');
    setDescripcion('');
    setTipogasto(1);
    setCategoriaSeleccionada(null);
  };

  const onOk = () => {
    setEstadonotificacion(false);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const guardar = async () => {
    // Validaciones
    if (!nombregasto.trim()) {
      setBodynotificacion(prev => ({
        ...prev,
        titulo: 'REGISTRO GASTO',
        mensaje: 'El nombre del gasto es requerido.',
        is_error: true,
        valor_estado: '',
      }));
      setEstadonotificacion(true);
      return;
    }

    if (!categoriaSeleccionada) {
      setBodynotificacion(prev => ({
        ...prev,
        titulo: 'REGISTRO GASTO',
        mensaje: 'Debés seleccionar una categoría.',
        is_error: true,
        valor_estado: '',
      }));
      setEstadonotificacion(true);
      return;
    }

    setReady(false);
    const esEdicion = IdGasto > 0;
    const formData = new FormData();
    formData.append('nombre', nombregasto);
    formData.append('observacion', descripcion);
    formData.append('tipo_gasto', tipogasto);
    formData.append('categoria', categoriaSeleccionada); // 🔑 categoría seleccionada

    if (esEdicion) formData.append('IdGasto', IdGasto);

    try {
      setEnviando(true);
      const texto_titulo = esEdicion ? 'Actualizando Gasto..' : 'Registrando Gasto..';
      setTituloespera(texto_titulo);

      const endpoint = esEdicion
        ? `ref/OperacionesGastosUser/${IdGasto}/`
        : `ref/OperacionesGastosUser/`;
      const metodo = esEdicion ? 'PUT' : 'POST';
      const result = await apiRequest(endpoint, metodo, formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (result.sessionExpired) return;

      if (result.resp_correcta) {
        if (!esEdicion) resetForm();
        setReady(true);
        const nuevo = !estadocomponente.bandera_registro_concepto_gasto;
        const mensajeExito = esEdicion ? 'Gasto actualizado correctamente' : 'Gasto registrado correctamente';
        setBodynotificacion(prev => ({
          ...prev,
          titulo: 'REGISTRO GASTO',
          mensaje: mensajeExito,
          is_error: false,
          valor_estado: nuevo,
        }));
        setEstadonotificacion(true);
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        setReady(true);
        setBodynotificacion(prev => ({
          ...prev,
          titulo: 'REGISTRO GASTO',
          mensaje: msj,
          is_error: true,
          valor_estado: '',
        }));
        setEstadonotificacion(true);
      }
    } catch (e) {
      setReady(true);
      setBodynotificacion(prev => ({
        ...prev,
        titulo: 'REGISTRO GASTO',
        mensaje: 'Ocurrió un error al guardar.',
        is_error: true,
        valor_estado: '',
      }));
      setEstadonotificacion(true);
    } finally {
      setEnviando(false);
      setReady(true);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!ready) return <Esperando titulo={tituloespera} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {estadonotificacion && (
        <Notificacion
          navigation={navigation}
          bodynotificacion={bodynotificacion}
          onOk={onOk}
        />
      )}

      <CabeceraRegistros
        title={titulocabecera}
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
        {/* ═══ CARD PRINCIPAL ═══ */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: estilos.cards_color_fondo,
            borderColor: estilos.cards_color_border,
          }
        ]}>

          {/* ID Badge (solo edición) */}
          {IdGasto > 0 && (
            <View style={styles.idBadgeContainer}>
              <View style={[styles.idBadge, { backgroundColor: estilos.pantalla_color_fondo }]}>
                <Text style={[styles.idBadgeText, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
                  ID {IdGasto}
                </Text>
              </View>
            </View>
          )}

          {/* Campo: Nombre */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              NOMBRE GASTO
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  fontFamily: estilos.font_normal,
                  color: estilos.font_color,
                  backgroundColor: estilos.pantalla_color_fondo,
                  borderColor: estilos.cards_color_border,
                }
              ]}
              placeholder="Ej: Supermercado, Ande.."
              placeholderTextColor={estilos.font_sub_color}
              value={nombregasto}
              onChangeText={setNombregasto}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Campo: Categoría (chips) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
                CATEGORÍA
              </Text>
              {/* Indicador de selección activa */}
              {categoriaSeleccionada && (
                <Text style={[styles.labelSeleccion, { fontFamily: estilos.font_normal, color: estilos.font_importe_color }]}>
                  ✓ {categorias.find(c => c.Id === categoriaSeleccionada)?.NombreCategoria}
                </Text>
              )}
            </View>
            <CategoriaSelector
              categorias={categorias}
              selectedId={categoriaSeleccionada}
              onChange={setCategoriaSeleccionada}
              estilos={estilos}
            />
          </View>

          {/* Campo: Tipo de Gasto (radio) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              TIPO DE GASTO
            </Text>
            <RadioButtonGroup
              options={opcionesTipo}
              selectedValue={tipogasto}
              onChange={setTipogasto}
              estilos={estilos}
            />
          </View>

          {/* Campo: Descripción */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              DESCRIPCIÓN
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.inputMultiline,
                {
                  fontFamily: estilos.font_normal,
                  color: estilos.font_color,
                  backgroundColor: estilos.pantalla_color_fondo,
                  borderColor: estilos.cards_color_border,
                }
              ]}
              placeholder="Observaciones opcionales..."
              placeholderTextColor={estilos.font_sub_color}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Fecha de registro (solo edición) */}
          {IdGasto > 0 && fecharegistro && (
            <View style={styles.fechaContainer}>
              <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
                FECHA REGISTRO
              </Text>
              <View style={[styles.fechaBadge, { backgroundColor: estilos.pantalla_color_fondo }]}>
                <Text style={[styles.fechaText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
                  {fecharegistro}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ═══ BOTÓN GUARDAR ═══ */}
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
              {IdGasto > 0 ? 'Actualizar Gasto' : 'Registrar Gasto'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 16,
  },
  idBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  idBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  idBadgeText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
  },
  labelSeleccion: {
    fontSize: 11,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  fechaContainer: {
    marginTop: 4,
  },
  fechaBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  fechaText: {
    fontSize: 13,
  },
  guardarBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});