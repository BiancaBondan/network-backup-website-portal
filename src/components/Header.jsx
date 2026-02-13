// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const perfil = localStorage.getItem("perfil");

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Equatorial" className="logo" />
      </div>

      <div
        className="header-title"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Portal Backups ****
      </div>

      <div className="header-right">
        <span className="user-info">
          {perfil ? perfil.toUpperCase() : "Usuário"}
        </span>

        <button
          className="btn-logout"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
