import React from 'react';
import './Toolbar.css';

const Toolbar = () => {
  return (
    <div className="toolbar">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="toolbar-button"></div>
      ))}
    </div>
  );
};

export default Toolbar;
