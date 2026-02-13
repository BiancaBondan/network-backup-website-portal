import { useNavigate, useParams } from "react-router-dom";
import { ESTADOS } from "../utils/estados";

export default function Breadcrumb() {
  const navigate = useNavigate();
  const { uf, cidade, hostname } = useParams();

  return (
    <div className="breadcrumb">
      <span className="crumb clickable" onClick={() => navigate("/")}>
        Localidades
      </span>

      {uf && (
        <>
          <span className="sep">›</span>
          <span
            className="crumb clickable"
            onClick={() => navigate(`/estado/${uf}`)}
          >
            {ESTADOS[uf] || uf}
          </span>
        </>
      )}

      {cidade && (
        <>
          <span className="sep">›</span>
          <span
            className="crumb clickable"
            onClick={() => navigate(`/estado/${uf}/${cidade}`)}
          >
            {cidade.replace(/_/g, " ")}
          </span>
        </>
      )}

      {hostname && (
        <>
          <span className="sep">›</span>
          <span className="crumb active">{hostname}</span>
        </>
      )}
    </div>
  );
}
