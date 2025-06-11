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

export default function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  );
}
