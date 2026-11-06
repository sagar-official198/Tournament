const BASE = import.meta.env.VITE_API_URL || '';

async function request(method, path, { body, key, form } = {}) {
  const headers = {};
  if (key) headers['x-scorer-key'] = key;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload });
  } catch {
    throw new Error('Cannot reach the server. Check your internet and try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Something went wrong.');
  return data;
}

export const api = {
  get: (path, key) => request('GET', path, { key }),
  post: (path, body, key) => request('POST', path, { body: body ?? {}, key }),
  put: (path, body, key) => request('PUT', path, { body: body ?? {}, key }),
  del: (path, key) => request('DELETE', path, { key }),
  upload: (file, key) => {
    const form = new FormData();
    form.append('image', file);
    return request('POST', '/upload', { form, key });
  },
};
