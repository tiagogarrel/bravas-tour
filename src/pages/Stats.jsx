import { useApp } from '../context/AppContext';
import {
  calcBarScore, calcPersonScore, calcSalsaScore,
  fmt, RATING_FIELDS, PROFILE_COLORS
} from '../config';

function avg(arr) {
  const valid = arr.filter(v => v !== null && v !== undefined);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default function Stats() {
  const { bars, loading, error } = useApp();

  if (loading) return <div className="empty-state"><div className="empty-state-emoji">⏳</div><p className="empty-state-text">Cargando bravas...</p></div>;
  if (error)   return <div className="empty-state"><div className="empty-state-emoji">⚠️</div><p className="empty-state-text">{error}</p></div>;
  if (bars.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-emoji">🥔</div>
      <p className="empty-state-text">Todavía no hay bares registrados.<br/>¡Agregá el primero!</p>
    </div>
  );

  // Cálculo de stats globales
  const tScores = bars.map(b => calcPersonScore(b, 'tiago')).filter(v => v !== null);
  const mScores = bars.map(b => calcPersonScore(b, 'monica')).filter(v => v !== null);
  const allScores = bars.map(b => calcBarScore(b)).filter(v => v !== null);

  const bestBar = bars
    .map(b => ({ bar: b, score: calcBarScore(b) }))
    .filter(x => x.score !== null)
    .sort((a, b) => b.score - a.score)[0];

  const worstBar = bars
    .map(b => ({ bar: b, score: calcBarScore(b) }))
    .filter(x => x.score !== null)
    .sort((a, b) => a.score - b.score)[0];

  // Desacuerdo máximo
  const maxDisagree = bars
    .map(b => {
      const t = calcPersonScore(b, 'tiago');
      const m = calcPersonScore(b, 'monica');
      if (t === null || m === null) return null;
      return { bar: b, diff: Math.abs(t - m) };
    })
    .filter(Boolean)
    .sort((a, b) => b.diff - a.diff)[0];

  // Promedio por categoría
  const categoryAverages = RATING_FIELDS.map(f => {
    if (f.group === 'salsas') {
      // Para salsas, calcular promedio de la salsa específica de ambos
      const vals = bars.flatMap(b => {
        const t = parseFloat(b[`${f.key}_tiago`]);
        const m = parseFloat(b[`${f.key}_monica`]);
        return [isNaN(t) ? null : t, isNaN(m) ? null : m].filter(v => v !== null);
      });
      return { ...f, avg: avg(vals) };
    } else {
      const vals = bars.flatMap(b => {
        const t = parseFloat(b[`${f.key}_tiago`]);
        const m = parseFloat(b[`${f.key}_monica`]);
        return [isNaN(t) ? null : t, isNaN(m) ? null : m].filter(v => v !== null);
      });
      return { ...f, avg: avg(vals) };
    }
  }).filter(c => c.avg !== null).sort((a, b) => b.avg - a.avg);

  const amberColor = PROFILE_COLORS.tiago.main;
  const violetColor = PROFILE_COLORS.monica.main;

  return (
    <div>
      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{bars.length}</div>
          <div className="stat-label">bares</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: amberColor }}>{fmt(avg(tScores))}</div>
          <div className="stat-label">media T.</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: violetColor }}>{fmt(avg(mScores))}</div>
          <div className="stat-label">media M.</div>
        </div>
      </div>

      {/* Mejor y peor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {bestBar && (
          <div className="card card-pad" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>🏆 Mejor bar</div>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{bestBar.bar.bar_name}</div>
            <div style={{ fontSize: 12, color: '#92400e', marginTop: 4, fontWeight: 700 }}>{fmt(bestBar.score)}</div>
          </div>
        )}
        {worstBar && worstBar.bar.id !== bestBar?.bar.id && (
          <div className="card card-pad" style={{ background: '#f4f4f5', borderColor: '#d4d4d8' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>🥲 Más flojo</div>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{worstBar.bar.bar_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 700 }}>{fmt(worstBar.score)}</div>
          </div>
        )}
        {maxDisagree && (
          <div className="card card-pad" style={{ background: '#ede9fe', borderColor: '#ddd6fe', gridColumn: bestBar && worstBar && worstBar.bar.id !== bestBar?.bar.id ? 'span 2' : undefined }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#5b21b6', marginBottom: 4 }}>🤨 Mayor desacuerdo</div>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{maxDisagree.bar.bar_name}</div>
            <div style={{ fontSize: 11, color: '#5b21b6', marginTop: 4 }}>
              T: {fmt(calcPersonScore(maxDisagree.bar, 'tiago'))} · M: {fmt(calcPersonScore(maxDisagree.bar, 'monica'))}
            </div>
          </div>
        )}
      </div>

      {/* Promedio por categoría */}
      <p className="section-title">Promedio por categoría</p>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        {categoryAverages.map(cat => (
          <div key={cat.key} className="bar-chart-row">
            <span className="bar-chart-label">{cat.label}</span>
            <div className="bar-chart-track">
              <div
                className="bar-chart-fill"
                style={{ width: `${(cat.avg / 5) * 100}%`, background: cat.group === 'salsas' ? '#f97316' : amberColor }}
              />
            </div>
            <span className="bar-chart-value" style={{ color: cat.group === 'salsas' ? '#f97316' : amberColor }}>
              {fmt(cat.avg)}
            </span>
          </div>
        ))}
      </div>

      {/* Tiago vs Mónica por categoría */}
      <p className="section-title">Tiago vs Mónica</p>
      <div className="card card-pad">
        {RATING_FIELDS.map(f => {
          const tVals = bars.map(b => parseFloat(b[`${f.key}_tiago`])).filter(v => !isNaN(v));
          const mVals = bars.map(b => parseFloat(b[`${f.key}_monica`])).filter(v => !isNaN(v));
          const tAvg = avg(tVals);
          const mAvg = avg(mVals);
          if (tAvg === null && mAvg === null) return null;
          return (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
              {tAvg !== null && (
                <div className="bar-chart-row">
                  <span style={{ fontSize: 10, fontWeight: 700, color: amberColor, width: 48, flexShrink: 0 }}>Tiago</span>
                  <div className="bar-chart-track">
                    <div className="bar-chart-fill" style={{ width: `${(tAvg / 5) * 100}%`, background: amberColor }} />
                  </div>
                  <span className="bar-chart-value" style={{ color: amberColor }}>{fmt(tAvg)}</span>
                </div>
              )}
              {mAvg !== null && (
                <div className="bar-chart-row">
                  <span style={{ fontSize: 10, fontWeight: 700, color: violetColor, width: 48, flexShrink: 0 }}>Mónica</span>
                  <div className="bar-chart-track">
                    <div className="bar-chart-fill" style={{ width: `${(mAvg / 5) * 100}%`, background: violetColor }} />
                  </div>
                  <span className="bar-chart-value" style={{ color: violetColor }}>{fmt(mAvg)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
