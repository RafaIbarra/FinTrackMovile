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
export default function RegistroCategoria({ navigation }) {
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation()
  


  const { params: { IdCategoria } } = useRoute();

  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);


  const apiRequest = useApi({ setActivarsesion, reiniciarvalores, actualizarEstadocomponente });
  
  const [titulo, setTitulo] = useState('');
  
  const [ready, setReady] = useState(false);
  const [tituloespera, setTituloespera] = useState('');
  const [estadonotificacion,setEstadonotificacion]=useState(false)
  const [bodynotificacion,setBodynotificacion]=useState({mensaje:'',
                                                                titulo:'',
                                                                is_error:false,
                                                                estado_actualizar:'bandera_registro_categoria',
                                                                valor_estado:'',
                                                                navnivel1:'TabBasicosGroup',
                                                                navnivel2:'StackCategoriasGroup',
                                                                navnivel3:'ListadoCategoriasGastos',
                                                              })

  // ── Data registrada (para edición) ────────────────────────────────────────
  const [datacategoriaregistrado, setDatacategoriaregistrado] = useState(null);

  // ── Selecciones del usuario ───────────────────────────────────────────────
  const [nombrecategoria, setNombrecategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecharegistro, setFecharegistro] = useState('');
  const [enviando, setEnviando] = useState(false);

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

  const actualizarcategoria = (valor) => {
    setNombrecategoria(valor)
  };

  const actualizardescripcion = (valor) => {
    setDescripcion(valor)
  };

  // ── Carga datos ───────────────────────────────────────────────────────────
  const carga_registrado = async () => {
    setReady(false)
    setTituloespera('Carga de datos registrados')
    const endpoint = `ref/ListadoCategoriasUser/${IdCategoria}/`;
    const result = await apiRequest(endpoint, 'GET', {});
    
    try {
      if (result.sessionExpired) {
        return;
      }
      if (result.resp_correcta) {
        const mov = result.data['detalle'][0];
        setNombrecategoria(mov.NombreCategoria);
        setDescripcion(mov.Observacion);
        setFecharegistro(mov.FechaRegistro);
        setReady(true)
      } else {
        setReady(true)
        const msj = result.data?.message || 'Error en la solicitud';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO CATEGORIAS',
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
          titulo:'REGISTRO INGRESOS - Referenciales',
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
    if (IdCategoria === 0) {
      setTitulo('Nueva Categoria');
      setReady(true)
    } else {
      setTitulo(`Editar Categoria`);
      carga_registrado();
    }
  }, []);

  const resetForm = () => {
    setNombrecategoria('');
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
    const esEdicion = IdCategoria > 0;
    const formData = new FormData();
    formData.append('nombre', nombrecategoria);
    formData.append('descripcion', descripcion);
    
    if (esEdicion) formData.append('IdCategoria', IdCategoria);

    try {
      setEnviando(true);
      
      const texto_titulo=esEdicion ? 'Actualizando Categoria..' : 'Registrando Categoria..'
      setTituloespera(texto_titulo)
      const endpoint = esEdicion 
        ? `ref/OperacionesCategoriasGastosUser/${IdCategoria}/` 
        : `ref/OperacionesCategoriasGastosUser/`;
      const metodo = esEdicion ? 'PUT' : 'POST';
      const result = await apiRequest(endpoint, metodo, formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      

      if (result.sessionExpired) {
        return;
      }

      if (result.resp_correcta) {
        if (!esEdicion) resetForm();
        setReady(true);
        const nuevo = !estadocomponente.bandera_registro_categoria;
        const mensajeExito = esEdicion ? 'Categoria actualizada correctamente' : 'Registro de la categoria';
        setBodynotificacion(prevState => ({
          ...prevState,
          titulo:'REGISTRO CATEGORIAS',
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
          titulo:'REGISTRO CATEGORIAS',
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
          titulo:'REGISTRO CATEGORIAS',
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
          {IdCategoria > 0 && (
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
                  ID {IdCategoria}
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
              NOMBRE CATEGORÍA
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
              placeholder="Ej: Alimentación, Transporte..."
              placeholderTextColor={estilos.font_sub_color}
              value={nombrecategoria}
              onChangeText={setNombrecategoria}
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
          {IdCategoria > 0 && fecharegistro && (
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
              {IdCategoria > 0 ? 'Actualizar categoría' : 'Registrar categoría'}
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