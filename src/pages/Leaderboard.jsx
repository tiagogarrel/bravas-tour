import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calcBarScore, calcPersonScore, fmt, hasRated, PROFILE_COLORS } from '../config';

const SORTS = [
  { key: 'general', label: 'General' },
  { key: 'tiago',   label: 'Tiago'   },
  { key: 'monica',  label: 'Mónica'  },
  { key: 'precio',  label: 'Precio'  },
];

export default function Leaderboard() {
  const { bars, loading } = useApp();
  const navigate = useNavigate();
  const [sort, setSort] = useState('general');

  if (loading) return <div className="empty-state"><div className="empty-state-emoji">⏳</div><p className="empty-state-text">Cargando...</p></div>;
  if (bars.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-emoji">🏆</div>
      <p className="empty-state-text">Todavía no hay bares.<br/>¡Agregá el primero!</p>
    </div>
  );

  const getScore = (bar) => {
    if (sort === 'general') return calcBarScore(bar);
    if (sort === 'tiago')   return calcPersonScore(bar, 'tiago');
    if (sort === 'monica')  return calcPersonScore(bar, 'monica');
    if (sort === 'precio')  return bar.precio ? -parseFloat(bar.precio) : null; // menor precio = mejor
    return null;
  };

  const sorted = [...bars]
    .map(b => ({ bar: b, score: getScore(b) }))
    .sort((a, b) => {
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

  const amberColor  = PROFILE_COLORS.tiago.main;
  const violetColor = PROFILE_COLORS.monica.main;

  return (
    <div>
      {/* Sort bar */}
      <div className="sort-bar">
        {SORTS.map(s => (
          <button
            key={s.key}
            className={`sort-btn${sort === s.key ? ' active' : ''}`}
            onClick={() => setSort(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {sorted.map(({ bar, score }, i) => {
          const tScore = calcPersonScore(bar, 'tiago');
          const mScore = calcPersonScore(bar, 'monica');
          const photos = [bar.foto_1, bar.foto_2, bar.foto_3].filter(Boolean);
          const isPartial = !hasRated(bar, 'tiago') || !hasRated(bar, 'monica');

          return (
            <div key={bar.id} className="lb-item" onClick={() => navigate(`/bar/${bar.id}`)}>
              {/* Rank */}
              <div className={`lb-rank${i >= 3 ? ' low' : ''}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>

              {/* Thumbnail */}
              <div className="lb-thumb">
                {photos[0]
                  ? <img src={photos[0]} alt={bar.bar_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  : '🥔'}
              </div>

              {/* Info */}
              <div className="lb-info">
                <div className="lb-name">{bar.bar_name}</div>
                <div className="lb-meta">
                  {bar.barrio && `${bar.barrio}`}{bar.barrio && bar.precio ? ' · ' : ''}{bar.precio ? `${parseFloat(bar.precio).toFixed(2)}€` : ''}
                  {isPartial && <span className="partial-badge" style={{ marginLeft: 6 }}>parcial</span>}
                </div>
                <div className="lb-scores">
                  {tScore !== null && (
                    <span className="score-badge tag" style={{ background: PROFILE_COLORS.tiago.light, color: PROFILE_COLORS.tiago.text }}>
                      T: {fmt(tScore)}
                    </span>
                  )}
                  {mScore !== null && (
                    <span className="score-badge tag" style={{ background: PROFILE_COLORS.monica.light, color: PROFILE_COLORS.monica.text }}>
                      M: {fmt(mScore)}
                    </span>
                  )}
                </div>
              </div>

              {/* Score + arrow */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {sort === 'precio' ? (
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                    {bar.precio ? `${parseFloat(bar.precio).toFixed(2)}€` : '—'}
                  </div>
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 800, color: score !== null ? amberColor : 'var(--text-muted)' }}>
                    {fmt(score)}
                  </div>
                )}
                <div className="lb-arrow">›</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
