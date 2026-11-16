import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    EstadoCompra,
    Categoria,
    TipoEntrada,
    Usuario,
    Evento,
    Mensaje,
    CambioEstadoCompra,
    Compra,
    Resenia
} from "../src/models/index.js";

describe("Capa de Dominio - AI Ticket It", () => {
    describe("TipoEntrada", () => {
        it("debe verificar si hay cupo disponible y permitir descontar y reintegrar cupos", () => {
            const entradaVip = new TipoEntrada({
                id: 1,
                nombre: "VIP",
                descripcion: "Acceso preferencial",
                precio: 25000,
                cupo: 10
            });

            assert.equal(entradaVip.hayCupoPara(4), true);
            assert.equal(entradaVip.hayCupoPara(10), true);
            assert.equal(entradaVip.hayCupoPara(11), false);
            assert.equal(entradaVip.hayCupoPara(0), false);

            entradaVip.descontarCupo(4);
            assert.equal(entradaVip.cupo, 6);

            assert.throws(() => entradaVip.descontarCupo(7), /No hay cupo suficiente/);

            entradaVip.reintegrarCupo(2);
            assert.equal(entradaVip.cupo, 8);
        });
    });

    describe("Evento", () => {
        it("debe evaluar si su precio está entre un rango y calcular el precio mínimo y días restantes", () => {
            const categoria = new Categoria({ id: 1, nombre: "Recitales", descripcion: "Música en vivo" });
            const organizador = new Usuario({ id: 10, nombre: "Ana", apellido: "Gómez" });
            const general = new TipoEntrada({ id: 1, nombre: "General", precio: 15000, cupo: 100 });
            const platea = new TipoEntrada({ id: 2, nombre: "Platea", precio: 30000, cupo: 50 });

            const fechaEvento = new Date("2026-12-20T21:00:00Z");
            const evento = new Evento({
                id: 100,
                nombre: "Festival de Rock",
                descripcion: "Bandas en vivo al aire libre",
                categoria,
                fecha: fechaEvento,
                tiposEntrada: [general, platea],
                multimedia: ["https://ejemplo.com/poster.jpg"],
                organizador
            });

            assert.equal(evento.tuPrecioEstaEntre(10000, 20000), true);
            assert.equal(evento.tuPrecioEstaEntre(25000, 35000), true);
            assert.equal(evento.tuPrecioEstaEntre(1000, 12000), false);
            assert.equal(evento.precioMinimo(), 15000);

            const hoy = new Date("2026-12-10T21:00:00Z");
            assert.equal(evento.yaOcurrio(hoy), false);
            assert.equal(evento.diasParaElEvento(hoy), 10);

            const despues = new Date("2026-12-21T00:00:00Z");
            assert.equal(evento.yaOcurrio(despues), true);
            assert.equal(evento.diasParaElEvento(despues), 0);
        });
    });

    describe("Usuario", () => {
        it("debe gestionar su lista de eventos favoritos sin duplicados", () => {
            const usuario = new Usuario({ id: 1, nombre: "Juan", apellido: "Pérez" });
            const categoria = new Categoria({ id: 1, nombre: "Teatro" });
            const evento = new Evento({
                id: 50,
                nombre: "Hamlet",
                categoria,
                fecha: new Date("2026-12-15T20:00:00Z"),
                organizador: usuario
            });

            assert.equal(usuario.esFavorito(evento), false);
            usuario.agregarFavorito(evento);
            usuario.agregarFavorito(evento);
            assert.equal(usuario.favoritos.length, 1);
            assert.equal(usuario.esFavorito(evento), true);

            usuario.quitarFavorito(evento);
            assert.equal(usuario.esFavorito(evento), false);
        });
    });

    describe("Compra, CambioEstadoCompra y Mensajes", () => {
        const crearContextoCompra = () => {
            const organizador = new Usuario({ id: 1, nombre: "Productora", apellido: "Sur" });
            const comprador = new Usuario({ id: 2, nombre: "Lucía", apellido: "Martínez" });
            const tercero = new Usuario({ id: 3, nombre: "Pedro", apellido: "López" });
            const categoria = new Categoria({ id: 1, nombre: "Conferencias" });
            const tipoEntrada = new TipoEntrada({ id: 1, nombre: "General", precio: 12000, cupo: 20 });
            const evento = new Evento({
                id: 10,
                nombre: "JS Conf",
                categoria,
                fecha: new Date("2026-12-25T18:00:00Z"),
                tiposEntrada: [tipoEntrada],
                organizador
            });

            tipoEntrada.descontarCupo(3);
            const compra = new Compra({
                id: 500,
                comprador,
                evento,
                tipoEntrada,
                cantidad: 3
            });

            return { organizador, comprador, tercero, tipoEntrada, evento, compra };
        };

        it("debe calcular el total automáticamente y retornar días faltantes solo cuando está CONFIRMADA", () => {
            const { compra, comprador } = crearContextoCompra();
            const fechaRef = new Date("2026-12-20T18:00:00Z");

            assert.equal(compra.total, 36000);
            assert.equal(compra.estado, EstadoCompra.PENDIENTE);
            assert.equal(compra.diasFaltantesParaEvento(fechaRef), null);

            compra.actualizarEstado(EstadoCompra.CONFIRMADA);
            const cambio = new CambioEstadoCompra({
                id: 1,
                compra,
                estado: EstadoCompra.CONFIRMADA,
                quien: comprador,
                fechaHora: fechaRef
            });

            assert.equal(cambio.estado, EstadoCompra.CONFIRMADA);
            assert.equal(compra.diasFaltantesParaEvento(fechaRef), 5);
        });

        it("debe permitir cancelar solo si no fue UTILIZADA y el evento no ocurrió, reintegrando el cupo", () => {
            const { compra, tipoEntrada } = crearContextoCompra();
            const antesDelEvento = new Date("2026-12-20T18:00:00Z");
            const despuesDelEvento = new Date("2026-12-26T18:00:00Z");

            compra.actualizarEstado(EstadoCompra.CONFIRMADA);
            assert.equal(compra.puedeCancelarse(antesDelEvento), true);
            assert.equal(compra.puedeCancelarse(despuesDelEvento), false);

            compra.cancelar(antesDelEvento);
            assert.equal(compra.estado, EstadoCompra.REEMBOLSADA);
            assert.equal(tipoEntrada.cupo, 20);
        });

        it("no debe permitir cancelar una compra ya UTILIZADA, pero sí habilitar su reseña", () => {
            const { compra } = crearContextoCompra();
            const antesDelEvento = new Date("2026-12-20T18:00:00Z");

            assert.equal(compra.puedeSerReseniada(), false);
            compra.actualizarEstado(EstadoCompra.UTILIZADA);
            assert.equal(compra.puedeSerReseniada(), true);
            assert.equal(compra.puedeCancelarse(antesDelEvento), false);
            assert.throws(() => compra.cancelar(antesDelEvento), /No se puede cancelar la compra/);
        });

        it("debe permitir intercambiar mensajes entre comprador y organizador y rechazar a terceros", () => {
            const { compra, comprador, organizador, tercero } = crearContextoCompra();

            const msg1 = compra.agregarMensaje(comprador, "Hola, ¿a qué hora abren puertas?");
            const msg2 = compra.agregarMensaje(organizador, "Hola Lucía, a las 17:00 hs.");

            assert.equal(compra.mensajes.length, 2);
            assert.equal(msg1.mensaje, "Hola, ¿a qué hora abren puertas?");
            assert.equal(msg2.usuario, organizador);

            assert.throws(
                () => compra.agregarMensaje(tercero, "Mensaje intruso"),
                /Solo el comprador o el organizador/
            );
        });
    });

    describe("Resenia", () => {
        it("debe validar el rango de puntuación e identificar si pertenece a un organizador", () => {
            const organizador = new Usuario({ id: 1, nombre: "Marta", apellido: "Díaz" });
            const comprador = new Usuario({ id: 2, nombre: "Carlos", apellido: "Ruiz" });
            const categoria = new Categoria({ id: 1, nombre: "Stand Up" });
            const evento = new Evento({
                id: 99,
                nombre: "Noche de Comedia",
                categoria,
                fecha: new Date("2026-10-01T21:00:00Z"),
                organizador
            });

            const resenia = new Resenia({
                id: 1,
                comprador,
                evento,
                detalle: "Excelente organización y puntualidad",
                puntuacion: 4.5
            });

            assert.equal(resenia.esDelOrganizador(organizador), true);
            assert.equal(resenia.esDelOrganizador(comprador), false);
            assert.throws(
                () => new Resenia({ comprador, evento, detalle: "Mal rango", puntuacion: 6 }),
                /entre 1 y 5/
            );
        });
    });
});
