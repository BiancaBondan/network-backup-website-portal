// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const resp = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const json = await resp.json();

    if (!resp.ok) {
      setErro(json.msg || "Falha no login");
      return;
    }

    localStorage.setItem("token", json.token);

    const payload = JSON.parse(atob(json.token.split(".")[1]));
    localStorage.setItem("perfil", payload.perfil);
    localStorage.setItem("usuario", payload.sub);

    navigate("/");
  }

  return (
        <div className="login-wrapper">
          <div className="login-top">
            <h1>
              Portal Backups<br />
              ****
            </h1>
          </div>

          <div className="login-content">
            <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
