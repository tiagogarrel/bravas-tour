import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PhotoCarousel from '../components/PhotoCarousel';
import { RATING_FIELDS, SAUCE_FIELDS, PROFILE_COLORS, calcPersonScore, calcSalsaScore, calcBarScore, fmt, hasRated } from '../config';

function RatingCompare({ label, tVal, mVal }) {
  const t = tVal !== '' && tVal !== null && tVal !== undefined ? parseFloat(tVal) : null;
  const m = mVal !== '' && mVal !== null && mVal !== undefined ? parseFloat(mVal) : null;
  if (t === null && m === null) return null;

  const amberColor  = PROFILE_COLORS.tiago.main;
  const violetColor = PROFILE_COLORS.monica.main;

  return (
    <div className="rating-compare-row">
      <div className="rating-compare-label">{label}</div>
      <div className="rating-compare-bars">
        {t !== null && (
          <div className="rating-bar-row">
            <span className="rating-bar-who" style={{ color: amberColor }}>Tiago</span>
            <div className="rating-bar-track">
              <div className="rating-bar-fill" style={{ width: `${(t / 5) * 100}%`, background: amberColor }} />
            </div>
            <span className="rating-bar-num" style={{ color: amberColor }}>{fmt(t)}</span>
          </div>
        )}
        {m !== null && (
          <div className="rating-bar-row">
            <span className="rating-bar-who" style={{ color: violetColor }}>Mónica</span>
            <div className="rating-bar-track">
              <div className="rating-bar-fill" style={{ width: `${(m / 5) * 100}%`, background: violetColor }} />
            </div>
            <span className="rating-bar-num" style={{ color: violetColor }}>{fmt(m)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BarDetail() {
  const { id } = useParams();
  const { bars, profile } = useApp();
  const navigate = useNavigate();

  const bar = bars.find(b => b.id === id);
  if (!bar) return <div className="empty-state"><div className="empty-state-emoji">🤔</div><p className="empty-state-text">Bar no encontrado</p></div>;

  const photos = [bar.foto_1, bar.foto_2, bar.foto_3].filter(Boolean);
  const tScore = calcPersonScore(bar, 'tiago');
  const mScore = calcPersonScore(bar, 'monica');
  const overallScore = calcBarScore(bar);

  const myProfileHasRated = hasRated(bar, profile);
  const otherProfile = profile === 'tiago' ? 'monica' : 'tiago';
  const otherHasRated = hasRated(bar, otherProfile);

  const amberColor  = PROFILE_COLORS.tiago.main;
  const violetColor = PROFILE_COLORS.monica.main;

  return (
    <div>
      {/* Carousel */}
      <PhotoCarousel photos={photos} />

      {/* Header info */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{bar.bar_name}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {bar.barrio && <span className="tag" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{bar.barrio}</span>}
          {bar.precio && <span className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>{parseFloat(bar.precio).toFixed(2)}€</span>}
          {bar.fecha && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{bar.fecha}</span>}
          {overallScore !== null && (
            <span className="tag" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 14 }}>
              ⭐ {fmt(overallScore)}
            </span>
          )}
        </div>
      </div>

      {/* Botón agregar mis notas si falta */}
      {profile && !myProfileHasRated && (
        <button
          className="btn btn-primary"
          style={{ marginBottom: 16 }}
          onClick={() => navigate(`/agregar?edit=${bar.id}`)}
        >
          + Agregar mis notas
        </button>
      )}

      {profile && myProfileHasRated && (
        <button
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() => navigate(`/agregar?edit=${bar.id}`)}
        >
          ✏️ Editar mis notas
        </button>
      )}

      {/* Scores resumen */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tScore !== null && (
          <div className="card card-pad" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: amberColor, fontWeight: 700, marginBottom: 2 }}>Tiago</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: amberColor }}>{fmt(tScore)}</div>
          </div>
        )}
        {mScore !== null && (
          <div className="card card-pad" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: violetColor, fontWeight: 700, marginBottom: 2 }}>Mónica</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: violetColor }}>{fmt(mScore)}</div>
          </div>
        )}
      </div>

      {/* Salsas */}
      <p className="section-title">Salsas</p>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <RatingCompare label="All i oli"   tVal={bar.all_i_oli_tiago}  mVal={bar.all_i_oli_monica} />
        <RatingCompare label="Salsa brava" tVal={bar.salsa_brava_tiago} mVal={bar.salsa_brava_monica} />
        <RatingCompare label="Mix"         tVal={bar.mix_tiago}         mVal={bar.mix_monica} />
        {/* Promedio salsas */}
        {(calcSalsaScore(bar, 'tiago') !== null || calcSalsaScore(bar, 'monica') !== null) && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <RatingCompare
              label="Promedio salsas"
              tVal={calcSalsaScore(bar, 'tiago')}
              mVal={calcSalsaScore(bar, 'monica')}
            />
          </div>
        )}
      </div>

      {/* Resto de ratings */}
      <p className="section-title">Puntuaciones</p>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <RatingCompare label="Patata"           tVal={bar.patata_tiago}           mVal={bar.patata_monica} />
        <RatingCompare label="Ambiente"         tVal={bar.ambiente_tiago}         mVal={bar.ambiente_monica} />
        <RatingCompare label="Impresión general" tVal={bar.impresion_general_tiago} mVal={bar.impresion_general_monica} />
      </div>

      {/* Comentarios */}
      {(bar.primera_impresion_tiago || bar.primera_impresion_monica) && (
        <>
          <p className="section-title">Primera impresión</p>
          <div className="card card-pad" style={{ marginBottom: 12 }}>
            {bar.primera_impresion_tiago && (
              <div style={{ marginBottom: bar.primera_impresion_monica ? 8 : 0 }}>
                <span className="tag" style={{ background: PROFILE_COLORS.tiago.light, color: PROFILE_COLORS.tiago.text, marginBottom: 4, display: 'inline-block' }}>Tiago</span>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>{bar.primera_impresion_tiago}</p>
              </div>
            )}
            {bar.primera_impresion_monica && (
              <div>
                <span className="tag" style={{ background: PROFILE_COLORS.monica.light, color: PROFILE_COLORS.monica.text, marginBottom: 4, display: 'inline-block' }}>Mónica</span>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>{bar.primera_impresion_monica}</p>
              </div>
            )}
          </div>
        </>
      )}

      {(bar.comentario_final_tiago || bar.comentario_final_monica) && (
        <>
          <p className="section-title">Comentario final</p>
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            {bar.comentario_final_tiago && (
              <div style={{ marginBottom: bar.comentario_final_monica ? 8 : 0 }}>
                <span className="tag" style={{ background: PROFILE_COLORS.tiago.light, color: PROFILE_COLORS.tiago.text, marginBottom: 4, display: 'inline-block' }}>Tiago</span>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)', fontStyle: 'italic' }}>"{bar.comentario_final_tiago}"</p>
              </div>
            )}
            {bar.comentario_final_monica && (
              <div>
                <span className="tag" style={{ background: PROFILE_COLORS.monica.light, color: PROFILE_COLORS.monica.text, marginBottom: 4, display: 'inline-block' }}>Mónica</span>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)', fontStyle: 'italic' }}>"{bar.comentario_final_monica}"</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
