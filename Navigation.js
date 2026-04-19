import React,{useContext} from 'react';
import { View,Text,TouchableOpacity } from "react-native";
import { NavigationContainer,DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from '@react-navigation/native';
import { useNavigation  } from "@react-navigation/native";
import { AuthContext } from './AuthContext';


import Login from './Componentes/Screens/Login/Login';
import Settings from './Componentes/Screens/Settings';
import Cargando from './Componentes/Procesando/Cargando';
import DrawerContentInicio from './Componentes/DrawerContentInicio/DrawerContentInicio';
//import GastosDetalle from './Componentes/Screens/GastosDetalle/GastosDetalle';
//import GastosDetalle from './Componentes/Screens/GastosDetalle/GastosDetalleop1';
import GastosDetalle from './Componentes/Screens/GastosDetalle/GastosDetalleop3';


import Gastos from './Componentes/Screens/Gastos/Gastos';
import Ingresos from './Componentes/Screens/Gastos/Ingresos';


const colores_fondos = {
  'op1': '#F5F4F9',
  'op2': '#13161f',
  'op3': '#1c1a17',
  'op4': '#141b2d',
  'op5': '#FAF7F0',
  'op6': '#EDEEF2',
}

const colores_cards = {
  'op1': '#62af8f',
  'op2': '#13161f',
  'op3': '#3AB884',
  'op4': '#57DCA3',
  'op5': '#D4956A',
  'op6': '#E8B84B',
  'op7': '#6DBF8A',
  'op8': '#5B9CF6',
  'op9': '#7B68EE',
  'op10': '#38C9B0',
  'op11': '#C47A3A',
  'op12': '#2A7A5A',
  'op13': '#9B59B6',
  'op14': '#3D6B9E',
  'op15': '#E05C5C',
  'op16': '#3A8A5A',
}

const colores_text = {
  'text_detalle': {
    'op1': '#ffffff',
    'op2': '#e41e1e',
    'op3': '#F5D0B5',  // texto claro para fondos oscuros cálidos
    'op4': '#B8D4FF',  // texto claro para fondos oscuros azulados
    'op5': '#3A2A1A',  // texto oscuro para fondo crema
    'op6': '#1A2A3A',  // texto oscuro para fondo grisáceo
  },
  'text_card': {
    'op1': '#ffffff',
    'op2': '#3AB884',
    'op3': '#3a2a00',  // texto oscuro para cards ámbar/terracota claras
    'op4': '#1A4A35',  // texto oscuro para cards verdes claras
  },
}

const colores_temas = {
  // fondos op2 existente
  'tema_1': {
    fondopantalla:  colores_fondos.op2,
    cards_header:   colores_cards.op1,   // verde menta
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op1,
  },
  'tema_2': {
    fondopantalla:  colores_fondos.op2,
    cards_header:   colores_cards.op3,   // verde 3AB884
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op1,
  },
  'tema_3': {
    fondopantalla:  colores_fondos.op2,
    cards_header:   colores_cards.op4,   // verde 57DCA3
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op1,
  },
  // fondos op3 oscuro cálido
  'tema_4': {
    fondopantalla:  colores_fondos.op3,
    cards_header:   colores_cards.op5,   // terracota
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op3,
  },
  'tema_5': {
    fondopantalla:  colores_fondos.op3,
    cards_header:   colores_cards.op6,   // ámbar
    text_header:    colores_text.text_card.op3,
    text_pantalla:  colores_text.text_detalle.op3,
  },
  'tema_6': {
    fondopantalla:  colores_fondos.op3,
    cards_header:   colores_cards.op7,   // verde salvia
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op3,
  },
  // fondos op4 oscuro azulado
  'tema_7': {
    fondopantalla:  colores_fondos.op4,
    cards_header:   colores_cards.op8,   // azul cielo
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op4,
  },
  'tema_8': {
    fondopantalla:  colores_fondos.op4,
    cards_header:   colores_cards.op9,   // violeta
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op4,
  },
  'tema_9': {
    fondopantalla:  colores_fondos.op4,
    cards_header:   colores_cards.op10,  // turquesa
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op1,
  },
  // fondos op5 claro crema
  'tema_10': {
    fondopantalla:  colores_fondos.op5,
    cards_header:   colores_cards.op11,  // ocre
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op5,
  },
  'tema_11': {
    fondopantalla:  colores_fondos.op5,
    cards_header:   colores_cards.op12,  // verde bosque
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op5,
  },
  'tema_12': {
    fondopantalla:  colores_fondos.op5,
    cards_header:   colores_cards.op13,  // púrpura
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op5,
  },
  // fondos op6 claro grisáceo
  'tema_13': {
    fondopantalla:  colores_fondos.op6,
    cards_header:   colores_cards.op14,  // azul acero
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op6,
  },
  'tema_14': {
    fondopantalla:  colores_fondos.op6,
    cards_header:   colores_cards.op15,  // rojo coral
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op6,
  },
  'tema_15': {
    fondopantalla:  colores_fondos.op6,
    cards_header:   colores_cards.op16,  // verde menta
    text_header:    colores_text.text_card.op1,
    text_pantalla:  colores_text.text_detalle.op6,
  },
}

// ← acá cambiás el tema activo con solo editar esta línea
const tema_colores_activo = colores_temas.tema_1


//tema_colores_activo=
const MyTheme = {
    ...DefaultTheme,
    fonts: {
  
  
      regular: { fontFamily: 'SenRegular', fontWeight: 'normal' },
      regularroboto: { fontFamily: 'RobotoRegular', fontWeight: 'normal' },
      regularrobotobold: { fontFamily: 'RobotoBold' },
      regularbold: { fontFamily: 'SenBold', fontWeight: 'normal' }, 
      bodyregular: { fontFamily: 'bodyRegular', fontWeight: 'normal' }, 
      bodybold: { fontFamily: 'bodyBold', fontWeight: 'normal' }, 
      mirandaregular: { fontFamily: 'MirandaRegular'}, 
      mirandabold: { fontFamily: 'MirandaBold'}, 
      mirandaitalic: { fontFamily: 'MirandaItalic'}, 
      balsamiqregular: { fontFamily: 'BalsamiqSansRegular'}, 
      balsamiqtalic: { fontFamily: 'BalsamiqSansItalic'}, 
      balsamiqbold: { fontFamily: 'BalsamiqSansBold'}, 
      // regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
      // regularbold: { fontFamily: 'Roboto', fontWeight: 'bold' },
      
    },
      colors: {


        //CARDS Y TEXTO CARD
        ...DefaultTheme.colors,
        card:  tema_colores_activo.cards_header,  // debe de tomar de tema_colores_activo
        textcard:tema_colores_activo.text_header,// debe de tomar de tema_colores_activo

        // FONDO COMPONENTES Y TEXTO COMPONENTES
        background:tema_colores_activo.fondopantalla,// debe de tomar de tema_colores_activo
        text:tema_colores_activo.text_pantalla,// debe de tomar de tema_colores_activo

        // COLORES QUE NO USO AUN
        fondoencabezado: colores_cards.op4,
        backgroundnotificacion:colores_fondos.op2,
        InputTextBackground:colores_fondos.op2,
        textbordercoloractive:'rgb(44,148,228)',
        textbordercolorinactive:'gray',
        
        
        textsub:'gray',
        color:'red',
        primary:'white',
        tintcolor:'gray',
      
        
        dateseleccion:"#ff0000",
        

        commentText:'black',
        bordercolor:'#d6d7b3',
        iconcolor:'white',
        botoncolor:'rgb(44,148,228)',
        // acctionsbotoncolor:'#57DCA3',
        acctionsbotoncolor:colores_fondos.op2,
        
        subtitulo:'rgba(32,93,93,255)',
        BotonTextActive:'white',
        BotonActive:'#db004e',

        BotonTextInactive:'#db004e',
        BotonInactive:'#5d001d'

        
        
      },
      
  };


const DrawerNav = createDrawerNavigator();
function DrawerInicio({navigation}) {
  const { colors,fonts } = useTheme();
  const {periodo, setPeriodo} = useContext(AuthContext);
  const {sesiondatadate, setSesiondatadate} = useContext(AuthContext);
  const {sesiondata, setSesiondata} = useContext(AuthContext);
  const { navigate } = useNavigation();  
  const { estadocomponente } = useContext(AuthContext);
  const sizeicon=25
    const sizefont=18
    const div_heigth=15
    const margin_text=-15
  // console.log(sesiondatadate)
  return (
    <DrawerNav.Navigator
    screenOptions={{
        headerShown: !estadocomponente.camaracdc, 
        headerTitle: ({}) => (
          <View style={{alignItems:'center',height:80,marginTop:10}} >
            <Text style={{ color: colors.textcard,fontSize:30,fontFamily: fonts.balsamiqbold.fontFamily}}>{periodo}</Text>
            <Text style={{ marginTop:-10,color: colors.textcard,fontSize:20,fontFamily: fonts.balsamiqbold.fontFamily}}>{sesiondatadate.nombremesactual}</Text> 
            
          </View>
        ),
       
        headerTitleAlign:'center',
        headerStyle:{elevation:0},
        headerTintColor: colors.textcard,
        drawerLabelStyle: {marginLeft: 0,fontFamily: fonts.bodybold.fontFamily},
        tabBarLabelStyle:{borderWidth:1,bordercolor:'red'},
      
      }}
    drawerContent={DrawerContentInicio}
     
    >
      <DrawerNav.Screen name="Home" component={HomeStackGroup} />
      <DrawerNav.Screen name="Settings" component={Settings} />
    </DrawerNav.Navigator>
  );
}





const Tab = createBottomTabNavigator();
function TabsGroup({ navigation }) {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Gastos"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarActiveTintColor: colors.textcard,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Gastos"
        component={Gastos}
        options={{ headerShown: false }}
      />

     <Tab.Screen
  name="Agregar"
  component={Gastos}
  options={{
    headerShown: false,
    tabBarLabel: '',
    tabBarButton: (props) => (
      <TouchableOpacity
        {...props}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        {/* fila de orejas + botón */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          top: -4,
          left: 0,
          right: 0,
        }}>
          {/* oreja izquierda */}
          <View style={{
            width: 30,
            height: 30,
            backgroundColor: colors.background,
          }}>
            <View style={{
              flex: 1,
              borderTopRightRadius: 40,
              backgroundColor: colors.card,
            }} />
          </View>
          <View
            style={{
              backgroundColor:colors.background,
              borderBottomLeftRadius:30,
              borderBottomRightRadius:30

            }}
           >
              <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -10,
              borderWidth:5,
              borderColor:colors.background
              
            }}>
              {/* Aquí puedes agregar un ícono o texto */}
              <Text style={{ color: colors.textcard, fontSize: 24 }}>+</Text>
            </View>
          </View>
          {/* Botón redondo central */}
          

          {/* oreja derecha */}
          <View style={{
            width: 30,
            height: 30,
            backgroundColor: colors.background,
          }}>
            <View style={{
              flex: 1,
              borderTopLeftRadius: 40,
              backgroundColor: colors.card,
            }} />
          </View>
        </View>
      </TouchableOpacity>
    ),
  }}
/>

      <Tab.Screen
        name="Ingresos"
        component={Ingresos}
      />
    </Tab.Navigator>
  );
}

const HomeStack = createNativeStackNavigator();
function HomeStackGroup(){
  return(
    <HomeStack.Navigator >
      <HomeStack.Screen name="TabsGroup" component={TabsGroup} options={{ headerShown: false }}/>
      <HomeStack.Screen name="GastosDetalle" component={GastosDetalle} />
    </HomeStack.Navigator>
  )

}


const Stack = createNativeStackNavigator();
function NavigationLogin(){
  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    
  );
  
  }



function Navigation({notificationData,setNotificationData}) {
    
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { estadocomponente } = useContext(AuthContext);
    return (
  
      <NavigationContainer theme={MyTheme }>
        
    {activarsesion ? (

      
           
              <>
                {/* {estadocomponente.loading && <Cargando />} */}
                <DrawerInicio />
              </>
           


          ) : (
            <>
              {/* {estadocomponente.loading && <Cargando />} */}
              <NavigationLogin />
            </>
          )}
      
  
  
      </NavigationContainer>
    );
  }
  
  export default Navigation;