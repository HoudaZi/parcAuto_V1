import { Container } from "react-bootstrap";
import HeaderBanner from "./AccueilTotal";
import TransactionToolbar from "./TransactionToolbar";
import CardsTable from "./CardsTable";

export default function General({
  transactions = [],
  filteredTotal = [],
  searchTotal,
  setSearchTotal,
  handleResetTotal,
  refreshTotal,
  total = 0,
  montant = 0,
  volume = 0,
  derniere_importation = "N/A",
  date_aujourdhui = new Date(),
}) {
  return (
    <div className="total-page">
      <Container fluid className="py-4">
        <HeaderBanner
            total={total}
            montant={montant}
            volume={volume}
            derniere_importation={derniere_importation}
            date_aujourdhui={date_aujourdhui}
        />

        <TransactionToolbar
          transactionsTotal={transactions}
          filteredTotal={filteredTotal}
          searchTotal={searchTotal}
          setSearchTotal={setSearchTotal}
          handleResetTotal={handleResetTotal}
          refreshTotal={refreshTotal}
        />

        <CardsTable
          transactions={
            filteredTotal.length > 0 || searchTotal
              ? filteredTotal
              : transactions
          }
        />
      </Container>
    </div>
  );
}