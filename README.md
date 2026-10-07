# MediSync
Medication adherence monitoring and reminder system

**An open-innovation concept for medication reminders and medication-event tracking.**

> **Important limitation:** A sensor-observed change can indicate a possible medication-related event, but it cannot prove that a dose was swallowed.

**Primary hackathon theme:** Open Innovation
**Supporting themes:** AI/ML and Cybersecurity
**Project status:** Prototype and software concept in development

---

## Project at a Glance

MediSync explores how a reminder device and companion software could help people manage medication schedules across different packaging types. The concept includes a home/desk device and a portable device, with a possible future version for supported hospital workflows.

The project combines scheduled reminders with sensor-observed events. Its design aims to make medication setup and package replacement less burdensome, while keeping the limits of sensor-based adherence tracking explicit.

This repository contains the current project materials. Individual components have different implementation statuses; see [Project Status](#project-status).

## Problem Statement

Medication schedules can be difficult to manage when a person uses several medicines, follows different schedules, or handles different packaging formats such as pill containers, liquid containers, and blister packs. A reminder alone does not show whether a medicine-related event occurred, while a sensor reading cannot establish that a person actually took a dose.

MediSync investigates a practical reminder-and-event-recording approach that can support multiple packaging types without treating an observed event as proof of ingestion.

## Existing Solutions

Common approaches include phone alarms, pill organizers, smart dispensers, package-level sensors, and manual medication logs. These approaches offer different trade-offs in cost, setup effort, packaging compatibility, automation, and the strength of the evidence they collect.

MediSync's design exploration considers:

- **Phone alarms and manual logs:** simple to start with, but depend on user interaction and manual recording.
- **Dedicated pill organizers or dispensers:** can organize doses, but may not suit every packaging format or workflow.
- **RFID or package-specific tagging:** can identify tagged items, but may create replacement and re-tagging friction.
- **Camera-based recognition:** may identify visible objects in suitable conditions, but adds hardware/software complexity and does not prove ingestion.
- **Weight-based sensing:** can detect changes in measured load, but readings may be affected by handling, package changes, sensor drift, or other factors.
- **IR sensing for blister positions:** can provide a low-cost event cue, but requires validation across pack shapes, placement, lighting, and user behavior.

These are design considerations, not a claim that every product in a category has the same capabilities. A more detailed, product-level comparison — covering commercial devices and open-source projects working on similar problems — is provided below in [Related Work and Competitive Landscape](#related-work-and-competitive-landscape).

## Related Work and Competitive Landscape

This section summarizes commercial medication-adherence devices and open-source/DIY projects identified during early research, for use in competitive-analysis materials (e.g. a hackathon slide). Pricing and feature details below are drawn from publicly available product pages and project repositories; they have not all been independently verified against primary sources and should be re-checked before being cited in a formal submission.

### Commercial medication-adherence devices

| Company | Device / Product | Price (model) | Core technology | Notes |
|---|---|---|---|---|
| Hero Health | Hero Smart Dispenser | $29.99–$44.99/month (subscription) | Motorized carousel dispensing; Wi-Fi; app-based schedule | Holds up to 10 meds (~90-day supply); one-button dispensing; app reminders, missed-dose alerts, caregiver monitoring |
| Philips | Lifeline Medication Dispenser | $59.95/month + $99 installation | Pre-sorted cups; phone line; automated dispensing | Dispenses up to 60 cups (~40 days); audio/visual reminders; requires a service subscription |
| MedMinder | MedMinder Dispenser | ~$39.95/month (rental) | Cellular connectivity (no Wi-Fi needed); 28 compartments | Real-time notifications; disposable cartridges pre-organized by a pharmacy |
| AdhereTech | Smart Pill Bottle | $360–$395 per bottle (3–6 months use) | Capacitive sensors in the bottle; cellular connectivity | Detects pill removal; lights, chimes, and text alerts on missed doses |
| Spencer Health Solutions | Spencer Smart Hub | ~$19–$100+/month (insurance-dependent) | Automated dispensing from pre-packaged cartridges; telehealth platform | In-home hub; dispenses pre-packaged medication pouches; also a telehealth/monitoring platform |
| PillDrill | PillDrill System | $199 one-time | RFID tags on containers; scanning hub | User scans an RFID tag after taking medication; tracking system, no automatic dispensing, no subscription |
| e-pill | MedSmart (and other models) | $589.95 one-time | Locked, automatic dispenser with alarms | Range from basic alarms to locked units; some models add event reporting via an optional docking station and monthly fee |
| LiveFine | Automatic Pill Dispenser | $89.99–$199.99 one-time | 28-day carousel with LCD display and alarms | Lower-cost automatic dispenser; sound/light alerts; no app integration or caregiver monitoring |
| Omnicell | Medication Adherence Packaging | Enterprise pricing (not consumer) | Blister-card packaging; guided packing software | Pharmacy/facility solution, not a home device; focused on multi-med blister cards |
| etectRx | ID-Cap System | Not publicly available | Ingestible sensor embedded in a capsule | FDA-cleared clinical system; sensor inside the pill sends a signal when swallowed |

### Open-source and DIY projects

- **MEDI-SYNC (GitHub):** ESP32-based smart pill box with medication reminders and a BLE Android app; reported component cost under ₹1,500 — a directly relevant, low-cost reference implementation.
- **Shaztech/Pilldispenser (GitHub):** complete open-source automated pill dispenser with 3D-printable parts, PCB designs, and ESP32 firmware; includes a touch screen, multi-user support, audio/visual alarms, and Telegram integration for alerts.
- **PillMediCount (IEEE paper):** research project using an Arduino, load-cell sensors, and HX711 amplifiers for real-time pill monitoring; reported prototype cost under $50 — supports the feasibility of the load-cell/HX711 sensing approach this project uses.
- **Other DIY projects:** various GitHub projects combine ESP32, DS3231 RTC modules, and stepper motors for smart medicine dispensers, often with mobile-app control or Wi-Fi connectivity.

### Positioning notes (draft — for slide use, pending verification)

These points are drafted for a competitive-analysis slide and should be checked against primary sources before being presented as settled fact:

- **Cost model:** most commercial options above rely on recurring subscriptions (roughly $20–$60/month, i.e. ~$240–$720/year), while this project's design direction favors a one-time hardware cost. The project's actual bill-of-materials cost should be confirmed and cited alongside any such comparison.
- **Sensing approach:** the project's planned load-cell + HX711 weight sensing is the same category of technique used in independent, low-cost prototypes such as PillMediCount, which supports the feasibility of this approach — though, per [Safety and Limitations](#safety-and-limitations), it still only yields a possible event, not confirmed ingestion.
- **Event detection vs. simple alarms:** unlike alarm-only dispensers (e.g. LiveFine), this project's event-based detection aims to record whether a sensor change occurred around a scheduled time, rather than relying solely on an alarm firing — while still disclosing that this is not proof of ingestion.
- **RFID/scanning vs. weight sensing:** commercial RFID-based tracking (e.g. PillDrill) requires the user to manually scan an item; this project's current preference for weight-based sensing over RFID or IR is intended to avoid that manual step, consistent with the trade-offs already noted in [Existing Solutions](#existing-solutions).

## Proposed Solution

MediSync is a proposed medication-reminder and event-tracking system with two device concepts:

- **Home/desk concept:** a multi-position device intended to accommodate pill/container positions, liquid-container positions, and blister-pack positions.
- **Portable concept:** a smaller device with six compartments for a more compact reminder workflow.
- **Companion software concept:** an offline-first web app for demonstrating schedules, medication records, reminders, and sensor-event history.

The device concepts use reminders and sensor observations to record events for later review. The software demonstration uses local/mock data and is not currently a live control interface for the ESP32.

## Key Features

### Reminder workflow

The concept includes an advance LED indication and a staged audible reminder pattern. The intended design describes a light five minutes before a scheduled time, followed by reminder beeps and later escalation. Timing and behavior must be confirmed against the validated firmware before being described as implemented.

### Multiple packaging concepts

The desk concept considers pill containers, liquid containers, and blister packs. The portable concept considers six compartments. Compatibility with actual packaging remains a design and validation task.

### Medication setup and replacement

The concept supports assigning a medicine to a position and retaining a saved profile for a similar replacement package, with confirmation or recalibration when a package changes substantially. This is intended to reduce unnecessary re-tagging. The final registration workflow depends on the implementation and must not be described as working unless tested.

### Sensor-event history

A change in measured weight or another sensor cue may be recorded as an event. If the observation is ambiguous, the system should preserve that uncertainty rather than label the event as a confirmed dose taken.

### Offline web-app demonstration

The repository includes an offline-oriented web app intended to demonstrate medication records, reminders, simulated sensor events, event history, and demo controls using local data. It is separate from the ESP32 firmware and does not currently establish a live hardware connection.

### Privacy and future security

The project considers local-first data handling and user-controlled sharing. A Trusted Execution Environment (TEE) is a possible future security enhancement, not a feature currently implemented by this repository.

## Technical Approach

At a conceptual level, MediSync is organized into these parts:

1. **Reminder logic:** stores a schedule and triggers local visual/audio reminders.
2. **Sensor layer:** reads load-cell measurements through an HX711 and considers other sensing cues for packaging types that use them.
3. **Event logic:** compares observations against a baseline or expected state and records a possible event when a threshold or condition is met.
4. **User interface:** presents the reminder state and event history on the device concept and in the offline web-app demonstration.
5. **Future software extensions:** could add adaptive pattern analysis, optional caregiver workflows, or cloud-supported features after privacy, safety, and implementation requirements are defined.

A measured change should be described as a **sensor event** or **possible medication-related event**, not as verified ingestion. The design must account for noise, package movement, sensor calibration, package replacement, and ambiguous events.

## Technology Stack

The project materials and proposed architecture refer to the following technologies. The presence of a technology in this list does not mean every feature using it is complete.

| Area | Technology or approach | Status note |
|---|---|---|
| Embedded controller | ESP32 family | Intended device platform; firmware integration requires validation |
| Weight sensing | Load cell and HX711 | Included in the Wokwi prototype concept; simulation validation is pending |
| Additional sensing | IR cue for blister-pack positions | Proposed for the desk-device concept; requires validation |
| Device interface | OLED, LEDs, buzzer | Part of the device concept; final implementation depends on the validated circuit/firmware |
| Companion interface | Offline web app using HTML/CSS/JavaScript | Source files are present in the repository archive; behavior should be tested before claiming it works end to end |
| Simulation | Wokwi | Project files are present under `Simulation/Wokwi/`; build and simulation validation are pending |
| Local persistence | Browser-local data for the web demo | Described by the app documentation; verify in the actual browser build |
| AI/ML | Future local pattern analysis and optional AI assistance | Planned, not implemented |
| Cloud services | Optional future cloud-assisted features | Planned, not implemented |
| Security | Local-first privacy approach; TEE considered as future enhancement | TEE not implemented |

## Expected Impact

MediSync aims to explore a lower-friction way to combine medication reminders with a record of observable events across more than one packaging format. Potential value includes:

- making schedules and reminders easier to review;
- reducing reliance on manual event logging;
- supporting a clearer record of ambiguous or missed reminder interactions;
- exploring replacement workflows that do not require re-tagging every similar package;
- providing a platform for later evaluation of caregiver and clinical workflows.

These are intended benefits, not measured outcomes. No clinical effectiveness, adherence improvement, or ingestion-detection accuracy is claimed.

## Future Scope

Possible future work includes:

- validating the Wokwi simulation and integrating the maintained firmware into this repository;
- testing sensor behavior with representative bottles, liquid containers, and blister packs;
- improving calibration and package-replacement handling;
- connecting the web app to a real device through a defined communication interface;
- evaluating adaptive local pattern analysis only after collecting suitable, consented data;
- adding optional caregiver notifications and role-based hospital workflows;
- assessing encrypted storage, authentication, and supported-device TEE capabilities;
- testing usability, accessibility, reliability, and false-event rates with appropriate safeguards.

All future medical or clinical-facing functions would require careful validation, privacy review, and clear limits on what the system can infer.

## Project Status

| Component | Current status |
|---|---|
| Project concept and device designs | Documented concept |
| Device renders and screenshots | Present in repository assets |
| Offline web-app source | Present; must be tested before declaring the demo fully verified |
| ESP32/Wokwi prototype | Source and configuration are present under `Simulation/Wokwi/`; validation pending |
| Wokwi project files in this repository | Present under `Simulation/Wokwi/`; build and simulation validation pending |
| Physical hardware prototype | Not confirmed as built |
| Live web-app-to-device integration | Not implemented/confirmed |
| Adaptive ML | Planned |
| Cloud AI | Planned |
| Hospital dashboard and workflows | Planned |
| TEE integration | Future concept, not implemented |
| Revised proposal | In preparation |
| HackForge presentation | Revised short deck and original reference deck are included |

Statuses should be updated when the corresponding implementation is tested. Screenshots and design files are supporting evidence, not proof that a component works.

## Repository Structure

```text
MediSync/
├── .gitattributes
├── README.md
├── App/                    # Offline web-app source and app instructions
│   ├── README.md
│   ├── index.html
│   ├── scripts/
│   │   ├── app.js
│   │   ├── demo-engine.js
│   │   └── storage.js
│   └── styles.css
├── Assets/
│   ├── Diagrams/Wokwi Simulation/
│   ├── Renders/Desk Version/
│   ├── Renders/Portable Version/
│   └── Screenshots/Offline Based Application Overview/
├── Docs/
│   ├── Presentation/Original ppt/MediSync_Presentation (2).pptx
│   ├── Presentation/Revised ppt/MediSync_HackForge_Logix_Revised.pptx
│   ├── Proposal/MediSync_Proposal.docx
│   ├── architecture.md
│   ├── design-decisions.md
│   ├── hardware-and-bom.md
│   ├── sensing-and-events.md
│   ├── security-and-privacy.md
│   └── project-status-and-validation.md
├── Frimware/
│   └── Esp32/              # Empty placeholder in uploaded archive; spelling retained
├── Hardware/               # Empty placeholder in uploaded archive
├── Simulation/
│   └── Wokwi/              # Project files present; validation pending
│       ├── .gitignore
│       ├── .pio/           # Generated local build output; ignored, not source
│       ├── diagram.json
│       ├── include/medisync/
│       ├── platformio.ini
│       ├── README.md
│       ├── src/
│       └── wokwi.toml
```

The tree reflects the uploaded archive plus the technical Markdown files in this package. `Simulation/Wokwi/.pio/` is generated output included in the ZIP but ignored by the Wokwi-local `.gitignore`; it is not tracked in the archived Git index. Keep it out of commits.

## Supporting technical documentation

- [Architecture](Docs/architecture.md)
- [Design decisions](Docs/design-decisions.md)
- [Hardware and bill of materials](Docs/hardware-and-bom.md)
- [Sensing and event interpretation](Docs/sensing-and-events.md)
- [Security and privacy](Docs/security-and-privacy.md)
- [Project status and validation checklist](Docs/project-status-and-validation.md)

## Running the Offline Web App

To open the offline demonstration, open `App/index.html` in a modern browser as described in `App/README.md`. It uses fictional local demo data and has no connection to the ESP32/Wokwi project.

The web app uses demo/local data and should not be represented as connected to the ESP32 unless that integration has been implemented and tested.

## Safety and Limitations

- A reminder is not proof that a medicine was taken.
- A load-cell or IR event is not proof of ingestion.
- Handling, moving, replacing, or removing packaging can produce ambiguous sensor observations.
- Sensor accuracy, threshold selection, calibration, and packaging compatibility require testing.
- The current software demonstration is not a medical device and does not diagnose, prescribe, or recommend changing treatment.
- AI, cloud, caregiver, hospital, and TEE features remain future work unless a later release documents and verifies them.

## Contributing and Evidence

When adding implementation claims, include reproducible test steps and evidence where possible. Keep documentation synchronized with the firmware and app. Do not label a planned feature as implemented or use simulated results as real-world validation.

## License

No `LICENSE` file is present in the uploaded archive. Agree on the intended license with the project's contributors, then add its full text before publishing or inviting reuse. No license has been selected or added in this documentation package.
