import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import BackButton from "../components/BackButton";
import apiFetch from "../utils/api";

export default function Cidade() {
  const { uf, cidade } = useParams();
  const navigate = useNavigate();
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    apiFetch(`/api/estados/${uf}/${cidade}/dispositivos`)
      .then((r) => r.json())
      .then((data) => {
        setDispositivos(data);
        setLoading(false);
      })
      .catch(() => {
        setDispositivos([]);
        setLoading(false);
      });
  }, [uf, cidade]);

  return (
    <div>
      <h2>Dispositivos</h2>

      {loading && <p>Carregando dispositivos...</p>}

      {!loading && dispositivos.length === 0 && (
        <p>Nenhum dispositivo encontrado.</p>
      )}

      <div className="grid-list">
        {dispositivos.map((hostname) => (
          <div
            key={hostname}
            className="card"
            onClick={() => navigate(`/dispositivo/${hostname}`)}
          >
            {hostname}
          </div>
        ))}
      </div>
    </div>
  );
}
