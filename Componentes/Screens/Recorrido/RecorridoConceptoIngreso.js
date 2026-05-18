import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import { useApi } from '../../../Apis/useApi';
import Esperando from '../../Procesando/Espera';
import Notificacion from '../../Notificacion/Notificacion';


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
// COMPONENTE PRINCIPAL - RECORRIDO CONCEPTO DE INGRESO
// ═══════════════════════════════════════════════════════════════════════════════
export default function RecorridoConceptoIngreso() {
  const { colors, fonts } = useTheme();
  const navigation = useNavigation();

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

  const { setActivarsesion, reiniciarvalores, actualizarEstadocomponente } = useContext(AuthContext);
  const { recorrido,setRecorrido } = useContext(AuthContext);
  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });

  const [ready, setReady] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [nombreIngreso, setNombreIngreso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoIngreso, setTipoIngreso] = useState(1);

  const [estadonotificacion, setEstadonotificacion] = useState(false);
  const [bodynotificacion, setBodynotificacion] = useState({
    mensaje: '',
    titulo: '',
    is_error: false,
    estado_actualizar: '',
    valor_estado: '',
    navnivel1: '',
    navnivel2: '',
    navnivel3: '',
  });

  const opcionesTipo = [
    { label: 'Fijo', value: 1 },
    { label: 'Ocasional', value: 2 },
  ];

  // ── Volver atrás ──────────────────────────────────────────────────────────
  const volverAtras = () => {
    navigation.goBack();
  };

  // ── Finalizar recorrido ─────────────────────────────────────────────────
  const finalizarRecorrido = () => {
    setRecorrido(false);
  };

  // ── Guardar y finalizar ─────────────────────────────────────────────────
  const guardarYFinalizar = async () => {
    if (!nombreIngreso.trim()) {
      setBodynotificacion({
        titulo: 'CONCEPTO DE INGRESO',
        mensaje: 'El nombre del ingreso es requerido.',
        is_error: true,
        estado_actualizar: '',
        valor_estado: '',
        navnivel1: '',
        navnivel2: '',
        navnivel3: '',
      });
      setEstadonotificacion(true);
      return;
    }

    setEnviando(true);
    setReady(false);

    const formData = new FormData();
    formData.append('nombre', nombreIngreso);
    formData.append('observacion', descripcion);
    formData.append('tipo_ingreso', tipoIngreso);

    try {
      // Ajusta este endpoint según tu API de ingresos
      const endpoint = `ref/OperacionesIngresoUser/`;
      const result = await apiRequest(endpoint, 'POST', formData);

      if (result.sessionExpired) return;

      if (result.resp_correcta) {
        // Finalizar recorrido: marcar como completado
        finalizarRecorrido();
      } else {
        const msj = result.data?.message || 'Error al registrar el ingreso';
        setBodynotificacion({
          titulo: 'CONCEPTO DE INGRESO',
          mensaje: msj,
          is_error: true,
          estado_actualizar: '',
          valor_estado: '',
          navnivel1: '',
          navnivel2: '',
          navnivel3: '',
        });
        setEstadonotificacion(true);
      }
    } catch (e) {
      setBodynotificacion({
        titulo: 'CONCEPTO DE INGRESO',
        mensaje: 'Ocurrió un error al guardar.',
        is_error: true,
        estado_actualizar: '',
        valor_estado: '',
        navnivel1: '',
        navnivel2: '',
        navnivel3: '',
      });
      setEstadonotificacion(true);
    } finally {
      setEnviando(false);
      setReady(true);
    }
  };

  const onOk = () => {
    setEstadonotificacion(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!ready) return <Esperando titulo="Guardando ingreso..." />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {estadonotificacion && (
        <Notificacion
          bodynotificacion={bodynotificacion}
          onOk={onOk}
        />
      )}

      <ScrollView
        style={{ flex: 1, backgroundColor: estilos.pantalla_color_fondo }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ INDICADOR DE PASO ═══ */}
        <View style={styles.pasoContainer}>
          <View style={[styles.pasoDot, { backgroundColor: estilos.font_importe_color }]} />
          <View style={[styles.pasoLine, { backgroundColor: estilos.font_importe_color }]} />
          <View style={[styles.pasoDot, { backgroundColor: estilos.font_importe_color }]} />
          <View style={[styles.pasoLine, { backgroundColor: estilos.font_importe_color }]} />
          <View style={[styles.pasoDot, { backgroundColor: estilos.font_importe_color }]} />
        </View>

        <Text style={[styles.tituloPaso, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
          Paso 3 de 3
        </Text>
        <Text style={[styles.subtitulo, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
          Creá tu primer concepto de ingreso
        </Text>

        {/* ═══ CARD PRINCIPAL ═══ */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: estilos.cards_color_fondo,
            borderColor: estilos.cards_color_border,
          }
        ]}>
          {/* Campo: Nombre */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              NOMBRE INGRESO
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
              placeholder="Ej: Salario, Freelance, Alquiler..."
              placeholderTextColor={estilos.font_sub_color}
              value={nombreIngreso}
              onChangeText={setNombreIngreso}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Campo: Tipo de Ingreso (radio) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              TIPO DE INGRESO
            </Text>
            <RadioButtonGroup
              options={opcionesTipo}
              selectedValue={tipoIngreso}
              onChange={setTipoIngreso}
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
        </View>

        {/* ═══ BOTÓN GUARDAR Y FINALIZAR ═══ */}
        <TouchableOpacity
          style={[
            styles.guardarBtn,
            {
              backgroundColor: estilos.boton_color_fondo,
              borderColor: estilos.boton_color_borde,
              opacity: enviando ? 0.6 : 1,
            },
          ]}
          onPress={guardarYFinalizar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color={estilos.font_importe_color} />
          ) : (
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 15 }}>
              Finalizar y entrar a la app
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ═══ BARRA INFERIOR: VOLVER ATRÁS | OMITIR ═══ */}
      <View style={[styles.footerBar, { backgroundColor: estilos.cards_color_fondo, borderTopColor: estilos.cards_color_border }]}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={volverAtras}
          activeOpacity={0.7}
        >
          <Text style={[styles.footerBtnText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
            ← Volver
          </Text>
        </TouchableOpacity>

        <View style={[styles.footerDivider, { backgroundColor: estilos.cards_color_border }]} />

        <TouchableOpacity
          style={styles.footerBtn}
          onPress={finalizarRecorrido}
          activeOpacity={0.7}
        >
          <Text style={[styles.footerBtnText, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
            Omitir
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  pasoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  pasoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pasoLine: {
    width: 40,
    height: 2,
    marginHorizontal: 6,
  },
  tituloPaso: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
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
  guardarBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerDivider: {
    width: 0.5,
    height: 24,
  },
  footerBtnText: {
    fontSize: 14,
  },
});