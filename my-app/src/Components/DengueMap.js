import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import phGeoData from '../ph.json';
import "../DengueMap.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const populationData = {
  "National Capital Region": 13484462,
  "Ilocos": 5300000,
  "Cagayan Valley": 3680000,
  "Central Luzon": 13029000,
  "Calabarzon": 16205000,
  "Mimaropa": 3296000,
  "Bicol": 6000000,
  "Western Visayas": 7937000,
  "Central Visayas": 8029000,
  "Eastern Visayas": 4500000,
  "Zamboanga Peninsula": 3800000,
  "Northern Mindanao": 5100000,
  "Davao": 5100000,
  "Soccsksargen": 4500000,
  "Caraga": 2800000,
  "Autonomous Region in Muslim Mindanao": 4100000,
  "Cordillera Administrative Region": 1700000
};

const mapDbRegionToGeoRegion = (dbRegionName) => {
  if (!dbRegionName) return null;
  
  const mapping = {
    "REGION XI-DAVAO REGION": "Davao",  // Updated to match your Firestore data
    "DAVAO":"Davao",
    "Region II-CAGAYAN VALLEY": "Cagayan Valley",
    "CAGAYAN VALLEY": "Cagayan Valley",
    "REGION II-CAGAYAN VALLEY": "Cagayan Valley",
    "REGION III-CENTRAL LUZON": "Central Luzon",
    "CENTRAL LUZON": "Central Luzon",
    "REGION V-BICOL REGION": "Bicol",
    "BICOL REGION": "Bicol",
    "BICOL": "Bicol",
    "REGION IV-A-CALABARZON": "Calabarzon",
    "CALABARZON": "Calabarzon",
    "Region I-ILOCOS REGION": "Ilocos",
    "REGION I-ILOCOS REGION": "Ilocos",
    "ILOCOS REGION": "Ilocos",
    "ILOCOS": "Ilocos",
    "REGION IVB-MIMAROPA": "Mimaropa",
    "MIMAROPA": "Mimaropa",
    "REGION VI-WESTERN VISAYAS": "Western Visayas",
    "WESTERN VISAYAS": "Western Visayas",
    "REGION VII-CENTRAL VISAYAS": "Central Visayas",
    "CENTRAL VISAYAS": "Central Visayas",
    "REGION VIII-EASTERN VISAYAS": "Eastern Visayas",
    "EASTERN VISAYAS": "Eastern Visayas",
    "REGION VII-EASTERN VISAYAS": "Eastern Visayas",
    "REGION IX-ZAMBOANGA PENINSULA": "Zamboanga Peninsula",
    "ZAMBOANGA PENINSULA": "Zamboanga Peninsula",
    "REGION X-NORTHERN MINDANAO": "Northern Mindanao",
    "NORTHERN MINDANAO": "Northern Mindanao",
    "CAR": "Cordillera Administrative Region",
    "CORDILLERA ADMINISTRATIVE REGION": "Cordillera Administrative Region",
    "CARAGA": "Caraga",
    "BARMM": "Autonomous Region in Muslim Mindanao",
    "AUTONOMOUS REGION IN MUSLIM MINDANAO": "Autonomous Region in Muslim Mindanao",
    "NATIONAL CAPITAL REGION": "National Capital Region",
    "REGION XII-SOCCSKSARGEN": "Soccsksargen",
    "Soccsksargen": "Soccsksargen",
    "SOCCSKSARGEN":"Soccsksargen",
  };

  const mappedName = mapping[dbRegionName.toUpperCase()];
  console.log(`Mapping region: ${dbRegionName} to: ${mappedName}`);
  if (!mappedName) {
    console.warn(`Region not mapped: ${dbRegionName}`);
    return null;
}
  return mappedName;

};

const DengueMap = () => {
  const [metric, setMetric] = useState('cases');
  const [year, setYear] = useState('all');
  const [mapKey, setMapKey] = useState(0);
  const [years, setYears] = useState(['all']);
  const [totalCases, setTotalCases] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [regionData, setRegionData] = useState({});

  const getColorForCases = (density) => {
    return density > 7 ? '#800026' :
           density > 5 ? '#BD0026' :
           density > 2 ? '#E31A1C' :
           density > 1 ? '#FC4E2A' :
           density > 0.5 ? '#FD8D3C' :
           density > 0.2 ? '#FEB24C' :
           density > 0.1 ? '#FED976' :
                         '#FFEDA0';
  };

  const getColorForDeaths = (density) => {
    return density > 0.09 ? '#800026' :
           density > 0.07 ? '#BD0026' :
           density > 0.05 ? '#E31A1C' :
           density > 0.04 ? '#FC4E2A' :
           density > 0.03 ? '#FD8D3C' :
           density > 0.02 ? '#FEB24C' :
           density > 0.01 ? '#FED976' :
                          '#FFEDA0';
  };

  useEffect(() => {
    const fetchDengueData = async () => {
      try {
        console.log("Fetching data from Firestore...");
        const querySnapshot = await getDocs(collection(db, "dengueData"));
        const newData = {};
        let totalC = 0;
        let totalD = 0;
        const availableYears = new Set(['all']);

        querySnapshot.forEach((doc) => {
          const record = doc.data();
          console.log("Processing record:", record);  // Debug log

          const region = mapDbRegionToGeoRegion(record.regions);
          if (!region) {
            console.log("Could not map region:", record.regions);
            return;
          }

          // Parse date and extract year
          const dateParts = record.date.split('/');
          const year = dateParts[2];  // Get year from DD/MM/YYYY format

          console.log(`Processing record - Region: ${region}, Year: ${year}, Cases: ${record.cases}, Deaths: ${record.deaths}`);

          // Initialize region if it doesn't exist
          if (!newData[region]) {
            newData[region] = {
              all: { cases: 0, deaths: 0 }
            };
          }

          // Initialize year if it doesn't exist
          if (!newData[region][year]) {
            newData[region][year] = { cases: 0, deaths: 0 };
          }

          // Use the numbers directly since they're already number type in Firestore
          const cases = record.cases;
          const deaths = record.deaths;

          // Add to specific year
          newData[region][year].cases += cases;
          newData[region][year].deaths += deaths;

          // Add to 'all' years total
          newData[region].all.cases += cases;
          newData[region].all.deaths += deaths;

          totalC += cases;
          totalD += deaths;

          availableYears.add(year);
        });

        console.log("Processed data:", newData);
        setRegionData(newData);
        setTotalCases(totalC);
        setTotalDeaths(totalD);
        setYears(Array.from(availableYears).sort());
      } catch (error) {
        console.error("Error fetching dengue data:", error);
      }
    };

    fetchDengueData();
  }, []);

  const calculateDensity = (region, yearValue) => {
    console.log(`Calculating density for region: ${region}, year: ${yearValue}`);
    console.log(`Region data:`, regionData[region]);
    
    if (!regionData[region] || !regionData[region][yearValue]) {
      console.log(`No data for region ${region} year ${yearValue}`);
      return 0;
    }

    const population = populationData[region] || 1;
    const value = metric === 'cases' ? 
      regionData[region][yearValue].cases : 
      regionData[region][yearValue].deaths;
    
    const density = (value / population) * 10000;
    console.log(`Calculated density: ${density} (${value} / ${population} * 10000)`);
    return density;
  };

  const onEachRegion = (feature, layer) => {
    const geoRegionName = feature.properties?.name;
    const mappedRegionName = mapDbRegionToGeoRegion(geoRegionName);
    
    if (!mappedRegionName) {
      console.log(`Could not map region name: ${geoRegionName}`);
      return;
    }
  
    const density = calculateDensity(mappedRegionName, year);
    const value = regionData[mappedRegionName]?.[year]?.[metric] || 0;
  
    layer.setStyle({
      fillColor: metric === 'cases' ? getColorForCases(density) : getColorForDeaths(density),
      color: '#4a83ec',
      weight: 1,
      fillOpacity: 0.7,
    });
  
    layer.bindPopup(`
      <b>${mappedRegionName}</b><br>
      Total ${metric}: ${value.toLocaleString()}<br>
      ${metric} per 10,000 people: ${density.toFixed(2)}
    `);
  
    layer.on('click', () => {
      alert(`Region: ${mappedRegionName}\nDensity: ${density.toFixed(2)} per 10,000 people`);
    });
  };
  
  
  const Legend = () => {
    const map = useMap();
  
    useEffect(() => {
      const legend = L.control({ position: 'bottomright' });
  
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = metric === 'cases'
          ? [0, 0.1, 0.2, 0.5, 1, 2, 5, 7]
          : [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.09];
        const colors = metric === 'cases'
          ? ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']
          : ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
  
        div.innerHTML = `<h4>${metric.charAt(0).toUpperCase() + metric.slice(1)} Density<br><small>(per 10,000 people)</small></h4>`;
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML += `
            <div>
              <i style="background:${colors[i]}"></i> 
              ${grades[i]}${grades[i + 1] ? `&ndash;${grades[i + 1]}` : '+'}
            </div>`;
        }
        return div;
      };
  
      legend.addTo(map);
      return () => map.removeControl(legend);
    }, [map, metric]);
  
    return null;
  };

  return (
    <div className="dengue-map-container" style={{ height: '300px', marginTop: '20px', minWidth: '700px' }}>
      <div className="data-cards" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '140px' }}>
        <div className="data-card" style={{ fontSize: '12px' }}>
          <h3>Total Cases</h3>
          <p>{totalCases}</p>
        </div>
        <div className="data-card">
          <h3>Total Deaths</h3>
          <p>{totalDeaths}</p>
        </div>
      </div>

      <div className="chart-header">
        <label htmlFor="metric-select">Select Metric: </label>
        <select 
          id="metric-select" 
          value={metric} 
          onChange={(e) => setMetric(e.target.value)}
          style={{ marginBottom: '5px', marginTop: '5px' }}
        >
          <option value="cases">Cases</option>
          <option value="deaths">Deaths</option>
        </select>

        <label htmlFor="year-select" style={{ marginLeft: '20px' }}>
          Select Year: 
        </label>
        <select 
          id="year-select" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          style={{ marginBottom: '5px', marginLeft: '10px', marginTop: '5px' }}
        >
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption === 'all' ? 'All Years' : yearOption}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        key={mapKey}
        center={[12.8797, 121.7740]}
        zoom={6}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          data={phGeoData}
          onEachFeature={onEachRegion}
          key={`${year}-${metric}`}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

export default DengueMap;