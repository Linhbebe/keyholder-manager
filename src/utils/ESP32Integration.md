
# ESP32 Integration Guide

This guide explains how to connect your ESP32 with LCD display to this SmartKey Manager app.

## Requirements

1. ESP32 board
2. LCD display (I2C or SPI interface)
3. Arduino IDE
4. Required libraries:
   - FirebaseESP32 (by Mobizt)
   - WiFi (built-in)
   - LiquidCrystal_I2C (for I2C LCD) or Adafruit GFX + compatible driver for your LCD

## ESP32 Arduino Code

```cpp
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <LiquidCrystal_I2C.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase project settings - UPDATE THESE WITH YOUR VALUES
#define DATABASE_URL "https://app1-e1cea-default-rtdb.firebaseio.com/"
#define DATABASE_SECRET "D1U4X8Fo6UwhYPkU7IbHxWNCmvQOj7yX9uKczRs0"

// LCD Configuration
#define LCD_ADDR 0x27  // I2C address of LCD (typically 0x27 or 0x3F)
#define LCD_COLS 16    // Number of LCD columns
#define LCD_ROWS 2     // Number of LCD rows

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Initialize LCD
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

unsigned long previousMillis = 0;
const long interval = 2000;  // Check for new notifications every 2 seconds

void setup() {
  Serial.begin(115200);
  
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
  lcd.print("Ready");
}

void loop() {
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    // Check for new notifications in Firebase
    if (Firebase.getJSON(fbdo, "/esp32_notifications")) {
      FirebaseJson &json = fbdo.jsonObject();
      size_t len = json.iteratorBegin();
      String path, value;
      int type;
      
      // Iterate through each notification
      for (size_t i = 0; i < len; i++) {
        json.iteratorGet(i, type, path, value);
        
        if (type == FIREBASE_JSON_OBJECT) {
          // Get notification details
          String notificationPath = path;
          
          // Check if this notification has been delivered
          FirebaseJson innerJson;
          String deliveredPath = "/esp32_notifications/" + notificationPath + "/delivered";
          if (Firebase.getBool(fbdo, deliveredPath)) {
            bool delivered = fbdo.boolData();
            
            if (!delivered) {
              // Get message content
              String messagePath = "/esp32_notifications/" + notificationPath + "/message";
              if (Firebase.getString(fbdo, messagePath)) {
                String message = fbdo.stringData();
                
                // Display on LCD
                displayNotification(message);
                
                // Mark as delivered
                Firebase.setBool(fbdo, deliveredPath, true);
                
                // We'll process one notification at a time
                break;
              }
            }
          }
        }
      }
      
      json.iteratorEnd();
    }
  }
}

void displayNotification(String message) {
  Serial.println("New notification: " + message);
  
  lcd.clear();
  
  // If message is longer than LCD width, scroll it
  if (message.length() > LCD_COLS) {
    for (int pos = 0; pos <= message.length() - LCD_COLS; pos++) {
      lcd.setCursor(0, 0);
      lcd.print("Notification:");
      lcd.setCursor(0, 1);
      lcd.print(message.substring(pos, pos + LCD_COLS));
      delay(300);
    }
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Notification:");
    lcd.setCursor(0, 1);
    lcd.print(message);
  }
  
  delay(3000);  // Display for 3 seconds
  
  // Return to default screen
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SmartKey System");
  lcd.setCursor(0, 1);
  lcd.print("Ready");
}
```

## Usage Instructions

1. Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your WiFi credentials
2. The Firebase database URL and auth token are already set up for you
3. If needed, adjust the LCD address and dimensions according to your LCD model
4. Upload the code to your ESP32
5. The ESP32 will connect to WiFi and Firebase, then listen for login notifications
6. When someone logs in to the SmartKey app, the notification will appear on the LCD

## Troubleshooting

- If you're having connection issues, verify your WiFi credentials and that your ESP32 is within range of your router
- Ensure Firebase rules allow read/write access to the `esp32_notifications` path
- Check serial monitor (115200 baud) for debugging information
- If authentication fails, verify that the Database Secret is correct and that the database rules allow access with this token
