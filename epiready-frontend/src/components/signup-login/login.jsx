import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import {useGlobal} from "../../LoggedIn";

export default function LoginPopup({ trigger }) {
    const [loginError, setLoginError] = useState(null);
    const [message, setMessage] = useState(null);
    const {loggedIn, setLoggedIn} = useGlobal();

  const handleLogin = (e, close) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    fetch("http://127.0.0.1:5000/api/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then((res) => {
        if(!res.ok){
            setLoginError(true);
        }
        return res.json();
    }).then((res) => {
        if(loginError){
            setMessage(res.error || "Something unexpected happen. Please try again later")
        } else {
            sessionStorage.setItem("token", "Bearer " + res.token);
            setLoggedIn(true);
            setMessage("Logged in successfully");
            close();
        }
    });
  }

  return (
    <Popup
      trigger={trigger}
      modal
      closeOnDocumentClick
      contentStyle={{
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        border: "none",
        width: "95vw",         // Always 95vw
        maxWidth: "400px",     // But never more than 400px
        minWidth: "0"
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
    >
      {close => (
        <div className="relative bg-black max-w-[90vw] sm:w-[500px] w-full rounded-lg p-8 mx-auto flex flex-col items-center shadow-lg">
          <button
            className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Welcome Back</h2>
          <form onSubmit={e => handleLogin(e, close)} className="w-full flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
            >
              Log In
            </button>
          </form>
          {loginError && <div>{message}</div>}
        </div>
      )}
    </Popup>
  );
}