import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { LoadingSpinner } from "../widgets/LoadingSpinner";
import { SuccessTick } from "../widgets/SuccessTick";
import {dotenv} from 'dotenv';

;

export default function AddShipmentPopup({ trigger, setAdded }) {
  const [message, setMessage] = useState(null);
  const [addError, setAddError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAdd = (e, close) => {
    e.preventDefault();
    setAddError(false);
    setMessage(null);
    setIsLoading(true);
    setIsSuccess(false);

    const form = e.target;
    if(!form.mode.value || !form.product_name.value || !form.product_type.value ||
      !form.hours.value || !form.aqi.value
      || !form.origin.value || !form.humidity.value
    ) {
      setAddError(true);
      setMessage("You must fill all fields in order to submit the shipment");
      setIsLoading(false);
      return;
    }
    const name = form.product_name.value;
    const mode = form.mode.value;
    const product_type = form.product_type.value;
    const minTemp = form.minTemp.value;
    const maxTemp = form.maxTemp.value;
    const aqi = form.aqi.value;
    const humidity = form.humidity.value;
    const origin = form.origin.value;
    const destination = form.destination.value;
    const time = form.hours.value;

    fetch(`${process.env.VITE_BACKEND_URL}/api/shipments`,
        {
            method: "POST",
            body: JSON.stringify({
              name: name,
              product_type: product_type,
              destination: destination,
              min_temp: minTemp,
              max_temp: maxTemp,
              humidity_sensitivity: humidity,
              aqi_sensitivity: aqi,
              transit_time_hrs: time,
              mode_of_transport: mode,
              origin: origin,
              status: "active",
              risk_factor: "Low",
              current_location: "Waiting for loading"
            }),
            headers: {
              "Authorization": sessionStorage.getItem("token"),
              "Content-Type": "application/json"
            }
        }
    )
    .then(async (res) => {
        console.log("Add Shipment response status: " + res.status);
        let data = {};
        try {
          data = await res.json();
          // eslint-disable-next-line
        } catch (e) {
          setMessage(`Error ${res.status}: Something unexpected happened. Please try again later`);
          setAddError(true);
        }
        if (!res.ok || data.error) {
            setAddError(true);
            setMessage(data.error || `Error ${res.status}: Something unexpected happened. Please try again later`);
            setIsLoading(false);
            throw new Error(data.error || `Error ${res.status}: Something unexpected happened. Please try again later`);
        }
        return data;
    })
    .then(() => {
        setMessage(null);
        setIsSuccess(true);
        setIsLoading(false);
        setAdded();
        setTimeout(() => {
          close();
          setTimeout(() => {
            setIsSuccess(false);
            setMessage(null);
          }, 300);
        }, 900);
        setAddError(false);
    })
    .catch(() => {
      setIsLoading(false);
    });
  }


  // Reset state on close
  const handleClose = () => {
    setAddError(false);
    setMessage(null);
    setIsLoading(false);
    setIsSuccess(false);
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
        border: "1px solid white",
        width: "95vw",
        maxWidth: "400px",
        minWidth: "0"
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
      onClose={handleClose}
    >
      {close => (
        <div className="relative bg-black max-w-[90vw] md:max-w-[400px] w-full rounded-lg p-8 mx-auto flex flex-col items-center shadow-lg min-h-[320px]">
          <button
            className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
            onClick={() => { close(); handleClose(); }}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Create Shipment</h2>
          <div className="flex flex-col items-center w-full flex-1 justify-center min-h-[120px]">
            {isLoading ? (
              <LoadingSpinner />
            ) : isSuccess ? (
              <>
                <SuccessTick />
                <div className="text-green-400 text-center font-semibold mb-2">Shipment created successfully!</div>
              </>
            ) : (
              <>
                <form onSubmit={e => handleAdd(e, close)} className="w-full flex flex-col gap-4">
                  {/* ...existing form fields... */}
                  <input
                    type="text"
                    placeholder="Product Name"
                    name="product_name"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Product Type"
                    name="product_type"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    name="origin"
                    placeholder="Starting Location"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <div className="flex items-center gap-4">
                      <label htmlFor="time" className="text-gray-400 font-medium">
                          Time:
                      </label>
                      <input
                          type="number"
                          name="hours"
                          id="time"
                          placeholder="Hours"
                          className="border border-gray-300 rounded px-2 py-1 w-20"
                          min="0"
                          max="150"
                      />
                      <span className="text-gray-500">Hours</span>
                  </div>
                  <select
                      name="aqi"
                      className="border border-gray-300 bg-black rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      defaultValue=""
                      required
                  >
                      <option value="" disabled>
                      AQI Sensitivity
                      </option>
                      <option className="" value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                  </select>
                  <select
                      name="humidity"
                      className="border border-gray-300 bg-black rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      defaultValue=""
                      required
                  >
                      <option value="" disabled>
                      Humidity Sensitivity
                      </option>
                      <option className="" value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                  </select>
                  <div className="flex items-center gap-4">
                      <label htmlFor="minTemp" className="text-gray-400 font-medium">
                          Temperature:
                      </label>
                      <input
                          type="number"
                          name="minTemp"
                          id="minTemp"
                          placeholder="Min"
                          className="border border-gray-300 rounded px-2 py-1 w-20"
                          min="-300"
                          max="300"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                          type="number"
                          name="maxTemp"
                          id="maxTemp"
                          placeholder="Max"
                          className="border border-gray-300 rounded px-2 py-1 w-20"
                          min="-300"
                          max="300"
                      />
                      <span className="text-gray-500">°C</span>
                  </div>
                  <input
                   className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                   placeholder="Mode Of Transport"
                   name="mode"
                   required
                   ></input>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2 font-semibold cursor-pointer hover:bg-blue-900"
                  >
                    Add Shipment
                  </button>
                </form>
                {addError && <div className="text-red-400 text-center font-semibold mt-2">{message}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </Popup>
  );
}