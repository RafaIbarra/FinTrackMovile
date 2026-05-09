import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  TextInput, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert
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
            {/* Círculo exterior */}
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
              {/* Círculo interior (relleno cuando está seleccionado) */}
              {isSelected && (
                <View
                  style={[
                    radioStyles.innerCircle,
                    { backgroundColor: estilos.font_importe_color },
                  ]}
                />
              )}
            </View>

            {/* Label */}
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
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function RegistroIngreso({ navigation }) {
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
  const { params: { IdIngreso } } = useRoute();
  const [titulocabecera, setTitulocabecera] = useState('');

  const [tituloespera, setTituloespera] = useState('');
  const[estadonotificacion,setEstadonotificacion]=useState(false)
  const [ready, setReady] = useState(false);
  const[bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                        titulo:'',
                                                        is_error:false,
                                                        estado_actualizar:'bandera_registro_concepto_ingreso',
                                                        valor_estado:'',
                                                        navnivel1:'TabBasicosGroup',
                                                        navnivel2:'StackIngresosGroup',
                                                        navnivel3:'ConceptosIngresos',
                                                      })
  
  

  // ── Data registrada (para edición) ────────────────────────────────────────
  const [dataingresoregistrado, setDataingresoregistrado] = useState(null);

  // ── Selecciones del usuario ───────────────────────────────────────────────
  const [nombreingreso, setNombreingreso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoingreso, setTipoingreso] = useState(1); // 1 = Fijo, 2 = Ocasional
  const [fecharegistro, setFecharegistro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Opciones para el radio button
  const opcionesTipo = [
    { label: 'Fijo', value: 1 },
    { label: 'Ocasional', value: 2 },
  ];

  // ── Carga datos ───────────────────────────────────────────────────────────
  const carga_registrado = async () => {
    setReady(false)
    setTituloespera('Carga de datos registrados')
    const endpoint = `ref/ListarIngresosUser/${IdIngreso}/`;
    const result = await apiRequest(endpoint, 'GET', {});
    
    try {
      if (result.sessionExpired) {
        return;
      }
      if (result.resp_correcta) {
        const mov = result.data['detalle'][0];
        setNombreingreso(mov.NombreIngreso);
        setDescripcion(mov.Observacion);
        setFecharegistro(mov.FechaRegistro);
        setTipoingreso(mov.TipoIngreso ?? 1);
        setReady(true)
      } else {
        setReady(true)
        const msj = result.data?.message || 'Error en la solicitud';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO INGRESOS',
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
          titulo:'REGISTRO INGRESOS ',
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
    
    if (IdIngreso === 0) {
      setTitulocabecera('Nuevo Ingreso');
      setReady(true)
      
    } else {
      setTitulocabecera(`Editar Ingreso`);
      carga_registrado();
    }
    
  }, []);

  const resetForm = () => {
    setNombreingreso('');
    setDescripcion('');
    setTipoingreso(1);
  };

  const cancelar = () => {
    navigation.goBack();
  };
  const onOk=()=>{
    setEstadonotificacion(false)
  }
  const guardar = async () => {
    setReady(false);
    const esEdicion = IdIngreso > 0;
    const formData = new FormData();
    formData.append('nombre', nombreingreso);
    formData.append('observacion', descripcion);
    formData.append('tipo_ingreso', tipoingreso); // <-- Se envía el tipo
    
    if (esEdicion) formData.append('IdIngreso', IdIngreso);

    try {
      setEnviando(true);
      
      const texto_titulo=esEdicion ? 'Actualizando Ingreso..' : 'Registrando Ingreso..'
      setTituloespera(texto_titulo)
      const endpoint = esEdicion 
        ? `ref/OperacionesIngresoUser/${IdIngreso}/` 
        : `ref/OperacionesIngresoUser/`;
      const metodo = esEdicion ? 'PUT' : 'POST';
      const result = await apiRequest(endpoint, metodo, formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      

      if (result.sessionExpired) {
        return;
      }

      if (result.resp_correcta) {
        if (!esEdicion) resetForm();
        setReady(true);
        const nuevo = !estadocomponente.bandera_registro_concepto_ingreso;
        const mensajeExito = esEdicion ? 'Ingreso actualizado correctamente' : 'Registro del Ingreso';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO INGRESOS',
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
          titulo:'REGISTRO INGRESOS',
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
          titulo:'REGISTRO INGRESOS',
          mensaje: 'Ocurrió un error al guardar.',
          is_error: true,
          valor_estado:''
        }));
        setEstadonotificacion(true)


      
    } finally {
      setEnviando(false);
      setReady(true);
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
        {/* Card principal del formulario */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: estilos.cards_color_fondo,
            borderColor: estilos.cards_color_border,
          }
        ]}>
          
          {/* ID Badge (solo en edición) */}
          {IdIngreso > 0 && (
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
                  ID {IdIngreso}
                </Text>
              </View>
            </View>
          )}

          {/* Campo: Nombre Ingreso */}
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              {
                fontFamily: estilos.font_negrita,
                color: estilos.font_sub_color,
              }
            ]}>
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
              placeholder="Ej: Salario"
              placeholderTextColor={estilos.font_sub_color}
              value={nombreingreso}
              onChangeText={setNombreingreso}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Campo: Tipo de Ingreso (RadioButton) */}
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              {
                fontFamily: estilos.font_negrita,
                color: estilos.font_sub_color,
              }
            ]}>
              TIPO DE INGRESO
            </Text>
            <RadioButtonGroup
              options={opcionesTipo}
              selectedValue={tipoingreso}
              onChange={setTipoingreso}
              estilos={estilos}
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
          {IdIngreso > 0 && fecharegistro && (
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
              {IdIngreso > 0 ? 'Actualizar Ingreso' : 'Registrar Ingreso'}
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