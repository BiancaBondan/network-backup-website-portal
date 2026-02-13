import { useState } from "react";
import apiFetch from "../utils/api";
import "../styles/pages.css"

export default function ModalCompletar({ dispositivo, onClose, onSave }) {
  const [estado, setEstado] = useState(
    dispositivo.info.Localidade?.Estado || ""
  );
  const [cidade, setCidade] = useState(
    dispositivo.info.Localidade?.Cidade || ""
  );
  const [tipo, setTipo] = useState(dispositivo.info.Tipo || "");
  const [hostname, setHostname] = useState(dispositivo.info.Hostname || "");

  function salvar() {
    if (!estado || !cidade || !tipo) {
      alert("Estado, cidade e tipo são obrigatórios.");
      return;
    }

    apiFetch("/api/scan/completar", {
      method: "POST",
      body: JSON.stringify({
        ip: dispositivo.ip,
        dados: {
          Hostname: hostname,
          Tipo: tipo,
          Localidade: {
            Estado: estado,
            Cidade: cidade,
          },
        },
      }),
    }).then(() => {
      onSave();
    });
  }

  return (
    <div className="resultado-card pendencia-form">
      <h3>Completar dados</h3>
      <div className="form-grid">

        <label>Hostname</label>
        <input value={hostname} onChange={(e) => setHostname(e.target.value)} />

        <label>Estado</label>
        <input value={estado} onChange={(e) => setEstado(e.target.value)} />

        <label>Cidade</label>
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} />

        <label>Tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Selecione</option>
          <option value="Agência">Agência</option>
          <option value="Centro de Distribuição">Centro de Distribuição</option>
          <option value="Cliente Livre">Cliente Livre</option>
          <option value="Data Center">Data Center</option>
          <option value="Link de Internet">Link de Internet</option>
          <option value="Medidor de Fronteira">Medidor de Fronteira</option>
          <option value="Radio">Radio</option>
          <option value="Religador">Religador</option>
          <option value="Repetidora">Repetidora</option>
          <option value="Repetidora VHF">Repetidora VHF</option>                 
          <option value="SEDE">SEDE</option>
          <option value="SubEstação">SubEstação</option>
        </select>
      </div>
      <div className="form-actions">
          <button className="btn-primary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={salvar}>
            Salvar
          </button>
      </div>
    </div>
  );
}
