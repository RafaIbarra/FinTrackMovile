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


import Gastos from './Componentes/Screens/Gastos/Gastos';
import Ingresos from './Componentes/Screens/Gastos/Ingresos';
const rose= {
    'op1': '#fff1f2',
    'op2': '#ffe4e6',
    'op3': '#fecdd3',
    'op4': '#fda4af',
    'op5': '#fb7185',
    'op6': '#f43f5e',
    'op7': '#e11d48',
    'op8': '#be123c',
    'op9': '#9f1239',
    'op10': '#881337',
    'op11': '#4c0519',
}



const MyTheme = {
    ...DefaultTheme,
    fonts: {
  
  
      regular: { fontFamily: 'SenRegular', fontWeight: 'normal' },
      regularbold: { fontFamily: 'SenBold', fontWeight: 'normal' }, 
      bodyregular: { fontFamily: 'bodyRegular', fontWeight: 'normal' }, 
      bodybold: { fontFamily: 'bodyBold', fontWeight: 'normal' }, 
  
      // regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
      // regularbold: { fontFamily: 'Roboto', fontWeight: 'bold' },
      
    },
      colors: {
        ...DefaultTheme.colors,
   
        background:rose.op3,
        backgroundnotificacion:rose.op1,
        InputTextBackground:rose.op3,
        textbordercoloractive:'rgb(44,148,228)',
        textbordercolorinactive:'gray',
        text:'black',
        textcard:'white',
        textsub:'gray',
        color:'red',
        primary:'white',
        tintcolor:'gray',
        // card: 'rgb(28,44,52)', //color de la barra de navegadores
        //card: '#57DCA3', //color de la barra de navegadores UENO
        card: rose.op5, 
        dateseleccion:"#ff0000",
        
        
  
        commentText:'black',
        bordercolor:'#d6d7b3',
        iconcolor:'white',
        botoncolor:'rgb(44,148,228)',
        // acctionsbotoncolor:'#57DCA3',
        acctionsbotoncolor:rose.op8,
        
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
          <View style={{alignItems:'center',marginTop:10}} >
            <Text style={{ color: colors.textcard,fontSize:30,fontFamily: fonts.regularbold.fontFamily}}>{periodo}</Text>
            <Text style={{ marginTop:-15,color: colors.textcard,fontSize:20,fontFamily: fonts.regularbold.fontFamily}}>{sesiondatadate.nombremesactual}</Text> 
            
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
      <DrawerNav.Screen name="TabsGroup" component={TabsGroup} />
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
      >
       
        
        <Tab.Screen name="Gastos"
         component={Gastos} 
         
         />
         <Tab.Screen name="Ingresos"
         component={Ingresos} 
         
         />

        

      


      </Tab.Navigator>
    );
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