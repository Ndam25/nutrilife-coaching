/* ===================================================
   NutriLife Coaching — Main JavaScript
   =================================================== */

/* ── LANGUAGE SYSTEM ── */
const LANGS = ['en', 'fr', 'es'];
let currentLang = localStorage.getItem('nutrilife-lang') || 'en';

function setLanguage(lang) {
  if (!LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('nutrilife-lang', lang);

  // Toggle lang attribute elements
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setLang === lang);
  });

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Translate data-i18n elements
  const t = TRANSLATIONS[lang];
  if (t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key]) el.placeholder = t[key];
    });
  }
}


/* ── NAVBAR OFFSET — account for sticky urgency bar ── */
function initNavbarOffset() {
  const bar    = document.getElementById('urgency-bar');
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function updateOffset() {
    // Both bars are sticky; ensure smooth visual transition on scroll
    const scrolled = window.scrollY > 10;
    navbar.classList.toggle('scrolled', scrolled);
  }

  window.addEventListener('scroll', updateOffset, { passive: true });
  updateOffset();
}

/* ── NAVBAR SCROLL BEHAVIOUR ── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ── MOBILE MENU ── */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-close');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ── SCROLL ANIMATIONS ── */
function initScrollAnimations() {
  const items = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  items.forEach(item => observer.observe(item));
}

/* ── SCROLL TO TOP ── */
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── ACCORDION ── */
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.maxHeight = '0';
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ── TABS ── */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs-container');
      if (!group) return;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const panel = group.querySelector(`#${btn.dataset.tab}`);
      if (panel) panel.style.display = 'block';
    });
  });
}

/* ── COOKIE BANNER ── */
function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;
  if (!localStorage.getItem('cookies-accepted')) {
    setTimeout(() => banner.classList.add('visible'), 1500);
  }
  document.getElementById('accept-cookies')?.addEventListener('click', () => {
    localStorage.setItem('cookies-accepted', '1');
    banner.classList.remove('visible');
  });
  document.getElementById('decline-cookies')?.addEventListener('click', () => {
    localStorage.setItem('cookies-accepted', '0');
    banner.classList.remove('visible');
  });
}

/* ── COUNTDOWN TIMER ── */
function initCountdown(elementId, targetDate) {
  const el = document.getElementById(elementId);
  if (!el) return;
  function update() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) { el.textContent = '00:00:00:00'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
  }
  update();
  setInterval(update, 1000);
}

/* ── PROGRESS BARS ── */
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.progress + '%';
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(bar => { bar.style.width = '0'; observer.observe(bar); });
}

/* ── NOTIFICATION ── */
function showNotification(msg, type = 'success') {
  const note = document.createElement('div');
  note.className = `notification ${type}`;
  note.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span><p>${msg}</p>`;
  document.body.appendChild(note);
  setTimeout(() => note.classList.add('visible'), 50);
  setTimeout(() => {
    note.classList.remove('visible');
    setTimeout(() => note.remove(), 400);
  }, 4000);
}

/* ── SMOOTH LINK SCROLL ── */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const step = ts => {
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.counter));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ── RECIPE SEARCH (recipes.html) ── */
function initRecipeSearch() {
  const searchInput = document.getElementById('recipe-search-input');
  const filterBtns = document.querySelectorAll('.filter-tag');
  const recipeGrid = document.getElementById('recipe-grid');
  if (!searchInput || !recipeGrid) return;

  let activeFilter = 'all';

  function filterRecipes() {
    const query = searchInput.value.toLowerCase();
    const cards = recipeGrid.querySelectorAll('.recipe-card-wrapper');
    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const matchSearch = !query || name.includes(query) || tags.includes(query);
      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      card.style.display = matchSearch && matchFilter ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterRecipes);
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      filterRecipes();
    });
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✅ Message sent!';
      showNotification('Thank you! Your message has been sent.', 'success');
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

/* ── NEWSLETTER FORM ── */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (!email) return;
      const btn = form.querySelector('button');
      btn.textContent = '✅ Subscribed!';
      showNotification('Welcome to NutriLife! Check your email.', 'success');
      form.reset();
    });
  });
}

/* ── MODAL ── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}
function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ── ACTIVE NAV LINK ── */
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path.split('/').pop());
  });
}

/* ── TRANSLATIONS ── */
const TRANSLATIONS = {
  en: {
    /* ── Navigation ── */
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.recipes': 'Recipes',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.app': 'Nutrition App',
    'nav.downloads': '📥 Free Resources',
    /* ── Global CTAs ── */
    'btn.book': '📅 Book a Discovery Session',
    'btn.free.guide': '🎁 Free 7-Day Meal Plan',
    'btn.start.plan': 'Start Your Personalized Plan',
    'btn.explore': 'Explore Our Programs',
    'btn.read.more': 'Read More',
    'btn.download.pdf': '📥 Download PDF',
    'btn.subscribe': 'Subscribe',
    'btn.send': 'Send Message',
    'btn.get.free': 'Get Free PDF',
    'btn.learn.about': 'Learn More About Our Approach',
    /* ── Hero (global) ── */
    'hero.cta': 'Start Your Journey',
    'hero.learn': 'Learn More',
    /* ── Index Hero ── */
    'index.hero.eyebrow': 'Physician-led · Evidence-based · Culturally adapted',
    'index.hero.h1.line1': 'Personalized Nutrition Coaching',
    'index.hero.h1.line2': 'for Real Life — Not Just Diets',
    'index.hero.sub': 'Science-based, culturally adapted nutrition support for diabetes, hypertension, heart health, digestive wellness, kidney health, weight management, and healthy living.',
    'index.hero.note': 'Designed for busy adults in the U.S. and African diaspora worldwide who want practical, sustainable, and healthier eating habits.',
    'index.hero.badge1': 'Physician-led guidance',
    'index.hero.badge2': 'Personalized meal plans',
    'index.hero.badge3': 'Culturally relevant recipes',
    'index.hero.badge4': 'Ongoing support',
    /* ── Stats ── */
    'stat.years.lbl': 'Years Experience',
    'stat.clients.lbl': 'Clients Helped',
    'stat.conditions.lbl': 'Conditions Supported',
    /* ── Trust Strip ── */
    'trust.years.title': '20+ Years of Expertise',
    'trust.years.desc': 'Health, nutrition, and public health experience you can count on.',
    'trust.culture.title': 'Culturally Adapted Plans',
    'trust.culture.desc': 'Practical plans tailored to your culture, lifestyle, and health needs.',
    'trust.evidence.title': 'Evidence-Informed',
    'trust.evidence.desc': 'Expert support for chronic disease prevention and healthier living.',
    'trust.platform.title': 'All-in-One Platform',
    'trust.platform.desc': 'Tools, recipes, coaching, and education in one place.',
    /* ── Conditions Section ── */
    'section.conditions.label': 'Who This Is For',
    'section.conditions.h2': 'Nutrition Support That Meets You Where You Are',
    'section.conditions.desc': 'Whether you are trying to prevent disease, manage a chronic condition, lose weight, eat better as a family, or simply feel stronger and healthier — NutriLife Coaching helps you move forward with clarity and confidence.',
    'cond.diabetes.title': 'Diabetes Support',
    'cond.diabetes.desc': 'Better meal balance, blood sugar-friendly choices, and practical recipes for daily life.',
    'cond.hypertension.title': 'Hypertension Care',
    'cond.hypertension.desc': 'Smarter sodium control, heart-friendly meal planning, and healthier daily habits.',
    'cond.heart.title': 'Heart & Cholesterol Health',
    'cond.heart.desc': 'Improve your plate with fiber-rich, balanced, and satisfying heart-healthy foods.',
    'cond.digestive.title': 'Digestive Wellness',
    'cond.digestive.desc': 'Gentle, personalized meal options for gut comfort and better digestion.',
    'cond.kidney.title': 'Kidney-Friendly Nutrition',
    'cond.kidney.desc': 'Guided food choices with structure, simplicity, and safety in mind.',
    'cond.weight.title': 'Weight & Wellness Coaching',
    'cond.weight.desc': 'Sustainable strategies for energy, confidence, and long-term progress.',
    /* ── How It Works ── */
    'hiw.label': 'The Process',
    'hiw.h2': 'How Your Coaching Journey Works',
    'hiw.desc': 'A simple step-by-step process designed to make healthy eating easier, more realistic, and more sustainable.',
    'hiw.step1.title': 'Assessment',
    'hiw.step1.desc': 'We learn about your health goals, habits, lifestyle, preferences, medical concerns, and cultural food patterns.',
    'hiw.step2.title': 'Personalized Plan',
    'hiw.step2.desc': 'You receive practical recommendations, tailored meal ideas, recipes, and an action plan you can actually follow.',
    'hiw.step3.title': 'Ongoing Coaching',
    'hiw.step3.desc': 'We help you stay motivated, make adjustments, overcome obstacles, and build healthier habits that last.',
    /* ── About Founder ── */
    'founder.label': 'Meet Your Coach',
    'founder.h2': 'Dr. Adama NDIR — MD & Chief Nutritionist',
    'founder.p1': 'NutriLife Coaching was founded by Dr. Adama NDIR — a Medical Doctor, Senior Epidemiologist, Data Scientist, and IIN-certified Health & Nutrition Coach with 15+ years of expertise in chronic nutritional diseases, African diet, and public health.',
    'founder.p2': "Dr. Ndir's unique combination of medical training and deep cultural knowledge makes NutriLife Coaching uniquely equipped to help the African diaspora and anyone navigating chronic conditions like diabetes, hypertension, and obesity.",
    'founder.quote': '"This is not about perfection. It is about progress, clarity, and building healthier habits that truly fit you."',
    /* ── Services Overview ── */
    'services.label': 'Services',
    'services.h2': 'Choose the Support That Fits Your Needs',
    'svc.coaching.title': '1:1 Coaching',
    'svc.coaching.desc': 'Private guidance tailored to your health profile, goals, and lifestyle.',
    'svc.coaching.f1': 'Personalized meal plan',
    'svc.coaching.f2': 'Weekly check-ins',
    'svc.coaching.f3': 'Condition-specific support',
    'svc.coaching.btn': 'Book Coaching',
    'svc.masterclass.title': 'Masterclass / Webinar',
    'svc.masterclass.desc': 'A practical educational experience to help you understand what to eat and why.',
    'svc.masterclass.f1': 'Expert-led sessions',
    'svc.masterclass.f2': 'Q&A included',
    'svc.masterclass.f3': 'Replay access',
    'svc.masterclass.btn': 'Join the Masterclass',
    'svc.group.title': 'Group Coaching Program',
    'svc.group.desc': 'Structured support, accountability, and motivation in a guided group environment.',
    'svc.group.f1': '12-week program',
    'svc.group.f2': 'Community access',
    'svc.group.f3': 'Weekly group calls',
    'svc.group.btn': 'Explore the Program',
    'svc.academy.title': 'NutriLife Academy',
    'svc.academy.desc': 'Learn nutrition principles step by step with flexible, practical online learning.',
    'svc.academy.f1': 'Self-paced modules',
    'svc.academy.f2': '8-week curriculum',
    'svc.academy.f3': 'Certificate included',
    'svc.academy.btn': 'View Training',
    /* ── App Section ── */
    'app.section.label': 'Smart Nutrition Tool',
    'app.section.h2': 'Get Meal Ideas and 7-Day Plans with Our Smart Nutrition Tool',
    'app.section.desc': 'Explore a smarter way to plan your meals based on your age, health goals, food preferences, and dietary needs.',
    'app.f1': 'Personalized recipe suggestions',
    'app.f2': '7-day meal planning support',
    'app.f3': 'Health-condition-oriented food choices',
    'app.f4': 'Cuisine-friendly recommendations',
    'app.btn': 'Try the Nutrition App →',
    /* ── Ebooks Section ── */
    'ebooks.label': 'Free & Premium Resources',
    'ebooks.h2': 'Guides Designed to Help You Eat Better with Confidence',
    'ebooks.desc': 'Download focused nutrition guides built around real health goals and practical eating patterns.',
    'ebook.diabetes.title': 'The Diabetic Kitchen',
    'ebook.diabetes.desc': 'Recipes and meal strategies for balanced blood sugar and enjoyable eating.',
    'ebook.bp.title': 'Blood Pressure-Friendly Eating',
    'ebook.bp.desc': 'DASH-inspired, culturally adapted strategies for heart and blood pressure health.',
    'ebook.kidney.title': 'Kidney Comfort Recipes',
    'ebook.kidney.desc': 'Safe, satisfying meals designed for CKD stages and kidney-friendly living.',
    'ebook.heart.title': 'Heart Strong Nutrition',
    'ebook.heart.desc': 'Cholesterol-balancing foods and cardioprotective eating patterns.',
    'ebook.gut.title': 'Gut Harmony Meals',
    'ebook.gut.desc': 'Microbiome-friendly recipes including African fermented foods and fiber-rich dishes.',
    'ebook.recovery.title': 'Nourish Through Recovery',
    'ebook.recovery.desc': 'Gentle, supportive nutrition for managing the side effects of cancer treatment.',
    'ebooks.btn': 'Get the Free Starter Guide',
    /* ── Testimonials ── */
    'testimonials.label': 'Client Stories',
    'testimonials.h2': 'Real Results from Real Clients',
    'testimonials.desc': 'Clients across the African diaspora and beyond transforming their health — one meal at a time.',
    /* ── Lead Magnet ── */
    'lead.label': 'Free Resource',
    'lead.h2': 'Start with a Free Resource',
    'lead.desc': 'Get a practical nutrition guide or a sample 7-day meal plan to begin improving your eating habits today. No commitment required.',
    'lead.choice1': 'Free 7-Day Meal Plan',
    'lead.choice2': 'Healthy Grocery Checklist',
    'lead.choice3': 'Starter Guide for Better Eating',
    'lead.name.placeholder': 'Your First Name',
    'lead.email.placeholder': 'Your Email Address',
    'lead.btn': 'Send Me the Free Guide',
    'lead.note': '🔒 No spam. Unsubscribe anytime.',
    /* ── Final CTA ── */
    'cta.h2': 'Ready to Eat Better, Feel Better, and Live Better?',
    'cta.desc': 'Get expert guidance, practical support, and a nutrition plan built for your health goals and your real life.',
    'cta.btn.book': '📅 Book a Discovery Session',
    'cta.btn.explore': 'Explore Our Programs',
    /* ── Disclaimer ── */
    'disclaimer': '⚕️ NutriLife Coaching provides nutrition education and wellness support and does not replace individualized medical diagnosis or emergency care. Always consult your healthcare provider before making changes to your diet or health regimen.',
    /* ── Footer ── */
    'footer.tagline': 'Personalized nutrition coaching for better health, culturally adapted and evidence-based.',
    'footer.services': 'Services',
    'footer.resources': 'Resources',
    'footer.company': 'Company',
    'footer.connect': 'Connect',
    'footer.copyright': '© 2025 NutriLife Coaching. All rights reserved.',
    /* ── Newsletter ── */
    'newsletter.placeholder': 'Your email address',
    'newsletter.btn': 'Subscribe Free',
    /* ── Blog Page ── */
    'blog.page.title': 'NutriLife Blog',
    'blog.page.subtitle': 'Nourishment & Knowledge',
    'blog.page.desc': 'Evidence-based nutrition insights for your healing journey',
    'blog.featured.read': 'Read Full Article',
    'blog.filter.all': 'All',
    'blog.filter.diabetes': 'Diabetes',
    'blog.filter.heart': 'Heart Health',
    'blog.filter.kidney': 'Kidney',
    'blog.filter.gut': 'Gut Health',
    'blog.filter.cancer': 'Cancer',
    'blog.filter.weight': 'Weight Loss',
    'blog.filter.african': 'African Foods',
    'blog.filter.recipes': 'Recipes',
    'blog.filter.research': 'Research',
    'blog.sidebar.newsletter.title': 'Get Weekly Nutrition Tips',
    'blog.sidebar.newsletter.desc': 'Evidence-based insights delivered to your inbox',
    'blog.sidebar.newsletter.placeholder': 'Your email',
    'blog.sidebar.newsletter.btn': 'Subscribe',
    'blog.sidebar.popular.title': 'Popular Posts',
    'blog.sidebar.categories.title': 'Categories',
    'blog.sidebar.tags.title': 'Popular Tags',
    'blog.pagination.prev': '← Previous',
    'blog.pagination.next': 'Next →',
    /* ── Downloads Page ── */
    'downloads.page.title': 'Free Resources & Downloads',
    'downloads.page.subtitle': 'Everything You Need to Start Healing Through Food',
    'downloads.page.desc': 'Free guides, meal plans, and tools to support your nutritional journey. No hidden catches, no spam — just evidence-based resources designed for your wellness.',
    'downloads.free.section.title': 'Free Downloads',
    'downloads.free.section.desc': 'Get immediate access to these valuable resources. Just provide your email and start transforming your health today.',
    'downloads.btn.get': 'Get Free PDF',
    'downloads.whats.inside': "What's Inside:",
    /* ── Recipes Page ── */
    'recipes.page.title': 'Recipe Portal',
    'recipes.page.subtitle': 'Healing Recipes for Every Health Goal',
    'recipes.search.placeholder': 'Search recipes…',
    'recipes.filter.all': 'All Recipes',
    'recipes.filter.diabetes': 'Diabetes',
    'recipes.filter.heart': 'Heart Health',
    'recipes.filter.kidney': 'Kidney Friendly',
    'recipes.filter.gut': 'Gut Health',
    'recipes.filter.cancer': 'Cancer Support',
    'recipes.filter.weight': 'Weight Loss',
    'recipes.filter.african': 'African Cuisine',
    /* ── Nutrition App Page ── */
    'app.page.title': 'AI Nutrition Assistant',
    'app.page.subtitle': 'Your Personal Nutrition Guide',
    'app.page.desc': 'Get personalized recipe ideas, 7-day meal plans, and evidence-based nutrition guidance tailored to your health needs.',
  },

  fr: {
    /* ── Navigation ── */
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.services': 'Services',
    'nav.recipes': 'Recettes',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.app': 'App Nutrition',
    'nav.downloads': '📥 Ressources Gratuites',
    /* ── Global CTAs ── */
    'btn.book': '📅 Réserver une Séance Découverte',
    'btn.free.guide': '🎁 Plan Alimentaire Gratuit 7 Jours',
    'btn.start.plan': 'Commencer Votre Plan Personnalisé',
    'btn.explore': 'Explorer Nos Programmes',
    'btn.read.more': 'Lire Plus',
    'btn.download.pdf': '📥 Télécharger PDF',
    'btn.subscribe': "S'abonner",
    'btn.send': 'Envoyer le Message',
    'btn.get.free': 'Obtenir le PDF Gratuit',
    'btn.learn.about': 'En Savoir Plus sur Notre Approche',
    /* ── Hero (global) ── */
    'hero.cta': 'Commencer Votre Parcours',
    'hero.learn': 'En Savoir Plus',
    /* ── Index Hero ── */
    'index.hero.eyebrow': 'Guidé par un médecin · Fondé sur les preuves · Adapté culturellement',
    'index.hero.h1.line1': 'Coaching Nutritionnel Personnalisé',
    'index.hero.h1.line2': 'pour la Vraie Vie — Pas Seulement des Régimes',
    'index.hero.sub': "Soutien nutritionnel scientifique et culturellement adapté pour le diabète, l'hypertension, la santé cardiaque, le bien-être digestif, la santé rénale, la gestion du poids et la vie saine.",
    'index.hero.note': "Conçu pour les adultes occupés aux États-Unis et dans la diaspora africaine mondiale qui souhaitent des habitudes alimentaires pratiques, durables et plus saines.",
    'index.hero.badge1': 'Guidé par un médecin',
    'index.hero.badge2': 'Plans repas personnalisés',
    'index.hero.badge3': 'Recettes culturellement adaptées',
    'index.hero.badge4': 'Suivi continu',
    /* ── Stats ── */
    'stat.years.lbl': "Ans d'Expérience",
    'stat.clients.lbl': 'Clients Aidés',
    'stat.conditions.lbl': 'Conditions Soutenues',
    /* ── Trust Strip ── */
    'trust.years.title': "20+ Ans d'Expertise",
    'trust.years.desc': "Expérience en santé, nutrition et santé publique sur laquelle vous pouvez compter.",
    'trust.culture.title': 'Plans Culturellement Adaptés',
    'trust.culture.desc': 'Plans pratiques adaptés à votre culture, mode de vie et besoins de santé.',
    'trust.evidence.title': 'Fondé sur les Preuves',
    'trust.evidence.desc': 'Soutien expert pour la prévention des maladies chroniques et une vie plus saine.',
    'trust.platform.title': 'Plateforme Tout-en-Un',
    'trust.platform.desc': 'Outils, recettes, coaching et éducation en un seul endroit.',
    /* ── Conditions Section ── */
    'section.conditions.label': 'Pour Qui',
    'section.conditions.h2': "Un Soutien Nutritionnel Qui S'adapte à Vous",
    'section.conditions.desc': "Que vous essayiez de prévenir une maladie, de gérer une condition chronique, de perdre du poids, de mieux manger en famille, ou simplement de vous sentir plus fort et en meilleure santé — NutriLife Coaching vous aide à avancer avec clarté et confiance.",
    'cond.diabetes.title': 'Soutien Diabète',
    'cond.diabetes.desc': 'Meilleur équilibre alimentaire, choix adaptés à la glycémie, et recettes pratiques pour la vie quotidienne.',
    'cond.hypertension.title': 'Soins Hypertension',
    'cond.hypertension.desc': 'Contrôle intelligent du sodium, planification des repas adaptée au cœur, et habitudes quotidiennes plus saines.',
    'cond.heart.title': 'Santé Cardiaque & Cholestérol',
    'cond.heart.desc': "Améliorez votre assiette avec des aliments riches en fibres, équilibrés et nourrissants pour le cœur.",
    'cond.digestive.title': 'Bien-être Digestif',
    'cond.digestive.desc': "Options alimentaires douces et personnalisées pour le confort intestinal et une meilleure digestion.",
    'cond.kidney.title': 'Nutrition Rénale',
    'cond.kidney.desc': "Choix alimentaires guidés avec structure, simplicité et sécurité à l'esprit.",
    'cond.weight.title': 'Coaching Poids & Bien-être',
    'cond.weight.desc': "Stratégies durables pour l'énergie, la confiance et les progrès à long terme.",
    /* ── How It Works ── */
    'hiw.label': 'Le Processus',
    'hiw.h2': 'Comment Fonctionne Votre Parcours de Coaching',
    'hiw.desc': "Un processus simple étape par étape conçu pour rendre l'alimentation saine plus facile, plus réaliste et plus durable.",
    'hiw.step1.title': 'Évaluation',
    'hiw.step1.desc': "Nous apprenons vos objectifs de santé, habitudes, mode de vie, préférences, préoccupations médicales et habitudes alimentaires culturelles.",
    'hiw.step2.title': 'Plan Personnalisé',
    'hiw.step2.desc': "Vous recevez des recommandations pratiques, des idées de repas adaptées, des recettes et un plan d'action que vous pouvez vraiment suivre.",
    'hiw.step3.title': 'Coaching Continu',
    'hiw.step3.desc': "Nous vous aidons à rester motivé, à faire des ajustements, à surmonter les obstacles et à construire des habitudes plus saines qui durent.",
    /* ── About Founder ── */
    'founder.label': 'Rencontrez Votre Coach',
    'founder.h2': 'Dr. Adama NDIR — MD & Nutritionniste en Chef',
    'founder.p1': "NutriLife Coaching a été fondé par le Dr. Adama NDIR — Médecin, Épidémiologiste Senior, Data Scientist et Coach en Santé & Nutrition certifié IIN avec 15+ ans d'expertise en maladies nutritionnelles chroniques, alimentation africaine et santé publique.",
    'founder.p2': "La combinaison unique de formation médicale et de connaissance culturelle approfondie du Dr. Ndir rend NutriLife Coaching particulièrement bien équipé pour aider la diaspora africaine et toute personne confrontée à des conditions chroniques comme le diabète, l'hypertension et l'obésité.",
    'founder.quote': '"Ce n\'est pas une question de perfection. C\'est une question de progrès, de clarté et de construction d\'habitudes plus saines qui vous conviennent vraiment."',
    /* ── Services Overview ── */
    'services.label': 'Services',
    'services.h2': 'Choisissez le Soutien Adapté à Vos Besoins',
    'svc.coaching.title': 'Coaching 1:1',
    'svc.coaching.desc': 'Guidance privée adaptée à votre profil de santé, objectifs et style de vie.',
    'svc.coaching.f1': 'Plan repas personnalisé',
    'svc.coaching.f2': 'Check-ins hebdomadaires',
    'svc.coaching.f3': 'Soutien spécifique à la condition',
    'svc.coaching.btn': 'Réserver le Coaching',
    'svc.masterclass.title': 'Masterclass / Webinaire',
    'svc.masterclass.desc': "Une expérience éducative pratique pour vous aider à comprendre quoi manger et pourquoi.",
    'svc.masterclass.f1': 'Sessions animées par des experts',
    'svc.masterclass.f2': 'Q&R inclus',
    'svc.masterclass.f3': 'Accès au replay',
    'svc.masterclass.btn': 'Rejoindre la Masterclass',
    'svc.group.title': 'Programme de Coaching de Groupe',
    'svc.group.desc': "Soutien structuré, responsabilisation et motivation dans un environnement de groupe guidé.",
    'svc.group.f1': 'Programme de 12 semaines',
    'svc.group.f2': 'Accès à la communauté',
    'svc.group.f3': 'Appels de groupe hebdomadaires',
    'svc.group.btn': 'Explorer le Programme',
    'svc.academy.title': 'NutriLife Academy',
    'svc.academy.desc': "Apprenez les principes nutritionnels étape par étape avec un apprentissage en ligne flexible et pratique.",
    'svc.academy.f1': 'Modules à votre rythme',
    'svc.academy.f2': 'Curriculum de 8 semaines',
    'svc.academy.f3': 'Certificat inclus',
    'svc.academy.btn': 'Voir la Formation',
    /* ── App Section ── */
    'app.section.label': 'Outil Nutrition Intelligent',
    'app.section.h2': 'Obtenez des Idées de Repas et des Plans de 7 Jours avec Notre Outil Nutrition',
    'app.section.desc': "Explorez une façon plus intelligente de planifier vos repas en fonction de votre âge, objectifs de santé, préférences alimentaires et besoins diététiques.",
    'app.f1': 'Suggestions de recettes personnalisées',
    'app.f2': 'Soutien à la planification de repas 7 jours',
    'app.f3': 'Choix alimentaires orientés selon la condition de santé',
    'app.f4': 'Recommandations adaptées à votre cuisine',
    'app.btn': "Essayer l'App Nutrition →",
    /* ── Ebooks Section ── */
    'ebooks.label': 'Ressources Gratuites & Premium',
    'ebooks.h2': 'Guides Conçus pour Vous Aider à Mieux Manger avec Confiance',
    'ebooks.desc': 'Téléchargez des guides nutritionnels ciblés construits autour d\'objectifs de santé réels et de patterns alimentaires pratiques.',
    'ebook.diabetes.title': 'La Cuisine du Diabétique',
    'ebook.diabetes.desc': 'Recettes et stratégies de repas pour un équilibre glycémique et une alimentation agréable.',
    'ebook.bp.title': 'Alimentation Amie de la Tension',
    'ebook.bp.desc': 'Stratégies inspirées du régime DASH, culturellement adaptées pour la santé cardiaque et la tension artérielle.',
    'ebook.kidney.title': 'Recettes Confort Renal',
    'ebook.kidney.desc': 'Repas sûrs et satisfaisants conçus pour les stades IRC et une vie rénalement amie.',
    'ebook.heart.title': 'Nutrition Cœur Solide',
    'ebook.heart.desc': "Aliments équilibrants le cholestérol et modes d'alimentation cardioprotecteurs.",
    'ebook.gut.title': 'Repas Harmonie Intestinale',
    'ebook.gut.desc': 'Recettes favorisant le microbiome incluant des aliments africains fermentés et des plats riches en fibres.',
    'ebook.recovery.title': 'Nourrir Pendant la Récupération',
    'ebook.recovery.desc': "Nutrition douce et de soutien pour gérer les effets secondaires du traitement du cancer.",
    'ebooks.btn': 'Obtenir le Guide de Démarrage Gratuit',
    /* ── Testimonials ── */
    'testimonials.label': 'Témoignages Clients',
    'testimonials.h2': 'Résultats Réels de Clients Réels',
    'testimonials.desc': "Des clients de toute la diaspora africaine et au-delà transformant leur santé — un repas à la fois.",
    /* ── Lead Magnet ── */
    'lead.label': 'Ressource Gratuite',
    'lead.h2': 'Commencez avec une Ressource Gratuite',
    'lead.desc': "Obtenez un guide nutritionnel pratique ou un exemple de plan alimentaire de 7 jours pour commencer à améliorer vos habitudes alimentaires dès aujourd'hui. Aucun engagement requis.",
    'lead.choice1': 'Plan Alimentaire Gratuit 7 Jours',
    'lead.choice2': 'Liste de Courses Santé',
    'lead.choice3': 'Guide de Démarrage pour Mieux Manger',
    'lead.name.placeholder': 'Votre Prénom',
    'lead.email.placeholder': 'Votre Adresse Email',
    'lead.btn': 'Envoyez-moi le Guide Gratuit',
    'lead.note': '🔒 Pas de spam. Désabonnez-vous à tout moment.',
    /* ── Final CTA ── */
    'cta.h2': 'Prêt à Mieux Manger, Mieux Vous Sentir et Mieux Vivre ?',
    'cta.desc': "Obtenez des conseils d'experts, un soutien pratique et un plan nutritionnel conçu pour vos objectifs de santé et votre vraie vie.",
    'cta.btn.book': '📅 Réserver une Séance Découverte',
    'cta.btn.explore': 'Explorer Nos Programmes',
    /* ── Disclaimer ── */
    'disclaimer': "⚕️ NutriLife Coaching fournit une éducation nutritionnelle et un soutien au bien-être et ne remplace pas un diagnostic médical individualisé ou des soins d'urgence. Consultez toujours votre professionnel de santé avant de modifier votre alimentation ou régime de santé.",
    /* ── Footer ── */
    'footer.tagline': 'Coaching nutritionnel personnalisé pour une meilleure santé, culturellement adapté et fondé sur les preuves.',
    'footer.services': 'Services',
    'footer.resources': 'Ressources',
    'footer.company': 'Entreprise',
    'footer.connect': 'Connecter',
    'footer.copyright': '© 2025 NutriLife Coaching. Tous droits réservés.',
    /* ── Newsletter ── */
    'newsletter.placeholder': 'Votre adresse email',
    'newsletter.btn': "S'abonner Gratuitement",
    /* ── Blog Page ── */
    'blog.page.title': 'Blog NutriLife',
    'blog.page.subtitle': 'Nutrition & Connaissance',
    'blog.page.desc': 'Informations nutritionnelles fondées sur les preuves pour votre parcours de guérison',
    'blog.featured.read': "Lire l'Article Complet",
    'blog.filter.all': 'Tous',
    'blog.filter.diabetes': 'Diabète',
    'blog.filter.heart': 'Santé Cardiaque',
    'blog.filter.kidney': 'Rein',
    'blog.filter.gut': 'Santé Intestinale',
    'blog.filter.cancer': 'Cancer',
    'blog.filter.weight': 'Perte de Poids',
    'blog.filter.african': 'Cuisine Africaine',
    'blog.filter.recipes': 'Recettes',
    'blog.filter.research': 'Recherche',
    'blog.sidebar.newsletter.title': 'Recevez des Conseils Nutrition Hebdomadaires',
    'blog.sidebar.newsletter.desc': 'Des informations fondées sur les preuves livrées dans votre boîte mail',
    'blog.sidebar.newsletter.placeholder': 'Votre email',
    'blog.sidebar.newsletter.btn': "S'abonner",
    'blog.sidebar.popular.title': 'Articles Populaires',
    'blog.sidebar.categories.title': 'Catégories',
    'blog.sidebar.tags.title': 'Tags Populaires',
    'blog.pagination.prev': '← Précédent',
    'blog.pagination.next': 'Suivant →',
    /* ── Downloads Page ── */
    'downloads.page.title': 'Ressources et Téléchargements Gratuits',
    'downloads.page.subtitle': "Tout ce Dont Vous Avez Besoin pour Commencer à Guérir par l'Alimentation",
    'downloads.page.desc': "Guides gratuits, plans repas et outils pour soutenir votre parcours nutritionnel. Pas de pièges cachés, pas de spam — juste des ressources fondées sur les preuves conçues pour votre bien-être.",
    'downloads.free.section.title': 'Téléchargements Gratuits',
    'downloads.free.section.desc': "Accédez immédiatement à ces ressources précieuses. Fournissez simplement votre email et commencez à transformer votre santé aujourd'hui.",
    'downloads.btn.get': 'Obtenir le PDF Gratuit',
    'downloads.whats.inside': "Ce qui est inclus :",
    /* ── Recipes Page ── */
    'recipes.page.title': 'Portail de Recettes',
    'recipes.page.subtitle': 'Recettes Thérapeutiques pour Chaque Objectif de Santé',
    'recipes.search.placeholder': 'Rechercher des recettes…',
    'recipes.filter.all': 'Toutes les Recettes',
    'recipes.filter.diabetes': 'Diabète',
    'recipes.filter.heart': 'Santé Cardiaque',
    'recipes.filter.kidney': 'Rein Amical',
    'recipes.filter.gut': 'Santé Intestinale',
    'recipes.filter.cancer': 'Soutien Cancer',
    'recipes.filter.weight': 'Perte de Poids',
    'recipes.filter.african': 'Cuisine Africaine',
    /* ── Nutrition App Page ── */
    'app.page.title': 'Assistant Nutrition IA',
    'app.page.subtitle': 'Votre Guide Nutrition Personnel',
    'app.page.desc': 'Obtenez des idées de recettes personnalisées, des plans alimentaires de 7 jours et des conseils nutritionnels fondés sur les preuves adaptés à vos besoins de santé.',
  },

  es: {
    /* ── Navigation ── */
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.services': 'Servicios',
    'nav.recipes': 'Recetas',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',
    'nav.app': 'App Nutrición',
    'nav.downloads': '📥 Recursos Gratuitos',
    /* ── Global CTAs ── */
    'btn.book': '📅 Reservar una Sesión de Descubrimiento',
    'btn.free.guide': '🎁 Plan Alimentario Gratis 7 Días',
    'btn.start.plan': 'Iniciar Tu Plan Personalizado',
    'btn.explore': 'Explorar Nuestros Programas',
    'btn.read.more': 'Leer Más',
    'btn.download.pdf': '📥 Descargar PDF',
    'btn.subscribe': 'Suscribirse',
    'btn.send': 'Enviar Mensaje',
    'btn.get.free': 'Obtener PDF Gratuito',
    'btn.learn.about': 'Aprender Más Sobre Nuestro Enfoque',
    /* ── Hero (global) ── */
    'hero.cta': 'Iniciar Tu Viaje',
    'hero.learn': 'Saber Más',
    /* ── Index Hero ── */
    'index.hero.eyebrow': 'Guiado por médico · Basado en evidencia · Culturalmente adaptado',
    'index.hero.h1.line1': 'Coaching Nutricional Personalizado',
    'index.hero.h1.line2': 'para la Vida Real — No Solo Dietas',
    'index.hero.sub': 'Apoyo nutricional científico y culturalmente adaptado para diabetes, hipertensión, salud cardíaca, bienestar digestivo, salud renal, control de peso y vida saludable.',
    'index.hero.note': 'Diseñado para adultos ocupados en EE.UU. y la diáspora africana mundial que desean hábitos alimentarios prácticos, sostenibles y más saludables.',
    'index.hero.badge1': 'Orientación médica',
    'index.hero.badge2': 'Planes de comidas personalizados',
    'index.hero.badge3': 'Recetas culturalmente relevantes',
    'index.hero.badge4': 'Apoyo continuo',
    /* ── Stats ── */
    'stat.years.lbl': 'Años de Experiencia',
    'stat.clients.lbl': 'Clientes Ayudados',
    'stat.conditions.lbl': 'Condiciones Apoyadas',
    /* ── Trust Strip ── */
    'trust.years.title': '20+ Años de Experiencia',
    'trust.years.desc': 'Experiencia en salud, nutrición y salud pública en la que puede confiar.',
    'trust.culture.title': 'Planes Culturalmente Adaptados',
    'trust.culture.desc': 'Planes prácticos adaptados a tu cultura, estilo de vida y necesidades de salud.',
    'trust.evidence.title': 'Basado en Evidencia',
    'trust.evidence.desc': 'Apoyo experto para la prevención de enfermedades crónicas y una vida más saludable.',
    'trust.platform.title': 'Plataforma Todo en Uno',
    'trust.platform.desc': 'Herramientas, recetas, coaching y educación en un solo lugar.',
    /* ── Conditions Section ── */
    'section.conditions.label': 'Para Quién',
    'section.conditions.h2': 'Apoyo Nutricional que se Adapta a Ti',
    'section.conditions.desc': 'Ya sea que estés tratando de prevenir enfermedades, gestionar una condición crónica, perder peso, comer mejor en familia, o simplemente sentirte más fuerte y saludable — NutriLife Coaching te ayuda a avanzar con claridad y confianza.',
    'cond.diabetes.title': 'Apoyo para Diabetes',
    'cond.diabetes.desc': 'Mejor equilibrio alimentario, opciones amigables para el azúcar en sangre y recetas prácticas para la vida diaria.',
    'cond.hypertension.title': 'Atención para Hipertensión',
    'cond.hypertension.desc': 'Control inteligente del sodio, planificación de comidas saludable para el corazón y hábitos diarios más saludables.',
    'cond.heart.title': 'Salud Cardíaca y Colesterol',
    'cond.heart.desc': 'Mejora tu plato con alimentos ricos en fibra, equilibrados y saciantes para el corazón.',
    'cond.digestive.title': 'Bienestar Digestivo',
    'cond.digestive.desc': 'Opciones alimentarias suaves y personalizadas para el confort intestinal y mejor digestión.',
    'cond.kidney.title': 'Nutrición Renal',
    'cond.kidney.desc': 'Elecciones alimentarias guiadas con estructura, simplicidad y seguridad en mente.',
    'cond.weight.title': 'Coaching de Peso y Bienestar',
    'cond.weight.desc': 'Estrategias sostenibles para energía, confianza y progreso a largo plazo.',
    /* ── How It Works ── */
    'hiw.label': 'El Proceso',
    'hiw.h2': 'Cómo Funciona Tu Camino de Coaching',
    'hiw.desc': 'Un proceso simple paso a paso diseñado para hacer que comer saludablemente sea más fácil, más realista y más sostenible.',
    'hiw.step1.title': 'Evaluación',
    'hiw.step1.desc': 'Conocemos tus objetivos de salud, hábitos, estilo de vida, preferencias, preocupaciones médicas y patrones culturales de alimentación.',
    'hiw.step2.title': 'Plan Personalizado',
    'hiw.step2.desc': 'Recibes recomendaciones prácticas, ideas de comidas adaptadas, recetas y un plan de acción que realmente puedes seguir.',
    'hiw.step3.title': 'Coaching Continuo',
    'hiw.step3.desc': 'Te ayudamos a mantenerte motivado, hacer ajustes, superar obstáculos y construir hábitos más saludables que duran.',
    /* ── About Founder ── */
    'founder.label': 'Conoce a Tu Coach',
    'founder.h2': 'Dr. Adama NDIR — MD y Nutricionista Jefe',
    'founder.p1': 'NutriLife Coaching fue fundado por el Dr. Adama NDIR — Médico, Epidemiólogo Senior, Científico de Datos y Coach de Salud & Nutrición certificado por IIN con 15+ años de experiencia en enfermedades nutricionales crónicas, dieta africana y salud pública.',
    'founder.p2': 'La combinación única de formación médica y profundo conocimiento cultural del Dr. Ndir hace que NutriLife Coaching esté particularmente bien equipado para ayudar a la diáspora africana y a cualquiera que navegue condiciones crónicas como diabetes, hipertensión y obesidad.',
    'founder.quote': '"Esto no se trata de perfección. Se trata de progreso, claridad y construcción de hábitos más saludables que realmente se adapten a ti."',
    /* ── Services Overview ── */
    'services.label': 'Servicios',
    'services.h2': 'Elige el Apoyo que se Adapte a Tus Necesidades',
    'svc.coaching.title': 'Coaching 1:1',
    'svc.coaching.desc': 'Orientación privada adaptada a tu perfil de salud, objetivos y estilo de vida.',
    'svc.coaching.f1': 'Plan de comidas personalizado',
    'svc.coaching.f2': 'Check-ins semanales',
    'svc.coaching.f3': 'Apoyo específico para la condición',
    'svc.coaching.btn': 'Reservar Coaching',
    'svc.masterclass.title': 'Masterclass / Seminario Web',
    'svc.masterclass.desc': 'Una experiencia educativa práctica para ayudarte a entender qué comer y por qué.',
    'svc.masterclass.f1': 'Sesiones dirigidas por expertos',
    'svc.masterclass.f2': 'Preguntas y respuestas incluidas',
    'svc.masterclass.f3': 'Acceso a la repetición',
    'svc.masterclass.btn': 'Unirse a la Masterclass',
    'svc.group.title': 'Programa de Coaching Grupal',
    'svc.group.desc': 'Apoyo estructurado, responsabilidad y motivación en un entorno de grupo guiado.',
    'svc.group.f1': 'Programa de 12 semanas',
    'svc.group.f2': 'Acceso a la comunidad',
    'svc.group.f3': 'Llamadas grupales semanales',
    'svc.group.btn': 'Explorar el Programa',
    'svc.academy.title': 'NutriLife Academy',
    'svc.academy.desc': 'Aprende los principios de nutrición paso a paso con aprendizaje en línea flexible y práctico.',
    'svc.academy.f1': 'Módulos a tu propio ritmo',
    'svc.academy.f2': 'Plan de estudios de 8 semanas',
    'svc.academy.f3': 'Certificado incluido',
    'svc.academy.btn': 'Ver Formación',
    /* ── App Section ── */
    'app.section.label': 'Herramienta de Nutrición Inteligente',
    'app.section.h2': 'Obtén Ideas de Comidas y Planes de 7 Días con Nuestra Herramienta Nutrición',
    'app.section.desc': 'Explora una forma más inteligente de planificar tus comidas basada en tu edad, objetivos de salud, preferencias alimentarias y necesidades dietéticas.',
    'app.f1': 'Sugerencias de recetas personalizadas',
    'app.f2': 'Soporte para planificación de comidas de 7 días',
    'app.f3': 'Elecciones de alimentos orientadas a la condición de salud',
    'app.f4': 'Recomendaciones adaptadas a tu cocina',
    'app.btn': 'Probar la App Nutrición →',
    /* ── Ebooks Section ── */
    'ebooks.label': 'Recursos Gratuitos y Premium',
    'ebooks.h2': 'Guías Diseñadas para Ayudarte a Comer Mejor con Confianza',
    'ebooks.desc': 'Descarga guías nutricionales enfocadas construidas alrededor de objetivos de salud reales y patrones alimentarios prácticos.',
    'ebook.diabetes.title': 'La Cocina del Diabético',
    'ebook.diabetes.desc': 'Recetas y estrategias de comidas para equilibrio glucémico y alimentación placentera.',
    'ebook.bp.title': 'Alimentación Amiga de la Presión',
    'ebook.bp.desc': 'Estrategias inspiradas en DASH, culturalmente adaptadas para la salud cardíaca y la presión arterial.',
    'ebook.kidney.title': 'Recetas Confort Renal',
    'ebook.kidney.desc': 'Comidas seguras y satisfactorias diseñadas para etapas de ERC y vida amigable con los riñones.',
    'ebook.heart.title': 'Nutrición Corazón Fuerte',
    'ebook.heart.desc': 'Alimentos equilibrantes del colesterol y patrones de alimentación cardioprotectores.',
    'ebook.gut.title': 'Comidas Armonía Intestinal',
    'ebook.gut.desc': 'Recetas favorables al microbioma incluyendo alimentos africanos fermentados y platos ricos en fibra.',
    'ebook.recovery.title': 'Nutrición para la Recuperación',
    'ebook.recovery.desc': 'Nutrición suave y de apoyo para manejar los efectos secundarios del tratamiento del cáncer.',
    'ebooks.btn': 'Obtener la Guía de Inicio Gratuita',
    /* ── Testimonials ── */
    'testimonials.label': 'Historias de Clientes',
    'testimonials.h2': 'Resultados Reales de Clientes Reales',
    'testimonials.desc': 'Clientes de toda la diáspora africana y más allá transformando su salud — una comida a la vez.',
    /* ── Lead Magnet ── */
    'lead.label': 'Recurso Gratuito',
    'lead.h2': 'Comienza con un Recurso Gratuito',
    'lead.desc': 'Obtén una guía nutricional práctica o un plan alimentario de muestra de 7 días para comenzar a mejorar tus hábitos alimentarios hoy. Sin compromiso requerido.',
    'lead.choice1': 'Plan Alimentario Gratis 7 Días',
    'lead.choice2': 'Lista de Compras Saludables',
    'lead.choice3': 'Guía de Inicio para Comer Mejor',
    'lead.name.placeholder': 'Tu Nombre',
    'lead.email.placeholder': 'Tu Dirección de Correo',
    'lead.btn': 'Envíame la Guía Gratuita',
    'lead.note': '🔒 Sin spam. Cancela la suscripción en cualquier momento.',
    /* ── Final CTA ── */
    'cta.h2': '¿Listo para Comer Mejor, Sentirte Mejor y Vivir Mejor?',
    'cta.desc': 'Obtén orientación experta, apoyo práctico y un plan nutricional creado para tus objetivos de salud y tu vida real.',
    'cta.btn.book': '📅 Reservar una Sesión de Descubrimiento',
    'cta.btn.explore': 'Explorar Nuestros Programas',
    /* ── Disclaimer ── */
    'disclaimer': '⚕️ NutriLife Coaching proporciona educación nutricional y apoyo al bienestar y no reemplaza el diagnóstico médico individualizado o atención de emergencia. Siempre consulte a su proveedor de atención médica antes de realizar cambios en su dieta o régimen de salud.',
    /* ── Footer ── */
    'footer.tagline': 'Coaching nutricional personalizado para una mejor salud, culturalmente adaptado y basado en evidencia.',
    'footer.services': 'Servicios',
    'footer.resources': 'Recursos',
    'footer.company': 'Empresa',
    'footer.connect': 'Conectar',
    'footer.copyright': '© 2025 NutriLife Coaching. Todos los derechos reservados.',
    /* ── Newsletter ── */
    'newsletter.placeholder': 'Tu dirección de correo',
    'newsletter.btn': 'Suscríbete Gratis',
    /* ── Blog Page ── */
    'blog.page.title': 'Blog NutriLife',
    'blog.page.subtitle': 'Nutrición y Conocimiento',
    'blog.page.desc': 'Información nutricional basada en evidencia para tu camino de sanación',
    'blog.featured.read': 'Leer el Artículo Completo',
    'blog.filter.all': 'Todos',
    'blog.filter.diabetes': 'Diabetes',
    'blog.filter.heart': 'Salud Cardíaca',
    'blog.filter.kidney': 'Riñón',
    'blog.filter.gut': 'Salud Intestinal',
    'blog.filter.cancer': 'Cáncer',
    'blog.filter.weight': 'Pérdida de Peso',
    'blog.filter.african': 'Cocina Africana',
    'blog.filter.recipes': 'Recetas',
    'blog.filter.research': 'Investigación',
    'blog.sidebar.newsletter.title': 'Recibe Consejos de Nutrición Semanales',
    'blog.sidebar.newsletter.desc': 'Información basada en evidencia entregada a tu bandeja de entrada',
    'blog.sidebar.newsletter.placeholder': 'Tu email',
    'blog.sidebar.newsletter.btn': 'Suscribirse',
    'blog.sidebar.popular.title': 'Artículos Populares',
    'blog.sidebar.categories.title': 'Categorías',
    'blog.sidebar.tags.title': 'Etiquetas Populares',
    'blog.pagination.prev': '← Anterior',
    'blog.pagination.next': 'Siguiente →',
    /* ── Downloads Page ── */
    'downloads.page.title': 'Recursos y Descargas Gratuitas',
    'downloads.page.subtitle': 'Todo lo que Necesitas para Comenzar a Sanar a través de la Alimentación',
    'downloads.page.desc': 'Guías gratuitas, planes de comidas y herramientas para apoyar tu camino nutricional. Sin trampas ocultas, sin spam — solo recursos basados en evidencia diseñados para tu bienestar.',
    'downloads.free.section.title': 'Descargas Gratuitas',
    'downloads.free.section.desc': 'Accede inmediatamente a estos valiosos recursos. Solo proporciona tu email y comienza a transformar tu salud hoy.',
    'downloads.btn.get': 'Obtener PDF Gratuito',
    'downloads.whats.inside': "¿Qué hay adentro?",
    /* ── Recipes Page ── */
    'recipes.page.title': 'Portal de Recetas',
    'recipes.page.subtitle': 'Recetas Terapéuticas para Cada Objetivo de Salud',
    'recipes.search.placeholder': 'Buscar recetas…',
    'recipes.filter.all': 'Todas las Recetas',
    'recipes.filter.diabetes': 'Diabetes',
    'recipes.filter.heart': 'Salud Cardíaca',
    'recipes.filter.kidney': 'Apto para Riñones',
    'recipes.filter.gut': 'Salud Intestinal',
    'recipes.filter.cancer': 'Apoyo al Cáncer',
    'recipes.filter.weight': 'Pérdida de Peso',
    'recipes.filter.african': 'Cocina Africana',
    /* ── Nutrition App Page ── */
    'app.page.title': 'Asistente de Nutrición IA',
    'app.page.subtitle': 'Tu Guía de Nutrición Personal',
    'app.page.desc': 'Obtén ideas de recetas personalizadas, planes alimentarios de 7 días y orientación nutricional basada en evidencia adaptada a tus necesidades de salud.',
  }
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavbarOffset();
  initMobileMenu();
  initScrollAnimations();
  initScrollTop();
  initAccordion();
  initTabs();
  initCookieBanner();
  initProgressBars();
  initSmoothLinks();
  initCounters();
  initRecipeSearch();
  initContactForm();
  initNewsletterForms();
  initModals();
  setActiveNav();

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.setLang));
  });

  // Apply stored language
  setLanguage(currentLang);
});
