import { useParams } from 'react-router-dom';
import { useState, useEffect, use } from 'react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/maps/MapComponent';

export default function ShipmentPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('info');
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [position, setPosition] = useState({lat: 43.6800, lng: -79.4000});


  const origin = { lat: 43.6532, lng: -79.3832 }; // Toronto, ON (Origin)
  const destination = { lat: 43.7001, lng: -79.4163 }; // North York, ON (Destination)
  const personLocation = { lat: 43.6800, lng: -79.4000 }
  const googleMapsApiKey = import.meta.env.VITE_MAPS_KEY;


  // const onLoad = (map) => {
  //   mapRef.current = map;
  //   // Add marker manually to avoid re-rendering map
  //   const marker = new window.google.maps.Marker({
  //     position,
  //     map,
  //     title: 'My Marker'
  //   });
  //   markerRef.current = marker;
  // };

  // Update position every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        lat: prev.lat + 0.001,
        lng: prev.lng + 0.001
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // const fetchShipmentDetails = () => {
  //   // Fetch shipment details using the id
  //   fetch(`http://localhost:3000/api/shipments/${id}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // Handle the shipment details
  //       setShipmentDetails(data);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching shipment details:', error);
  //     });
  // };

//   useEffect(() => {
//     fetchShipmentDetails();
//   }, [id]);

  const shipmentInfo = (info) => (
    <div className='w-full'>
      <h1 className="text-4xl font-bold mb-2 underline">
        {info.name}
      </h1>
      <div className="flex flex-wrap gap-4">
        <div className="basis-[45%] text-white"><span>Location:</span> {info.location}</div>
        <div className="basis-[45%] text-white">Status: {info.status}</div>
        <div className="basis-[45%] text-white">Item 3</div>
        <div className="basis-[45%] text-white">Item 4</div>
      </div>
    </div>
  );

  return (
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
        {tab === 'info' && (
          shipmentInfo({
            name: shipmentDetails ? shipmentDetails.product_type : 'COVID-19 Vaccines',
            location: shipmentDetails ? shipmentDetails.destination : '123 Main Street, Anytown, CA',
            status: shipmentDetails ? shipmentDetails.status || 'On track' : 'On track', 
          })
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
}






  // const tabs = [
  //   { id: 'info', label: 'Info' },
  //   { id: 'location', label: 'Location' },
  //   { id: 'history', label: 'History' },
  //   { id: 'graphs', label: 'Graphs' }
  // ];

  // const fetchShipmentDetails = () => {
  //   // Fetch shipment details using the id
  //   fetch(`http://localhost:5000/api/shipments/${id}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setShipmentDetails(data);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching shipment details:', error);
  //     });
  // };

  // useEffect(() => {
  //   fetchShipmentDetails();
  // }, [id]);

  // const renderTabContent = () => {
  //   if (!shipmentDetails) {
  //     return <div className="text-white">Loading...</div>;
  //   }

  //   switch (tab) {
  //     case 'info':
  //       return (
  //         <div className="text-white space-y-8">
  //           <div>
  //             <h1 className="text-4xl font-bold mb-2 underline">
  //               {shipmentDetails.product_type || 'COVID-19 Vaccines'}
  //             </h1>
  //           </div>

  //           <div>
  //             <h2 className="text-xl font-semibold mb-2 underline">Location</h2>
  //             <p className="text-lg">
  //               {shipmentDetails.destination || '123 Main Street, Anytown, CA'}
  //             </p>
  //           </div>

  //           <div>
  //             <h2 className="text-xl font-semibold mb-2 underline">Description</h2>
  //             <p className="text-lg">
  //               The shipment has {shipmentDetails.aqi_sensitivity || 'low'} aqi sensitivity 
  //               and {shipmentDetails.humidity_sensitivity || 'medium'} humidity sensitivity and is being carried
  //               on a {shipmentDetails.mode_of_transport || 'truck'}
  //             </p>
  //           </div>

  //           <div>
  //             <h2 className="text-xl font-semibold mb-2 underline">Status</h2>
  //             <p className="text-lg text-green-400">
  //               {shipmentDetails.status || 'On track'}
  //             </p>
  //           </div>

  //           <div>
  //             <h2 className="text-xl font-semibold mb-2 underline">Temperature</h2>
  //             <p className="text-lg">
  //               {shipmentDetails.required_temp_range || '2-8 Degrees Celsius'}
  //             </p>
  //           </div>
  //         </div>
  //       );
  //     case 'location':
  //       return <div className="text-white">Location content here</div>;
  //     case 'history':
  //       return <div className="text-white">History content here</div>;
  //     case 'graphs':
  //       return <div className="text-white">Graphs content here</div>;
  //     default:
  //       return null;
  //   }
  // };

  // return (
  //   <div className="bg-[#1D1D1D] min-h-screen flex flex-col">
  //     <Navbar currentPage="/" />
      
  //     {/* Tab Navigation */}
  //     <div className="w-full flex justify-center border-b border-neutral-600">
  //       <div className="w-9/10 sm:w-4/5 h-16 flex items-center">
  //         <div className="flex gap-8">
  //           {tabs.map((tabItem) => (
  //             <button
  //               key={tabItem.id}
  //               onClick={() => setTab(tabItem.id)}
  //               className={`px-4 py-2 text-lg font-medium transition-colors ${
  //                 tab === tabItem.id
  //                   ? 'text-white border-b-2 border-green-400'
  //                   : 'text-gray-400 hover:text-white'
  //               }`}
  //             >
  //               {tabItem.label}
  //             </button>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     {/* Main Content */}
  //     <div className="flex-1 w-full flex justify-center">
  //       <div className="w-9/10 sm:w-4/5 py-8">
  //         {renderTabContent()}
  //       </div>
  //     </div>
  //   </div>
  // );
