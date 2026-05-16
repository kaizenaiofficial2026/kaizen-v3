(() => {
  "use strict";

  // Proportional desktop scaling: lock layout to 1728px reference width
  // so every desktop window size renders the same composition.
  const REF_WIDTH = 1728;
  const MOBILE_MAX = 760;
  function applyPageZoom() {
    const w = window.innerWidth;
    if (w > MOBILE_MAX) {
      document.body.style.setProperty("--page-zoom", w / REF_WIDTH);
    } else {
      document.body.style.removeProperty("--page-zoom");
    }
  }
  applyPageZoom();
  window.addEventListener("resize", applyPageZoom);

  const defaults = window.KAIZEN_TWEAKS || {};
  const LS_KEY = "kaizen_tweaks_v1";
  let tweaks = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    tweaks = { ...defaults, ...saved };
  } catch (e) {}
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  const root = document.documentElement;
  function applyTheme(t) {
    if (t === "auto") {
      const d = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = d ? "dark" : "light";
    } else root.dataset.theme = t;
  }
  applyTheme(tweaks.theme || "auto");
  function applyHue(h) {
    root.style.setProperty("--accent-h", h);
  }
  applyHue(tweaks.accentHue ?? 45);
  function applyAnim(n) {
    root.style.setProperty("--anim-level", n / 10);
  }
  applyAnim(tweaks.animationLevel ?? 8);
  function applyGrain(on) {
    document.body.classList.toggle("grain-on", !!on);
  }
  applyGrain(tweaks.grain);
  const isTouch = () => window.matchMedia("(hover: none)").matches;
  function applyHalo(on) {
    document.body.classList.toggle("halo-on", !!on && !isTouch());
  }
  applyHalo(tweaks.cursorHalo);
  function applyHeroVariant(v) {
    document.body.dataset.heroVariant = v;
    const right = qs(".hero-right");
    if (!right) return;
    const grid = qs(".hero-grid");
    const tr = qs(".transcript");
    if (v === "minimal") {
      right.style.display = "none";
      if (grid) grid.style.gridTemplateColumns = "1fr";
    } else if (v === "wave") {
      right.style.display = "";
      if (tr) tr.style.display = "none";
      if (grid) grid.style.gridTemplateColumns = "";
    } else {
      right.style.display = "";
      if (tr) tr.style.display = "";
      if (grid) grid.style.gridTemplateColumns = "";
    }
  }
  applyHeroVariant(tweaks.heroVariant || "transcript");

  function saveTweaks() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tweaks));
    } catch (e) {}
    try {
      window.parent.postMessage(
        { type: "__edit_mode_set_keys", edits: tweaks },
        "*",
      );
    } catch (e) {}
  }

  const nav = qs("#nav");
  function onScroll() {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 20);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (y / h) * 100 : 0;
    const prog = qs("#prog");
    if (prog) prog.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = qsa(".nav-ul a[data-s]");
  const sections = navLinks
    .map((a) => {
      const id = a.getAttribute("href").replace("#", "");
      return { a, el: document.getElementById(id) };
    })
    .filter((s) => s.el);
  const spyObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((n) => n.classList.remove("active"));
          const m = sections.find((s) => s.el === e.target);
          m?.a.classList.add("active");
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );
  sections.forEach((s) => spyObs.observe(s.el));

  const ham = qs("#ham");
  const drawer = qs("#drawer");
  ham?.addEventListener("click", () => {
    const o = drawer.classList.toggle("open");
    ham.classList.toggle("open", o);
  });
  qsa("#drawer a").forEach((a) =>
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      ham.classList.remove("open");
    }),
  );

  setTimeout(() => qs(".hero-h")?.classList.add("in"), 60);

  const waveBars = qs("#waveBars");
  if (waveBars) {
    waveBars.innerHTML = "";
    const barW = 3,
      barGap = 4;
    const barCount = Math.max(
      20,
      Math.floor((waveBars.offsetWidth || 320) / (barW + barGap)),
    );
    for (let i = 0; i < barCount; i++)
      waveBars.appendChild(document.createElement("span"));
    const bars = waveBars.children;
    let t = 0;
    let rafId;
    let waveFrame = 0;
    function tickWave() {
      rafId = requestAnimationFrame(tickWave);
      if (++waveFrame % 2 !== 0) return;
      t += 0.08;
      for (let i = 0; i < bars.length; i++) {
        const p = i / bars.length;
        const v = Math.sin(t + p * 6.28 * 2) * 0.5 + 0.5;
        const v2 = Math.sin(t * 0.7 + p * 6.28) * 0.5 + 0.5;
        bars[i].style.transform = "scaleY(" + (8 + v * v2 * 72) / 40 + ")";
        bars[i].style.opacity = 0.35 + v * 0.65;
      }
    }
    const heroIo = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) tickWave();
        else cancelAnimationFrame(rafId);
      });
    });
    const hero = qs(".hero");
    if (hero) heroIo.observe(hero);
  }

  const tRows = qsa(".t-row");
  let tscStarted = false;
  function typeTranscript() {
    if (tscStarted) return;
    tscStarted = true;
    tRows.forEach((row, i) => {
      const msgEl = row.querySelector(".t-msg");
      const text = msgEl.getAttribute("data-text") || "";
      setTimeout(
        () => {
          row.classList.add("show");
          let j = 0;
          const speed = 18 + Math.random() * 10;
          const iv = setInterval(() => {
            msgEl.textContent = text.slice(0, ++j);
            if (j >= text.length) clearInterval(iv);
          }, speed);
        },
        700 + i * 1800,
      );
    });
  }
  const heroR = qs(".hero-right");
  if (heroR) {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            typeTranscript();
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(heroR);
  }

  qsa(
    ".sec-head, .sol-card, .ben, .price, .q-small, .pr-step, .cmp-col, .quote-main, .faq-item, .ft-col",
  ).forEach((el, i) => {
    el.classList.add("reveal-up");
    el.dataset.d = (i % 4) + 1;
  });
  const revObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );
  qsa(".reveal-up").forEach((el) => revObs.observe(el));

  qsa(".tilt").forEach((el) => {
    let raf;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      const rx = ((my - 50) / 50) * -3;
      const ry = ((mx - 50) / 50) * 3;
      el.style.setProperty("--mx", mx + "%");
      el.style.setProperty("--my", my + "%");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          "perspective(900px) rotateX(" +
          rx +
          "deg) rotateY(" +
          ry +
          "deg) translateY(-4px)";
      });
    });
    el.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    });
  });

  const halo = qs("#halo");
  const dot = qs("#halo-dot");
  let tx = -100,
    ty = -100,
    cx = -100,
    cy = -100;
  let haloRaf = null;

  function haloLoop() {
    const dx = tx - cx,
      dy = ty - cy;
    cx += dx * 0.12;
    cy += dy * 0.12;
    if (halo)
      halo.style.transform =
        "translate(calc(" + cx + "px - 50%), calc(" + cy + "px - 50%))";
    // Stop the loop once the halo has caught up (within 0.5px)
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      haloRaf = null;
    } else {
      haloRaf = requestAnimationFrame(haloLoop);
    }
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot)
        dot.style.transform =
          "translate(calc(" + tx + "px - 50%), calc(" + ty + "px - 50%))";
      // Only start the RAF loop if it isn't already running
      if (!haloRaf) haloRaf = requestAnimationFrame(haloLoop);
    },
    { passive: true },
  );
  qsa("a, button, .tilt, summary").forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("halo-hover"),
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("halo-hover"),
    );
  });

  const ppFill = qs("#ppFill");
  const ppLbls = qsa(".pp-lbl");
  const prSteps = qsa(".pr-step");
  if (ppFill && prSteps.length) {
    const stepObs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const idx = prSteps.indexOf(e.target);
            ppLbls.forEach((l, i) => l.classList.toggle("active", i <= idx));
            ppFill.style.width = ((idx + 1) / prSteps.length) * 100 + "%";
          }
        });
      },
      { threshold: 0.5 },
    );
    prSteps.forEach((s) => stepObs.observe(s));
  }

  const clockEl = qs(".corner.tr");
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const lkt = new Date(utc + 5.5 * 3600000);
    const hh = String(lkt.getHours()).padStart(2, "0");
    const mm = String(lkt.getMinutes()).padStart(2, "0");
    clockEl.textContent = "Colombo · " + hh + ":" + mm + " LKT";
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* Legal modal */
  const legalModal = qs("#legalModal");
  function openLegalModal(tab) {
    if (!legalModal) return;
    legalModal
      .querySelectorAll(".legal-tab")
      .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    legalModal
      .querySelectorAll(".legal-pane")
      .forEach((p) =>
        p.classList.toggle("active", p.id === "legalPane-" + tab),
      );
    legalModal.classList.add("open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
  function closeLegalModal() {
    if (!legalModal) return;
    legalModal.classList.remove("open");
    legalModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }
  legalModal?.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close-legal")) {
      closeLegalModal();
      return;
    }
    const tab = e.target.closest(".legal-tab");
    if (tab) {
      legalModal
        .querySelectorAll(".legal-tab")
        .forEach((b) => b.classList.remove("active"));
      legalModal
        .querySelectorAll(".legal-pane")
        .forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      qs("#legalPane-" + tab.dataset.tab)?.classList.add("active");
    }
  });
  document.querySelectorAll(".legal-trigger").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openLegalModal(el.dataset.tab);
    });
  });

  const modal = qs("#bookingModal");
  const modalForm = qs("#bookingForm");
  const modalSuccess = qs("#modalSuccess");
  const modalStatus = qs("#modalStatus");
  function openModal() {
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
  function closeModal() {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    setTimeout(() => {
      modalForm?.reset();
      modalSuccess?.classList.remove("show");
      if (modalForm) modalForm.style.display = "";
      if (modalStatus) modalStatus.textContent = "";
      goToStep(1);
    }, 400);
  }

  // ── Multi-step form ──
  const stepHeadings = {
    1: 'Tell us a bit <span class="italic gold">about you.</span>',
    2: 'Tell us about <span class="italic gold">your business.</span>',
    3: 'What are you <span class="italic gold">looking for?</span>',
  };
  const stepDescs = {
    1: "Your name and contact so we know who we're talking to.",
    2: "A few details about your company and team.",
    3: "Your budget and what you want to automate.",
  };

  let currentStep = 1;
  const formSteps = qsa(".form-step");
  const stepDots  = qsa(".step-dot");
  const stepLines = qsa(".step-line");
  const stepHeadingEl = qs(".step-heading");
  const stepDescEl    = qs(".step-desc");

  function goToStep(n) {
    currentStep = n;
    formSteps.forEach((s) => s.classList.toggle("active", +s.dataset.step === n));
    stepDots.forEach((d) => {
      const i = +d.dataset.step;
      d.classList.toggle("active", i === n);
      d.classList.toggle("done", i < n);
    });
    stepLines.forEach((l, i) => l.classList.toggle("done", i < n - 1));
    if (stepHeadingEl) stepHeadingEl.innerHTML = stepHeadings[n];
    if (stepDescEl)    stepDescEl.textContent  = stepDescs[n];
    qs(".modal-card")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  function markInvalid(inp, errEl) {
    inp.classList.add("field-invalid");
    errEl?.classList.add("show");
    const clear = () => {
      inp.classList.remove("field-invalid");
      errEl?.classList.remove("show");
    };
    inp.addEventListener("input", clear, { once: true });
    inp.addEventListener("change", clear, { once: true });
  }

  function validateStep(n) {
    const step = qs(`.form-step[data-step="${n}"]`);
    if (!step) return true;
    let valid = true;

    step.querySelectorAll("input[required], select[required], textarea[required]").forEach((inp) => {
      if (!inp.value.trim()) {
        markInvalid(inp, null);
        valid = false;
      }
    });

    if (n === 1) {
      const email = step.querySelector('input[name="email"]');
      if (email && email.value.trim() && !EMAIL_RE.test(email.value.trim())) {
        markInvalid(email, qs("#emailError"));
        valid = false;
      }
    }

    if (n === 2) {
      const website = step.querySelector('input[name="website"]');
      if (website && website.value.trim() && !URL_RE.test(website.value.trim())) {
        markInvalid(website, qs("#websiteError"));
        valid = false;
      }
      const phone = step.querySelector('input[name="phone"]');
      if (phone && phone.value.trim()) {
        const digits = phone.value.replace(/\D/g, "");
        if (digits.length < 6 || digits.length > 15) {
          markInvalid(phone, qs("#phoneError"));
          valid = false;
        }
      }
    }

    if (n === 3) {
      const budget = qs("#budgetHidden");
      if (budget && !budget.value) {
        qs("#budgetError")?.classList.add("show");
        valid = false;
      }
      const interest = step.querySelector('select[name="interest"]');
      if (interest && !interest.value) {
        qs("#interestSel")?.classList.add("field-invalid");
        valid = false;
      }
    }

    return valid;
  }

  qsa(".step-next").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    }),
  );
  qsa(".step-back").forEach((btn) =>
    btn.addEventListener("click", () => goToStep(currentStep - 1),
  ));
  qsa(".booking-trigger").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    }),
  );
  qsa("[data-close]").forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal?.classList.contains("open")) closeModal();
      if (legalModal?.classList.contains("open")) closeLegalModal();
      if (tweaksPanel?.classList.contains("open")) toggleTweaks(false);
    }
  });
  /* Custom select dropdown */
  const interestSel = qs("#interestSel");
  if (interestSel) {
    const trigger = interestSel.querySelector(".cust-sel-trigger");
    const valEl = interestSel.querySelector(".cust-sel-val");
    const opts = interestSel.querySelectorAll(".cust-opt");
    const nativeSel = interestSel.querySelector("select");
    let open = false;
    function closeDropdown() {
      open = false;
      interestSel.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
    function openDropdown() {
      open = true;
      interestSel.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
    trigger.addEventListener("click", () =>
      open ? closeDropdown() : openDropdown(),
    );
    opts.forEach((opt) => {
      function selectOpt(o) {
        opts.forEach((x) => x.classList.remove("selected"));
        o.classList.add("selected");
        valEl.textContent = o.dataset.val;
        valEl.classList.remove("placeholder");
        if (nativeSel) {
          const match = [...nativeSel.options].find(
            (x) => x.value === o.dataset.val || x.text === o.dataset.val,
          );
          if (match) nativeSel.value = match.value || match.text;
        }
        interestSel.classList.remove("field-invalid");
        closeDropdown();
      }
      opt.addEventListener("click", () => selectOpt(opt));
      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOpt(opt);
        }
      });
    });
    document.addEventListener("click", (e) => {
      if (open && !interestSel.contains(e.target)) closeDropdown();
    });
  }

  // Budget buttons
  const budgetBtns = qsa(".budget-btn");
  const budgetHidden = qs("#budgetHidden");
  budgetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      budgetBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (budgetHidden) budgetHidden.value = btn.dataset.val;
      qs("#budgetError")?.classList.remove("show");
    });
  });

  // ── Country picker ──
  const COUNTRIES = [
    { f: "🇱🇰", n: "Sri Lanka", d: "+94" },
    { f: "🇺🇸", n: "United States", d: "+1" },
    { f: "🇬🇧", n: "United Kingdom", d: "+44" },
    { f: "🇦🇺", n: "Australia", d: "+61" },
    { f: "🇨🇦", n: "Canada", d: "+1" },
    { f: "🇮🇳", n: "India", d: "+91" },
    { f: "🇸🇬", n: "Singapore", d: "+65" },
    { f: "🇦🇪", n: "UAE", d: "+971" },
    { f: "🇩🇪", n: "Germany", d: "+49" },
    { f: "🇫🇷", n: "France", d: "+33" },
    { f: "🇳🇱", n: "Netherlands", d: "+31" },
    { f: "🇯🇵", n: "Japan", d: "+81" },
    { f: "🇲🇾", n: "Malaysia", d: "+60" },
    { f: "🇮🇩", n: "Indonesia", d: "+62" },
    { f: "🇵🇭", n: "Philippines", d: "+63" },
    { f: "🇿🇦", n: "South Africa", d: "+27" },
    { f: "🇳🇬", n: "Nigeria", d: "+234" },
    { f: "🇧🇷", n: "Brazil", d: "+55" },
    { f: "🇲🇽", n: "Mexico", d: "+52" },
    { f: "🇳🇿", n: "New Zealand", d: "+64" },
    { f: "🇰🇷", n: "South Korea", d: "+82" },
    { f: "🇨🇳", n: "China", d: "+86" },
    { f: "🇵🇰", n: "Pakistan", d: "+92" },
    { f: "🇧🇩", n: "Bangladesh", d: "+880" },
    { f: "🇮🇹", n: "Italy", d: "+39" },
    { f: "🇪🇸", n: "Spain", d: "+34" },
    { f: "🇵🇹", n: "Portugal", d: "+351" },
    { f: "🇸🇪", n: "Sweden", d: "+46" },
    { f: "🇨🇭", n: "Switzerland", d: "+41" },
    { f: "🇹🇭", n: "Thailand", d: "+66" },
    { f: "🇻🇳", n: "Vietnam", d: "+84" },
    { f: "🇶🇦", n: "Qatar", d: "+974" },
    { f: "🇸🇦", n: "Saudi Arabia", d: "+966" },
    { f: "🇰🇪", n: "Kenya", d: "+254" },
    { f: "🇬🇭", n: "Ghana", d: "+233" },
    { f: "🇦🇷", n: "Argentina", d: "+54" },
    { f: "🇨🇴", n: "Colombia", d: "+57" },
    { f: "🇵🇪", n: "Peru", d: "+51" },
    { f: "🇮🇱", n: "Israel", d: "+972" },
    { f: "🇹🇷", n: "Turkey", d: "+90" },
  ];
  let selectedDial = "+94";
  const countrySelEl = qs("#countrySel");
  const countryTriggerEl = qs("#countryTrigger");
  const countryFlagEl = qs("#countryFlag");
  const countryCodeLblEl = qs("#countryCodeLbl");
  const countryItemsEl = qs("#countryItems");
  const countrySearchEl = qs("#countrySearch");
  const phoneInputEl = qs("#phoneInput");
  const phoneErrorEl = qs("#phoneError");

  function renderCountries(list) {
    if (!countryItemsEl) return;
    countryItemsEl.innerHTML = "";
    list.forEach((c) => {
      const li = document.createElement("div");
      li.className =
        "country-item" +
        (c.d === selectedDial && c.n === (countryFlagEl?.title || "Sri Lanka")
          ? " ci-active"
          : "");
      li.setAttribute("role", "option");
      li.innerHTML = `<span class="country-item-flag">${c.f}</span><span class="country-item-name">${c.n}</span><span class="country-item-dial">${c.d}</span>`;
      li.addEventListener("click", () => {
        selectedDial = c.d;
        if (countryFlagEl) {
          countryFlagEl.textContent = c.f;
          countryFlagEl.title = c.n;
        }
        if (countryCodeLblEl) countryCodeLblEl.textContent = c.d;
        countrySelEl?.classList.remove("open");
        if (countryTriggerEl)
          countryTriggerEl.setAttribute("aria-expanded", "false");
        if (countrySearchEl) countrySearchEl.value = "";
        renderCountries(COUNTRIES);
      });
      countryItemsEl.appendChild(li);
    });
  }
  if (countrySelEl) {
    renderCountries(COUNTRIES);
    countryTriggerEl?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = countrySelEl.classList.toggle("open");
      countryTriggerEl.setAttribute("aria-expanded", isOpen);
      if (isOpen) setTimeout(() => countrySearchEl?.focus(), 50);
    });
    countrySearchEl?.addEventListener("input", () => {
      const q = countrySearchEl.value.toLowerCase();
      renderCountries(
        q
          ? COUNTRIES.filter(
              (c) => c.n.toLowerCase().includes(q) || c.d.includes(q),
            )
          : COUNTRIES,
      );
    });
    document.addEventListener("click", (e) => {
      if (countrySelEl && !countrySelEl.contains(e.target)) {
        countrySelEl.classList.remove("open");
        countryTriggerEl?.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Phone validation
  phoneInputEl?.addEventListener("blur", () => {
    const digits = (phoneInputEl.value || "").replace(/\D/g, "");
    if (phoneInputEl.value && digits.length < 6) {
      phoneErrorEl?.classList.add("show");
    } else {
      phoneErrorEl?.classList.remove("show");
    }
  });
  phoneInputEl?.addEventListener("input", () => {
    if (phoneErrorEl?.classList.contains("show"))
      phoneErrorEl.classList.remove("show");
  });

  const EMAILJS_SERVICE_ID = "service_l45vbyb";
  const EMAILJS_TEMPLATE_ID = "template_1vi7v91";
  const EMAILJS_PUBLIC_KEY = "l0OAiRQ3h3Zpw1AMn";
  window.emailjs?.init({ publicKey: EMAILJS_PUBLIC_KEY });

  modalForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    const btn = modalForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending…";
    if (modalStatus) {
      modalStatus.textContent = "Sending your request…";
      modalStatus.style.color = "";
    }
    try {
      if (!window.emailjs) throw new Error("Email service unavailable.");
      const templateParams = Object.fromEntries(
        new FormData(modalForm).entries(),
      );
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { ...templateParams, source: "Kaizen AI Website" },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      modalForm.style.display = "none";
      modalSuccess?.classList.add("show");
    } catch (err) {
      if (modalStatus) {
        modalStatus.textContent =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        modalStatus.style.color = "#b44d2a";
      }
      btn.disabled = false;
      btn.textContent = "Request my call →";
    }
  });

  const tweaksPanel = qs("#tweaks");
  const handle = document.createElement("button");
  // handle.className = "tweaks-handle";
  handle.setAttribute("aria-label", "Open tweaks");
  handle.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';
  document.body.appendChild(handle);
  function toggleTweaks(force) {
    const open =
      force !== undefined ? force : !tweaksPanel.classList.contains("open");
    tweaksPanel.classList.toggle("open", open);
    tweaksPanel.setAttribute("aria-hidden", open ? "false" : "true");
    handle.style.opacity = open ? "0" : "1";
    handle.style.pointerEvents = open ? "none" : "auto";
  }
  handle.addEventListener("click", () => toggleTweaks(true));
  qs("#twClose")?.addEventListener("click", () => toggleTweaks(false));

  function syncSegs() {
    qsa(".tw-seg").forEach((seg) => {
      const key = seg.dataset.key;
      const v = String(tweaks[key] ?? "");
      qsa("button", seg).forEach((b) =>
        b.classList.toggle("on", b.dataset.v === v),
      );
    });
  }
  syncSegs();
  qsa(".tw-seg").forEach((seg) => {
    const key = seg.dataset.key;
    qsa("button", seg).forEach((b) => {
      b.addEventListener("click", () => {
        let v = b.dataset.v;
        if (v === "true") v = true;
        else if (v === "false") v = false;
        tweaks[key] = v;
        syncSegs();
        if (key === "theme") applyTheme(v);
        if (key === "grain") applyGrain(v);
        if (key === "cursorHalo") applyHalo(v);
        if (key === "heroVariant") applyHeroVariant(v);
        saveTweaks();
      });
    });
  });

  const hueSlider = qs("#hueSlider");
  const hueVal = qs("#hueVal");
  if (hueSlider) {
    hueSlider.value = tweaks.accentHue ?? 45;
    hueVal.textContent = hueSlider.value + "°";
    hueSlider.addEventListener("input", () => {
      tweaks.accentHue = +hueSlider.value;
      hueVal.textContent = hueSlider.value + "°";
      applyHue(tweaks.accentHue);
      saveTweaks();
    });
  }
  const animSlider = qs("#animSlider");
  const animVal = qs("#animVal");
  if (animSlider) {
    animSlider.value = tweaks.animationLevel ?? 8;
    animVal.textContent = animSlider.value;
    animSlider.addEventListener("input", () => {
      tweaks.animationLevel = +animSlider.value;
      animVal.textContent = animSlider.value;
      applyAnim(tweaks.animationLevel);
      saveTweaks();
    });
  }

  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!d || !d.type) return;
    if (d.type === "__activate_edit_mode") toggleTweaks(true);
    if (d.type === "__deactivate_edit_mode") toggleTweaks(false);
  });
  try {
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  } catch (e) {}

  const themeToggle = qs("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      tweaks.theme = next;
      applyTheme(next);
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        saved.theme = next;
        localStorage.setItem(LS_KEY, JSON.stringify(saved));
      } catch (e) {}
    });
  }
})();
