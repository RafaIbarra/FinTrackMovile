import React,{useState,useEffect,useContext,useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text, StyleSheet,FlatList,TouchableOpacity,SafeAreaView,Animated,TextInput    } from "react-native";

import Handelstorage from "../../../Storage/HandelStorage";
import Generarpeticion from "../../../Apis/ApiPeticiones";
export default function Ingresos ({ navigation  }){

    return(
        <View style={{ flex: 1 }}>
            <Text>
                Listado de Ingresos
            </Text>
        </View>
    )
}

