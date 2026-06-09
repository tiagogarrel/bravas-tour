import { PROFILE_COLORS } from '../config';

export default function RatingSlider({ label, value, onChange, profile, optional = false }) {
  const color = PROFILE_COLORS[profile]?.main || '#f59e0b';
  const isViolet = profile === 'monica';
  const hasValue = value !== '' && value !== null && value !== undefined;

  const handleChange = (e) => {
    onChange(parseFloat(e.target.value));
  };

  const trackStyle = hasValue
    ? {
        background: `linear-gradient(to right, ${color} 0%, ${color} ${(parseFloat(value) / 5) * 100}%, var(--bg) ${(parseFloat(value) / 5) * 100}%, var(--bg) 100%)`,
      }
    : { background: 'var(--bg)' };

  return (
    <div className="slider-field">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value" style={{ color: hasValue ? color : 'var(--text-muted)' }}>
          {hasValue ? Number(value).toFixed(1) : '—'}
        </span>
      </div>

      {optional && !hasValue ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p className="slider-inactive-label">Sin probar esta salsa</p>
          <button
            type="button"
            style={{ fontSize: 12, color: color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
            onClick={() => onChange(3.0)}
          >
            + Agregar
          </button>
        </div>
      ) : (
        <div className="slider-track">
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={hasValue ? value : 0}
            onChange={handleChange}
            className={isViolet ? 'violet' : ''}
            style={trackStyle}
          />
          {optional && hasValue && (
            <button
              type="button"
              style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2, display: 'block' }}
              onClick={() => onChange('')}
            >
              Quitar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
