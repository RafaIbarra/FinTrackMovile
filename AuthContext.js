import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [activarsesion, setActivarsesion] = useState(false);
  return (
    <AuthContext.Provider value={{ activarsesion, setActivarsesion }}>
      {children}
    </AuthContext.Provider>
  );
};