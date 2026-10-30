import React from 'react'
import { Container } from 'react-bootstrap'
import { FileSpreadsheet, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import './FleetHeader.css'

export default function FleetHeader() {
  return (
    <div className="fleet-header-wrapper">
      <Container fluid className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-0">
        <div>
          <h1 className="fleet-title">
            Suivi des Assurances de la Flotte
          </h1>
          <p className="fleet-subtitle">
            Liste et gestion des véhicules de la flotte
          </p>
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <Link to="/assurance/import_excel" className="btn-fleet-outline">
            <FileSpreadsheet size={16} />
            <span>Importer / Exporter Excel</span>
          </Link>
          <Link to="/assurance/Ajouter" className="btn-fleet-primary">
            <Plus size={18} />
            <span>Ajouter un Véhicule</span>
          </Link>
        </div>
      </Container>
    </div>
  )
}