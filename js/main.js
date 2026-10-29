(() => {
  const VK_URL = "https://vk.me/algrand72";

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Открыть меню");
      });
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  const dogsCard = document.getElementById("dogs-card");
  const catsCard = document.getElementById("cats-card");
  const dogsDetails = document.getElementById("dogs-details");
  const catsDetails = document.getElementById("cats-details");

  function togglePanel(panel, other) {
    if (!panel) return;
    const willOpen = panel.hasAttribute("hidden");
    if (other) other.setAttribute("hidden", "");
    if (willOpen) {
      panel.removeAttribute("hidden");
      panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    } else {
      panel.setAttribute("hidden", "");
    }
  }

  dogsCard?.addEventListener("click", (e) => {
    e.preventDefault();
    togglePanel(dogsDetails, catsDetails);
  });

  catsCard?.addEventListener("click", (e) => {
    e.preventDefault();
    togglePanel(catsDetails, dogsDetails);
  });

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
        ? "Текст заявки скопирован. Откроется VK — вставьте сообщение (Ctrl+V) и отправьте."
        : "Откроется VK. Скопируйте текст заявки вручную и отправьте сообщению.";
    }

    window.open(VK_URL, "_blank", "noopener,noreferrer");
  });
})();
