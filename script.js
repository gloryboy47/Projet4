// Initialisation AOS
AOS.init({
  duration: 800,
  once: true
});

// Compteur CAN 2025 (début supposé : 5 janvier 2026)
const canDate = new Date('2026-01-05T00:00:00');
function updateCountdown() {
  const now = new Date();
  const diff = canDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = days.toString().padStart(2, '0');
  document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Sélection voiture
document.querySelectorAll('.select-car').forEach(btn => {
  btn.addEventListener('click', () => {
    const car = btn.getAttribute('data-car');
    document.getElementById('car').value = car;
    document.querySelector('#reservation').scrollIntoView({ behavior: 'smooth' });
  });
});

// Étapes du formulaire
const steps = document.querySelectorAll('.form-step');
let currentStep = 0;

document.querySelectorAll('.next-step').forEach(btn => {
  btn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      steps[currentStep].classList.remove('active');
      currentStep++;
      steps[currentStep].classList.add('active');
    }
  });
});

document.querySelectorAll('.prev-step').forEach(btn => {
  btn.addEventListener('click', () => {
    steps[currentStep].classList.remove('active');
    currentStep--;
    steps[currentStep].classList.add('active');
  });
});

function validateStep(step) {
  const inputs = steps[step].querySelectorAll('input, select');
  return Array.from(inputs).every(input => input.checkValidity());
}

// Soumission réservation
document.getElementById('reservationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const car = document.getElementById('car').value;
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const city = document.getElementById('city').value;
  const badge = document.getElementById('badge').checked;

  let message = `✅ Merci ${name} ! Votre ${car} est réservée du ${start} au ${end} à ${city}.`;
  if (badge) message += " 🎟️ Réduction -30% appliquée !";

  const confirmation = document.getElementById('confirmation');
  confirmation.textContent = message;
  confirmation.classList.remove('hidden');
  this.reset();
  setTimeout(() => confirmation.classList.add('hidden'), 8000);
});

// Contact
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const confirmation = document.getElementById('contactConfirmation');
  confirmation.textContent = `📨 Merci ${name} ! Nous vous répondons sous 24h à ${email}.`;
  confirmation.classList.remove('hidden');
  this.reset();
  setTimeout(() => confirmation.classList.add('hidden'), 6000);
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});