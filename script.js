// AOS
AOS.init({ duration: 900, once: true });

// Theme Toggle
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

// Recherche rapide
document.getElementById('quickSearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.car-card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = title.includes(query) ? 'block' : 'none';
  });
});

// Filtres
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

// Disponibilité simulée
function updateAvailability() {
  const start = new Date(document.getElementById('startDate').value);
  const end = new Date(document.getElementById('endDate').value);
  if (!start || !end) return;

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

// Sélection voiture
document.querySelectorAll('.btn-select').forEach(btn => {
  btn.addEventListener('click', () => {
    const car = btn.dataset.car;
    document.getElementById('selectedCar').value = car;
    document.querySelector('#book').scrollIntoView({ behavior: 'smooth' });
    updateAvailability();
  });
});

// Calcul prix
function updatePrice() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const car = document.getElementById('selectedCar').value;
  const badge = document.getElementById('badge').checked;

  if (!start || !end || !car) {
    document.getElementById('totalPrice').textContent = '0 DH';
    return;
  }

  const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  if (days <= 0) return;

  const pricePerDay = parseInt(car.match(/\d+/)[0]);
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
    total *= 0.7;
  }

  document.getElementById('totalPrice').textContent = Math.round(total) + ' DHA';
  document.getElementById('discountText').textContent = badge ? `Économie : ${Math.round(discount)} DH (-30%)` : '';
  document.getElementById('addonsText').textContent = addonsText;
  updateAvailability();
}

['startDate', 'endDate', 'badge', 'insurance', 'babySeat'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', updatePrice);
});

// Réservation
document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  const car = document.getElementById('selectedCar').value;
  const total = document.getElementById('totalPrice').textContent;
  const msg = document.getElementById('bookingConfirm');
  msg.innerHTML = `Réservation confirmée : ${car} pour ${total} ! Paiement sécurisé. Nous vous contactons sous 2h.`;
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 7000);
  e.target.reset();
  updatePrice();
});

// Contact
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  msg.textContent = 'Message envoyé ! Réponse sous 24h.';
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 5000);
  e.target.reset();
});
// === CHATBOT IA GROK ===
let chatOpen = false;
let isTyping = false;
const chatbot = document.getElementById('chatbot');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatToggle = document.getElementById('chatToggle');

// Toggle Chat
function toggleChat() {
  chatOpen = !chatOpen;
  chatbot.classList.toggle('active', chatOpen);
  
  if (chatOpen) {
    chatInput.focus();
    // Auto-message après 3s si vide
    if (chatMessages.children.length === 1) {
      setTimeout(() => {
        if (chatOpen) addMessage('bot', '💬 Exemples de questions :<br>• "SUV disponible à Marrakech ?"<br>• "Prix Tesla avec badge CAN ?"<br>• "Livraison au stade ?"');
      }, 1500);
    }
  }
}

// Add Message
function addMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `chat-message ${sender}`;
  div.innerHTML = `<strong>${sender === 'user' ? 'Vous' : 'CANBot'}:</strong> ${text.replace(/\n/g, '<br>')}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  if (sender === 'bot') {
    div.style.opacity = '0';
    setTimeout(() => div.style.transition = 'opacity 0.3s', 100);
    setTimeout(() => div.style.opacity = '1', 150);
  }
}

// Send Message
async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message || isTyping) return;

  addMessage('user', message);
  chatInput.value = '';
  isTyping = true;
  chatSend.disabled = true;
  chatSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  try {
    // Appel API Grok (Vercel Serverless)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message,
        context: 'CANDrive.ma - Location voitures CAN 2025 Maroc. Voitures: Dacia, Hyundai, Audi, Tesla. Offre -30% badge supporter. Villes: Casablanca, Marrakech, Rabat.'
      })
    });

    const data = await response.json();
    const reply = data.reply || "Désolé, je n'ai pas compris 😅<br>Essayez: 'SUV disponible ?' ou 'Prix avec badge'";
    addMessage('bot', reply);
    
  } catch (error) {
    // Fallback local (sans API)
    const fallbackReplies = [
      "🔍 **Recommandation rapide** : Le Hyundai Tucson SUV (480 DH/jour) est parfait pour les stades !",
      "🎟️ **Offre CAN** : -30% avec badge supporter sur TOUS les véhicules",
      "🚗 **Populaire** : Réservez le Peugeot 3008 hybride pour Marrakech",
      "⚡ **Électrique** : Tesla Model 3 disponible à Casablanca (650 DH/jour)"
    ];
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    addMessage('bot', randomReply + '<br><em>(Mode hors ligne - API en maintenance)</em>');
  } finally {
    isTyping = false;
    chatSend.disabled = false;
    chatSend.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }
}

// Events
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSend.addEventListener('click', sendMessage);

// Auto-open après 8s (optionnel)
setTimeout(() => {
  if (!chatOpen && Math.random() > 0.7) { // 30% chance
    addMessage('bot', '⚽ La CAN 2025 arrive ! Besoin d\'une voiture premium ?');
    toggleChat();
  }
}, 8000);

// Close on outside click
document.addEventListener('click', (e) => {
  if (!chatbot.contains(e.target) && !chatToggle.contains(e.target) && chatOpen) {
    toggleChat();
  }
});