import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiFetch from "../utils/api";
import { ESTADOS } from "../utils/estados";

export default function Sidebar() {
  const navigate = useNavigate();
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEstados() {
      try {
        const resp = await apiFetch("/api/estados");

        if (!resp.ok) {
          throw new Error("Erro ao carregar estados");
        }

        const data = await resp.json();

        if (Array.isArray(data)) {
          setEstados(data);
        } else {
          setEstados([]);
        }
      } catch (e) {
        console.error("Sidebar:", e.message);
        setEstados([]);
      } finally {
        setLoading(false);
      }
    }

    carregarEstados();
  }, []);

  if (loading) {
    return <aside className="sidebar">Carregando...</aside>;
  }

  return (
    <aside className="sidebar">
      <div className="menu-section">
        <h4>Localidades</h4>

        {estados.length === 0 && (<p className="sidebar-empty">Nenhum estado</p>)}

        {estados
          .slice()
          .sort((a, b) =>
            (ESTADOS[a] || a).localeCompare(ESTADOS[b] || b, "pt-BR"))
          .map((uf) => (
            <button key={uf} className="menu-item" onClick={() => navigate(`/estado/${uf}`)}>
               {ESTADOS[uf] || uf}
            </button>))}
      </div>

      <div className="menu-section">
        <h4>Ferramentas</h4>
        <button className="menu-item" onClick={() => navigate("/buscar-backup")}>Buscar backup
        </button>
        <button className="menu-item" onClick={() => navigate("/buscar-dados")}> Buscar dados
        </button>
        <button className="menu-item" onClick={() => navigate("/adicionar-dispositivo")}> Adicionar dispositivo
        </button>
        <button
          className="menu-item" onClick={() => navigate("/pendencias")}>  Análise Scan</button>
      </div>
    </aside>
  );
}
