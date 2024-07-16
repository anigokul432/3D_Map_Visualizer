// src/App.js

import React, { useState } from 'react';
import './App.css';
import PointCloudViewer from './PointCloudViewer';

function App() {
  const [view, setView] = useState('Free');

  const handleViewChange = (event) => {
    setView(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>3D Point Cloud Viewer</h1>
        <div className="dropdown-container">
          <label htmlFor="view-select">View: </label>
          <select id="view-select" value={view} onChange={handleViewChange}>
            <option value="Free">Free</option>
            <option value="XY">XY</option>
            <option value="XZ">XZ</option>
            <option value="YZ">YZ</option>
          </select>
        </div>
        <div className="canvas-container">
          <PointCloudViewer view={view} />
        </div>
      </header>
    </div>
  );
}

export default App;
