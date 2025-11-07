// script.js - CANDrive.ma - Version CAN 2025 PRO
document.addEventListener('DOMContentLoaded', initApp);

let cars = [];
let deferredPrompt;
const translations = {
  fr: {},
  en: {
    "Accueil": "Home", "Flotte": "Fleet", "Stades": "Stadiums", "Réserver": "Book", "Avis": "Reviews", "Contact": "Contact",
    "Roulez en <span>Premium</span> pour la CAN 2025": "Drive <span>Premium</span> for CAN 2025",
    "Véhicules neufs • GPS inclus • Assurance • Livraison stade": "New vehicles • GPS included • Insurance • Stadium delivery",
    "Jours": "Days", "Heures": "Hours", "Min": "Min", "Sec": "Sec",
    "Scanner mon badge CAN (-30%)": "Scan my CAN badge (-30%)", "Photo ou scan → réduction immédiate": "Photo or scan → instant discount",
    "Voir la flotte": "View fleet", "Réserver maintenant": "Book now"
  },
  ar: { /* à compléter */ }
};

function initApp() {
  AOS.init({ duration: 900, once: true });
  loadCars();
  setupTheme();
  setupMobileMenu();
  setupSearch();
  setupFilters();
  setupBooking();
  setupChatbot();
  setupDates();
  setupCountdown();
  setupFlashPromo();
  setupLanguage();
  setupPWA();
  setupStadiumMap();
  setupScanner();
}

function loadCars() {
  cars = [
    { name: "Dacia Sandero", price: 280, category: "economique", transmission: "manuelle", img: "https://cdn.pixabay.com/photo/2016/02/19/11/19/car-1209912_960_720.jpg", specs: ["5 places", "Essence", "Clim"] },
    { name: "Hyundai Tucson", price: 480, category: "suv", transmission: "auto", img: "https://cdn.pixabay.com/photo/2018/02/24/18/06/suv-3179122_960_720.jpg", specs: ["5 places", "620L", "Tous risques"], popular: true },
    { name: "Audi A6", price: 720, category: "luxe", transmission: "auto", img: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_960_720.jpg", specs: ["5 places", "WiFi", "Auto"] },
    { name: "Renault Clio", price: 250, category: "economique", transmission: "manuelle", img: "https://cdn.pixabay.com/photo/2017/08/07/14/02/cars-2602113_960_720.jpg", specs: ["4 places", "Essence", "Éco"] },
    { name: "Peugeot 3008", price: 550, category: "suv", transmission: "auto", img: "https://cdn.pixabay.com/photo/2017/08/30/01/05/mountain-road-2693918_960_720.jpg", specs: ["5 places", "Hybride", "Assurance"] },
    { name: "Tesla Model 3", price: 650, category: "electrique", transmission: "auto", img: "https://cdn.pixabay.com/photo/2017/08/10/08/14/electric-car-2619267_960_720.jpg", specs: ["5 places", "Électrique", "Autopilot"], flash: true }
  ];
  document.getElementById('loadMore')?.addEventListener('click', () => {
    cars = [...cars, ...cars.slice(0, 3)];
    renderCars();
  });
}

function renderCars() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return console.error("Element #carsGrid manquant !");
  grid.innerHTML = cars.map(car => `
    <article class="car-card" data-category="${car.category}" data-transmission="${car.transmission}" data-price="${car.price}" data-aos="fade-up">
      <div class="car-image">
        <img src="${car.img}" alt="${car.name}" loading="lazy">
        <span class="tag ${car.popular ? 'popular' : ''}">${car.popular ? 'Populaire' : car.category}</span>
        <span class="availability available">Disponible</span>
      </div>
      <div class="car-details">
        <h3>${car.name}</h3>
        <p>${car.specs[2]}</p>
        <div class="specs">${car.specs.map(s => `<span><i class="fas fa-check"></i> ${s}</span>`).join('')}</div>
        <div class="price">${car.price} DH <small>/ jour</small></div>
        <button class="btn-select" data-car="${car.name} ${car.price} DH">Réserver</button>
      </div>
    </article>
  `).join('');
  setupCarSelection();
  applyFilters();
}

function setupCarSelection() {
  document.querySelectorAll('.btn-select').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('selectedCar').value = btn.dataset.car;
      document.querySelector('#book').scrollIntoView({ behavior: 'smooth' });
      updatePrice();
    });
  });
}

function setupSearch() {
  document.getElementById('quickSearch').addEventListener('input', e => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.car-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(query) ? '' : 'none';
    });
  });
}

function applyFilters() {
  const category = document.getElementById('carCategory').value;
  const transmission = document.getElementById('transmission').value;
  const maxPrice = document.getElementById('priceRange').value;
  document.getElementById('priceValue').textContent = maxPrice + ' DH max';

  document.querySelectorAll('.car-card').forEach(card => {
    const cat = card.dataset.category;
    const trans = card.dataset.transmission;
    const price = parseInt(card.dataset.price);
    let show = true;
    if (category && cat !== category) show = false;
    if (transmission && trans !== transmission) show = false;
    if (price > maxPrice) show = false;
    card.style.display = show ? '' : 'none';
  });
}

function setupFilters() {
  ['carCategory', 'transmission', 'priceRange'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('carCategory').value = '';
    document.getElementById('transmission').value = '';
    document.getElementById('priceRange').value = 800;
    applyFilters();
  });
}

function updatePrice() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const car = document.getElementById('selectedCar').value;
  const badge = document.getElementById('badge').checked;

  document.getElementById('totalPrice').textContent = '0 DH';
  document.getElementById('discountText').textContent = '';
  document.getElementById('addonsText').textContent = '';

  if (!start || !end || !car) return;

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate <= startDate) return;

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const pricePerDay = parseInt(car.match(/(\d+) DH/)[1]);
  let total = days * pricePerDay;

  const insurance = document.getElementById('insurance').checked ? 50 * days : 0;
  const babySeat = document.getElementById('babySeat').checked ? 20 : 0;
  total += insurance + babySeat;

  let discount = 0;
  if (badge) {
    discount = Math.round(total * 0.3);
    total = Math.round(total * 0.7);
  }

  document.getElementById('totalPrice').textContent = total + ' DH';
  document.getElementById('discountText').textContent = badge ? `Économie : ${discount} DH (-30%)` : '';
  document.getElementById('addonsText').textContent = (insurance + babySeat > 0) ? `Add-ons : ${insurance + babySeat} DH` : '';
}

function setupBooking() {
  ['startDate', 'endDate', 'badge', 'insurance', 'babySeat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updatePrice);
  });

  document.getElementById('bookingForm').addEventListener('submit', e => {
    e.preventDefault();
    const msg = document.getElementById('bookingConfirm');
    msg.textContent = `Réservation confirmée ! ${document.getElementById('selectedCar').value} — Nous vous contactons sous 2h.`;
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 7000);
    e.target.reset();
    document.getElementById('selectedCar').value = '';
    updatePrice();
  });
}

function setupTheme() {
  const toggle = document.getElementById('themeToggle');
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  toggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

  toggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
}

function setupMobileMenu() {
  const btn = document.querySelector('.mobile-menu');
  const nav = document.querySelector('.nav-links');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('active', !expanded);
  });
}

function setupCountdown() {
  const target = new Date('2026-01-01T00:00:00');
  setInterval(() => {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('mins').textContent = mins;
    document.getElementById('secs').textContent = secs;
  }, 1000);
}

function setupFlashPromo() {
  const promo = document.getElementById('flashPromo');
  document.getElementById('closeFlash').addEventListener('click', () => promo.style.display = 'none');
  setTimeout(() => promo.style.display = 'none', 10000);
}

function setupLanguage() {
  const buttons = document.querySelectorAll('.lang-switcher button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.id.replace('lang', '').toLowerCase();
      changeLang(lang);
    });
  });
}

function changeLang(lang) {
  document.querySelectorAll('[data-tr]').forEach(el => {
    const key = el.getAttribute('data-tr');
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
    if (el.placeholder && el.getAttribute('data-tr-placeholder')) {
      el.placeholder = translations[lang][el.getAttribute('data-tr-placeholder')] || el.placeholder;
    }
  });
  document.querySelectorAll('.lang-switcher button').forEach(b => b.classList.remove('active'));
  document.getElementById(`lang${lang.toUpperCase()}`).classList.add('active');
}

function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'flex';
  });
  document.getElementById('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('installBtn').style.display = 'none';
  });
}

function setupStadiumMap() {
  const maps = {
    casablanca: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26548.456!2d-6.864!3d33.971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDU4JzE0LjAiTiA2wrA1MSc5MC4wIlc!5e0!3m2!1sfr!2sma!4v1234567890",
    marrakech: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54321!2d-8.010!3d31.629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDM3JzQ0LjAiTiA4wrAwMCcwMC4wIlc!5e0!3m2!1sfr!2sma!4v1234567891",
    rabat: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26548!2d-6.835!3d34.020!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAxJzEyLjAiTiA2wrA1MCcwMC4wIlc!5e0!3m2!1sfr!2sma!4v1234567892"
  };
  document.getElementById('showRoute').addEventListener('click', () => {
    const stadium = document.getElementById('stadiumSelect').value;
    document.getElementById('stadiumMap').src = maps[stadium] || maps.casablanca;
  });
}

function setupScanner() {
  document.getElementById('scanBadge').addEventListener('click', () => {
    alert('Scanner en cours... Badge détecté ! -30% appliqué.');
    document.getElementById('badge').checked = true;
    updatePrice();
  });
}

function setupChatbot() {
  const toggle = document.getElementById('chatToggle');
  const chatbot = document.getElementById('chatbot');
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');

  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('active');
    if (chatbot.classList.contains('active') && messages.children.length === 0) {
      setTimeout(() => addMessage('bot', 'Bonjour ! Je suis CANBot.<br>Comment puis-je vous aider ?'), 600);
    }
  });

  function addMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `<strong>${sender === 'user' ? 'Vous' : 'CANBot'}:</strong> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  window.sendQuick = (msg) => {
    input.value = msg;
    sendMessage();
  };

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage('user', msg);
    input.value = '';
    const typing = document.createElement('div');
    typing.id = 'typing';
    typing.className = 'chat-message bot';
    typing.innerHTML = '<strong>CANBot:</strong> <i>En train d\'écrire...</i>';
    messages.appendChild(typing);

    setTimeout(() => {
      typing.remove();
      const replies = {
        suv: 'Le <strong>Hyundai Tucson</strong> (480 DH/jour) est parfait !',
        tesla: 'Tesla Model 3 disponible à <strong>Casablanca</strong> : 650 DH/jour.',
        badge: 'Avec votre <strong>badge CAN</strong> : -30% sur TOUS les véhicules !',
        stade: 'Livraison <strong>gratuite au stade</strong>.',
        default: 'Essayez : "SUV ?", "Tesla ?", "Badge" ou "Stade"'
      };
      const lower = msg.toLowerCase();
      let reply = replies.default;
      if (lower.includes('suv')) reply = replies.suv;
      else if (lower.includes('tesla')) reply = replies.tesla;
      else if (lower.includes('badge') || lower.includes('30')) reply = replies.badge;
      else if (lower.includes('stade') || lower.includes('livraison')) reply = replies.stade;
      addMessage('bot', reply + '<br><br><em>Mode hors ligne</em>');
    }, 1000);
  }

  input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  send.addEventListener('click', sendMessage);
}

function setupDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;
}
function setupPayment() {
  const form = document.getElementById('paymentForm');
  const methodRadios = document.querySelectorAll('input[name="method"]');
  const cardFields = document.getElementById('cardFields');
  const amountDisplay = document.getElementById('paymentAmount');

  // Afficher/masquer champs carte
  methodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      cardFields.style.display = radio.value === 'card' ? 'block' : 'none';
    });
  });

  // Mettre à jour le montant
  function updatePaymentAmount() {
    const total = document.getElementById('totalPrice').textContent;
    amountDisplay.textContent = total;
  }

  // Observer les changements de prix
  const observer = new MutationObserver(updatePaymentAmount);
  observer.observe(document.getElementById('totalPrice'), { childList: true, subtree: true });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = document.getElementById('paymentMsg');
    const method = document.querySelector('input[name="method"]:checked').value;

    if (method === 'card') {
      msg.innerHTML = `Paiement par carte en cours... <br><small>Simulation : paiement accepté !</small>`;
    } else if (method === 'cash') {
      msg.textContent = 'Réservation confirmée ! Paiement à la livraison.';
    } else {
      msg.textContent = 'Virement en attente. Réservation confirmée après réception.';
    }

    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 6000);
  });
}

// Ajouter dans initApp()
document.addEventListener('DOMContentLoaded', () => {
  // ... autres init
  setupPayment();
});
// === BOUTON RETOUR EN HAUT ===
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else backToTopBtn.classList.remove('show');
  }
);

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
// === FORMULAIRE CONTACT ===
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  
  // Simulation envoi
  showMessage(msg, 'Message envoyé ! Nous vous répondons sous 2h.', 'success');
  
  // Reset
  this.reset();
  document.querySelectorAll('.input-group label').forEach(l => {
    l.style.top = '50%';
    l.style.fontSize = '0.9rem';
  });
});

function showMessage(el, text, type = 'success') {
  el.textContent = text;
  el.className = 'confirm-msg';
  el.style.background = type === 'error' ? '#f8d7da' : '#d4edda';
  el.style.color = type === 'error' ? '#721c24' : '#155724';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}