import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import PasswordGate from './components/PasswordGate';
import ProfileSelect from './components/ProfileSelect';
import BottomNav from './components/BottomNav';
import Stats from './pages/Stats';
import Leaderboard from './pages/Leaderboard';
import BarDetail from './pages/BarDetail';
import AddBar from './pages/AddBar';
import { PROFILE_COLORS } from './config';

function AppHeader() {
  const { profile, selectProfile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isDetail = location.pathname.startsWith('/bar/');
  const isAdd    = location.pathname === '/agregar';

  const pageTitles = {
    '/':        '🥔 Bravas Tour BCN',
    '/ranking': '🏆 Ranking',
    '/agregar': '➕ Nuevo bar',
  };

  const title = isDetail
    ? null // Se muestra el nombre en el header
    : (pageTitles[location.pathname] || '🥔 Bravas Tour BCN');

  const profileLabel = profile === 'tiago' ? 'Tiago' : 'Mónica';
  const profileColor = PROFILE_COLORS[profile];

  return (
    <header className="app-header">
      {(isDetail || isAdd) && (
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
      )}
      <h1>{isDetail ? '← Bar' : title}</h1>
      {profile && (
        <button
          className="profile-badge"
          style={{ background: profileColor?.light, color: profileColor?.text, border: 'none', cursor: 'pointer' }}
          onClick={() => {
            if (confirm(`¿Cambiar perfil? Ahora sos ${profileLabel}`)) {
              selectProfile(null);
              localStorage.removeItem('bravas_profile');
            }
          }}
        >
          {profileLabel}
        </button>
      )}
    </header>
  );
}

export default function App() {
  const { isAuth, profile } = useApp();

  if (!isAuth) return <PasswordGate />;
  if (!profile) return <ProfileSelect />;

  return (
    <div className="app-layout">
      <AppHeader />
      <main className="page-content">
        <Routes>
          <Route path="/"          element={<Stats />} />
          <Route path="/ranking"   element={<Leaderboard />} />
          <Route path="/bar/:id"   element={<BarDetail />} />
          <Route path="/agregar"   element={<AddBar />} />
          <Route path="*"          element={<Stats />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
