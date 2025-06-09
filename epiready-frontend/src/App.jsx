import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthForm from "./pages/AuthenticationForm";
import ActionLog from './components/ActionLog/ActionLog';
import ShowLogs from "./pages/ShowLogs";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/logs">Login</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/logs" element={<ShowLogs />} />
      </Routes>
    </BrowserRouter>
  );
}
