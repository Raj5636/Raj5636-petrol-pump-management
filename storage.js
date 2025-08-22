export const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
export const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
export const currency = (settings) => settings.currency || '₹';
export const fmt = (n, settings) => currency(settings) + (Number(n||0).toLocaleString('en-IN'));
