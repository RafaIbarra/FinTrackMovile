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
        
        
        loading:false,
        tituloloading:'ESPERANDO TRANSCRIPCION..',

        compresumen:true,
        dataresumen:[],
        comphome:true,
        datahome:[],
        
        diasmarcados:[],
        isKeyboardVisible : false,
        TipoCambiopass:0,
        
        IdDiaSeleccion:0,
        DiaActual:''
    
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
          sesiondatadate, setSesiondatadate
      }}>
      {children}
    </AuthContext.Provider>
  );
};