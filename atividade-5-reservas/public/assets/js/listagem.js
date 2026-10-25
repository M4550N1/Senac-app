'use strict';

const body = document.getElementById('reservations-body');
const statusText = document.getElementById('list-status');
const errorBox = document.getElementById('list-error');
const refresh = document.getElementById('refresh');
const region = document.getElementById('table-region');

function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—';
  return value.split('-').reverse().join('/');
}

function dateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR');
}

function stateRow(text) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 9;
  cell.className = 'text-center text-secondary py-4';
  cell.textContent = text;
  row.append(cell);
  body.replaceChildren(row);
}

async function loadReservations() {
  refresh.disabled = true;
  region.setAttribute('aria-busy', 'true');
  errorBox.hidden = true;
  statusText.textContent = 'Carregando solicitações…';
  stateRow('Aguarde enquanto consultamos o serviço.');
  try {
    const reservations = await window.HotelApi.listarReservas();
    if (!Array.isArray(reservations)) throw new Error('O serviço retornou um formato inesperado.');
    body.replaceChildren();
    for (const reservation of reservations) {
      const row = document.createElement('tr');
      const values = [
        reservation.id ?? '—', reservation.nome || '—', reservation.email || '—',
        dateOnly(reservation.entrada), dateOnly(reservation.saida),
        reservation.adultos ?? '—', reservation.criancas ?? 0,
        reservation.observacoes || '—', dateTime(reservation.criadaEm)
      ];
      for (const value of values) {
        const cell = document.createElement('td');
        // Texto vindo do serviço nunca é interpretado como HTML.
        cell.textContent = String(value);
        row.append(cell);
      }
      body.append(row);
    }
    if (reservations.length === 0) stateRow('Nenhuma solicitação de reserva registrada.');
    statusText.textContent = `${reservations.length} ${reservations.length === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}.`;
  } catch (error) {
    statusText.textContent = 'Consulta não concluída.';
    errorBox.textContent = `Não foi possível carregar as reservas. Verifique se o JSON Server está em execução e clique em Atualizar lista. ${error.message}`;
    errorBox.hidden = false;
    stateRow('Os dados não puderam ser carregados.');
  } finally {
    refresh.disabled = false;
    region.setAttribute('aria-busy', 'false');
  }
}

refresh.addEventListener('click', loadReservations);
loadReservations(); // Recupera os dados automaticamente ao abrir a página.
