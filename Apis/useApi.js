// hooks/useApi.js
import { useCallback } from 'react';
import Handelstorage from '../Storage/HandelStorage';
import API_BASE from './ApiBase';
 

export const useApi = (contextActions) => {
  const {
    setActivarsesion,
    reiniciarvalores,
    actualizarEstadocomponente, // si también necesitas manipular UI durante el cierre
  } = contextActions;

  const apiRequest = useCallback(
    async (endpoint, method, body, options = {}) => {
      const { timeout = 10000 } = options;

      // Obtener token y sesión del storage
      const storageData = await Handelstorage('obtener');
      const token = storageData?.token;
      const sesion = storageData?.sesion;

      const isFormData = body instanceof FormData;

      const headers = {
        Authorization: `Bearer ${token}`,
        'X-SESSION-USER': sesion,
      };
      // if (method.toUpperCase() !== 'GET') {
      //   headers['Content-Type'] = 'application/json';
      // }
      if (method.toUpperCase() !== 'GET') {
        if (isFormData) {
          // No establecer Content-Type para FormData (fetch lo completa con boundary)
          // No se hace nada con headers['Content-Type']
        } else {
          headers['Content-Type'] = 'application/json';
        }
      }

      const requestOptions = {
        method: method.toUpperCase(),
        headers,
        // body: method.toUpperCase() !== 'GET' ? JSON.stringify(body) : undefined,
         body: method.toUpperCase() !== 'GET'
          ? (isFormData ? body : JSON.stringify(body))
          : undefined,
      };
      
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        );

        const response = await Promise.race([
          fetch(`${API_BASE}/${endpoint}`, requestOptions),
          timeoutPromise,
        ]);

        const responseText = await response.text();
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          data = responseText;
          if (data.trim().startsWith('<')) {
            console.warn('useApi: respuesta no JSON del servidor', {
              endpoint,
              status: response.status,
              url: response.url,
              text: data.slice(0, 400),
            });
            data = {
              error: 'Respuesta no JSON del servidor',
              raw: data,
            };
          }
        }

        const resp_correcta = [200, 201].includes(response.status);
        if (response.status === 401 || response.status === 403) {
          
          actualizarEstadocomponente('tituloloading', 'Cerrando sesion..');
          actualizarEstadocomponente('loading', true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          actualizarEstadocomponente('tituloloading', '');
          actualizarEstadocomponente('loading', false);

          await Handelstorage('borrar')
          await new Promise((resolve) => setTimeout(resolve, 1000));
          reiniciarvalores();
          setActivarsesion(false);
          return {  resp: response.status, resp_correcta: false,sessionExpired: true };
          
        }else{

            return { data, resp: response.status, resp_correcta,sessionExpired: false };
        }

      } catch (error) {
        return {
          data: { error: error.message || 'Error de red' },
          resp: 500,
          resp_correcta: false,
        };
      }
    },
    [setActivarsesion, reiniciarvalores, actualizarEstadocomponente]
  );

  return apiRequest;
};