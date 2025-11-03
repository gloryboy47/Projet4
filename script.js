// AOS
AOS.init({ duration: 900, once: true });

// === Theme Toggle ===
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

// === Recherche rapide ===
document.getElementById('quickSearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.car-card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = title.includes(query) ? 'block' : 'none';
  });
});

// === Filtres ===
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

    card.style.display = show ? 'block' : 'none';
  });
}

['carCategory', 'transmission', 'priceRange'].forEach(id => {
  document.getElementById(id).addEventListener('change', applyFilters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('carCategory').value = '';
  document.getElementById('transmission').value = '';
  document.getElementById('priceRange').value = 800;
  applyFilters();
});

// === Disponibilité simulée ===
function updateAvailability() {
  const startInput = document.getElementById('startDate').value;
  const endInput = document.getElementById('endDate').value;
  if (!startInput || !endInput) return;

  const start = new Date(startInput);
  const end = new Date(endInput);

  const unavailableDates = [
    { car: 'Renault Clio', start: new Date('2025-01-10'), end: new Date('2025-01-15') }
  ];

  document.querySelectorAll('.car-card').forEach(card => {
    const carName = card.querySelector('h3').textContent;
    const avail = card.querySelector('.availability');
    let isAvailable = true;

    unavailableDates.forEach(unavail => {
      if (carName.includes(unavail.car) && start >= unavail.start && end <= unavail.end) {
        isAvailable = false;
      }
    });

    avail.className = `availability ${isAvailable ? 'available' : 'unavailable'}`;
    avail.innerHTML = isAvailable ? '<i class="fas fa-check"></i> Disponible' : '<i class="fas fa-times"></i> Indisponible';
  });
}

// === Sélection voiture ===
document.querySelectorAll('.btn-select').forEach(btn => {
  btn.addEventListener('click', () => {
    const car = btn.dataset.car;
    document.getElementById('selectedCar').value = car;
    document.querySelector('#book').scrollIntoView({ behavior: 'smooth' });
    updateAvailability();
    updatePrice();
  });
});

// === Calcul prix (CORRIGÉ + ROBUSTE) ===
function updatePrice() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const car = document.getElementById('selectedCar').value;
  const badge = document.getElementById('badge').checked;

  // Réinitialisation
  document.getElementById('totalPrice').textContent = '0 DH';
  document.getElementById('discountText').textContent = '';
  document.getElementById('addonsText').textContent = '';

  if (!start || !end || !car) {
    if (car) document.getElementById('totalPrice').textContent = 'Sélectionnez les dates';
    return;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) {
    document.getElementById('totalPrice').textContent = 'Dates invalides';
    return;
  }
  if (endDate <= startDate) {
    document.getElementById('totalPrice').textContent = 'Date de fin doit être après le début';
    return;
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (days <= 0) return;

  const match = car.match(/(\d+) DH/);
  if (!match) {
    document.getElementById('totalPrice').textContent = 'Prix non détecté';
    return;
  }
  const pricePerDay = parseInt(match[1], 10);

  let total = days * pricePerDay;
  let discount = 0;
  let addonsTotal = 0;
  let addonsText = '';

  const insurance = document.getElementById('insurance').checked ? 50 * days : 0;
  const babySeat = document.getElementById('babySeat').checked ? 20 : 0;
  addonsTotal = insurance + babySeat;
  total += addonsTotal;

  if (addonsTotal > 0) {
    addonsText = `Add-ons : ${addonsTotal} DH`;
  }

  if (badge) {
    discount = total * 0.3;
    total = Math.round(total * 0.7);
  } else {
    total = Math.round(total);
  }

  document.getElementById('totalPrice').textContent = total + ' DH';
  document.getElementById('discountText').textContent = badge ? `Économie : ${Math.round(discount)} DH (-30%)` : '';
  document.getElementById('addonsText').textContent = addonsText;

  updateAvailability();
}

// Écouteurs pour mise à jour prix
['startDate', 'endDate', 'badge', 'insurance', 'babySeat'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', updatePrice);
});

// === Réservation ===
document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  const car = document.getElementById('selectedCar').value;
  const total = document.getElementById('totalPrice').textContent;
  const msg = document.getElementById('bookingConfirm');
  msg.innerHTML = `Réservation confirmée : ${car} pour ${total} ! Paiement sécurisé. Nous vous contactons sous 2h.`;
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 7000);
  e.target.reset();
  document.getElementById('selectedCar').value = '';
  updatePrice();
});

// === Contact ===
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  msg.textContent = 'Message envoyé ! Réponse sous 24h.';
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 5000);
  e.target.reset();
});

// === CHATBOT IA GROK (VERSION COMPLÈTE FONCTIONNELLE) ===
let chatOpen = false;
let isTyping = false;
const chatbot = document.getElementById('chatbot');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatToggle = document.getElementById('chatToggle');

function toggleChat() {
  chatOpen = !chatOpen;
  chatbot.classList.toggle('active', chatOpen);
  if (chatOpen) {
    chatInput.focus();
    if (chatMessages.children.length === 1) {
      setTimeout(() => {
        if (chatOpen) {
          addMessage('bot', 'Bonjour ! Je suis CANBot.<br>Comment puis-je vous aider ?<br><br><em>Essayez les boutons ci-dessous !</em>');
        }
      }, 800);
    }
  }
}

function addMessage(sender, text) {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();

  const div = document.createElement('div');
  div.className = `chat-message ${sender}`;
  div.innerHTML = `<strong>${sender === 'user' ? 'Vous' : 'CANBot'}:</strong> ${text.replace(/\n/g, '<br>')}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (sender === 'bot') {
    div.style.opacity = '0';
    setTimeout(() => {
      div.style.transition = 'opacity 0.4s ease';
      div.style.opacity = '1';
    }, 50);
  }
}

function showTyping() {
  const existing = document.getElementById('typingIndicator');
  if (existing) return;

  const typing = document.createElement('div');
  typing.id = 'typingIndicator';
  typing.className = 'chat-message bot';
  typing.innerHTML = '<strong>CANBot:</strong> <i>En train d\'écrire...</i>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// === BOUTONS RAPIDES (FONCTIONNE) ===
function sendQuick(message) {
  if (isTyping || !chatOpen) return;
  chatInput.value = message;
  sendMessage();
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message || isTyping) return;

  addMessage('user', message);
  chatInput.value = '';
  isTyping = true;
  chatSend.disabled = true;
  chatSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  showTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message,
        context: 'CANDrive.ma - Location voitures CAN 2025 Maroc. Voitures: Dacia, Hyundai, Audi, Tesla. Offre -30% badge supporter. Villes: Casablanca, Marrakech, Rabat.'
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.reply || "Désolé, je n'ai pas compris. Essayez un bouton !";
      setTimeout(() => {
        document.getElementById('typingIndicator')?.remove();
        addMessage('bot', reply);
      }, 600);
    } else {
      throw new Error();
    }
  } catch (error) {
    setTimeout(() => {
      document.getElementById('typingIndicator')?.remove();

      const replies = {
        'suv': 'Le <strong>Hyundai Tucson</strong> (480 DH/jour) est parfait pour les routes marocaines ! 4x4, clim, GPS.',
        'tesla': 'Tesla Model 3 disponible à <strong>Casablanca</strong> : 650 DH/jour. Autonomie 500km, Autopilot inclus.',
        'badge': 'Avec votre <strong>badge CAN</strong> : -30% sur TOUS les véhicules ! Économie réelle.',
        'stade': 'Livraison <strong>gratuite au stade</strong> (Casablanca, Marrakech, Rabat). Retrait en 15 min.',
        'default': 'Essayez : "SUV ?", "Tesla ?", "Badge" ou "Stade"'
      };

      const lower = message.toLowerCase();
      let reply = replies.default;
      if (lower.includes('suv')) reply = replies.suv;
      else if (lower.includes('tesla')) reply = replies.tesla;
      else if (lower.includes('badge') || lower.includes('30')) reply = replies.badge;
      else if (lower.includes('stade') || lower.includes('livraison')) reply = replies.stade;

      addMessage('bot', reply + '<br><br><em>Mode hors ligne – Réponses simulées</em>');
    }, 800);
  } finally {
    setTimeout(() => {
      isTyping = false;
      chatSend.disabled = false;
      chatSend.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }, 1000);
  }
}

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSend.addEventListener('click', sendMessage);

setTimeout(() => {
  if (!chatOpen && Math.random() > 0.7) {
    addMessage('bot', 'La CAN 2025 arrive ! Besoin d\'une voiture premium ?');
    toggleChat();
  }
}, 8000);

document.addEventListener('click', (e) => {
  if (!chatbot.contains(e.target) && !chatToggle.contains(e.target) && chatOpen) {
    toggleChat();
  }
});

// === Initialisation ===
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;
  applyFilters();
});