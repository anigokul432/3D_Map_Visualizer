// src/App.js

import React, { useState } from 'react';
import './App.css';
import PointCloudViewer from './PointCloudViewer';
import AnnotationTool from './AnnotationTool';

function App() {
  const [view, setView] = useState('Free');
  const [isAnnotationActive, setIsAnnotationActive] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [visibleChunk, setVisibleChunk] = useState(0); // State for visible chunk

  const handleViewChange = (event) => {
    setView(event.target.value);
    if (event.target.value !== 'Free') {
      setIsAnnotationActive(false); // Deactivate annotation mode if not in Free view
    }
  };

  const handleToggleAnnotation = (isActive) => {
    setIsAnnotationActive(isActive);
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

  const canActivateAnnotation = view === 'Free';

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
              canActivate={canActivateAnnotation}
              isAnnotationActive={isAnnotationActive}
            />
            <button className="generate-report-button" onClick={handleGenerateReport}>
              Generate Report
            </button>
          </div>
          <PointCloudViewer
            view={view}
            isAnnotationActive={isAnnotationActive}
            setIsAnnotationActive={setIsAnnotationActive}
            annotations={annotations}
            setAnnotations={setAnnotations}
            visibleChunk={visibleChunk} // Pass the visibleChunk state
          />
        </div>
      </header>
    </div>
  );
}

export default App;
