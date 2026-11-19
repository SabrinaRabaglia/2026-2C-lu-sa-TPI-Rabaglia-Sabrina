import { URL_BASE_API } from '@/api/config';

export class ErrorApi extends Error {
  constructor(estadoHttp, datos) {
    super(datos?.error || 'Ocurrió un error al comunicarse con el servidor');
    this.name = 'ErrorApi';
    this.estadoHttp = estadoHttp;
    this.tipo = datos?.tipo;
    this.detalles = datos?.detalles;
  }
}

function construirUrl(ruta, parametrosConsulta) {
  const rutaNormalizada = ruta.startsWith('/') ? ruta : `/${ruta}`;
  const url = new URL(`${URL_BASE_API}/api${rutaNormalizada}`);

  if (parametrosConsulta) {
    for (const [clave, valor] of Object.entries(parametrosConsulta)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.append(clave, String(valor));
      }
    }
  }

  return url.toString();
}

export async function peticionApi(ruta, opciones = {}) {
  const { metodo = 'GET', cuerpo, consulta } = opciones;
  const url = construirUrl(ruta, consulta);

  const encabezados = {
    Accept: 'application/json',
  };
  if (cuerpo !== undefined) {
    encabezados['Content-Type'] = 'application/json';
  }

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi(0, {
      tipo: 'ErrorRed',
      error: `No pudimos conectarnos al servidor (${URL_BASE_API}). Verificá que el backend esté encendido y en la misma red Wi-Fi.`,
    });
  }

  const textoPlano = await respuesta.text();
  const datos = textoPlano ? JSON.parse(textoPlano) : null;

  if (!respuesta.ok) {
    const cuerpoError =
      datos && typeof datos === 'object' && 'error' in datos
        ? datos
        : { error: `Error del servidor (${respuesta.status})` };
    throw new ErrorApi(respuesta.status, cuerpoError);
  }

  return datos;
}
