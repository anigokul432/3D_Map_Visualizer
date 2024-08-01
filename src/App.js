// src/App.js

import React, { useState } from 'react';
import './App.css';
import PointCloudViewer from './PointCloudViewer';
import AnnotationTool from './AnnotationTool';
import POITool from './POITool';
import PathCreationTool from './PathCreationTool';

function App() {
  const [view, setView] = useState('Free');
  const [isAnnotationActive, setIsAnnotationActive] = useState(false);
  const [isPOIActive, setIsPOIActive] = useState(false);
  const [isPathCreationActive, setIsPathCreationActive] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [pois, setPOIs] = useState([]);

  const handleViewChange = (event) => {
    setView(event.target.value);
    if (event.target.value !== 'Free') {
      setIsAnnotationActive(false); // Deactivate annotation mode if not in Free view
      setIsPOIActive(false); // Deactivate POI mode if not in Free view
      setIsPathCreationActive(false); // Deactivate path creation mode if not in Free view
    }
  };

  const handleToggleAnnotation = (isActive) => {
    setIsAnnotationActive(isActive);
  };

  const handleTogglePOI = (isActive) => {
    setIsPOIActive(isActive);
  };

  const handleTogglePathCreation = (isActive) => {
    setIsPathCreationActive(isActive);
  };

  const handleGenerateReport = () => {
    const reportContent = annotations
      .map(
        (annotation) =>
          `Location: (${annotation.point.x.toFixed(2)}, ${annotation.point.y.toFixed(2)}, ${annotation.point.z.toFixed(2)})\nComment: ${annotation.text}\n`
      )
      .join('\n');

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'annotations_report.txt';
    link.click();
  };

  const canActivateTools = view === 'Free';

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
            <AnnotationTool
              onToggleAnnotation={handleToggleAnnotation}
              canActivate={canActivateTools}
              isAnnotationActive={isAnnotationActive}
            />
            <POITool
              onTogglePOI={handleTogglePOI}
              canActivate={canActivateTools}
              isPOIActive={isPOIActive}
            />
            <PathCreationTool
              onTogglePathCreation={handleTogglePathCreation}
              canActivate={canActivateTools}
              isPathCreationActive={isPathCreationActive}
            />
            <button className="generate-report-button" onClick={handleGenerateReport}>
              Generate Report
            </button>
          </div>
          <PointCloudViewer
            view={view}
            isAnnotationActive={isAnnotationActive}
            isPOIActive={isPOIActive}
            isPathCreationActive={isPathCreationActive}
            setIsAnnotationActive={setIsAnnotationActive}
            setIsPOIActive={setIsPOIActive}
            setIsPathCreationActive={setIsPathCreationActive}
            annotations={annotations}
            setAnnotations={setAnnotations}
            pois={pois}
            setPOIs={setPOIs}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
