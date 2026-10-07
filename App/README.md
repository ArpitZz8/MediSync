# MediSync Offline Demo

A self-contained visual prototype for demonstrating medication reminders, simulated package-weight events, and local event history while the separate Wokwi/ESP32 track is being completed.

## Open the demo

Open `index.html` in a modern browser. The app has no package installation step, backend, account, internet requirement, external fonts, or external assets. All screens and demo actions run from the files in this folder.

The prototype saves its fictional medicines, schedule, events, profile, and preferences to this browser's `localStorage`. Use **Reset demo** in Profile & privacy or Demo controls to restore the sample data.

## Demonstration flow

1. Open **Demo controls** and start a reminder. The LED cue appears five simulated minutes before its scheduled alert.
2. Advance simulated time to show the scheduled buzzer representation, +5 minute escalation, +10 minute escalation, and unresolved state (+15 minutes by default).
3. Use **Simulate weight change** to record a mock **Medication event detected** entry.
4. Use **Lift + return, same weight** to show that no net weight change leaves the reminder unresolved.
5. Review reminders, detected changes, unresolved events, and missed reminders in Adherence history.

The default pre-alert, escalation, and unresolved timings are editable under **Profile & privacy**. Shorten them for a quicker live presentation.

## Scope and data handling

- Every sensor value and event is simulated. The app does not connect to an ESP32, HX711, Bluetooth, or Wi-Fi device.
- A detected weight change records a sensor event; it does not verify that medication was swallowed.
- Caregiver alerts, hospital connectivity, AI suggestions, encryption at rest, and TEE are shown as planned or mock concepts. They are not implemented services or security features.
- Profile and demo data stay in this browser. The prototype does not encrypt local storage. Do not enter real patient data.
- The browser's Content Security Policy disables app network connections (`connect-src 'none'`). No code in the app uses `fetch`, XHR, WebSocket, or remote APIs.

## Files

- `index.html` — app shell and local-only security policy
- `styles.css` — responsive visual system
- `scripts/storage.js` — fictional seed data and local browser storage
- `scripts/demo-engine.js` — simulated reminder and sensor-event transitions
- `scripts/app.js` — screens, forms, and presenter controls

The app is intentionally separate from the Wokwi prototype. Future hardware adapters can feed the UI through the demo-engine boundary without changing the screen structure.
