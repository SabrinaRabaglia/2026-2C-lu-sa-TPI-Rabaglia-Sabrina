import { ErrorApi, peticionApi } from '@/api/cliente';
import { obtenerEventos, obtenerVentasEvento } from '@/api/eventos';
import { crearCompra, cancelarCompra } from '@/api/compras';
import { loginUsuario, registrarUsuario } from '@/api/usuarios';

describe('Cliente HTTP y módulos de API', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = fetchOriginal;
  });

  it('construye URLs con query params filtrando valores vacíos o nulos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [], pagination: { page: 1, totalPages: 1 } }),
    });

    await obtenerEventos({
      texto: 'rock',
      categoriaIds: 'cat-1,cat-2',
      organizadorId: null,
      soloFuturos: '',
      page: 1,
      limit: 4,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [urlLlamada, opciones] = global.fetch.mock.calls[0];
    expect(urlLlamada).toContain('/api/eventos?');
    expect(urlLlamada).toContain('texto=rock');
    expect(urlLlamada).toContain('categoriaIds=cat-1%2Ccat-2');
    expect(urlLlamada).toContain('page=1');
    expect(urlLlamada).toContain('limit=4');
    expect(urlLlamada).not.toContain('organizadorId');
    expect(urlLlamada).not.toContain('soloFuturos');
    expect(opciones.method).toBe('GET');
  });

  it('envía POST /api/compras con estadoInicial PENDIENTE y Content-Type JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ id: 'compra-1', estado: 'PENDIENTE' }),
    });

    const resultado = await crearCompra({
      compradorId: 'user-1',
      eventoId: 'ev-1',
      tipoEntradaId: 'tipo-1',
      cantidad: 2,
    });

    expect(resultado.estado).toBe('PENDIENTE');
    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/compras');
    expect(opciones.method).toBe('POST');
    expect(opciones.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opciones.body)).toEqual({
      compradorId: 'user-1',
      eventoId: 'ev-1',
      tipoEntradaId: 'tipo-1',
      cantidad: 2,
      estadoInicial: 'PENDIENTE',
    });
  });

  it('soporta login, registro, ventas de evento y cancelación de compra', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'u-1', email: 'lucia@ticketit.com' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ id: 'u-2', email: 'nueva@utn.edu.ar' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ eventoId: 'ev-1', compras: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'c-1', estado: 'REEMBOLSADA' }),
      });

    await loginUsuario({ email: 'lucia@ticketit.com', password: '123456' });
    await registrarUsuario({
      nombre: 'Ana',
      apellido: 'Pérez',
      email: 'nueva@utn.edu.ar',
      password: 'secret',
      rol: 'COMPRADOR',
    });
    await obtenerVentasEvento('ev-1', 'org-1');
    await cancelarCompra('c-1', 'u-1');

    expect(global.fetch.mock.calls[0][0]).toContain('/api/usuarios/login');
    expect(global.fetch.mock.calls[1][0]).toContain('/api/usuarios/registro');
    expect(global.fetch.mock.calls[2][0]).toContain('/api/eventos/ev-1/compras?organizadorId=org-1');
    expect(global.fetch.mock.calls[3][0]).toContain('/api/compras/c-1');
    expect(global.fetch.mock.calls[3][1].method).toBe('DELETE');
  });

  it('lanza ErrorApi con estadoHttp y mensaje del backend cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      text: async () =>
        JSON.stringify({
          tipo: 'CupoInsuficienteError',
          error: 'No hay cupo suficiente para VIP',
        }),
    });

    await expect(peticionApi('/compras', { metodo: 'POST', cuerpo: {} })).rejects.toMatchObject({
      name: 'ErrorApi',
      estadoHttp: 409,
      tipo: 'CupoInsuficienteError',
      message: 'No hay cupo suficiente para VIP',
    });
  });

  it('lanza ErrorApi con tipo ErrorRed si fetch falla por red', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(peticionApi('/eventos')).rejects.toBeInstanceOf(ErrorApi);
  });
});
