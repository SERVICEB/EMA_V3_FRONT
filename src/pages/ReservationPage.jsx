// pages/ReservationPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';

const ReservationPage = () => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisponibles = async () => {
      try {
        const res = await axios.get('/api/residences/disponibles');
        setResidences(res.data);
      } catch (err) {
        console.error('Erreur chargement résidences disponibles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Résidences Disponibles
          </h1>
          <p className="text-gray-600">
            Découvrez nos hébergements de qualité à Abidjan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {residences.map((residence) => (
            <div
              key={residence._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image de la résidence */}
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                {residence.images && residence.images.length > 0 ? (
                  <img
                    src={residence.images[0]}
                    alt={residence.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-6xl opacity-50">🏨</div>
                  </div>
                )}
                
                {/* Badge du type de logement */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {residence.type && (
                    <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {residence.type}
                    </span>
                  )}
                  {residence.categorie && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {residence.categorie}
                    </span>
                  )}
                </div>

                {/* Indicateur de disponibilité */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                {/* En-tête avec nom et code */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      Hôtel - {residence.code || residence._id.slice(-6).toUpperCase()}
                    </h3>
                  </div>

                  {/* Localisation */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {residence.quartier || residence.adresse || 'Abidjan'}
                    </span>
                  </div>

                  {/* Description courte */}
                  {residence.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {residence.description}
                    </p>
                  )}
                </div>

                {/* Informations sur les pièces */}
                {residence.nombrePieces && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {residence.nombrePieces} pièce{residence.nombrePieces > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Type d'hébergement */}
                <div className="mb-4">
                  <span className="text-sm text-gray-500">
                    {residence.typeHebergement || 'Hébergement'}
                  </span>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-sm text-gray-600 mr-1">À partir de</span>
                    <span className="text-2xl font-bold text-red-600">
                      {residence.prixParNuit?.toLocaleString() || '0'} FCFA
                    </span>
                    <span className="text-sm text-gray-600 ml-1">la nuit</span>
                  </div>
                </div>

                {/* Bouton de réservation */}
                <button
                  onClick={() => navigate(`/residence/${residence._id}`)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Réserver maintenant
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucune résidence */}
        {residences.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune résidence disponible
            </h3>
            <p className="text-gray-600">
              Veuillez réessayer plus tard ou modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;