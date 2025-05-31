import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthForm from "./pages/AuthenticationForm";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
      </Routes>
    </BrowserRouter>
  );
}
