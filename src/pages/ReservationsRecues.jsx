// src/pages/ReservationsRecues.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReservationsRecues = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer token JWT depuis localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/reservations/received', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(res.data);
      } catch (err) {
        console.error('Erreur chargement réservations reçues:', err);
        setError('Erreur lors du chargement des réservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-6">{error}</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-600">
        <p>Aucune réservation reçue pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Réservations reçues</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2 text-left">Résidence</th>
            <th className="border px-4 py-2 text-left">Client (email)</th>
            <th className="border px-4 py-2 text-left">Début</th>
            <th className="border px-4 py-2 text-left">Fin</th>
            <th className="border px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r._id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{r.residenceId?.title || '–'}</td>
              <td className="border px-4 py-2">{r.userId?.email || '–'}</td>
              <td className="border px-4 py-2">{new Date(r.startDate).toLocaleDateString('fr-FR')}</td>
              <td className="border px-4 py-2">{new Date(r.endDate).toLocaleDateString('fr-FR')}</td>
              <td className="border px-4 py-2 capitalize">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationsRecues;
