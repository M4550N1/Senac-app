'use strict';

// Front-end e API são servidos pelo mesmo JSON Server, evitando problemas de CORS.
window.HotelApi = (() => {
  const endpoint = '/reservas';

  async function request(path, options = {}) {
    if (!['http:', 'https:'].includes(window.location.protocol)) {
      throw new Error('Inicie o JSON Server com npm start e abra http://localhost:3000. Não abra o HTML diretamente.');
    }
    const response = await fetch(path, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`O serviço respondeu com erro ${response.status}. Tente novamente.`);
    return response.json();
  }

  return {
    criarReserva(data) {
      return request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    listarReservas() {
      return request(`${endpoint}?_sort=criadaEm&_order=desc`);
    }
  };
})();
