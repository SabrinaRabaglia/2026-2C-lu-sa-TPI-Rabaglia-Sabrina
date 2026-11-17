import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { seedDatabase } from "../src/data/seed.js";
import { repositories } from "../src/repositories/index.js";

describe("API REST (Controllers y Routers) - AI Ticket It", () => {
    let server;
    let baseUrl;
    let seedData;

    before((_, done) => {
        server = app.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            baseUrl = `http://127.0.0.1:${port}/api`;
            done();
        });
    });

    after((_, done) => {
        server.close(done);
    });

    beforeEach(() => {
        seedData = seedDatabase(repositories);
    });

    it("GET /api/categorias y POST /api/categorias deben listar y crear categorías", async () => {
        const resList = await fetch(`${baseUrl}/categorias`);
        assert.equal(resList.status, 200);
        const categorias = await resList.json();
        assert.equal(categorias.length, 4);

        const resCreate = await fetch(`${baseUrl}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: "Danza", descripcion: "Espectáculos de danza" })
        });
        assert.equal(resCreate.status, 201);
        const creada = await resCreate.json();
        assert.equal(creada.nombre, "Danza");
    });

    it("GET /api/eventos y POST /api/eventos deben filtrar/ordenar y publicar eventos", async () => {
        const resSearch = await fetch(`${baseUrl}/eventos?texto=rock&ordenarPor=precio&direccion=asc`);
        assert.equal(resSearch.status, 200);
        const eventos = await resSearch.json();
        assert.equal(eventos.length, 1);
        assert.equal(eventos[0].nombre, "BA Rock Festival 2027");

        const [catRecitales, catTeatro, catConferencias] = seedData.categorias;
        const [orgRock] = seedData.usuarios;

        // Filtro por múltiples categorías + paginación
        const resMultiCatPage = await fetch(
            `${baseUrl}/eventos?categoriaIds=${catRecitales.id},${catTeatro.id}&page=1&limit=2`
        );
        assert.equal(resMultiCatPage.status, 200);
        const paginado = await resMultiCatPage.json();
        assert.equal(paginado.items.length, 2);
        assert.equal(paginado.pagination.total, 3);
        assert.equal(paginado.pagination.totalPages, 2);
        assert.equal(paginado.pagination.hasNextPage, true);

        const resPost = await fetch(`${baseUrl}/eventos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: "Jazz bajo las Estrellas",
                descripcion: "Noche de jazz",
                categoriaId: catRecitales.id,
                fecha: "2027-03-15T21:00:00Z",
                tiposEntrada: [{ nombre: "General", precio: 22000, cupo: 60 }],
                multimedia: [],
                organizadorId: orgRock.id
            })
        });
        assert.equal(resPost.status, 201);
        const nuevoEv = await resPost.json();
        assert.equal(nuevoEv.precioMinimo, 22000);
    });

    it("POST /api/compras, POST /api/compras/:id/mensajes y DELETE /api/compras/:id deben gestionar el ciclo REST de una compra", async () => {
        const [, , compLucia] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;
        const tipoCampo = evFestivalRock.tiposEntrada[0];

        const resCompra = await fetch(`${baseUrl}/compras`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                compradorId: compLucia.id,
                eventoId: evFestivalRock.id,
                tipoEntradaId: tipoCampo.id,
                cantidad: 2
            })
        });
        assert.equal(resCompra.status, 201);
        const compra = await resCompra.json();
        assert.equal(compra.estado, "CONFIRMADA");

        const resMsg = await fetch(`${baseUrl}/compras/${compra.id}/mensajes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuarioId: compLucia.id,
                mensaje: "¿Hay estacionamiento en el predio?"
            })
        });
        assert.equal(resMsg.status, 201);

        const resGetMsgs = await fetch(`${baseUrl}/compras/${compra.id}/mensajes`);
        assert.equal(resGetMsgs.status, 200);
        const mensajes = await resGetMsgs.json();
        assert.equal(mensajes.length, 1);

        const resDelete = await fetch(`${baseUrl}/compras/${compra.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId: compLucia.id })
        });
        assert.equal(resDelete.status, 200);
        const cancelada = await resDelete.json();
        assert.equal(cancelada.estado, "REEMBOLSADA");
    });

    it("POST /api/resenias y GET /api/resenias deben crear y consultar reseñas", async () => {
        const [orgRock, , compLucia] = seedData.usuarios;
        const [, , compraUtilizada] = seedData.compras;

        const resPost = await fetch(`${baseUrl}/resenias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                compraId: compraUtilizada.id,
                compradorId: compLucia.id,
                puntuacion: 5,
                detalle: "Inolvidable"
            })
        });
        assert.equal(resPost.status, 201);

        const resGetOrg = await fetch(`${baseUrl}/resenias?organizadorId=${orgRock.id}`);
        assert.equal(resGetOrg.status, 200);
        const dataOrg = await resGetOrg.json();
        assert.equal(dataOrg.totalResenias, 3);

        const resRep = await fetch(`${baseUrl}/usuarios/${orgRock.id}/reputacion`);
        assert.equal(resRep.status, 200);
        const repData = await resRep.json();
        assert.equal(repData.totalResenias, 3);
    });

    it("GET /api/eventos/:eventoId/compras debe devolver el resumen de ventas y cupos para el organizador", async () => {
        const [orgRock] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;

        const resVentas = await fetch(
            `${baseUrl}/eventos/${evFestivalRock.id}/compras?organizadorId=${orgRock.id}`
        );
        assert.equal(resVentas.status, 200);
        const bodyVentas = await resVentas.json();
        assert.equal(bodyVentas.eventoId, evFestivalRock.id);
        assert.equal(bodyVentas.disponibilidadEntradas.length, 3);
    });

    it("POST y DELETE /api/usuarios/:id/favoritos deben gestionar favoritos de forma RESTful", async () => {
        const [, , , compMateo] = seedData.usuarios;
        const [evFestivalRock] = seedData.eventos;

        const resAdd = await fetch(`${baseUrl}/usuarios/${compMateo.id}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventoId: evFestivalRock.id })
        });
        assert.equal(resAdd.status, 201);

        const resDel = await fetch(
            `${baseUrl}/usuarios/${compMateo.id}/favoritos/${evFestivalRock.id}`,
            { method: "DELETE" }
        );
        assert.equal(resDel.status, 200);
        const usuarioActualizado = await resDel.json();
        assert.equal(usuarioActualizado.favoritos.length, 0);
    });

    it("Middleware de validación y errorHandler: deben atrapar errores de entrada (400), no encontrados (404) y conflictos de dominio (409)", async () => {
        // 1. Validación temprana de request (Zod -> RequestValidationError -> 400)
        const resBadInput = await fetch(`${baseUrl}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        assert.equal(resBadInput.status, 400);
        const badBody = await resBadInput.json();
        assert.equal(badBody.tipo, "RequestValidationError");

        // 2. Entidad no encontrada (ServiceError -> EntidadNoEncontradaError -> 404)
        const resNotFound = await fetch(`${baseUrl}/eventos/id-inexistente`);
        assert.equal(resNotFound.status, 404);
        const notFoundBody = await resNotFound.json();
        assert.equal(notFoundBody.tipo, "EntidadNoEncontradaError");

        // 3. Regla de dominio: reseñar compra no utilizada (DomainError -> CompraNoReseniableError -> 409)
        const [, , compLucia] = seedData.usuarios;
        const [compraConfirmada] = seedData.compras;
        const resDomainErr = await fetch(`${baseUrl}/resenias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                compraId: compraConfirmada.id,
                compradorId: compLucia.id,
                puntuacion: 5,
                detalle: "Aún no utilizada"
            })
        });
        assert.equal(resDomainErr.status, 409);
        const domainErrBody = await resDomainErr.json();
        assert.equal(domainErrBody.tipo, "CompraNoReseniableError");
    });

    it("GET /api-docs.json y GET /api-docs/ deben servir la documentación OpenAPI/Swagger", async () => {
        const rootUrl = baseUrl.replace(/\/api$/, "");

        const resSpec = await fetch(`${rootUrl}/api-docs.json`);
        assert.equal(resSpec.status, 200);
        const spec = await resSpec.json();
        assert.equal(spec.openapi, "3.0.3");
        assert.equal(spec.info.title, "AI Ticket It - API REST");
        assert.ok(spec.paths["/api/eventos"]);
        assert.ok(spec.paths["/api/compras"]);

        const resUi = await fetch(`${rootUrl}/api-docs/`);
        assert.equal(resUi.status, 200);
        const html = await resUi.text();
        assert.ok(html.includes("swagger-ui"));
    });
});
