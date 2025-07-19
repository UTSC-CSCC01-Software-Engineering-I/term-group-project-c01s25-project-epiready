
import { useParams } from 'react-router-dom';
import { useState, useEffect, use } from 'react';
import { 
  LineChart, 
  AreaChart, 
  BarChart, 
  PieChart, 
  ComposedChart,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  Area, 
  Bar, 
  Pie, 
  Cell,
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
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
  
  // Mock data for various charts
  const temperatureData = [
    { time: '00:00', internal: 2.1, external: 15.2, minRange: 2.0, maxRange: 3.0 },
    { time: '04:00', internal: 2.3, external: 12.8, minRange: 2.0, maxRange: 3.0 },
    { time: '08:00', internal: 2.8, external: 18.5, minRange: 2.0, maxRange: 3.0 },
    { time: '12:00', internal: 3.2, external: 22.1, minRange: 2.0, maxRange: 3.0 },
    { time: '16:00', internal: 2.9, external: 20.3, minRange: 2.0, maxRange: 3.0 },
    { time: '20:00', internal: 2.4, external: 16.7, minRange: 2.0, maxRange: 3.0 },
    { time: '24:00', internal: 2.2, external: 14.1, minRange: 2.0, maxRange: 3.0 },
  ];

  const humidityData = [
    { time: '00:00', humidity: 45 },
    { time: '04:00', humidity: 47 },
    { time: '08:00', humidity: 52 },
    { time: '12:00', humidity: 58 },
    { time: '16:00', humidity: 55 },
    { time: '20:00', humidity: 49 },
    { time: '24:00', humidity: 46 },
  ];

  const alertsData = [
    { name: 'Temperature', value: 2, color: '#ef4444' },
    { name: 'Humidity', value: 1, color: '#f59e0b' },
    { name: 'Location', value: 0, color: '#10b981' },
    { name: 'System', value: 1, color: '#8b5cf6' },
  ];

  const riskAssessmentData = [
    { factor: 'Temperature', current: 75, max: 100 },
    { factor: 'Humidity', current: 60, max: 100 },
    { factor: 'Transit Time', current: 40, max: 100 },
    { factor: 'Route Safety', current: 85, max: 100 },
    { factor: 'Weather', current: 30, max: 100 },
  ];

  const deliveryTimelineData = [
    { milestone: 'Pickup', planned: 100, actual: 100, status: 'completed' },
    { milestone: 'Transit Hub 1', planned: 100, actual: 100, status: 'completed' },
    { milestone: 'Transit Hub 2', planned: 100, actual: 85, status: 'current' },
    { milestone: 'Final Hub', planned: 100, actual: 0, status: 'pending' },
    { milestone: 'Delivery', planned: 100, actual: 0, status: 'pending' },
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        lat: prev.lat + 0.001,
        lng: prev.lng + 0.001
      }));
    }, 100000);
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
        {tab === 'graphs' && (
          <div className="w-full space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#bfc9d1] mb-2">Analytics Dashboard</h2>
              <p className="text-[#d1d5db] text-lg">Real-time monitoring and historical analysis</p>
            </div>

            {/* Top Row - Temperature and Humidity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Chart */}
              <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-[#bfc9d1] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  Temperature Monitoring (°C)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="internal" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Internal Temp"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="external" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="External Temp"
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minRange" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Min Range"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="maxRange" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Max Range"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Humidity Chart */}
              <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-[#bfc9d1] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></span>
                  Humidity Levels (%)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={humidityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                      name="Current Humidity"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle Row - Alerts and Risk Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts Distribution */}
              <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-[#bfc9d1] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                  Alert Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {alertsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Risk Assessment */}
              <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-[#bfc9d1] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                  Risk Assessment
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskAssessmentData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="factor" type="category" stroke="#9ca3af" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Bar dataKey="current" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row - Delivery Timeline */}
            <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-[#bfc9d1] mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Delivery Timeline Progress
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="milestone" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="planned" 
                    fill="#6b7280" 
                    name="Planned Progress"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="actual" 
                    fill="#10b981" 
                    name="Actual Progress"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-neutral-900 rounded-lg p-4 text-center border-l-4 border-blue-500">
                <div className="text-2xl font-bold text-blue-400">2.3°C</div>
                <div className="text-sm text-[#d1d5db]">Current Temperature</div>
              </div>
              <div className="bg-neutral-900 rounded-lg p-4 text-center border-l-4 border-cyan-500">
                <div className="text-2xl font-bold text-cyan-400">52%</div>
                <div className="text-sm text-[#d1d5db]">Current Humidity</div>
              </div>
              <div className="bg-neutral-900 rounded-lg p-4 text-center border-l-4 border-green-500">
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-sm text-[#d1d5db]">Route Progress</div>
              </div>
              <div className="bg-neutral-900 rounded-lg p-4 text-center border-l-4 border-yellow-500">
                <div className="text-2xl font-bold text-yellow-400">Medium</div>
                <div className="text-sm text-[#d1d5db]">Risk Level</div>
              </div>
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