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
const RADIO = Math.min(width, height) * 0.28;

const BOTONES = [
  {
    id: 'categorias',
    label: 'Categorías',
    icon: 'category',
    iconSet: 'MaterialIcons',
    angle: -130, // 11 horas (arriba-izquierda)
    navigateTo: 'RegistroCategoria',
    paramKey: 'IdCategoria',
    paramValue: 0,
    screen: 'RegistroCategoria',
    param: 'IdCategoria',
  },
  {
    id: 'gastos',
    label: 'Gastos',
    icon: 'cash-minus',
    iconSet: 'MaterialCommunityIcons',
    angle: -50, // 1 hora (arriba-derecha)
    screen: 'RegistroCategoria',
    param: 'IdCategoria',
  },
  {
    id: 'ingresos',
    label: 'Ingresos',
    icon: 'cash-plus',
    iconSet: 'MaterialCommunityIcons',
    angle: 0, // 3 horas (derecha)
    screen: 'RegistroCategoria',
    param: 'IdCategoria',
  },
  {
    id: 'medios',
    label: 'Medios Pagos',
    icon: 'wallet-outline',
    iconSet: 'MaterialCommunityIcons',
    angle: 180, // 9 horas (izquierda)
    screen: 'RegistroMedioPago',
    param: 'IdMedio',
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
        delay: index * 120,
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
   const ir_medio = () => {
    cerrar();
    setTimeout(() => {
      const IdMedio = 0;
      navigate('StackBasicoskGroup', {
        screen: 'RegistroMedioPago',
        params: { IdMedio },
      });
    }, 200);
  };

  
  const renderIcono = (boton, color) => {
    const props = { name: boton.icon, size: 22, color };
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

  const navegarA = (screen, param) => {
  cerrar();
  setTimeout(() => {
    navigate('StackBasicoskGroup', {
      screen: screen,
      params: { [param]: 0 },
    });
  }, 200);
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
      {/* 
        Contenedor inferior: ocupa la mitad inferior de la pantalla.
        Todo el contenido (botones + cerrar) vive aquí.
        paddingBottom: 100 garantiza que el punto más bajo quede a 100px del borde.
      */}
      <View style={styles.mitadInferior}>
        {/* Contenedor central con botones en forma de reloj */}
        <View style={styles.relojContainer}>
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
                  onPress={() => {
                    if (boton.screen && boton.param) {
                      navegarA(boton.screen, boton.param);
                    } else {
                      cerrar();
                    }
                  }}
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

        {/* Botón X de cierre - debajo del arco de botones */}
        <Animated.View
          style={[
            styles.containerX,
            {
              opacity: animacionX,
              transform: [
                {
                  translateY: animacionX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
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
              size={26}
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
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end', // empuja todo hacia abajo
    alignItems: 'center',
  },
  // Mitad inferior: contiene todo el UI visible
  mitadInferior: {
    width: '100%',
    // La altura máxima es la mitad de la pantalla
    maxHeight: height / 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 100, // punto más bajo a 100px del borde
  },
  containerX: {
    alignItems: 'center',
    marginTop: 16,
  },
  botonX: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  relojContainer: {
    width: RADIO * 2.4,
    height: RADIO * 1.4, // solo mitad superior del círculo + margen
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  botonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  botonCircular: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  labelBoton: {
    marginTop: 6,
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 72,
  },
});

export default AddBasic;