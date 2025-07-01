import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import AuthForm from "./pages/AuthenticationForm";
import ActionLog from './components/ActionLog/ActionLog';
import ShowLogs from "./components/ActionLog/ShowLogs";
import Home from "./pages/Home";
import Credits from "./pages/Credits";
import Track from "./pages/Track";
import Shipments from "./pages/Shipments";
import Monitor from "./pages/Monitor";
import Alerts from "./pages/Alerts";
import { GlobalProvider } from "./LoggedIn";
import ShipmentPage from "./pages/ShipmentPage";
import MapComponent from "./components/maps/MapComponent";


export default function App() {

  const origin = { lat: 43.6532, lng: -79.3832 }; // Toronto, ON (Origin)
  const destination = { lat: 43.7001, lng: -79.4163 }; // North York, ON (Destination)
  const personLocation = { lat: 43.6800, lng: -79.4000 }
  const googleMapsApiKey = import.meta.env.VITE_MAPS_KEY;

  return (
    <GlobalProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/track" element={<Track />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/shipments/:id" element={<ShipmentPage />} />
        <Route path="/map" element={
          <MapComponent 
            origin={origin} 
            destination={destination} 
            personLocation={personLocation} 
            googleMapsApiKey={googleMapsApiKey} 
          />
        } />
      </Routes>
    </BrowserRouter>
    <div id="popup-root" />
    </GlobalProvider>
  );
}
