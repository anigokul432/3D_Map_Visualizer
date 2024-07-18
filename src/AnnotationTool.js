// src/AnnotationTool.js

import React, { useState } from 'react';
import './AnnotationTool.css';

const AnnotationTool = ({ onToggleAnnotation, canActivate }) => {
  const [isAnnotationActive, setIsAnnotationActive] = useState(false);

  const handleToggleAnnotation = () => {
    if (!canActivate) return;
    const newAnnotationState = !isAnnotationActive;
    setIsAnnotationActive(newAnnotationState);
    onToggleAnnotation(newAnnotationState);
  };

  return (
    <button
      className={`annotate-button ${isAnnotationActive ? 'active' : ''} ${!canActivate ? 'disabled' : ''}`}
      onClick={handleToggleAnnotation}
      disabled={!canActivate}
    >
      Annotate
    </button>
  );
};

export default AnnotationTool;
