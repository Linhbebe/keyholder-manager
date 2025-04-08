
# ESP32 Integration Guide

This guide explains how to connect your ESP32 with LCD display to this SmartKey Manager app.

## Requirements

1. ESP32 board
2. LCD display (I2C or SPI interface)
3. A relay module for controlling the door lock
4. Keypad module for password input
5. Arduino IDE
6. Required libraries:
   - FirebaseESP32 (by Mobizt)
   - WiFi (built-in)
   - LiquidCrystal_I2C (for I2C LCD) or Adafruit GFX + compatible driver for your LCD
   - Keypad library (for numeric keypad)

## ESP32 Arduino Code for Smart Door Lock System

```cpp
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase project settings - UPDATE THESE WITH YOUR VALUES
#define DATABASE_URL "https://app1-e1cea-default-rtdb.firebaseio.com/"
#define DATABASE_SECRET "D1U4X8Fo6UwhYPkU7IbHxWNCmvQOj7yX9uKczRs0"

// Hardware configuration
#define RELAY_PIN 26         // Pin connected to relay for door lock
#define LOCK_DELAY 5000      // How long to keep door unlocked (ms)

// LCD Configuration
#define LCD_ADDR 0x27  // I2C address of LCD (typically 0x27 or 0x3F)
#define LCD_COLS 16    // Number of LCD columns
#define LCD_ROWS 2     // Number of LCD rows

// Keypad configuration (4x4 matrix keypad)
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {19, 18, 5, 17}; // Connect to the row pinouts of the keypad
byte colPins[COLS] = {16, 4, 2, 15};  // Connect to the column pinouts of the keypad

// Initialize Keypad
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Define door information
String doorId = "door1";
String doorName = "Main Door";

// Initialize LCD
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

// Variables
String inputPassword = "";
bool doorUnlocked = false;
unsigned long doorUnlockTime = 0;
unsigned long lastActivity = 0;
const long activityTimeout = 30000;  // Reset password input after 30 seconds of inactivity

// Function to handle door unlocking
void unlockDoor() {
  digitalWrite(RELAY_PIN, HIGH);
  doorUnlocked = true;
  doorUnlockTime = millis();
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Door Unlocked!");
  lcd.setCursor(0, 1);
  lcd.print("Please enter");
}

// Function to handle door locking
void lockDoor() {
  digitalWrite(RELAY_PIN, LOW);
  doorUnlocked = false;
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Door Locked");
  lcd.setCursor(0, 1);
  lcd.print("Enter Password:");
}

// Function to authenticate password via Firebase
void authenticatePassword(String password) {
  String path = "/password_auth";
  
  FirebaseJson json;
  json.set("doorId", doorId);
  json.set("doorName", doorName);
  json.set("password", password);
  json.set("timestamp", ServerValue.TIMESTAMP);
  
  if (Firebase.setJSON(fbdo, path, json)) {
    // Request received by server
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Verifying...");
    
    // Wait for response (in a real app, you might want to use a callback)
    delay(1000);
    
    if (Firebase.getJSON(fbdo, path + "/result")) {
      FirebaseJson &resultJson = fbdo.jsonObject();
      FirebaseJsonData success;
      FirebaseJsonData message;
      
      resultJson.get(success, "success");
      resultJson.get(message, "message");
      
      if (success.boolValue) {
        // Password is valid
        unlockDoor();
        
        // Record the door access event with timestamp
        FirebaseJson eventJson;
        eventJson.set("doorId", doorId);
        eventJson.set("doorName", doorName);
        eventJson.set("action", "unlock");
        eventJson.set("method", "password");
        eventJson.set("passwordUsed", password);
        eventJson.set("success", true);
        eventJson.set("timestamp", ServerValue.TIMESTAMP);
        
        String eventPath = "/door_access_events/" + doorId + "/event_" + String(millis());
        Firebase.setJSON(fbdo, eventPath, eventJson);
      } else {
        // Invalid password
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Invalid Password");
        lcd.setCursor(0, 1);
        lcd.print("Try Again");
        
        // Record failed attempt
        FirebaseJson eventJson;
        eventJson.set("doorId", doorId);
        eventJson.set("doorName", doorName);
        eventJson.set("action", "unlock_failed");
        eventJson.set("method", "password");
        eventJson.set("passwordUsed", password);
        eventJson.set("success", false);
        eventJson.set("timestamp", ServerValue.TIMESTAMP);
        
        String eventPath = "/door_access_events/" + doorId + "/event_" + String(millis());
        Firebase.setJSON(fbdo, eventPath, eventJson);
        
        delay(2000);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Enter Password:");
      }
    } else {
      // Error in getting authentication result
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("System Error");
      lcd.setCursor(0, 1);
      lcd.print("Try Again Later");
      delay(2000);
    }
  } else {
    // Error connecting to Firebase
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Network Error");
    lcd.setCursor(0, 1);
    lcd.print(fbdo.errorReason());
    delay(2000);
  }
  
  inputPassword = "";  // Reset password input
}

void setup() {
  Serial.begin(115200);
  
  // Initialize relay
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Ensure door is locked on startup
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi connected");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(2000);

  // Configure Firebase
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SmartKey System");
  lcd.setCursor(0, 1);
  lcd.print("Enter Password:");
  
  // Listen for notifications
  setupNotificationListener();
}

void setupNotificationListener() {
  // Set up real-time listener for ESP32 notifications
  if (Firebase.beginStream(fbdo, "esp32_notifications")) {
    Serial.println("Connected to Firebase stream");
    // The stream connection established, you can use stream event callback below
  } else {
    Serial.println("Could not connect to Firebase stream");
    Serial.println(fbdo.errorReason());
  }
}

void loop() {
  // Check if door should be locked again after delay
  if (doorUnlocked && (millis() - doorUnlockTime > LOCK_DELAY)) {
    lockDoor();
    
    // Record the door lock event
    FirebaseJson eventJson;
    eventJson.set("doorId", doorId);
    eventJson.set("doorName", doorName);
    eventJson.set("action", "lock");
    eventJson.set("method", "automatic");
    eventJson.set("success", true);
    eventJson.set("timestamp", ServerValue.TIMESTAMP);
    
    String eventPath = "/door_access_events/" + doorId + "/event_" + String(millis());
    Firebase.setJSON(fbdo, eventPath, eventJson);
  }
  
  // Handle keypad input
  char key = keypad.getKey();
  
  if (key) {
    lastActivity = millis();
    
    // Handle different key presses
    if (key == '#') {
      // Submit password
      if (inputPassword.length() > 0) {
        authenticatePassword(inputPassword);
      }
    } else if (key == '*') {
      // Clear input
      inputPassword = "";
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Input Cleared");
      delay(1000);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Enter Password:");
    } else if (key >= '0' && key <= '9') {
      // Add digit to password
      inputPassword += key;
      
      // Display asterisk for each digit
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Password:");
      lcd.setCursor(0, 1);
      for (int i = 0; i < inputPassword.length(); i++) {
        lcd.print("*");
      }
    }
  }
  
  // Check for timeout on password entry
  if (!doorUnlocked && inputPassword.length() > 0 && (millis() - lastActivity > activityTimeout)) {
    inputPassword = "";
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Timeout");
    delay(1000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Enter Password:");
  }
  
  // Check for notifications from the server
  if (Firebase.readStream(fbdo)) {
    if (fbdo.streamAvailable()) {
      if (fbdo.dataType() == "json") {
        FirebaseJson &json = fbdo.jsonObject();
        size_t len = json.iteratorBegin();
        
        for (size_t i = 0; i < len; i++) {
          FirebaseJson::IteratorValue value = json.valueAt(i);
          
          // Check if this is a new notification
          if (value.type == FirebaseJson::JSON_OBJECT) {
            String path = value.key;
            
            // Extract the notification ID from the path
            String notificationId = path;
            
            // Get notification details
            FirebaseJson notificationJson;
            String notificationPath = "esp32_notifications/" + notificationId;
            
            if (Firebase.getJSON(fbdo, notificationPath)) {
              notificationJson = fbdo.jsonObject();
              
              // Check if this notification has been delivered
              FirebaseJsonData delivered;
              notificationJson.get(delivered, "delivered");
              
              if (delivered.boolValue == false) {
                // Get notification message
                FirebaseJsonData message;
                notificationJson.get(message, "message");
                
                if (message.success) {
                  // Display notification on LCD
                  displayNotification(message.stringValue);
                  
                  // Mark as delivered
                  Firebase.setBool(fbdo, notificationPath + "/delivered", true);
                }
              }
            }
          }
        }
        
        json.iteratorEnd();
      }
    }
  }
}

void displayNotification(String message) {
  // Save current state
  bool wasDoorUnlocked = doorUnlocked;
  
  // Display notification
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Notification:");
  
  // If message is too long, scroll it
  if (message.length() > 16) {
    for (int i = 0; i <= message.length() - 16; i++) {
      lcd.setCursor(0, 1);
      lcd.print(message.substring(i, i + 16));
      delay(500);
    }
  } else {
    lcd.setCursor(0, 1);
    lcd.print(message);
    delay(3000);
  }
  
  // Restore previous state
  lcd.clear();
  if (wasDoorUnlocked) {
    lcd.setCursor(0, 0);
    lcd.print("Door Unlocked!");
    lcd.setCursor(0, 1);
    lcd.print("Please enter");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Enter Password:");
    if (inputPassword.length() > 0) {
      lcd.setCursor(0, 1);
      for (int i = 0; i < inputPassword.length(); i++) {
        lcd.print("*");
      }
    }
  }
}
```

## Door Access Database Structure

The Firebase database structure for door access events:

- `/door_access_events/{doorId}/{eventId}` - Records of door lock/unlock events with timestamps
  - `doorId` - Identifier for the door
  - `doorName` - Human-readable door name
  - `userId` - User who triggered the action (if known)
  - `userName` - Name of the user (if known)
  - `action` - Either "lock" or "unlock"
  - `method` - Method used: "password", "card", "remote", or "manual"
  - `passwordUsed` - The password that was entered (for audit purposes)
  - `success` - Whether the action was successful
  - `timestamp` - Server timestamp when the event occurred
  - `formattedTime` - Human-readable time in local format

- `/password_auth` - Temporary node for password authentication requests
  - Used for communication between the ESP32 and Firebase functions

## Hardware Connection Diagram

```
ESP32 Connections:
- GPIO26 -> Relay Input (for door lock control)
- GPIO21 (SDA) -> LCD SDA
- GPIO22 (SCL) -> LCD SCL
- GPIO19, 18, 5, 17 -> Keypad Row pins
- GPIO16, 4, 2, 15 -> Keypad Column pins
- 5V, GND -> Power connections for all components
```

## Testing the System

1. Upload the code to your ESP32 after updating WiFi credentials
2. The ESP32 will connect to WiFi and Firebase
3. The LCD will display "Enter Password:"
4. Enter a password using the keypad and press # to submit
5. Valid passwords will unlock the door for 5 seconds, then lock automatically
6. All access events are recorded in the Firebase database with timestamps
7. Access history can be viewed in the SmartKey Manager application

## Troubleshooting

- If you're having connection issues, verify your WiFi credentials
- Ensure Firebase rules allow read/write access to the required paths
- Check serial monitor (115200 baud) for debugging information
- For hardware issues, verify all connections and power supply
- If passwords aren't being authenticated, check Firebase database rules and paths
