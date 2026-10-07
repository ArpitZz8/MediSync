(function () {
  const app = document.getElementById("app");
  let state = MediSyncStorage.read();
  if (!state.medicines.length) state = MediSyncStorage.makeSeedState();
  state.profile = Object.assign({ name: "Sam Taylor", role: "Demo profile", bed: "04", facility: "North Wing" }, state.profile || {});
  state.settings = Object.assign({ reminderSound: true, ledCue: true, caregiverPreview: false }, state.settings || {});
  state.settings.timings = Object.assign({ preAlert: 5, firstEscalation: 5, secondEscalation: 10, unresolvedAfter: 15 }, state.settings.timings || {});
  let toastTimer = null;
  const pages = {
    home: { title: "Overview", eyebrow: "Today at a glance" },
    medicines: { title: "Medicines", eyebrow: "Local medicine register" },
    device: { title: "Device & events", eyebrow: "Simulated sensor workspace" },
    history: { title: "Adherence history", eyebrow: "Reminders and recorded events" },
    caregiver: { title: "Caregiver preview", eyebrow: "Planned · simulated view" },
    hospital: { title: "Hospital dashboard", eyebrow: "Planned · simulated view" },
    ai: { title: "Local AI concept", eyebrow: "Mock feature · no model included" },
    privacy: { title: "Profile & privacy", eyebrow: "Local settings and future safeguards" }
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function localDate(value) {
    return new Date(value);
  }

  function dateLabel(value, options) {
    return localDate(value).toLocaleDateString(undefined, options || { weekday: "short", day: "numeric", month: "short" });
  }

  function timeLabel(value) {
    return localDate(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function initials(value) {
    return String(value || "M").trim().split(/\s+/).slice(0, 2).map((piece) => piece[0] || "").join("").toUpperCase();
  }

  function currentMedicine() {
    return state.medicines.find((medicine) => medicine.id === state.selectedMedicineId) || state.medicines[0];
  }

  function saveState() {
    MediSyncStorage.save(state);
  }

  function render() {
    if (!pages[state.route]) state.route = "home";
    const page = pages[state.route];
    const now = localDate(state.demoNow);
    app.innerHTML = `
      <aside class="sidebar ${state.mobileNav ? "sidebar-open" : ""}" aria-label="Main navigation">
        <div class="brand-lockup">
          <div class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4.5c-5.4 0-9.8 4.4-9.8 9.8v8.2c0 2.8 2.2 5 5 5h9.6c2.8 0 5-2.2 5-5v-8.2c0-5.4-4.4-9.8-9.8-9.8Z"/><path d="M16 9v13M9.5 15.5h13"/></svg></div>
          <div><div class="brand-name">MediSync</div><div class="brand-subtitle">MEDICATION COMPANION</div></div>
        </div>
        <div class="side-demo-label"><span class="status-dot"></span> Offline demo</div>
        <nav class="nav-list">
          ${navGroup("WORKSPACE", [
            ["home", "Overview", icon("grid")], ["medicines", "Medicines", icon("capsule")], ["device", "Device & events", icon("scale")], ["history", "Adherence history", icon("timeline")]
          ])}
          ${navGroup("CONCEPT VIEWS", [
            ["caregiver", "Caregiver preview", icon("people"), "Planned"], ["hospital", "Hospital dashboard", icon("building"), "Planned"], ["ai", "Local AI concept", icon("spark"), "Mock"]
          ])}
          ${navGroup("PREFERENCES", [["privacy", "Profile & privacy", icon("shield")]])}
        </nav>
        <div class="sidebar-bottom">
          <div class="device-mini"><div class="device-mini-icon">${icon("chip")}</div><div><strong>ESP32 link</strong><small>Not connected</small></div><span class="device-mini-state"></span></div>
          <div class="sidebar-profile"><div class="avatar">${escapeHtml(initials(state.profile.name))}</div><div class="profile-brief"><strong>${escapeHtml(state.profile.name)}</strong><small>Local demo profile</small></div><button class="icon-button sidebar-settings" data-route="privacy" aria-label="Open profile and privacy">${icon("settings")}</button></div>
        </div>
      </aside>
      <div class="app-main">
        <header class="topbar">
          <button class="mobile-menu icon-button" data-action="toggle-nav" aria-label="Open navigation">${icon("menu")}</button>
          <div class="breadcrumb"><span>MEDISYNC</span><i>/</i><strong>${escapeHtml(page.title)}</strong></div>
          <div class="topbar-actions">
            <div class="offline-pill"><span class="status-dot"></span> Saved on this device</div>
            <button class="button button-primary button-small" data-action="open-demo">${icon("play")} Demo controls</button>
          </div>
        </header>
        <main class="content-area">
          <div class="page-heading"><div><div class="eyebrow">${escapeHtml(page.eyebrow)}</div><h1>${escapeHtml(page.title)}</h1></div><div class="date-pill">${icon("clock")} <span>Demo time</span><strong>${timeLabel(state.demoNow)}</strong><i>·</i><span>${dateLabel(state.demoNow)}</span></div></div>
          ${renderPage()}
          <footer class="footer-note"><span>MEDISYNC · IDEATHON VISUAL PROTOTYPE</span><span>Sensor events describe package-weight changes only. They do not verify ingestion.</span></footer>
        </main>
      </div>
      ${state.modal ? renderModal() : ""}
      ${state.demoOpen ? renderDemoPanel() : ""}
      ${state.toast ? `<div class="toast" role="status">${icon("check")} ${escapeHtml(state.toast)}</div>` : ""}
    `;
  }

  function navGroup(label, entries) {
    return `<div class="nav-group"><div class="nav-group-title">${label}</div>${entries.map(([route, title, glyph, badge]) => `
      <button class="nav-item ${state.route === route ? "active" : ""}" data-route="${route}" ${state.route === route ? 'aria-current="page"' : ""}>
        <span class="nav-icon">${glyph}</span><span class="nav-label">${title}</span>${badge ? `<span class="nav-badge">${badge}</span>` : ""}
      </button>`).join("")}</div>`;
  }

  function renderPage() {
    return {
      home: renderHome,
      medicines: renderMedicines,
      device: renderDevice,
      history: renderHistory,
      caregiver: renderCaregiver,
      hospital: renderHospital,
      ai: renderAI,
      privacy: renderPrivacy
    }[state.route]();
  }

  function todaySchedule() {
    return state.medicines.flatMap((medicine) => medicine.times.map((time) => ({ medicine, time, stamp: scheduleStamp(time) })))
      .sort((a, b) => a.stamp - b.stamp);
  }

  function scheduleStamp(time) {
    const date = localDate(state.demoNow);
    const parts = String(time).split(":").map(Number);
    date.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
    return date.getTime();
  }

  function scheduleStatus(item) {
    const flow = state.activeFlow;
    if (flow && flow.medicineId === item.medicine.id) {
      const due = new Date(flow.scheduledAt).getTime();
      const now = new Date(state.demoNow).getTime();
      if (now <= due + (Number(state.settings.timings.unresolvedAfter) || 15) * 60000) {
        return flow.stage === "unresolved" ? ["Unresolved", "tone-rose"] : ["Reminder active", "tone-amber"];
      }
    }
    if (item.stamp < new Date(state.demoNow).getTime()) return ["Schedule passed", "tone-muted"];
    return ["Upcoming", "tone-green"];
  }

  function todayEventCount() {
    const date = new Date(state.demoNow);
    return state.events.filter((event) => {
      const at = new Date(event.at);
      return at.getFullYear() === date.getFullYear() && at.getMonth() === date.getMonth() && at.getDate() === date.getDate() && ["no_change", "detected_change"].includes(event.kind);
    }).length;
  }

  function unresolvedCount() {
    return state.events.filter((event) => event.status === "Unresolved" || event.kind === "no_change").length;
  }

  function renderHome() {
    const schedule = todaySchedule();
    const flow = state.activeFlow;
    const med = flow && state.medicines.find((item) => item.id === flow.medicineId);
    const next = schedule.find((item) => item.stamp >= new Date(state.demoNow).getTime()) || schedule[0];
    const latest = state.events.slice(0, 3);
    return `
      <section class="welcome-strip"><div class="welcome-icon">${icon("sun")}</div><div><strong>Good morning, ${escapeHtml(state.profile.name.split(" ")[0] || "there")}</strong><span>Your local demo is ready. Today's events are simulated on this device.</span></div><span class="demo-tag">SIMULATED DATA</span></section>
      <section class="metric-grid">
        ${metricCard(icon("calendar"), "Today's schedule", String(schedule.length).padStart(2, "0"), "planned reminders", "metric-mint")}
        ${metricCard(icon("pulse"), "Adherence summary", `${todayEventCount()}/${schedule.length}`, "events logged · not dose proof", "metric-blue")}
        ${metricCard(icon("alert"), "Unresolved", String(unresolvedCount()).padStart(2, "0"), "across demo history", "metric-amber")}
      </section>
      <div class="home-grid">
        <section class="card schedule-card">
          <div class="section-head"><div><div class="eyebrow">${dateLabel(state.demoNow, { weekday: "long" }).toUpperCase()} · TODAY</div><h2>Medication schedule</h2></div><button class="text-button" data-route="medicines">Manage medicines ${icon("arrow")}</button></div>
          <div class="schedule-list">${schedule.map((item) => {
            const [status, tone] = scheduleStatus(item);
            const active = flow && flow.medicineId === item.medicine.id && status === "Reminder active";
            return `<div class="schedule-row ${active ? "schedule-active" : ""}"><div class="schedule-time">${escapeHtml(item.time)}</div><div class="schedule-time-line"><span></span></div><div class="medicine-bullet ${item.medicine.color}">${icon("capsule")}</div><div class="schedule-detail"><strong>${escapeHtml(item.medicine.name)}</strong><span>${escapeHtml(item.medicine.dosage)} <i>·</i> ${escapeHtml(item.medicine.slot)}</span></div><span class="status-chip ${tone}">${escapeHtml(status)}</span></div>`;
          }).join("")}</div>
          <div class="schedule-foot"><span>${icon("info")} Schedule times are sample data; follow a clinician's directions.</span><button class="button button-quiet button-small" data-action="open-demo">Advance demo time</button></div>
        </section>
        <section class="card reminder-card">
          <div class="section-head"><div><div class="eyebrow">REMINDER FLOW</div><h2>${flow ? "Next reminder" : "Reminder status"}</h2></div><span class="signal-label"><span class="status-dot"></span> Demo</span></div>
          ${flow && med ? renderReminderSummary(med, flow) : `<div class="empty-state compact"><div class="empty-icon">${icon("bell")}</div><strong>No active reminder</strong><span>Start a reminder flow to see the LED and buzzer states.</span><button class="button button-primary" data-action="start-reminder">${icon("play")} Start reminder demo</button></div>`}
          <div class="device-state-line"><div class="device-led"><span></span></div><div><strong>LED cue</strong><small>${state.settings.ledCue ? "Represented in UI" : "Disabled in preferences"}</small></div><div class="device-buzzer">${icon("sound")}</div><div><strong>Buzzer</strong><small>${state.settings.reminderSound ? "Represented in UI" : "Muted in preferences"}</small></div></div>
        </section>
        <section class="card sensor-summary-card">
          <div class="section-head"><div><div class="eyebrow">SIMULATED LOAD CELL</div><h2>Sensor snapshot</h2></div><span class="not-connected"><span></span> Not connected</span></div>
          ${renderWeightSnapshot(currentMedicine())}
          <div class="card-footer-link"><span>Mock reading · ${escapeHtml(currentMedicine().name)}</span><button class="text-button" data-route="device">Open event view ${icon("arrow")}</button></div>
        </section>
        <section class="card activity-card">
          <div class="section-head"><div><div class="eyebrow">LOCAL TIMELINE</div><h2>Recent activity</h2></div><button class="text-button" data-route="history">View history ${icon("arrow")}</button></div>
          ${latest.length ? `<div class="compact-events">${latest.map(eventRow).join("")}</div>` : emptyLine("No events yet", "Start the demo to add local sample activity.")}
          <div class="disclaimer-inline">${icon("shield")} A detected weight change is not proof of ingestion.</div>
        </section>
      </div>`;
  }

  function metricCard(glyph, title, number, detail, tone) {
    return `<article class="metric-card ${tone}"><div class="metric-top"><span>${glyph}</span><small>LOCAL DEMO</small></div><div class="metric-number">${escapeHtml(number)}</div><div class="metric-title">${escapeHtml(title)}</div><div class="metric-detail">${escapeHtml(detail)}</div></article>`;
  }

  function renderReminderSummary(medicine, flow) {
    const dueTime = timeLabel(flow.scheduledAt);
    const minutesLeft = Math.max(0, Math.ceil((new Date(flow.scheduledAt).getTime() - new Date(state.demoNow).getTime()) / 60000));
    const stageText = {
      led: "LED reminder cue",
      scheduled: "Scheduled buzzer alert",
      escalation1: "+5 min escalation",
      escalation2: "+10 min escalation",
      unresolved: "Reminder unresolved"
    }[flow.stage] || "Reminder active";
    const remaining = flow.stage === "led" ? `${minutesLeft} min until scheduled alert` : stageText;
    const timings = state.settings.timings;
    const stageOffset = { led: `−${timings.preAlert}`, scheduled: "NOW", escalation1: `+${timings.firstEscalation}`, escalation2: `+${timings.secondEscalation}`, unresolved: "MISS" }[flow.stage] || `−${timings.preAlert}`;
    return `<div class="reminder-summary"><div class="reminder-time"><div class="reminder-clock">${icon("bell")}</div><div><span>${escapeHtml(stageText)}</span><strong>${escapeHtml(dueTime)}</strong><small>${escapeHtml(remaining)}</small></div><div class="reminder-counter">${stageOffset}<small>DEMO MIN</small></div></div><div class="flow-steps">${reminderSteps(flow.stage)}</div><div class="reminder-med"><span class="medicine-bullet ${medicine.color}">${icon("capsule")}</span><div><strong>${escapeHtml(medicine.name)}</strong><small>${escapeHtml(medicine.dosage)}</small></div><span class="sim-tag">SIMULATED</span></div><button class="button button-outline full-width" data-action="open-demo">Advance flow in demo controls ${icon("arrow")}</button></div>`;
  }

  function reminderSteps(stage) {
    const timings = state.settings.timings;
    const names = [[`−${timings.preAlert} min`, "LED cue"], ["Due", "Buzzer"], [`+${timings.firstEscalation} min`, "Escalate"], [`+${timings.secondEscalation} min`, "Escalate"], [`+${timings.unresolvedAfter} min`, "Unresolved"]];
    const activeIndex = { led: 0, scheduled: 1, escalation1: 2, escalation2: 3, unresolved: 4 }[stage] || 0;
    return names.map(([time, label], index) => `<div class="flow-step ${index < activeIndex ? "step-done" : ""} ${index === activeIndex ? "step-current" : ""}"><span class="step-marker">${index < activeIndex ? icon("check") : ""}</span><small>${time}</small><span>${label}</span></div>`).join("");
  }

  function renderWeightSnapshot(medicine) {
    const baseline = Number(medicine.weightProfile.baseline);
    const reading = state.selectedMedicineId === medicine.id ? Number(state.currentWeight) : baseline;
    const diff = Math.max(0, baseline - reading);
    const percent = baseline ? Math.min(100, (reading / baseline) * 100) : 0;
    return `<div class="weight-readout"><div><span class="weight-number">${reading.toFixed(2)}<small> g</small></span><span class="weight-caption">Current mock reading</span></div><div class="weight-mini-bars"><i style="height:${Math.max(14, percent * .5)}%"></i><i style="height:${Math.max(14, percent * .67)}%"></i><i style="height:${Math.max(14, percent * .8)}%"></i><i style="height:${Math.max(14, percent)}%"></i><i style="height:${Math.max(14, percent * .88)}%"></i><i style="height:${Math.max(14, percent * .94)}%"></i><i style="height:${Math.max(14, percent * .75)}%"></i><i style="height:${Math.max(14, percent * .82)}%"></i></div></div><div class="weight-baseline"><span>Package baseline <strong>${baseline.toFixed(2)} g</strong></span><span>Change <strong class="${diff ? "weight-diff" : ""}">${diff ? "−" + diff.toFixed(2) : "0.00"} g</strong></span></div>`;
  }

  function renderMedicines() {
    const count = state.medicines.length;
    return `<div class="page-intro-row"><div><h2>Your registered packages</h2><p>Each medicine is linked to a saved package profile and physical position in the demo.</p></div><button class="button button-primary" data-action="add-medicine">${icon("plus")} Add medicine</button></div>
      <div class="medicine-grid">${state.medicines.map((medicine) => `<article class="card medicine-card"><div class="medicine-card-head"><span class="medicine-art ${medicine.color}">${icon("capsule")}</span><button class="more-button" data-action="replace-package" data-id="${escapeHtml(medicine.id)}">Replace package ${icon("refresh")}</button></div><h3>${escapeHtml(medicine.name)}</h3><p class="medicine-dosage">${escapeHtml(medicine.dosage)}</p><div class="medicine-tags"><span>${icon("box")} ${escapeHtml(medicine.packageType)}</span><span>${icon("pin")} Slot ${escapeHtml(medicine.slot)}</span></div><div class="medicine-info-grid"><div><small>SCHEDULE</small><strong>${medicine.times.map(escapeHtml).join(" · ")}</strong></div><div><small>PACKAGE PROFILE</small><strong>${Number(medicine.weightProfile.baseline).toFixed(2)} g baseline</strong></div></div><div class="medicine-profile-foot"><span>Expected per-event change</span><strong>≈ ${Number(medicine.weightProfile.expectedChange).toFixed(2)} g</strong></div><div class="medicine-card-actions"><button class="button button-quiet button-small" data-action="select-medicine" data-id="${escapeHtml(medicine.id)}">Use in sensor demo</button><button class="button button-outline button-small" data-action="start-reminder" data-id="${escapeHtml(medicine.id)}">${icon("bell")} Reminder</button></div></article>`).join("")}</div>
      <div class="info-banner">${icon("info")}<div><strong>Package replacement doesn't require RFID retagging in this concept.</strong><span>Keep the same slot association and refresh its saved weight profile when a container is replaced. This is a local app mock, not a physical tag workflow.</span></div></div>
      <div class="section-footnote">${count} sample package${count === 1 ? "" : "s"} · Stored in this browser only</div>`;
  }

  function renderDevice() {
    const medicine = currentMedicine();
    const latest = state.events.find((event) => event.medicineId === medicine.id && ["detected_change", "no_change"].includes(event.kind));
    const reading = Number(state.currentWeight);
    const base = Number(medicine.weightProfile.baseline);
    return `<div class="device-banner"><div class="device-banner-icon">${icon("chip")}</div><div><strong>Simulated sensor · no ESP32 connected</strong><span>The reading below is generated by local demo controls. It is not live hardware data.</span></div><span class="status-chip tone-amber">DEMO MODE</span></div>
      <div class="device-layout"><section class="card sensor-card"><div class="section-head"><div><div class="eyebrow">LOAD-CELL VIEW</div><h2>Package weight monitor</h2></div><label class="select-wrap">Medicine<select data-change="medicine">${state.medicines.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === medicine.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label></div>
        <div class="sensor-main-reading"><div class="sensor-gauge"><svg viewBox="0 0 220 124" aria-label="Illustrative weight gauge"><path class="gauge-track" d="M24 106a86 86 0 0 1 172 0"/><path class="gauge-value" d="M24 106a86 86 0 0 1 172 0" style="stroke-dasharray:${Math.round(Math.max(0, Math.min(1, reading / Math.max(base * 1.25, 1))) * 270)} 270"/><circle cx="110" cy="106" r="6"/></svg><div class="gauge-number">${reading.toFixed(2)} <small>g</small></div><div class="gauge-label">MOCK LOAD-CELL READING</div></div><div class="sensor-values"><div><span>Package baseline</span><strong>${base.toFixed(2)} g</strong></div><div><span>Expected medication-related change</span><strong>≈ ${Number(medicine.weightProfile.expectedChange).toFixed(2)} g</strong></div><div><span>Last observed state</span><strong>${latest ? escapeHtml(latest.status) : "Waiting for demo"}</strong></div><div><span>Source</span><strong><span class="source-pill"><i></i> Simulated</span></strong></div></div></div>
        <div class="sensor-controls"><div class="controls-label">PRESENTER CONTROLS</div><div class="control-button-row"><button class="button button-primary" data-action="simulate-change">${icon("pulse")} Simulate weight change</button><button class="button button-outline" data-action="simulate-no-change">${icon("refresh")} Lift + return, same weight</button><button class="button button-quiet" data-action="mark-unresolved">${icon("alert")} Mark event unresolved</button></div><small>Every control records a local simulated event. A weight change is not evidence that medication was swallowed.</small></div>
      </section><section class="card sensor-side-card"><div class="eyebrow">WHAT THIS MEANS</div><h2>Event state</h2><div class="event-state-box ${latest && latest.kind === "detected_change" ? "state-change" : "state-waiting"}"><div class="event-state-icon">${icon(latest && latest.kind === "detected_change" ? "pulse" : "scale")}</div><strong>${latest ? escapeHtml(latest.title) : "No current event"}</strong><span>${latest ? escapeHtml(latest.details) : "Use the controls to create an example sensor event."}</span><span class="status-chip ${latest && latest.status === "Unresolved" ? "tone-rose" : "tone-blue"}">${latest ? escapeHtml(latest.status) : "Ready"}</span></div><div class="same-weight-example"><div class="example-label">EXAMPLE · SAME WEIGHT</div><div class="example-equation"><span>${base.toFixed(2)} g</span><i>→</i><span>${base.toFixed(2)} g</span><b class="tone-rose">Unresolved</b></div><p>If a container is lifted and returned at the same weight, there is no sensed change to record. The reminder remains unresolved.</p></div></section></div>
      <section class="card architecture-card"><div><div class="eyebrow">PLANNED HARDWARE PATH</div><h2>ESP32 → load cell → app</h2><p>The Wokwi/ESP32 integration is a separate prototype track. This view currently receives no Bluetooth, Wi-Fi, or sensor data.</p></div><div class="architecture-flow"><span>HX711</span><i>${icon("arrow")}</i><span>ESP32</span><i>${icon("arrow")}</i><span class="architecture-current">Offline UI</span></div></section>`;
  }

  function renderHistory() {
    const filter = state.historyFilter || "all";
    const filtered = state.events.filter((event) => {
      if (filter === "unresolved") return event.status === "Unresolved" || event.kind === "no_change";
      if (filter === "missed") return event.kind === "missed";
      if (filter === "detected") return event.kind === "detected_change";
      if (filter === "reminders") return ["reminder", "escalation", "missed"].includes(event.kind);
      return true;
    });
    const counts = {
      detected: state.events.filter((event) => event.kind === "detected_change").length,
      unresolved: unresolvedCount(),
      missed: state.events.filter((event) => event.kind === "missed").length
    };
    return `<section class="history-summary-grid"><div class="card history-summary"><span class="history-summary-icon blue">${icon("pulse")}</span><div><strong>${counts.detected}</strong><span>Weight changes recorded</span></div></div><div class="card history-summary"><span class="history-summary-icon amber">${icon("alert")}</span><div><strong>${counts.unresolved}</strong><span>Unresolved examples</span></div></div><div class="card history-summary"><span class="history-summary-icon rose">${icon("bell")}</span><div><strong>${counts.missed}</strong><span>Missed reminders</span></div></div></section>
      <section class="card history-card"><div class="section-head"><div><div class="eyebrow">LOCAL EVENT LOG</div><h2>Timeline</h2></div><span class="sim-tag">SIMULATED EVENTS</span></div><div class="filter-row">${[["all", "All activity"], ["reminders", "Reminders"], ["detected", "Detected changes"], ["unresolved", "Unresolved"], ["missed", "Missed"]].map(([key, label]) => `<button class="filter-chip ${filter === key ? "filter-active" : ""}" data-action="filter-history" data-filter="${key}">${label}</button>`).join("")}</div>
      ${filtered.length ? `<div class="history-timeline">${filtered.map((event) => `<article class="timeline-item"><div class="timeline-rail"><span class="timeline-icon ${event.kind}">${icon(event.kind === "detected_change" ? "pulse" : event.kind === "missed" || event.kind === "unresolved" ? "alert" : event.kind === "reminder" || event.kind === "escalation" ? "bell" : "scale")}</span></div><div class="timeline-content"><div class="timeline-top"><div><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.medicineName || "MediSync demo")}${event.medicineName ? " · " : ""}${dateLabel(event.at, { weekday: "short", day: "numeric", month: "short" })} at ${timeLabel(event.at)}</span></div><span class="status-chip ${event.status === "Unresolved" || event.status === "Missed" ? "tone-rose" : event.kind === "detected_change" ? "tone-blue" : "tone-green"}">${escapeHtml(event.status || "Recorded")}</span></div><p>${escapeHtml(event.details)}</p><span class="event-source">${icon("chip")} Simulated · saved locally</span></div></article>`).join("")}</div>` : emptyLine("Nothing in this filter", "Use demo controls to create a local reminder or sensor event.")}
      <div class="history-note">${icon("info")} History is an event log for the prototype. It does not prove medication was taken.</div></section>`;
  }

  function renderCaregiver() {
    const active = state.activeFlow;
    const medicine = active && state.medicines.find((item) => item.id === active.medicineId);
    return `<div class="planned-banner">${icon("spark")}<div><strong>Planned concept · simulated offline preview</strong><span>No caregiver account, network connection, or remote alert service is active.</span></div><span class="planned-stamp">NOT LIVE</span></div>
      <div class="caregiver-layout"><section class="card caregiver-preview-card"><div class="preview-window-top"><div class="preview-dots"><i></i><i></i><i></i></div><span>Caregiver view · mock</span><span class="preview-local">LOCAL ONLY</span></div><div class="caregiver-header"><div class="avatar large">${escapeHtml(initials(state.profile.name))}</div><div><div class="eyebrow">PATIENT PROFILE · DEMO</div><h2>${escapeHtml(state.profile.name)}</h2><p>Bed ${escapeHtml(state.profile.bed)} · ${escapeHtml(state.profile.facility)}</p></div><span class="status-chip tone-green">Demo profile</span></div><div class="caregiver-alert ${active && active.stage === "unresolved" ? "alert-unresolved" : ""}"><div class="alert-icon">${icon(active && active.stage === "unresolved" ? "alert" : "bell")}</div><div><small>${active ? escapeHtml(timeLabel(active.scheduledAt)) : "TODAY · SCHEDULE PREVIEW"}</small><strong>${active && medicine ? `${escapeHtml(medicine.name)} reminder ${active.stage === "unresolved" ? "unresolved" : "in progress"}` : "Next reminder: 08:30 · Metformin XR"}</strong><span>${active ? "Simulated reminder state · no alert was sent to anyone." : "A future caregiver view could surface a planned reminder."}</span></div><span class="status-chip tone-amber">${active ? escapeHtml(active.stage.replace("_", " ")) : "Preview"}</span></div><div class="caregiver-events"><div class="eyebrow">RECENT EVENT PREVIEW</div>${state.events.slice(0, 2).map((event) => `<div class="caregiver-event"><span class="caregiver-event-dot ${event.kind}"></span><div><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.medicineName || "Local demo")} · ${timeLabel(event.at)}</small></div><span>${escapeHtml(event.status || "Recorded")}</span></div>`).join("") || emptyLine("No sample activity", "Start the reminder demo to preview the event feed.")}</div><button class="button button-outline" data-action="preview-caregiver">${icon("eye")} Add a local alert preview</button></section>
      <aside class="caregiver-side"><section class="card"><span class="concept-icon mint">${icon("shield")}</span><div class="eyebrow">USER-CONTROLLED</div><h3>Sharing stays opt-in</h3><p>In a future version, the patient would choose whether to share reminders and event history with an authorized caregiver.</p><div class="toggle-summary"><span>Preview preference</span><strong>${state.settings.caregiverPreview ? "On · local mock" : "Off"}</strong></div><button class="text-button" data-route="privacy">Review local preferences ${icon("arrow")}</button></section><section class="card"><div class="eyebrow">CURRENT LIMIT</div><h3>No remote delivery</h3><p>This screen only renders a mock caregiver experience inside this browser. It sends no notification, message, or patient data.</p><span class="status-chip tone-muted">Future integration</span></section></aside></div>`;
  }

  function renderHospital() {
    const schedule = todaySchedule();
    return `<div class="planned-banner planned-banner-blue">${icon("building")}<div><strong>Planned concept · simulated dashboard</strong><span>No hospital system, patient record, or bed monitor is connected to this prototype.</span></div><span class="planned-stamp">NOT LIVE</span></div><section class="hospital-overview-grid"><article class="card hospital-patient-card"><div class="hospital-card-top"><span class="concept-icon blue">${icon("people")}</span><span class="status-chip tone-blue">SAMPLE PATIENT</span></div><div class="eyebrow">PATIENT / BED STATUS</div><h2>${escapeHtml(state.profile.name)}</h2><p>${escapeHtml(state.profile.facility)} · Bed ${escapeHtml(state.profile.bed)}</p><div class="patient-status-row"><span class="patient-status-dot"></span><span>Profile loaded locally</span><small>Not a live admission</small></div></article><article class="card hospital-stat-card"><div class="eyebrow">TODAY'S PLANNED SCHEDULE</div><strong>${schedule.length}</strong><span>sample reminder slots</span><div class="mini-slot-row">${schedule.slice(0, 4).map((item) => `<span><i></i>${escapeHtml(item.time)}</span>`).join("")}</div></article><article class="card hospital-stat-card"><div class="eyebrow">RECENT EVENTS</div><strong>${state.events.length}</strong><span>local demo entries</span><div class="hospital-status-strip">${icon("history")} Audit trail shown below</div></article></section><section class="card hospital-audit-card"><div class="section-head"><div><div class="eyebrow">AUDIT TRAIL</div><h2>Recent local event records</h2></div><span class="sim-tag">MOCK DATA</span></div>${state.events.slice(0, 5).map((event) => `<div class="audit-row"><span class="audit-time">${dateLabel(event.at, { month: "short", day: "numeric" })} · ${timeLabel(event.at)}</span><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.medicineName || "Local event")}</span><span class="status-chip ${event.status === "Unresolved" || event.status === "Missed" ? "tone-rose" : "tone-blue"}">${escapeHtml(event.status || "Recorded")}</span></div>`).join("") || emptyLine("No audit entries", "Use the demo controls to record simulated events.")}<div class="history-note">${icon("shield")} This screen illustrates a possible future dashboard. No hospital data is transmitted.</div></section>`;
  }

  function renderAI() {
    const suggestionUsed = Boolean(state.aiSuggestionUsed);
    const nextTime = todaySchedule().find((item) => item.time === "20:30") || todaySchedule()[0];
    return `<div class="planned-banner planned-banner-purple">${icon("spark")}<div><strong>Visual mock only · no AI model is embedded</strong><span>This page illustrates a local-first design direction. It does not generate clinical advice.</span></div><span class="planned-stamp">CONCEPT</span></div><div class="ai-layout"><section class="card ai-concept-card"><div class="ai-card-head"><span class="ai-orbit">${icon("spark")}</span><div><div class="eyebrow">LOCAL-FIRST ARCHITECTURE</div><h2>Suggestions that stay on-device</h2><p>A future model could use a user's local reminder history and preferences to suggest a better reminder window.</p></div></div><div class="architecture-layers"><div><span class="layer-number">01</span><div><strong>Local profile</strong><small>Preferences and schedules stored in this browser</small></div><span class="status-chip tone-green">Local</span></div><div><span class="layer-number">02</span><div><strong>Adaptive reminder logic</strong><small>Example rule-based mock, no trained model</small></div><span class="status-chip tone-muted">Planned</span></div><div><span class="layer-number">03</span><div><strong>Optional local model</strong><small>Future architecture choice; not bundled here</small></div><span class="status-chip tone-muted">Future</span></div></div></section><section class="card suggestion-card"><div class="suggestion-label"><span>${icon("spark")} DEMO SUGGESTION</span><span class="mock-label">MOCK</span></div><div class="suggestion-avatar">${icon("sun")}</div><h3>Try an earlier evening cue</h3><p>Example only: a reminder 15 minutes before the evening slot could give more time to respond.</p><div class="suggestion-context"><span>Based on</span><strong>Sample schedule · no personal analytics</strong></div><button class="button button-primary full-width" data-action="use-ai-suggestion">${suggestionUsed ? icon("check") : icon("play")}${suggestionUsed ? " Added to demo preview" : " Show as demo reminder"}</button><small class="suggestion-foot">This mock suggestion does not change a real medication schedule or provide medical advice.</small></section></div><section class="card ai-privacy-row"><span class="concept-icon purple">${icon("shield")}</span><div><strong>Privacy direction</strong><span>Keep profile and reminder history local by default. Sharing would remain user-controlled.</span></div><button class="text-button" data-route="privacy">View privacy concept ${icon("arrow")}</button></section>`;
  }

  function renderPrivacy() {
    const timings = state.settings.timings;
    return `<div class="profile-grid"><section class="card profile-form-card"><div class="section-head"><div><div class="eyebrow">LOCAL PROFILE</div><h2>Demo patient details</h2></div><span class="local-only-tag">${icon("lock")} LOCAL ONLY</span></div><p class="section-description">This sample profile is saved in this browser. Replace it with fictional demo details before presenting.</p><form data-form="profile" class="stack-form"><label>Display name<input name="name" value="${escapeHtml(state.profile.name)}" maxlength="60" required></label><div class="form-row"><label>Bed / position<input name="bed" value="${escapeHtml(state.profile.bed)}" maxlength="24"></label><label>Ward / facility label<input name="facility" value="${escapeHtml(state.profile.facility)}" maxlength="60"></label></div><button class="button button-primary" type="submit">Save local profile</button></form></section><section class="card preferences-card"><div class="eyebrow">REMINDER PREFERENCES</div><h2>Demo behavior</h2><p class="section-description">These preferences affect the screen representation only.</p>${toggleRow("reminderSound", "Buzzer representation", "Show the scheduled-time alert state", state.settings.reminderSound)}${toggleRow("ledCue", "LED cue representation", "Show the five-minute reminder state", state.settings.ledCue)}${toggleRow("caregiverPreview", "Caregiver preview preference", "Local mock only; no remote sharing", state.settings.caregiverPreview)}<form data-form="timings" class="timing-settings"><div class="eyebrow">REMINDER TIMING · SIMULATED MINUTES</div><p>Defaults: LED cue −5 min, scheduled buzzer, escalations at +5 and +10, then unresolved at +15. Shorten intervals for a faster demo.</p><div class="form-row four"><label>Pre-alert<input type="number" name="preAlert" min="1" max="120" value="${Number(timings.preAlert)}" required><small>minutes before</small></label><label>Escalation 1<input type="number" name="firstEscalation" min="1" max="120" value="${Number(timings.firstEscalation)}" required><small>minutes after due</small></label><label>Escalation 2<input type="number" name="secondEscalation" min="2" max="240" value="${Number(timings.secondEscalation)}" required><small>minutes after due</small></label><label>Unresolved<input type="number" name="unresolvedAfter" min="3" max="360" value="${Number(timings.unresolvedAfter || 15)}" required><small>minutes after due</small></label></div><button class="button button-outline button-small" type="submit">Save demo timing</button></form></section></div>
      <div class="privacy-card-grid"><article class="card privacy-concept-card"><span class="concept-icon mint">${icon("device")}</span><div class="eyebrow">LOCAL-FIRST STORAGE</div><h3>Data stays in this browser</h3><p>Medicines, schedules, events, settings, and demo profile are stored with browser local storage. No login or backend is used.</p><span class="status-chip tone-green">Implemented · local only</span></article><article class="card privacy-concept-card"><span class="concept-icon blue">${icon("lock")}</span><div class="eyebrow">ENCRYPTION AT REST</div><h3>Security upgrade planned</h3><p>App-level encryption is not implemented in this visual prototype. Real patient data should not be entered here.</p><span class="status-chip tone-muted">Concept only</span></article><article class="card privacy-concept-card"><span class="concept-icon amber">${icon("share")}</span><div class="eyebrow">USER-CONTROLLED SHARING</div><h3>Remote sharing is off</h3><p>A future version could let a patient authorize sharing with a caregiver. This prototype has no cloud-sharing path.</p><span class="status-chip tone-muted">Not connected</span></article><article class="card privacy-concept-card"><span class="concept-icon purple">${icon("shield")}</span><div class="eyebrow">TEE · FUTURE UPGRADE</div><h3>Trusted execution environment</h3><p>A TEE is a future security concept to evaluate. No TEE or secure enclave is used by this app.</p><span class="status-chip tone-muted">Not implemented</span></article></div><section class="data-reset-row"><div><strong>Reset local demo</strong><span>Restore the original fictional profile, medicines, and example history in this browser.</span></div><button class="button button-danger-quiet" data-action="reset-demo">${icon("refresh")} Reset demo</button></section>`;
  }

  function toggleRow(key, title, description, checked) {
    return `<label class="toggle-row"><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></span><input type="checkbox" data-setting="${key}" ${checked ? "checked" : ""}><i class="toggle-track"></i></label>`;
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.kind === "add") {
      const availableSlot = ["A1", "A2", "B1", "B2", "C1", "C2"].find((slot) => !state.medicines.some((medicine) => medicine.slot === slot)) || "A1";
      return `<div class="overlay" data-action="close-overlay"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-dialog="true"><div class="dialog-head"><div><div class="eyebrow">LOCAL MEDICINE REGISTER</div><h2 id="modal-title">Add a medicine</h2></div><button class="icon-button" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><p class="dialog-intro">Enter fictional demo details. No RFID tag or account is required.</p><form data-form="add-medicine" class="stack-form"><label>Medicine name<input name="name" maxlength="60" placeholder="e.g. Example medicine" required></label><label>Dosage and schedule note<input name="dosage" maxlength="80" placeholder="e.g. 1 tablet · with breakfast" required></label><div class="form-row"><label>Package type<select name="packageType"><option>Bottle</option><option>Blister pack</option><option>Pill organizer</option><option>Other container</option></select></label><label>Slot / position<select name="slot">${["A1", "A2", "B1", "B2", "C1", "C2"].map((slot) => `<option ${slot === availableSlot ? "selected" : ""}>${slot}</option>`).join("")}</select></label></div><label>Schedule times<input name="times" placeholder="08:30, 20:30" value="08:30" required><small>Use 24-hour times, separated by commas.</small></label><div class="form-row"><label>Package baseline<input name="baseline" type="number" min="0" step="0.01" value="100.00" required><small>grams</small></label><label>Expected medication-related change<input name="expectedChange" type="number" min="0" step="0.01" value="0.40" required><small>grams · estimate</small></label></div><div class="dialog-note">Saved profile = package baseline + expected change estimate. Sensor events never confirm ingestion.</div><div class="dialog-actions"><button class="button button-quiet" data-action="close-modal" type="button">Cancel</button><button class="button button-primary" type="submit">Save medicine locally</button></div></form></section></div>`;
    }
    if (modal.kind === "replace") {
      const medicine = state.medicines.find((item) => item.id === modal.id);
      if (!medicine) return "";
      return `<div class="overlay" data-action="close-overlay"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-dialog="true"><div class="dialog-head"><div><div class="eyebrow">PACKAGE PROFILE</div><h2 id="modal-title">Replace ${escapeHtml(medicine.name)} container</h2></div><button class="icon-button" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><p class="dialog-intro">Keep this medicine registered to slot ${escapeHtml(medicine.slot)}. Save the new container weight profile; no RFID retagging is needed in this concept.</p><form data-form="replace-package" class="stack-form"><input type="hidden" name="id" value="${escapeHtml(medicine.id)}"><label>New package baseline<input name="baseline" type="number" min="0" step="0.01" value="${Number(medicine.weightProfile.baseline).toFixed(2)}" required><small>grams</small></label><label>Expected medication-related change<input name="expectedChange" type="number" min="0" step="0.01" value="${Number(medicine.weightProfile.expectedChange).toFixed(2)}" required><small>grams · estimate only</small></label><div class="replacement-summary"><span>${icon("pin")} Slot association</span><strong>${escapeHtml(medicine.slot)} · unchanged</strong></div><div class="dialog-actions"><button class="button button-quiet" data-action="close-modal" type="button">Cancel</button><button class="button button-primary" type="submit">Save new profile</button></div></form></section></div>`;
    }
    return "";
  }

  function renderDemoPanel() {
    const flow = state.activeFlow;
    return `<div class="overlay demo-overlay" data-action="close-demo"><section class="demo-drawer" role="dialog" aria-modal="true" aria-labelledby="demo-title" data-dialog="true"><div class="drawer-head"><div><div class="eyebrow">PRESENTER TOOL</div><h2 id="demo-title">Demo controls</h2></div><button class="icon-button" data-action="close-demo-button" aria-label="Close demo controls">${icon("close")}</button></div><div class="drawer-time-card"><div class="drawer-clock-icon">${icon("clock")}</div><div><small>SIMULATED CLOCK</small><strong>${timeLabel(state.demoNow)}</strong><span>${dateLabel(state.demoNow, { weekday: "long", month: "long", day: "numeric" })}</span></div><span class="sim-tag">LOCAL</span></div><div class="drawer-section"><div class="drawer-section-heading"><span>Advance simulated time</span><small>Reminder stages update as time advances.</small></div><div class="advance-buttons"><button class="button button-outline" data-action="advance" data-minutes="1">+1 min</button><button class="button button-outline" data-action="advance" data-minutes="5">+5 min</button><button class="button button-outline" data-action="advance" data-minutes="10">+10 min</button><button class="button button-outline" data-action="advance" data-minutes="30">+30 min</button></div><form data-form="advance-custom" class="advance-custom"><label>Custom minutes<input name="minutes" type="number" min="1" max="1440" value="2"></label><button class="button button-quiet button-small" type="submit">Advance clock</button></form></div><div class="drawer-section"><div class="drawer-section-heading"><span>Reminder flow</span><small>LED cue → scheduled buzzer → +5 → +10 → unresolved.</small></div><label class="drawer-select-label">Medicine<select data-change="medicine">${state.medicines.map((medicine) => `<option value="${escapeHtml(medicine.id)}" ${medicine.id === state.selectedMedicineId ? "selected" : ""}>${escapeHtml(medicine.name)} · ${escapeHtml(medicine.slot)}</option>`).join("")}</select></label><button class="button button-primary full-width" data-action="start-reminder">${icon("play")} ${flow && flow.stage !== "unresolved" ? "Restart reminder flow" : "Trigger reminder now"}</button><div class="drawer-mini-flow">${reminderSteps(flow ? flow.stage : "led")}</div></div><div class="drawer-section"><div class="drawer-section-heading"><span>Sensor event examples</span><small>Reading is a mock value from the saved profile.</small></div><div class="drawer-action-list"><button data-action="simulate-change">${icon("pulse")} Simulate weight change<span>Record a mock event</span></button><button data-action="simulate-no-change">${icon("refresh")} Simulate no weight change<span>Lift + return · remains unresolved</span></button><button data-action="mark-unresolved">${icon("alert")} Mark an event unresolved<span>Manual demo state</span></button></div></div><div class="drawer-footer"><button class="button button-danger-quiet" data-action="reset-demo">${icon("refresh")} Reset demo state</button><span>No data leaves this browser.</span></div></section></div>`;
  }

  function eventRow(event) {
    const className = event.kind === "detected_change" ? "blue" : event.kind === "missed" || event.kind === "no_change" ? "amber" : "mint";
    return `<div class="compact-event"><span class="compact-event-icon ${className}">${icon(event.kind === "detected_change" ? "pulse" : event.kind === "missed" ? "alert" : event.kind === "no_change" ? "scale" : "bell")}</span><div><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.medicineName || "Local demo")} · ${timeLabel(event.at)}</span></div><span class="compact-event-status">${escapeHtml(event.status || "Logged")}</span></div>`;
  }

  function emptyLine(title, text) {
    return `<div class="empty-line"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
  }

  function icon(name) {
    const paths = {
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
      capsule: '<path d="m8 16 8-8a5 5 0 0 1 7 7l-8 8a5 5 0 0 1-7-7Z"/><path d="m11 13 7 7"/>',
      scale: '<path d="M4 6h16l-1.2 14H5.2L4 6Z"/><path d="M8 6a4 4 0 0 1 8 0M12 11l2.5 2.5M12 11l-1 3"/>',
      timeline: '<path d="M4 5v14M20 5v14M4 8h6l2 4h8M4 16h5l2-4"/><circle cx="4" cy="5" r="1"/><circle cx="20" cy="5" r="1"/>',
      people: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"/>',
      building: '<path d="M4 21V5l8-3 8 3v16M2 21h20M8 8h1M15 8h1M8 12h1M15 12h1M10 21v-4h4v4"/>',
      spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15Z"/>',
      shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
      chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2A1.7 1.7 0 0 0 5.4 6l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 1 1 3.4 0v.2A1.7 1.7 0 0 0 17 3.4l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/>',
      menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
      play: '<path d="m8 5 11 7-11 7V5Z"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
      alert: '<path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      sound: '<path d="M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18 5a9 9 0 0 1 0 14"/>',
      box: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9"/>',
      pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.9-2L20 12M4 12l2.5 5a7 7 0 0 0 11.9-2"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
      lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3"/>',
      device: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h.01M13 15h.01"/>',
      share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.2"/>'
    };
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.info}</svg>`;
  }

  function setToast(message) {
    state.toast = message;
    saveState();
    render();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2400);
  }

  function renderSaved() {
    saveState();
    render();
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("[data-route], [data-action]");
    if (!button) return;
    if (button.hasAttribute("data-route")) {
      state.route = button.dataset.route;
      state.mobileNav = false;
      renderSaved();
      return;
    }
    const action = button.dataset.action;
    if (action === "toggle-nav") { state.mobileNav = !state.mobileNav; renderSaved(); }
    else if (action === "open-demo") { state.demoOpen = true; renderSaved(); }
    else if (action === "close-demo" || action === "close-demo-button") {
      if (action === "close-demo" && event.target.closest("[data-dialog]")) return;
      state.demoOpen = false; renderSaved();
    }
    else if (action === "close-overlay" || action === "close-modal") {
      if (action === "close-overlay" && event.target.closest("[data-dialog]")) return;
      state.modal = null; renderSaved();
    }
    else if (action === "add-medicine") { state.modal = { kind: "add" }; renderSaved(); }
    else if (action === "replace-package") { state.modal = { kind: "replace", id: button.dataset.id }; renderSaved(); }
    else if (action === "select-medicine") {
      state.selectedMedicineId = button.dataset.id;
      const med = currentMedicine(); state.currentWeight = med.weightProfile.baseline;
      setToast(med.name + " selected for sensor demo");
    }
    else if (action === "start-reminder") {
      MediSyncDemo.createReminder(state, button.dataset.id || state.selectedMedicineId);
      state.route = "home"; state.demoOpen = false;
      setToast("Reminder flow started in simulated time");
    }
    else if (action === "advance") {
      MediSyncDemo.advance(state, Number(button.dataset.minutes));
      setToast("Demo clock advanced by " + Number(button.dataset.minutes) + " min");
    }
    else if (action === "simulate-change") { MediSyncDemo.recordChange(state); setToast("Medication event detected · mock weight change"); }
    else if (action === "simulate-no-change") { MediSyncDemo.recordNoChange(state); setToast("Same-weight example recorded as unresolved"); }
    else if (action === "mark-unresolved") { MediSyncDemo.markLatestUnresolved(state); setToast("Event marked unresolved in local demo"); }
    else if (action === "filter-history") { state.historyFilter = button.dataset.filter; renderSaved(); }
    else if (action === "preview-caregiver") {
      MediSyncDemo.log(state, { kind: "system", title: "Caregiver alert preview opened", details: "Local mock only. No caregiver was contacted and no data was shared.", status: "Preview" });
      setToast("Caregiver preview added locally");
    }
    else if (action === "use-ai-suggestion") {
      state.aiSuggestionUsed = true;
      MediSyncDemo.log(state, { kind: "system", title: "Mock reminder suggestion previewed", details: "Example suggestion only. The registered medication schedule was not changed.", status: "Mock" });
      setToast("Suggestion shown as a mock preview");
    }
    else if (action === "reset-demo") {
      state = MediSyncStorage.reset();
      state.route = "home";
      setToast("Fictional demo data restored on this device");
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches('[data-change="medicine"]')) {
      state.selectedMedicineId = target.value;
      state.currentWeight = currentMedicine().weightProfile.baseline;
      renderSaved();
    } else if (target.matches("[data-setting]")) {
      state.settings[target.dataset.setting] = target.checked;
      setToast("Local preference saved");
    }
  });

  app.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const kind = form.dataset.form;
    if (kind === "add-medicine") {
      const name = String(data.get("name") || "").trim();
      const dosage = String(data.get("dosage") || "").trim();
      const times = String(data.get("times") || "").split(",").map((time) => time.trim()).filter((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time));
      const slot = String(data.get("slot") || "A1");
      if (!times.length) { setToast("Enter at least one time in HH:MM format"); return; }
      if (state.medicines.some((medicine) => medicine.slot === slot)) { setToast("That position is already in use; choose another slot"); return; }
      const medicine = {
        id: "med-" + Math.random().toString(36).slice(2, 9), name, dosage,
        packageType: String(data.get("packageType") || "Bottle"), slot, times,
        weightProfile: { baseline: Number(data.get("baseline")), expectedChange: Number(data.get("expectedChange")), unit: "g" },
        color: ["mint", "amber", "blue"][state.medicines.length % 3]
      };
      state.medicines.push(medicine);
      state.selectedMedicineId = medicine.id;
      state.currentWeight = medicine.weightProfile.baseline;
      state.modal = null; state.route = "medicines";
      MediSyncDemo.log(state, { kind: "system", medicineId: medicine.id, medicineName: medicine.name, title: "Medicine registered locally", details: medicine.name + " saved to slot " + slot + " with a mock package profile. No RFID or cloud service used.", status: "Registered" });
      setToast("Medicine saved in this browser");
    } else if (kind === "replace-package") {
      MediSyncDemo.replaceProfile(state, String(data.get("id")), Number(data.get("baseline")), Number(data.get("expectedChange")));
      state.modal = null;
      setToast("Package profile refreshed; slot association retained");
    } else if (kind === "profile") {
      state.profile.name = String(data.get("name") || "Demo profile").trim();
      state.profile.bed = String(data.get("bed") || "").trim();
      state.profile.facility = String(data.get("facility") || "").trim();
      setToast("Local demo profile saved");
    } else if (kind === "timings") {
      const firstEscalation = Math.max(1, Number(data.get("firstEscalation")) || 5);
      const secondEscalation = Math.max(firstEscalation + 1, Number(data.get("secondEscalation")) || 10);
      state.settings.timings = {
        preAlert: Math.max(1, Number(data.get("preAlert")) || 5),
        firstEscalation,
        secondEscalation,
        unresolvedAfter: Math.max(secondEscalation + 1, Number(data.get("unresolvedAfter")) || 15)
      };
      setToast("Reminder timings saved for demo mode");
    } else if (kind === "advance-custom") {
      MediSyncDemo.advance(state, Math.max(1, Number(data.get("minutes")) || 1));
      setToast("Demo clock advanced");
    }
  });

  MediSyncDemo.syncStage(state);
  render();
})();
