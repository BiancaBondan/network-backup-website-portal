// src/pages/Estado.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../utils/api";

export default function Estado() {
  const { uf } = useParams();
  const navigate = useNavigate();
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/estados/${uf}/cidades`)
      .then((data) => {
        setCidades(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCidades([]);
        setLoading(false);
      });
  }, [uf]);


  return (
    <div>
      <h2>Cidades</h2>

      {loading && <p>Carregando cidades...</p>}

      {!loading && cidades.length === 0 && (
        <p>Nenhuma cidade encontrada.</p>
      )}

      <div className="grid-list">
        {cidades.map((cidade) => (
          <div
            key={cidade}
            className="card"
            onClick={() => navigate(`/estado/${uf}/${cidade}`)}
          >
            {cidade.replace(/_/g, " ")}
          </div>
        ))}
      </div>
    </div>
  );
}
