import { useRef, useState } from "react";
import { Upload, Search, RotateCcw, FileSpreadsheet, LoaderCircle } from "lucide-react";
import { Container, Row, Col } from "react-bootstrap";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";

export default function TransactionToolbar({ searchTotal, setSearchTotal, handleResetTotal, refreshTotal }) {
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    const normalizeKey = (value) =>
        String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    const getRowValue = (row, aliases) => {
        const entries = Object.entries(row);
        const normalizedAliases = aliases.map(normalizeKey);
        for (const alias of normalizedAliases) {
            const match = entries.find(
                ([key, value]) =>
                    normalizeKey(key) === alias &&
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            );
            if (match) return match[1];
        }
        for (const alias of normalizedAliases) {
            if (!alias) continue;
            const match = entries.find(
                ([key, value]) =>
                    normalizeKey(key).includes(alias) &&
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            );
            if (match) return match[1];
        }
        return null;
    }
    const parseNumber = (value) => {
        if (value === null || value === undefined || String(value).trim() === "") {
            return null;
        }
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : null;
        }
        let str = String(value)
            .trim()
            .replace(/\s/g, "")
            .replace(/MAD|DH/gi, "")
            .replace(/[^\d.,+-]/g, "");

        if (!str) return null;
        const commaIndex = str.lastIndexOf(",");
        const dotIndex = str.lastIndexOf(".");
        if (commaIndex !== -1 && dotIndex !== -1) {
            if (commaIndex > dotIndex) {
                str = str.replace(/\./g, "").replace(",", ".");
            } else {
                str = str.replace(/,/g, "");
            }
        } else if (commaIndex !== -1) {
            str = str.replace(",", ".");
        }
        const number = Number(str);
        return Number.isFinite(number) ? number : null;
    };

    const parseInteger = (value) => {
        const number = parseNumber(value);
        if (number === null || !Number.isInteger(number)) {
            return null;
        }
        return number;
    }
    const parseExcelDate = (value) => {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
        if (typeof value === "number") {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (!parsed) return null;
            return [
                parsed.y,
                String(parsed.m).padStart(2, "0"),
                String(parsed.d).padStart(2, "0"),
            ].join("-");
        }
        const str = String(value).trim();
        const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            if (isValidDate(year, month, day)) {
                return `${year}-${month}-${day}`;
            }
            return null
        }
        const frenchMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (frenchMatch) {
            const [, day, month, year] = frenchMatch;
            if (isValidDate(year, month, day)) {
                return [
                    year,
                    month.padStart(2, "0"),
                    day.padStart(2, "0"),
                ].join("-");
            }
        }
        return null;
    }
    const isValidDate = (year, month, day) => {
        const y = Number(year);
        const m = Number(month);
        const d = Number(day);
        if (m < 1 || m > 12 || d < 1 || d > 31) {
            return false;
        }
        const date = new Date(Date.UTC(y, m - 1, d));
        return (
            date.getUTCFullYear() === y &&
            date.getUTCMonth() === m - 1 &&
            date.getUTCDate() === d
        );
    }
    const parseExcelTime = (value) => {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return [
                String(value.getHours()).padStart(2, "0"),
                String(value.getMinutes()).padStart(2, "0"),
                String(value.getSeconds()).padStart(2, "0"),
            ].join(":");
        }

        if (typeof value === "number") {
            const fraction = value % 1;
            const totalSeconds = Math.round(fraction * 86400) % 86400;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return [
                String(hours).padStart(2, "0"),
                String(minutes).padStart(2, "0"),
                String(seconds).padStart(2, "0"),
            ].join(":");
        }

        const str = String(value).trim();
        const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!match) return null;
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = Number(match[3] ?? 0);

        if (hours > 23 || minutes > 59 || seconds > 59) {
            return null;
        }

        return [
            String(hours).padStart(2, "0"),
            String(minutes).padStart(2, "0"),
            String(seconds).padStart(2, "0"),
        ].join(":");
    };

    const normalizeImmatriculation = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, " ");

    const checkDuplicateImmatriculations = (dataList) => {
        const seen = new Set()
        const duplicates = new Set()
        dataList.forEach((item) => {
            const immat = normalizeImmatriculation(item.immatriculation);
            if (!immat || immat === "N/A" || immat === "-") {
                return;
            }
            if (seen.has(immat)) {
                duplicates.add(immat);
            } else {
                seen.add(immat);
            }
        });
        return [...duplicates];
    }
    const checkKilometrageErrors = (dataList) => {
        const errors = [];
        dataList.forEach((item, index) => {
            const kmPrec = item.kil_precedent;
            const kmAct = item.kil_actuelle;

            if (
                kmPrec === null ||
                kmAct === null ||
                kmPrec < 0 ||
                kmAct < 0 ||
                kmAct <= kmPrec
            ) {
                errors.push({
                    ligne: index + 2,
                    immatriculation: item.immatriculation || "Non renseignée",
                    precedent: kmPrec,
                    actuel: kmAct,
                });
            }
        })
        return errors
    }
    const checkVolumeLimitErrors = (dataList) => {
        const errors = [];
        dataList.forEach((item, index) => {
            const typeVh = String(item.type_vehicule || "").toLowerCase();
            const volume = item.volume;

            if (volume === null || volume === undefined) return;
            let maxLimit = null;
            if (typeVh.includes("transit")) {
                maxLimit = 90;
            } else if (typeVh.includes("camion")) {
                maxLimit = 95;
            } else if (typeVh.includes("minicanter") || typeVh.includes("canter")) {
                maxLimit = 90;
            }
            if (maxLimit !== null && volume > maxLimit) {
                errors.push({
                    ligne: index + 2,
                    immatriculation: item.immatriculation || "N/A",
                    type: item.type_vehicule || "Non défini",
                    volume: volume,
                    limit: maxLimit,
                })
            }
        })
        return errors
    }
    const showWarningAlert = (title, errors, formatter) => {
        const html = `
            <div style="
                max-height: 220px;
                overflow-y: auto;
                text-align: left;
                background: #fff3cd;
                color: #664d03;
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
            ">
                ${errors.map(formatter).join("")}
            </div>
            <p style="margin-top: 12px; color: #444; font-size: 13px;">
                Ces anomalies sont signalées, mais <b>l'importation va continuer</b> si vous confirmez.
            </p>
        `
        return Swal.fire({
            icon: "warning",
            title: title,
            html: html,
            confirmButtonText: "Continuer l'importation",
            confirmButtonColor: "#087f5b",
            showCancelButton: true,
            cancelButtonText: "Annuler",
        })
    }
    const mapExcelRow = (row) => {
        const get = (aliases) => getRowValue(row, aliases);
        const rawDate = get(["Date de transaction", "Date transaction"]);
        const rawTime = get(["Heure de la transaction", "Heure transaction"]);
        const rawImmat = get(["Plaque d'immatriculation", "Immatriculation", "Plaque"]);
        const rawTypeVh = get(["Type de véhicule", "Type véhicule", "Marque"])
        return {
            num_filaile: parseInteger(get(["Numéro de la filiale", "Numero filiale"])),
            nom_filaile: String(get(["Nom de la filiale"]) ?? "").trim(),
            no_client: String(get(["No. du client", "Numéro du client"]) ?? "").trim(),
            nom_client: String(get(["Nom du client"]) ?? "").trim(),
            num_paiement: String(get(["Numéro du moyen de paiement", "Numéro moyen de paiement"]) ?? "").trim(),
            immatriculation: normalizeImmatriculation(rawImmat),
            type_vehicule: String(rawTypeVh ?? "Sans affectation").trim(),
            kil_precedent: parseInteger(get(["Kilométrage précédent"])),
            kil_actuelle: parseInteger(get(["Kilométrage actuelle", "Kilométrage actuel"])),
            date_tran: parseExcelDate(rawDate),
            heure_tran: parseExcelTime(rawTime),
            num_ticket: String(get(["Numéro de ticket"]) ?? "").trim(),
            num_station: String(get(["Numéro de la station", "Numéro station"]) ?? "").trim(),
            nom_station: String(get(["Nom de la station", "Nom de station"]) ?? "").trim(),
            num_terminal: String(get(["Numéro de terminal"]) ?? "").trim(),
            nom_pompiste: String(get(["Nom de pompiste"]) ?? "").trim(),
            type_tran: String(get(["Type de transaction"]) ?? "").trim(),
            nom_tran: String(get(["Nom de transaction"]) ?? "").trim(),
            montant_auto: parseNumber(get(["Montant Pré-autorisé", "Montant autorisé"])),
            solde_avant: parseNumber(get(["Solde avant"])),
            nom_produit: String(get(["Nom de produit", "Nom du produit"]) ?? "").trim(),
            prix_unitaire: parseNumber(get(["Prix unitaire"])),
            volume: parseNumber(get(["Volume"])),
            montant: parseNumber(get(["Montant"])),
            chrone_SAM: String(get(["Chrone de la SAM", "Chrono SAM"]) ?? "").trim(),
            atc: String(get(["ATC"]) ?? "").trim(),
            code_autorisation: String(get(["Code d'autorisation"]) ?? "").trim(),
        };
    };

    const checkRequiredData = (dataList) => {
        const errors = [];
        dataList.forEach((item, index) => {
            const missing = [];
            if (!item.immatriculation) {
                missing.push("Immatriculation");
            }
            if (!item.date_tran) {
                missing.push("Date de transaction");
            }
            if (item.montant === null) {
                missing.push("Montant");
            }
            if (missing.length > 0) {
                errors.push({
                    ligne: index + 2,
                    missing,
                });
            }
        })
        return errors
    }
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        if (!/\.(xlsx|xls|csv)$/.test(fileName)) {
            await Swal.fire({
                icon: "error",
                title: "Format non autorisé",
                text: "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV.",
                confirmButtonColor: "#087f5b",
            });
            event.target.value = "";
            return;
        }
        setIsImporting(true)
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                type: "array",
                cellDates: true,
            })
            const firstSheet = workbook.SheetNames[0];
            if (!firstSheet) {
                throw new Error("Le fichier ne contient aucune feuille.");
            }
            const worksheet = workbook.Sheets[firstSheet];
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                defval: null,
                raw: true,
                blankrows: false,
            })
            if (rawData.length === 0) {
                await Swal.fire({
                    icon: "warning",
                    title: "Fichier vide",
                    text: "Aucune transaction n'a été trouvée dans le fichier.",
                    confirmButtonColor: "#087f5b",
                });
                return;
            }
            const formattedData = rawData
                .map(mapExcelRow)
                .filter(
                    (item) =>
                        item.immatriculation ||
                        item.num_ticket ||
                        item.montant !== null
                );
            if (formattedData.length === 0) {
                await Swal.fire({
                    icon: "warning",
                    title: "Aucune donnée exploitable",
                    text: "Vérifiez les noms des colonnes et les données du fichier.",
                    confirmButtonColor: "#087f5b",
                });
                return;
            }
            const requiredErrors = checkRequiredData(formattedData);
            if (requiredErrors.length > 0) {
                const html = `
                    <div style="max-height: 220px; overflow-y: auto; text-align: left; background: #fff5f5; color: #842029; padding: 12px; border-radius: 8px;">
                        ${requiredErrors
                            .map(
                                (err) => `
                            <div style="margin-bottom: 8px;">
                                <strong>Ligne ${err.ligne}</strong> : Champs manquants (${err.missing.join(", ")})
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                `;
                await Swal.fire({
                    icon: "error",
                    title: "Données obligatoires manquantes",
                    html,
                    confirmButtonColor: "#087f5b",
                });
                return;
            }

            const volumeErrors = checkVolumeLimitErrors(formattedData);
            if (volumeErrors.length > 0) {
                const result = await showWarningAlert(
                    "⚠️ Attention : Dépassement du volume de carburant",
                    volumeErrors,
                    (error) => `
                        <div style="margin-bottom: 6px;">
                            <strong>Ligne ${error.ligne}</strong> — ${error.immatriculation} (${error.type})<br/>
                            Volume: <b>${error.volume} L</b> (Max autorisé: ${error.limit} L)
                        </div>
                    `
                );
                if (!result.isConfirmed) return;
            }
            const kmErrors = checkKilometrageErrors(formattedData);
            if (kmErrors.length > 0) {
                const result = await showWarningAlert(
                    "⚠️ Attention : Anomalies de Kilométrage",
                    kmErrors,
                    (error) => `
                        <div style="margin-bottom: 6px;">
                            <strong>Ligne ${error.ligne}</strong> — ${error.immatriculation}<br/>
                            Km préc: ${error.precedent ?? "N/A"} | Km act: ${error.actuel ?? "N/A"}
                        </div>
                    `
                );
                if (!result.isConfirmed) return;
            }
            const response = await axios.post(
                "http://127.0.0.1:8000/api/total/",
                formattedData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            await Swal.fire({
                icon: "success",
                title: "Importation réussie",
                text:
                    response.data.message ||
                    `${response.data.count ?? formattedData.length} transactions importées avec succès.`,
                confirmButtonColor: "#087f5b",
            })
            if (typeof refreshTotal === "function") {
                await refreshTotal();
            }
        } catch (error) {
            console.error("Erreur lors de l'importation :", error.response?.data ?? error);
            let message = "Une erreur est survenue pendant l'importation du fichier.";
            if (error.response?.data?.error) {
                message = error.response.data.error;
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.message) {
                message = error.message;
            }
            await Swal.fire({
                icon: "error",
                title: "Échec de l'importation",
                text: message,
                confirmButtonColor: "#087f5b",
            });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }
    const handleButtonClick = () => {
        if (!isImporting) {
            fileInputRef.current?.click();
        }
    }
    return (
        <div className="card total-toolbar border-0 p-3 mb-4 shadow-sm">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
            />
            <Container fluid className="px-0">
                <Row className="align-items-center g-3">
                    <Col xs={12} lg={6}>
                        <div className="d-flex align-items-center gap-3">
                            <button
                                type="button"
                                onClick={handleButtonClick}
                                disabled={isImporting}
                                className="btn text-white d-flex align-items-center justify-content-center gap-2 px-3 py-2 shadow-sm"
                                style={{
                                    backgroundColor: "#087f5b",
                                    borderColor: "#087f5b",
                                    minHeight: "44px",
                                }}
                            >
                                {isImporting ? (
                                    <LoaderCircle size={19} className="animate-spin" />
                                ) : (
                                    <Upload size={19} />
                                )}
                                <span>
                                    {isImporting ? "Importation en cours..." : "Importer un Rapport Excel"}
                                </span>
                            </button>
                        </div>
                    </Col>
                    <Col xs={12} lg={6}>
                        <div className="d-flex align-items-center gap-2">
                            <div className="input-group flex-grow-1">
                                <span className="input-group-text bg-white border-end-0">
                                    <Search size={18} className="text-success" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0 shadow-none"
                                    placeholder="Rechercher une immatriculation..."
                                    value={searchTotal}
                                    onChange={(event) => setSearchTotal(event.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 flex-shrink-0"
                                onClick={handleResetTotal}
                                title="Réinitialiser la recherche"
                            >
                                <RotateCcw size={17} className="text-success" />
                            </button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}