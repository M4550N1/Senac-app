'use strict';

const byId = (id) => document.getElementById(id);
const money = (cents) => (cents / 100).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL'
});
const valueInput = byId('value');
const pixPanel = byId('pix-panel');
const cardPanel = byId('card-panel');
const installments = byId('installments');
let baseCents = 0;
let activeMethod = null;

// Converte valores brasileiros e decimais em centavos para evitar erros de ponto flutuante.
function parseMoney(text) {
  let value = text.trim();
  if (/^\d+\.\d{1,2}$/.test(value)) value = value.replace('.', ',');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const [integer, decimals = ''] = value.replaceAll('.', '').split(',');
  const cents = Number(integer) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 999999999 ? cents : null;
}

// Os juros são aplicados uma única vez sobre o valor inicial, não a cada parcela.
function totalFor(count) {
  const percentage = count === 4 ? 105 : count === 5 ? 110 : 100;
  return Math.round(baseCents * percentage / 100);
}

function hidePanels() {
  pixPanel.hidden = true;
  cardPanel.hidden = true;
  byId('breakdown').hidden = true;
  byId('total-value').textContent = money(0);
  byId('total-detail').textContent = '';
  byId('pay').disabled = true;
  byId('summary-placeholder').hidden = false;
  activeMethod = null;
}

function clearValueError() {
  byId('value-error').hidden = true;
  valueInput.removeAttribute('aria-invalid');
}

function showSummary() {
  const pix = activeMethod === 'pix';
  const count = pix ? 1 : Number(installments.value);
  const total = pix ? Math.round(baseCents * 90 / 100) : totalFor(count);
  const difference = total - baseCents;
  byId('base-total').textContent = money(baseCents);
  byId('adjustment-label').textContent = pix ? 'Desconto Pix (10%)'
    : `Juros (${count === 4 ? 5 : count === 5 ? 10 : 0}%)`;
  byId('adjustment-value').textContent = (difference < 0 ? '− ' : difference > 0 ? '+ ' : '') + money(Math.abs(difference));
  byId('total-value').textContent = money(total);
  byId('total-detail').textContent = pix ? 'À vista no Pix · 10% de desconto'
    : `${count}x de ${money(Math.round(total / count))}${count <= 3 ? ' sem juros' : ' com juros'}`;
  if (!pix && total % count !== 0) {
    byId('total-detail').textContent += ' · parcela aproximada; ajuste de centavos na última.';
  }
  byId('pix-saving').textContent = money(baseCents - Math.round(baseCents * 90 / 100));
  byId('summary-placeholder').hidden = true;
  byId('summary-values').hidden = false;
  byId('breakdown').hidden = false;
  byId('pay').disabled = false;
}

byId('options-form').addEventListener('submit', (event) => {
  event.preventDefault();
  hidePanels();
  const parsed = parseMoney(valueInput.value);
  if (parsed === null) {
    byId('value-error').textContent = valueInput.value.trim() === ''
      ? 'O campo valor deve ser preenchido.'
      : 'Informe um valor válido, maior que zero e até R$ 9.999.999,99.';
    byId('value-error').hidden = false;
    valueInput.setAttribute('aria-invalid', 'true');
    valueInput.focus();
    return;
  }
  clearValueError();
  baseCents = parsed;
  activeMethod = document.querySelector('input[name="method"]:checked').value;
  if (activeMethod === 'pix') {
    pixPanel.hidden = false;
  } else {
    // Reconstrói todas as opções usando o valor atualizado da compra.
    installments.replaceChildren();
    byId('installment-preview').replaceChildren();
    for (let count = 1; count <= 5; count++) {
      const total = totalFor(count);
      const interest = count <= 3 ? 'sem juros' : count === 4 ? '5% de juros' : '10% de juros';
      const option = document.createElement('option');
      option.value = String(count);
      option.textContent = `${count}x de ${money(Math.round(total / count))} — ${interest}`;
      installments.append(option);
      const preview = document.createElement('li');
      preview.textContent = `${count}x ${money(Math.round(total / count))}`;
      byId('installment-preview').append(preview);
    }
    cardPanel.hidden = false;
  }
  showSummary();
});

valueInput.addEventListener('input', () => {
  clearValueError();
  hidePanels(); // Não permite pagar com um total antigo após editar o valor.
});
document.querySelectorAll('input[name="method"]').forEach((radio) => {
  radio.addEventListener('change', hidePanels);
});
installments.addEventListener('change', showSummary);

// Ícones próprios em SVG, embutidos no JS: duas bandeiras fictícias para o exercício.
const brands = {
  '1234': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 36" role="img" aria-label="Bandeira Azul, prefixo 1234"><rect width="56" height="36" rx="6" fill="#164b86"/><path d="M10 25 18 11h6l8 14h-6l-2-4h-7l-2 4z" fill="white"/><circle cx="42" cy="18" r="6" fill="#82c5ec"/></svg>',
  '4321': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 36" role="img" aria-label="Bandeira Coral, prefixo 4321"><rect width="56" height="36" rx="6" fill="#fff0e7"/><circle cx="23" cy="18" r="10" fill="#d34d32"/><circle cx="34" cy="18" r="10" fill="#eea92d" fill-opacity=".85"/></svg>'
};
byId('card-number').addEventListener('input', (event) => {
  const raw = event.target.value;
  const compact = raw.replace(/\s/g, '');
  const prefix = compact.slice(0, 4);
  const valid = /^\d+$/.test(compact) && Object.hasOwn(brands, prefix);
  const invalid = raw.trim() !== '' && !valid;
  byId('card-brand').innerHTML = valid ? brands[prefix] : '';
  byId('card-brand').hidden = !valid;
  byId('number-error').hidden = !invalid;
  event.target.setAttribute('aria-invalid', String(invalid));
});

byId('pay').addEventListener('click', () => {
  if (!activeMethod) return;
  // Apenas demonstração: não há envio, persistência, QR Code ou cobrança real.
  byId('checkout').hidden = true;
  byId('success').hidden = false;
  byId('success').focus();
  ['pix-cpf', 'card-number', 'holder', 'expiration', 'cvv'].forEach((id) => { byId(id).value = ''; });
});
