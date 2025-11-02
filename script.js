// AOS
AOS.init({ duration: 800, once: true });

// Countdown
const canDate = new Date('2026-01-05');
setInterval(() => {
  const diff = canDate - new Date();
  const d = String(Math.floor(diff / 86400000)).padStart(2, '0');
  const h = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  document.getElementById('days').textContent = d;
  document.getElementById('hours').textContent = h;
  document.getElementById('minutes').textContent = m;
  document.getElementById('seconds').textContent = s;
}, 1000);

// Form
document.getElementById('reserveForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const car = document.getElementById('carSelect').value;
  const confirm = document.getElementById('confirm');
  confirm.textContent = `Votre ${car} est réservée ! Un majordome vous contacte dans 5 min.`;
  confirm.classList.remove('hidden');
  setTimeout(() => confirm.classList.add('hidden'), 8000);
  e.target.reset();
});