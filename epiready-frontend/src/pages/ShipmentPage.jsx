
import { useParams } from 'react-router-dom';
import { useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/maps/MapComponent';
import { useGlobal } from '../LoggedIn';
import { useSocket } from '../Socket';
import ActionModal from '../components/Shipment/ActionModal';


export default function ShipmentPage() {
  const { name } = useParams();
  const [tab, setTab] = useState('info');
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [position, setPosition] = useState({ lat: 43.6800, lng: -79.4000 });
  // eslint-disable-next-line
  const [origin, setOrigin] = useState({ lat: 43.6532, lng: -79.3832 });
  // eslint-disable-next-line
  const [destination, setDestination] = useState({ lat: 43.7001, lng: -79.4163 });
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { loggedIn } = useGlobal();
  const socket = useSocket();

  const googleMapsApiKey = import.meta.env.VITE_MAPS_KEY;


  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        lat: prev.lat + 0.001,
        lng: prev.lng + 0.001
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("Socket initialized:", socket);
    if (!socket) return;
    socket.on("temperature_alert", (data) => {
      console.log("Temperature alert received:", data);
      setLiveData(data);
    });
    return () => {
      socket.off("temperature_alert");
    };
  }, [socket]);


  const fetchShipmentDetails = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shipments/${name}`, {
      method: 'GET',
      headers: {
        'Authorization': sessionStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setShipmentDetails(data);
        console.log("Shipment details fetched:", data);
      })
      .catch((error) => {
        console.error('Error fetching shipment details:', error);
      });
  };

  const createActionLog = (action, cb) => {
    setActionError("");
    setActionLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shipments/${shipmentDetails.id}/actions`, {
      method: 'POST',
      headers: {
        'Authorization': sessionStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add action");
        return response.json();
      })
      .then(() => {
        setShowActionModal(false);
        setActionError("");
        setActionLoading(false);
        if (cb) cb();
        // Optionally refresh logs or show a toast
      })
      .catch((error) => {
        setActionError(error.message);
        setActionLoading(false);
      });
  };



  useEffect(() => {
    fetchShipmentDetails();
  }, [name]);

  
  const shipmentInfo = (info) => (
    <div className="w-full bg-neutral-900 rounded-xl p-6 shadow-lg">
      <h1 className="text-4xl font-bold mb-6 underline text-center text-[#bfc9d1] tracking-wide">
        {info.name}
      </h1>
      <ActionModal
        open={showActionModal}
        onClose={() => { setShowActionModal(false); setActionError(""); }}
        onSubmit={createActionLog}
        loading={actionLoading}
        error={actionError}
      />
      <div className="flex flex-wrap gap-y-8 gap-x-10 justify-between mb-8">
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Location:</span> In ontario, Canada
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Transit Status:</span> {info.current_location}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Risk:</span> {info.risk_factor}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Humidity:</span> {liveData?.humidity}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Internal Temperature:</span> {liveData?.internal_temperature}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>External Temperature:</span> {liveData?.external_temperature}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Origin:</span> {info.origin || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Destination:</span> {info.destination || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Product Type:</span> {info.product_type || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Mode of Transport:</span> {info.mode_of_transport || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Minimum Temperature:</span> {info.min_temp || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Maximum Temperature:</span> {info.max_temp || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>Humidity Sensitivity:</span> {info.humidity_sensitivity || "-"}
        </div>
        <div className="basis-[45%] text-[#d1d5db] text-2xl">
          <span className="font-semibold" style={{ color: "#5e7c4e" }}>AQI Sensitivity:</span> {info.aqi_sensitivity || "-"}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-evenly items-center mt-6 w-full max-w-2xl mx-auto">
        <button
          className="flex-1 px-6 py-3 rounded-lg font-semibold text-white mx-2 my-1 sm:my-0 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[#6B805E] hover:bg-[#4e6147] focus:bg-[#4e6147]"
        >
          Set Transit Status
        </button>
        <button
          className="flex-1 px-6 py-3 rounded-lg font-semibold text-white mx-2 my-1 sm:my-0 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[#6B805E] hover:bg-[#4e6147] focus:bg-[#4e6147]"
          onClick={() => setShowActionModal(true)}
        >
          Add Action
        </button>
        <button
          className="flex-1 px-6 py-3 rounded-lg font-semibold text-white mx-2 my-1 sm:my-0 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[#6B805E] hover:bg-[#4e6147] focus:bg-[#4e6147]"
        >
          Set Shipment Status
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
      <Navbar currentPage="/" />
      <div className="w-screen flex justify-center items-center mt-0 min-h-16 h-16 border-b-1 border-neutral-600 drop-shadow-xl drop-shadow-neutral-700/40 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600">
        <div className="w-9/10 sm:w-4/5 h-full flex gap-4 items-center">
          <div className="flex flex-col items-center justify-center h-full relative">
            <div 
              className={`text-white text-lg text-center cursor-pointer ${
                tab === 'info' ? "font-semibold scale-110" : "font-thin transition-all duration-200 hover:scale-110"
              }`}
              onClick={() => setTab('info')}
            >
              Info
            </div>
            {tab === 'info' && (
              <div className="w-full h-2 bg-[#869F77] rounded-t-full absolute bottom-0 left-0"></div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center h-full relative">
            <div 
              className={`text-white text-lg text-center cursor-pointer ${
                tab === 'location' ? "font-semibold scale-110" : "font-thin transition-all duration-200 hover:scale-110"
              }`}
              onClick={() => setTab('location')}
            >
              Location
            </div>
            {tab === 'location' && (
              <div className="w-full h-2 bg-[#869F77] rounded-t-full absolute bottom-0 left-0"></div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center h-full relative">
            <div 
              className={`text-white text-lg text-center cursor-pointer ${
                tab === 'history' ? "font-semibold scale-110" : "font-thin transition-all duration-200 hover:scale-110"
              }`}
              onClick={() => setTab('history')}
            >
              History
            </div>
            {tab === 'history' && (
              <div className="w-full h-2 bg-[#869F77] rounded-t-full absolute bottom-0 left-0"></div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center h-full relative">
            <div 
              className={`text-white text-lg text-center cursor-pointer ${
                tab === 'graphs' ? "font-semibold scale-110" : "font-thin transition-all duration-200 hover:scale-110"
              }`}
              onClick={() => setTab('graphs')}
            >
              Graphs
            </div>
            {tab === 'graphs' && (
              <div className="w-full h-2 bg-[#869F77] rounded-t-full absolute bottom-0 left-0"></div>
            )}
          </div>
        </div>
      </div>

      <div className='flex-1 flex m-8 w-9/10 sm:w-4/5'>
        {tab === 'info' && shipmentDetails && (
          shipmentInfo(shipmentDetails)
        )}
        {tab === 'location' && (
          <div className="w-full flex justify-center items-center">
            <div style={{ width: "100%", minHeight: 600 }}>
              <MapComponent 
                origin={origin}
                destination={destination}
                personLocation={position} 
                googleMapsApiKey={googleMapsApiKey} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-white text-xl text-center bg-neutral-800 rounded-lg px-8 py-6 shadow-lg">
          Please log in to view this page.
        </div>
        <div className="mt-4">
          <a href="/" className="text-blue-500 hover:underline">Home</a>
        </div>
      </div>
    );
  } else {
    return content;
  }

}