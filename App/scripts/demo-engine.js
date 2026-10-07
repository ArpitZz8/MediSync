/* Simulated reminder and load-cell behavior. No hardware APIs are called. */
(function () {
  const STAGES = ["led", "scheduled", "escalation1", "escalation2", "unresolved"];

  function id(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 9);
  }

  function getMedicine(state, medicineId) {
    return state.medicines.find((medicine) => medicine.id === medicineId) || state.medicines[0];
  }

  function log(state, event) {
    const fullEvent = Object.assign({ id: id("event"), at: state.demoNow, simulated: true }, event);
    state.events.unshift(fullEvent);
    state.latestEventId = fullEvent.id;
    return fullEvent;
  }

  function stageFor(state, flow) {
    const now = new Date(state.demoNow).getTime();
    const due = new Date(flow.scheduledAt).getTime();
    const deltaMins = (now - due) / 60000;
    if (deltaMins < 0) return "led";
    if (deltaMins < state.settings.timings.firstEscalation) return "scheduled";
    if (deltaMins < state.settings.timings.secondEscalation) return "escalation1";
    if (deltaMins < state.settings.timings.unresolvedAfter) return "escalation2";
    return "unresolved";
  }

  function transition(state, next) {
    const flow = state.activeFlow;
    if (!flow || flow.stage === next) return;
    flow.stage = next;
    const medicine = getMedicine(state, flow.medicineId);
    const eventDetails = {
      led: {
        kind: "reminder", title: Number(state.settings.timings.preAlert || 5) + "-minute LED reminder cue", details: "A reminder light is represented " + Number(state.settings.timings.preAlert || 5) + " simulated minutes before the scheduled alert. No physical LED is connected.", status: "Reminder"
      },
      scheduled: {
        kind: "reminder", title: "Scheduled alert · buzzer represented", details: "The scheduled-time alert is shown in the UI. No physical buzzer is connected.", status: "Reminder"
      },
      escalation1: {
        kind: "escalation", title: "+5 min escalation", details: "A second reminder is represented locally. No message or remote alert was sent.", status: "Escalation"
      },
      escalation2: {
        kind: "escalation", title: "+10 min escalation", details: "A final reminder is represented locally. If still unacknowledged, the demo moves to unresolved.", status: "Escalation"
      },
      unresolved: {
        kind: "missed", title: "Reminder unresolved / missed", details: "The reminder reached its unresolved state after the final escalation. A weight change would still not confirm ingestion.", status: "Unresolved"
      }
    }[next];
    log(state, Object.assign({ medicineId: medicine.id, medicineName: medicine.name }, eventDetails));
  }

  function syncStage(state) {
    if (!state.activeFlow || state.activeFlow.stage === "unresolved") return;
    const next = stageFor(state, state.activeFlow);
    const currentIndex = STAGES.indexOf(state.activeFlow.stage);
    const nextIndex = STAGES.indexOf(next);
    for (let index = currentIndex + 1; index <= nextIndex; index += 1) {
      transition(state, STAGES[index]);
    }
  }

  function createReminder(state, medicineId) {
    const medicine = getMedicine(state, medicineId || state.selectedMedicineId);
    state.selectedMedicineId = medicine.id;
    const due = new Date(state.demoNow);
    due.setMinutes(due.getMinutes() + Number(state.settings.timings.preAlert || 5));
    state.activeFlow = {
      id: id("flow"), medicineId: medicine.id, scheduledAt: due.toISOString(), stage: "led", eventDetected: false, startedAt: state.demoNow
    };
    state.currentWeight = medicine.weightProfile.baseline;
    log(state, {
      kind: "reminder", medicineId: medicine.id, medicineName: medicine.name,
      title: Number(state.settings.timings.preAlert || 5) + "-minute LED reminder cue", details: "Reminder flow started in demo mode. Scheduled alert is in " + Number(state.settings.timings.preAlert || 5) + " simulated minutes; the LED is only represented on screen.", status: "Reminder"
    });
    return state;
  }

  function advance(state, minutes) {
    const now = new Date(state.demoNow);
    now.setMinutes(now.getMinutes() + Number(minutes || 1));
    state.demoNow = now.toISOString();
    syncStage(state);
    return state;
  }

  function recordNoChange(state) {
    const medicine = getMedicine(state, state.selectedMedicineId);
    const weight = medicine.weightProfile.baseline;
    state.currentWeight = weight;
    log(state, {
      kind: "no_change", medicineId: medicine.id, medicineName: medicine.name,
      title: "Container lifted and returned", details: "Mock weight stayed at " + weight.toFixed(2) + " g. No medication event was detected; the reminder stays unresolved.",
      status: "Unresolved", weightBefore: weight, weightAfter: weight
    });
    if (state.activeFlow && state.activeFlow.medicineId === medicine.id) state.activeFlow.eventDetected = false;
    return state;
  }

  function recordChange(state) {
    const medicine = getMedicine(state, state.selectedMedicineId);
    const before = Number(medicine.weightProfile.baseline);
    const delta = Number(medicine.weightProfile.expectedChange);
    const after = Math.max(0, before - delta);
    state.currentWeight = after;
    log(state, {
      kind: "detected_change", medicineId: medicine.id, medicineName: medicine.name,
      title: "Medication event detected", details: "Mock load-cell reading changed by " + delta.toFixed(2) + " g (" + before.toFixed(2) + " g → " + after.toFixed(2) + " g). This is not proof that a dose was swallowed.",
      status: "Unverified", weightBefore: before, weightAfter: after
    });
    if (state.activeFlow && state.activeFlow.medicineId === medicine.id) state.activeFlow.eventDetected = true;
    return state;
  }

  function markLatestUnresolved(state) {
    const event = state.events.find((item) => item.id === state.latestEventId && ["no_change", "detected_change", "reminder", "escalation", "missed"].includes(item.kind));
    if (event) event.status = "Unresolved";
    const medicine = getMedicine(state, state.selectedMedicineId);
    log(state, {
      kind: "unresolved", medicineId: medicine.id, medicineName: medicine.name,
      title: "Event marked unresolved", details: "Presenter action in offline demo. No ingestion confirmation is available.", status: "Unresolved"
    });
    if (state.activeFlow && state.activeFlow.medicineId === medicine.id) state.activeFlow.stage = "unresolved";
    return state;
  }

  function replaceProfile(state, medicineId, baseline, expectedChange) {
    const medicine = getMedicine(state, medicineId);
    medicine.weightProfile = { baseline: Number(baseline), expectedChange: Number(expectedChange), unit: "g" };
    if (state.selectedMedicineId === medicine.id) state.currentWeight = Number(baseline);
    log(state, {
      kind: "system", medicineId: medicine.id, medicineName: medicine.name,
      title: "Container profile refreshed", details: "New package weight saved to slot " + medicine.slot + ". The registered slot remains the same; no RFID retagging is needed in this demo.", status: "Profile updated"
    });
    return state;
  }

  window.MediSyncDemo = { createReminder, advance, recordNoChange, recordChange, markLatestUnresolved, replaceProfile, syncStage, log };
})();
