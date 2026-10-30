import { useState } from 'react';
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import {
  Car,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Phone,
  LayoutDashboard,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function ListeVehicules({
  vehicules = [],
  setVehicules,
  refreshVehicules,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [currentVehicule, setCurrentVehicule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const location = useLocation();

  const safeVehicules = Array.isArray(vehicules) ? vehicules : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentVehicules = safeVehicules.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(safeVehicules.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDelete = async (id, immatriculation) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer le véhicule ${immatriculation} ?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/vehicules/${id}/`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok || response.status === 204) {
        const updatedVehicules = safeVehicules.filter(
          (v) => (v.id || v.pk) !== id
        );

        if (setVehicules) {
          setVehicules(updatedVehicules);
        }

        const newTotalPages = Math.ceil(
          updatedVehicules.length / itemsPerPage
        );

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0) {
          setCurrentPage(1);
        }

        toast.success('Véhicule supprimé avec succès');
        
        if (refreshVehicules) {
          refreshVehicules();
        }
      } else {
        toast.warn('Erreur lors de la suppression du véhicule.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      toast.error('Impossible de contacter le serveur.');
    }
  };

  const handleEditClick = (vehicule) => {
    setCurrentVehicule({ ...vehicule });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setCurrentVehicule(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!currentVehicule || isSaving) return;

    setIsSaving(true);

    try {
      const vehicleId = currentVehicule.id || currentVehicule.pk;
      
      // إرسال التعديل باستخدام axios (أو fetch) مع دعم الجزئي أو الكلي
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/vehicules/${vehicleId}/`,
        currentVehicule
      );

      if (response.status === 200 || response.status === 201) {
        const updatedData = response.data;

        const updatedVehicules = safeVehicules.map((v) =>
          (v.id || v.pk) === (updatedData.id || updatedData.pk) ? updatedData : v
        );

        if (setVehicules) {
          setVehicules(updatedVehicules);
        }

        setShowModal(false);
        setCurrentVehicule(null);

        toast.success('Modifications enregistrées avec succès !', { theme: 'colored' });

        if (refreshVehicules) {
          refreshVehicules();
        }
      } else {
        toast.error('Erreur lors de la mise à jour.', { theme: 'colored' });
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      toast.error(`❌ Erreur : ${errorDetail}`, { theme: 'colored' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setCurrentVehicule((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <Container
      className="my-4 px-0 fleet-page"
      fluid
    >
      <style>{`
        /* ===== Page ===== */
        .fleet-page {
          width: calc(100% - 20px);
          max-width: 100%;
          margin: 10px !important;
          min-width: 0;
        }

        .fleet-page *,
        .fleet-page *::before,
        .fleet-page *::after {
          box-sizing: border-box;
        }

        /* ===== Table Card ===== */
        .custom-fleet-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .custom-fleet-table {
          width: 100%;
          margin-bottom: 0;
        }

        .custom-fleet-table thead th {
          background-color: #026523 !important;
          color: #ffffff !important;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 14px 12px;
          border: none;
          white-space: nowrap;
        }

        .custom-fleet-table tbody tr {
          background-color: #ffffff;
          transition: background-color 0.15s ease-in-out;
        }

        .custom-fleet-table tbody tr:hover {
          background-color: #f8fafc !important;
        }

        .custom-fleet-table tbody td {
          padding: 14px 12px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        /* Forcer la fenêtre modale et son fond sombre à passer au-dessus de la sidebar */
        .modal-backdrop {
          z-index: 1050 !important;
        }

        .modal {
          z-index: 1055 !important;
        }

        /* Éviter le chevauchement avec la sidebar sur les grands écrans */
        @media (min-width: 992px) {
          .fleet-edit-modal {
            max-width: 750px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }

        /* ===== Registration Badge ===== */
        .immat-badge {
          font-family: Monaco, Consolas, monospace;
          font-weight: 600;
          background: #026523;
          color: #ffffff;
          padding: 5px 10px;
          border-radius: 6px;
          letter-spacing: 0.4px;
          display: inline-block;
          font-size: 0.8rem;
        }

        /* ===== Date Badges ===== */
        .date-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 500;
          background: #f8fafc;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .date-badge.valid {
          background: #ecfdf5;
          color: #047857;
          border-color: #a7f3d0;
        }

        .date-badge.empty {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        /* ===== Pagination ===== */
        .custom-pagination-btn {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 34px;
          font-size: 0.85rem;
        }

        .custom-pagination-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #026523;
          border-color: #026523;
        }

        .custom-pagination-btn.active {
          background: #026523;
          color: #ffffff;
          border-color: #026523;
        }

        .custom-pagination-btn:disabled {
          background: #f8fafc;
          color: #cbd5e1;
          border-color: #e2e8f0;
          cursor: not-allowed;
        }

        .fleet-edit-modal {
          width: calc(100% - 32px) !important;
          max-width: 900px !important;
          margin: 1.75rem auto !important;
        }

        .fleet-edit-modal .modal-content {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.22);
          overflow: hidden;
        }

        .fleet-edit-modal .modal-header {
          padding: 18px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .fleet-edit-modal .modal-title {
          color: #087a60;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .fleet-edit-modal .modal-body {
          padding: 24px !important;
          background: #ffffff;
          max-height: 70vh;
          overflow-y: auto;
        }

        .fleet-edit-modal .modal-footer {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .fleet-edit-modal .form-label {
          margin-bottom: 7px;
          color: #334155;
          font-size: 0.9rem;
          font-weight: 500 !important;
          text-align: left;
        }

        .fleet-edit-modal .form-control {
          min-height: 44px;
          padding: 9px 12px;
          color: #1e293b;
          background-color: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 8px;
          font-size: 0.95rem;
          box-shadow: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .fleet-edit-modal .form-control:focus {
          border-color: #087a60;
          box-shadow: 0 0 0 3px rgba(8, 122, 96, 0.12);
        }

        .fleet-edit-modal .btn-success {
          background-color: #026523;
          border-color: #026523;
        }

        .fleet-edit-modal .btn-success:hover {
          background-color: #014f1b;
          border-color: #014f1b;
        }

        .fleet-edit-modal .btn {
          border-radius: 8px;
          padding: 9px 15px;
        }

        /* ===== Responsive Table ===== */
        @media (max-width: 991px) {
          .custom-responsive-table thead {
            display: none;
          }

          .custom-responsive-table tbody tr {
            display: block;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            border-radius: 8px;
            margin: 12px;
            padding: 12px;
            border: 1px solid #e2e8f0;
          }

          .custom-responsive-table tbody td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 9px 0 !important;
            border-bottom: 1px solid #f1f5f9;
            width: 100%;
            white-space: normal;
            text-align: right;
          }

          .custom-responsive-table tbody td::before {
            content: attr(data-label);
            color: #64748b;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            text-align: left;
            flex-shrink: 0;
          }

          .custom-responsive-table tbody td:last-child {
            border-bottom: none;
          }

          .custom-responsive-table tbody td[colspan] {
            display: block;
            text-align: center;
          }

          .custom-responsive-table tbody td[colspan]::before {
            display: none;
          }
        }
      `}</style>

      {/* ===== Page Header ===== */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-3 border-bottom gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{
              width: '48px',
              height: '48px',
              background:
                'linear-gradient(135deg, #026523 0%, #079875 100%)',
              flexShrink: 0,
            }}
          >
            <Car size={24} />
          </div>

          <div>
            <h1
              className="fw-bold text-dark mb-0 fs-3"
              style={{
                letterSpacing: '-0.5px',
                textAlign: 'left',
              }}
            >
              Liste des véhicules
            </h1>

            <p className="text-muted small mb-0" style={{ textAlign: 'left' }}>
              Gérez et suivez l'état de votre parc automobile en temps réel
            </p>
          </div>
        </div>

        <Link
          to="/assurance/dash"
          className={`d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 text-decoration-none fw-semibold shadow-sm ${
            location.pathname === '/assurance/dash'
              ? 'bg-success text-white'
              : 'bg-white text-success border border-success'
          }`}
          style={{ transition: 'all 0.2s ease' }}
        >
          <LayoutDashboard size={18} />
          <span>Tableau de bord (Dashboard)</span>
        </Link>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* ===== Vehicles Table ===== */}
      <Card className="custom-fleet-card p-0">
        <div style={{ overflowX: 'auto' }}>
          <Table className="align-middle mb-0 custom-fleet-table custom-responsive-table">
            <thead>
              <tr>
                <th className="px-3 text-start">Type Véhicule</th>
                <th className="text-start">Immatriculation</th>
                <th className="text-start">Ville</th>
                <th className="text-start">Chauffeur</th>
                <th className="text-start">Contact</th>
                <th className="text-start">Assurance</th>
                <th className="text-start">Visite Technique</th>
                <th className="text-start">Vignette</th>
                <th className="text-start">Mise en circulation</th>
                <th className="text-start">Permis de circulation</th>
                <th className="text-end px-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentVehicules.length > 0 ? (
                currentVehicules.map((v) => (
                  <tr key={v.id || v.pk}>
                    <td data-label="Type véhicule" className="text-start">
                      <span className="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2">
                        <Car size={15} />
                        {v.type_vehicule || 'N/A'}
                      </span>
                    </td>

                    <td data-label="Immatriculation" className="text-start">
                      <span className="immat-badge">
                        {v.immatriculation || '-'}
                      </span>
                    </td>

                    <td data-label="Ville" className="text-start">
                      {v.ville ? (
                        <span className="fw-semibold text-secondary d-inline-flex align-items-center gap-1">
                          <MapPin size={13} className="text-muted" />
                          {v.ville.toUpperCase()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td data-label="Chauffeur" className="text-start">
                      {v.chauffeur ? (
                        <span className="fw-semibold text-dark d-inline-flex align-items-center gap-1">
                          <User size={13} className="text-muted" />
                          {v.chauffeur.toUpperCase()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td data-label="Contact" className="text-start">
                      {v.contact ? (
                        <span className="text-muted small d-inline-flex align-items-center gap-1">
                          <Phone size={13} />
                          {v.contact}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td data-label="Assurance" className="text-start">
                      <span
                        className={`date-badge ${
                          v.assurance_fin ? 'valid' : 'empty'
                        }`}
                      >
                        <Calendar size={12} />
                        {v.assurance_fin || 'Non renseigné'}
                      </span>
                    </td>

                    <td data-label="Visite technique" className="text-start">
                      <span
                        className={`date-badge ${
                          v.visite_technique ? 'valid' : 'empty'
                        }`}
                      >
                        <Calendar size={12} />
                        {v.visite_technique || 'Non renseigné'}
                      </span>
                    </td>

                    <td data-label="Vignette" className="text-start">
                      <span
                        className={`date-badge ${
                          v.vignettes ? 'valid' : 'empty'
                        }`}
                      >
                        <Calendar size={12} />
                        {v.vignettes || 'Non renseigné'}
                      </span>
                    </td>

                    <td data-label="Mise en circulation" className="text-start">
                      <span
                        className={`date-badge ${
                          v.mise_en_circulation ? 'valid' : 'empty'
                        }`}
                      >
                        <Calendar size={12} />
                        {v.mise_en_circulation || 'Non renseigné'}
                      </span>
                    </td>

                    <td data-label="Permis de circulation" className="text-start">
                      <span
                        className={`date-badge ${
                          v.permis_circulation ? 'valid' : 'empty'
                        }`}
                      >
                        <Calendar size={12} />
                        {v.permis_circulation || 'Non renseigné'}
                      </span>
                    </td>

                    <td
                      className="text-end px-3"
                      data-label="Actions"
                    >
                      <div className="d-flex justify-content-end gap-1">
                        <Button
                          variant="light"
                          size="sm"
                          className="text-primary border shadow-sm p-2 rounded-2"
                          onClick={() => handleEditClick(v)}
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </Button>

                        <Button
                          variant="light"
                          size="sm"
                          className="text-danger border shadow-sm p-2 rounded-2"
                          onClick={() =>
                            handleDelete(v.id || v.pk, v.immatriculation)
                          }
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-5 text-muted"
                  >
                    <Car size={32} className="mb-2 opacity-50" />
                    <p className="mb-0 fw-semibold">
                      Aucun véhicule trouvé.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top bg-white gap-3">
            <span className="text-muted small">
              Affichage de{' '}
              <span className="fw-semibold text-dark">
                {indexOfFirstItem + 1}
              </span>{' '}
              à{' '}
              <span className="fw-semibold text-dark">
                {Math.min(indexOfLastItem, safeVehicules.length)}
              </span>{' '}
              sur{' '}
              <span className="fw-semibold text-dark">
                {safeVehicules.length}
              </span>{' '}
              véhicules
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                className="custom-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;

                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 &&
                    pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`custom-pagination-btn ${
                        pageNum === currentPage ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }

                if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="px-1 text-muted"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <button
                className="custom-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <div style={{display: "flex" , justifyContent: "center"}}>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        dialogClassName="fleet-edit-modal"
        backdrop={isSaving ? 'static' : true}
        keyboard={!isSaving}
        style={{ zIndex: 1055,  }}
      >
        {currentVehicule && (
          <>
            <Modal.Header closeButton={!isSaving}>
              <Modal.Title className="fw-semibold d-flex align-items-center gap-2">
                <Pencil size={18} />
                Modifier le véhicule : {currentVehicule.immatriculation}
              </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleUpdateSubmit}>
              <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Type véhicule
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={currentVehicule.type_vehicule || ''}
                        onChange={(e) =>
                          updateField('type_vehicule', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Immatriculation
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={currentVehicule.immatriculation || ''}
                        onChange={(e) =>
                          updateField('immatriculation', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Ville
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={currentVehicule.ville || ''}
                        onChange={(e) =>
                          updateField('ville', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Chauffeur
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={currentVehicule.chauffeur || ''}
                        onChange={(e) =>
                          updateField('chauffeur', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Contact
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={currentVehicule.contact || ''}
                        onChange={(e) =>
                          updateField('contact', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Assurance
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={currentVehicule.assurance_fin || ''}
                        onChange={(e) =>
                          updateField('assurance_fin', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Visite technique
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={currentVehicule.visite_technique || ''}
                        onChange={(e) =>
                          updateField('visite_technique', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Vignette
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={currentVehicule.vignettes || ''}
                        onChange={(e) =>
                          updateField('vignettes', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Mise en circulation
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={currentVehicule.mise_en_circulation || ''}
                        onChange={(e) =>
                          updateField('mise_en_circulation', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-dark text-start d-block">
                        Permis de circulation
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={currentVehicule.permis_circulation || ''}
                        onChange={(e) =>
                          updateField('permis_circulation', e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Annuler
                </Button>

                <Button
                  variant="success"
                  type="submit"
                  disabled={isSaving}
                  style={{ backgroundColor: '#026523', borderColor: '#026523' }}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </Modal.Footer>
            </Form>
          </>
        )}
      </Modal>

      </div>
     
    </Container>
  );
}