# Project status and validation checklist

**Snapshot reviewed:** uploaded `MediSync.zip`, 2026-10-07. Status below records what is present in that archive and what is still unverified. No build, app run, or Wokwi simulation was performed for this documentation task; no validation result is claimed.

## Current inventory

| Area | Present in archive | Status / evidence limit |
|---|---|---|
| Project proposal and presentations | `Docs/Proposal/` and `Docs/Presentation/` contain DOCX/PPTX files. | Files are present; this is not a review of their claims or approval status. |
| Assets | Diagrams, desk/portable device renders, and offline-app screenshots are present under `Assets/`. | Rendered images are present; editable 3D models were not found in the archive. |
| Offline web app | HTML, CSS, and JavaScript source under `App/`. | Source is present. The app was not run or independently validated in this task. It uses mock events and unencrypted browser `localStorage`. |
| ESP32/Wokwi project | `diagram.json`, `platformio.ini`, `wokwi.toml`, `src/`, `include/`, and a project README are present under `Simulation/Wokwi/`. | **Validation pending.** File presence and cached build artifacts do not prove a successful build or simulation. |
| `.pio` output | `.pio/` build/dependency files appear in the uploaded ZIP. | `Simulation/Wokwi/.gitignore` contains `.pio/`; Git reports the path ignored, and the archived index has no `.pio` entries. Do not delete local build files. |
| `Frimware/Esp32/` | Empty directory placeholder. | No firmware files were present at this path in the archive; spelling is retained as supplied. |
| `Hardware/` | Empty directory placeholder. | No physical hardware build or verified BOM was supplied. |
| Device-to-app connection | No link/adapter appears in the current files. | Not implemented in the supplied snapshot. |
| Physical device and sensor performance | No verified physical prototype or measured results supplied. | Build, calibration, false-event rate, reliability, and usability remain unverified. |
| AI, cloud, caregiver/hospital workflows, and TEE | Mentioned as future/mock concepts. | Planned only; not implemented. |
| License | No root `LICENSE` file found. | License choice is open; confirm with contributors before adding a license. |

## Validation checklist

### Documentation handoff

- [ ] Review the six Markdown files in `Docs/` and the replacement root `README.md` in this package.
- [ ] Copy the new Markdown files into the existing repository `Docs/` directory; merge with the proposal and presentation subfolders rather than replacing the folder.
- [ ] Replace the root `README.md` with the supplied corrected copy.
- [ ] Apply the supplied `Simulation/Wokwi/README.md` status correction, if desired.
- [ ] Confirm the team has selected a license before adding a `LICENSE` file.

### App and simulation validation

- [ ] Open `App/index.html` following `App/README.md`; record the browser/version and the steps actually checked.
- [ ] Confirm demo reset, reminder timing controls, mock weight-change/no-change paths, and event labels. Use fictional data only.
- [ ] Build the `esp32dev` PlatformIO environment from `Simulation/Wokwi/`, then launch Wokwi and record any failures as well as successful observations.
- [ ] Capture actual serial/OLED evidence for reminder, stable weight-change, no-change, IR-only cue, unresolved timeout, and manual self-report paths. Keep every sensor outcome described as a cue, not ingestion proof.
- [ ] If a physical device is built, document exact part numbers, wiring, calibration method, repeat trials, and false/missed event results before making hardware-performance claims.

### Git and build-artifact handling

The Wokwi-local ignore rule already includes `.pio/`. In the supplied archive, `.pio` is ignored and not tracked. Check the working repository before cleanup:

```sh
git check-ignore -v Simulation/Wokwi/.pio/
git ls-files -- Simulation/Wokwi/.pio/
```

If the second command lists tracked paths, use this command to remove those paths **from Git's index only** while leaving the local build directory in place:

```sh
git rm -r --cached Simulation/Wokwi/.pio
```

In the inspected archive no `.pio` files were tracked, so this cleanup command is not needed for that snapshot. Do not run a filesystem delete for `.pio/` as part of the documentation handoff.
