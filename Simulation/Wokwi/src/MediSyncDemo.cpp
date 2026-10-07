#include "MediSyncDemo.h"

#include <Wire.h>
#include <math.h>

namespace {
constexpr uint8_t kDisplayAddress = 0x3C;
constexpr uint8_t kTareSamples = 10;
constexpr uint8_t kReadSamples = 5;
constexpr uint16_t kReminderToneHz = 2200;
}

void MediSyncDemo::begin() {
  Serial.begin(115200);
  pinMode(kLedPin, OUTPUT);
  pinMode(kBuzzerPin, OUTPUT);
  digitalWrite(kLedPin, LOW);
  noTone(kBuzzerPin);

  Wire.begin(kSdaPin, kSclPin);
  displayReady_ = display_.begin(SSD1306_SWITCHCAPVCC, kDisplayAddress);
  if (displayReady_) {
    display_.clearDisplay();
    display_.setTextColor(SSD1306_WHITE);
    display_.setTextSize(1);
    display_.setTextWrap(false);
  }

  scale_.begin(kHx711DataPin, kHx711ClockPin);
  scale_.set_scale(1.0F);

  if (!scale_.wait_ready_timeout(1500)) {
    setStage(Stage::SensorError);
    Serial.println("ERROR: HX711 not ready");
    return;
  }

  setStage(Stage::Welcome);
  updateDisplay();
  Serial.println("DEMO_READY");
}

void MediSyncDemo::update() {
  const uint32_t now = millis();

  switch (stage_) {
    case Stage::Welcome:
      if (now - stageStartedAt_ >= kWelcomeDurationMs) {
        startReminder();
      }
      break;

    case Stage::Reminder:
      updateReminder(now);
      break;

    case Stage::Baseline:
      updateBaseline(now);
      break;

    case Stage::Monitoring:
      updateMonitoring(now);
      break;

    case Stage::Recorded:
    case Stage::SensorError:
      break;
  }
}

void MediSyncDemo::setStage(Stage stage) {
  stage_ = stage;
  stageStartedAt_ = millis();
}

void MediSyncDemo::startReminder() {
  setStage(Stage::Reminder);
  reminderStartedAt_ = stageStartedAt_;
  lastLedToggleAt_ = reminderStartedAt_;
  digitalWrite(kLedPin, HIGH);
  ledState_ = true;
  updateDisplay();
  Serial.println("REMINDER_START");
}

void MediSyncDemo::updateReminder(uint32_t now) {
  const uint32_t elapsed = now - reminderStartedAt_;

  if (now - lastLedToggleAt_ >= kLedBlinkIntervalMs) {
    lastLedToggleAt_ = now;
    ledState_ = !ledState_;
    digitalWrite(kLedPin, ledState_ ? HIGH : LOW);
  }

  const bool shouldBeep = (elapsed % kBeepPeriodMs) < kBeepDurationMs;
  if (shouldBeep != buzzerOn_) {
    buzzerOn_ = shouldBeep;
    if (buzzerOn_) {
      tone(kBuzzerPin, kReminderToneHz);
    } else {
      noTone(kBuzzerPin);
    }
  }

  if (elapsed >= kReminderDurationMs) {
    stopReminderOutputs();
    setStage(Stage::Baseline);
    updateDisplay();
    Serial.println("REMINDER_COMPLETE");
  }
}

void MediSyncDemo::stopReminderOutputs() {
  noTone(kBuzzerPin);
  buzzerOn_ = false;
  digitalWrite(kLedPin, LOW);
  ledState_ = false;
}

void MediSyncDemo::updateBaseline(uint32_t now) {
  if (now - stageStartedAt_ < kBaselineDelayMs) {
    return;
  }

  if (!scale_.wait_ready_timeout(1000)) {
    setStage(Stage::SensorError);
    updateDisplay();
    Serial.println("ERROR: HX711 timed out while establishing baseline");
    return;
  }

  scale_.tare(kTareSamples);
  setStage(Stage::Monitoring);
  lastReadAt_ = now;
  updateDisplay();
  Serial.println("BASELINE_READY");
  Serial.println("SIMULATION: set HX711 load to +0.003 kg for the demo event");
}

void MediSyncDemo::updateMonitoring(uint32_t now) {
  if (now - lastReadAt_ < kReadIntervalMs || !scale_.is_ready()) {
    return;
  }
  lastReadAt_ = now;

  const long rawDelta = scale_.get_value(kReadSamples);
  const float deltaGrams = fabsf(static_cast<float>(rawDelta)) / kSimCountsPerGram;
  updateDisplay(deltaGrams);

  if (deltaGrams >= kEventThresholdGrams) {
    recordEvent(deltaGrams);
  }
}

void MediSyncDemo::recordEvent(float deltaGrams) {
  eventDeltaGrams_ = deltaGrams;
  stopReminderOutputs();
  setStage(Stage::Recorded);
  digitalWrite(kLedPin, HIGH);
  ledState_ = true;
  updateDisplay(eventDeltaGrams_);
  Serial.println("EVENT_DETECTED");
  Serial.println("EVENT_RECORDED_UNRESOLVED");
}

void MediSyncDemo::updateDisplay(float weightGrams) {
  if (!displayReady_) {
    return;
  }

  display_.clearDisplay();
  display_.setCursor(0, 0);

  switch (stage_) {
    case Stage::Welcome:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.println("Automatic demo");
      display_.println("Starting reminder...");
      break;

    case Stage::Reminder:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.println("REMINDER DUE");
      display_.println("Weight check follows");
      break;

    case Stage::Baseline:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.println("Reminder complete");
      display_.println("Taking baseline...");
      break;

    case Stage::Monitoring:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.print("Delta: ");
      display_.print(weightGrams, 1);
      display_.println(" g (sim)");
      display_.println("Waiting for change");
      break;

    case Stage::Recorded:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.print("Delta: ");
      display_.print(eventDeltaGrams_, 1);
      display_.println(" g (sim)");
      display_.println("EVENT DETECTED");
      display_.println("RECORDED");
      display_.println("STATUS: UNRESOLVED");
      break;

    case Stage::SensorError:
      display_.println("MEDISYNC  SIM");
      display_.println("Medicine: DemoMed");
      display_.println("SENSOR ERROR");
      display_.println("Check HX711 wiring");
      break;
  }

  display_.display();
}
