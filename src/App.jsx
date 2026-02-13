// src/App.jsx
import { Routes, Route, Navigate, Router } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Estado from "./pages/Estado";
import Cidade from "./pages/Cidade";
import Dispositivo from "./pages/Dispositivo";
import BuscarDados from "./pages/BuscarDados";
import BuscarBackup from "./pages/BuscarBackup";
import Pendencias from "./pages/Pendencias";
import AdicionarDispositivo from "./pages/AdicionarDispositivo";
import "./styles/layout.css";

function isAuthenticated() {
  return !!localStorage.getItem("token");}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}>
        <Route path="estado/:uf" element={<Estado />} />
        <Route path="estado/:uf/:cidade" element={<Cidade />} />
        <Route path="dispositivo/:hostname" element={<Dispositivo />} />
        <Route path="buscar-dados" element={<BuscarDados />} />
        <Route path="buscar-backup" element={<BuscarBackup />} />
        <Route path="pendencias" element={<Pendencias />} />
        <Route path="adicionar-dispositivo" elemento={<AdicionarDispositivo />} />
      </Route>
    </Routes>);
}



