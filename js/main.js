(() => {
  const VK_URL = "https://vk.me/algrand72";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 981px)").matches;

  document.documentElement.classList.add("js-ready");
  if (reduceMotion) document.documentElement.classList.add("reduced-motion");

  /* ---------- Nav ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Меню");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Меню");
      });
    });
  }

  /* ---------- Form ---------- */
  const form = document.getElementById("booking-form");
  const status = document.getElementById("form-status");

  function buildMessage(data) {
    return [
      "Здравствуйте! Заявка на передержку с сайта АльГранд72.",
      "",
      `Имя: ${data.name}`,
      `Телефон: ${data.phone}`,
      `Питомец: ${data.pet}`,
      `Даты: ${data.dates}`,
      data.comment ? `Комментарий: ${data.comment}` : null,
      "",
      "Прошу рассчитать стоимость и подсказать свободные места.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      pet: String(fd.get("pet") || "").trim(),
      dates: String(fd.get("dates") || "").trim(),
      comment: String(fd.get("comment") || "").trim(),
    };

    if (!data.name || !data.phone || !data.pet || !data.dates) {
      if (status) status.textContent = "Заполните обязательные поля.";
      return;
    }

    const message = buildMessage(data);
    const copied = await copyText(message);

    if (status) {
      status.textContent = copied
        ? "Текст скопирован. Откроется VK — вставьте сообщение (Ctrl+V) и отправьте."
        : "Откроется VK. Вставьте текст заявки вручную.";
    }

    window.open(VK_URL, "_blank", "noopener,noreferrer");
  });

  /* ---------- Motion ---------- */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll(".hero-line").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Hero load intro
  const heroLines = gsap.utils.toArray(".hero-line");
  if (heroLines.length) {
    if (reduceMotion) {
      gsap.set(heroLines, { opacity: 1, y: 0 });
    } else {
      gsap.to(heroLines, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });
    }
  }

  if (!reduceMotion) {
    // Soft hero scrub — photo scale + panel drift (lighter on mobile)
    const heroMediaImg = document.querySelector(".hero-media img");
    const heroPanel = document.querySelector(".hero-panel");
    const hero = document.querySelector(".hero");

    if (hero && heroMediaImg) {
      gsap.to(heroMediaImg, {
        scale: isDesktop() ? 1.08 : 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    if (hero && heroPanel && isDesktop()) {
      gsap.to(heroPanel, {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.85,
        },
      });
    }

    // Clip-path image reveals (desktop + tablet; skip heavy counter-zoom on small screens)
    gsap.utils.toArray("[data-reveal]").forEach((frame) => {
      const img = frame.querySelector("img");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: "top 88%",
          once: true,
        },
      });

      tl.fromTo(
        frame,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: isDesktop() ? 1.15 : 0.75, ease: "power3.out" }
      );

      if (img && isDesktop()) {
        tl.fromTo(
          img,
          { scale: 1.18 },
          { scale: 1, duration: 1.25, ease: "power2.out" },
          0
        );
      } else if (img) {
        gsap.set(img, { scale: 1 });
      }
    });

    // Text line reveals
    gsap.utils.toArray(".reveal-line").forEach((el) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
      });
    });

    // Facts strip
    const facts = document.querySelector(".facts");
    if (facts) {
      gsap.from(facts.children, {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: facts,
          start: "top 92%",
          once: true,
        },
      });
    }
  } else {
    gsap.set("[data-reveal]", { clipPath: "none" });
    gsap.set("[data-reveal] img", { scale: 1 });
  }

  // Process pinned steps — desktop only
  const STEPS = [
    {
      num: "01",
      title: "Заявка",
      body: "Пишете нам даты и особенности питомца — в форме ниже или в VK.",
      img: "images/guest-4.jpg",
      alt: "Заявка на передержку",
    },
    {
      num: "02",
      title: "Обсуждение",
      body: "Уточняем характер, корм, режим и подбираем подходящий номер.",
      img: "images/guest-7.jpg",
      alt: "Обсуждение особенностей питомца",
    },
    {
      num: "03",
      title: "Заезд",
      body: "Привозите питомца. При желании сначала смотрите гостиницу.",
      img: "images/guest-6.jpg",
      alt: "Заезд питомца в зоогостиницу",
    },
    {
      num: "04",
      title: "Отчёты",
      body: "Каждый день присылаем фото и видео — вы всегда в курсе.",
      img: "images/guest-5.jpg",
      alt: "Ежедневные фотоотчёты",
    },
    {
      num: "05",
      title: "Выезд",
      body: "Забираете питомца. Спокойно — как после гостей у близких.",
      img: "images/guest-3.jpg",
      alt: "Выезд питомца",
    },
  ];

  const processSection = document.querySelector(".process");
  const processPin = document.querySelector(".process-pin");
  const processFill = document.getElementById("process-fill");
  const processNum = document.getElementById("process-num");
  const processTitle = document.getElementById("process-title");
  const processBody = document.getElementById("process-body");
  const processImg = document.getElementById("process-img");
  const processVisual = document.querySelector(".process-visual");

  let processTrigger = null;
  let currentStep = -1;

  function showStep(i) {
    if (i === currentStep || !STEPS[i]) return;
    currentStep = i;
    const step = STEPS[i];

    if (reduceMotion) {
      if (processNum) processNum.textContent = step.num;
      if (processTitle) processTitle.textContent = step.title;
      if (processBody) processBody.textContent = step.body;
      if (processImg) {
        processImg.src = step.img;
        processImg.alt = step.alt;
      }
      return;
    }

    const textEls = [processNum, processTitle, processBody].filter(Boolean);
    gsap.to(textEls, {
      opacity: 0,
      y: 10,
      duration: 0.18,
      overwrite: true,
      onComplete: () => {
        if (processNum) processNum.textContent = step.num;
        if (processTitle) processTitle.textContent = step.title;
        if (processBody) processBody.textContent = step.body;
        gsap.fromTo(
          textEls,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out", overwrite: true }
        );
      },
    });

    if (processImg && processVisual) {
      gsap.to(processImg, {
        opacity: 0,
        duration: 0.2,
        overwrite: true,
        onComplete: () => {
          processImg.src = step.img;
          processImg.alt = step.alt;
          gsap.fromTo(
            processImg,
            { opacity: 0, scale: 1.06 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", overwrite: true }
          );
        },
      });
    }
  }

  function setupProcess() {
    if (processTrigger) {
      processTrigger.kill();
      processTrigger = null;
    }
    currentStep = -1;

    if (!processSection || !processPin || !isDesktop() || reduceMotion) {
      showStep(0);
      if (processFill) processFill.style.width = "0%";
      return;
    }

    showStep(0);

    processTrigger = ScrollTrigger.create({
      trigger: processPin,
      start: "top top+=64",
      end: () => `+=${window.innerHeight * (STEPS.length * 0.55)}`,
      pin: true,
      scrub: 0.35,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (processFill) processFill.style.width = `${progress * 100}%`;
        const idx = Math.min(
          STEPS.length - 1,
          Math.floor(progress * STEPS.length + 0.001)
        );
        showStep(idx);
      },
    });
  }

  setupProcess();

  // Soft finale background drift
  if (!reduceMotion) {
    const finaleBg = document.querySelector(".finale-bg img");
    const finale = document.querySelector(".finale");
    if (finaleBg && finale) {
      gsap.fromTo(
        finaleBg,
        { scale: 1.12, yPercent: 0 },
        {
          scale: 1,
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: finale,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        }
      );
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupProcess();
      ScrollTrigger.refresh();
    }, 200);
  });

  // After fonts/images settle
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
