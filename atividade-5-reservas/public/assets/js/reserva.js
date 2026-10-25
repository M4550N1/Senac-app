'use strict';

const form = document.getElementById('reservation-form');
const checkin = document.getElementById('checkin');
const checkout = document.getElementById('checkout');
const result = document.getElementById('form-result');
const message = document.getElementById('form-message');
const submitButton = form.querySelector('button[type="submit"]');
let sending = false;

function validateDates() {
  checkout.setCustomValidity('');
  if (checkin.value && checkout.value && checkout.value <= checkin.value) {
    checkout.setCustomValidity('A data de saída deve ser posterior à entrada.');
  }
}

form.addEventListener('input', () => {
  if (!sending) result.hidden = true;
  validateDates();
});
form.addEventListener('change', validateDates);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending) return;
  document.getElementById('name').value = document.getElementById('name').value.trim();
  validateDates();
  form.classList.add('was-validated');
  if (!form.checkValidity()) {
    result.hidden = true;
    form.querySelector(':invalid')?.focus();
    return;
  }

  const data = {
    nome: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    entrada: checkin.value,
    saida: checkout.value,
    observacoes: document.getElementById('notes').value.trim(),
    adultos: Number(document.getElementById('adults').value),
    criancas: Number(document.getElementById('children').value || 0),
    criadaEm: new Date().toISOString()
  };

  sending = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  result.hidden = true;
  try {
    const reservation = await window.HotelApi.criarReserva(data);
    if (!reservation || reservation.id === undefined) throw new Error('Resposta inesperada do serviço.');
    message.className = 'alert alert-success mb-0';
    message.textContent = `Solicitação nº ${reservation.id} registrada com sucesso! `;
    const link = document.createElement('a');
    link.href = 'reservas.html';
    link.className = 'alert-link';
    link.textContent = 'Ver solicitações de reservas.';
    message.append(link);
    form.reset();
    form.classList.remove('was-validated');
    checkout.setCustomValidity('');
  } catch (error) {
    message.className = 'alert alert-danger mb-0';
    message.textContent = `Não foi possível confirmar o envio. Verifique se o JSON Server está em execução. ${error.message}`;
    // Os campos são preservados quando ocorre erro para permitir uma nova tentativa.
  } finally {
    sending = false;
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar <span aria-hidden="true">→</span>';
    result.hidden = false;
    result.focus();
  }
});
