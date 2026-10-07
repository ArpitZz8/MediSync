/* Local persistence only. This adapter makes no network requests. */
(function () {
  const KEY = "medisync.offline-demo.v1";

  function atLocalTime(base, dayOffset, hour, minute) {
    const date = new Date(base);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  }

  function makeSeedState() {
    const now = new Date();
    now.setHours(8, 25, 0, 0);
    const nowIso = now.toISOString();
    const due = new Date(now);
    due.setMinutes(due.getMinutes() + 5);
    const medicines = [
      {
        id: "med-1",
        name: "Metformin XR",
        dosage: "500 mg · 1 tablet",
        packageType: "Bottle",
        slot: "A1",
        times: ["08:30", "20:30"],
        weightProfile: { baseline: 142.8, expectedChange: 0.42, unit: "g" },
        color: "mint"
      },
      {
        id: "med-2",
        name: "Vitamin D3",
        dosage: "1000 IU · 1 capsule",
        packageType: "Bottle",
        slot: "B1",
        times: ["13:00"],
        weightProfile: { baseline: 86.4, expectedChange: 0.58, unit: "g" },
        color: "amber"
      },
      {
        id: "med-3",
        name: "Atorvastatin",
        dosage: "10 mg · 1 tablet",
        packageType: "Blister pack",
        slot: "C1",
        times: ["21:00"],
        weightProfile: { baseline: 24.6, expectedChange: 0.32, unit: "g" },
        color: "blue"
      }
    ];
    const events = [
      {
        id: "seed-yesterday-1",
        at: atLocalTime(now, -1, 8, 34),
        kind: "no_change",
        medicineId: "med-1",
        medicineName: "Metformin XR",
        title: "Container lifted and returned",
        details: "The mock load-cell reading returned to the same weight. No medication event was detected; reminder remains unresolved.",
        status: "Unresolved",
        weightBefore: 142.8,
        weightAfter: 142.8,
        simulated: true
      },
      {
        id: "seed-yesterday-2",
        at: atLocalTime(now, -1, 13, 8),
        kind: "detected_change",
        medicineId: "med-2",
        medicineName: "Vitamin D3",
        title: "Medication event detected",
        details: "Mock weight changed by 0.58 g. This sensor event is not proof that a dose was swallowed.",
        status: "Unverified",
        weightBefore: 86.4,
        weightAfter: 85.82,
        simulated: true
      },
      {
        id: "seed-yesterday-3",
        at: atLocalTime(now, -1, 13, 10),
        kind: "missed",
        medicineId: "med-2",
        medicineName: "Vitamin D3",
        title: "Reminder marked missed",
        details: "The demo reminder reached its unresolved state with no event recorded.",
        status: "Missed",
        simulated: true
      }
    ];
    return {
      version: 1,
      profile: { name: "Sam Taylor", role: "Demo profile", bed: "04", facility: "North Wing" },
      medicines,
      events,
      settings: {
        reminderSound: true,
        ledCue: true,
        caregiverPreview: false,
        timings: { preAlert: 5, firstEscalation: 5, secondEscalation: 10, unresolvedAfter: 15 }
      },
      demoNow: nowIso,
      selectedMedicineId: "med-1",
      currentWeight: 142.8,
      latestEventId: "seed-yesterday-1",
      activeFlow: {
        id: "flow-seed",
        medicineId: "med-1",
        scheduledAt: due.toISOString(),
        stage: "led",
        eventDetected: false,
        startedAt: nowIso
      },
      route: "home"
    };
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return makeSeedState();
      const value = JSON.parse(raw);
      if (!value || value.version !== 1 || !Array.isArray(value.medicines) || !Array.isArray(value.events)) {
        return makeSeedState();
      }
      return value;
    } catch (error) {
      return makeSeedState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (error) { /* Continue with in-memory demo state. */ }
    return makeSeedState();
  }

  window.MediSyncStorage = { read, save, reset, makeSeedState };
})();
