import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
    EstadoCompra,
    CompraNoReseniableError,
    EventoFinalizadoError,
    AutoCompraNoPermitidaError,
    CompraYaReseniadaError,
    FechaEventoInvalidaError
} from "../src/models/index.js";
import { repositories } from "../src/repositories/index.js";
import { seedDatabase } from "../src/data/seed.js";
import {
    categoriaService,
    usuarioService,
    eventoService,
    compraService,
    reseniaService,
    ConflictoEntidadError,
    OperacionNoAutorizadaError
} from "../src/services/index.js";

describe("Capa de Servicios (Orquestación de Casos de Uso) - AI Ticket It", () => {
    let seedData;

    beforeEach(() => {
        seedData = seedDatabase(repositories);
    });

    it("EventoService: debe crear un evento guardando sus tipos de entrada y enriquecerlo con puntaje y reseñas del organizador", () => {
        const [catRecitales] = seedData.categorias;
        const [orgRock] = seedData.usuarios;

        const nuevoEvento = eventoService.crearEvento({
            nombre: "Show Sinfónico",
            descripcion: "Orquesta en vivo",
            categoriaId: catRecitales.id,
            fecha: new Date("2027-05-10T21:00:00Z"),
            tiposEntrada: [
                { nombre: "Platea", descripcion: "Sector bajo", precio: 30000, cupo: 50 },
                { nombre: "Pullman", descripcion: "Sector alto", precio: 20000, cupo: 100 }
            ],
            multimedia: ["https://ejemplo.com/sinfonico.jpg"],
            organizadorId: orgRock.id
        });

        assert.ok(nuevoEvento.id);
        assert.equal(nuevoEvento.tiposEntrada.length, 2);
        assert.equal(nuevoEvento.precioMinimo, 20000);
        // orgRock tiene dos reseñas en el seed (5 y 4 -> promedio 4.5)
        assert.equal(nuevoEvento.puntajeOrganizador, 4.5);
        assert.equal(nuevoEvento.reseniasOrganizador.length, 2);
    });

    it("EventoService: debe buscar eventos y ordenarlos por precio, fecha y puntaje del organizador", () => {
        const porPrecioAsc = eventoService.buscarEventos({ ordenarPor: "precio", direccion: "asc" });
        assert.ok(porPrecioAsc[0].precioMinimo <= porPrecioAsc[1].precioMinimo);

        const porFechaAsc = eventoService.buscarEventos({ ordenarPor: "fecha", direccion: "asc" });
        assert.ok(porFechaAsc[0].fecha.getTime() <= porFechaAsc[1].fecha.getTime());

        const porPuntajeDesc = eventoService.buscarEventos({ ordenarPor: "puntaje" });
        assert.ok(porPuntajeDesc[0].puntajeOrganizador >= porPuntajeDesc[porPuntajeDesc.length - 1].puntajeOrganizador);

        // Filtrado por múltiples categorías (Teatro y Conferencias)
        const [catRecitales, catTeatro, catConferencias] = seedData.categorias;
        const multiCategoria = eventoService.buscarEventos({
            categoriaIds: `${catTeatro.id},${catConferencias.id}`
        });
        assert.equal(multiCategoria.length, 4);

        // Paginación de eventos (12 eventos totales -> 3 páginas de 4)
        const pagina1 = eventoService.buscarEventos({ ordenarPor: "precio", direccion: "asc", page: 1, limit: 4 });
        assert.equal(pagina1.items.length, 4);
        assert.equal(pagina1.pagination.page, 1);
        assert.equal(pagina1.pagination.limit, 4);
        assert.equal(pagina1.pagination.total, 12);
        assert.equal(pagina1.pagination.totalPages, 3);
        assert.equal(pagina1.pagination.hasNextPage, true);
        assert.equal(pagina1.pagination.hasPrevPage, false);
    });

    it("CompraService: debe realizar una compra, descontar cupo, registrar cambio de estado y calcular días faltantes", () => {
        const [, , compLucia] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;
        const tipoVip = evFestivalRock.tiposEntrada[2];
        const cupoInicial = tipoVip.cupo;

        const compra = compraService.realizarCompra({
            compradorId: compLucia.id,
            eventoId: evFestivalRock.id,
            tipoEntradaId: tipoVip.id,
            cantidad: 2
        });

        assert.equal(compra.estado, EstadoCompra.PENDIENTE);
        assert.equal(compra.total, tipoVip.precio * 2);
        assert.equal(tipoVip.cupo, cupoInicial - 2);
        assert.equal(compra.diasFaltantesParaEvento, null);
        assert.equal(compra.cambiosEstado.length, 1);
        assert.equal(compra.cambiosEstado[0].estado, EstadoCompra.PENDIENTE);

        // Pago simulado -> CONFIRMADA
        const compraConfirmada = compraService.actualizarEstadoCompra({
            compraId: compra.id,
            estado: EstadoCompra.CONFIRMADA,
            usuarioId: compLucia.id
        });
        assert.equal(compraConfirmada.estado, EstadoCompra.CONFIRMADA);
        assert.ok(compraConfirmada.diasFaltantesParaEvento > 0);
        assert.equal(compraConfirmada.cambiosEstado.length, 2);
    });

    it("CompraService: debe permitir al organizador ver las compras de un evento diferenciadas por estado y cupos disponibles", () => {
        const [orgRock] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;

        const vistaOrganizador = compraService.obtenerComprasPorEvento(evFestivalRock.id, orgRock.id);

        assert.equal(vistaOrganizador.eventoId, evFestivalRock.id);
        assert.equal(vistaOrganizador.resumenPorEstado[EstadoCompra.CONFIRMADA].length, 2);
        assert.equal(vistaOrganizador.disponibilidadEntradas.length, 3);
    });

    it("CompraService: debe permitir enviar mensajes en la compra y cancelar reintegrando cupo y registrando cambio de estado", () => {
        const [orgRock, , compLucia] = seedData.usuarios;
        const [compraConfirmada] = seedData.compras;
        const cupoAntesDeCancelar = compraConfirmada.tipoEntrada.cupo;

        const nuevoMsg = compraService.enviarMensaje({
            compraId: compraConfirmada.id,
            usuarioId: compLucia.id,
            mensaje: "¿Se puede ingresar con mochila?"
        });
        assert.ok(nuevoMsg.id);

        const respuestaMsg = compraService.enviarMensaje({
            compraId: compraConfirmada.id,
            usuarioId: orgRock.id,
            mensaje: "Sí, mochilas pequeñas están permitidas."
        });
        assert.ok(respuestaMsg.id);

        const compraCancelada = compraService.cancelarCompra({
            compraId: compraConfirmada.id,
            usuarioId: compLucia.id
        });

        assert.equal(compraCancelada.estado, EstadoCompra.REEMBOLSADA);
        assert.equal(compraConfirmada.tipoEntrada.cupo, cupoAntesDeCancelar + compraConfirmada.cantidad);
        assert.equal(compraCancelada.diasFaltantesParaEvento, null);
        assert.equal(
            compraCancelada.cambiosEstado[compraCancelada.cambiosEstado.length - 1].estado,
            EstadoCompra.REEMBOLSADA
        );
    });

    it("ReseniaService: debe permitir reseñar solo cuando la compra está UTILIZADA y rechazar si está CONFIRMADA", () => {
        const [, , compLucia] = seedData.usuarios;
        const [compraConfirmada, , compraUtilizada] = seedData.compras;

        assert.throws(
            () =>
                reseniaService.crearResenia({
                    compraId: compraConfirmada.id,
                    compradorId: compLucia.id,
                    puntuacion: 5,
                    detalle: "Todavía no fui"
                }),
            CompraNoReseniableError
        );

        const nuevaResenia = reseniaService.crearResenia({
            compraId: compraUtilizada.id,
            compradorId: compLucia.id,
            puntuacion: 5,
            detalle: "Increíble experiencia"
        });

        assert.ok(nuevaResenia.id);
        assert.equal(nuevaResenia.puntuacion, 5);
    });

    it("UsuarioService y CategoriaService: deben calcular el promedio de reseñas del organizador y gestionar favoritos y categorías", () => {
        const [orgRock, , , compMateo] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;

        assert.equal(usuarioService.calcularPromedioOrganizador(orgRock.id), 4.5);

        usuarioService.agregarFavorito(compMateo.id, evFestivalRock.id);
        assert.equal(usuarioService.obtenerFavoritos(compMateo.id).length, 1);

        usuarioService.quitarFavorito(compMateo.id, evFestivalRock.id);
        assert.equal(usuarioService.obtenerFavoritos(compMateo.id).length, 0);

        const nuevaCat = categoriaService.crearCategoria({
            nombre: "Feria Gastronómica",
            descripcion: "Eventos culinarios"
        });
        assert.ok(nuevaCat.id);
        assert.throws(
            () => categoriaService.crearCategoria({ nombre: "feria gastronómica" }),
            ConflictoEntidadError
        );
    });

    it("Reglas de negocio y seguridad extra: fecha futura, no auto-compra, no eventos pasados, no reseña duplicada, permisos y métricas", () => {
        const [catRecitales] = seedData.categorias;
        const [orgRock, , compLucia, compMateo] = seedData.usuarios;
        const [evFestivalRock, , , evAcusticoPasado] = seedData.eventos;
        const [compraConfirmada, , compraUtilizada] = seedData.compras;

        // 1. No permitir publicar evento con fecha pasada
        assert.throws(
            () =>
                eventoService.crearEvento({
                    nombre: "Evento del Pasado",
                    categoriaId: catRecitales.id,
                    fecha: new Date("2020-01-01T20:00:00Z"),
                    tiposEntrada: [{ nombre: "General", precio: 1000, cupo: 10 }],
                    organizadorId: orgRock.id
                }),
            FechaEventoInvalidaError
        );

        // 2. Filtros soloFuturos y soloConCupo + indicadores agotado/cupoTotalDisponible
        // De los 12 eventos del seed: 2 ya ocurrieron y 1 futuro está agotado (Final Básquet) -> quedan 9 futuros con cupo
        const soloFuturos = eventoService.buscarEventos({ soloFuturos: true, soloConCupo: true });
        assert.equal(soloFuturos.length, 9);
        assert.equal(soloFuturos[0].agotado, false);
        assert.ok(soloFuturos[0].cupoTotalDisponible > 0);

        // 3. No permitir comprar entradas de un evento que ya ocurrió
        assert.throws(
            () =>
                compraService.realizarCompra({
                    compradorId: compMateo.id,
                    eventoId: evAcusticoPasado.id,
                    tipoEntradaId: evAcusticoPasado.tiposEntrada[0].id,
                    cantidad: 1
                }),
            EventoFinalizadoError
        );

        // 4. No permitir auto-compra del organizador
        assert.throws(
            () =>
                compraService.realizarCompra({
                    compradorId: orgRock.id,
                    eventoId: evFestivalRock.id,
                    tipoEntradaId: evFestivalRock.tiposEntrada[0].id,
                    cantidad: 1
                }),
            AutoCompraNoPermitidaError
        );

        // 5. Permisos: un tercero no puede cancelar una compra ajena
        assert.throws(
            () =>
                compraService.cancelarCompra({
                    compraId: compraConfirmada.id,
                    usuarioId: compMateo.id
                }),
            OperacionNoAutorizadaError
        );

        // 6. Permisos: el comprador no puede marcar su entrada como UTILIZADA (solo el organizador)
        assert.throws(
            () =>
                compraService.actualizarEstadoCompra({
                    compraId: compraConfirmada.id,
                    estado: EstadoCompra.UTILIZADA,
                    usuarioId: compLucia.id
                }),
            OperacionNoAutorizadaError
        );

        // 7. No permitir reseña duplicada sobre la misma compra
        reseniaService.crearResenia({
            compraId: compraUtilizada.id,
            compradorId: compLucia.id,
            puntuacion: 5,
            detalle: "Primera calificación"
        });
        const compraActualizada = compraService.obtenerCompraPorId(compraUtilizada.id);
        assert.equal(compraActualizada.yaFueReseniada, true);
        assert.equal(compraActualizada.puedeSerReseniada, false);

        assert.throws(
            () =>
                reseniaService.crearResenia({
                    compraId: compraUtilizada.id,
                    compradorId: compLucia.id,
                    puntuacion: 4,
                    detalle: "Segunda calificación duplicada"
                }),
            CompraYaReseniadaError
        );

        // 8. Métricas financieras y de ocupación para el organizador (Lucía 2x25000 + Valentina 2x45000 = 140000)
        const dashboard = compraService.obtenerComprasPorEvento(evFestivalRock.id, orgRock.id);
        assert.equal(dashboard.metricas.recaudacionTotal, 140000);
        assert.equal(dashboard.metricas.entradasVendidas, 4);
        assert.equal(dashboard.metricas.capacidadTotal, 230);
        assert.ok(dashboard.metricas.porcentajeOcupacion > 0);
        assert.equal(dashboard.metricas.agotado, false);
    });
});
