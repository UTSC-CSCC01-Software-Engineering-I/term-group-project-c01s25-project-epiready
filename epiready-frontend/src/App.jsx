import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthForm from "./pages/AuthenticationForm";
import Home from "./pages/Home";
import Credits from "./pages/Credits";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/credits" element={<Credits />} />
      </Routes>
    </BrowserRouter>
  );
}
