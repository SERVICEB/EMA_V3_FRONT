import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransporter({
  service: 'gmail', // ou votre service email
  auth: {
    user: process.env.EMAIL_USER, // votre email
    pass: process.env.EMAIL_PASS  // mot de passe d'application
  }
});

export const sendReservationEmail = async (owner, reservation, residence, client) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: owner.email,
      subject: `🏠 Nouvelle réservation pour "${residence.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🎉 Nouvelle Réservation !</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Bonjour ${owner.name},</h2>
            
            <p style="font-size: 16px;">Vous avez reçu une nouvelle réservation pour votre propriété :</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">🏡 ${residence.title}</h3>
              <p><strong>📍 Localisation :</strong> ${residence.location}</p>
              <p><strong>👤 Client :</strong> ${client.name}</p>
              <p><strong>📧 Email client :</strong> ${client.email}</p>
              <p><strong>📞 Téléphone :</strong> ${client.phone || 'Non renseigné'}</p>
              
              <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
              
              <p><strong>📅 Date d'arrivée :</strong> ${new Date(reservation.startDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>📅 Date de départ :</strong> ${new Date(reservation.endDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>🏠 Nombre de nuits :</strong> ${Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24))}</p>
              <p><strong>💰 Prix total :</strong> ${reservation.totalPrice?.toLocaleString()} FCFA</p>
              <p><strong>📊 Statut :</strong> <span style="background: #ffeaa7; padding: 4px 8px; border-radius: 4px;">${reservation.status}</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/owner/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                🎛️ Gérer la réservation
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              💡 Connectez-vous à votre tableau de bord pour accepter ou refuser cette réservation.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Votre Plateforme de Réservation. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email de notification envoyé à:', owner.email);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};