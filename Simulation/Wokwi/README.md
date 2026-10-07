# MediSync Wokwi home/desk prototype

**Repository status (2026-10-07):** The Wokwi source and configuration files are present under `Simulation/Wokwi/`. Build and simulator validation are pending; the instructions below describe a suggested demonstration, not a verified result.

This project simulates the core 12-position MediSync desk/home device. It has an ESP32, 128×64 OLED, audible reminder, 12 individually controlled slot indicators, button navigation, an adjustable HX711 load-cell model, and a simulated IR event cue.

The system records reminders and sensor evidence. A weight change or IR cue can suggest that a tray was accessed; neither proves that a medication was swallowed.

## Project files

- `diagram.json` — Wokwi circuit and pin connections.
- `platformio.ini` — ESP32 Arduino build and library dependencies.
- `wokwi.toml` — Wokwi VS Code firmware paths.
- `src/main.cpp` — startup, serial commands, buttons, and application loop.
- `src/` and `include/medisync/` — clock, reminder state, weight-event detection, OLED, and LED-ring modules.

## Run it in Wokwi

1. Open this folder in VS Code with PlatformIO and the Wokwi extension installed.
2. Build the `esp32dev` PlatformIO environment once. This downloads the listed libraries and creates the firmware files referenced by `wokwi.toml`.
3. Start the Wokwi simulator from the Wokwi panel or the command palette. The project uses the ESP32 DevKitC V4 board model, which matches PlatformIO's `esp32dev` target.
4. Open the serial monitor at **115200 baud**. The command list prints after startup.

Wokwi's HX711 part has an interactive `load` control. Click the HX711 during simulation to change the simulated tray load. Wokwi documents the part as an HX711/load-cell model with an adjustable load and supports the ESP32, SSD1306 OLED, button, buzzer, and NeoPixel ring used here: [HX711 reference](https://docs.wokwi.com/parts/wokwi-hx711), [supported hardware](https://docs.wokwi.com/getting-started/supported-hardware), and [PlatformIO projects](https://docs.wokwi.com/vscode/platformio).

## Quick demonstration

### Immediate sensor-event demo

1. Start the simulation and set the HX711 load to about **0.50 kg**.
2. In the serial monitor, enter:

   ```text
   ADD 1 Vitamin_D 08:00
   BASELINE 1
   NOW 1
   ```

3. Press **TOUCH / SELECT** (or Enter) once to silence the reminder while the device continues monitoring.
4. Change the HX711 load to about **0.35 kg** and press **IR EVENT (SIM)** (or `I`). The OLED and serial monitor show a sensor-event candidate after the load reading settles.
5. Press **TOUCH / SELECT** again (or enter `CONFIRM 1`) to log the sensed removal. The log explicitly says this is not ingestion proof.

To exercise the scheduled reminder instead, set the compressed clock and register a future slot, for example:

```text
TIME 07:45
ADD 2 Calcium 08:00
```

One real second advances the demo clock by one simulated minute. The alarm starts when the scheduled time arrives. If the event window expires, MediSync keeps an unresolved count for that slot. Use `RESOLVE 2 TAKEN` or `RESOLVE 2 SKIPPED` to save a manual self-report.

### Physical controls

- **UP / DOWN**: browse the 12 medication slots.
- **TOUCH / SELECT**: acknowledge an alarm, log a candidate event, or manually resolve a pending item as taken.
- **BACK**: leave an active reminder unresolved or manually resolve a pending item as skipped.
- **IR EVENT (SIM)**: inject the simulated infrared beam-interruption cue.

The Select button is connected to touch-capable ESP32 GPIO4, but Wokwi models it as a tactile switch. On a physical device, this switch can be replaced with a capacitive electrode and the button reader can be changed to use `touchRead(T0)`.

## Serial commands

Medication names are one token with no spaces; use `_` if needed. Slots are numbered 1–12.

| Command | Action |
| --- | --- |
| `ADD <slot> <name> <HH:MM>` | Register a medication and assign its reminder time to a slot |
| `DEL <slot>` | Remove a registered slot |
| `TIME <HH:MM>` | Set the simulated local clock |
| `NOW <slot>` | Trigger a reminder immediately for a quick demo |
| `BASELINE <slot>` | Capture the current HX711 reading as that slot's reference |
| `CONFIRM <slot>` | Log a sensor-event candidate without claiming ingestion |
| `SKIP <slot>` | Leave an active item unresolved or manually resolve an old one as skipped |
| `RESOLVE <slot> TAKEN\|SKIPPED` | Record a user's self-report for one unresolved item |
| `LIST` | Show registered medications and unresolved counts |
| `HELP` | Show command help |

Slot registration and reminder state live in RAM for this prototype and reset when the simulation restarts.

## Wiring map

| Component | ESP32 connection |
| --- | --- |
| SSD1306 OLED SDA / SCL | GPIO21 / GPIO22 |
| HX711 DT / SCK | GPIO16 / GPIO17 |
| 12-pixel slot ring DIN | GPIO13 |
| Buzzer positive | GPIO18 |
| UP / DOWN / SELECT / BACK / IR event buttons | GPIO32 / GPIO33 / GPIO4 / GPIO26 / GPIO27 to GND |

The OLED and HX711 are powered from 3.3 V in this diagram to keep their logic levels ESP32-safe. The LED ring uses the board's 5 V pin. For a physical build, size the 5 V supply for the LEDs and share ground with the ESP32; use a suitable level shifter if the chosen ring or HX711 module drives a 5 V logic signal.

## Simulation scope and limitations

- **HX711:** Wokwi simulates the HX711 and exposes an adjustable load. One simulated scale represents the currently monitored tray/position. It does not model twelve separate load cells.
- **IR sensing:** Wokwi has no medication-compartment beam-break part in this circuit. The yellow pushbutton is a clearly labeled substitute that injects an IR cue. On hardware, replace it with a break-beam emitter/receiver or an equivalent optical sensor.
- **Touch:** the SELECT tactile switch is a simulation substitute on GPIO4; use the ESP32 capacitive-touch peripheral for a touch electrode in a hardware revision.
- **Clock and storage:** time is compressed to one simulated minute per real second. Medication setup and event counts are not persisted across restart. A physical revision needs an RTC or network time source and nonvolatile storage.
- **Sensing claim:** the firmware flags a stable weight decrease of at least 12 simulated raw counts. The IR cue is recorded as supporting evidence. A detected removal is not proof of ingestion or adherence.
- **Privacy architecture:** this firmware is an offline device prototype. It does not implement the app's local AI, cloud workflow, encryption, or future TEE upgrade.

## Validation status

The project files already live in this repository at `Simulation/Wokwi/`. Their presence, and any cached files under `.pio/`, do not confirm a successful build or simulation. Run the build and demonstration steps above, save the actual console/OLED evidence, and update this status only from observed results.

The local `.gitignore` contains `.pio/`; keep generated PlatformIO output out of commits. If `.pio` paths are already tracked in a working clone, see [`Docs/project-status-and-validation.md`](../../Docs/project-status-and-validation.md) for the index-only cleanup command. That command leaves local build files in place.
