/* UGC Portfolio — interactions */
(function () {
  "use strict";

  // ---- Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky header shadow on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-link").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Active nav link based on visible section
  const sections = ["portfolio", "services", "prices", "resume", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll(".primary-nav .nav-link");

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) => {
              l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  // ---- Reveal-on-scroll for sections / cards
  const revealTargets = document.querySelectorAll(
    ".profile-top__inner, .section-title, .hero-tag, .hero-carousel, .service-card, .package-card, .testimonial, .resume-col, .contact-inner, .cta-row"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  // ---- Projects grid: staggered fade-in left → right on scroll
  const projectGrid = document.querySelector(".projects .project-grid");
  const projectCards = projectGrid ? projectGrid.querySelectorAll(".project-card") : null;
  if (projectGrid && projectCards && projectCards.length) {
    projectCards.forEach((card) => {
      card.classList.add("reveal");
    });
    const staggerMs = 90;
    const reduceMotionProjects = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && !reduceMotionProjects) {
      const projectGridObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            projectCards.forEach((card, i) => {
              window.setTimeout(() => {
                card.classList.add("is-visible");
              }, i * staggerMs);
            });
            projectGridObserver.unobserve(projectGrid);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
      );
      projectGridObserver.observe(projectGrid);
    } else {
      projectCards.forEach((card) => card.classList.add("is-visible"));
    }
  }

  // ---- Project video lightbox
  const modal = document.getElementById("video-modal");
  const modalVideo = modal ? modal.querySelector(".video-modal__video") : null;
  const modalClose = modal ? modal.querySelector(".video-modal__close") : null;

  function openVideo(src) {
    if (!modal || !modalVideo) return;
    if (src) {
      modalVideo.src = src;
      modalVideo.load();
    }
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    setTimeout(() => modalVideo.play().catch(() => {}), 80);
  }
  function closeVideo() {
    if (!modal || !modalVideo) return;
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  document.querySelectorAll(".project-card").forEach((card) => {
    const src = card.getAttribute("data-video");
    const btn = card.querySelector(".play-btn");
    const thumb = card.querySelector(".project-thumb");
    [btn, thumb].forEach((el) => {
      if (!el) return;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (src) openVideo(src);
      });
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeVideo);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeVideo();
    });
    modal.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeVideo();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.hasAttribute("open")) closeVideo();
  });

  const heroCarousel = document.querySelector("[data-hero-carousel]");
  if (heroCarousel) {
    const track = heroCarousel.querySelector("[data-carousel-track]");
    const cells = heroCarousel.querySelectorAll("[data-carousel-slide]");
    const prevBtn = heroCarousel.querySelector("[data-carousel-prev]");
    const nextBtn = heroCarousel.querySelector("[data-carousel-next]");
    const dotsHost = heroCarousel.querySelector("[data-carousel-dots]");
    const n = cells.length;
    const layout = heroCarousel.getAttribute("data-carousel-layout") || "coverflow";

    if (track && n > 0) {
      let index = 0;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) heroCarousel.setAttribute("data-reduce-motion", "true");

      const labels = [
        "Listening Corner",
        "Bartesian Cocktail Maker",
        "Power of Lighting",
        "Dr. Rejuall Skincare",
        "Copenhagen Decor",
        "Home Boredom"
      ];

      function shortestDelta(i, active) {
        let d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        return d;
      }

      function syncVideos() {
        cells.forEach((cell, i) => {
          const v = cell.querySelector("video");
          if (!v) return;
          if (i === index) {
            v.muted = true;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      }

      function layoutCoverflow() {
        track.style.transform = "";
        const cw = heroCarousel.offsetWidth || 360;
        const spread = Math.min(182, Math.max(86, cw * 0.38));
        const rotY = 48;
        const zFront = 108;
        const zStep = 60;
        const sActive = reduceMotion ? 1 : 1.09;
        const s1 = 0.85;
        const s2 = 0.73;

        cells.forEach((cell, i) => {
          const d = shortestDelta(i, index);
          const ad = Math.abs(d);
          let tx = 0;
          let ry = 0;
          let tz = zFront;
          let sc = 1;
          let op = 1;
          let zi = 10;

          if (d === 0) {
            sc = sActive;
            tz = zFront + (reduceMotion ? 0 : 22);
            zi = 48;
          } else if (d < 0) {
            tx = -spread * Math.pow(ad, 0.9);
            ry = rotY * ad;
            tz = -zStep * ad;
            sc = ad === 1 ? s1 : s2;
            zi = 28 - ad;
            op = ad >= 2 ? 0.68 : 0.92;
          } else {
            tx = spread * Math.pow(ad, 0.9);
            ry = -rotY * ad;
            tz = -zStep * ad;
            sc = ad === 1 ? s1 : s2;
            zi = 28 - ad;
            op = ad >= 2 ? 0.68 : 0.92;
          }

          cell.style.zIndex = String(zi);
          cell.style.opacity = String(op);
          cell.style.transform = `translateX(${tx.toFixed(1)}px) translateZ(${tz.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${sc})`;
        });
      }

      function setIndex(next) {
        index = ((next % n) + n) % n;
        if (layout === "coverflow") {
          layoutCoverflow();
        } else {
          const step = 360 / n;
          track.style.transform = `rotateY(${-index * step}deg)`;
        }
        cells.forEach((cell, i) => {
          cell.classList.toggle("is-active", i === index);
        });
        heroCarousel.querySelectorAll(".hero-carousel__dot").forEach((d, i) => {
          d.setAttribute("aria-selected", i === index ? "true" : "false");
        });
        const name = labels[index] ?? `Reel ${index + 1}`;
        heroCarousel.setAttribute("aria-label", `Featured collaboration reels: ${name}`);
        syncVideos();
      }

      if (dotsHost) {
        dotsHost.innerHTML = "";
        for (let i = 0; i < n; i++) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "hero-carousel__dot";
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", `Show ${labels[i] ?? "reel " + (i + 1)}`);
          b.setAttribute("aria-selected", i === 0 ? "true" : "false");
          b.addEventListener("click", () => setIndex(i));
          dotsHost.appendChild(b);
        }
      }

      prevBtn?.addEventListener("click", () => setIndex(index - 1));
      nextBtn?.addEventListener("click", () => setIndex(index + 1));

      heroCarousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setIndex(index - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setIndex(index + 1);
        }
      });

      if (layout === "coverflow") {
        window.addEventListener(
          "resize",
          () => {
            layoutCoverflow();
          },
          { passive: true }
        );
      }

      setIndex(0);
    }
  }

  // ---- Scroll-linked subtle section scale (Apple-style product pages)
  const scrollScaleSections = document.querySelectorAll("main > section");
  if (
    scrollScaleSections.length &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const maxBoost = 0.038;
    let ticking = false;

    function updateScrollScale() {
      ticking = false;
      const vh = window.innerHeight || 1;
      const focusY = vh * 0.46;

      scrollScaleSections.forEach((el) => {
        const r = el.getBoundingClientRect();
        const h = Math.max(1, r.height);
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        const vis = Math.max(0, Math.min(1, visible / (h * 0.72)));
        const mid = r.top + h * 0.5;
        const dist = Math.abs(mid - focusY);
        const range = vh * 0.58 + h * 0.22;
        const centered = Math.max(0, 1 - Math.min(1, dist / range));
        const t = vis * centered;
        const scale = 1 + t * maxBoost;
        el.style.setProperty("--scroll-scale", scale.toFixed(4));
      });
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollScale);
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    updateScrollScale();
  }

  // ---- Contact form (front-end only demo). Wire to a backend or
  // a free service (Formspree, Web3Forms, Netlify Forms) to receive emails.
  const form = document.querySelector(".contact-form");
  const status = form ? form.querySelector(".form-status") : null;
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      if (!name || !email || !message) {
        if (status) status.textContent = "Please fill in your name, email and a short message.";
        return;
      }
      if (status) status.textContent = "Thanks! Your message is ready — connect a form service to actually send it (see README).";
      form.reset();
    });
  }
})();
