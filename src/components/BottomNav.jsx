import { useNavigate, useLocation } from 'react-router-dom';

const ITEMS = [
  {
    path: '/',
    label: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9"/>
        <rect x="10" y="7" width="4" height="14"/>
        <rect x="17" y="3" width="4" height="18"/>
      </svg>
    ),
  },
  {
    path: '/ranking',
    label: 'Ranking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    path: '/agregar',
    label: 'Agregar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {ITEMS.map(item => (
        <button
          key={item.path}
          className={`nav-item${pathname === item.path ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
