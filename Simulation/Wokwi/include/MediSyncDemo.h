#pragma once

#include <Arduino.h>
#include <Adafruit_SSD1306.h>
#include <HX711.h>

class MediSyncDemo {
 public:
  void begin();
  void update();

 private:
  enum class Stage : uint8_t {
    Welcome,
    Reminder,
    Baseline,
    Monitoring,
    Recorded,
    SensorError,
  };

  static constexpr uint8_t kSdaPin = 21;
  static constexpr uint8_t kSclPin = 22;
  static constexpr uint8_t kHx711DataPin = 18;
  static constexpr uint8_t kHx711ClockPin = 19;
  static constexpr uint8_t kLedPin = 25;
  static constexpr uint8_t kBuzzerPin = 26;

  static constexpr uint32_t kWelcomeDurationMs = 1800;
  static constexpr uint32_t kReminderDurationMs = 5000;
  static constexpr uint32_t kBaselineDelayMs = 900;
  static constexpr uint32_t kReadIntervalMs = 350;
  static constexpr uint32_t kLedBlinkIntervalMs = 250;
  static constexpr uint32_t kBeepPeriodMs = 1000;
  static constexpr uint32_t kBeepDurationMs = 180;

  // Wokwi documents 0..2100 output units across the simulated 0..5 kg range.
  // At least one output unit is enough for the ~3 g automation step.
  static constexpr float kSimCountsPerGram = 2100.0F / 5000.0F;
  static constexpr float kEventThresholdGrams = 1.0F;

  Adafruit_SSD1306 display_{128, 64, &Wire, -1};
  HX711 scale_;
  Stage stage_ = Stage::Welcome;
  uint32_t stageStartedAt_ = 0;
  uint32_t lastReadAt_ = 0;
  uint32_t lastLedToggleAt_ = 0;
  uint32_t reminderStartedAt_ = 0;
  bool ledState_ = false;
  bool buzzerOn_ = false;
  bool displayReady_ = false;
  float eventDeltaGrams_ = 0.0F;

  void setStage(Stage stage);
  void updateReminder(uint32_t now);
  void updateBaseline(uint32_t now);
  void updateMonitoring(uint32_t now);
  void updateDisplay(float weightGrams = 0.0F);
  void startReminder();
  void stopReminderOutputs();
  void recordEvent(float deltaGrams);
};
