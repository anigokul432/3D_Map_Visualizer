import React from 'react';

const ViewDropdown = ({ onChange }) => {
  return (
    <div style={{ position: 'absolute', top: 20, right: 20 }}>
      <label htmlFor="view-select">View: </label>
      <select id="view-select" onChange={onChange} defaultValue="Free">
        <option value="Free">Free</option>
        <option value="XY">XY</option>
        <option value="XZ">XZ</option>
        <option value="YZ">YZ</option>
      </select>
    </div>
  );
};

export default ViewDropdown;
