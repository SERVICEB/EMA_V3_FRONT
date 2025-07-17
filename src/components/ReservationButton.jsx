// src/components/ReservationButton.jsx (par exemple)

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReservationButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/reserve?city=Abidjan&start=2025-06-01&end=2025-06-05`);
  };

  return (
    <button onClick={handleClick}>
      Faire une réservation
    </button>
  );
};

export default ReservationButton;
