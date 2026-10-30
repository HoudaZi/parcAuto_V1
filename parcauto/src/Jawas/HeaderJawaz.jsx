import { Button, Row, Col } from "react-bootstrap";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import "./HeaderJawaz.css";
import jawazLogo from "../assets/logojawaz.png";

export default function HeaderJawaz({ transactions = [] }) {
  
  const handleExportExcel = () => {
    if (!transactions || transactions.length === 0) {
      alert("Aucune donnée à exporter !");
      return;
    }

    const dataToExport = transactions.map((item, index) => ({
      "N°": index + 1,
      "Immatriculation": item.immatriculation || "N/A",
      "Type Véhicule": item.vehicule_details?.type_vehicule || item.type_vehicule || "Non défini",
      "Ville": item.vehicule_details?.ville || item.ville || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Espace Jawaz");
    XLSX.writeFile(workbook, "Rapport_Espace_Jawaz.xlsx");
  };

  return (
    <div className="jawaz-banner-wrapper mb-4">
      <div className="jawaz-header-card">
        <div className="jawaz-header-overlay p-4">
          <Row className="align-items-center g-3">
            <Col xs={12} lg={8}>
              <div className="d-flex align-items-center gap-3 jawaz-header-info">
                <div className="jawaz-icon-wrapper shadow-sm">
                  <img
                    src={jawazLogo}
                    alt="Logo Jawaz"
                    className="jawaz-logo-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Logo_Jawaz.png/512px-Logo_Jawaz.png";
                    }}
                  />
                </div>
                <div>
                  <h2 className="jawaz-title mb-1 fw-bold">
                    Gestion <span className="text-orange">Espace Jawaz</span>
                  </h2>
                  <p className="jawaz-subtitle text-muted mb-0">
                    Suivi des recharges, passages autoroutiers et solde des badges
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={4} className="d-flex justify-content-lg-end">
              <div className="jawaz-actions-group d-flex align-items-center gap-2 p-2 bg-opacity-75">
                <Button
                  type="button"
                  onClick={handleExportExcel}
                  className="btn-jawaz-export d-flex align-items-center justify-content-center gap-2 px-3 py-2 fw-semibold rounded-3 w-100"
                >
                  <FileSpreadsheet size={18} />
                  <span>Exporter Excel</span>
                </Button>
              </div>
            </Col>

          </Row>
        </div>
      </div>
    </div>
  );
}