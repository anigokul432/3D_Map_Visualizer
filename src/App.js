// src/App.js

import React from 'react';
import './App.css';
import PointCloudViewer from './PointCloudViewer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>3D Point Cloud Viewer</h1>
        <div className="canvas-container">
          <PointCloudViewer />
        </div>
      </header>
    </div>
  );
}

export default App;
