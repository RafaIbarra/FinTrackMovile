import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { AuthContext } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Radio del círculo donde se posicionarán los botones
const RADIO = Math.min(width, height) * 0.32;

// Configuración de los 4 botones en posición de reloj
const BOTONES = [
  {
    id: 'categorias',
    label: 'Categorías',
    icon: 'category',
    iconSet: 'MaterialIcons',
    angle: -90, // 12 horas (arriba)
    navigateTo: 'RegistroCategoria',
    paramKey: 'IdCategoria',
    paramValue: 0,
  },
  {
    id: 'gastos',
    label: 'Gastos',
    icon: 'cash-minus',
    iconSet: 'MaterialCommunityIcons',
    angle: 0, // 3 horas (derecha)
  },
  {
    id: 'ingresos',
    label: 'Ingresos',
    icon: 'cash-plus',
    iconSet: 'MaterialCommunityIcons',
    angle: 90, // 6 horas (abajo)
  },
  {
    id: 'medios',
    label: 'Medios Pagos',
    icon: 'wallet-outline',
    iconSet: 'MaterialCommunityIcons',
    angle: 180, // 9 horas (izquierda)
  },
];

function AddBasic({ navigation }) {
  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  const { colors, fonts } = useTheme();
  const { navigate } = useNavigation();

  // Animaciones para cada botón
  const animaciones = useRef(BOTONES.map(() => new Animated.Value(0))).current;
  const animacionX = useRef(new Animated.Value(0)).current;
  const animacionOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada del overlay
    Animated.timing(animacionOverlay, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animación escalonada de los botones (efecto pop-in)
    const animations = animaciones.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
        delay: index * 120, // Escalonado: 0ms, 120ms, 240ms, 360ms
      })
    );

    Animated.stagger(100, animations).start();

    // Animación de la X
    Animated.spring(animacionX, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
      delay: 400,
    }).start();
  }, []);

  const cerrar = () => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(animacionOverlay, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      ...animaciones.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      actualizarEstadocomponente('componente_plus_basic', false);
    });
  };

  const ir_categoria = () => {
    cerrar();
    setTimeout(() => {
      const IdCategoria = 0;
      navigate('StackBasicoskGroup', {
        screen: 'RegistroCategoria',
        params: { IdCategoria },
      });
    }, 200);
  };

  const renderIcono = (boton, color) => {
    const props = { name: boton.icon, size: 28, color };
    return boton.iconSet === 'MaterialIcons' ? (
      <MaterialIcons {...props} />
    ) : (
      <MaterialCommunityIcons {...props} />
    );
  };

  // Calcular posición en círculo
  const getPosicion = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * RADIO,
      y: Math.sin(rad) * RADIO,
    };
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: animacionOverlay,
          backgroundColor: colors.screen_componente_estilos?.color_fondo
            ? colors.screen_componente_estilos.color_fondo + 'E6'
            : 'rgba(0,0,0,0.9)',
        },
      ]}
    >
      {/* Botón X de cierre - Arriba bien marcado */}
      <Animated.View
        style={[
          styles.containerX,
          {
            opacity: animacionX,
            transform: [
              {
                translateY: animacionX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
              {
                scale: animacionX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={cerrar}
          style={[
            styles.botonX,
            {
              backgroundColor: colors.screen_componente_estilos?.color_fondo_cards || '#1e2336',
              borderColor: colors.screen_componente_estilos?.color_borde_cards || '#2a2f45',
            },
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close"
            size={32}
            color={colors.screen_componente_estilos?.color_texto_importante || '#ff4444'}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.textoCerrar,
            {
              fontFamily: fonts?.balsamiqregular?.fontFamily,
              color: colors.screen_componente_estilos?.color_texto_subtitulo || '#8a8fa8',
            },
          ]}
        >
          Cerrar
        </Text>
      </Animated.View>

      {/* Contenedor central con botones en forma de reloj */}
      <View style={styles.relojContainer}>
        {/* Centro decorativo */}
        <View
          style={[
            styles.centroReloj,
            {
              backgroundColor: colors.screen_componente_estilos?.color_fondo_cards || '#1e2336',
              borderColor: colors.screen_componente_estilos?.color_borde_cards || '#2a2f45',
            },
          ]}
        >
          <Text
            style={[
              styles.centroTexto,
              {
                fontFamily: fonts?.balsamiqbold?.fontFamily,
                color: colors.screen_componente_estilos?.color_texto_subtitulo || '#8a8fa8',
              },
            ]}
          >
            +
          </Text>
        </View>

        {/* Botones posicionados en círculo */}
        {BOTONES.map((boton, index) => {
          const pos = getPosicion(boton.angle);
          const anim = animaciones[index];

          return (
            <Animated.View
              key={boton.id}
              style={[
                styles.botonContainer,
                {
                  transform: [
                    { translateX: pos.x },
                    { translateY: pos.y },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                  opacity: anim,
                },
              ]}
            >
              <TouchableOpacity
                onPress={boton.id === 'categorias' ? ir_categoria : cerrar}
                style={[
                  styles.botonCircular,
                  {
                    backgroundColor:
                      colors.screen_componente_estilos?.color_fondo_cards || '#1e2336',
                    borderColor:
                      colors.screen_componente_estilos?.color_borde_cards || '#2a2f45',
                    shadowColor:
                      colors.screen_componente_estilos?.color_texto_importante || '#3AB884',
                  },
                ]}
                activeOpacity={0.8}
              >
                {renderIcono(
                  boton,
                  colors.screen_componente_estilos?.color_texto_importante || '#3AB884'
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.labelBoton,
                  {
                    fontFamily: fonts?.balsamiqregular?.fontFamily,
                    color: colors.screen_componente_estilos?.color_texto || '#ffffff',
                  },
                ]}
                numberOfLines={1}
              >
                {boton.label}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Espaciador inferior para mantener ~100px del bottom */}
      <View style={styles.espaciadorInferior} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 100, // ~100px del margen inferior
  },
  containerX: {
    alignItems: 'center',
    marginTop: 20,
  },
  botonX: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textoCerrar: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  relojContainer: {
    width: RADIO * 2.8,
    height: RADIO * 2.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centroReloj: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  centroTexto: {
    fontSize: 24,
  },
  botonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  botonCircular: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  labelBoton: {
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 80,
  },
  espaciadorInferior: {
    height: 20,
  },
});

export default AddBasic;