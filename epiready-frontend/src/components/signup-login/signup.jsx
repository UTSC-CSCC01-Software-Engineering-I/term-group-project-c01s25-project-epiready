import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { LoadingSpinner } from "../widgets/LoadingSpinner";
import { SuccessTick } from "../widgets/SuccessTick";

export default function SignupPopup({ trigger }) {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signupError, setSignupError] = useState(false);
  

  const cleanup = () => {
    setMessage(null);
    setSignupError(false);
    setIsSuccess(false);
    setIsLoading(false);
  };

  const handleSignup = (e, close) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setSignupError(false);

    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
          // eslint-disable-next-line
        } catch (e) {
          setSignupError(true);
          setMessage("An error occurred while processing your request. Please try again.");
        }
        if (!res.ok || data.error) {
          throw new Error(data.error || "Something unexpected happened. Please try again later");
        }
        return data;
      })
      .then(() => {
        setIsSuccess(true);
        setMessage("Signed up successfully");
        setSignupError(false);
        // Close modal on success after 2 seconds
        setTimeout(() => {
          close();
        }, 2000);
      })
      .finally(() => {
        setIsLoading(false);
      }).catch((error) => {
      setSignupError(true);
      setIsLoading(false);
      let errorMsg = error.message || "An error occurred during signup. Please try again.";
      if( error.message.includes("Failed to fetch") || error.message.includes("NetworkError") ) {
        errorMsg = "Network error. Please check your internet connection and try again.";
      }
      setMessage(errorMsg);
      form.email.value = '';
      form.password.value = '';
    });
  };

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
        width: "95vw",
        maxWidth: "400px",
        minWidth: "0"
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
      onClose={cleanup}
    >
      {close => (
        <div className="relative bg-black max-w-[90vw] sm:w-[500px] w-full rounded-lg p-6 mx-auto flex flex-col items-center shadow-lg min-h-[270px]">
          <button
            className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
            onClick={() => { close(); cleanup(); }}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Sign Up</h2>
          <div className="flex flex-col items-center w-full flex-1 justify-center min-h-[100px]">
            {isLoading ? (
              <LoadingSpinner />
            ) : isSuccess ? (
              <>
                <SuccessTick />
                <div className="text-green-400 text-center font-semibold mb-2">{message}</div>
              </>
            ) : (
              <>
                <form onSubmit={e => handleSignup(e, close)} className="w-full flex flex-col gap-4">
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
                    Sign Up
                  </button>
                </form>
                {signupError && <div className="text-red-400 text-center font-semibold mt-2">{message}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </Popup>
  );
}