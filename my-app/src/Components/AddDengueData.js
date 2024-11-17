import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "../AddDengue.css"; // CSS file for custom styling
import Logo from "./img/DengueLogo.png";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";

const DengueDataList = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [regions, setRegions] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDate = formatDate(date);

      await addDoc(collection(db, "dengueData"), {
        location,
        cases: Number(cases),
        deaths: Number(deaths),
        date: formattedDate,
        regions,
      });
      setLocation("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegions("");
      alert("Data added successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      return;
    }
    setCsvFile(file);
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = parsed.data;

      const data = rows.slice(2).map((row) => ({
        location: row["loc"]?.trim() || "",
        cases: isNaN(Number(row["cases"]?.trim())) ? 0 : Number(row["cases"]?.trim()),
        deaths: isNaN(Number(row["deaths"]?.trim())) ? 0 : Number(row["deaths"]?.trim()),
        date: row["date"]?.trim() || "",
        regions: row["Region"]?.trim() || "",
        year: row["year"]?.trim() || "",
      }));

      try {
        const batch = data.map(async (item) => {
          await addDoc(collection(db, "dengueData"), item);
        });

        await Promise.all(batch);
        alert("CSV data uploaded successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error uploading CSV data:", error);
        alert("Failed to upload CSV data. Please try again.");
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <img
          src={Logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
        <div className="navbar-icons">
          <span className="icon" onClick={() => navigate("/add")} style={{ cursor: "pointer" }}>
            <img src={addIcon} alt="Add" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/list")} style={{ cursor: "pointer" }}>
            <img src={tableIcon} alt="Table" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/map")} style={{ cursor: "pointer" }}>
            <img src={graphIcon} alt="Graph" className="icon-image" />
          </span>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="content">
        <aside className="sidebar">
          <h3>
            <b>Add Dengue Data ────────────</b>
          </h3>
          <p>Add new dengue data entries or upload a CSV file.</p>
          <button
            className="data-button"
            onClick={() => navigate("/list")}
          >
            View Dengue Data 🡢
          </button>
        </aside>
        <main className="main-content" style={{ paddingTop: "102px", paddingBottom: "120px"}}>
          {/* Dengue Data Form */}
          <div className="form-section">
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Cases"
                  value={cases}
                  onChange={(e) => setCases(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Deaths"
                  value={deaths}
                  onChange={(e) => setDeaths(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  placeholder="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  value={regions}
                  onChange={(e) => setRegions(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>
                    Select Region
                  </option>
                  <option value="Region I-ILOCOS REGION">Region I-ILOCOS REGION</option>
                  <option value="Region II-CAGAYAN VALLEY">Region II-CAGAYAN VALLEY</option>
                  <option value="REGION III-CENTRAL LUZON">REGION III-CENTRAL LUZON</option>
                  <option value="REGION IV-A-CALABARZON">REGION IV-A-CALABARZON</option>
                  <option value="REGION IVB-MIMAROPA">REGION IVB-MIMAROPA</option>
                  <option value="REGION V-BICOL REGION">REGION V-BICOL REGION</option>
                  <option value="REGION VI-WESTERN VISAYAS">REGION VI-WESTERN VISAYAS</option>
                  <option value="REGION VII-CENTRAL VISAYAS">REGION VII-CENTRAL VISAYAS</option>
                  <option value="REGION VII-EASTERN VISAYAS">REGION VII-EASTERN VISAYAS</option>
                  <option value="REGION IX-ZAMBOANGA PENINSULA">REGION IX-ZAMBOANGA PENINSULA</option>
                  <option value="REGION X-NORTHERN MINDANAO">REGION X-NORTHERN MINDANAO</option>
                  <option value="REGION XI-DAVAO REGION">REGION XI-DAVAO REGION</option>
                  <option value="REGION XII-SOCCSKSARGEN">REGION XII-SOCCSKSARGEN</option>
                  <option value="CAR">CAR</option>
                  <option value="CARAGA">CARAGA</option>
                  <option value="BARMM">BARMM</option>
                  <option value="NATIONAL CAPITAL REGION">NATIONAL CAPITAL REGION</option>
                </select>
              </div>

              <button type="submit" className="submit-button">
                Add Data
              </button>
            </form>
          </div>
          {/* CSV Uploader */}
          <div className="csv-uploader-section">
            <h2>Upload File Directly</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="csv-input"
            />
            <button onClick={handleFileUpload} className="csv-upload-button">
              Upload
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DengueDataList;
