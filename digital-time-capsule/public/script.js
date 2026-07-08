// DOM references
const capsuleGrid = document.getElementById('capsule-grid');
const emptyState = document.getElementById('empty-state');
const modalBackdrop = document.getElementById('modal-backdrop');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const capsuleForm = document.getElementById('capsule-form');

// Modal open/close
openModalBtn.addEventListener('click', () => {
  modalBackdrop.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  modalBackdrop.classList.add('hidden');
});

// close modal if they click outside the form
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) {
    modalBackdrop.classList.add('hidden');
  }
});

// Handle new capsule form submission
capsuleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('message', document.getElementById('message').value);
  formData.append('unlockDate', document.getElementById('unlock-date').value);
  formData.append('isPublic', document.getElementById('visibility').value);

  const imageFile = document.getElementById('image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const res = await fetch('/api/capsules', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      // close modal, reset form, reload the list
      modalBackdrop.classList.add('hidden');
      capsuleForm.reset();
      loadCapsules();
    }
  } catch (err) {
    console.error('Failed to create capsule:', err);
  }
});

// Load and render all capsules
async function loadCapsules() {
  try {
    const res = await fetch('/api/capsules');
    const capsules = await res.json();

    capsuleGrid.innerHTML = '';

    if (capsules.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // show newest first
    capsules.reverse().forEach(capsule => {
      capsuleGrid.appendChild(createCard(capsule));
    });

    // start the countdown timers
    startCountdowns();
  } catch (err) {
    console.error('Error loading capsules:', err);
  }
}

// Build a single capsule card element
function createCard(capsule) {
  const card = document.createElement('div');
  card.className = 'capsule-card';

  const badgeClass = capsule.isUnlocked ? 'unlocked' : 'locked';
  const badgeText = capsule.isUnlocked ? '🔓 Unlocked' : '🔒 Locked';

  // card header with title and badge
  let html = `
    <div class="card-header">
      <h3>${escapeHtml(capsule.title)}</h3>
      <div>
        <span class="badge ${badgeClass}">${badgeText}</span>
        ${capsule.isPublic ? '<span class="badge public">Public</span>' : ''}
      </div>
    </div>
    <div class="card-body">
  `;

  if (capsule.isUnlocked) {
    // show the revealed content
    if (capsule.image) {
      html += `<img src="${capsule.image}" alt="Capsule image" class="capsule-image">`;
    }
    html += `<p class="unlocked-message">${escapeHtml(capsule.message)}</p>`;
  } else {
    // show countdown and locked message
    html += `<p class="countdown" data-unlock="${capsule.unlockDate}">Calculating...</p>`;
    html += `<p class="locked-message">🔒 This capsule is sealed until ${formatDate(capsule.unlockDate)}</p>`;
  }

  html += `</div>`;

  // footer with date and delete button
  html += `
    <div class="card-footer">
      <span>Created: ${formatDate(capsule.createdAt)}</span>
      <button class="delete-btn" onclick="deleteCapsule('${capsule.id}')">Delete</button>
    </div>
  `;

  card.innerHTML = html;
  return card;
}

// Delete a capsule
async function deleteCapsule(id) {
  if (!confirm('Are you sure you want to delete this capsule?')) return;

  try {
    await fetch(`/api/capsules/${id}`, { method: 'DELETE' });
    loadCapsules();
  } catch (err) {
    console.error('Failed to delete:', err);
  }
}

// Update all countdown timers every second
function startCountdowns() {
  // clear any existing interval
  if (window.countdownInterval) clearInterval(window.countdownInterval);

  window.countdownInterval = setInterval(() => {
    const countdowns = document.querySelectorAll('.countdown');

    countdowns.forEach(el => {
      const unlockTime = new Date(el.dataset.unlock).getTime();
      const now = Date.now();
      const diff = unlockTime - now;

      if (diff <= 0) {
        // capsule just unlocked — reload to show the content
        loadCapsules();
        return;
      }

      // break the remaining time into days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      el.textContent = `⏱ Unlocks in ${days}d ${hours}h ${mins}m ${secs}s`;
    });
  }, 1000);
}

// --- Helpers ---

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// prevent XSS from user input
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// load capsules on page start
loadCapsules();
