// src/pages/BuscarDados.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../utils/api";
import useDebounce from "../hooks/useDebounce";

export default function BuscarDados() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResultados([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  async function buscar(valor) {
    if (valor.length < 2) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch(
        `/api/dispositivos/busca?query=${encodeURIComponent(valor)}`
      );

      setResultados(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (e) {
      console.error("Erro na busca:", e);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q) buscar(q);
  }, [debouncedQuery]);

  return (
    <div>
      <div ref={wrapperRef} style={{ position: "relative", maxWidth: 520 }}>
        <input
          type="text"
          value={query}
          placeholder="Buscar por IP, hostname, cidade ou estado"
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          autoComplete="off"
        />

        {loading && <div className="autocomplete-loading">Buscando...</div>}

        {resultados.length > 0 && (
          <div className="autocomplete-list">
            {resultados.map((r) => (
              <div
                key={r.ip}
                className="autocomplete-item"
                onClick={() => navigate(`/dispositivo/${r.hostname}`)}
              >
                {/* Linha 1: Hostname — IP */}
                <div>
                  <b>{r.hostname || "-"}</b> — <span>{r.ip}</span>
                </div>

                {/* Linha 2: Device type - Modelo */}
                <div>
                  {r.device_type || "—"}
                  {r.model && ` - ${r.model}`}
                </div>

                {/* Linha 3: Serial Number */}
                {r.serial_number && (
                  <div>
                    <b>SN:</b> {r.serial_number}
                  </div>
                )}

                {/* Linha 4: Localidade */}
                <div>
                  {(r.localidade?.Cidade || "—") +
                    " / " +
                    (r.localidade?.Estado || "—")}
                </div>

                {/* Linha 5: Tipo (SEDE, ESCRITÓRIO, AGÊNCIA...) */}
                {r.tipo && (
                  <div>
                    <b>Tipo:</b> {r.tipo}
                  </div>
                )}

                {Array.isArray(r.ips_alternativos) &&
                  r.ips_alternativos.length > 0 && (
                    <div>
                      <b>IPs alternativos:</b>{" "}
                      {r.ips_alternativos.join(", ")}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
