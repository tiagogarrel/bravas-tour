import { useApp } from '../context/AppContext';

export default function ProfileSelect() {
  const { selectProfile } = useApp();

  return (
    <div className="gate-screen">
      <div className="gate-emoji">👋</div>
      <h1 className="gate-title">¿Quién sos?</h1>
      <p className="gate-sub">Tu perfil se guarda en este dispositivo</p>
      <div className="profile-grid">
        <button className="profile-btn tiago" onClick={() => selectProfile('tiago')}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🧔</div>
          Tiago
        </button>
        <button className="profile-btn monica" onClick={() => selectProfile('monica')}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>👩</div>
          Mónica
        </button>
      </div>
    </div>
  );
}
