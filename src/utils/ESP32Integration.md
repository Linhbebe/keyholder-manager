
# ESP32 Integration Guide

This guide explains how to connect your ESP32 with LCD display to this KeyHolder Manager app.

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

// Firebase project settings
#define API_KEY "AIzaSyAVpaDUcLkRZlY9ge7BkjmT3qBikuPGeUo"
#define DATABASE_URL "https://app1-e1cea-default-rtdb.firebaseio.com"

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
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL; 
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KeyHolder System");
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
      FirebaseJsonData result;
      
      size_t len = json.iteratorBegin();
      String path;
      
      // Iterate through each notification
      for (size_t i = 0; i < len; i++) {
        json.iteratorGet(i, type, path, value);
        
        if (type == "object") {
          // Get notification details
          String notificationPath = path;
          
          // Check if this notification has been delivered
          Firebase.getBool(fbdo, "/esp32_notifications/" + notificationPath + "/delivered", result);
          bool delivered = result.boolValue;
          
          if (!delivered) {
            // Get message content
            Firebase.getString(fbdo, "/esp32_notifications/" + notificationPath + "/message", result);
            String message = result.stringValue;
            
            // Display on LCD
            displayNotification(message);
            
            // Mark as delivered
            Firebase.setBool(fbdo, "/esp32_notifications/" + notificationPath + "/delivered", true);
            
            // We'll process one notification at a time
            break;
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
  lcd.print("KeyHolder System");
  lcd.setCursor(0, 1);
  lcd.print("Ready");
}
```

## Usage Instructions

1. Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your WiFi credentials
2. If needed, adjust the LCD address and dimensions according to your LCD model
3. Upload the code to your ESP32
4. The ESP32 will connect to WiFi and Firebase, then listen for login notifications
5. When someone logs in to the KeyHolder Manager app, the notification will appear on the LCD

## Troubleshooting

- If you're having connection issues, verify your WiFi credentials and that your ESP32 is within range of your router
- Ensure Firebase rules allow read/write access to the `esp32_notifications` path
- Check serial monitor (115200 baud) for debugging information
