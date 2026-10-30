import { useState } from 'react';
import { UploadCloud, Download, CheckCircle, Sparkles, ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MassImport({ onSuccessToast, onErrorToast }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  const handleValidateImport = async () => {
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        let allFormattedData = []
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          if (!jsonData || jsonData.length === 0) return;
          const formatDate = (dateStr) => {
            if (!dateStr || dateStr === '' || dateStr === undefined || dateStr === null) return null;
            let str = String(dateStr).trim()
            str = str.split('T')[0].split(' ')[0]
            if (/[a-zA-ZÀ-ÿ]/.test(str) && !str.includes('-') && !str.includes('/')) {
              return null
            }
            if (typeof dateStr === 'number' || (!isNaN(dateStr) && !str.includes('-') && !str.includes('/'))) {
              const excelEpoch = new Date(1899, 12, 30);
              const jsDate = new Date(excelEpoch.getTime() + Number(dateStr) * 86400000);
              if (!isNaN(jsDate.getTime())) {
                return jsDate.toISOString().split('T')[0];
              }
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
              return str;
            }
            if (str.includes('/') || str.includes('-')) {
              const separator = str.includes('/') ? '/' : '-';
              const parts = str.split(separator);
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  const formatted = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                  if (!isNaN(new Date(formatted).getTime())) return formatted;
                }
                let day = parts[0].padStart(2, '0');
                let month = parts[1].padStart(2, '0');
                let year = parts[2];
                if (year.length === 2) year = '20' + year;
                const formatted = `${year}-${month}-${day}`;
                if (!isNaN(new Date(formatted).getTime())) return formatted;
              }
            }
            return null;
          }
          let colMap = {
            type: 0, immat: 1, ville: 2, chauffeur: 3, 
            assurance: 4, visite: 5, vignette: 6, circulation: 7, contact: 8, permis: 9
          }
          for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
            const row = jsonData[i];
            if (row && Array.isArray(row)) {
              row.forEach((cell, idx) => {
                const val = String(cell || '').toLowerCase().trim();
                if (val.includes('immat') || val.includes('matricule')) colMap.immat = idx;
                if (val.includes('type') || val.includes('marque')) colMap.type = idx;
                if (val.includes('ville')) colMap.ville = idx;
                if (val.includes('chauffeur')) colMap.chauffeur = idx;
                if (val.includes('assurance')) colMap.assurance = idx;
                if (val.includes('visite')) colMap.visite = idx;
                if (val.includes('vignette')) colMap.vignette = idx;
                if (val.includes('mise') || (val.includes('circulation') && !val.includes('permis'))) colMap.circulation = idx;
                if (val.includes('contact')) colMap.contact = idx;
                if (val.includes('permis')) colMap.permis = idx;
              })
            }
          }
          jsonData.forEach((row) => {
            if (!row || row.length === 0) return;
            const immat = String(row[colMap.immat] || '').trim();
            const rawType = String(row[colMap.type] || '').trim();
            const typeVh = rawType !== '' ? rawType : 'Sans affectation';
            const lowerImmat = immat.toLowerCase();
            const lowerType = typeVh.toLowerCase()
            if (
              !immat || 
              lowerImmat === 'total' || lowerImmat === 'nombre' ||
              lowerType === 'total' || lowerType === 'vehicules' ||
              lowerImmat.includes('immatriculation') || lowerImmat.includes('matricule') || 
              lowerType.includes('type') || lowerType.includes('véhicule') || lowerType.includes('marque') ||
              lowerImmat === 'ville' || lowerImmat === 'contact' ||
              (!isNaN(immat) && immat !== '') || 
              (!immat.includes('/assurence') && !immat.includes('-') && immat.length < 3)
            ) {
              return;
            }
            allFormattedData.push({
              type_vehicule: typeVh,
              immatriculation: immat,
              ville: String(row[colMap.ville] || '').trim() || null,
              chauffeur: String(row[colMap.chauffeur] || '').trim() || null,
              assurance_fin: formatDate(row[colMap.assurance]),
              visite_technique: formatDate(row[colMap.visite]),
              vignettes: formatDate(row[colMap.vignette]),
              mise_en_circulation: formatDate(row[colMap.circulation]),
              permis_circulation: formatDate(row[colMap.permis]),
              contact: String(row[colMap.contact] || '').trim() || null
            });
          })
        })
        if (allFormattedData.length === 0) {
          toast.error("⚠️ Aucune donnée valide trouvée dans le fichier Excel !", {
            position: "top-right",
            theme: "colored"
          })
          setLoading(false)
          return
        }
        const response = await axios.post('http://127.0.0.1:8000/api/vehicules/', allFormattedData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        toast.success(`🚀 Importation réussie ! ${response.data.count || allFormattedData.length} véhicules importés avec succès.`, {
          position: "top-right",
          autoClose: 5000,
          theme: "colored"
        })
        setTimeout(() => {
          navigate('/');
        }, 1500)
      } catch (error) {
        console.error("Erreur globale de lecture du fichier:", error);
        toast.error(`❌ Erreur de lecture du fichier : ${error.response?.data?.error || error.message}`, {
          position: "top-right",
          theme: "colored"
        });
      } finally {
        setLoading(false);
      }
    }
    reader.readAsArrayBuffer(file);
  }
  const handleExportExcelFromApi = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehicules/');
      const vehiculesList = response.data;
      if (!vehiculesList || vehiculesList.length === 0) {
        toast.error("⚠️ Aucun véhicule trouvé dans la base de données pour l'exportation !", {
          position: "top-right",
          theme: "colored"
        })
        return
      }
      const dataToExport = vehiculesList.map((v, index) => ({
        "N°": index + 1,
        "Type de véhicule / Marque": v.type_vehicule,
        "Immatriculation": v.immatriculation,
        "Ville": v.ville,
        "Chauffeur": v.chauffeur,
        "Contact": v.contact,
        "Assurance": v.assurance_fin,
        "Visite technique": v.visite_technique,
        "Vignette": v.vignettes,
        "Mise en circulation": v.mise_en_circulation,
        "Permis de circulation": v.permis_circulation,
      }))
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Véhicules");
      XLSX.writeFile(workbook, "Liste_Vehicules_Complete.xlsx")
      toast.success("📥 Exportation réussie avec succès !", {
        position: "top-right",
        theme: "colored"
      })
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("❌ Erreur lors de la récupération des données pour l'exportation.", {
        position: "top-right",
        theme: "colored"
      })
    }
  }
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "type_vehicule": "Camion",
        "immatriculation": "12345-A-6",
        "ville": "Casablanca",
        "chauffeur": "Nom du chauffeur",
        "contact": "0600000000",
        "assurance_fin": "2027-01-01",
        "visite_technique": "2027-01-01",
        "vignettes": "2027-01-01",
        "mise_en_circulation": "2020-01-01",
        "permis_circulation": "2027-06-03"
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modele_Import");
    XLSX.writeFile(workbook, "Modele_Vehicules_Import.xlsx");
  }
  return (
    <div className="cont py-4 px-3 w-100" style={{ minHeight: '100vh' }}>
      <ToastContainer /> 
      <style>{`
        @keyframes floatSparkle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }  
        .dropzone-container {
          border: 2px dashed #A7F3D0;
          border-radius: 16px;
          background-color: #F8FAFC;
          padding: 2.5rem 1.5rem;
          text-align: center;
          position: relative;
          transition: all 0.2s ease-in-out;
        }
        .dropzone-container:hover {
          border-color: #026523;
          background-color: #F0FDF4;
        }
        .excel-download-model-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #026523;
          border: 1px solid #CBD5E1;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .excel-download-model-btn:hover {
          background-color: #F1F5F9;
          border-color: #026523;
        }
        .valider-import-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #026523;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(2, 101, 35, 0.25);
        }
        .valider-import-btn:disabled {
          background-color: #94A3B8;
          cursor: not-allowed;
          box-shadow: none;
        }
        .valider-import-btn:hover:not(:disabled) {
          background-color: #014d1a;
        }
      `}</style>
      
      <div className="p-4 p-md-5 position-relative overflow-hidden">
        <div className="position-absolute text-success opacity-25" style={{ top: '20px', left: '30px', animation: 'floatSparkle 4s ease-in-out infinite' }}>
          <Sparkles size={24} />
        </div>
        <div className="mb-4 text-center text-md-start">
          <h3 className="fw-bold text-dark mb-1">Gestion et Importation des Véhicules</h3>
          <p className="text-muted small">Importez vos fichiers Excel ou téléchargez la base complète.</p>
        </div>
        <div className="dropzone-container mb-4">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileChange}
            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
            style={{ cursor: 'pointer', zIndex: 2 }}
          />
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-3 shadow-sm"
            style={{ width: '56px', height: '56px', backgroundColor: '#026523' }}
          >
            <UploadCloud size={26} />
          </div>
          <h5 className="fw-bold text-dark mb-1" style={{ textAlign: 'center' }}>
            {file ? file.name : "Glissez-déposez votre fichier Excel"}
          </h5>
          <p className="text-muted small mb-0" style={{ textAlign: 'center' }}>
            ou <span className="text-success fw-semibold">parcourez vos fichiers</span> • .xlsx, .xls, .csv • 5 Mo max
          </p>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <button 
            type="button" 
            onClick={handleDownloadTemplate}
            className="excel-download-model-btn w-100 w-md-auto"
          >
            <Download size={16} />
            <span>Télécharger Modèle Excel (.xlsx)</span>
          </button>
          
          <button 
            type="button" 
            disabled={!file || loading}
            onClick={handleValidateImport}
            className="valider-import-btn w-100 w-md-auto"
          >
            <CheckCircle size={16} />
            <span>{loading ? "Importation en cours..." : "Valider l'importation"}</span>
          </button>
          <button 
            type="button"
            onClick={handleExportExcelFromApi}
            className="valider-import-btn w-100 w-md-auto"
          >
            <Download size={16} />
            <span>Télécharger la liste complète (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  )
}