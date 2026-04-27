import React from 'react';
import {  View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
export default function IcnoAtras() {
    const { colors, fonts } = useTheme();

    return(
        <View>
            <MaterialCommunityIcons name="backburger" size={24} color={colors.screen_componente_estilos.color_texto} />
        </View>
    )

}