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

export const SEED_IDS = Object.freeze({
    categorias: {
        recitales: "11111111-1111-4111-8111-111111111101",
        teatro: "11111111-1111-4111-8111-111111111102",
        conferencias: "11111111-1111-4111-8111-111111111103",
        deportes: "11111111-1111-4111-8111-111111111104",
        festivales: "11111111-1111-4111-8111-111111111105",
        gastronomia: "11111111-1111-4111-8111-111111111106"
    },
    usuarios: {
        orgRock: "22222222-2222-4222-8222-222222222201",
        orgTech: "22222222-2222-4222-8222-222222222202",
        compLucia: "22222222-2222-4222-8222-222222222203",
        compMateo: "22222222-2222-4222-8222-222222222204",
        orgDeportes: "22222222-2222-4222-8222-222222222205",
        compValentina: "22222222-2222-4222-8222-222222222206",
        compNicolas: "22222222-2222-4222-8222-222222222207"
    },
    tiposEntrada: {
        rockCampo: "33333333-3333-4333-8333-333333333301",
        rockPlatea: "33333333-3333-4333-8333-333333333302",
        rockVip: "33333333-3333-4333-8333-333333333303",
        teatroGeneral: "33333333-3333-4333-8333-333333333304",
        teatroFila1: "33333333-3333-4333-8333-333333333305",
        confGeneral: "33333333-3333-4333-8333-333333333306",
        confWorkshop: "33333333-3333-4333-8333-333333333307",
        pasadoGeneral: "33333333-3333-4333-8333-333333333308",
        tenisTribuna: "33333333-3333-4333-8333-333333333309",
        tenisPalco: "33333333-3333-4333-8333-333333333310",
        jazzMesa: "33333333-3333-4333-8333-333333333311",
        jazzBarra: "33333333-3333-4333-8333-333333333312",
        electroEarly: "33333333-3333-4333-8333-333333333313",
        electroVip: "33333333-3333-4333-8333-333333333314",
        hamletPlatea: "33333333-3333-4333-8333-333333333315",
        hamletPalco: "33333333-3333-4333-8333-333333333316",
        feriaDia: "33333333-3333-4333-8333-333333333317",
        feriaDegustacion: "33333333-3333-4333-8333-333333333318",
        basquetPopularAgotada: "33333333-3333-4333-8333-333333333319",
        cloudGeneral: "33333333-3333-4333-8333-333333333320",
        maratonGeneral: "33333333-3333-4333-8333-333333333321"
    },
    eventos: {
        festivalRock: "44444444-4444-4444-8444-444444444401",
        teatroStandUp: "44444444-4444-4444-8444-444444444402",
        conferenciaIA: "44444444-4444-4444-8444-444444444403",
        acusticoPasado: "44444444-4444-4444-8444-444444444404",
        copaTenis: "44444444-4444-4444-8444-444444444405",
        jazzSanTelmo: "44444444-4444-4444-8444-444444444406",
        sunsetElectro: "44444444-4444-4444-8444-444444444407",
        hamletGala: "44444444-4444-4444-8444-444444444408",
        feriaSabores: "44444444-4444-4444-8444-444444444409",
        finalBasquetAgotado: "44444444-4444-4444-8444-444444444410",
        cloudLatam: "44444444-4444-4444-8444-444444444411",
        maratonPasada: "44444444-4444-4444-8444-444444444412"
    },
    compras: {
        confirmada: "55555555-5555-4555-8555-555555555501",
        pendiente: "55555555-5555-4555-8555-555555555502",
        utilizada: "55555555-5555-4555-8555-555555555503",
        luciaPendienteJazz: "55555555-5555-4555-8555-555555555504",
        luciaConfirmadaManiana: "55555555-5555-4555-8555-555555555505",
        luciaReembolsadaHamlet: "55555555-5555-4555-8555-555555555506",
        luciaCanceladaElectro: "55555555-5555-4555-8555-555555555507",
        valentinaConfirmadaRock: "55555555-5555-4555-8555-555555555508",
        luciaUtilizadaMaraton: "55555555-5555-4555-8555-555555555509",
        mateoUtilizadaMaraton: "55555555-5555-4555-8555-555555555510",
        valentinaUtilizadaAcustico: "55555555-5555-4555-8555-555555555511"
    },
    resenias: {
        resenia1: "66666666-6666-4666-8666-666666666601",
        resenia2: "66666666-6666-4666-8666-666666666602",
        resenia3: "66666666-6666-4666-8666-666666666603",
        resenia4: "66666666-6666-4666-8666-666666666604"
    }
});

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

    // 1. Categorías (6 categorías)
    const catRecitales = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.recitales,
            nombre: "Recitales",
            descripcion: "Conciertos y shows de música en vivo"
        })
    );
    const catTeatro = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.teatro,
            nombre: "Teatro",
            descripcion: "Obras teatrales, musicales y stand-up"
        })
    );
    const catConferencias = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.conferencias,
            nombre: "Conferencias",
            descripcion: "Charlas de tecnología, negocios y ciencia"
        })
    );
    const catDeportes = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.deportes,
            nombre: "Deportes",
            descripcion: "Torneos, finales y exhibiciones deportivas"
        })
    );
    const catFestivales = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.festivales,
            nombre: "Festivales",
            descripcion: "Jornadas al aire libre con múltiples escenarios"
        })
    );
    const catGastronomia = categoriaRepository.save(
        new Categoria({
            id: SEED_IDS.categorias.gastronomia,
            nombre: "Gastronomía",
            descripcion: "Ferias culinarias, catas y experiencias gourmet"
        })
    );

    // 2. Usuarios (3 Organizadores y 4 Compradores)
    const orgRock = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.orgRock,
            nombre: "Martín",
            apellido: "Productor",
            email: "martin@ticketit.com",
            password: "123456",
            rol: "ORGANIZADOR"
        })
    );
    const orgTech = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.orgTech,
            nombre: "Sofía",
            apellido: "Innovación",
            email: "sofia@ticketit.com",
            password: "123456",
            rol: "ORGANIZADOR"
        })
    );
    const compLucia = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.compLucia,
            nombre: "Lucía",
            apellido: "Gómez",
            email: "lucia@ticketit.com",
            password: "123456",
            rol: "COMPRADOR"
        })
    );
    const compMateo = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.compMateo,
            nombre: "Mateo",
            apellido: "Fernández",
            email: "mateo@ticketit.com",
            password: "123456",
            rol: "COMPRADOR"
        })
    );
    const orgDeportes = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.orgDeportes,
            nombre: "Diego",
            apellido: "Deportes",
            email: "diego@ticketit.com",
            password: "123456",
            rol: "ORGANIZADOR"
        })
    );
    const compValentina = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.compValentina,
            nombre: "Valentina",
            apellido: "Rossi",
            email: "valentina@ticketit.com",
            password: "123456",
            rol: "COMPRADOR"
        })
    );
    const compNicolas = usuarioRepository.save(
        new Usuario({
            id: SEED_IDS.usuarios.compNicolas,
            nombre: "Nicolás",
            apellido: "Silva",
            email: "nicolas@ticketit.com",
            password: "123456",
            rol: "COMPRADOR"
        })
    );

    // 3. Tipos de Entrada (21 tipos)
    const rockCampo = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.rockCampo,
            nombre: "Campo General",
            descripcion: "Acceso a campo de pie",
            precio: 25000,
            cupo: 150
        })
    );
    const rockPlatea = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.rockPlatea,
            nombre: "Platea Preferencial",
            descripcion: "Butaca numerada",
            precio: 45000,
            cupo: 60
        })
    );
    const rockVip = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.rockVip,
            nombre: "VIP Lounge",
            descripcion: "Acceso exclusivo frente al escenario",
            precio: 80000,
            cupo: 20
        })
    );

    const teatroGeneral = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.teatroGeneral,
            nombre: "Pullman",
            descripcion: "Ubicación planta alta",
            precio: 18000,
            cupo: 80
        })
    );
    const teatroFila1 = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.teatroFila1,
            nombre: "Platea Baja",
            descripcion: "Primeras filas",
            precio: 32000,
            cupo: 40
        })
    );

    const confGeneral = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.confGeneral,
            nombre: "General Pass",
            descripcion: "Acceso a todas las charlas",
            precio: 15000,
            cupo: 200
        })
    );
    const confWorkshop = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.confWorkshop,
            nombre: "Full Pass + Workshops",
            descripcion: "Incluye talleres prácticos",
            precio: 35000,
            cupo: 40
        })
    );

    const pasadoGeneral = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.pasadoGeneral,
            nombre: "Entrada General",
            descripcion: "Acceso general",
            precio: 20000,
            cupo: 100
        })
    );

    const tenisTribuna = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.tenisTribuna,
            nombre: "Tribuna Lateral",
            descripcion: "Vista panorámica de cancha central",
            precio: 22000,
            cupo: 120
        })
    );
    const tenisPalco = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.tenisPalco,
            nombre: "Palco Court-Side",
            descripcion: "Primera bandeja a nivel de cancha",
            precio: 55000,
            cupo: 25
        })
    );

    const jazzMesa = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.jazzMesa,
            nombre: "Mesa para 2 + Copa de Vino",
            descripcion: "Ubicación frente al cuarteto con degustación",
            precio: 28000,
            cupo: 30
        })
    );
    const jazzBarra = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.jazzBarra,
            nombre: "Acceso Barra",
            descripcion: "Ubicación libre en sector barra",
            precio: 16000,
            cupo: 45
        })
    );

    const electroEarly = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.electroEarly,
            nombre: "General Sunset",
            descripcion: "Ingreso desde las 16:00 hs",
            precio: 30000,
            cupo: 250
        })
    );
    const electroVip = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.electroVip,
            nombre: "Backstage Deck",
            descripcion: "Tarima elevada junto al DJ booth",
            precio: 70000,
            cupo: 35
        })
    );

    const hamletPlatea = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.hamletPlatea,
            nombre: "Platea Central",
            descripcion: "Visibilidad perfecta del escenario",
            precio: 24000,
            cupo: 90
        })
    );
    const hamletPalco = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.hamletPalco,
            nombre: "Palco Avant-Scène",
            descripcion: "Palco privado para 4 personas",
            precio: 60000,
            cupo: 12
        })
    );

    const feriaDia = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.feriaDia,
            nombre: "Pase Diario",
            descripcion: "Acceso a todos los stands y clases de cocina",
            precio: 10000,
            cupo: 300
        })
    );
    const feriaDegustacion = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.feriaDegustacion,
            nombre: "Pase Gourmet + 5 Platos",
            descripcion: "Incluye 5 tickets de degustación y bebida",
            precio: 34000,
            cupo: 80
        })
    );

    const basquetPopularAgotada = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.basquetPopularAgotada,
            nombre: "Popular Cabecera",
            descripcion: "Bandeja general (cupo agotado)",
            precio: 14000,
            cupo: 1
        })
    );

    const cloudGeneral = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.cloudGeneral,
            nombre: "Pase Conferencia",
            descripcion: "Acceso a keynotes y feria de sponsors",
            precio: 19000,
            cupo: 180
        })
    );

    const maratonGeneral = tipoEntradaRepository.save(
        new TipoEntrada({
            id: SEED_IDS.tiposEntrada.maratonGeneral,
            nombre: "Kit Corredor 10K",
            descripcion: "Incluye remera oficial, chip y medalla finisher",
            precio: 17000,
            cupo: 150
        })
    );

    // 4. Eventos (12 eventos -> 3 páginas completas de 4 eventos en Explorar)
    const ahora = Date.now();
    const unDiaMs = 1000 * 60 * 60 * 24;

    const evFestivalRock = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.festivalRock,
            nombre: "BA Rock Festival 2027",
            descripcion: "Las mejores bandas de rock nacional en una noche única al aire libre.",
            categoria: catRecitales,
            fecha: new Date(ahora + 15 * unDiaMs),
            tiposEntrada: [rockCampo, rockPlatea, rockVip],
            multimedia: [
                "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=640&q=70&fm=webp",
                "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=640&q=70&fm=webp"
            ],
            organizador: orgRock
        })
    );

    const evTeatro = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.teatroStandUp,
            nombre: "Noche de Stand Up & Comedia",
            descripcion: "Espectáculo de humor en vivo con comediantes invitados en calle Corrientes.",
            categoria: catTeatro,
            fecha: new Date(ahora + 7 * unDiaMs),
            tiposEntrada: [teatroGeneral, teatroFila1],
            multimedia: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgRock
        })
    );

    const evConferenciaIA = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.conferenciaIA,
            nombre: "AI & Software Summit",
            descripcion: "Conferencia sobre desarrollo de software asistido por Inteligencia Artificial.",
            categoria: catConferencias,
            fecha: new Date(ahora + 30 * unDiaMs),
            tiposEntrada: [confGeneral, confWorkshop],
            multimedia: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgTech
        })
    );

    const evAcusticoPasado = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.acusticoPasado,
            nombre: "Acústico Íntimo de Invierno",
            descripcion: "Show acústico exclusivo a sala llena.",
            categoria: catRecitales,
            fecha: new Date(ahora - 20 * unDiaMs),
            tiposEntrada: [pasadoGeneral],
            multimedia: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgRock
        })
    );

    const evCopaTenis = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.copaTenis,
            nombre: "Copa Buenos Aires de Tenis",
            descripcion: "Semifinales y final de exhibición con figuras internacionales sobre polvo de ladrillo.",
            categoria: catDeportes,
            fecha: new Date(ahora + 10 * unDiaMs),
            tiposEntrada: [tenisTribuna, tenisPalco],
            multimedia: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgDeportes
        })
    );

    const evJazzSanTelmo = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.jazzSanTelmo,
            nombre: "Noche de Jazz & Vino en San Telmo",
            descripcion: "Cuarteto de jazz clásico en club histórico acompañado por degustación de malbec.",
            categoria: catRecitales,
            fecha: new Date(ahora + 5 * unDiaMs),
            tiposEntrada: [jazzBarra, jazzMesa],
            multimedia: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgRock
        })
    );

    const evSunsetElectro = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.sunsetElectro,
            nombre: "Sunset Electronic Fest",
            descripcion: "Festival de música electrónica al atardecer frente al río con DJs nacionales e internacionales.",
            categoria: catFestivales,
            fecha: new Date(ahora + 22 * unDiaMs),
            tiposEntrada: [electroEarly, electroVip],
            multimedia: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgTech
        })
    );

    const evHamlet = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.hamletGala,
            nombre: "Hamlet - Temporada de Gala",
            descripcion: "Puesta contemporánea del clásico de Shakespeare con orquesta en vivo.",
            categoria: catTeatro,
            fecha: new Date(ahora + 18 * unDiaMs),
            tiposEntrada: [hamletPlatea, hamletPalco],
            multimedia: ["https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgRock
        })
    );

    const evFeriaSabores = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.feriaSabores,
            nombre: "Feria Sabores del Mundo",
            descripcion: "Más de 40 food trucks, cocina de autor en vivo y patio cervecero al aire libre.",
            categoria: catGastronomia,
            fecha: new Date(ahora + 12 * unDiaMs),
            tiposEntrada: [feriaDia, feriaDegustacion],
            multimedia: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgTech
        })
    );

    const evFinalBasquetAgotado = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.finalBasquetAgotado,
            nombre: "Final Liga Metropolitana de Básquet",
            descripcion: "Partido definitorio por el campeonato metropolitano a estadio lleno.",
            categoria: catDeportes,
            fecha: new Date(ahora + 1 * unDiaMs),
            tiposEntrada: [basquetPopularAgotada],
            multimedia: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgDeportes
        })
    );

    const evCloudLatam = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.cloudLatam,
            nombre: "Cloud & DevOps Latam",
            descripcion: "Encuentro regional sobre arquitectura distribuida, Kubernetes, observabilidad y seguridad cloud.",
            categoria: catConferencias,
            fecha: new Date(ahora + 45 * unDiaMs),
            tiposEntrada: [cloudGeneral],
            multimedia: ["https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgTech
        })
    );

    const evMaratonPasada = eventoRepository.save(
        new Evento({
            id: SEED_IDS.eventos.maratonPasada,
            nombre: "Maratón Nocturna Puerto Madero 10K",
            descripcion: "Circuito certificado de 10 kilómetros con largada nocturna y show de luces.",
            categoria: catDeportes,
            fecha: new Date(ahora - 10 * unDiaMs),
            tiposEntrada: [maratonGeneral],
            multimedia: ["https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=640&q=70&fm=webp"],
            organizador: orgDeportes
        })
    );

    // Favoritos de prueba
    compLucia.agregarFavorito(evFestivalRock);
    compLucia.agregarFavorito(evConferenciaIA);
    compLucia.agregarFavorito(evJazzSanTelmo);
    compValentina.agregarFavorito(evSunsetElectro);

    // 5. Compras, Cambios de Estado y Mensajes (8 compras cubriendo los 5 estados)
    // Compra 1: CONFIRMADA (Lucía -> BA Rock Festival)
    rockCampo.descontarCupo(2);
    const compraConfirmada = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.confirmada,
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

    // Compra 2: PENDIENTE (Mateo -> Conferencia IA)
    confWorkshop.descontarCupo(1);
    const compraPendiente = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.pendiente,
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

    // Compra 3: UTILIZADA (Lucía -> Acústico Pasado, apta para reseñar en vivo)
    pasadoGeneral.descontarCupo(2);
    const compraUtilizada = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.utilizada,
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

    // Compra 4: PENDIENTE de Lucía (Noche de Jazz -> lista para tocar "Pagar ahora" en Mis Compras)
    jazzMesa.descontarCupo(1);
    const compraLuciaPendiente = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.luciaPendienteJazz,
            comprador: compLucia,
            evento: evJazzSanTelmo,
            tipoEntrada: jazzMesa,
            cantidad: 1,
            estado: EstadoCompra.PENDIENTE
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaPendiente,
            estado: EstadoCompra.PENDIENTE,
            quien: compLucia,
            fechaHora: new Date(ahora - 2 * 3600 * 1000)
        })
    );

    // Compra 5: CONFIRMADA de Lucía para mañana (Final Básquet -> deja el evento AGOTADO con cupo 0 y muestra "Mañana")
    basquetPopularAgotada.descontarCupo(1);
    const compraLuciaManiana = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.luciaConfirmadaManiana,
            comprador: compLucia,
            evento: evFinalBasquetAgotado,
            tipoEntrada: basquetPopularAgotada,
            cantidad: 1,
            estado: EstadoCompra.CONFIRMADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaManiana,
            estado: EstadoCompra.CONFIRMADA,
            quien: compLucia,
            fechaHora: new Date(ahora - 4 * unDiaMs)
        })
    );

    // Compra 6: REEMBOLSADA de Lucía (Hamlet -> muestra estado Reembolsada en el filtro)
    const compraLuciaReembolsada = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.luciaReembolsadaHamlet,
            comprador: compLucia,
            evento: evHamlet,
            tipoEntrada: hamletPlatea,
            cantidad: 2,
            estado: EstadoCompra.REEMBOLSADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaReembolsada,
            estado: EstadoCompra.CONFIRMADA,
            quien: compLucia,
            fechaHora: new Date(ahora - 6 * unDiaMs)
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaReembolsada,
            estado: EstadoCompra.REEMBOLSADA,
            quien: compLucia,
            fechaHora: new Date(ahora - 5 * unDiaMs)
        })
    );

    // Compra 7: CANCELADA de Lucía (Sunset Electronic Fest -> muestra estado Cancelada)
    const compraLuciaCancelada = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.luciaCanceladaElectro,
            comprador: compLucia,
            evento: evSunsetElectro,
            tipoEntrada: electroEarly,
            cantidad: 1,
            estado: EstadoCompra.CANCELADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaCancelada,
            estado: EstadoCompra.PENDIENTE,
            quien: compLucia,
            fechaHora: new Date(ahora - 3 * unDiaMs)
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaCancelada,
            estado: EstadoCompra.CANCELADA,
            quien: compLucia,
            fechaHora: new Date(ahora - 3 * unDiaMs + 1800 * 1000)
        })
    );

    // Compra 8: CONFIRMADA de Valentina en BA Rock Festival (para enriquecer el dashboard de Martín)
    rockPlatea.descontarCupo(2);
    const compraValentinaRock = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.valentinaConfirmadaRock,
            comprador: compValentina,
            evento: evFestivalRock,
            tipoEntrada: rockPlatea,
            cantidad: 2,
            estado: EstadoCompra.CONFIRMADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraValentinaRock,
            estado: EstadoCompra.CONFIRMADA,
            quien: compValentina,
            fechaHora: new Date(ahora - 1 * unDiaMs)
        })
    );
    const msgValentina = compraValentinaRock.agregarMensaje(
        compValentina,
        "Hola Martín, ¿las butacas de Platea Preferencial son techadas?",
        new Date(ahora - 5 * 3600 * 1000)
    );
    mensajeRepository.save(msgValentina);

    // Compra 9: UTILIZADA de Lucía en Maratón Nocturna 10K (asistió y puede escribir reseña)
    maratonGeneral.descontarCupo(1);
    const compraLuciaUtilizadaMaraton = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.luciaUtilizadaMaraton,
            comprador: compLucia,
            evento: evMaratonPasada,
            tipoEntrada: maratonGeneral,
            cantidad: 1,
            estado: EstadoCompra.UTILIZADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraLuciaUtilizadaMaraton,
            estado: EstadoCompra.UTILIZADA,
            quien: orgDeportes,
            fechaHora: new Date(ahora - 10 * unDiaMs)
        })
    );

    // Compra 10: UTILIZADA de Mateo en Maratón Nocturna 10K (asistió y puede escribir reseña)
    maratonGeneral.descontarCupo(1);
    const compraMateoUtilizadaMaraton = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.mateoUtilizadaMaraton,
            comprador: compMateo,
            evento: evMaratonPasada,
            tipoEntrada: maratonGeneral,
            cantidad: 1,
            estado: EstadoCompra.UTILIZADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraMateoUtilizadaMaraton,
            estado: EstadoCompra.UTILIZADA,
            quien: orgDeportes,
            fechaHora: new Date(ahora - 10 * unDiaMs)
        })
    );

    // Compra 11: UTILIZADA de Valentina en Acústico Íntimo de Invierno (asistió y puede escribir reseña)
    pasadoGeneral.descontarCupo(1);
    const compraValentinaUtilizadaAcustico = compraRepository.save(
        new Compra({
            id: SEED_IDS.compras.valentinaUtilizadaAcustico,
            comprador: compValentina,
            evento: evAcusticoPasado,
            tipoEntrada: pasadoGeneral,
            cantidad: 1,
            estado: EstadoCompra.UTILIZADA
        })
    );
    cambioEstadoCompraRepository.save(
        new CambioEstadoCompra({
            compra: compraValentinaUtilizadaAcustico,
            estado: EstadoCompra.UTILIZADA,
            quien: orgRock,
            fechaHora: new Date(ahora - 20 * unDiaMs)
        })
    );

    // 6. Reseñas históricas previas (sin bloquear las compras utilizadas anteriores de Lucía, Mateo y Valentina)
    const resenia1 = reseniaRepository.save(
        new Resenia({
            id: SEED_IDS.resenias.resenia1,
            comprador: compNicolas,
            evento: evAcusticoPasado,
            detalle: "Excelente sonido y organización impecable. Súper puntual.",
            puntuacion: 5
        })
    );
    const resenia2 = reseniaRepository.save(
        new Resenia({
            id: SEED_IDS.resenias.resenia2,
            comprador: compMateo,
            evento: evAcusticoPasado,
            detalle: "Muy buen show, el ingreso fue súper rápido.",
            puntuacion: 4
        })
    );
    const resenia3 = reseniaRepository.save(
        new Resenia({
            id: SEED_IDS.resenias.resenia3,
            comprador: compValentina,
            evento: evConferenciaIA,
            detalle: "Los talleres prácticos y la calidad de los oradores superaron mis expectativas.",
            puntuacion: 5
        })
    );
    const resenia4 = reseniaRepository.save(
        new Resenia({
            id: SEED_IDS.resenias.resenia4,
            comprador: compNicolas,
            evento: evMaratonPasada,
            detalle: "Circuito muy bien señalizado y puestos de hidratación completos.",
            puntuacion: 4.5
        })
    );

    return {
        categorias: [
            catRecitales,
            catTeatro,
            catConferencias,
            catDeportes,
            catFestivales,
            catGastronomia
        ],
        usuarios: [
            orgRock,
            orgTech,
            compLucia,
            compMateo,
            orgDeportes,
            compValentina,
            compNicolas
        ],
        eventos: [
            evFestivalRock,
            evTeatro,
            evConferenciaIA,
            evAcusticoPasado,
            evCopaTenis,
            evJazzSanTelmo,
            evSunsetElectro,
            evHamlet,
            evFeriaSabores,
            evFinalBasquetAgotado,
            evCloudLatam,
            evMaratonPasada
        ],
        compras: [
            compraConfirmada,
            compraPendiente,
            compraUtilizada,
            compraLuciaPendiente,
            compraLuciaManiana,
            compraLuciaReembolsada,
            compraLuciaCancelada,
            compraValentinaRock,
            compraLuciaUtilizadaMaraton,
            compraMateoUtilizadaMaraton,
            compraValentinaUtilizadaAcustico
        ],
        resenias: [resenia1, resenia2, resenia3, resenia4]
    };
}

export default seedDatabase;
