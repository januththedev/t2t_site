/**
 * T2T Lead-x Landing Page Interactions
 * Handles FAQ accordion, navigation highlights, animations, and the application modal.
 */

// ==========================================================================
// CONFIGURATION
// ==========================================================================
const CONFIG = {
  // If set to true, CTA clicks redirect to the external form URL below.
  // If set to false, CTA clicks open the custom built-in application modal.
  useExternalForm: true,
  externalFormUrl: "https://forms.gle/xPPyZCp4LB5qKd237",
  
  // Default submission endpoint (if you hook up a backend form processor later)
  submitEndpoint: "#"
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initFaqAccordion();
  initApplicationModal();
  initScrollObservers();
  initSmoothScroll();
  updateFooterYear();
  initChartSimulation();
});

// ==========================================================================
// DYNAMIC FOOTER YEAR
// ==========================================================================
function updateFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ==========================================================================
// MOBILE MENU NAVIGATION
// ==========================================================================
function initMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const isHidden = mobileNav.classList.toggle("hide");
      menuBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    // Close menu when clicking a mobile nav anchor
    mobileNav.querySelectorAll("a.nav-anchor").forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.add("hide");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// ==========================================================================
// SMOOTH SCROLLING WITH OFFSET
// ==========================================================================
function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute("href");
    if (targetId === "#" || targetId === "#apply") return; // Let modal/config handler handle these

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const headerHeight = 80; // Compensate for sticky header
    const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
}

// ==========================================================================
// SCROLL OBSERVATION: ACTIVE LINKS & FADE REVEAL
// ==========================================================================
function initScrollObservers() {
  const header = document.getElementById("leadx-header");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("#desktop-nav a.nav-anchor, #mobileNav a.nav-anchor");

  // 1. Sticky Header Shadow
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // 2. Active Section Highlighting
  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active-link");
          } else {
            link.classList.remove("active-link");
          }
        });
      }
    });
  }, {
    rootMargin: "-20% 0px -70% 0px" // Trigger when section is in upper-mid screen
  });

  sections.forEach(section => activeSectionObserver.observe(section));

  // Keep content visible immediately; animations must never gate the first paint.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 3. Scroll Reveal Animations (Subtle fade-in-up)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 500,
          easing: 'ease-out',
          fill: 'both'
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  });

  document.querySelectorAll("section, .glass-card, .week-card, .process-step-card").forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    revealObserver.observe(el);
  });
}

// ==========================================================================
// FAQ ACCORDION INTERACTIVITY
// ==========================================================================
function initFaqAccordion() {
  const faqRows = document.querySelectorAll(".faq-row");

  faqRows.forEach(row => {
    const trigger = row.querySelector(".faq-trigger");
    const answer = row.querySelector(".faq-answer");

    if (trigger && answer) {
      trigger.addEventListener("click", () => {
        const isActive = row.classList.contains("active");

        // Close all other accordions first
        faqRows.forEach(r => {
          if (r !== row) {
            r.classList.remove("active");
            r.querySelector(".faq-answer").style.maxHeight = null;
          }
        });

        // Toggle active status
        if (isActive) {
          row.classList.remove("active");
          answer.style.maxHeight = null;
        } else {
          row.classList.add("active");
          // Smoothly set maxHeight to scrollHeight of content
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    }
  });
}

// ==========================================================================
// APPLICATION MODAL & CV UPLOAD HANDLERS
// ==========================================================================
function initApplicationModal() {
  const triggers = document.querySelectorAll(".trigger-apply");
  const overlay = document.getElementById("applyModal");
  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("leadxApplyForm");
  const successScreen = document.getElementById("successScreen");
  
  // Drag and drop elements
  const dropArea = document.getElementById("dropArea");
  const fileInput = document.getElementById("cvUpload");
  const fileStatus = document.getElementById("fileStatus");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const fileRemoveBtn = document.getElementById("fileRemove");

  // 1. Trigger Handlers
  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      
      if (CONFIG.useExternalForm) {
        window.open(CONFIG.externalFormUrl, "_blank", "noopener,noreferrer");
      } else {
        openModal();
      }
    });
  });

  function openModal() {
    overlay?.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }

  function closeModal() {
    overlay?.classList.remove("active");
    document.body.style.overflow = ""; // Restore background scroll
    // Reset success screen after closing
    setTimeout(() => {
      if (form && successScreen) {
        form.style.display = "flex";
        successScreen.style.display = "none";
        form.reset();
        resetFileInput();
      }
    }, 400);
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  // Escape key to close modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("active")) {
      closeModal();
    }
  });

  // 2. Drag and Drop Interaction
  if (dropArea && fileInput) {
    // Prevent defaults for all drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop area
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect(files[0]);
      }
    });

    // Handle file input selection
    fileInput.addEventListener('change', (e) => {
      if (fileInput.files.length > 0) {
        handleFileSelect(fileInput.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    if (!file) return;

    // Optional validation (e.g., PDF and Doc only)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(file.type) || ['pdf', 'doc', 'docx'].includes(fileExtension)) {
      fileNameDisplay.textContent = file.name;
      fileStatus.classList.add("active");
      dropArea.style.display = "none";
    } else {
      alert("Invalid file format. Please upload a PDF, DOC, or DOCX document.");
      resetFileInput();
    }
  }

  function resetFileInput() {
    fileInput.value = "";
    fileStatus.classList.remove("active");
    dropArea.style.display = "block";
    fileNameDisplay.textContent = "";
  }

  if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetFileInput();
    });
  }

  // 3. Form Submission Handling
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check CV uploaded
      if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please upload your CV before submitting.");
        return;
      }

      // Collect data
      const formData = new FormData(form);
      console.log("Submitting lead-x application: ", {
        name: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        background: formData.get("background"),
        fileName: fileInput.files[0].name
      });

      // Show success screen
      form.style.display = "none";
      if (successScreen) {
        successScreen.style.display = "block";
      }
    });
  }
}

// ==========================================================================
// DYNAMIC DASHBOARD CHART & AI CHAT SIMULATOR
// ==========================================================================
function initChartSimulation() {
  const terminalTexts = [
    "Analyzing applicant data profile...",
    "Correlating AI readiness score...",
    "Drafting customized learning trajectory...",
    "Recommendation: selected for boardroom challenge."
  ];

  let textIndex = 0;
  const promptText = document.getElementById("ai-prompt-mimic");
  
  if (promptText) {
    setInterval(() => {
      textIndex = (textIndex + 1) % terminalTexts.length;
      promptText.textContent = terminalTexts[textIndex];
    }, 4500);
  }
}
