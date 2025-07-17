import axios from "axios";

/** 🔧 Création d'une instance Axios avec baseURL depuis .env ou localhost */
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction
  ? 'https://ema-v3-backend.onrender.com/api'  // ✅ URL mise à jour
  : 'http://localhost:5000/api';

console.log('=== API Configuration ===');
console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/** 🔐 Ajout automatique du token dans les en-têtes Authorization */
api.interceptors.request.use(
  (config) => {
    console.log('=== API Request ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token found and added to headers');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('=== API Request Error ===');
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('=== API Response Success ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    return response;
  },
  (error) => {
    console.error('=== API Error ===');
    console.error('Error:', error);
    
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.error('=== API Response Error ===');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      // Ajout des logs spécifiques pour les erreurs courantes
      if (error.response.status === 401) {
        console.error('Authentication error - Token may be expired or invalid');
      } else if (error.response.status === 403) {
        console.error('Permission denied - User may not have required role');
      } else if (error.response.status === 404) {
        console.error('Resource not found - Check API endpoint');
      } else if (error.response.status === 500) {
        console.error('Server error - Check backend logs');
      }
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('=== API Request Failed ===');
      console.error('Request:', error.request);
      console.error('Timeout:', error.code === 'ECONNABORTED');
      console.error('Network error:', error.code === 'ERR_NETWORK');
    } else {
      // Erreur dans la configuration de la requête
      console.error('=== API Configuration Error ===');
      console.error('Error:', error.message);
    }
    
    // Ajout d'un stack trace pour le débogage
    console.error('Stack:', error.stack);
    
    return Promise.reject(error);
  }
);

/* ─────────────── RESIDENCES ─────────────── */

export const fetchResidences = async () => {
  const { data } = await api.get("/residences");
  return data;
};

export const getResidenceById = async (id) => {
  const { data } = await api.get(`/residences/${id}`);
  return data;
};

export const createResidence = async (formData) => {
  const { data } = await api.post("/residences", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // 👈 nécessaire pour envoyer des fichiers
    },
  });
  return data;
};

export const updateResidence = async (id, formData) => {
  const { data } = await api.put(`/residences/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // 👈 idem ici
    },
  });
  return data;
};

export const deleteResidence = async (id) => {
  const { data } = await api.delete(`/residences/${id}`);
  return data;
};

/* ─────────────── ANNONCES ─────────────── */

export const fetchAnnonces = async () => {
  const { data } = await api.get("/annonces");
  return data;
};

export const createAnnonce = async (formData) => {
  const { data } = await api.post("/annonces", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateAnnonce = async (id, formData) => {
  const { data } = await api.put(`/annonces/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteAnnonce = async (id) => {
  const { data } = await api.delete(`/annonces/${id}`);
  return data;
};

/* ─────────────── UTILISATEURS ─────────────── */

export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const register = async (newUser) => {
  const { data } = await api.post("/auth/register", newUser);
  return data;
};

export const getUserProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

/* ─────────────── RÉSERVATIONS ─────────────── */

export const createReservation = async (payload) => {
  const { data } = await api.post("/reservations", payload);
  return data;
};

export const fetchReservations = async () => {
  const { data } = await api.get("/reservations");
  return data;
};

export const deleteReservation = async (id) => {
  const { data } = await api.delete(`/reservations/${id}`);
  return data;
};

/** 📦 Export de l'instance Axios si besoin d'appels custom */
export default api;