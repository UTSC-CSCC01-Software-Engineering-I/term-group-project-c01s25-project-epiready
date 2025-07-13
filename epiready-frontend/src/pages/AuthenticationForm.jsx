import { useState } from "react";
import axios from "axios";

export default function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/auth/${type}`;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(endpoint, { email, password: password });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Request failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2>{type === "login" ? "Log in" : "Sign up"}</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">{type}</button>
    </form>
  );
}
