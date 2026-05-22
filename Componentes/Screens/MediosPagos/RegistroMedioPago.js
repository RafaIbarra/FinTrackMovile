import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  TextInput, Modal, FlatList, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert, Image
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../../AuthContext';

import Handelstorage from '../../../Storage/HandelStorage';
import Generarpeticion from '../../../Apis/ApiPeticiones';


import Notificacion from '../../Notificacion/Notificacion';
import Esperando from '../../Procesando/Espera';
import CabeceraRegistros from '../../CabeceraRegistros/CabaceraRegistros';

import { useApi } from '../../../Apis/useApi';
import IcnoAtras from '../../IconoAtras/IconoAtras';
import { useRoute } from "@react-navigation/native";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function RegistroMedioPago({ navigation }) {
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
  const { params: { IdMedio } } = useRoute();
  const [titulo, setTitulo] = useState('');
  
  const [tituloespera, setTituloespera] = useState('');
  const[estadonotificacion,setEstadonotificacion]=useState(false)
  const [ready, setReady] = useState(false);
  const[bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                        titulo:'',
                                                        is_error:false,
                                                        estado_actualizar:'recarga_conceptos_medios',
                                                        valor_estado:'',
                                                        navnivel1:'RootNavigator',
                                                        navnivel2:'TabBasicosGroup',
                                                        navnivel3:'ListadoMediosPagos',
                                                      })
  

  // ── Data registrada (para edición) ────────────────────────────────────────
  const [datamedioregistrado, setDatamedioregistrado] = useState(null);

  // ── Selecciones del usuario ───────────────────────────────────────────────
  const [nombremedio, setNombremedio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecharegistro, setFecharegistro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const actualizarmedio = (valor) => {
    setNombremedio(valor)
  };

  const actualizardescripcion = (valor) => {
    setDescripcion(valor)
  };

  // ── Carga datos ───────────────────────────────────────────────────────────
  const carga_registrado = async () => {
    setReady(false)
    setTituloespera('Carga de datos registrados')
    const endpoint = `ref/ListadoMedioPagosUser/${IdMedio}/`;
    const result = await apiRequest(endpoint, 'GET', {});
    
    try {
      if (result.sessionExpired) {
        return;
      }
      if (result.resp_correcta) {
        const mov = result.data['detalle'][0];
        setNombremedio(mov.NombreMedioPago);
        setDescripcion(mov.Observacion);
        setFecharegistro(mov.FechaRegistro);
        setReady(true)
      } else {
        setReady(true)
        const msj = result.data?.message || 'Error en la solicitud';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO MEDIO PAGO',
          mensaje: msj,
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)
      }
    } catch (e) {
      setReady(true)
      const msj = e || 'Error en la solicitud';
      setBodynotificacion(prevState => ({
        ...prevState,
        titulo:'REGISTRO MEDIO PAGO',
        mensaje: msj,
        is_error: true,
        valor_estado:''
      }));
      setEstadonotificacion(true)
    } finally {
      setReady(true)
    }
  };

  useEffect(() => {
    if (IdMedio === 0) {
      setTitulo('Nuevo Medio Pago');
      setReady(true)
    } else {
      setTitulo(`Editar Medio Pago`);
      carga_registrado();
    }
  }, []);

  const resetForm = () => {
    setNombremedio('');
    setDescripcion('');
  };

  const cancelar = () => {
    navigation.goBack();
  };
  const onOk=()=>{
    setEstadonotificacion(false)
  }

  const guardar = async () => {
    setReady(false);
    const esEdicion = IdMedio > 0;
    const formData = new FormData();
    formData.append('nombre', nombremedio);
    formData.append('descripcion', descripcion);
    
    if (esEdicion) formData.append('IdMedio', IdMedio);

    try {
      setEnviando(true);
      
      const texto_titulo=esEdicion ? 'Actualizando Medio Pago..' : 'Registrando Medio Pago..'
      setTituloespera(texto_titulo)

      const endpoint = esEdicion 
        ? `ref/OperacionesMediosPagosUser/${IdMedio}/` 
        : `ref/OperacionesMediosPagosUser/`;
      const metodo = esEdicion ? 'PUT' : 'POST';
      const result = await apiRequest(endpoint, metodo, formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      

      if (result.sessionExpired) {
        return;
      }

      if (result.resp_correcta) {
        if (!esEdicion) resetForm();
        setReady(true);
        const nuevo = true;
        const mensajeExito = esEdicion ? 'Medio actualizada correctamente' : 'Registro del Medio de Pago';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO MEDIO PAGO',
          mensaje: mensajeExito,
          is_error: false,
          valor_estado:nuevo
        }));
        setEstadonotificacion(true)
      } else {
        const msj = result.data?.message || 'Error en la solicitud';
        setReady(true);
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO MEDIO PAGO',
          mensaje: msj,
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)
      }
    } catch (e) {
      setReady(true);
      setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO MEDIO PAGO',
          mensaje: 'Ocurrió un error al guardar.',
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)
    } finally {
      setEnviando(false);
      setReady(true)
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!ready) return <Esperando titulo={tituloespera}/>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {estadonotificacion && <Notificacion navigation={navigation} bodynotificacion={bodynotificacion} onOk={onOk} />}
      
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
        {/* Card principal del formulario */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: estilos.cards_color_fondo,
            borderColor: estilos.cards_color_border,
          }
        ]}>
          
          {/* ID Badge (solo en edición) */}
          {IdMedio > 0 && (
            <View style={styles.idBadgeContainer}>
              <View style={[
                styles.idBadge,
                { backgroundColor: estilos.pantalla_color_fondo }
              ]}>
                <Text style={[
                  styles.idBadgeText,
                  {
                    fontFamily: estilos.font_negrita,
                    color: estilos.font_sub_color,
                  }
                ]}>
                  ID {IdMedio}
                </Text>
              </View>
            </View>
          )}

          {/* Campo: Nombre Categoría */}
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              {
                fontFamily: estilos.font_negrita,
                color: estilos.font_sub_color,
              }
            ]}>
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
                }
              ]}
              placeholder="Ej: Efectivo, QR"
              placeholderTextColor={estilos.font_sub_color}
              value={nombremedio}
              onChangeText={setNombremedio}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Campo: Descripción */}
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              {
                fontFamily: estilos.font_negrita,
                color: estilos.font_sub_color,
              }
            ]}>
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

          {/* Fecha de registro (solo visible en edición) */}
          {IdMedio > 0 && fecharegistro && (
            <View style={styles.fechaContainer}>
              <Text style={[
                styles.label,
                {
                  fontFamily: estilos.font_negrita,
                  color: estilos.font_sub_color,
                }
              ]}>
                FECHA REGISTRO
              </Text>
              <View style={[
                styles.fechaBadge,
                { backgroundColor: estilos.pantalla_color_fondo }
              ]}>
                <Text style={[
                  styles.fechaText,
                  {
                    fontFamily: estilos.font_normal,
                    color: estilos.font_sub_color,
                  }
                ]}>
                  {fecharegistro}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Botón Guardar */}
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
            <Text style={{ 
              fontFamily: estilos.font_negrita, 
              color: estilos.font_importe_color, 
              fontSize: 15 
            }}>
              {IdMedio > 0 ? 'Actualizar Medio' : 'Registrar Medio'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Espacio inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos base ─────────────────────────────────────────────────────────────
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