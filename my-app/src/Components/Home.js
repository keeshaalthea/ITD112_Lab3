import React from "react";
import "../Home.css"; // CSS file for custom styling
import Logo from "./img/DengueLogo.png"; // The logo image for the navbar
import MySVG from "./img/MosquiTracker.svg"; // Import the SVG file you created in Canva
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";

const Home = () => {
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

      {/* Main Content with SVG */}
      <div className="main-content" style={{ paddingTop: "0px", paddingRight: "0px", paddingLeft: "0px", paddingBottom: "0px" }}>
        <img src={MySVG} alt="Main Content" className="svg-image" />
        <button
          className="manage-data-button"
          onClick={() => navigate("/add")}
        >
          Manage Dengue Data
        </button>
      </div>
    </div>
  );
};

export default Home;
