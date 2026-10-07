# Design decisions and current trade-offs

This is an as-built summary inferred from the uploaded repository snapshot, not a record of team-approved architecture decision records. Confirm open questions with the project team before treating them as final requirements.

## Decisions visible in the archive

| Choice visible in source | Evidence and reason apparent from the implementation | Trade-off or limitation |
|---|---|---|
| Keep the browser demonstration separate from the ESP32 prototype. | `App/` contains a static HTML/CSS/JavaScript app; `Simulation/Wokwi/` contains independent Arduino/PlatformIO source. No adapter or transport code links them. | The app cannot display live device measurements or control the firmware. |
| Use browser-local persistence for the offline demo. | `App/scripts/storage.js` uses `localStorage` and fictional seed records; the app shell disallows connection requests through its CSP. | `localStorage` is unencrypted and tied to the browser profile. It is unsuitable for real patient information. |
| Develop the desk/home firmware as a Wokwi project. | The archive contains Wokwi circuit/configuration files and ESP32 source under `Simulation/Wokwi/`. | Simulation files exist, but this archive alone does not verify compilation or simulation behavior. |
| Use one load input for the currently monitored slot in the simulation. | The diagram has one HX711 part and the firmware has one `LoadCellSensor`; the 12-pixel ring is used for slot indications. | The design does not have 12 independent weight readings. Physical multi-position sensing is undecided. |
| Represent the IR cue with a dedicated simulation button. | `diagram.json` labels a button `IR EVENT (SIM)` and the firmware stores it as a cue. | It is not an optical sensor. An IR-only cue does not trigger a weight event and does not prove medication use. |
| Represent SELECT with a tactile switch in Wokwi. | GPIO4 is wired to a pushbutton. Comments describe capacitive touch as a possible hardware revision. | A physical touch electrode is not present or validated. |
| Compare smoothed raw counts against a stable-drop threshold. | The HX711 reader filters samples; the event detector requires a drop of at least 12 raw counts for three fresh samples. | The threshold is not calibrated to grams or a medication dose. Handling, drift, load-cell geometry, and package changes can create ambiguous readings. |
| Compress time and keep firmware state in RAM for demos. | One real second represents one simulated minute; slot and reminder state are initialized in memory. | Timing is not real-clock behavior, and configuration/history is lost on restart. |
| Keep sensor evidence separate from manual self-report. | Firmware messages call a detected decrease a candidate; `TAKEN`/`SKIPPED` commands are recorded as self-reports without changing sensor evidence. | Neither a sensor event nor a self-report is an independently verified ingestion measurement. |
| Preserve the existing `Frimware/Esp32` path for this documentation update. | That directory is present but empty in the uploaded archive. | It is a spelling error. Renaming it would be a repository change requiring references and teammate workflow to be coordinated; this package does not rename it. |

## Decisions still needed

- Select the physical ESP32 board, display module/interface, load-cell capacity and mechanics, LED ring, buzzer type, power source, enclosure, and any physical IR sensor.
- Decide whether the physical device measures one shared tray, each position independently, or a different arrangement. The current simulated channel is not a confirmed physical architecture.
- Define calibration, package-change handling, false-event evaluation, time source, persistence, and recovery behavior before describing reliable operation.
- Decide whether and how the app and device may communicate. The current repository has no connection.
- Define a privacy/security design before handling personal information. Cloud, AI, sharing, and TEE concepts are planned only.
- Choose a project license with all relevant contributors. There is no `LICENSE` file in the uploaded archive; this package intentionally does not add one.
