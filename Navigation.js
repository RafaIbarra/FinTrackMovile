import React,{useContext} from 'react';
import { View,Text,TouchableOpacity,StyleSheet } from "react-native";
import { NavigationContainer,DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from '@react-navigation/native';
import { useNavigation  } from "@react-navigation/native";
import { AuthContext } from './AuthContext';

import Svg, { Rect, Circle, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



import Cargando from './Componentes/Procesando/Cargando';
import DrawerContentInicio from './Componentes/DrawerContentInicio/DrawerContentInicio';


//Screens
import Login from './Componentes/Screens/Login/Login';
import Settings from './Componentes/Screens/Settings';
import Modelo from './Componentes/Screens/Modelo/Modelo';




import ListadoMovimientosGastos from './Componentes/Screens/MovimientosGastos/ListadoMovimientosGastos';
import DetalleMovimientoGasto from './Componentes/Screens/MovimientosGastos/DetalleMovimientoGasto';
import RegistroMovimientoGasto from './Componentes/Screens/MovimientosGastos/RegistroMovimientoGasto';

// import MovimientosIngresos from './Componentes/Screens/MovimientosIngresos/ListadoMovimientosIngresos';

import ListadoMovimientosIngresos from './Componentes/Screens/MovimientosIngresos/ListadoMovimientosIngresos';
import DetalleMovimientoIngreso from './Componentes/Screens/MovimientosIngresos/DetalleMovimientoIngreso';
import RegistroMovimientoIngreso from './Componentes/Screens/MovimientosIngresos/RegistroMovimientoIngreso';



import ResumenMovimientos from './Componentes/Screens/ResumenMovimientos/ResumenMovimientos';

import GraficaOverview from './Componentes/Screens/Estadisticas/Estadisticas';






import { tema_colores_activo } from './Utils/Temas';


//////////////iconos///////////////////////////////
import { Ionicons } from "@expo/vector-icons";
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';




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
        background: tema_colores_activo.screen_componente_estilos.color_fondo,
        card:tema_colores_activo.navigation_estilos.color_fondo,
        ...tema_colores_activo,
        
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
  const sizeicon=18
  const sizefont=18
  const div_heigth=20
  // const margin_text=-15
  const color_texto=colors.screen_componente_estilos.color_texto
  const color_icono=colors.screen_componente_estilos.color_texto
  const color_linea=colors.screen_componente_estilos.color_texto_importante
  // console.log(sesiondatadate)
  return (
    <DrawerNav.Navigator
      screenOptions={{
        
        headerShown: !estadocomponente.camaracdc, 
        headerTitle: ({}) => (
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            color: colors.navigation_estilos.color_texto,
            fontSize: 30,
            fontFamily: fonts.balsamiqbold.fontFamily,
            lineHeight: 36,
          }}>
            {periodo}
          </Text>
          <Text style={{
            color: colors.navigation_estilos.color_texto,
            fontSize: 20,
            fontFamily: fonts.balsamiqbold.fontFamily,
            lineHeight: 24,
          }}>
            {sesiondatadate.nombremesactual}
          </Text>
        </View>
        ),
       
        headerTitleAlign:'center',
        headerStyle:{elevation:0},
        headerTintColor: colors.navigation_estilos.color_texto,
        drawerLabelStyle: {marginLeft: 0,fontFamily: fonts.bodybold.fontFamily},
        tabBarLabelStyle:{borderWidth:1,bordercolor:'red'},
        backgroundColor:'red',
        color:'red',
        drawerStyle: {backgroundColor: colors.screen_componente_estilos.color_fondo_cards}
        // drawerStyle: {backgroundColor:'#FAF7F0'} // posible para el tema 7
        
      
      }}
      drawerContent={DrawerContentInicio}
    >
      <DrawerNav.Screen 
        name="Home" 
        component={HomeStackGroup} 
        options={{
         
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Inicio
                      </Text>
                    </View>)
          },
          
          drawerIcon: ({size, color})=>(<AntDesign name="home" size={sizeicon} color={color_icono} />),
          drawerItemStyle:{borderBottomWidth:1,
            borderBottomColor:color_linea,
            marginBottom:5}
          
          }}
      />

      <DrawerNav.Screen name="ConceptosIngresos" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Conceptos Ingresos
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <Feather name="trending-up"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

       />

      <DrawerNav.Screen name="InicioCategoriaGastos" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Categoria Gastos
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <Feather name="align-left"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

      />

      <DrawerNav.Screen name="GastosStackGroup" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Conceptos Gastos
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <Feather name="trending-down"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

      />
      <DrawerNav.Screen name="MediosPagosStackGroup" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Medios de Pagos
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <FontAwesome6 name="hand-holding-dollar"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

       />
      
      <DrawerNav.Screen name="ConsultaIA" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Consulta a la IA
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <MaterialCommunityIcons name="robot-confused-outline"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

       />

       <DrawerNav.Screen name="ModeloScreen" 
        component={Modelo}
        options={{
          drawerLabel: ({ color, size,focused }) => {
            
            let familyname
            familyname= focused ? fonts.balsamiqbold.fontFamily : fonts.balsamiqregular.fontFamily;
            
            return(<View style={{height:div_heigth,alignContent:'center',justifyContent:'center'}}> 
                      <Text style={{fontFamily: familyname,color:color_texto}}> 
                        Modelo pantalla
                      </Text>
                    </View>)
          },
          drawerIcon: ({size, color})=>(
            <FontAwesome name="wpforms"  size={sizeicon} color={color_icono} />
          ),
          drawerItemStyle:{borderBottomWidth:1,borderBottomColor:color_linea,marginBottom:5}
         }}

       />
      
    </DrawerNav.Navigator>
  );
}




const BTN_R = 28;
const OVERHANG = 27; // cuánto sobresale arriba del tab bar
const TAB_H = 60;   // altura del tab bar
const W = BTN_R * 4; // ancho del área SVG (112px)
const cx = W / 2;

// El círculo tiene centro en y=OVERHANG dentro del SVG
// El SVG arranca OVERHANG px antes del tab bar (marginTop negativo)
const CentralTabButton = ({ onPress, colors   }) => {
  const tabColor = colors.navigation_estilos.color_fondo;
  const iconColor = colors.navigation_estilos.color_texto;
  const borderColor = colors.screen_componente_estilos.color_fondo;
  const navigation = useNavigation(); 
  const { estadocomponente, actualizarEstadocomponente } = useContext(AuthContext);
  
  const handlePress = () => {
    // Determinar a qué pantalla navegar según el componente activo
    if (estadocomponente.ComponenteActivoBottonTab === 'ListadoMovimientosIngresos') {
      navigation.navigate('RegistroMovimientoIngreso');
    } else {
      
      navigation.navigate('RegistroMovimientoGasto');
    }
    
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: -10,
        
      }}
    >
      <Svg width={W} height={TAB_H + OVERHANG}>
        {/* Fondo del tab bar dentro del SVG */}
        <Rect
          x={0}
          y={OVERHANG}
          width={W}
          height={TAB_H}
          fill={tabColor}
        />

        {/* Círculo con centro en y=OVERHANG → sobresale OVERHANG px arriba */}
        <Circle
          cx={cx}
          cy={OVERHANG}
          r={BTN_R}
          fill={tabColor}
          stroke={borderColor}
          strokeWidth={3}
        />

        {/* Ícono + centrado en el círculo */}
        <SvgText
          x={cx}
          y={OVERHANG}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={28}
          fontWeight="bold"
          fill={iconColor}
        >
          +
        </SvgText>
      </Svg>
    </TouchableOpacity>
  );
};

const Tab = createBottomTabNavigator();
function TabsGroup({ navigation }) {
  
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="ListadoMovimientosGastos"
      screenOptions={{
        tabBarStyle: {
          backgroundColor:colors.card,
          height: 60,        // altura fija sin espacio extra
          paddingBottom: 0,  // el SafeAreaView del App.js ya reservó el espacio inferior
        },
       
      }}
    >
      <Tab.Screen
        name="ListadoMovimientosGastos"
        component={ListadoMovimientosGastos}
         options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ListadoMovimientosIngresos"
        component={ListadoMovimientosIngresos}
        options={{ headerShown: false }}
      />

      <Tab.Screen
              name="Agregar"
              component={RegistroMovimientoGasto}
              options={{
                headerShown: false,
                tabBarLabel: '',
                tabBarButton: (props) => (
                  <CentralTabButton
                  onPress={props.onPress}
                  colors={colors}
                  
                  
                  />
                ),
              }}
      />


      <Tab.Screen
        name="ResumenMovimientos"
        component={ResumenMovimientos}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Estats"
        component={GraficaOverview}
        options={{ headerShown: false }}
      />
      
    </Tab.Navigator>
  );
}

const HomeStack = createNativeStackNavigator();

function HomeStackGroup(){
  const { colors,fonts } = useTheme();
  
  return(
    <HomeStack.Navigator >
      <HomeStack.Screen name="TabsGroup" component={TabsGroup} options={{ headerShown: false }}/>

      <HomeStack.Screen name="DetalleMovimientoGasto" 
        component={DetalleMovimientoGasto} 
        options={({ navigation }) => ({
          headerTitle: 'Detalle del Gasto',
          headerTitleAlign: 'left',
          headerStyle: {

            backgroundColor:colors.background,
          },
          
          headerTitleStyle: {
            fontFamily: fonts.balsamiqregular.fontFamily,  // ← acá va la fuente
            color: colors.screen_componente_estilos.color_texto,
            fontSize: 16,
            
          },
          headerTintColor: colors.textcard,
          
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <MaterialCommunityIcons name="backburger" size={24} color={colors.screen_componente_estilos.color_texto} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ marginRight: 20 }}>
                <AntDesign name="delete" size={24} color="rgb(205,92,92)" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 10 }}>
                <AntDesign name="edit" size={24} color={colors.screen_componente_estilos.color_texto} />
              </TouchableOpacity>
            </View>
          ),

        })}
      /> 

      <HomeStack.Screen name="RegistroMovimientoGasto" 
        component={RegistroMovimientoGasto} 
        options={{ headerShown: false }}
      /> 

      <HomeStack.Screen name="DetalleMovimientoIngreso" 
        component={DetalleMovimientoIngreso} 
        options={({ navigation }) => ({
          headerTitle: 'Detalle del Ingreso',
          headerTitleAlign: 'left',
          headerStyle: {

            backgroundColor:colors.background,
          },
          
          headerTitleStyle: {
            fontFamily: fonts.balsamiqregular.fontFamily,  // ← acá va la fuente
            color: colors.screen_componente_estilos.color_texto,
            fontSize: 16,
            
          },
          headerTintColor: colors.textcard,
          
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <MaterialCommunityIcons name="backburger" size={24} color={colors.screen_componente_estilos.color_texto} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ marginRight: 20 }}>
                <AntDesign name="delete" size={24} color="rgb(205,92,92)" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 10 }}>
                <AntDesign name="edit" size={24} color={colors.screen_componente_estilos.color_texto} />
              </TouchableOpacity>
            </View>
          ),

        })}
      />

      <HomeStack.Screen name="RegistroMovimientoIngreso" 
        component={RegistroMovimientoIngreso} 
        options={{ headerShown: false }}
      /> 
      
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
        {/* <Cargando /> */}
        {activarsesion ? (
              <>
                {estadocomponente.loading && <Cargando />}
                <DrawerInicio />
              </>
          ) : (
            <>
              {estadocomponente.loading && <Cargando />}
              <NavigationLogin />
            </>
          )}
      
  

      </NavigationContainer>
    );
  }
  
  export default Navigation;