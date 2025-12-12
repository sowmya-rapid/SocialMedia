// const API_BASE = "http://127.0.0.1:8000/api";

// async function handleRes(res) {
//   const text = await res.text();
//   try {
//     const json = text ? JSON.parse(text) : null;
//     if (!res.ok) {
//       const msg = json?.detail || json || text || `HTTP ${res.status}`;
//       throw new Error(msg);
//     }
//     return json;
//   } catch (err) {
//     if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
//     return null;
//   }
// }

// export async function postJSON(path, body) {
//   // keep function signature same so existing frontend code needs no change
//   const headers = { "Content-Type": "application/json" };
//   const token = localStorage.getItem("access");
//   if (token) headers["Authorization"] = `Bearer ${token}`;

//   const res = await fetch(`${API_BASE}${path}`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(body),
//   });
//   return handleRes(res);
// }

// export async function getAuth(path, token) {
//   const headers = token ? { Authorization: `Bearer ${token}` } : {};
//   const res = await fetch(`${API_BASE}${path}`, { headers });
//   return handleRes(res);
// }

// export async function patchAuth(path, token, body) {
//   const headers = {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };
//   const res = await fetch(`${API_BASE}${path}`, {
//     method: "PATCH",
//     headers,
//     body: JSON.stringify(body),
//   });
//   return handleRes(res);
// }


// src/api.js
const API_BASE = "http://127.0.0.1:8000/api";

function _authHeader() {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postJSON(path, body) {
  const headers = { "Content-Type": "application/json", ..._authHeader() };
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // throw the body if there was an error so callers can show friendly messages
    const err = new Error(json.detail || json.error || res.statusText || "Request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export async function getAuth(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : _authHeader();
  const res = await fetch(`${API_BASE}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.detail || res.statusText || "Request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export async function patchAuth(path, token, body) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : _authHeader()) };
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.detail || res.statusText || "Request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// new helper for DELETE
export async function deleteJSON(path) {
  const headers = _authHeader();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers,
  });
  if (res.status === 204) return { success: true };
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.detail || res.statusText || "Delete failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}
