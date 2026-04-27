import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [activarsesion, setActivarsesion] = useState(false);
  const [versionsys,setVersionsys]=useState('1.0')
  const [sesiondata, setSesiondata] = useState();
  const [sesiondatadate, setSesiondatadate] = useState();
  const [periodo, setPeriodo] = useState(false);

  const [estadocomponente,setEstadocomponente]=useState({
        
        datositem:[],
        
        
        
        obtuvopermiso:false,
        isHeaderVisible:true,
        bandera_registro_gasto:false, 
        
        loading:false,
        tituloloading:'CARGANDO..',

       
        
        
        isKeyboardVisible : false,
        TipoCambiopass:0,
        

        alerta_estado:false,
        alerta_componente:[],
        alerto_tipo:'',
        alerta_mensaje:'',
        ComponenteActivoBottonTab:''
        
    
      })
  const reiniciarvalores=()=>{
        
        
        actualizarEstadocomponente('diasmarcados',[])
        actualizarEstadocomponente('obtuvopermiso',false)
    
        
        actualizarEstadocomponente('isHeaderVisible',true)
        
        
        actualizarEstadocomponente('loading',false)
        actualizarEstadocomponente('tituloloading','')
        actualizarEstadocomponente('compresumen',true)
        
        actualizarEstadocomponente('IdDiaSeleccion',0)
        actualizarEstadocomponente('comphome',true)
        actualizarEstadocomponente('datahome',[])
        
        
        
    
      }

  const recargar_componentes=()=>{
        
        actualizarEstadocomponente('compresumen',true)
        actualizarEstadocomponente('comphome',true)
        actualizarEstadocomponente('datahome',[])
        
        
      }
  const asignar_opciones_alerta=(error,titulo,mensaje,grupo_destino,destino,estado_actualizar,valor_estado)=>{
  
    const body_alerta={
      is_error:error,
      titulo:titulo,
      mensaje:mensaje,
      nav_grupo:grupo_destino,
      nav_destino:destino,

      estado_actualizar:estado_actualizar,
      valor_estado:valor_estado
    }
    
    actualizarEstadocomponente('alerta_componente',body_alerta)
    
  }

  const actualizarEstadocomponente = (campo, valor) => {
        setEstadocomponente(prevState => ({
          ...prevState,
          [campo]: valor,
        }));
      };
  return (
    <AuthContext.Provider value={{ 
       activarsesion, setActivarsesion,
          versionsys,setVersionsys,
          sesiondata, setSesiondata,
          estadocomponente,actualizarEstadocomponente,
          reiniciarvalores,
          recargar_componentes,
          periodo, setPeriodo,
          sesiondatadate, setSesiondatadate,
          asignar_opciones_alerta
      }}>
      {children}
    </AuthContext.Provider>
  );
};