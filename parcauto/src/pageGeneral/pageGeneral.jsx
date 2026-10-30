
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import {
  CarFront,
  ShieldCheck,
  Fuel,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Bell,
  Coins,
  MapPin,
  FileText,
  Droplet,
  ChartNoAxesColumn,
} from 'lucide-react';

import 'animate.css';
import './pageGeneral.css'
import imgPacauto from '../assets/parcauto.jpeg'
import imgTotal from '../assets/Total.jpg'
import imgJawaz from '../assets/jawaz.jpg'

const modules = [
  {
    title: 'Document Vericuls',
    subtitle: 'Gestion de flotte',
    description:
      'Suivi des véhicules, visites techniques, assurances et alertes d’expiration.',
    path: '/assurance/accueil',
    color: '#079875',
    light: '#E2F7F0',
    image: imgPacauto,
    icon: CarFront,
    secondaryIcon: ShieldCheck,
    tags: [
      { label: 'Véhicules', icon: CarFront },
      { label: 'Assurances', icon: ShieldCheck },
    ],
  },
  {
    title: 'Gestion Carburant',
    subtitle: 'TotalEnergies',
    description:
      'Importation et suivi des transactions de carburant, kilomètres et tickets.',
    path: '/total',
    color: '#3478E5',
    light: '#E8F0FF',
    image: imgTotal,
    icon: Fuel,
    secondaryIcon: Coins,
    tags: [
      { label: 'Transactions', icon: FileText },
      { label: 'Consommation', icon: Droplet },
    ],
  },
  {
    title: 'Espace Jawaz',
    subtitle: 'Badges autoroutiers',
    description:
      'Gestion des passages d’autoroute Jawaz, import Excel et soldes.',
    path: '/jawaz',
    color: '#DF8C22',
    light: '#FFF2DE',
    image: imgJawaz,
    icon: CreditCard,
    secondaryIcon: MapPin,
    tags: [
      { label: 'Soldes', icon: Coins },
      { label: 'Passages', icon: MapPin },
    ],
  },
]



const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400&auto=format&fit=crop',
    title: 'Bonjour Ahmed 👋',
    date: 'Lundi 28 avril 2025',
    description:
      'Gestion centralisée du parc automobile, de la consommation de carburant et des badges Jawaz.',
    button: 'Espace Total',
    path: '/total',
  },
  {
    image:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1400&auto=format&fit=crop',
    title: 'Gestion intelligente du parc auto',
    date: 'Votre flotte en un seul espace',
    description:
      'Suivez vos véhicules, vos assurances et vos visites techniques.',
    button: 'Découvrir les véhicules',
    path: '/assurance/accueil',
  },
  {
    image:
      'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=1400&auto=format&fit=crop',
    title: 'Maîtrisez vos dépenses',
    date: 'Gestion du carburant',
    description:
      'Consultez vos transactions et optimisez le suivi des cartes carburant.',
    button: 'Gestion carburant',
    path: '/total',
  },
  {
    image:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1400&auto=format&fit=crop',
    title: 'Recharge et suivi Jawaz',
    date: 'Gestion des badges autoroutiers',
    description:
      'Centralisez les badges, les passages et le suivi des soldes.',
    button: 'Service Jawaz',
    path: '/jawaz',
  },
];

export default function PageGeneral({ vehicules , total , jawaz  }) {
  const totalVehicules = vehicules?.length ?? 0;

  const stats = [
    {
      label: 'Total Véhicules',
      value: totalVehicules,
      note: 'Véhicules enregistrés dans le parc',
      icon: CarFront,
      color: '#078F6D',
      light: '#E0F7EF',
      badge: 'Parc Auto',
      lien: '/assurance/accueil',
    },
    {
      label: 'Total Actives',
      value: total,
      note: 'Gestion des cartes carburant',
      icon: Fuel,
      color: '#3478E5',
      light: '#E6EFFF',
      badge: 'Total',
      lien : '/total',
    },
    {
      label: 'Jawaz Actifs',
      value: jawaz,
      note: 'Gestion des badges autoroutiers',
      icon: CreditCard,
      color: '#DF8C22',
      light: '#FFF1D8',
      badge: 'Jawaz',
      lien : '/jawaz',
    },
  ];

  return (
    <div className="dashboard-home">
      <Carousel
        fade
        interval={5000}
        className="dashboard-carousel mb-3"
        indicators
        controls
      >
        {slides.map((slide) => (
         <Carousel.Item key={slide.title}>
            <div className="hero-slide">
              <img
                src={slide.image}
                alt={slide.title}
                className="hero-image"
              />
              <div className="hero-overlay" />
              <div className="hero-content">
                <div className="hero-copy" style={{ maxWidth: '100%' }}>
                  <h1>{slide.title}</h1>
                  <div className="hero-date">
                    <span>▦</span>
                    {slide.date}
                  </div>
                  <p>{slide.description}</p>
                  <Link to={slide.path} className="hero-button">
                    {slide.button}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Container fluid className="px-0 pb-4">
        <Row className="g-3 mb-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Col xs={12} md={4} key={stat.label}>
                <Card className="stat-card h-100">
                  <Card.Body>

                    <div className="stat-main">
                      <div
                        className="stat-icon"
                        style={{ background: stat.light, color: stat.color }}
                      >
                        <Icon size={25} strokeWidth={2.5} />
                      </div>

                      <div className="stat-details">
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                      </div>
                    </div>

                    <div className="stat-footer">
                      <span>{stat.note}</span>
                      <span className="stat-arrow">
                        <Link to={stat.lien} className="px-4 py-2 text-secondary text-decoration-none d-flex align-items-center">
                          <ArrowRight size={14} />
                        </Link>
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        <div className="modules-heading">
          <div>
            <h2>Accès aux modules</h2>
            <p>Sélectionnez un module pour accéder à ses fonctionnalités.</p>
          </div>

          <span className="overview-badge">
            <ChartNoAxesColumn size={14} />
            Vue générale
          </span>
        </div>

        <Row className="g-3">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const SecondaryIcon = module.secondaryIcon;

            return (
              <Col xs={12} md={4} key={module.title}>
                <Card
                  className="module-card h-100"
                  style={{ '--module-color': module.color }}
                >
                  <Card.Body>
                    <img src={module.image} alt={module.title} className="module-bg-image" />
                    <div className="module-top">
                      <div
                        className="module-icon"
                        style={{ background: module.color }}
                      >
                        <Icon size={27} color="#fff" strokeWidth={2.4} />
                      </div>

                      <div
                        className="module-secondary-icon"
                        style={{ background: module.light, color: module.color }}
                      >
                        <SecondaryIcon size={20} />
                      </div>

                      <span
                        className="module-number"
                        style={{ background: module.light, color: module.color }}
                      >
                        0{index + 1}
                      </span>
                    </div>

                    <div className="module-description">
                      <h3 className='module-title'>{module.title}</h3>
                      <div className="module-subtitle">{module.subtitle}</div>
                      <p className="module-description">{module.description}</p>
                    </div>

                    <div className="module-tags">
                      {module.tags.map((tag) => {
                        const TagIcon = tag.icon;

                        return (
                          <span
                            className="module-tag"
                            key={tag.label}
                            style={{
                              background: module.light,
                              color: module.color,
                            }}
                          >
                            <TagIcon size={13} />
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>

                    <Link to={module.path} className="module-action">
                      Accéder au module
                      <ArrowRight size={16} />
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* <footer className="dashboard-footer">
          <span>© 2025 Parc Auto Enterprise. Tous droits réservés.</span>
          <span className="footer-status">
            <span />
            Parc Auto Enterprise v1.0.0
          </span>
        </footer> */}
      </Container>
    </div>
  );
}
