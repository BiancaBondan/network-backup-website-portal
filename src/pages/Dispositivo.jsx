import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import BackButton from "../components/BackButton";
import apiFetch from "../utils/api";

export default function Dispositivo() {
  const { hostname } = useParams();

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [baixando, setBaixando] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErro("");

    apiFetch(`/api/dispositivos/${hostname}/backups`)
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao buscar backups");
        return r.json();
      })
      .then((data) => {
        setBackups(data);
        setLoading(false);
      })
      .catch((e) => {
        setErro(e.message);
        setBackups([]);
        setLoading(false);
      });
  }, [hostname]);

  async function baixarBackup(b) {
    try {
      setBaixando(b.path);

      const resp = await apiFetch(
        `/api/backups/download?path=${encodeURIComponent(b.path)}`
      );

      if (!resp.ok) {
        throw new Error("Erro ao baixar backup");
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = b.arquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div>
      <h2>Backups — {hostname}</h2>

      {loading && <p>Carregando backups...</p>}

      {!loading && erro && <p className="erro">{erro}</p>}

      {!loading && !erro && backups.length === 0 && (
        <p>Nenhum backup encontrado para este dispositivo.</p>
      )}

      {!loading && backups.length > 0 && (
        <table className="backup-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Data</th>
              <th>IP</th>
              <th>Tamanho</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.path}>
                <td>{b.arquivo}</td>
                <td>{b.data || "-"}</td>
                <td>{b.ip || "-"}</td>
                <td>{b.tamanho}</td>
                <td>
                  <button
                    className="btn-download"
                    onClick={() => baixarBackup(b)}
                    disabled={baixando === b.path}
                  >
                    {baixando === b.path ? "Baixando..." : "Baixar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
