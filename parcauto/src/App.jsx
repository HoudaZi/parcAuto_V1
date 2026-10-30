import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './pageGeneral/Sidebar';

import AppLayout from './pageGeneral/Header'
import Footer from './pageGeneral/footer'
import PageGeneral from './pageGeneral/pageGeneral'
import AddVehiclePage from './composents/addVehicle'
import SuccessToast from './composents/SuccessToast'
import ErrorToast from './composents/ErrorToast'
import ParcAutoDashboard from './Dashbord/dash'
import MassImport from './composents/MassImport'
import Accueil from './pages/page1'
import EspaceJawaz from './Jawas/AccueilJaw'
import General from './Total/pageGeneral'
import TotalHistory from './Total/TotalHistory';

function App() {
  const [formData, setFormData] = useState({
    type_vehicule: '',
    immatriculation: '',
    ville: '',
    chauffeur: '',
    assurance_fin: '',
    visite_technique: '',
    vignettes: '',
    mise_en_circulation: '',
    contact: '',
    permis_circulation: ''
  })

  const [vehicules, setVehicules] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', sub: '' })

  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState({ title: '', sub: '' })



    const fetchVehicules = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/vehicules/');
        setVehicules(response.data); // Hada kay-dir re-render l ga3 les composants li m-passi lihom 'vehicules'
      } catch (error) {
        console.error("Détail de l'erreur Django:", error.response?.data);
      }
    }


    useEffect(() => {
      if (fetchVehicules) {
        fetchVehicules();
      }
    }, []);

    const handleAddVehicle = async (e, navigate) => {
      e.preventDefault();
      try {
        await axios.post('http://127.0.0.1:8000/api/vehicules/', formData);
        await fetchVehicules(); 
        setFormData({
            type_vehicule: '',
            immatriculation: '',
            ville: '',
            chauffeur: '',
            assurance_fin: '',
            visite_technique: '',
            vignettes: '',
            mise_en_circulation: '',
            contact: '',
            permis_circulation: ''
          })
        // <--- Tsenna hta t-fetchia data jdida 3ad dir navigate
        navigate('/assurance/accueil');
      } catch (error) {
        console.error("Erreur:", error);
      }
    }

  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState('');
  const [ville, setVille] = useState('');
  const [chauffeur, setChauffeur] = useState('');
  
  const handleReset = () => {
    setSearchTerm('')
    setType('')
    setVille('')
    setChauffeur('');
  };

  const filteredVehicules = vehicules.filter((v) => {
    const search = searchTerm.toLowerCase().trim()
    const matchSearch =
      searchTerm.trim() === '' ||
      v.immatriculation?.toLowerCase().includes(search) ||
      v.type_vehicule?.toLowerCase().includes(search);

    const matchType =
      type.trim() === '' ||
      v.type_vehicule?.toLowerCase().includes(type.toLowerCase().trim());
    const matchVille =
      ville.trim() === '' ||
      v.ville?.toLowerCase().includes(ville.toLowerCase().trim());
    const matchChauffeur =
      chauffeur.trim() === '' ||
      v.chauffeur?.toLowerCase().includes(chauffeur.toLowerCase().trim());
    return matchSearch && matchType && matchVille && matchChauffeur;
  })

  const [searchTotal, setSearchTotal] = useState('');
  const [transactionsTotal, setTransactionsTotal] = useState([]);
  
  const fetchTotalTransactions = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/total/');
      setTransactionsTotal(response.data);
    } catch (error) {
      console.error("Erreur chargement Total:", error);
    }
  };

  useEffect(() => {
    fetchTotalTransactions();
  }, []);

  const filteredTotal = transactionsTotal.filter((t) => {
    const search = searchTotal.toLowerCase().trim();
    if (!search) return true;
    const immat = t.immatriculation ? String(t.immatriculation).toLowerCase() : '';
    return immat.startsWith(search);
  });

  const handleResetTotal = () => {
    setSearchTotal('');
  };

  const totalMontant = transactionsTotal.reduce(
    (acc, t) => acc + (Number(t.montant) || 0),
    0
  );

  const total = transactionsTotal.length

  const totalVolume = transactionsTotal.reduce(
    (acc, t) =>
      acc +
      (Number(t.volume ?? t.volume_litres ?? t.volume_l) || 0),
    0
  );

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const derniereImport =
    transactionsTotal.length > 0 ? "Aujourd'hui" : "Aucune"

  const [jawaz , setJawaz] = useState(0)

  const fetchJawaz = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/jawaz/'); 
      setJawaz(response.data.length ?? response.data); 
    } catch (error) {
      console.error("Erreur chargement Jawaz:", error);
    }
  };

  useEffect(() => {
    fetchVehicules();
    fetchTotalTransactions();
    fetchJawaz(); // <--- Zid hadi hna bash t-fetchia f l'ouverture
  }, []);

  return (
    <div style={{backgroundColor: '#f8fcf9'}}>
        <BrowserRouter>
          <Routes>
            <Route    
             element={
              <>
                <Sidebar />
                <AppLayout />
              </>
              }>
              <Route path="/" element={<PageGeneral vehicules={vehicules} total={transactionsTotal.length} jawaz={jawaz}/>} />
              <Route path="/assurance" element={<PageGeneral />} />
              <Route 
                path="/total" 
                element={
                  <General
                    transactions={transactionsTotal}
                    filteredTotal={filteredTotal}
                    searchTotal={searchTotal}
                    setSearchTotal={setSearchTotal}
                    handleResetTotal={handleResetTotal}
                    refreshTotal={fetchTotalTransactions}
                    total={transactionsTotal.length}
                    montant={totalMontant}
                    volume={totalVolume}
                    derniere_importation={derniereImport}
                    date_aujourdhui={dateAujourdhui}
                  />
                } 
              />
              <Route path="/jawaz" element={<EspaceJawaz />} />

              <Route 
                path="/assurance/accueil" 
                element={
                  <Accueil
                    vehicules={vehicules}
                    filteredVehicules={filteredVehicules}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    type={type}
                    setType={setType}
                    ville={ville}
                    setVille={setVille}
                    chauffeur={chauffeur}
                    setChauffeur={setChauffeur}
                    handleReset={handleReset}
                    setVehicules={setVehicules} 
                    fetchVehicules={fetchVehicules} 
                  />
                }
              />
              <Route path="/assurance/import_excel" element={<MassImport />} />
              <Route 
                path="/assurance/Ajouter" 
                element={
                  <AddVehiclePage 
                    formData={formData} 
                    setFormData={setFormData} 
                    onAddVehicle={handleAddVehicle} 
                  />
                }
              />
              <Route 
                path="/assurance/dash" 
                element={<ParcAutoDashboard vehicules={vehicules} refreshVehicules={fetchVehicules} />}
              />
              <Route 
                path='/total/historique'
                element={
                  <TotalHistory />
                }
              />
            </Route>
          </Routes>

          <Footer />

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
        </BrowserRouter>
    </div>
  );
}

export default App;