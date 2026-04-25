// ===== Modal Component =====
import eventBus from '../eventBus.js';

let modalStack = [];

export function showModal(options) {
  const { title, content, footer, className = '', onClose } = options;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal ${className}">
      <div class="modal__header">
        <div class="modal__title">${title || ''}</div>
        <button class="modal__close" id="modal-close-btn">
          <i data-lucide="x" width="18" height="18"></i>
        </button>
      </div>
      <div class="modal__body">${content || ''}</div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  modalStack.push(overlay);

  // Init lucide icons in modal
  if (window.lucide) lucide.createIcons();

  // Close handlers
  const closeBtn = overlay.querySelector('#modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(overlay, onClose));
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay, onClose);
  });

  return overlay;
}

export function closeModal(overlay, callback) {
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
      modalStack = modalStack.filter(m => m !== overlay);
    }, 300);
  }
  if (callback) callback();
}

export function closeAllModals() {
  modalStack.forEach(m => {
    m.classList.remove('active');
    setTimeout(() => m.remove(), 300);
  });
  modalStack = [];
}

// Toast system
export function showToast(type, message, duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast__message">${message}</div>
    <span class="toast__close">&times;</span>
  `;

  container.appendChild(toast);

  toast.querySelector('.toast__close').addEventListener('click', () => {
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => {
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Listen for toast events
eventBus.on('toast', ({ type, message }) => {
  showToast(type, message);
});
