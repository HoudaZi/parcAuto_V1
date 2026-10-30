import React from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { SlidersHorizontal, Search, RotateCcw, MapPin, User, Truck } from 'lucide-react';
import './filter.css';

export default function FiltresAvances({ vehicules, searchTerm, setSearchTerm, type, setType, ville, setVille, chauffeur, setChauffeur, handleReset }) {
  return (
    <Card className="filtres-container-card my-3">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="filtres-icon-badge">
            <SlidersHorizontal size={18} />
          </div>
          <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>
            Filtres avancés
          </h5>
        </div>
        <span className="badge-vehicules-count">
          <strong>{vehicules ? vehicules.length : 0}</strong> véhicules trouvés
        </span>
      </div>

      <div className="mb-3 position-relative">
        <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
          <Search size={16} />
        </span>
        <Form.Control
          type="text"
          placeholder="Immatriculation ou marque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-5 shadow-none"
        />
      </div>

      <Row className="g-3">
        <Col md={6}>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
              <Truck size={16} />
            </span>
            <Form.Control
              type="text"
              placeholder="Type de véhicule..."
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="ps-5 shadow-none"
            />
          </div>
        </Col>

        <Col md={6}>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
              <MapPin size={16} />
            </span>
            <Form.Control
              type="text"
              placeholder="Ville..."
              value={ville} 
              onChange={(e) => setVille(e.target.value)}
              className="ps-5 shadow-none"
            />
          </div>
        </Col>

        <Col md={6}>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
              <User size={16} />
            </span>
            <Form.Control
              type="text"
              placeholder="Chauffeur..."
              value={chauffeur}
              onChange={(e) => setChauffeur(e.target.value)}
              className="ps-5 shadow-none"
            />
          </div>
        </Col>

        <Col md={6}>
          <Button
            type="button"
            onClick={handleReset}
            className="btn-reset-filters w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Réinitialiser</span>
          </Button>
        </Col>
      </Row>
    </Card>
  );
}