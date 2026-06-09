import { useRef } from 'react';

// photos: array of { url, uploading }
// onAdd(base64, fileName): callback para subir
// onRemove(index): callback para quitar

export default function PhotoUpload({ photos = [], onAdd, onRemove, maxPhotos = 3 }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onAdd(reader.result, file.name);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="photo-upload-zone">
      <div className="photo-upload-previews">
        {photos.map((p, i) => (
          <div key={i} className="photo-preview">
            {p.uploading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontSize: 20 }}>
                ⏳
              </div>
            ) : (
              <img src={p.url} alt={`Foto ${i + 1}`} />
            )}
            <button type="button" className="photo-remove" onClick={() => onRemove(i)}>×</button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <>
            <button type="button" className="photo-add-btn" onClick={() => inputRef.current?.click()}>
              <span>📷</span>
              foto
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </>
        )}
      </div>
      {photos.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          Hasta {maxPhotos} fotos · Se suben automáticamente
        </p>
      )}
    </div>
  );
}
