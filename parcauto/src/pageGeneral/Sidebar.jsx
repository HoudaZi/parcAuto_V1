
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  CarFront,
  Fuel,
  CreditCard,
  ChartNoAxesColumn,
  Users,
  Settings,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import img from '../assets/logo2.png';
import './Sidebar.css';

const menuItems = [
  {
    label: 'Accueil',
    icon: House,
    path: '/',
  },
  {
    label: 'Parc Auto',
    icon: CarFront,
    path: '/assurance/accueil',
    children: [
      { label: 'Véhicules', path: '/assurance/accueil' },
      {label: 'Importer / Exporter Excel', path: '/assurance/import_excel'},
      {label: 'Ajouter un Véhicule', path: '/assurance/Ajouter'},
      {label: 'Dashboard', path: '/assurance/dash'}
    ],
  },
  {
    label: 'Carburant (Total)',
    icon: Fuel,
    path: '/total',
    children: [
      { label: 'Gestion carburant', path: '/total' },
      {label: 'Historique', path: '/total/historique' },
    ],
  },
  {
    label: 'Espace Jawaz',
    icon: CreditCard,
    path: '/jawaz',
    children: [
      { label: 'Badges et passages', path: '/jawaz' },
    ],
  },
  {
    label: 'Rapports',
    icon: ChartNoAxesColumn,
    path: '/rapports',
  },
  {
    label: 'Paramètres',
    icon: Settings,
    path: '/parametres',
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    'Parc Auto': false,
    'Carburant (Total)': false,
    'Espace Jawaz': false,
  });

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (label) => {
    setExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="app-sidebar">
      <Link to="/" className="sidebar-brand">
        <img src={img} alt="Parc Auto Enterprise" />
        <span>
          <strong>Parc Auto</strong>
          <small>Enterprise</small>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children);
          const active = isActive(item.path);

          return (
            <div className="sidebar-item-wrapper" key={item.label}>
              <div
                className={`sidebar-item ${
                  active ? 'sidebar-item-active' : ''
                }`}
              >
                <Link to={item.path} className="sidebar-link">
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{item.label}</span>
                </Link>

                {hasChildren && (
                  <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => toggleMenu(item.label)}
                    aria-label={`Ouvrir ${item.label}`}
                    aria-expanded={expanded[item.label]}
                  >
                    <ChevronDown
                      size={14}
                      className={
                        expanded[item.label] ? 'chevron-open' : ''
                      }
                    />
                  </button>
                )}
              </div>

              {hasChildren && expanded[item.label] && (
                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <Link
                      key={child.path + child.label}
                      to={child.path}
                      className={`sidebar-submenu-link ${
                        isActive(child.path) ? 'submenu-active' : ''
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Carte en bas */}
      <div className="sidebar-bottom-card">
        <div className="sidebar-bottom-text">
          <ShieldCheck size={17} fill="#10B981" color="#10B981" />
          <p>
            Gestion simplifiée,
            <br />
            flotte performante
          </p>
        </div>
        <div className="road road-one" />
        <div className="road road-two" />
        <div className="road road-three" />
      </div>
    </aside>
  );
}
