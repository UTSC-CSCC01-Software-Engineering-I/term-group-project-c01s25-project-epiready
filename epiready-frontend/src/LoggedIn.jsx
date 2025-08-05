import React, { createContext, useState, useContext, useEffect } from "react";

const LoggedIn = createContext();

export function GlobalProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false); // Your global variable
  const [userOrganization, setUserOrganization] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, []);

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