
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
    
    // Store notification in Firebase Realtime Database
    // ESP32 will listen to this path for new notifications
    await set(ref(database, `esp32_notifications/${notificationId}`), {
      ...data,
      timestamp: serverTimestamp(),
      delivered: false, // ESP32 can mark this as true after displaying
    });
    
    console.log('Notification sent to ESP32:', data.message);
    return true;
  } catch (error) {
    console.error('Error sending notification to ESP32:', error);
    return false;
  }
};

// Store login activity
export const storeLoginActivity = async (userId: string, userName: string, action: string) => {
  try {
    const activityId = `activity_${Date.now()}`;
    await set(ref(database, `user_activities/${userId}/${activityId}`), {
      userName,
      action,
      timestamp: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error storing login activity:', error);
    return false;
  }
};
