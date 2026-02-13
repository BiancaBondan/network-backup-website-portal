import { useEffect, useState } from "react";
import apiFetch from "../utils/api";
import ModalCompletar from "../components/ModalCompletar";
import "../styles/pages.css";

export default function Pendencias() {
  const [lista, setLista] = useState([]); // [{ ip, info }]
  const [index, setIndex] = useState(0);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    apiFetch("/api/dispositivos/pendentes")
      .then((r) => r.json())
      .then((data) => {
        const arr = Object.entries(data).map(([ip, info]) => ({ ip, info }));
        setLista(arr);
        setIndex(0);
      })
      .catch(() => setLista([]));
  }, []);

  if (lista.length === 0) {
    return <p>Nenhum dispositivo pendente </p>;
  }

  const atual = lista[index];

  function removerAtual() {
    setLista((prev) => {
      const novo = prev.filter((_, i) => i !== index);
      if (index >= novo.length && index > 0) {
        setIndex(index - 1);
      }
      return novo;
    });
  }

  return (
    <div className="pendencia-container">
      <h2>
        Revisão Scan  ({index + 1} / {lista.length})
      </h2>

      {/* Reaproveita visual de card */}
      <div className="resultado-card pendencia-card">
        <h3>
          {atual.info.Hostname || (
            <span className="text-muted">Hostname não identificado</span>
          )}
        </h3>

        <div className="resultado-info">
          <div>
            <b>IP:</b> {atual.ip}
          </div>

          <div>
            <b>Device Type:</b>{" "}
            {atual.info.Device_Type || (
              <i className="text-muted">não identificado</i>
            )}
          </div>

          <div>
            <b>Modelo:</b> {atual.info.Model || "—"}
          </div>

          <div>
            <b>Tipo:</b>{" "}
            {atual.info.Tipo || <i className="text-muted">não definido</i>}
          </div>

          <div>
            <b>Cidade:</b>{" "}
            {atual.info.Localidade?.Cidade || (
              <i className="text-muted">não definida</i>
            )}
          </div>

          <div>
            <b>Estado:</b>{" "}
            {atual.info.Localidade?.Estado || (
              <i className="text-muted">não definido</i>
            )}
          </div>
        </div>
        <div className="pendencia-actions">
          <button
            className="btn-nav"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
          >
            ← Anterior
          </button>

          <button
            className="btn-primary"
            onClick={() => setSelecionado(atual)}
          >
            Completar dados
          </button>

          <button
            className="btn-nav"
            onClick={() =>
              setIndex((i) => Math.min(i + 1, lista.length - 1))
            }
            disabled={index === lista.length - 1}
          >
            Próximo →
          </button>
        </div>
      </div>

      {selecionado && (
        <ModalCompletar
          dispositivo={selecionado}
          onClose={() => setSelecionado(null)}
          onSave={() => {
            removerAtual();
            setSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
