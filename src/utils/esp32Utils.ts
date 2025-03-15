import { ref, set, serverTimestamp, onValue, query, orderByChild, limitToLast, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

interface NotificationData {
  userId: string;
  userName: string;
  action: string;
  timestamp: any;
  message: string;
}

// Send notification to ESP32 through Firebase
export const sendESP32Notification = async (data: Omit<NotificationData, 'timestamp'>) => {
  try {
    // Create a unique notification ID based on timestamp
    const notificationId = `notification_${Date.now()}`;
    
    // Create a simplified message with just username and current time
    const currentTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const simplifiedMessage = `${data.userName} - ${currentTime}`;
    
    // Store notification in Firebase Realtime Database
    // ESP32 will listen to this path for new notifications
    await set(ref(database, `esp32_notifications/${notificationId}`), {
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      timestamp: serverTimestamp(),
      message: simplifiedMessage,
      delivered: false, // ESP32 can mark this as true after displaying
    });
    
    console.log('Notification sent to ESP32:', simplifiedMessage);
    
    // Clean up old notifications (keep only last 10)
    cleanupOldNotifications();
    
    return true;
  } catch (error) {
    console.error('Error sending notification to ESP32:', error);
    return false;
  }
};

// Store login activity in real-time
export const storeLoginActivity = async (userId: string, userName: string, action: string) => {
  try {
    const activityId = `activity_${Date.now()}`;
    
    // Get current date and time in Vietnamese format
    const currentDateTime = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Store in user's activities history
    await set(ref(database, `user_activities/${userId}/${activityId}`), {
      userName,
      action,
      timestamp: serverTimestamp(),
      formattedTime: currentDateTime,
      deviceInfo: navigator.userAgent
    });
    
    // Also store in a "recent_activities" node that will be limited to last 10 entries
    const recentActivityRef = ref(database, `recent_activities/${userId}/${activityId}`);
    await set(recentActivityRef, {
      userName,
      action,
      timestamp: serverTimestamp(),
      formattedTime: currentDateTime,
      deviceInfo: navigator.userAgent
    });
    
    // Clean up old activities (only keep last 20 per user)
    cleanupOldActivities(userId);
    
    return true;
  } catch (error) {
    console.error('Error storing login activity:', error);
    return false;
  }
};

// Get recent activities for a user
export const getRecentActivities = (userId: string, limit = 10, callback: (activities: any[]) => void) => {
  const recentActivitiesRef = query(
    ref(database, `recent_activities/${userId}`),
    orderByChild('timestamp'),
    limitToLast(limit)
  );
  
  return onValue(recentActivitiesRef, (snapshot) => {
    const activities: any[] = [];
    snapshot.forEach((childSnapshot) => {
      activities.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Sort by timestamp in descending order (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);
    callback(activities);
  });
};

// Clean up old notifications to prevent database growth
const cleanupOldNotifications = async () => {
  try {
    const notificationsRef = query(
      ref(database, 'esp32_notifications'),
      orderByChild('timestamp'),
      limitToLast(20) // Keep only the last 20 notifications
    );
    
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications: any[] = [];
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by timestamp (oldest first)
        notifications.sort((a, b) => a.timestamp - b.timestamp);
        
        // If we have more than 10, remove the oldest ones
        if (notifications.length > 10) {
          const toRemove = notifications.slice(0, notifications.length - 10);
          toRemove.forEach(async (notification) => {
            await remove(ref(database, `esp32_notifications/${notification.id}`));
          });
        }
      }
    }, { onlyOnce: true });
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
  }
};

// Clean up old activities to prevent database growth
const cleanupOldActivities = async (userId: string) => {
  try {
    const activitiesRef = query(
      ref(database, `recent_activities/${userId}`),
      orderByChild('timestamp'),
      limitToLast(30) // Fetch last 30
    );
    
    onValue(activitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activities: any[] = [];
        snapshot.forEach((childSnapshot) => {
          activities.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by timestamp (oldest first)
        activities.sort((a, b) => a.timestamp - b.timestamp);
        
        // If we have more than 20, remove the oldest ones
        if (activities.length > 20) {
          const toRemove = activities.slice(0, activities.length - 20);
          toRemove.forEach(async (activity) => {
            await remove(ref(database, `recent_activities/${userId}/${activity.id}`));
          });
        }
      }
    }, { onlyOnce: true });
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
  }
};

// Grant access to a room (for future use)
export const grantRoomAccess = async (userId: string, userName: string, roomId: string, roomName: string) => {
  try {
    const accessId = `access_${Date.now()}`;
    await set(ref(database, `room_access/${roomId}/${userId}`), {
      userId,
      userName,
      grantedAt: serverTimestamp(),
      accessLevel: 'full', // or 'limited', 'view-only', etc.
      status: 'active'
    });
    
    // Log the activity
    await storeLoginActivity(userId, userName, `Được cấp quyền truy cập vào ${roomName}`);
    
    // Notify ESP32
    await sendESP32Notification({
      userId,
      userName,
      action: 'grant_access',
      message: `${userName} được cấp quyền truy cập vào ${roomName}`
    });
    
    return true;
  } catch (error) {
    console.error('Error granting room access:', error);
    return false;
  }
};

// Revoke access to a room (for future use)
export const revokeRoomAccess = async (userId: string, userName: string, roomId: string, roomName: string) => {
  try {
    await remove(ref(database, `room_access/${roomId}/${userId}`));
    
    // Log the activity
    await storeLoginActivity(userId, userName, `Bị thu hồi quyền truy cập vào ${roomName}`);
    
    // Notify ESP32
    await sendESP32Notification({
      userId,
      userName,
      action: 'revoke_access',
      message: `${userName} bị thu hồi quyền truy cập vào ${roomName}`
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking room access:', error);
    return false;
  }
};
