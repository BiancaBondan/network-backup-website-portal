#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations
import json
import os
import re
import tempfile
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta, UTC
from pathlib import Path
from typing import Any, Dict, List, Optional
from flask import Flask, jsonify, request, abort, send_file, g
from werkzeug.security import check_password_hash, generate_password_hash
from functools import wraps

###############################################
app = Flask(__name__)

BASE_BACKUP = Path(r"")
BACKUP_EXTS = (".conf",)
DIC_EQT_PATH = Path(
    r"").resolve()

load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY não definida no .env")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", 60))

USUARIOS = {
    "cliente": {
        "senha": generate_password_hash("123"),
        "perfil": "cliente",},
    "gerente": {
        "senha": generate_password_hash("123"),
        "perfil": "gerente",},
    "analista": {
        "senha": generate_password_hash("123"),
        "perfil": "analista",},}

###############################################
def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify(msg="Token ausente"), 401
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token,
                JWT_SECRET_KEY,
                algorithms=["HS256"],)
            g.user = payload  
        except jwt.ExpiredSignatureError:
            return jsonify(msg="Token expirado"), 401
        except jwt.InvalidTokenError:
            return jsonify(msg="Token inválido"), 401
        return fn(*args, **kwargs)
    return wrapper

def perfil_required(*perfis):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(g, "user", {})
            if user.get("perfil") not in perfis:
                return jsonify(msg="Acesso não autorizado"), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

###############################################
# Login
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    usuario = data.get("usuario", "").strip().lower()
    senha = data.get("senha", "").strip()
    user = USUARIOS.get(usuario)
    if not user or not check_password_hash(user["senha"], senha):
        return jsonify(ok=False, msg="Usuário ou senha inválidos"), 401

    token = jwt.encode(
        {
            "sub": usuario,
            "perfil": user["perfil"],
            "exp": datetime.now(UTC) + timedelta(minutes=JWT_EXP_MINUTES),},
        JWT_SECRET_KEY,
        algorithm="HS256",)

    return jsonify(ok=True, token=token)

###############################################
def _sem_acento(s: str) -> str:
    import unicodedata
    return "".join(
        ch for ch in unicodedata.normalize("NFD", s)
        if unicodedata.category(ch) != "Mn")

###############################################
def normalizar_busca(s: str) -> str:
    return _sem_acento(s).strip().lower()

###############################################
def normalizar_nome_pasta(s: str) -> str:
    s = _sem_acento(s).strip()
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^\w\-]", "", s)
    return s

###############################################
def normalizar_hostname_pasta(hostname: str) -> str:
    s = hostname.strip()
    s = s.replace(":", "")
    s = s.replace("-", "_")
    s = re.sub(r"_{2,}", "_", s)
    return s

###############################################
def format_tamanho(num_bytes: int) -> str:
    if num_bytes >= 1073741824:
        return f"{num_bytes / 1073741824:.2f} GB"
    if num_bytes >= 1048576:
        return f"{num_bytes / 1048576:.2f} MB"
    if num_bytes >= 1024:
        return f"{num_bytes / 1024:.2f} KB"
    return f"{num_bytes} B"

###############################################
def safe_join_under_base(base: Path, relative: str) -> Path:
    rel = relative.lstrip("/").replace("\\", "/")
    target = (base / rel).resolve()
    if base.resolve() not in target.parents:
        abort(400, description="Caminho inválido")
    return target

###############################################
def json_load(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))

###############################################
def json_atomic_write(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent))
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

###############################################
def listar_dirs(path: Path) -> List[str]:
    if not path.exists():
        return []
    return sorted([p.name for p in path.iterdir() if p.is_dir()])

###############################################
@app.get("/api/health")
def health():
    return jsonify(ok=True, time=datetime.now().isoformat())

@app.get("/debug/routes")
def debug_routes():
    return jsonify([
        {"path": str(r), "methods": list(r.methods)}
        for r in app.url_map.iter_rules()])

###############################################
#estado
@app.get("/api/estados")
@jwt_required
def api_estados():
    estados = listar_dirs(BASE_BACKUP)
    return jsonify([e for e in estados if re.fullmatch(r"[A-Z]{2}", e)])

#city
@app.get("/api/estados/<uf>/cidades")
@jwt_required
def api_cidades(uf):
    path = BASE_BACKUP / uf.upper()
    if not path.exists():
        abort(404)
    return jsonify(listar_dirs(path))
#devic
@app.get("/api/estados/<uf>/<cidade>/dispositivos")
@jwt_required
def api_dispositivos(uf, cidade):
    path = BASE_BACKUP / uf.upper() / cidade
    if not path.exists():
        abort(404)
    return jsonify(listar_dirs(path))

###############################################
def parse_nome_backup(filename: str):
    base = Path(filename).stem
    if "_" not in base:
        return {"data": "", "ip": ""}
    first = base.find("_")
    last = base.rfind("_")
    return {
        "data": base[:first],
        "ip": base[last + 1:],}
###############################################
#listar backups
@app.get("/api/dispositivos/<hostname>/backups")
@jwt_required
def listar_backups(hostname):
    dic = json_load(DIC_EQT_PATH)
    estado = cidade = None

    for _, info in dic.items():
        if info.get("Hostname") == hostname:
            loc = info.get("Localidade", {})
            estado = loc.get("Estado")
            cidade = loc.get("Cidade")
            break

    if not estado or not cidade:
        abort(404)

    pasta = BASE_BACKUP / estado / cidade / normalizar_hostname_pasta(hostname)
    if not pasta.exists():
        abort(404)

    arquivos = sorted(
        [p for p in pasta.iterdir() if p.suffix in BACKUP_EXTS],
        key=lambda p: p.stat().st_mtime,
        reverse=True)

    return jsonify([
        {
            "arquivo": p.name,
            "tamanho": format_tamanho(p.stat().st_size),
            "data": parse_nome_backup(p.name)["data"],
            "path": str(p.relative_to(BASE_BACKUP)),}
        for p in arquivos])
###############################################
#download backup
@app.get("/api/backups/download")
@jwt_required
def download_backup():
    rel = request.args.get("path", "").strip()
    if not rel:
        return jsonify(msg="Parâmetro path é obrigatório"), 400
    file = safe_join_under_base(BASE_BACKUP, rel)
    if not file.exists() or not file.is_file():
        return jsonify(msg="Arquivo não encontrado"), 404
    if file.suffix.lower() not in BACKUP_EXTS:
        return jsonify(msg="Extensão não permitida"), 400
    return send_file(str(file), as_attachment=True, download_name=file.name)


###############################################
# busca dispositivo (autocomplete)
def ip_match(ip, q):
    return ip.startswith(q) or ip.startswith(q + ".")

def normalizar_dispositivo(ip_principal, ip_match, info):
    return {
    """
    Internal automation logic removed from public repository.
    """


@app.get("/api/dispositivos/busca")
@jwt_required
@perfil_required("analista", "gerente")
def buscar_dispositivo():
    """
    Internal automation logic removed from public repository.
    """


###############################################
#adicionar dispositivo
@app.post("/api/dispositivos")
@jwt_required
@perfil_required("analista", "gerente")
def adicionar_dispositivo():
    """
    Internal automation logic removed from public repository.
    """
###############################################
#devices pendentes
VALORES_VAZIOS = {"", "nan", "none", "null", "não identificado", "nao identificado"}
def campo_vazio(valor: Optional[str]) -> bool:
    if valor is None:
        return True
    v = str(valor).strip().lower()
    return v in VALORES_VAZIOS


def dispositivo_pendente(info: dict) -> bool:
    """
    Internal automation logic removed from public repository.
    """

@app.post("/api/scan/completar")
@jwt_required
@perfil_required("analista", "gerente")
def completar_scan():
    """
    Internal automation logic removed from public repository.
    """


@app.get("/api/dispositivos/pendentes")
@jwt_required
@perfil_required("analista", "gerente")
def dispositivos_pendentes():
    """
    Internal automation logic removed from public repository.
    """

###############################################
def automacao_firewall(...):
    """
    Internal firewall policy and services automation logic removed.
    """
    raise NotImplementedError

###############################################
def automacao_switch(...):
    """
    Internal switch configuration automation logic removed.
    """
    raise NotImplementedError

###############################################
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
