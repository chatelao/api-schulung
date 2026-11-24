(function () {
  "use strict";

  const DOCS_BASE = "https://api-schulung.readthedocs.io/de/latest/";
  const STORAGE_KEY = "api_schulung_studio_v1";

  const defaultState = {
    view: "curriculum",
    beamer: false,
    variant: "A",
    phaseFilter: "all",
    search: "",
    doneLessons: {},
    activeCp: "CP-0",
    checkpoints: {
      "CP-0": {},
      "CP-1": {},
      "CP-2": {},
      "CP-3": {}
    },
    activeLab: "http",
    fcCategory: "Alle",
    fcIndex: 0,
    fcRatings: {},
    mockAnswers: {},
    mockStarted: false,
    mockSubmitted: false
  };

  let state = loadState();
  let mockTimerHandle = null;
  let mockSecondsLeft = 20 * 60;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultState),
        ...parsed,
        doneLessons: { ...(parsed.doneLessons || {}) },
        checkpoints: {
          ...structuredClone(defaultState.checkpoints),
          ...(parsed.checkpoints || {})
        },
        fcRatings: { ...(parsed.fcRatings || {}) },
        mockAnswers: { ...(parsed.mockAnswers || {}) }
      };
    } catch (_err) {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      // Ignore storage quota errors
    }
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function allLessons() {
    const out = [];
    (window.API_CURRICULUM || []).forEach((phase) => {
      (phase.lessons || []).forEach((lesson) => out.push({ ...lesson, phase }));
    });
    return out;
  }

  // --- Navigation & Hash Routing ---
  const VALID_VIEWS = ["curriculum", "checkpoints", "labs", "flashcards", "mock"];

  function setView(viewName, updateHash) {
    const view = VALID_VIEWS.includes(viewName) ? viewName : "curriculum";
    state.view = view;
    saveState();

    document.querySelectorAll(".view").forEach((el) => {
      el.classList.toggle("active", el.id === `view-${view}`);
    });
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      const active = btn.dataset.view === view;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    const permalink = document.getElementById("global-permalink");
    if (permalink) {
      const hash = view === "labs" ? `#labs:${state.activeLab}` : `#${view}`;
      permalink.href = hash;
      if (updateHash && window.location.hash !== hash) {
        history.replaceState(null, "", hash);
      }
    }
  }

  function setBeamer(enabled) {
    state.beamer = Boolean(enabled);
    document.body.classList.toggle("beamer-mode", state.beamer);
    const btn = document.getElementById("beamer-toggle-btn");
    if (btn) {
      btn.setAttribute("aria-pressed", state.beamer ? "true" : "false");
      btn.textContent = state.beamer ? "Standard-Ansicht" : "Beamer-Modus";
    }
    saveState();
  }

  function applyHash() {
    const raw = (window.location.hash || "").replace(/^#/, "");
    if (!raw) return;
    if (raw.startsWith("labs:")) {
      const labName = raw.slice(5);
      if (document.getElementById(`lab-${labName}`)) {
        state.activeLab = labName;
      }
      setView("labs", false);
      renderLabsTab();
      return;
    }
    if (VALID_VIEWS.includes(raw)) {
      setView(raw, false);
    }
  }

  // --- VIEW 1: CURRICULUM TRACKER ---
  function initCurriculumControls() {
    const phaseFilter = document.getElementById("phase-filter");
    const searchInput = document.getElementById("lesson-search");
    const variantSelect = document.getElementById("variant-select");
    const exportBtn = document.getElementById("export-state-btn");
    const importBtn = document.getElementById("import-state-btn");
    const importFile = document.getElementById("import-state-file");
    const resetBtn = document.getElementById("reset-lessons-btn");

    if (phaseFilter) {
      phaseFilter.innerHTML = `<option value="all">Alle Stufen (Basis + Advanced)</option>` +
        (window.API_CURRICULUM || [])
          .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.title)}</option>`)
          .join("");
      phaseFilter.value = state.phaseFilter;
      phaseFilter.addEventListener("change", () => {
        state.phaseFilter = phaseFilter.value;
        saveState();
        renderCurriculum();
      });
    }

    if (searchInput) {
      searchInput.value = state.search;
      searchInput.addEventListener("input", () => {
        state.search = searchInput.value;
        saveState();
        renderCurriculum();
      });
    }

    if (variantSelect) {
      variantSelect.value = state.variant;
      variantSelect.addEventListener("change", () => {
        state.variant = variantSelect.value;
        saveState();
        renderVariantBanner();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `api-schulung-lernstand-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (importBtn && importFile) {
      importBtn.addEventListener("click", () => importFile.click());
      importFile.addEventListener("change", async () => {
        const file = importFile.files && importFile.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const imported = JSON.parse(text);
          if (typeof imported !== "object" || !imported) throw new Error("Ungültige JSON-Struktur");
          state = {
            ...structuredClone(defaultState),
            ...imported,
            doneLessons: { ...(imported.doneLessons || {}) },
            checkpoints: {
              ...structuredClone(defaultState.checkpoints),
              ...(imported.checkpoints || {})
            },
            fcRatings: { ...(imported.fcRatings || {}) },
            mockAnswers: { ...(imported.mockAnswers || {}) }
          };
          saveState();
          renderAll();
        } catch (err) {
          alert(`Import fehlgeschlagen: ${err.message}`);
        } finally {
          importFile.value = "";
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (!confirm("Gesamten Modul-Fortschritt wirklich zurücksetzen?")) return;
        state.doneLessons = {};
        saveState();
        renderCurriculum();
      });
    }
  }

  function renderVariantBanner() {
    const banner = document.getElementById("variant-banner");
    if (!banner) return;
    if (state.variant === "B") {
      banner.className = "callout callout-warn";
      banner.innerHTML =
        "<strong>Modus B (Advanced A00 — Eigenes Docker-Labor):</strong> Alle 6 Container laufen lokal unter <code>localhost:8080</code> (Petstore), <code>8081</code> (Keycloak), <code>8090</code> (mock-oauth2), <code>8180</code> (httpbin), <code>8443/8444</code> (mTLS/TLS) und <code>9000</code> (SOAP/WSS) — ideal für Offline-Tests, mTLS, WS-Security und die <code>curl</code>-Übungen <code>A01–A06</code>.";
    } else {
      banner.className = "callout callout-info";
      banner.innerHTML =
        "<strong>Modus A (Zero-Install-Einstieg empfohlen):</strong> Starte ohne Docker &amp; ohne Terminal direkt in öffentlichen <strong>Swagger Web UIs</strong> (<a href='https://petstore3.swagger.io/' target='_blank' rel='noopener'>petstore3.swagger.io</a>, <a href='https://httpbin.org/' target='_blank' rel='noopener'>httpbin.org</a>) sowie <a href='https://badssl.com/' target='_blank' rel='noopener'>badssl.com</a> und <a href='https://demo.duendesoftware.com/.well-known/openid-configuration' target='_blank' rel='noopener'>Duende OIDC</a>.";
    }
  }

  function renderCurriculum() {
    const container = document.getElementById("phases-container");
    if (!container) return;

    const all = allLessons();
    const total = all.length;
    const doneCount = all.filter((l) => Boolean(state.doneLessons[l.id])).length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;

    const doneCountEl = document.getElementById("lessons-done-count");
    const donePctEl = document.getElementById("lessons-done-pct");
    const barEl = document.getElementById("lessons-progress-bar");
    if (doneCountEl) doneCountEl.textContent = `${doneCount} / ${total}`;
    if (donePctEl) donePctEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;

    const query = (state.search || "").trim().toLowerCase();
    const phases = (window.API_CURRICULUM || []).filter(
      (p) => state.phaseFilter === "all" || p.id === state.phaseFilter
    );

    const htmlParts = [];
    phases.forEach((phase) => {
      const lessons = (phase.lessons || []).filter((lesson) => {
        if (!query) return true;
        return `${lesson.id} ${lesson.title} ${lesson.tools} ${phase.title}`
          .toLowerCase()
          .includes(query);
      });
      if (!lessons.length) return;

      const phaseDone = lessons.filter((l) => Boolean(state.doneLessons[l.id])).length;
      const badgeClass = phase.badge === "Advanced" ? "badge badge-advanced" : "badge";

      const rows = lessons
        .map((lesson) => {
          const isDone = Boolean(state.doneLessons[lesson.id]);
          const docsUrl = `${DOCS_BASE}${lesson.docsPath}`;
          const exUrl = lesson.exercisePath ? `${DOCS_BASE}${lesson.exercisePath}` : null;
          return `
            <div class="lesson-row ${isDone ? "done" : ""}">
              <input type="checkbox" id="chk-${escapeHtml(lesson.id)}" data-lesson-id="${escapeHtml(lesson.id)}" ${isDone ? "checked" : ""} aria-label="${escapeHtml(lesson.title)} abschliessen" />
              <div>
                <label class="lesson-title" for="chk-${escapeHtml(lesson.id)}">${escapeHtml(lesson.title)}</label>
                <div class="lesson-meta">${escapeHtml(lesson.duration)} Min &middot; Tools: ${escapeHtml(lesson.tools)}</div>
              </div>
              <div class="lesson-links">
                <a href="${escapeHtml(docsUrl)}" target="_blank" rel="noopener">Theorie &nearr;</a>
                ${exUrl ? `<a href="${escapeHtml(exUrl)}" target="_blank" rel="noopener">Übung &nearr;</a>` : ""}
              </div>
            </div>
          `;
        })
        .join("");

      htmlParts.push(`
        <article class="phase-card">
          <div class="phase-head">
            <h2>${escapeHtml(phase.title)}</h2>
            <div>
              <span class="${badgeClass}">${escapeHtml(phase.badge)}</span>
              <span class="badge">${phaseDone} / ${lessons.length}</span>
            </div>
          </div>
          <div class="lesson-list">${rows}</div>
        </article>
      `);
    });

    container.innerHTML = htmlParts.length
      ? htmlParts.join("")
      : `<div class="callout callout-warn">Keine Module passend zu „${escapeHtml(state.search)}“ gefunden.</div>`;

    container.querySelectorAll("input[data-lesson-id]").forEach((chk) => {
      chk.addEventListener("change", () => {
        const id = chk.dataset.lessonId;
        if (chk.checked) {
          state.doneLessons[id] = true;
        } else {
          delete state.doneLessons[id];
        }
        saveState();
        renderCurriculum();
      });
    });

    renderVariantBanner();
  }

  // --- VIEW 2: CHECKPOINTS ---
  function computeCpScore(cpId) {
    const questions = window.API_CHECKPOINT_QUESTIONS || [];
    const answers = state.checkpoints[cpId] || {};
    let answered = 0;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] !== undefined) {
        answered += 1;
        if (Number(answers[q.id]) === q.answer) correct += 1;
      }
    });
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { answered, correct, total: questions.length, pct };
  }

  function renderCheckpoints() {
    const strip = document.getElementById("cp-selector-strip");
    const workspace = document.getElementById("cp-workspace");
    const chartContainer = document.getElementById("cp-chart-container");
    const matrixContainer = document.getElementById("cp-domain-matrix");
    if (!strip || !workspace) return;

    const metaList = window.API_CHECKPOINTS_META || [];
    strip.innerHTML = metaList
      .map((m) => {
        const sc = computeCpScore(m.id);
        const active = state.activeCp === m.id ? "active" : "";
        return `<button class="cp-pill ${active}" type="button" data-cp-id="${escapeHtml(m.id)}">${escapeHtml(m.label)} (${sc.correct}/${sc.total})</button>`;
      })
      .join("");

    strip.querySelectorAll("button[data-cp-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCp = btn.dataset.cpId;
        saveState();
        renderCheckpoints();
      });
    });

    const cpId = state.activeCp;
    const cpAnswers = state.checkpoints[cpId] || {};
    const questions = window.API_CHECKPOINT_QUESTIONS || [];
    const score = computeCpScore(cpId);

    const qHtml = questions
      .map((q, idx) => {
        const chosen = cpAnswers[q.id];
        const opts = q.options
          .map((opt, optIdx) => {
            const checked = Number(chosen) === optIdx ? "checked" : "";
            return `
              <label class="q-opt">
                <input type="radio" name="cp-${escapeHtml(cpId)}-${escapeHtml(q.id)}" value="${optIdx}" ${checked} data-q-id="${escapeHtml(q.id)}" />
                <span>${escapeHtml(opt)}</span>
              </label>
            `;
          })
          .join("");

        let feedback = "";
        if (chosen !== undefined) {
          const isOk = Number(chosen) === q.answer;
          feedback = `<div class="callout ${isOk ? "callout-good" : "callout-bad"}" style="margin-top:0.5rem;margin-bottom:0;">
            <strong>${isOk ? "Richtig!" : "Nicht ganz:"}</strong> ${escapeHtml(q.explain)}
          </div>`;
        }

        return `
          <div class="q-block">
            <div class="q-title">${idx + 1}. [${escapeHtml(q.domain)}] ${escapeHtml(q.question)}</div>
            <div class="q-options">${opts}</div>
            ${feedback}
          </div>
        `;
      })
      .join("");

    workspace.innerHTML = `
      <div class="phase-head">
        <h2>${escapeHtml(cpId)} &mdash; Wissens-Check</h2>
        <div>
          <span class="badge badge-pass">${score.correct} / ${score.total} richtig (${score.pct}%)</span>
          <button class="btn btn-sm btn-secondary" id="reset-active-cp" type="button">Diesen CP leeren</button>
        </div>
      </div>
      ${qHtml}
    `;

    workspace.querySelectorAll("input[type='radio'][data-q-id]").forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!state.checkpoints[cpId]) state.checkpoints[cpId] = {};
        state.checkpoints[cpId][radio.dataset.qId] = Number(radio.value);
        saveState();
        renderCheckpoints();
      });
    });

    const resetCpBtn = document.getElementById("reset-active-cp");
    if (resetCpBtn) {
      resetCpBtn.addEventListener("click", () => {
        state.checkpoints[cpId] = {};
        saveState();
        renderCheckpoints();
      });
    }

    // SVG Bar Chart
    if (chartContainer) {
      const bars = metaList.map((m, i) => {
        const sc = computeCpScore(m.id);
        const h = Math.max(4, Math.round((sc.pct / 100) * 90));
        const x = 18 + i * 70;
        const y = 105 - h;
        const fill = sc.answered === 0 ? "#cbd5e1" : "#3949ab";
        return `
          <rect x="${x}" y="${y}" width="38" height="${h}" rx="4" fill="${fill}"></rect>
          <text x="${x + 19}" y="${y - 4}" text-anchor="middle" font-size="11" fill="#1a222d" font-weight="600">${sc.pct}%</text>
          <text x="${x + 19}" y="122" text-anchor="middle" font-size="11" fill="#4e5a6b">${escapeHtml(m.id)}</text>
        `;
      });
      chartContainer.innerHTML = `
        <svg viewBox="0 0 300 132" width="100%" aria-label="Checkpoint Lernverlauf">
          <line x1="10" y1="105" x2="290" y2="105" stroke="#c8c0b2" stroke-width="1" />
          ${bars.join("")}
        </svg>
      `;
    }

    // Domain Mastery Matrix
    if (matrixContainer) {
      const domains = {};
      questions.forEach((q) => {
        if (!domains[q.domain]) domains[q.domain] = { total: 0, ok: 0 };
        domains[q.domain].total += 1;
        if (Number(cpAnswers[q.id]) === q.answer) domains[q.domain].ok += 1;
      });
      const rows = Object.entries(domains)
        .map(([dom, stats]) => {
          const pct = Math.round((stats.ok / stats.total) * 100);
          return `<tr><td>${escapeHtml(dom)}</td><td>${stats.ok}/${stats.total}</td><td><strong>${pct}%</strong></td></tr>`;
        })
        .join("");
      matrixContainer.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Domain (${escapeHtml(cpId)})</th><th>Treffer</th><th>Score</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  }

  function initCheckpointsExport() {
    const btn = document.getElementById("export-cp-json");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const summary = {};
      (window.API_CHECKPOINTS_META || []).forEach((m) => {
        summary[m.id] = {
          score: computeCpScore(m.id),
          answers: state.checkpoints[m.id] || {}
        };
      });
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `api-schulung-checkpoints-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // --- VIEW 3: INTERACTIVE LABS ---
  function renderLabsTab() {
    document.querySelectorAll(".lab-tab").forEach((tab) => {
      const active = tab.dataset.lab === state.activeLab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".lab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `lab-${state.activeLab}`);
    });
  }

  function renderHttpSim() {
    const methodEl = document.getElementById("http-method");
    const targetEl = document.getElementById("http-target");
    const ctEl = document.getElementById("http-content-type");
    const out = document.getElementById("http-sim-output");
    if (!methodEl || !targetEl || !ctEl || !out) return;

    const method = methodEl.value;
    const urlStr = targetEl.value;
    const ct = ctEl.value;
    const parsed = new URL(urlStr);

    let status = "200 OK";
    let explanation = "Gültige Anfrage — der Server antwortet erfolgreich.";
    let badgeClass = "callout-good";

    if (parsed.pathname === "/api/v3/pet" && method === "GET") {
      status = "405 Method Not Allowed";
      explanation = "Auf /api/v3/pet (Sammlung) ist GET ohne Pfad-ID oder Such-Endpunkt (/findByStatus) in Petstore nicht erlaubt.";
      badgeClass = "callout-warn";
    } else if (parsed.pathname === "/api/v3/pet/99999999" && method === "GET") {
      status = "404 Not Found";
      explanation = "Die Ressource mit ID 99999999 existiert nicht in der Petstore-Datenbank.";
      badgeClass = "callout-warn";
    } else if ((method === "POST" || method === "PUT") && ct === "text/plain") {
      status = "415 Unsupported Media Type";
      explanation = "Du sendest text/plain, die REST-API erwartet jedoch Content-Type: application/json.";
      badgeClass = "callout-bad";
    } else if (method === "POST" && parsed.pathname === "/api/v3/pet") {
      status = "200 OK (oder 201 Created in anderen REST-APIs)";
      explanation = "Neues Pet als JSON erfolgreich angelegt.";
    }

    const bodySnippet =
      method === "POST" || method === "PUT"
        ? ` -H "Content-Type: ${ct}" -d '{"id":2026,"name":"LabDog","status":"available"}'`
        : "";

    const isLocal = parsed.hostname === "localhost";
    const schemeNote =
      parsed.protocol === "https:"
        ? "TLS-verschlüsselt (Produktionsstandard)"
        : "Unverschlüsselt im lokalen Docker-Container-Labor (A00)";
    const hostNote = isLocal
      ? "Lokaler Docker-Container (Advanced A00)"
      : "Öffentlicher Testserver mit eingebauter Swagger Web UI";

    out.innerHTML = `
      <div class="callout ${badgeClass}">
        <strong>Erwarteter Status:</strong> <code>${escapeHtml(status)}</code><br />
        ${escapeHtml(explanation)}
      </div>
      <table class="data-table">
        <thead><tr><th>URL-Bestandteil</th><th>Wert</th><th>Bedeutung</th></tr></thead>
        <tbody>
          <tr><td>Protokoll (Scheme)</td><td><code>${escapeHtml(parsed.protocol.replace(":", ""))}</code></td><td>${escapeHtml(schemeNote)}</td></tr>
          <tr><td>Host &amp; Port</td><td><code>${escapeHtml(parsed.host)}</code></td><td>${escapeHtml(hostNote)}</td></tr>
          <tr><td>Pfad (Path)</td><td><code>${escapeHtml(parsed.pathname)}</code></td><td>Adressierte API-Ressource</td></tr>
        </tbody>
      </table>
      <p class="muted-sm" style="margin-top:0.75rem;">Sofort-Start (Browser Swagger UI): Öffne <code>${escapeHtml(parsed.origin)}/</code> und klicke auf <strong>Try it out</strong> (Methode <strong>${escapeHtml(method)}</strong>). Alternativ in Bruno Desktop${method === "POST" || method === "PUT" ? ` mit Body-Typ <strong>${escapeHtml(ct)}</strong>` : ""}.<br />Optional für Advanced (<code>curl</code>):</p>
      <pre><code>curl -i -X ${escapeHtml(method)} "${escapeHtml(urlStr)}"${escapeHtml(bodySnippet)}</code></pre>
    `;
  }

  function renderOpenApiSim() {
    const ruleEl = document.getElementById("oas-rule");
    const apiKeyEl = document.getElementById("oas-has-apikey");
    const bearerEl = document.getElementById("oas-has-bearer");
    const mtlsEl = document.getElementById("oas-has-mtls");
    const out = document.getElementById("oas-sim-output");
    if (!ruleEl || !apiKeyEl || !bearerEl || !mtlsEl || !out) return;

    const rule = ruleEl.value;
    const hasKey = apiKeyEl.checked;
    const hasBearer = bearerEl.checked;
    const hasMtls = mtlsEl.checked;

    let allowed = false;
    let yaml = "";
    let reason = "";

    if (rule === "public") {
      allowed = true;
      yaml = "security: []";
      reason = "Öffentlicher Endpunkt: Leeres security-Array schaltet alle globalen Pflicht-Checks ab.";
    } else if (rule === "or") {
      allowed = hasKey || hasBearer;
      yaml = "security:\n  - apiKeyAuth: []\n  - bearerAuth: []";
      reason = allowed
        ? "Erlaubt (200 OK): Mindestens eine ODER-Alternative (API Key oder Bearer) liegt vor."
        : "Abgelehnt (401 Unauthorized): Weder X-Api-Key noch Bearer Token gesendet.";
    } else if (rule === "optional") {
      allowed = true;
      yaml = "security:\n  - {}\n  - apiKeyAuth: []";
      reason = hasKey
        ? "Erlaubt (200 OK, authentifiziert): Client nutzt optionale apiKeyAuth."
        : "Erlaubt (200 OK, anonym): Leeres Objekt {} macht Authentifizierung optional.";
    } else if (rule === "and") {
      allowed = hasMtls && hasBearer;
      yaml = "security:\n  - mtlsAuth: []\n    oauth2Auth: [\"orders:write\"]";
      reason = allowed
        ? "Erlaubt (200 OK): Beide Faktoren im selben Objekt (mTLS UND OAuth2 Bearer) wurden erfüllt."
        : "Abgelehnt (401/403): Beide Schlüssel stehen im selben YAML-Objekt -> UND-Verknüpfung!";
    }

    out.innerHTML = `
      <div class="callout ${allowed ? "callout-good" : "callout-bad"}">
        <strong>Entscheidung:</strong> ${escapeHtml(reason)}
      </div>
      <pre><code>${escapeHtml(yaml)}</code></pre>
    `;
  }

  function base64UrlEncode(bytes) {
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function generatePkcePair() {
    const out = document.getElementById("pkce-output");
    if (!out) return;
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const verifier = base64UrlEncode(randomBytes);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = base64UrlEncode(new Uint8Array(digest));

    out.innerHTML = `
      <div class="callout callout-good">
        <strong>PKCE S256 im Browser erzeugt:</strong> Der <code>code_challenge</code> geht im Schritt 1 an den Browser-Redirect (<code>/auth</code>); der <code>code_verifier</code> wird erst im vertraulichen Backchannel-Schritt an <code>/token</code> mitgeschickt.
      </div>
      <table class="data-table">
        <tbody>
          <tr><th>code_verifier (geheim)</th><td><code>${escapeHtml(verifier)}</code></td></tr>
          <tr><th>code_challenge (SHA-256)</th><td><code>${escapeHtml(challenge)}</code></td></tr>
          <tr><th>code_challenge_method</th><td><code>S256</code> (niemals <code>plain</code>)</td></tr>
        </tbody>
      </table>
    `;
  }

  function decodeBase64UrlJson(segment) {
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (segment.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function makeSampleJwt(payload) {
    const enc = (obj) => {
      const bytes = new TextEncoder().encode(JSON.stringify(obj));
      return base64UrlEncode(bytes);
    };
    const header = { alg: "RS256", typ: "JWT", kid: "lab-key-2026" };
    return `${enc(header)}.${enc(payload)}.DEMO_NICHT_SIGNATURGEPRUEFT`;
  }

  function inspectJwt() {
    const input = document.getElementById("jwt-input");
    const out = document.getElementById("jwt-output");
    if (!input || !out) return;
    const token = input.value.trim();
    if (!token) {
      out.innerHTML = `<div class="callout callout-info">Füge oben ein JWT ein oder klicke auf einen der beiden Beispiel-Buttons, um <strong>Access Token</strong> vs. <strong>ID Token</strong> zu vergleichen.</div>`;
      return;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      out.innerHTML = `<div class="callout callout-bad">Ungültiges JWT-Format: Ein JWT muss genau drei durch Punkt getrennte Teile (<code>Header.Payload.Signatur</code>) besitzen.</div>`;
      return;
    }

    try {
      const header = decodeBase64UrlJson(parts[0]);
      const payload = decodeBase64UrlJson(parts[1]);

      const isIdToken = Boolean(payload.nonce || payload.at_hash || payload.c_hash || payload.auth_time) && !payload.scope;
      const roleNote = isIdToken
        ? `<div class="callout callout-bad"><strong>Achtung — ID Token erkannt!</strong> Dieses Token enthält Identitäts-Claims (z. B. <code>nonce</code> / <code>email</code>) für die Client-Anmeldung. Es darf <strong>niemals</strong> als <code>Authorization: Bearer</code> an eine Fach-API gesendet werden!</div>`
        : `<div class="callout callout-good"><strong>Access Token (Autorisierung):</strong> Trägt <code>scope</code>/<code>aud</code> für die Resource-API. Eine Fach-API prüft Signatur (gegen <code>jwks_uri</code>), <code>iss</code>, <code>aud</code>, <code>exp</code> und <code>scope</code>.</div>`;

      out.innerHTML = `
        <div class="callout callout-warn">
          <strong>Wichtiger Sicherheitshinweis:</strong> Base64URL-Dekodierung im Browser prüft <strong>keine kryptografische Signatur</strong>. Verifikation erfordert zwingend den Abruf des öffentlichen Schlüssels über <code>jwks_uri</code>!
        </div>
        ${roleNote}
        <div class="grid-2">
          <div><strong>Header</strong><pre><code>${escapeHtml(JSON.stringify(header, null, 2))}</code></pre></div>
          <div><strong>Payload (Claims)</strong><pre><code>${escapeHtml(JSON.stringify(payload, null, 2))}</code></pre></div>
        </div>
      `;
    } catch (err) {
      out.innerHTML = `<div class="callout callout-bad">Fehler beim Base64URL-Dekodieren: ${escapeHtml(err.message)}</div>`;
    }
  }

  function renderSoapExample(mode) {
    const out = document.getElementById("soap-output");
    if (!out) return;
    if (mode === "1.1") {
      out.innerHTML = `
        <div class="callout callout-info"><strong>SOAP 1.1:</strong> Verwendet <code>Content-Type: text/xml; charset=utf-8</code> und einen zusätzlichen HTTP-Header <code>SOAPAction</code>.</div>
        <pre><code>POST http://localhost:9000/soap HTTP/1.1
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://example.com/orders/GetOrder"

&lt;soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ord="http://example.com/orders"&gt;
  &lt;soapenv:Header/&gt;
  &lt;soapenv:Body&gt;
    &lt;ord:GetOrderRequest&gt;&lt;ord:orderId&gt;ORD-1001&lt;/ord:orderId&gt;&lt;/ord:GetOrderRequest&gt;
  &lt;/soapenv:Body&gt;
&lt;/soapenv:Envelope&gt;</code></pre>`;
    } else if (mode === "1.2") {
      out.innerHTML = `
        <div class="callout callout-info"><strong>SOAP 1.2:</strong> Verwendet <code>Content-Type: application/soap+xml; charset=utf-8</code> (<code>action=...</code> steckt direkt im Content-Type) und den Namespace <code>http://www.w3.org/2003/05/soap-envelope</code>.</div>
        <pre><code>POST http://localhost:9000/soap HTTP/1.1
Content-Type: application/soap+xml; charset=utf-8; action="http://example.com/orders/GetOrder"

&lt;soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:ord="http://example.com/orders"&gt;
  &lt;soap:Header/&gt;
  &lt;soap:Body&gt;
    &lt;ord:GetOrderRequest&gt;&lt;ord:orderId&gt;ORD-1001&lt;/ord:orderId&gt;&lt;/ord:GetOrderRequest&gt;
  &lt;/soap:Body&gt;
&lt;/soap:Envelope&gt;</code></pre>`;
    } else if (mode === "wss-good") {
      out.innerHTML = `
        <div class="callout callout-good"><strong>Richtige SoapUI Outgoing-WS-Security-Reihenfolge:</strong><br />1. <code>Timestamp</code> (erzeugt Ablaufzeit)<br />2. <code>Username</code> (fügt Benutzername/Nonce hinzu)<br />3. <code>Signature</code> (signiert Body + Timestamp gemeinsam — Replay-Schutz!)</div>`;
    } else {
      out.innerHTML = `
        <div class="callout callout-bad"><strong>Fehlerhafte Reihenfolge (<code>Signature</code> vor <code>Timestamp</code>):</strong><br />Der Timestamp entsteht erst nach der Signatur und wird nicht mit signiert — der Server lehnt die Nachricht mit <code>wsse:FailedCheck</code> ab.</div>`;
    }
  }

  function renderCiResults() {
    const out = document.getElementById("ci-results-output");
    if (!out) return;
    const data = window.API_CI_RESULTS || {
      timestamp: "unbekannt",
      gitSha: "n/a",
      runId: "n/a",
      runUrl: "https://github.com/chatelao/api-schulung/actions",
      totalTests: 0,
      totalFailures: 0,
      suites: []
    };
    const allOk = Number(data.totalFailures) === 0;
    const rows = (data.suites || [])
      .map(
        (s) => `
          <tr>
            <td><code>${escapeHtml(s.name)}</code></td>
            <td>${escapeHtml(s.tests)}</td>
            <td>${escapeHtml(s.failures)}</td>
            <td>${escapeHtml(s.duration_s)} s</td>
            <td><span class="badge ${s.status === "PASS" ? "badge-pass" : "badge-advanced"}">${escapeHtml(s.status)}</span></td>
          </tr>
        `
      )
      .join("");

    out.innerHTML = `
      <div class="callout ${allOk ? "callout-good" : "callout-bad"}">
        <strong>Letzter verifizierter CI-Lauf:</strong> ${escapeHtml(data.totalTests)} Tests, ${escapeHtml(data.totalFailures)} Fehler &middot;
        Stand: <code>${escapeHtml(data.timestamp)}</code> &middot; Commit: <code>${escapeHtml(data.gitSha)}</code> &middot;
        <a href="${escapeHtml(data.runUrl)}" target="_blank" rel="noopener">GitHub Actions Run (${escapeHtml(data.runId)}) &nearr;</a>
      </div>
      <table class="data-table">
        <thead><tr><th>Suite</th><th>Tests</th><th>Fehler</th><th>Dauer</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function initLabs() {
    document.querySelectorAll(".lab-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        state.activeLab = tab.dataset.lab;
        saveState();
        renderLabsTab();
        setView("labs", true);
      });
    });

    ["http-method", "http-target", "http-content-type"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderHttpSim);
    });
    renderHttpSim();

    ["oas-rule", "oas-has-apikey", "oas-has-bearer", "oas-has-mtls"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderOpenApiSim);
    });
    renderOpenApiSim();

    const pkceBtn = document.getElementById("btn-gen-pkce");
    if (pkceBtn) pkceBtn.addEventListener("click", generatePkcePair);
    generatePkcePair();

    const loadAccessBtn = document.getElementById("btn-load-access-jwt");
    const loadIdBtn = document.getElementById("btn-load-id-jwt");
    const jwtInput = document.getElementById("jwt-input");

    if (loadAccessBtn && jwtInput) {
      loadAccessBtn.addEventListener("click", () => {
        jwtInput.value = makeSampleJwt({
          iss: "http://localhost:8081/realms/api-schulung",
          sub: "svc-order-client",
          aud: "petstore-api",
          scope: "orders:read orders:write",
          exp: Math.floor(Date.now() / 1000) + 300
        });
        inspectJwt();
      });
    }
    if (loadIdBtn && jwtInput) {
      loadIdBtn.addEventListener("click", () => {
        jwtInput.value = makeSampleJwt({
          iss: "http://localhost:8081/realms/api-schulung",
          sub: "user-anna-42",
          aud: "api-lab-spa",
          nonce: "n-9f8e7d6c",
          email: "anna.beispiel@example.invalid",
          exp: Math.floor(Date.now() / 1000) + 300
        });
        inspectJwt();
      });
    }
    if (jwtInput) {
      jwtInput.addEventListener("input", inspectJwt);
      inspectJwt();
    }

    const soap11 = document.getElementById("btn-soap-11");
    const soap12 = document.getElementById("btn-soap-12");
    const wssGood = document.getElementById("btn-wss-good");
    const wssBad = document.getElementById("btn-wss-bad");
    if (soap11) soap11.addEventListener("click", () => renderSoapExample("1.1"));
    if (soap12) soap12.addEventListener("click", () => renderSoapExample("1.2"));
    if (wssGood) wssGood.addEventListener("click", () => renderSoapExample("wss-good"));
    if (wssBad) wssBad.addEventListener("click", () => renderSoapExample("wss-bad"));
    renderSoapExample("1.1");

    renderCiResults();
    renderLabsTab();
  }

  // --- VIEW 4: FLASHCARDS ---
  function filteredFlashcards() {
    const cards = window.API_FLASHCARDS || [];
    if (state.fcCategory === "Alle") return cards;
    return cards.filter((c) => c.cat === state.fcCategory);
  }

  function renderFlashcards() {
    const select = document.getElementById("fc-category-filter");
    const cardEl = document.getElementById("flashcard-card");
    const counterEl = document.getElementById("fc-counter");
    const catBadge = document.getElementById("fc-cat-badge");
    const qEl = document.getElementById("fc-question");
    const aEl = document.getElementById("fc-answer");
    const hintEl = document.getElementById("fc-hint");

    const all = window.API_FLASHCARDS || [];
    if (select && !select.options.length) {
      const cats = ["Alle", ...new Set(all.map((c) => c.cat))];
      select.innerHTML = cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
      select.value = state.fcCategory;
      select.addEventListener("change", () => {
        state.fcCategory = select.value;
        state.fcIndex = 0;
        if (cardEl) cardEl.classList.remove("flipped");
        saveState();
        renderFlashcards();
      });
    }

    const list = filteredFlashcards();
    if (!list.length) return;
    if (state.fcIndex >= list.length) state.fcIndex = 0;
    if (state.fcIndex < 0) state.fcIndex = list.length - 1;
    const item = list[state.fcIndex];

    if (counterEl) counterEl.textContent = `${state.fcIndex + 1} / ${list.length}`;
    if (catBadge) catBadge.textContent = item.cat;
    if (qEl) qEl.textContent = item.q;
    if (aEl) aEl.textContent = item.a;
    if (hintEl) hintEl.textContent = item.hint ? `Hinweis: ${item.hint}` : "";
  }

  function initFlashcards() {
    const cardEl = document.getElementById("flashcard-card");
    const prevBtn = document.getElementById("fc-prev");
    const nextBtn = document.getElementById("fc-next");

    const flip = () => {
      if (cardEl) cardEl.classList.toggle("flipped");
    };
    if (cardEl) {
      cardEl.addEventListener("click", flip);
      cardEl.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          flip();
        }
      });
    }

    const step = (delta) => {
      const list = filteredFlashcards();
      if (!list.length) return;
      state.fcIndex = (state.fcIndex + delta + list.length) % list.length;
      if (cardEl) cardEl.classList.remove("flipped");
      saveState();
      renderFlashcards();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => step(1));

    [
      ["fc-rate-again", "again"],
      ["fc-rate-unsure", "unsure"],
      ["fc-rate-known", "known"]
    ].forEach(([id, rating]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const item = filteredFlashcards()[state.fcIndex];
          if (item) state.fcRatings[item.q] = rating;
          step(1);
        });
      }
    });

    renderFlashcards();
  }

  // --- VIEW 5: MOCK EXAM ---
  function updateMockTimerDisplay() {
    const el = document.getElementById("mock-timer");
    if (!el) return;
    const min = String(Math.floor(mockSecondsLeft / 60)).padStart(2, "0");
    const sec = String(mockSecondsLeft % 60).padStart(2, "0");
    el.textContent = `${min}:${sec}`;
  }

  function startMockTimer() {
    if (mockTimerHandle) clearInterval(mockTimerHandle);
    mockSecondsLeft = 20 * 60;
    updateMockTimerDisplay();
    mockTimerHandle = setInterval(() => {
      mockSecondsLeft = Math.max(0, mockSecondsLeft - 1);
      updateMockTimerDisplay();
      if (mockSecondsLeft === 0) {
        clearInterval(mockTimerHandle);
        state.mockSubmitted = true;
        saveState();
        renderMockExam();
      }
    }, 1000);
  }

  function renderMockExam() {
    const container = document.getElementById("mock-container");
    const startBtn = document.getElementById("mock-start-btn");
    if (!container) return;

    const questions = window.API_MOCK_EXAM_QUESTIONS || [];
    if (!state.mockStarted) {
      container.innerHTML = `<p>Klicke oben rechts auf <strong>Quiz starten</strong>, um die 15 prüfungsnahen Fragen mit 20-Minuten-Timer zu beginnen.</p>`;
      if (startBtn) startBtn.textContent = "Quiz starten";
      return;
    }

    if (startBtn) startBtn.textContent = "Neu starten";

    let score = 0;
    const blocks = questions
      .map((q, idx) => {
        const chosen = state.mockAnswers[q.id];
        if (state.mockSubmitted && Number(chosen) === q.answer) score += 1;

        const opts = q.options
          .map((opt, optIdx) => {
            const checked = Number(chosen) === optIdx ? "checked" : "";
            const disabled = state.mockSubmitted ? "disabled" : "";
            return `
              <label class="q-opt">
                <input type="radio" name="mock-${escapeHtml(q.id)}" value="${optIdx}" ${checked} ${disabled} data-mock-qid="${escapeHtml(q.id)}" />
                <span>${escapeHtml(opt)}</span>
              </label>
            `;
          })
          .join("");

        let feedback = "";
        if (state.mockSubmitted) {
          const isOk = Number(chosen) === q.answer;
          feedback = `<div class="callout ${isOk ? "callout-good" : "callout-bad"}" style="margin-top:0.5rem;margin-bottom:0;">
            <strong>${isOk ? "Richtig" : `Falsch (Richtig: Option ${q.answer + 1})`}:</strong> ${escapeHtml(q.explain)}
          </div>`;
        }

        return `
          <div class="q-block">
            <div class="q-title">${idx + 1}. [${escapeHtml(q.domain)}] ${escapeHtml(q.question)}</div>
            <div class="q-options">${opts}</div>
            ${feedback}
          </div>
        `;
      })
      .join("");

    const summary = state.mockSubmitted
      ? `<div class="callout ${score >= 11 ? "callout-good" : "callout-warn"}">
           <strong>Auswertung:</strong> ${score} / ${questions.length} Punkten (${Math.round((score / questions.length) * 100)}%) &mdash; ${score >= 11 ? "Bestanden! Sicher im Basis- und Sicherheitsfundament." : "Wiederhole die markierten Module oder Flashcards und versuche es erneut."}
         </div>`
      : "";

    const actionBar = !state.mockSubmitted
      ? `<div style="margin-top:1rem;"><button class="btn btn-primary" id="mock-submit-btn" type="button">Quiz auswerten</button></div>`
      : "";

    container.innerHTML = `${summary}${blocks}${actionBar}`;

    container.querySelectorAll("input[data-mock-qid]").forEach((radio) => {
      radio.addEventListener("change", () => {
        state.mockAnswers[radio.dataset.mockQid] = Number(radio.value);
        saveState();
      });
    });

    const submitBtn = document.getElementById("mock-submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (mockTimerHandle) clearInterval(mockTimerHandle);
        state.mockSubmitted = true;
        saveState();
        renderMockExam();
      });
    }
  }

  function initMockExam() {
    const startBtn = document.getElementById("mock-start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        state.mockStarted = true;
        state.mockSubmitted = false;
        state.mockAnswers = {};
        saveState();
        startMockTimer();
        renderMockExam();
      });
    }
    updateMockTimerDisplay();
    renderMockExam();
  }

  function renderAll() {
    setBeamer(state.beamer);
    setView(state.view, false);
    renderCurriculum();
    renderCheckpoints();
    renderLabsTab();
    renderCiResults();
    renderFlashcards();
    renderMockExam();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view, true));
    });

    const beamerBtn = document.getElementById("beamer-toggle-btn");
    if (beamerBtn) {
      beamerBtn.addEventListener("click", () => setBeamer(!state.beamer));
    }

    initCurriculumControls();
    initCheckpointsExport();
    initLabs();
    initFlashcards();
    initMockExam();

    applyHash();
    window.addEventListener("hashchange", applyHash);
    renderAll();
  });
})();
