import React, { useState, useEffect } from "react";
import {collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy,} from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import "../DengueDataList.css";
import Logo from "./img/DengueLogo.png";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";

const DengueDataList = () => {
  const navigate = useNavigate();

  // State Variables
  const [rawData, setRawData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("location");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dengueCollection = collection(db, "dengueData");
        const q = query(dengueCollection, orderBy("location"));
        const dengueSnapshot = await getDocs(q);
        const dataList = dengueSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawData(dataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  // Utility Functions
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "dengueData", id));
      setRawData(rawData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: formatDate(data.date),
      regions: data.regions,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "dengueData", editingId), {
        ...editForm,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
      });
      const updatedData = rawData.map((data) =>
        data.id === editingId ? { ...data, ...editForm } : data
      );
      setRawData(updatedData);
      setEditingId(null);
      setIsModalOpen(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Filter, Sort, and Paginate Data
  const filteredData = rawData
    .filter((data) =>
      data.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.regions.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "cases" || sortField === "deaths") {
        return sortOrder === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
      }
      return sortOrder === "asc"
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    });

  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
            <b>Dengue Data List ────────────</b>
          </h3>
          <p>This page shows the list of all dengue data recorded from year 2016-2021.</p>
          <button className="data-button" onClick={() => navigate("/map")}>
            View Dengue Map 🡢
          </button>
        </aside>

        <main className="main-content">
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by Location or Region"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="sort-button" onClick={() => handleSort("cases")}>
              Sort by Cases {sortField === "cases" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
            <button className="sort-button" onClick={() => handleSort("deaths")}>
              Sort by Deaths {sortField === "deaths" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
          </div>

          <div className="data-summary">
            Total Data Entries: {filteredData.length}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Cases</th>
                  <th>Deaths</th>
                  <th>Date</th>
                  <th>Regions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((data) => (
                  <tr key={data.id}>
                    <td>{data.location}</td>
                    <td>{data.cases}</td>
                    <td>{data.deaths}</td>
                    <td>{formatDate(data.date)}</td>
                    <td>{data.regions}</td>
                    <td>
                      <button onClick={() => handleEdit(data)} className="edit-button" >Edit</button>
                      <button onClick={() => handleDelete(data.id)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </button>
          </div>

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Location"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Cases"
                      value={editForm.cases}
                      onChange={(e) =>
                        setEditForm({ ...editForm, cases: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Deaths"
                      value={editForm.deaths}
                      onChange={(e) =>
                        setEditForm({ ...editForm, deaths: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="date"
                      placeholder="Date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, date: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Regions"
                      value={editForm.regions}
                      onChange={(e) =>
                        setEditForm({ ...editForm, regions: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="edit-button2">
                      Update
                    </button>
                    <button
                      type="button"
                      className="delete-button2"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DengueDataList;
