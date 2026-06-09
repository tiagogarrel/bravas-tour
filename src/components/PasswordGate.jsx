import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { APP_PASSWORD } from '../config';

export default function PasswordGate() {
  const { login } = useApp();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === APP_PASSWORD) {
      login(true);
    } else {
      setError('Contraseña incorrecta 🥔');
      setValue('');
    }
  };

  return (
    <div className="gate-screen">
      <div className="gate-emoji">🥔</div>
      <h1 className="gate-title">Bravas Tour BCN</h1>
      <p className="gate-sub">El tour más importante de Barcelona</p>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
        <input
          type="password"
          className="gate-input"
          placeholder="Contraseña"
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          autoFocus
        />
        {error && <p className="gate-error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
    </div>
  );
}
