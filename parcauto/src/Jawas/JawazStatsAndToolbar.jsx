import { useState } from "react";
import { Row, Col, Card, Form, Button, Modal } from "react-bootstrap";
import { Car, Coins, Wallet, Upload, Search, RotateCcw, TrendingUp, PlusCircle } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import SuccessToast from "../composents/SuccessToast";
import ErrorToast from "../composents/ErrorToast";
import "./JawazStatsAndToolbar.css";

export default function JawazStatsAndToolbar({
  stats = { totalPassages: 0, totalConsomme: 0, soldeRestant: 0 },
  searchTerm = "",
  onSearchChange,
  onResetSearch,
  onDataImported, 
}) {
  const [showModal, setShowModal] = useState(false);
  const [singleImmat, setSingleImmat] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", sub: "" });

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", sub: "" });

  const triggerSuccess = (title, sub) => {
    setToastMessage({ title, sub });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const triggerError = (title, sub) => {
    setErrorMessage({ title, sub });
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  // إضافة ماتريكول واحدة يدوياً
  const handleAddSingleMatricule = async (e) => {
    e.preventDefault();
    if (!singleImmat.trim()) {
      triggerError("Attention !", "Veuillez entrer une immatriculation.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/jawaz/", {
        immatriculation: singleImmat.trim()
      });

      triggerSuccess("Succès !", "Immatriculation ajoutée avec succès.");
      setSingleImmat("");
      setShowModal(false);
      if (onDataImported) onDataImported();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erreur lors de l'ajout. Vérifiez si elle existe déjà.";
      triggerError("Erreur !", msg);
    }
  };

  // قراءة ورفع ملف Excel مع معالجة ذكية للأعمدة
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // تحويل محتوى الإكسيل إلى JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (!rawData || rawData.length === 0) {
          triggerError("Erreur !", "Le fichier Excel est vide.");
          return;
        }

        // تنظيف وتوحيد البيانات المستخرجة من الإكسيل لتلائم توقعات الـ Backend
        const formattedData = rawData.map((row) => {
          // البحث عن المفتاح الذي يمثل الماتريكول بغض النظر عن طريقة كتابته في الإكسيل
          const immatValue = 
            row.Matricule || 
            row.matricule || 
            row.Immatriculation || 
            row.immatriculation || 
            row.IMMATRICULATION || 
            row.Plaque || 
            Object.values(row)[0]; // كحل أخير، أخذ قيمة أول عمود

          return {
            immatriculation: immatValue ? String(immatValue).trim() : ""
          };
        }).filter(item => item.immatriculation !== "");

        if (formattedData.length === 0) {
          triggerError("Erreur !", "Aucune immatriculation valide trouvée dans le fichier.");
          return;
        }

        // إرسال البيانات إلى الـ API
        axios.post("http://localhost:8000/api/jawaz/", formattedData)
          .then((res) => {
            triggerSuccess("Succès !", res.data.message || "Importation réussie !");
            if (onDataImported) onDataImported();
          })
          .catch((err) => {
            console.error(err);
            const errorMsg = err.response?.data?.error || "Erreur lors de l'importation.";
            triggerError("Erreur !", errorMsg);
          });

      } catch (err) {
        console.error(err);
        triggerError("Erreur !", "Erreur lors de la lecture du fichier Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div className="jawaz-stats-toolbar-container mb-4">
      <div className="jawaz-toolbar bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center flex-wrap gap-3">
        <Button 
          onClick={() => setShowModal(true)}
          className="btn-jawaz-import d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-white shadow-sm border-0"
          style={{ backgroundColor: "#059669" }}
        >
          <PlusCircle size={18} />
          <span>Ajouter Immatriculation</span>
        </Button>

        <label className="btn-jawaz-import d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-white shadow-sm mb-0" style={{ cursor: "pointer", backgroundColor: "#059669" }}>
          <Upload size={18} />
          <span>Importer (Excel)</span>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        <div className="toolbar-divider d-none d-md-block"></div>

        <div className="flex-grow-1 position-relative">
          <div className="input-group search-input-group">
            <span className="input-group-text bg-white border-end-0 ps-3">
              <Search size={18} className="text-muted" />
            </span>
            <Form.Control
              type="text"
              placeholder="Rechercher par immatriculation..."
              value={searchTerm}
              onChange={onSearchChange}
              className="border-start-0 ps-0 shadow-none py-2"
            />
          </div>
        </div>

        <Button variant="light" onClick={onResetSearch} className="btn-jawaz-reset d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-secondary border">
          <RotateCcw size={16} />
          <span>Réinitialiser</span>
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">Ajouter une Immatriculation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSingleMatricule}>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-semibold">Numéro d'immatriculation</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: 12345-A-67"
                value={singleImmat}
                onChange={(e) => setSingleImmat(e.target.value)}
                required
                autoFocus
                className="py-2"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowModal(false)} className="border px-3">
                Annuler
              </Button>
              <Button type="submit" style={{ backgroundColor: "#059669", border: "none" }} className="px-4 text-white">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <SuccessToast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        title={toastMessage.title} 
        message={toastMessage.sub} 
      />

      <ErrorToast 
        show={showError} 
        onClose={() => setShowError(false)} 
        message={errorMessage.sub} 
      />
    </div>
  );
}