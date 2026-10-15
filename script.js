document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Mobile navigation menu ----------
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  function setMenu(isOpen) {
    navLinks.classList.toggle("open", isOpen);
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  menuToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  // ---------- 2. Smooth navigation ----------
  // CSS "scroll-behavior" does most of the work; this also closes the mobile menu after a click.
  const allNavLinks = document.querySelectorAll(".nav-link");
  allNavLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // ---------- 3. Typing animation ----------
  const typingElement = document.getElementById("typingText");
  const titles = ["Web Developer", "IT Graduate", "Front-End Developer"];
  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeTitle() {
    const currentTitle = titles[titleIndex];
    // Add or remove one letter at a time
    charIndex += isDeleting ? -1 : 1;
    typingElement.textContent = currentTitle.slice(0, charIndex);

    let delay = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentTitle.length) {
      isDeleting = true;       // finished typing, pause, then delete
      delay = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;      // finished deleting, move to next title
      titleIndex = (titleIndex + 1) % titles.length;
      delay = 400;
    }
    setTimeout(typeTitle, delay);
  }

  if (prefersReducedMotion) {
    typingElement.textContent = titles.join(" / ");  // no animation, just show the text
  } else {
    typeTitle();
  }

  // ---------- 4. Scroll reveal animations ----------
  // IntersectionObserver tells us when an element enters the screen.
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);  // animate only once
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach((element) => revealObserver.observe(element));

  // ---------- 4b. Load projects from the backend ----------
  // Address of the backend API (change this when you deploy it)
  const API_URL = "https://rim-portfolio.onrender.com";
  const projectsGrid = document.querySelector(".projects-grid");

  // Only allow normal web links, so a bad value in the database can't run code
  function isSafeUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  // Build one project card. textContent is used (not innerHTML) so text can't inject HTML.
  function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card reveal";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const tags = document.createElement("ul");
    tags.className = "tags";
    project.technologies.forEach((technology) => {
      const tag = document.createElement("li");
      tag.textContent = technology;
      tags.appendChild(tag);
    });

    const link = document.createElement("a");
    if (project.url && isSafeUrl(project.url)) {
      link.href = project.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "btn btn-small";
      link.textContent = "View Live 🚀";
    } else {
      // No real link yet: show a disabled button
      link.href = "#";
      link.className = "btn btn-small disabled";
      link.setAttribute("aria-disabled", "true");
      link.textContent = "Link coming soon";
    }

    card.append(title, description, tags, link);
    return card;
  }

  async function loadProjects() {
    try {
      const response = await fetch(API_URL + "/projects");
      if (!response.ok) throw new Error("Could not load projects");
      const projects = await response.json();
      if (!Array.isArray(projects) || projects.length === 0) return;

      // Replace the built-in cards with the ones from the database
      projectsGrid.replaceChildren();
      projects.forEach((project) => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
        revealObserver.observe(card);  // so the scroll animation still works
      });
    } catch (error) {
      // Backend offline: keep the cards already written in index.html
      console.log("Projects API unavailable, showing the built-in projects.");
    }
  }
  loadProjects();

  // ---------- 5. Active nav link based on current section ----------
  const sections = document.querySelectorAll("main section");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        allNavLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      }
    });
  }, { rootMargin: "-45% 0px -45% 0px" });  // section counts as "current" when it crosses the middle
  sections.forEach((section) => sectionObserver.observe(section));

  // ---------- 6. Navbar shadow and back-to-top button ----------
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
    backToTop.classList.toggle("show", window.scrollY > 500);
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  // ---------- 7. Contact form validation ----------
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const RECIPIENT_EMAIL = "reem225@gmail.com";

  function showError(fieldId, message) {
    document.getElementById(fieldId + "Error").textContent = message;
    document.getElementById(fieldId).classList.toggle("invalid", message !== "");
  }

  function validateForm(name, email, message) {
    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    showError("name", "");
    showError("email", "");
    showError("message", "");

    if (name.length < 2) { showError("name", "Please enter your name."); isValid = false; }
    if (!emailPattern.test(email)) { showError("email", "Please enter a valid email address."); isValid = false; }
    if (message.length < 10) { showError("message", "Please write at least 10 characters."); isValid = false; }
    return isValid;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();  // stop the page from reloading
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    formStatus.textContent = "";

    if (!validateForm(name, email, message)) return;

    const sendButton = form.querySelector("button[type='submit']");
    sendButton.disabled = true;
    formStatus.textContent = "Sending...";

    try {
      // Send the message to the backend, which saves it in MongoDB
      const response = await fetch(API_URL + "/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error("Server rejected the message");

      formStatus.textContent = "Thank you! Your message was sent.";
      form.reset();
    } catch (error) {
      // Backend is offline or failed: fall back to the visitor's email app
      const subject = encodeURIComponent("Portfolio message from " + name);
      const body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
      window.location.href = "mailto:" + RECIPIENT_EMAIL + "?subject=" + subject + "&body=" + body;
      formStatus.textContent = "The server is unavailable, so your message is ready to be sent in your email app.";
    } finally {
      sendButton.disabled = false;
    }
  });

  // Clear an error as soon as the visitor starts fixing it
  ["name", "email", "message"].forEach((fieldId) => {
    document.getElementById(fieldId).addEventListener("input", () => showError(fieldId, ""));
  });
});
