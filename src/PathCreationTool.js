// src/PathCreationTool.js

import React, { useState } from 'react';
import './PathCreationTool.css';

const PathCreationTool = ({ onTogglePathCreation, canActivate, isPathCreationActive }) => {
  const [isActive, setIsActive] = useState(isPathCreationActive);

  const handleTogglePathCreation = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    onTogglePathCreation(newIsActive);
  };

  return (
    <button
      className={`path-creation-button ${isActive ? 'active' : ''} ${!canActivate ? 'disabled' : ''}`}
      onClick={handleTogglePathCreation}
      disabled={!canActivate}
    >
      Add Path
    </button>
  );
};

export default PathCreationTool;
