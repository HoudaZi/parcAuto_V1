
import React from "react";
import { Card, Table, Button } from "react-bootstrap";
import {
  Truck,
  CreditCard,
  MapPin,
  ArrowRight
} from "lucide-react";
import "./JawazTable.css";

export default function JawazTable({
  transactions = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalResults,
  onPageChange,
}) {
  const COLUMN_COUNT = 3;

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    safeTotalPages
  );

  const resultsCount =
    totalResults !== undefined ? totalResults : transactions.length;

  const getPages = () => {
    const pages = new Set([1, safeTotalPages]);

    for (
      let page = Math.max(2, safeCurrentPage - 1);
      page <= Math.min(safeTotalPages - 1, safeCurrentPage + 1);
      page++
    ) {
      pages.add(page);
    }

    return [...pages].sort((a, b) => a - b);
  };

  const pagesArray = getPages();

  return (
    <>
      {/* Titre et nombre de résultats */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 px-1">
        <div>
          <h6 className="fw-bold text-dark mb-1">
            Liste des immatriculations
          </h6>
          <span className="text-muted small">
            Consultez les véhicules enregistrés
          </span>
        </div>

    <span className="jawaz-results-badge">
      Total : {totalResults} véhicules
    </span>
      </div>

      {/* Tableau */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 jawaz-data-table">
            <thead>
              <tr>
                <th className="py-3 px-3 border-0">
                  <Truck size={16} className="me-2 text-green-header" />
                  Immatriculation
                </th>

                <th className="py-3 px-3 border-0">
                  <CreditCard size={16} className="me-2 text-green-header" />
                  Type Véhicule
                </th>

                <th className="py-3 px-3 border-0">
                  <MapPin size={16} className="me-2 text-green-header" />
                  Ville
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="text-center py-5 text-muted"
                  >
                    Chargement des données Jawaz...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="text-center py-5 text-muted"
                  >
                    Aucune donnée trouvée.
                  </td>
                </tr>
              ) : (
                transactions.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 fw-bold text-dark">
                      {item.immatriculation || "N/A"}
                    </td>

                    <td className="py-3 px-3 text-dark">
                      {item.vehicule_details?.type_vehicule ||
                        item.type_vehicule ||
                        "Non défini"}
                    </td>

                    <td className="py-3 px-3 text-dark">
                      {item.vehicule_details?.ville ||
                        item.ville ||
                        "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 border-top bg-white">
          <span className="text-muted small">
            Page <strong>{safeCurrentPage}</strong> sur{" "}
            <strong>{safeTotalPages}</strong>
          </span>

          <div className="d-flex align-items-center gap-1 flex-wrap jawaz-pagination">
            <Button
              variant="light"
              size="sm"
              className="jawaz-page-btn"
              onClick={() => onPageChange?.(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
            >
              Précédent
            </Button>

            {pagesArray.map((page, index) => (
              <React.Fragment key={page}>
                {index > 0 &&
                  page - pagesArray[index - 1] > 1 && (
                    <span className="text-muted px-1">…</span>
                  )}

                <Button
                  size="sm"
                  variant="light"
                  className={`jawaz-page-number ${
                    safeCurrentPage === page ? "active" : ""
                  }`}
                  onClick={() => onPageChange?.(page)}
                  disabled={safeCurrentPage === page}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}

            <Button
              variant="light"
              size="sm"
              className="jawaz-page-btn"
              onClick={() => onPageChange?.(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= safeTotalPages}
            >
              Suivant <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
