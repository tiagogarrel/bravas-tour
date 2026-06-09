export const API_URL = import.meta.env.VITE_API_URL || '';
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'bravas2025';

export const PROFILES = ['tiago', 'monica'];

export const SAUCE_FIELDS = ['all_i_oli', 'salsa_brava', 'mix'];

export const RATING_FIELDS = [
  { key: 'all_i_oli',          label: 'All i oli',           group: 'salsas' },
  { key: 'salsa_brava',        label: 'Salsa brava',         group: 'salsas' },
  { key: 'mix',                label: 'Mix',                 group: 'salsas' },
  { key: 'patata',             label: 'Patata',              group: 'main'   },
  { key: 'ambiente',           label: 'Ambiente',            group: 'main'   },
  { key: 'impresion_general',  label: 'Impresión general',   group: 'main'   },
];

export const TEXT_FIELDS = [
  { key: 'primera_impresion', label: 'Primera impresión' },
  { key: 'comentario_final',  label: 'Comentario final'  },
];

// Colores por perfil
export const PROFILE_COLORS = {
  tiago:  { main: '#f59e0b', light: '#fef3c7', text: '#92400e' },
  monica: { main: '#a78bfa', light: '#ede9fe', text: '#5b21b6' },
};

// ============================================================
// Helpers de scoring
// ============================================================

function parseNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function calcSalsaScore(bar, person) {
  const vals = SAUCE_FIELDS
    .map(s => parseNum(bar[`${s}_${person}`]))
    .filter(v => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function calcPersonScore(bar, person) {
  const mainScores = ['patata', 'ambiente', 'impresion_general']
    .map(f => parseNum(bar[`${f}_${person}`]))
    .filter(v => v !== null);
  const salsa = calcSalsaScore(bar, person);
  const all = salsa !== null ? [...mainScores, salsa] : mainScores;
  if (all.length === 0) return null;
  return all.reduce((a, b) => a + b, 0) / all.length;
}

export function calcBarScore(bar) {
  const t = calcPersonScore(bar, 'tiago');
  const m = calcPersonScore(bar, 'monica');
  if (t === null && m === null) return null;
  if (t === null) return m;
  if (m === null) return t;
  return (t + m) / 2;
}

export function fmt(n, decimals = 1) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(decimals);
}

export function hasRated(bar, person) {
  return RATING_FIELDS.some(f => parseNum(bar[`${f.key}_${person}`]) !== null);
}
