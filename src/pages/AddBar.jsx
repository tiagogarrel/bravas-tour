import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RatingSlider from '../components/RatingSlider';
import PhotoUpload from '../components/PhotoUpload';
import Toast from '../components/Toast';
import { PROFILE_COLORS } from '../config';

const EMPTY_RATINGS = {
  all_i_oli: '', salsa_brava: '', mix: '',
  patata: '', ambiente: '', impresion_general: '',
};

export default function AddBar() {
  const { bars, profile, addBar, updateBar, uploadPhoto } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const isEdit = !!editId;
  const existingBar = isEdit ? bars.find(b => String(b.id) === String(editId)) : null;

  // Common fields (only editable when creating a new bar)
  const [barName, setBarName] = useState('');
  const [fecha, setFecha]     = useState(new Date().toISOString().slice(0, 10));
  const [barrio, setBarrio]   = useState('');
  const [precio, setPrecio]   = useState('');

  // Per-profile fields
  const [ratings, setRatings] = useState({ ...EMPTY_RATINGS });
  const [primeraImpresion, setPrimeraImpresion] = useState('');
  const [comentarioFinal, setComentarioFinal]   = useState('');

  // Photos
  const [photos, setPhotos]     = useState([]); // { url, uploading, fileId? }
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  const color = PROFILE_COLORS[profile]?.main || '#f59e0b';

  // Populate form when editing
  useEffect(() => {
    if (!existingBar || !profile) return;
    setBarName(existingBar.bar_name || '');
    setFecha(existingBar.fecha || new Date().toISOString().slice(0, 10));
    setBarrio(existingBar.barrio || '');
    setPrecio(existingBar.precio !== undefined ? String(existingBar.precio) : '');

    const p = profile;
    setRatings({
      all_i_oli:         existingBar[`all_i_oli_${p}`]         ?? '',
      salsa_brava:       existingBar[`salsa_brava_${p}`]       ?? '',
      mix:               existingBar[`mix_${p}`]               ?? '',
      patata:            existingBar[`patata_${p}`]            ?? '',
      ambiente:          existingBar[`ambiente_${p}`]          ?? '',
      impresion_general: existingBar[`impresion_general_${p}`] ?? '',
    });
    setPrimeraImpresion(existingBar[`primera_impresion_${p}`] || '');
    setComentarioFinal(existingBar[`comentario_final_${p}`] || '');

    const existingPhotos = [existingBar.foto_1, existingBar.foto_2, existingBar.foto_3]
      .filter(Boolean)
      .map(url => ({ url, uploading: false }));
    setPhotos(existingPhotos);
  }, [existingBar, profile]);

  const handleRating = (key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleAddPhoto = async (base64, fileName) => {
    const placeholder = { url: '', uploading: true };
    setPhotos(prev => [...prev, placeholder]);
    try {
      const result = await uploadPhoto(base64, fileName);
      setPhotos(prev => prev.map((p, i) =>
        i === prev.length - 1 && p.uploading ? { url: result.url, uploading: false } : p
      ));
    } catch (e) {
      setPhotos(prev => prev.filter(p => !p.uploading));
      setToast('Error al subir la foto');
    }
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barName.trim()) { setToast('Falta el nombre del bar'); return; }

    setSaving(true);
    try {
      const p = profile;
      const photoUrls = photos.filter(ph => ph.url && !ph.uploading).map(ph => ph.url);

      const payload = {
        bar_name: barName.trim(),
        fecha,
        barrio,
        precio: precio ? parseFloat(precio) : '',
        foto_1: photoUrls[0] || '',
        foto_2: photoUrls[1] || '',
        foto_3: photoUrls[2] || '',
        [`primera_impresion_${p}`]: primeraImpresion,
        [`all_i_oli_${p}`]:         ratings.all_i_oli,
        [`salsa_brava_${p}`]:       ratings.salsa_brava,
        [`mix_${p}`]:               ratings.mix,
        [`patata_${p}`]:            ratings.patata,
        [`ambiente_${p}`]:          ratings.ambiente,
        [`impresion_general_${p}`]: ratings.impresion_general,
        [`comentario_final_${p}`]:  comentarioFinal,
      };

      if (isEdit) {
        await updateBar({ id: editId, ...payload });
        setToast('¡Guardado! 🥔');
      } else {
        await addBar(payload);
        setToast('¡Bar agregado! 🥔');
      }

      setTimeout(() => navigate('/ranking'), 1500);
    } catch (err) {
      setToast('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="empty-state">
      <div className="empty-state-emoji">👤</div>
      <p className="empty-state-text">Seleccioná tu perfil primero</p>
    </div>
  );

  const profileLabel = profile === 'tiago' ? 'Tiago' : 'Mónica';

  return (
    <form onSubmit={handleSubmit}>
      {/* Fotos */}
      <div className="form-section">
        <p className="form-section-title">📷 Fotos</p>
        <PhotoUpload
          photos={photos}
          onAdd={handleAddPhoto}
          onRemove={handleRemovePhoto}
          maxPhotos={3}
        />
      </div>

      {/* Info del bar */}
      <div className="form-section">
        <p className="form-section-title">📍 Información del bar</p>
        {isEdit && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            Editando info general del bar — visible para los dos
          </p>
        )}
        <div className="form-field">
          <label className="form-label">Nombre del bar *</label>
          <input className="form-input" type="text" value={barName} onChange={e => setBarName(e.target.value)} placeholder="Ej: Bar El Roure" />
        </div>
        <div className="form-input-row">
          <div className="form-field">
            <label className="form-label">Barrio</label>
            <input className="form-input" type="text" value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Ej: Gràcia" />
          </div>
          <div className="form-field">
            <label className="form-label">Precio (€)</label>
            <input className="form-input" type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="4.95" />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Fecha</label>
          <input className="form-input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
      </div>

      {/* Notas del perfil */}
      <div className="form-section">
        <p className="form-section-title" style={{ color: color }}>
          Notas de {profileLabel}
        </p>

        {/* Primera impresión */}
        <div className="form-field">
          <label className="form-label">Primera impresión</label>
          <textarea
            className="form-input"
            value={primeraImpresion}
            onChange={e => setPrimeraImpresion(e.target.value)}
            placeholder="Llegaron las bravas a la mesa... ¿Qué pensas?"
          />
        </div>

        {/* Salsas */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: '14px 0 10px' }}>🌶️ Salsas</p>
        <RatingSlider label="All i oli"   value={ratings.all_i_oli}   onChange={v => handleRating('all_i_oli', v)}   profile={profile} optional />
        <RatingSlider label="Salsa brava" value={ratings.salsa_brava} onChange={v => handleRating('salsa_brava', v)} profile={profile} optional />
        <RatingSlider label="Mix"         value={ratings.mix}         onChange={v => handleRating('mix', v)}         profile={profile} optional />

        {/* Resto */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: '14px 0 10px' }}>🥔 Resto</p>
        <RatingSlider label="Patata"            value={ratings.patata}            onChange={v => handleRating('patata', v)}            profile={profile} />
        <RatingSlider label="Ambiente"          value={ratings.ambiente}          onChange={v => handleRating('ambiente', v)}          profile={profile} />
        <RatingSlider label="Impresión general" value={ratings.impresion_general} onChange={v => handleRating('impresion_general', v)} profile={profile} />

        {/* Comentario final */}
        <div className="form-field" style={{ marginTop: 14 }}>
          <label className="form-label">Comentario final</label>
          <textarea
            className="form-input"
            value={comentarioFinal}
            onChange={e => setComentarioFinal(e.target.value)}
            placeholder="Reflexión final sobre las bravas..."
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginBottom: 8 }}>
        {saving ? 'Guardando...' : isEdit ? '💾 Guardar cambios' : '🥔 Agregar bar'}
      </button>

      <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
        Cancelar
      </button>

      <Toast message={toast} onClose={() => setToast('')} />
    </form>
  );
}
