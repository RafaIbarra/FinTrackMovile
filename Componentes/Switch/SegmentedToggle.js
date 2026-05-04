import React, { useRef, useEffect, useState } from 'react';
import {View,Text,TouchableOpacity,Animated,StyleSheet} from 'react-native';
import { useTheme } from '@react-navigation/native';

const SegmentedToggle = ({ textoactivo,textoinactivo,value, onValueChange }) => {
  const { colors, fonts } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

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
    texto_color_navigation: colors.navigation_estilos.color_texto,
  };

  // Ancho exacto de cada opción: (ancho total - paddingLeft 4 - paddingRight 4) / 2
  const pillWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [value]);

  // Se desliza exactamente el ancho de una pill, no el 100% de sí mismo
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, pillWidth],
  });

  return (
    <View 
      style={[styles.container, { backgroundColor: estilos.pantalla_color_fondo }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.activeBackground,
          {
            width: pillWidth,
            backgroundColor: estilos.boton_color_borde,
            transform: [{ translateX }],
          },
        ]}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.option}
        onPress={() => onValueChange?.(false)}
      >
        <Animated.Text
          style={[
            styles.text,
            { fontFamily: estilos.font_normal },
            {
              color: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [estilos.texto_color_navigation, estilos.font_sub_color],
              }),
            },
          ]}
        >
          {textoinactivo}
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.option}
        onPress={() => onValueChange?.(true)}
      >
        <Animated.Text
          style={[
            styles.text,
            { fontFamily: estilos.font_normal },
            {
              color: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [estilos.font_sub_color, estilos.texto_color_navigation],
              }),
            },
          ]}
        >
          {textoactivo}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
    height: 40,
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 12,
  },
});

export default SegmentedToggle;