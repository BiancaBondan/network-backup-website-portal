// src/pages/BuscarDados.jsx
import { useEffect, useState, useRef } from "react";
import apiFetch from "../utils/api";
import useDebounce from "../hooks/useDebounce";

export default function BuscarDados() {
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  async function buscar(valor) {
    const q = valor.trim();
    console.log("[FRONT] buscar()", q);

    if (q.length < 2) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await apiFetch(
        `/api/dispositivos/busca?query=${encodeURIComponent(q)}`
      );
      const data = await resp.json();
      console.log("[FRONT] dados recebidos:", data);
      setResultados(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[FRONT] erro na busca:", e);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }

  // debounce
  useEffect(() => {
    buscar(debouncedQuery);
  }, [debouncedQuery]);

  // clique fora fecha lista
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResultados([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <h2>Buscar dados</h2>

      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          maxWidth: 520,
        }}
      >
        {/* INPUT + BOTÃO */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={query}
            placeholder="Buscar por IP (principal ou alternativo)"
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoComplete="off"
            style={{ flex: 1 }}
          />

          <button
            onClick={() => buscar(query)}
            title="Buscar"
            className="button-lupa"
          >
            🔍
          </button>
        </div>

        {loading && (
          <div className="autocomplete-loading">Buscando…</div>
        )}

        {/* LISTA AGORA FUNCIONA */}
        {resultados.length > 0 && (
          <div className="autocomplete-list">
            {resultados.map((r, idx) => (
              <div
                key={idx}
                className="autocomplete-item"
                onClick={() => {
                  setSelecionado(r);
                  setResultados([]);
                }}
              >
                <b>{r.ip_match}</b> — {r.hostname}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARD DETALHADO */}
      {selecionado && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>
            {selecionado.hostname} — {selecionado.ip}
          </h3>

          <p>
            <b>Device:</b> {selecionado.device_type || "—"}{" "}
            {selecionado.model && `- ${selecionado.model}`}
          </p>

          {selecionado.serial_number && (
            <p>
              <b>SN:</b> {selecionado.serial_number}
            </p>
          )}

          <p>
            <b>Localidade:</b>{" "}
            {selecionado.localidade?.Cidade || "—"} /{" "}
            {selecionado.localidade?.Estado || "—"}
          </p>

          {selecionado.tipo && (
            <p>
              <b>Tipo:</b> {selecionado.tipo}
            </p>
          )}

          {Array.isArray(selecionado.ips_alternativos) &&
            selecionado.ips_alternativos.length > 0 && (
              <p>
                <b>IPs alternativos:</b>{" "}
                {selecionado.ips_alternativos.join(", ")}
              </p>
            )}
        </div>
      )}
    </div>
  );
}
