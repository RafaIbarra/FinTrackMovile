import React, { useState, useContext,useEffect } from 'react';
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
// 
// ═══════════════════════════════════════════════════════════════════════════════
export default function RecorridoMedioPago() {
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

  const { setActivarsesion, reiniciarvalores } = useContext(AuthContext);
  const { recorrido,setRecorrido } = useContext(AuthContext);
  const { datarecorrido } = useContext(AuthContext);
  // Estado global del recorrido
  const { actualizarEstadocomponente } = useContext(AuthContext);

  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });

  const [ready, setReady] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [nombremedio, setNombremedio] = useState('');
  const [bntactivo,setBtnactivo]=useState(false)

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

  // ── Omitir recorrido ──────────────────────────────────────────────────────
  const omitirRecorrido = () => {
    setRecorrido(false);
  };

  // ── Guardar y continuar ─────────────────────────────────────────────────
  const continuar =()=>{
     navigation.navigate('RecorridoConceptoIngreso');
  }
  const volverAtras = () => {
    navigation.goBack();
  };
  const guardarYContinuar = async () => {
    if (!nombremedio.trim()) {
        setBtnactivo(true)
        setBodynotificacion({
        titulo: 'MEDIO PAGO',
        mensaje: 'El nombre del medio de pago es requerido.',
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
    formData.append('nombre', nombremedio.trim());

    try {

      
      const endpoint = `ref/OperacionesMediosPagosUser/`;
      const result = await apiRequest(endpoint, 'POST', formData);

      if (result.sessionExpired) return;

      if (result.resp_correcta) {
        // Navegar al siguiente paso del recorrido
        navigation.navigate('RecorridoConceptoIngreso');
      } else {
        const msj = result.data?.message || 'Error al registrar el medio de pago';
        setBodynotificacion({
          titulo: 'MEDIO PAGO',
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
        titulo: 'MEDIO PAGO',
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
  useEffect(() => {
    
    if (!datarecorrido.medios){    
        setBtnactivo(true)
        setTimeout(() => {
        navigation.navigate('RecorridoConceptoIngreso');
        }, 100);
        
    }
    }, []);
  
  // ── Render ────────────────────────────────────────────────────────────────
  if (!ready) return <Esperando titulo="Guardando categoría..." />;

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
          <View style={[styles.pasoLine, { backgroundColor: estilos.cards_color_border }]} />
          <View style={[styles.pasoDot, { backgroundColor: estilos.cards_color_border }]} />
        </View>

        <Text style={[styles.tituloPaso, { fontFamily: estilos.font_negrita, color: estilos.font_color }]}>
          Paso 3 de 4
        </Text>
        <Text style={[styles.subtitulo, { fontFamily: estilos.font_normal, color: estilos.font_sub_color }]}>
          Creá tu primer Medio de Pago
        </Text>

        {/* ═══ CARD PRINCIPAL ═══ */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: estilos.cards_color_fondo,
            borderColor: estilos.cards_color_border,
          }
        ]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: estilos.font_negrita, color: estilos.font_sub_color }]}>
              NOMBRE MEDIO PAGO
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  fontFamily: estilos.font_normal,
                  color: estilos.font_color,
                  backgroundColor: estilos.pantalla_color_fondo,
                  borderColor: estilos.cards_color_border,
                  opacity: bntactivo ? 0.6 : 1,
                }
              ]}
              placeholder="Ej: Efectivo, Qr Ueno..."
              placeholderTextColor={estilos.font_sub_color}
              value={nombremedio}
              onChangeText={setNombremedio}
              autoCapitalize="words"
              editable={datarecorrido.medios}
              maxLength={50}
            />
          </View>
        </View>

        {/* ═══ BOTÓN GUARDAR Y CONTINUAR ═══ */}
        <TouchableOpacity
          style={[
            styles.guardarBtn,
            {
              backgroundColor: estilos.boton_color_fondo,
              borderColor: estilos.boton_color_borde,
              opacity: bntactivo ? 0.6 : 1,
            },
          ]}
          onPress={guardarYContinuar}
          disabled={bntactivo}
        >
          {enviando ? (
            <ActivityIndicator color={estilos.font_importe_color} />
          ) : (
            <Text style={{ fontFamily: estilos.font_negrita, color: estilos.font_importe_color, fontSize: 15 }}>
              Continuar
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ═══ BARRA INFERIOR: OMITIR ═══ */}
      <View style={[
              styles.footerBar, 
              { backgroundColor: estilos.cards_color_fondo, borderTopColor: estilos.cards_color_border }
              ]}>
              {/* ── BOTÓN VOLVER ── */}
              <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={volverAtras}
                  activeOpacity={0.7}
              >
                  <Text style={[
                  styles.footerBtnText, 
                  { fontFamily: estilos.font_normal, color: estilos.font_sub_color }
                  ]}>
                  ← Volver
                  </Text>
              </TouchableOpacity>
      
              {/* ── DIVISOR 1 ── */}
              <View style={[
                  styles.footerDivider, 
                  { backgroundColor: estilos.cards_color_border }
              ]} />
      
              {/* ── BOTÓN OMITIR ── */}
              <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={omitirRecorrido}
                  activeOpacity={0.7}
              >
                  <Text style={[
                  styles.footerBtnText, 
                  { fontFamily: estilos.font_normal, color: estilos.font_sub_color }
                  ]}>
                  Omitir recorrido
                  </Text>
              </TouchableOpacity>
      
              {/* ── DIVISOR 2 + BOTÓN CONTINUAR (condicional) ── */}
              {!datarecorrido.medios && (
                  <>
                  <View style={[
                      styles.footerDivider, 
                      { backgroundColor: estilos.cards_color_border }
                  ]} />
                  
                  <TouchableOpacity
                      style={styles.footerBtn}
                      onPress={continuar}
                      activeOpacity={0.7}
                  >
                      <Text style={[
                      styles.footerBtnText, 
                      { fontFamily: estilos.font_normal, color: estilos.font_importe_color }
                      ]}>
                      Continuar →
                      </Text>
                  </TouchableOpacity>
                  </>
              )}
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
    paddingHorizontal: 0, // El padding horizontal lo maneja cada botón
  },
  footerBtn: {
    flex: 1,           // Se distribuye equitativamente el espacio
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDivider: {
     width: 0.5,
  height: 24,
  alignSelf: 'center',
  },
  footerBtnText: {
    fontSize: 14,
  },
});