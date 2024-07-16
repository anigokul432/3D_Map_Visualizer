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
        <div className="canvas-container">
          <div className="tools-container">
            <label htmlFor="view-select">View: </label>
            <select id="view-select" value={view} onChange={handleViewChange}>
              <option value="Free">Free</option>
              <option value="XY">Front</option>
              <option value="XZ">Top-Down</option>
              <option value="YZ">Side</option>
            </select>
          </div>
          <PointCloudViewer view={view} />
        </div>
      </header>
    </div>
  );
}

export default App;
