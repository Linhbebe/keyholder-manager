
import { ref, set, serverTimestamp } from 'firebase/database';
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
    
    await set(ref(database, `user_activities/${userId}/${activityId}`), {
      userName,
      action,
      timestamp: serverTimestamp(),
      formattedTime: currentDateTime,
      deviceInfo: navigator.userAgent
    });
    
    // Also store in a "recent_activities" node that will be limited to last 10 entries
    // This is for quick access to most recent logins
    const recentActivityRef = ref(database, `recent_activities/${userId}/${activityId}`);
    await set(recentActivityRef, {
      userName,
      action,
      timestamp: serverTimestamp(),
      formattedTime: currentDateTime,
      deviceInfo: navigator.userAgent
    });
    
    return true;
  } catch (error) {
    console.error('Error storing login activity:', error);
    return false;
  }
};

