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
          setSignupError(true);
          setMessage(
            data.error || "Something unexpected happened. Please try again later"
          );
          // Clear fields on error
          form.email.value = "";
          form.password.value = "";
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
      });
  };

  return (
    <Popup
      trigger={trigger}
      modal
      onClose={cleanup}
      closeOnDocumentClick
      contentStyle={{
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        border: "none",
        width: "95vw", // Always 95vw
        maxWidth: "400px", // But never more than 400px
        minWidth: "0",
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
    >
      {(close) => (
        <div className="relative bg-black max-w-[90vw] md:max-w-[400px] w-full rounded-lg p-8 mx-auto flex flex-col items-center shadow-lg min-h-[280px]">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center flex-grow">
              <SuccessTick />
              <p className="text-[#9fce8f] mt-4">{message}</p>
            </div>
          ) : (
            <>
              <button
                className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
                onClick={close}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">
                Sign Up
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center flex-grow">
                  <LoadingSpinner />
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleSignup(e, close)}
                  className="w-full flex flex-col gap-4"
                >
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </form>
              )}
              {message && !isSuccess && (
                <div
                  className={`mt-4 text-center ${
                    signupError ? "text-red-500" : "text-white"
                  }`}
                >
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Popup>
  );
}