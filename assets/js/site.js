(() => {
  const storageKey = "dollhousemcp-theme";
  const root = document.documentElement;
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");
  const themeToggleLabel = document.getElementById("theme-toggle-label");
  const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return mediaDark.matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    const nextThemeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    if (themeToggleIcon) {
      themeToggleIcon.textContent = theme === "dark" ? "☀" : "☾";
    }
    if (themeToggleLabel) {
      themeToggleLabel.textContent = nextThemeLabel;
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", nextThemeLabel);
      themeToggle.setAttribute("title", nextThemeLabel);
    }
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("open");
    });
  }

  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  const clickableCards = document.querySelectorAll("[data-card-link]");
  clickableCards.forEach((card) => {
    const target = card.getAttribute("data-card-link");
    if (!target) {
      return;
    }

    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    const go = () => {
      window.location.assign(target);
    };

    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select")) {
        return;
      }
      go();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go();
      }
    });
  });

  const initScreenshotViewers = () => {
    const viewers = document.querySelectorAll("[data-screenshot-viewer]");
    viewers.forEach((viewer) => {
      const stage = viewer.querySelector("[data-viewer-stage]");
      const image = viewer.querySelector("[data-viewer-image]");
      const status = viewer.querySelector("[data-viewer-status]");
      const thumbs = Array.from(viewer.querySelectorAll("[data-viewer-thumb]"));
      if (!stage || !image || thumbs.length === 0) {
        return;
      }

      let currentIndex = 0;
      let sizeMode = "fit";

      const updateStatus = () => {
        if (status) {
          status.textContent = `Page ${currentIndex + 1} of ${thumbs.length}`;
        }
      };

      const applySizeMode = () => {
        if (sizeMode === "fit") {
          image.style.width = "100%";
          image.style.maxWidth = "100%";
          image.style.height = "auto";
          stage.scrollLeft = 0;
          stage.scrollTop = 0;
          return;
        }

        if (sizeMode === "fit-height") {
          const targetHeight = Math.max(stage.clientHeight, 1);
          image.style.height = `${targetHeight}px`;
          image.style.width = "auto";
          image.style.maxWidth = "none";
          stage.scrollLeft = 0;
          stage.scrollTop = 0;
          return;
        }

        image.style.width = "";
        image.style.maxWidth = "none";
        image.style.height = "auto";
        stage.scrollLeft = 0;
        stage.scrollTop = 0;
      };

      const loadPage = (nextIndex) => {
        if (thumbs.length === 0) {
          return;
        }

        const normalized = (nextIndex + thumbs.length) % thumbs.length;
        currentIndex = normalized;
        const active = thumbs[currentIndex];
        const src = active.getAttribute("data-src");
        const alt = active.getAttribute("data-alt") || "";
        if (!src) {
          return;
        }

        thumbs.forEach((thumb, idx) => {
          thumb.classList.toggle("is-active", idx === currentIndex);
        });

        image.src = src;
        image.alt = alt;
        applySizeMode();
        updateStatus();
      };

      thumbs.forEach((thumb, idx) => {
        thumb.addEventListener("click", () => {
          loadPage(idx);
        });
      });

      const prevButton = viewer.querySelector("[data-action='prev']");
      const nextButton = viewer.querySelector("[data-action='next']");
      const fitButton = viewer.querySelector("[data-action='fit']");
      const fitHeightButton = viewer.querySelector("[data-action='fit-height']");
      const actualButton = viewer.querySelector("[data-action='actual']");

      if (prevButton) {
        prevButton.addEventListener("click", () => loadPage(currentIndex - 1));
      }
      if (nextButton) {
        nextButton.addEventListener("click", () => loadPage(currentIndex + 1));
      }
      if (fitButton) {
        fitButton.addEventListener("click", () => {
          sizeMode = "fit";
          applySizeMode();
        });
      }
      if (fitHeightButton) {
        fitHeightButton.addEventListener("click", () => {
          sizeMode = "fit-height";
          applySizeMode();
        });
      }
      if (actualButton) {
        actualButton.addEventListener("click", () => {
          sizeMode = "actual";
          applySizeMode();
        });
      }

      const onArrowKeyNav = (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          loadPage(currentIndex + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          loadPage(currentIndex - 1);
        }
      };

      viewer.addEventListener("keydown", onArrowKeyNav);
      stage.addEventListener("click", () => stage.focus());
      window.addEventListener("resize", () => {
        if (sizeMode !== "actual") {
          applySizeMode();
        }
      });

      loadPage(0);
    });
  };
  initScreenshotViewers();

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || revealItems.length === 0) {
    revealItems.forEach((item) => item.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
})();
