import React, { useState } from 'react';
import ResidenceCard from './ResidenceCard';
import ResidenceForm from './ResidenceForm';
import './ResidenceList.css';
import { deleteResidence, createResidence, updateResidence } from '../api/api';

export default function ResidenceList({ residences, user }) {
  const [showForm, setShowForm] = useState(false);
  const [editingResidence, setEditingResidence] = useState(null);
  const [localResidences, setLocalResidences] = useState(residences);

  const handleAddNew = () => {
    setEditingResidence(null);
    setShowForm(true);
  };

  const handleEdit = (residence) => {
    setEditingResidence(residence);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingResidence(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette résidence ?')) {
      try {
        await deleteResidence(id);
        setLocalResidences(prev => prev.filter(r => r._id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      console.log('🔍 Données envoyées :', formData);

      if (editingResidence) {
        const { data: updated } = await updateResidence(editingResidence._id, formData);
        setLocalResidences(prev =>
          prev.map(r => (r._id === updated._id ? updated : r))
        );
      } else {
        const { data: created } = await createResidence(formData);
        setLocalResidences(prev => [created, ...prev]);
      }

      handleCloseForm();
    } catch (error) {
      console.error('❌ Erreur enregistrement:', error.response?.data || error.message);
      alert("Erreur lors de l'enregistrement. Détails dans la console.");
    }
  };

  return (
    <section className="residence-section">
      <div className="residence-header">
        <h2>Résidences meublées à Abidjan ({localResidences.length})</h2>
        {user?.role === 'owner' && (
          <button className="btn btn-primary add-btn" onClick={handleAddNew}>
            + Ajouter une résidence
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <ResidenceForm
              residence={editingResidence}
              onSave={handleSave}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      <div className="residence-grid">
        {localResidences.length === 0 ? (
          <div className="no-residences">
            <p>Aucune résidence disponible.</p>
            {user?.role === 'owner' && (
              <button className="btn btn-primary" onClick={handleAddNew}>
                Ajouter la première résidence
              </button>
            )}
          </div>
        ) : (
          localResidences.map((residence) => (
            <ResidenceCard 
              key={residence._id} 
              residence={residence}
              onEdit={() => handleEdit(residence)}
              onDelete={() => handleDelete(residence._id)}
              user={user}
            />
          ))
        )}
      </div>
    </section>
  );
}
