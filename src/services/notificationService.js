import Notification from '../models/Notification.js';
import { sendReservationEmail } from './emailService.js';

export const createReservationNotification = async (reservation, residence, client) => {
  try {
    // Créer la notification en base
    const notification = new Notification({
      recipient: residence.owner,
      type: 'reservation',
      title: `Nouvelle réservation pour "${residence.title}"`,
      message: `${client.name} a réservé votre propriété du ${new Date(reservation.startDate).toLocaleDateString('fr-FR')} au ${new Date(reservation.endDate).toLocaleDateString('fr-FR')}`,
      data: {
        reservationId: reservation._id,
        residenceId: residence._id,
        clientId: client._id
      }
    });

    await notification.save();
    console.log('✅ Notification créée en base');

    // Récupérer les infos du propriétaire
    const owner = await User.findById(residence.owner);
    
    if (owner && owner.email) {
      // Envoyer l'email
      const emailSent = await sendReservationEmail(owner, reservation, residence, client);
      
      // Mettre à jour le statut email
      notification.isEmailSent = emailSent;
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error('❌ Erreur création notification:', error);
    throw error;
  }
};