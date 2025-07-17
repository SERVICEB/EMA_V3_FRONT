import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const getStatusColor = (type) => {
    switch (type) {
      case 'reservation': return '#2ecc71';
      case 'cancellation': return '#e74c3c';
      case 'payment': return '#f39c12';
      case 'review': return '#9b59b6';
      default: return '#3498db';
    }
  };

  if (loading) {
    return <div className="loading">Chargement des notifications...</div>;
  }

  return (
    <div className="notifications-section">
      <div className="section-header">
        <h2>🔔 Notifications</h2>
        <div className="notification-filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Non lues ({notifications.filter(n => !n.isRead).length})
          </button>
          <button 
            className={filter === 'read' ? 'active' : ''}
            onClick={() => setFilter('read')}
          >
            Lues ({notifications.filter(n => n.isRead).length})
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications-dashboard">
            <span className="no-notif-icon">📭</span>
            <h3>Aucune notification</h3>
            <p>Vous n'avez pas de notifications pour le moment.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="notification-left">
                <div 
                  className="notification-type-indicator"
                  style={{ backgroundColor: getStatusColor(notification.type) }}
                ></div>
                <div className="notification-details">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  
                  {notification.data.residenceId && (
                    <div className="notification-residence">
                      <span className="residence-icon">🏠</span>
                      <span>{notification.data.residenceId.title}</span>
                      <span className="residence-location">
                        📍 {notification.data.residenceId.location}
                      </span>
                    </div>
                  )}

                  {notification.data.clientId && (
                    <div className="notification-client">
                      <span className="client-icon">👤</span>
                      <span>Client: {notification.data.clientId.name}</span>
                      <span className="client-email">
                        📧 {notification.data.clientId.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="notification-right">
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {!notification.isRead && (
                  <div className="unread-indicator">
                    <div className="unread-dot"></div>
                    <span>Nouveau</span>
                  </div>
                )}
                {notification.isEmailSent && (
                  <div className="email-sent-indicator" title="Email envoyé">
                    📧
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { NotificationBell, NotificationsSection };