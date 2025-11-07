// login.js - Version CORRIGÉE & FONCTIONNELLE (localStorage)
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 900, once: true });

  // === FONCTION D'AFFICHAGE DES MESSAGES ===
  function showMessage(el, text, type = 'error') {
    el.textContent = text;
    el.className = 'confirm-msg';
    if (type === 'error') {
      el.style.background = '#f8d7da';
      el.style.color = '#721c24';
      el.style.border = '1px solid #f5c6cb';
    } else {
      el.style.background = '#d4edda';
      el.style.color = '#155724';
      el.style.border = '1px solid #c3e6cb';
    }
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  }

  // === FORMULAIRE CONNEXION ===
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');

  if (loginForm && loginMsg) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showMessage(loginMsg, 'Veuillez remplir tous les champs.', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, email: user.email }));
        showMessage(loginMsg, 'Connexion réussie ! Redirection...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showMessage(loginMsg, 'Email ou mot de passe incorrect.', 'error');
      }
    });
  }

  // === FORMULAIRE INSCRIPTION ===
  const signupForm = document.getElementById('signupForm');
  const signupMsg = document.getElementById('signupMsg');

  if (signupForm && signupMsg) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const pass = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;

      if (!name || !email || !pass || !confirm) {
        showMessage(signupMsg, 'Tous les champs sont requis.', 'error');
        return;
      }

      if (pass !== confirm) {
        showMessage(signupMsg, 'Les mots de passe ne correspondent pas.', 'error');
        return;
      }

      if (pass.length < 6) {
        showMessage(signupMsg, 'Mot de passe trop court (6 caractères min).', 'error');
        return;
      }

      let users = JSON.parse(localStorage.getItem('users')) || [];

      if (users.some(u => u.email === email)) {
        showMessage(signupMsg, 'Cet email est déjà utilisé.', 'error');
        return;
      }

      users.push({ name, email, password: pass });
      localStorage.setItem('users', JSON.stringify(users));

      showMessage(signupMsg, 'Inscription réussie ! Connectez-vous.', 'success');
      setTimeout(() => {
        document.getElementById('loginEmail').value = email;
        document.querySelector('.auth-section').scrollIntoView({ behavior: 'smooth' });
      }, 1500);
    });
  }
});