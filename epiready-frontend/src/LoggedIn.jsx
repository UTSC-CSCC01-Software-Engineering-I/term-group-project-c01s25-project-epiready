import React, { createContext, useState, useContext } from "react";

const LoggedIn = createContext();

export function GlobalProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false); // Your global variable
  const [userOrganization, setUserOrganization] = useState(null);

  return (
    <LoggedIn.Provider value={{ 
      loggedIn, 
      setLoggedIn, 
      userOrganization, 
      setUserOrganization 
    }}>
      {children}
    </LoggedIn.Provider>
  );
}

export function useGlobal() {
  return useContext(LoggedIn);
}