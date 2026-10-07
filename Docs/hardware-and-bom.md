# Hardware and bill of materials

## Scope and confidence

The repository contains a Wokwi desk/home circuit description, not evidence of a physical build. The table below is a **budgetary one-channel prototype estimate**, not a purchase specification or quotation. The Wokwi model has 12 slot indicators but only one adjustable HX711 input; the estimate does not cover 12 independent sensor channels.

Prices are indicative India-market references checked on **2026-10-07**. Retail listings, stock, shipping, taxes, and exact variants change. Where the repository does not select an exact part, the cost is a planning allowance. Verify the selected part's electrical and mechanical specifications before ordering.

## Demonstration BOM estimate

| Item | Qty. | Evidence in current files / selection needed | Estimated amount (INR) |
|---|---:|---|---:|
| ESP32 development board | 1 | PlatformIO uses `board = esp32dev`; Wokwi uses an ESP32 DevKitC V4 model. Physical board/vendor/USB connector is not selected. | ₹750–900 |
| SSD1306 OLED, 128×64, I²C | 1 | Wokwi diagram uses an SSD1306 model at I²C `0x3C`, powered at 3.3 V. Physical size, board pinout, and exact module are unverified. | ₹200–300 |
| Load cell and HX711 amplifier | 1 channel | Wokwi HX711 part is labelled `5kg`; the physical cell, capacity, geometry, and mounting are not selected. Budget for one compatible cell plus one HX711 module. | ₹300–650 |
| Addressable 12-pixel RGB ring | 1 | Wokwi diagram and `Adafruit NeoPixel` dependency use a 12-pixel ring at 5 V. Exact physical ring and current draw are unverified. | ₹500–700 |
| Piezo buzzer/sounder compatible with tone output | 1 | Wokwi buzzer is driven from GPIO18; firmware emits a tone. Choose the physical sounder and any driver after checking current and interface. | ₹30–100 |
| Momentary pushbuttons | 5 | UP, DOWN, SELECT, BACK, and simulated IR cue are modeled as buttons to ground. The physical button type is not selected. | ₹25–100 |
| Regulated 5 V supply | 1 | The diagram powers the LED ring from 5 V. Select capacity and protection after calculating peak LED and board current; adapter is not specified. | ₹330–450 |
| Breadboard/protoboard, wiring, connectors | 1 lot | Needed for a physical prototype but not specified as a purchasable package in the archive. | ₹150–500 allowance |
| **Indicative one-channel subtotal** |  | Excludes enclosure, battery/charging, mechanical load-cell platform, PCB fabrication, optional physical IR sensor, additional sensing channels, shipping, assembly, and test equipment. | **about ₹2,300–3,700** |

Price references: [ESP32 board listings at Robu](https://robu.in/product-category/smartelex-wifi-and-bluetooth-module/); [OLED price list at Robocraze](https://robocraze.com/collections/oled); [HX711 with 1–5 kg cell listing at LABSathi](https://labsathi.com/product/hx711-1-5kg-load-cell-module-sTOHui); [12-pixel NeoPixel ring listing at MG Super Labs](https://www.mgsuperlabs.co.in/estore/Neo-Pixel-Ring-12-x-WS2812-5050-RGB-LED); [buzzer listings at Robu](https://robu.in/product-category/piezo-buzzer-module/); and [5 V adapter listings at Robu](https://robu.in/product-category/power-supply-adapter/). The links are market references, not endorsements or confirmed selected parts.

## Wiring shown by the Wokwi diagram

| Signal/component | Pin or supply in diagram |
|---|---|
| SSD1306 OLED SDA / SCL | GPIO21 / GPIO22; 3.3 V and ground |
| HX711 DT / SCK | GPIO16 / GPIO17; 3.3 V and ground |
| 12-pixel ring DIN | GPIO13; 5 V and ground |
| Buzzer | GPIO18 and ground |
| UP / DOWN / SELECT / BACK / IR EVENT (SIM) | GPIO32 / GPIO33 / GPIO4 / GPIO26 / GPIO27; buttons connect to ground |

This pin map describes the simulation files. It is not an inspected physical wiring harness or a completed electrical safety review. In a physical revision, verify the selected modules' logic levels, grounding, current draw, and any required level shifting. Size the 5 V source for measured peak load; do not assume the simulation's supply wiring is sufficient.

## Specs that remain unverified

- The `5kg` Wokwi HX711 attribute is a simulator setting, not confirmation of the physical sensor's capacity, accuracy, usable range, or calibration.
- Firmware thresholds are raw digital counts. No calibrated grams, precision, repeatability, or false-positive/false-negative rate is established.
- The physical IR break-beam part is not selected; the current yellow control is a button only.
- Battery type, runtime, charging/protection, enclosure, mounting, hygiene/cleaning, and manufacturing costs are unspecified.
- The current app's weight values are mock data and must not be used to infer real sensor performance.
