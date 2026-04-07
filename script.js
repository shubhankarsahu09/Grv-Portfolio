(() => {
  const state = {
    filter: "all",
    query: "",
    page: 1,
    pageSize: 9,
  };

  // Replace with your EmailJS keys from https://dashboard.emailjs.com/
  const EMAILJS_PUBLIC_KEY = "RNmSxDKMKZAPehcR2"; 
  const EMAILJS_SERVICE_ID = "service_5vycnpm";
  const EMAILJS_TEMPLATE_ID = "template_83fddbv";

  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  const projects = Array.isArray(window.PROJECT_LIBRARY) ? window.PROJECT_LIBRARY : [];

  const testimonials = [
    {
      quote:
        "Xaurav restructured our messy footage into a sharp campaign that doubled completion rate in under three weeks.",
      name: "Maya Kapoor",
      role: "Creative Lead, NeonPix",
    },
    {
      quote:
        "Fast turnarounds, clean communication, and edits that actually understand audience behavior. That combination is rare.",
      name: "Daniel Chen",
      role: "Growth Strategist, Atlas Creators",
    },
    {
      quote:
        "We trusted him with a 90-minute documentary cut. The pacing and emotional build were exactly what we needed.",
      name: "Aarush Mehta",
      role: "Founder, Ripple Studios",
    },
  ];

  const dom = {
    header: document.querySelector(".header"),
    menuToggle: document.querySelector(".menu-toggle"),
    nav: document.querySelector(".nav"),
    chips: [...document.querySelectorAll(".chip")],
    search: document.querySelector("#project-search"),
    grid: document.querySelector("#project-grid"),
    loadMore: document.querySelector("#load-more"),
    counters: [...document.querySelectorAll("[data-counter]")],
    revealItems: [...document.querySelectorAll(".reveal")],
    testimonialShell: document.querySelector("#testimonial-shell"),
    year: document.querySelector("#year"),
    form: document.querySelector("#contact-form"),
    formMessage: document.querySelector("#form-message"),
    modal: document.querySelector("#project-modal"),
    modalTitle: document.querySelector("#modal-title"),
    modalClient: document.querySelector("#modal-client"),
    modalImage: document.querySelector("#modal-image"),
    modalDescription: document.querySelector("#modal-description"),
    modalMeta: document.querySelector("#modal-meta"),
    modalClose: document.querySelector("#modal-close"),
  };

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const getFilteredProjects = () => {
    const query = normalize(state.query);

    return projects.filter((project) => {
      const matchesFilter = state.filter === "all" || project.category === state.filter;
      const matchesQuery =
        !query ||
        normalize(project.title).includes(query) ||
        normalize(project.client).includes(query) ||
        normalize(project.description).includes(query);

      return matchesFilter && matchesQuery;
    });
  };

  const renderProjects = () => {
    if (!dom.grid) {
      return;
    }

    const filtered = getFilteredProjects();
    const visibleCount = state.page * state.pageSize;
    const visibleProjects = filtered.slice(0, visibleCount);

    if (visibleProjects.length === 0) {
      dom.grid.innerHTML = '<p class="empty-state">No projects found. Try another filter or keyword.</p>';
      dom.loadMore.style.display = "none";
      return;
    }

    dom.grid.innerHTML = visibleProjects
      .map(
        (project, idx) => `
          <article class="project-card reveal visible" data-id="${project.id}" style="transition-delay:${Math.min(idx * 30, 280)}ms">
            <img src="${project.image}" alt="${project.title} preview" loading="lazy" />
            <div class="project-copy">
              <h3>${project.title}</h3>
              <p>${project.client} — ${project.year}</p>
              <div class="project-tags">
                <span>${project.categoryLabel}</span>
                <span>${project.format}</span>
              </div>
            </div>
          </article>
        `
      )
      .join("");

    dom.loadMore.style.display = filtered.length > visibleProjects.length ? "inline-flex" : "none";
  };

  const animateCounters = () => {
    dom.counters.forEach((counter) => {
      const targetAttr = counter.dataset.counter;
      const delay = parseInt(counter.dataset.delay) || 0;
      const duration = parseInt(counter.dataset.duration) || 1100;
      const target = parseInt(targetAttr);
      const suffix = targetAttr.replace(/[0-9]/g, "");

      if (isNaN(target)) {
        return;
      }

      let value = 0;
      const step = Math.max(1, Math.floor(target / (duration / 16)));

      const tick = () => {
        value += step;
        if (value >= target) {
          counter.textContent = targetAttr;
          return;
        }

        counter.textContent = value + suffix;
        requestAnimationFrame(tick);
      };

      if (delay > 0) {
        setTimeout(() => requestAnimationFrame(tick), delay);
      } else {
        requestAnimationFrame(tick);
      }
    });
  };

  const setupRevealAnimations = () => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    dom.revealItems.forEach((item) => observer.observe(item));
  };

  const openModal = (project) => {
    if (!dom.modal || !project) {
      return;
    }

    dom.modalTitle.textContent = project.title;
    dom.modalClient.textContent = `${project.client} — ${project.year}`;
    dom.modalImage.src = project.image;
    dom.modalImage.alt = `${project.title} frame`;
    dom.modalDescription.textContent = project.description;
    dom.modalMeta.innerHTML = `
      <li>${project.categoryLabel}</li>
      <li>${project.format}</li>
      <li>${project.delivery}</li>
      <li>${project.highlight}</li>
    `;

    dom.modal.showModal();
  };

  const rotateTestimonials = () => {
    if (!dom.testimonialShell) {
      return;
    }

    let index = 0;

    const paint = () => {
      const item = testimonials[index];
      dom.testimonialShell.innerHTML = `
        <blockquote>"${item.quote}"</blockquote>
        <cite>${item.name} — ${item.role}</cite>
      `;
      index = (index + 1) % testimonials.length;
    };

    paint();
    setInterval(paint, 4600);
  };

  const handleForm = () => {
    if (!dom.form) {
      return;
    }

    dom.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(dom.form);
      const values = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        type: String(data.get("type") || "").trim(),
        message: String(data.get("message") || "").trim(),
      };

      if (!values.name || !values.email || !values.type || values.message.length < 25) {
        dom.formMessage.textContent = "Please complete all fields and add at least 25 characters in your message.";
        dom.formMessage.className = "form-message error";
        return;
      }

      const submitBtn = dom.form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      // Use EmailJS for professional delivery
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, dom.form)
        .then(() => {
          dom.formMessage.textContent = "Project brief sent! Check your inbox for a confirmation.";
          dom.formMessage.className = "form-message success";
          dom.form.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          const errorMsg = error?.text || error?.message || "Communication error";
          dom.formMessage.textContent = `Error: ${errorMsg}. Please email me directly.`;
          dom.formMessage.className = "form-message error";
        })
        .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  };

  const setupEvents = () => {
    window.addEventListener("scroll", () => {
      dom.header.classList.toggle("scrolled", window.scrollY > 12);
    });

    dom.menuToggle?.addEventListener("click", () => {
      const expanded = dom.menuToggle.getAttribute("aria-expanded") === "true";
      dom.menuToggle.setAttribute("aria-expanded", String(!expanded));
      dom.nav.classList.toggle("open");
    });

    dom.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.filter = chip.dataset.filter || "all";
        state.page = 1;
        dom.chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        renderProjects();
      });
    });

    dom.search?.addEventListener("input", (event) => {
      state.query = event.target.value;
      state.page = 1;
      renderProjects();
    });

    dom.loadMore?.addEventListener("click", () => {
      state.page += 1;
      renderProjects();
    });

    dom.grid?.addEventListener("click", (event) => {
      const card = event.target.closest(".project-card");
      if (!card) {
        return;
      }

      const id = Number(card.dataset.id);
      openModal(projects.find((item) => item.id === id));
    });

    dom.modalClose?.addEventListener("click", () => dom.modal.close());

    dom.modal?.addEventListener("click", (event) => {
      const bounds = dom.modal.getBoundingClientRect();
      const isInDialog =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      if (!isInDialog) {
        dom.modal.close();
      }
    });
  };

  const init = () => {
    dom.year.textContent = String(new Date().getFullYear());
    animateCounters();
    setupRevealAnimations();
    rotateTestimonials();
    handleForm();
    setupEvents();
    renderProjects();
  };

  init();
})();