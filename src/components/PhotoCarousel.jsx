import { useState } from 'react';

export default function PhotoCarousel({ photos = [] }) {
  const [idx, setIdx] = useState(0);
  const urls = photos.filter(Boolean);

  if (urls.length === 0) {
    return (
      <div className="hero-carousel">
        <div className="hero-placeholder">🥔</div>
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length); };

  return (
    <div className="hero-carousel">
      <img src={urls[idx]} alt={`Foto ${idx + 1}`} className="hero-img" />

      {urls.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={prev}>‹</button>
          <button className="carousel-btn next" onClick={next}>›</button>
          <div className="carousel-dots">
            {urls.map((_, i) => (
              <div key={i} className={`carousel-dot${i === idx ? ' active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
