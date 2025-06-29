import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default function AddShipmentPopup({ trigger, setAdded }) {
  const [message, setMessage] = useState(null);
  const [addError, setAddError] = useState(false);

  const handleAdd = (e, close) => {
      e.preventDefault();
  
      const form = e.target;
      if(!form.mode.value || !form.product.value || !form.hours.value || !form.mins.value || !form.aqi.value
        || !form.origin.value || !form.humidity.value
      ) {
        setAddError(true);
        setMessage("You must fill all fields in order to submit the shipment")
      }
      const mode = form.mode.value;
      const product = form.product.value;
      const range = (form.minTemp.value || "") + " - " + (form.maxTemp.value || "");
      const aqi = form.aqi.value;
      const humidity = form.humidity.value;
      const origin = form.origin.value;
      const destination = form.destination.value;
      const time = form.hours.value;
  
      fetch("http://127.0.0.1:5000/api/shipments/",
          {
              method: "POST",
              body: JSON.stringify({
                product_type: product,
                destination: destination,
                required_temp_range: range,
                humidity_sensitivity: humidity,
                aqi_sensitivity: aqi,
                transit_time_hrs: time,
                risk_factor: "low",
                mode_of_transport: mode,
                status: "On Track",
                origin: origin
              }),
              headers: {
                "Authorization": sessionStorage.getItem("token"),
                "Content-Type": "application/json"
              }
          }
      ).then((res) => {
          if(!res.ok){
              setAddError(true);
          }
          return res.json();
      }).then((res) => {
          if(addError){
            setMessage(res.error || "Something unexpected happen. Please try again later")
          } else {
              setMessage(null);
              setAdded();
              close();
          }
          setAddError(false);
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
        border: "1px solid white",
        width: "95vw",         // Always 95vw
        maxWidth: "400px",     // But never more than 400px
        minWidth: "0"
      }}
      overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
    >

      {close => (

        <div className="relative bg-black max-w-[90vw] md:max-w-[400px] w-full rounded-lg p-8 mx-auto flex flex-col items-center shadow-lg">
          <button
            className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Create Shipment</h2>
          <form onSubmit={e => handleAdd(e, close)} className="w-full flex flex-col gap-4">
            <input
              type="text"
              placeholder="Product Name"
              name="product"
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
                <label htmlFor="minTemp" className="text-gray-400 font-medium">
                    Time:
                </label>
                <input
                    type="number"
                    name="hours"
                    id="minTemp"
                    placeholder="Hours"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    min="0"
                    max="150"
                />
                <span className="text-gray-500">Hours</span>
                <input
                    type="number"
                    name="mins"
                    id="maxTemp"
                    placeholder="Mins"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    min="0"
                    max="60"
                    required
                />
                <span className="text-gray-500">Minutes</span>
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
          {addError && <div>{message}</div>}
        </div>
      )}
    </Popup>
  );
}