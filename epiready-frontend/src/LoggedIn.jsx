import React, { createContext, useState, useContext, useEffect } from "react";

const LoggedIn = createContext();

export function GlobalProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false); // Your global variable

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <LoggedIn.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </LoggedIn.Provider>
  );
}
 
export function useGlobal() {
  return useContext(LoggedIn);
}