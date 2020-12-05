import React from 'react';
import '../styles/Spinner.css';

const Spinner = ({ spinnerType }) => {
  return (
      <div className={`loader ${spinnerType}`} > Loading...</div > 
  )// loader
};

export default Spinner;