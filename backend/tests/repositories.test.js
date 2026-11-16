import { describe, it, beforeEach } from "node:test";
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
import {
    CategoriaRepository,
    UsuarioRepository,
    TipoEntradaRepository,
    EventoRepository,
    CompraRepository,
    MensajeRepository,
    CambioEstadoCompraRepository,
    ReseniaRepository,
    repositories
} from "../src/repositories/index.js";
import { seedDatabase } from "../src/data/seed.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("Capa de Repositorios en Memoria - AI Ticket It", () => {
    let catRepo;
    let userRepo;
    let tipoRepo;
    let evRepo;
    let compraRepo;
    let msgRepo;
    let cambioRepo;
    let reseniaRepo;

    beforeEach(() => {
        catRepo = new CategoriaRepository();
        userRepo = new UsuarioRepository();
        tipoRepo = new TipoEntradaRepository();
        evRepo = new EventoRepository();
        compraRepo = new CompraRepository();
        msgRepo = new MensajeRepository();
        cambioRepo = new CambioEstadoCompraRepository();
        reseniaRepo = new ReseniaRepository();
    });

    it("debe asignar UUID al guardar entidades nuevas, actualizar existentes y eliminar por ID", () => {
        const cat = catRepo.save(new Categoria({ nombre: "Recitales", descripcion: "Música" }));
        assert.match(cat.id, UUID_REGEX);
        assert.equal(catRepo.findAll().length, 1);
        assert.equal(catRepo.findById(cat.id), cat);
        assert.equal(catRepo.findByNombre("recitales"), cat);

        cat.descripcion = "Música en vivo actualizada";
        catRepo.save(cat);
        assert.equal(catRepo.findAll().length, 1);
        assert.equal(catRepo.findById(cat.id).descripcion, "Música en vivo actualizada");

        assert.equal(catRepo.deleteById(cat.id), true);
        assert.equal(catRepo.findAll().length, 0);
        assert.equal(catRepo.deleteById("id-inexistente"), false);
    });

    it("debe filtrar eventos por texto, categoría, organizador y rango de precios en EventoRepository", () => {
        const catMusica = catRepo.save(new Categoria({ nombre: "Música" }));
        const catTeatro = catRepo.save(new Categoria({ nombre: "Teatro" }));
        const org1 = userRepo.save(new Usuario({ nombre: "Ana", apellido: "Productora" }));
        const org2 = userRepo.save(new Usuario({ nombre: "Luis", apellido: "Director" }));

        const tBarata = tipoRepo.save(new TipoEntrada({ nombre: "General", precio: 10000, cupo: 50 }));
        const tCara = tipoRepo.save(new TipoEntrada({ nombre: "VIP", precio: 50000, cupo: 10 }));

        const ev1 = evRepo.save(
            new Evento({
                nombre: "Festival Indie",
                descripcion: "Bandas emergentes",
                categoria: catMusica,
                fecha: new Date("2026-12-20T20:00:00Z"),
                tiposEntrada: [tBarata],
                organizador: org1
            })
        );
        const ev2 = evRepo.save(
            new Evento({
                nombre: "Obra Clásica",
                descripcion: "Drama en tres actos",
                categoria: catTeatro,
                fecha: new Date("2026-12-22T21:00:00Z"),
                tiposEntrada: [tCara],
                organizador: org2
            })
        );

        assert.equal(evRepo.findByOrganizadorId(org1.id).length, 1);
        assert.equal(evRepo.findByCategoriaId(catTeatro.id)[0].id, ev2.id);

        const porTexto = evRepo.buscar({ texto: "indie" });
        assert.equal(porTexto.length, 1);
        assert.equal(porTexto[0].id, ev1.id);

        const porPrecio = evRepo.buscar({ precioMin: 40000, precioMax: 60000 });
        assert.equal(porPrecio.length, 1);
        assert.equal(porPrecio[0].id, ev2.id);
    });

    it("debe gestionar Compras, CambiosEstadoCompra y Mensajes con UUIDs y consultas relacionales", () => {
        const cat = catRepo.save(new Categoria({ nombre: "Tech" }));
        const org = userRepo.save(new Usuario({ nombre: "Org", apellido: "Uno" }));
        const comp = userRepo.save(new Usuario({ nombre: "Comp", apellido: "Dos" }));
        const tipo = tipoRepo.save(new TipoEntrada({ nombre: "General", precio: 15000, cupo: 30 }));
        const ev = evRepo.save(
            new Evento({
                nombre: "NodeJS Conf",
                categoria: cat,
                fecha: new Date("2026-12-30T18:00:00Z"),
                tiposEntrada: [tipo],
                organizador: org
            })
        );

        const compra = compraRepo.save(
            new Compra({
                comprador: comp,
                evento: ev,
                tipoEntrada: tipo,
                cantidad: 2
            })
        );
        assert.match(compra.id, UUID_REGEX);
        assert.equal(compraRepo.findByCompradorId(comp.id).length, 1);
        assert.equal(compraRepo.findByEventoId(ev.id).length, 1);

        const c1 = cambioRepo.save(
            new CambioEstadoCompra({
                compra,
                estado: EstadoCompra.PENDIENTE,
                quien: comp,
                fechaHora: new Date("2026-12-01T10:00:00Z")
            })
        );
        const c2 = cambioRepo.save(
            new CambioEstadoCompra({
                compra,
                estado: EstadoCompra.CONFIRMADA,
                quien: org,
                fechaHora: new Date("2026-12-01T12:00:00Z")
            })
        );
        assert.match(c1.id, UUID_REGEX);
        assert.match(c2.id, UUID_REGEX);
        assert.equal(cambioRepo.findByCompraId(compra.id).length, 2);

        const msg = msgRepo.save(new Mensaje({ usuario: comp, mensaje: "Consulta sobre estacionamiento" }));
        assert.match(msg.id, UUID_REGEX);
        assert.equal(msgRepo.findByUsuarioId(comp.id).length, 1);
    });

    it("debe consultar reseñas por evento y por organizador en ReseniaRepository", () => {
        const cat = catRepo.save(new Categoria({ nombre: "Stand Up" }));
        const org = userRepo.save(new Usuario({ nombre: "Sofía", apellido: "Prod" }));
        const comp1 = userRepo.save(new Usuario({ nombre: "Juan", apellido: "A" }));
        const comp2 = userRepo.save(new Usuario({ nombre: "María", apellido: "B" }));
        const ev = evRepo.save(
            new Evento({
                nombre: "Show de Humor",
                categoria: cat,
                fecha: new Date("2026-10-10T21:00:00Z"),
                organizador: org
            })
        );

        reseniaRepo.save(new Resenia({ comprador: comp1, evento: ev, detalle: "Muy bueno", puntuacion: 4 }));
        reseniaRepo.save(new Resenia({ comprador: comp2, evento: ev, detalle: "Excelente", puntuacion: 5 }));

        assert.equal(reseniaRepo.findByEventoId(ev.id).length, 2);
        assert.equal(reseniaRepo.findByOrganizadorId(org.id).length, 2);
    });

    it("debe poblar todos los repositorios correctamente mediante seedDatabase()", () => {
        const resultado = seedDatabase(repositories);

        assert.equal(repositories.categoriaRepository.findAll().length, 4);
        assert.equal(repositories.usuarioRepository.findAll().length, 4);
        assert.equal(repositories.tipoEntradaRepository.findAll().length, 8);
        assert.equal(repositories.eventoRepository.findAll().length, 4);
        assert.equal(repositories.compraRepository.findAll().length, 3);
        assert.equal(repositories.mensajeRepository.findAll().length, 2);
        assert.equal(repositories.cambioEstadoCompraRepository.findAll().length, 4);
        assert.equal(repositories.reseniaRepository.findAll().length, 2);
        assert.equal(resultado.eventos.length, 4);
    });
});
