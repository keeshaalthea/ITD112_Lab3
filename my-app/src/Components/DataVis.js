import React, { useState, useEffect } from "react";
import "../DataVis.css"; // CSS file for custom styling
import Logo from "./img/DengueLogo.png";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";
import DengueMap from "./DengueMap";
import 'leaflet/dist/leaflet.css';
//import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
//import { db } from "./firebase";

const DataVis = () => {
  const navigate = useNavigate(); 
 

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <img
          src={Logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => navigate("/")} // Navigate to home on logo click
          style={{ cursor: "pointer" }} // Indicate clickable logo
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
          <h3><b>Dengue Data Visualization ────────────</b></h3>
          <p>This page shows the choropleth map of the dengue data showing dengue density rate in each region.</p>
        </aside>
        <main className="main-content">
        <DengueMap/>
        </main>
      </div>
    </div>
  );
};

export default DataVis;