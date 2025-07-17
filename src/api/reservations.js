import axios from 'axios';

export const createReservation = async (data) => {
  return await axios.post('/api/reservations', data);
};
