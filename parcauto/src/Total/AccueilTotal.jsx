import "./HeaderBanner.css";
import img from "../assets/image.png";

import { Container, Row, Col, Card } from "react-bootstrap";
import {
  CreditCard,
  ReceiptText,
  CalendarDays,
  Fuel,
} from "lucide-react";

export default function HeaderBanner({
  total = 0,
  montant = 0,
  volume = 0,
  date_aujourdhui = new Date(),
}) {
  const formatMontant = (value) =>
    `${Number(value || 0).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} MAD`;

  const formatVolume = (value) =>
    `${Number(value || 0).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} L`;

  const formatDate = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const kpis = [
    {
      title: "Cartes Actives",
      value: total,
      Icon: CreditCard,
    },
    {
      title: "Montant du Mois",
      value: formatMontant(montant),
      Icon: ReceiptText,
    },
    {
      title: "Volume du Mois",
      value: formatVolume(volume),
      Icon: Fuel,
    },
    {
      title: "Date du Jour",
      value: formatDate(date_aujourdhui),
      Icon: CalendarDays,
    },
  ];

  return (
    <div>
      <Container fluid className="header-banner">
        <Row className="align-items-center g-0">
          <Col xs={2} md={1}>
            <div className="banner-icon">
              <Fuel size={30} strokeWidth={2.2} />
            </div>
          </Col>

          <Col xs={10} md={7}>
            <div className="banner-text">
              <h1>Gestion des Cartes Total &amp; Transactions</h1>
              <p>
                Importation des rapports de transactions TotalEnergies
                et suivi de la consommation de la flotte.
              </p>
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div className="banner-visual">
              <img
                src={img}
                alt="Pompe à carburant"
                className="fuel-image"
              />
            </div>
          </Col>
        </Row>
      </Container>

      <Container fluid className="kpi-container">
        <Row className="g-3">
          {kpis.map((kpi) => {
            const Icon = kpi.Icon;

            return (
              <Col xs={12} sm={6} xl={3} key={kpi.title}>
                <Card className="kpi-card total-kpi-card h-100 border-0 shadow-sm py-2">
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="kpi-icon">
                      <Icon size={29} strokeWidth={2.1} />
                    </div>
                    <div>
                      <span className="text-muted d-block mb-1" style={{ fontSize: '1rem' }}>
                        {kpi.title}
                      </span>
                      <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                        {kpi.value}
                      </h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
}