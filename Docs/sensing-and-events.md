# Sensing and event interpretation

> **A sensor event does not prove ingestion.** A weight change or IR cue only records an observation associated with a reminder. It cannot establish that medication was swallowed, taken at the correct time, or taken by a particular person.

## What the current prototypes do

### ESP32/Wokwi source

The files under `Simulation/Wokwi/` describe one adjustable HX711 input and a separate button labelled `IR EVENT (SIM)`. The firmware:

1. Reads the HX711 when it reports ready, no more often than the code's 90 ms sample interval.
2. Applies a light smoothing filter to raw readings.
3. Sets a baseline when a reminder starts (or through the baseline command, when a reading is ready).
4. Flags a **sensor-event candidate** when the smoothed value is at least 12 raw counts below that baseline for three fresh samples in a row.
5. Records the IR button as supporting cue information. IR alone is not treated as a dose event.
6. Keeps reminders unresolved on timeout and lets a user enter a separate `TAKEN` or `SKIPPED` self-report. The self-report does not change sensor evidence.

The threshold is a code-level demonstration setting, not a calibrated mass threshold. Raw counts are not grams. The simulation exposes one scale for the currently monitored measurement; its 12-pixel ring does not provide 12 independent measurements. The firmware uses a compressed clock (one real second per simulated minute) and RAM state that resets when it restarts. These behaviors are visible in source; build and simulator validation remain pending.

### Offline web app

The app's `Simulate weight change` action calculates a mock before/after value from fictional profile values. `Lift + return` records a mock unchanged value. These are demo interactions; the app does not read a load cell, communicate with the ESP32, or measure medication. Events are marked unverified in the UI/data.

## Interpretation rules

- Say **sensor event**, **weight-change cue**, or **possible medication-related event**.
- Do not label an event "dose taken", "ingestion detected", or "adherent" based on a sensor change.
- A missing change is not proof a dose was missed; movement, sensor position, packaging changes, timing, noise, or a fault can affect readings.
- An IR cue means only that the simulation input was activated. A real beam interruption would still be an access cue, not ingestion evidence.
- Keep manual self-report separate from sensor data and identify it as self-reported.
- A reminder acknowledgement, candidate confirmation, or timeout is a workflow state, not a clinical conclusion.

## Validation needed before performance claims

The repository contains suggested Wokwi demonstration steps, but no validation results are included in this documentation package. Before claiming the sequence works, record a reproducible run and actual evidence for:

- build and simulator startup;
- reminder start, acknowledgement, timeout, and unresolved/manual-resolution paths;
- stable load decrease and no-change cases;
- IR cue by itself versus IR cue plus weight decrease;
- reset behavior and the loss of in-RAM configuration;
- repeated trials with realistic physical packaging and calibration, if hardware is built.

For physical tests, define representative packages and safe non-medication test weights, capture raw data, and report false events and missed events. Do not use real patient medication or infer clinical adherence from these prototype observations.
