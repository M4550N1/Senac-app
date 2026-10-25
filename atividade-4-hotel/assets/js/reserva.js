'use strict';

const form = document.getElementById('reservation-form');
const checkin = document.getElementById('checkin');
const checkout = document.getElementById('checkout');
const result = document.getElementById('form-result');

// As datas ISO (AAAA-MM-DD) podem ser comparadas sem conversão de fuso horário.
function validateDates() {
  checkout.setCustomValidity('');
  if (checkin.value && checkout.value && checkout.value <= checkin.value) {
    checkout.setCustomValidity('A data de saída deve ser posterior à entrada.');
  }
}

form.addEventListener('input', () => {
  result.hidden = true;
  validateDates();
});
form.addEventListener('change', validateDates);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  validateDates();
  form.classList.add('was-validated');
  if (!form.checkValidity()) {
    result.hidden = true;
    const invalidField = form.querySelector(':invalid');
    if (invalidField) invalidField.focus();
    return;
  }
  // Protótipo local: nenhuma requisição, cobrança ou reserva é realizada.
  result.hidden = false;
});
