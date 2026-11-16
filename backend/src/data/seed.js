import {
    EstadoCompra,
    Categoria,
    TipoEntrada,
    Usuario,
    Evento,
    Compra,
    CambioEstadoCompra,
    Resenia
} from "../models/index.js";
import defaultRepositories from "../repositories/index.js";

export function seedDatabase(repos = defaultRepositories) {
    const {
        categoriaRepository,
        usuarioRepository,
        tipoEntradaRepository,
        eventoRepository,
        compraRepository,
        mensajeRepository,
        cambioEstadoCompraRepository,
        reseniaRepository
    } = repos;

    categoriaRepository.clear();
    usuarioRepository.clear();
    tipoEntradaRepository.clear();
    eventoRepository.clear();
    compraRepository.clear();
    mensajeRepository.clear();
    cambioEstadoCompraRepository.clear();
    reseniaRepository.clear();

    // 1. Categorías
    const catRecitales = categoriaRepository.save(
        new Categoria({ nombre: "Recitales", descripcion: "Conciertos y festivales de música en vivo" })
    );
    const catTeatro = categoriaRepository.save(
        new Categoria({ nombre: "Teatro", descripcion: "Obras teatrales, musicales y stand-up" })
    );
    const catConferencias = categoriaRepository.save(
        new Categoria({ nombre: "Conferencias", descripcion: "Charlas de tecnología, negocios y ciencia" })
    );
    const catDeportes = categoriaRepository.save(
        new Categoria({ nombre: "Deportes", descripcion: "Torneos y exhibiciones deportivas" })
    );

    // 2. Usuarios (Organizadores y Compradores)
    const orgRock = usuarioRepository.save(
        new Usuario({ nombre: "Martín", apellido: "Productor" })
    );
    const orgTech = usuarioRepository.save(
        new Usuario({ nombre: "Sofía", apellido: "Innovación" })
    );
    const compLucia = usuarioRepository.save(
        new Usuario({ nombre: "Lucía", apellido: "Gómez" })
    );
    const compMateo = usuarioRepository.save(
        new Usuario({ nombre: "Mateo", apellido: "Fernández" })
    );

    // 3. Tipos de Entrada
    const rockCampo = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Campo General", descripcion: "Acceso a campo de pie", precio: 25000, cupo: 150 })
    );
    const rockPlatea = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Platea Preferencial", descripcion: "Butaca numerada", precio: 45000, cupo: 60 })
    );
    const rockVip = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "VIP Lounge", descripcion: "Acceso exclusivo frente al escenario", precio: 80000, cupo: 20 })
    );

    const teatroGeneral = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Pullman", descripcion: "Ubicación planta alta", precio: 18000, cupo: 80 })
    );
    const teatroFila1 = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Platea Baja", descripcion: "Primeras filas", precio: 32000, cupo: 40 })
    );

    const confGeneral = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "General Pass", descripcion: "Acceso a todas las charlas", precio: 15000, cupo: 200 })
    );
    const confWorkshop = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Full Pass + Workshops", descripcion: "Incluye talleres prácticos", precio: 35000, cupo: 40 })
    );

    const pasadoGeneral = tipoEntradaRepository.save(
        new TipoEntrada({ nombre: "Entrada General", descripcion: "Acceso general", precio: 20000, cupo: 100 })
    );

    // 4. Eventos (futuros y uno pasado para reseñas)
    const ahora = Date.now();
    const unDiaMs = 1000 * 60 * 60 * 24;

    const evFestivalRock = eventoRepository.save(
        new Evento({
            nombre: "BA Rock Festival 2027",
            descripcion: "Las mejores bandas de rock nacional en una noche única al aire libre.",
            categoria: catRecitales,
            fecha: new Date(ahora + 15 * unDiaMs),
            tiposEntrada: [rockCampo, rockPlatea, rockVip],
            multimedia: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea"],
            organizador: orgRock
        })
    );

    const evTeatro = eventoRepository.save(
        new Evento({
            nombre: "Noche de Stand Up & Comedia",
            descripcion: "Espectáculo de humor en vivo en calle Corrientes.",
            categoria: catTeatro,
            fecha: new Date(ahora + 7 * unDiaMs),
            tiposEntrada: [teatroGeneral, teatroFila1],
            multimedia: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"],
            organizador: orgRock
        })
    );

    const evConferenciaIA = eventoRepository.save(
        new Evento({
            nombre: "AI & Software Summit",
            descripcion: "Conferencia sobre desarrollo de software asistido por Inteligencia Artificial.",
            categoria: catConferencias,
            fecha: new Date(ahora + 30 * unDiaMs),
            tiposEntrada: [confGeneral, confWorkshop],
            multimedia: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87"],
            organizador: orgTech
        })
    );

    const evAcusticoPasado = eventoRepository.save(
        new Evento({
            nombre: "Acústico Íntimo de Invierno",
            descripcion: "Show acústico exclusivo a sala llena.",
            categoria: catRecitales,
            fecha: new Date(ahora - 20 * unDiaMs),
            tiposEntrada: [pasadoGeneral],
            multimedia: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"],
            organizador: orgRock
        })
    );

    // Favoritos de prueba
    compLucia.agregarFavorito(evFestivalRock);
    compLucia.agregarFavorito(evConferenciaIA);

    // 5. Compras, Cambios de Estado y Mensajes
    // Compra 1: CONFIRMADA (para evento futuro BA Rock Festival)
    rockCampo.descontarCupo(2);
    const compraConfirmada = compraRepository.save(
        new Compra({
            comprador: compLucia,
            evento: evFestivalRock,
            tipoEntrada: rockCampo,
            cantidad: 2,
            estado: EstadoCompra.CONFIRMADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraConfirmada,
            estado: EstadoCompra.PENDIENTE,
            quien: compLucia,
            fechaHora: new Date(ahora - 2 * unDiaMs)
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraConfirmada,
            estado: EstadoCompra.CONFIRMADA,
            quien: orgRock,
            fechaHora: new Date(ahora - 1 * unDiaMs)
        })
    );

    const msgPregunta = compraConfirmada.agregarMensaje(
        compLucia,
        "Hola, ¿a qué hora se habilita el ingreso a Campo General?",
        new Date(ahora - 12 * 3600 * 1000)
    );
    const msgRespuesta = compraConfirmada.agregarMensaje(
        orgRock,
        "¡Hola Lucía! Las puertas abren a las 18:00 hs por Av. Libertador.",
        new Date(ahora - 10 * 3600 * 1000)
    );
    mensajeRepository.save(msgPregunta);
    mensajeRepository.save(msgRespuesta);

    // Compra 2: PENDIENTE (para Conferencia IA)
    confWorkshop.descontarCupo(1);
    const compraPendiente = compraRepository.save(
        new Compra({
            comprador: compMateo,
            evento: evConferenciaIA,
            tipoEntrada: confWorkshop,
            cantidad: 1,
            estado: EstadoCompra.PENDIENTE
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraPendiente,
            estado: EstadoCompra.PENDIENTE,
            quien: compMateo,
            fechaHora: new Date(ahora - 3 * 3600 * 1000)
        })
    );

    // Compra 3: UTILIZADA (del evento pasado, con Reseña)
    pasadoGeneral.descontarCupo(2);
    const compraUtilizada = compraRepository.save(
        new Compra({
            comprador: compLucia,
            evento: evAcusticoPasado,
            tipoEntrada: pasadoGeneral,
            cantidad: 2,
            estado: EstadoCompra.UTILIZADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraUtilizada,
            estado: EstadoCompra.UTILIZADA,
            quien: orgRock,
            fechaHora: new Date(ahora - 20 * unDiaMs)
        })
    );

    // 6. Reseñas
    const resenia1 = reseniaRepository.save(
        new Resenia({
            comprador: compLucia,
            evento: evAcusticoPasado,
            detalle: "Excelente sonido y organización impecable. Súper puntual.",
            puntuacion: 5
        })
    );
    const resenia2 = reseniaRepository.save(
        new Resenia({
            comprador: compMateo,
            evento: evAcusticoPasado,
            detalle: "Muy buen show, el ingreso fue súper rápido.",
            puntuacion: 4
        })
    );

    return {
        categorias: [catRecitales, catTeatro, catConferencias, catDeportes],
        usuarios: [orgRock, orgTech, compLucia, compMateo],
        eventos: [evFestivalRock, evTeatro, evConferenciaIA, evAcusticoPasado],
        compras: [compraConfirmada, compraPendiente, compraUtilizada],
        resenias: [resenia1, resenia2]
    };
}

export default seedDatabase;
