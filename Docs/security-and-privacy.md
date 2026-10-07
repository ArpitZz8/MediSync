# Security and privacy

## Current data handling

- The offline web app stores fictional demo profile, medication, schedule, event, and preference state in browser `localStorage` (`App/scripts/storage.js`). **`localStorage` is unencrypted.** Anyone or any script with access to that browser profile may be able to read it.
- The supplied seed values look like demonstration data. Use no real patient names, medication details, schedules, identifiers, or health information in this prototype.
- The app has no account, backend, caregiver connection, or hardware link in this archive. Its HTML declares a Content Security Policy with `connect-src 'none'`; that is a network restriction for the page, not encryption or a complete security review.
- The ESP32/Wokwi code is an independent offline demonstration. The archive does not show a live cloud, Wi-Fi/Bluetooth, or app-to-device data path.
- AI suggestions, cloud services, caregiver/hospital workflows, encryption-at-rest upgrades, and TEE use are **planned or mock concepts only**. No TEE or AI inference service is implemented.

## Safe use of this prototype

1. Use fictional demo records only.
2. Do not treat the app as a medical record, a secure storage product, or evidence of medication ingestion.
3. Reset the local demo from its UI when finished, and clear browser site data if needed. Resetting is a demo-data cleanup step; it is not a verified secure-erasure process.
4. Avoid screenshots or commits containing personal information. The repository includes demo screenshots and seed data; review any future additions before publishing.

## Before adding real data or connectivity

The team would need to define and review authentication, authorization, consent, encryption in transit and at rest, key management, retention/deletion, backup behavior, device pairing, update integrity, logging, breach response, and a threat model. Evaluate security properties on the actual target platforms; a TEE is hardware/platform-specific and is not a substitute for these controls. Conduct appropriate privacy, security, and legal review before collecting health information or connecting care workflows.

## License choice

No root `LICENSE` file is present in the uploaded archive. Ask the project owners and contributors to agree on the intended license before adding one. Until that choice is made and the license text is committed, do not describe the repository as open source or imply permission to reuse, modify, or redistribute it. This package intentionally leaves the license decision open.
