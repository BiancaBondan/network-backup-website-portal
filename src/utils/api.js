// src/utils/api.js
export default async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {...(options.headers || {}),};
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"] && options.method && options.method !== "GET") { headers["Content-Type"] = "application/json";}
  if (token) { headers["Authorization"] = `Bearer ${token}`;}
  const resp = await fetch(url, { ...options, headers,});
  if (resp.status === 401) { localStorage.removeItem("token"); window.location.href = "/login"; return resp; }
  return resp;
}
