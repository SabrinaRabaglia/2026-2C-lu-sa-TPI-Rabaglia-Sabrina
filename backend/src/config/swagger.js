import { SEED_IDS } from "../data/seed.js";

export const swaggerSpec = {
    openapi: "3.0.3",
    info: {
        title: "AI Ticket It - API REST",
        version: "1.0.0",
        description:
            "API RESTful para la plataforma de publicación de eventos y venta de entradas **AI Ticket It** (Trabajo Práctico Integrador - Desarrollo de Software UTN.BA)."
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Servidor local de desarrollo"
        }
    ],
    tags: [
        { name: "Sistema", description: "Estado del servidor y restauración de datos semilla en memoria" },
        { name: "Categorías", description: "Gestión y consulta de categorías de eventos" },
        { name: "Usuarios", description: "Gestión de usuarios (compradores y organizadores), favoritos y reputación" },
        { name: "Eventos", description: "Publicación, catálogo, búsqueda, filtros y ordenamiento de eventos" },
        { name: "Compras", description: "Compra de entradas, seguimiento de estados, cancelación y chat de soporte" },
        { name: "Reseñas", description: "Calificación de eventos finalizados y reputación de organizadores" }
    ],
    components: {
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    tipo: { type: "string", example: "RequestValidationError" },
                    error: { type: "string", example: "Error de validación en los datos de entrada" },
                    detalles: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                campo: { type: "string" },
                                mensaje: { type: "string" }
                            }
                        }
                    }
                }
            },
            EstadoCompra: {
                type: "string",
                enum: ["PENDIENTE", "CONFIRMADA", "UTILIZADA", "CANCELADA", "REEMBOLSADA"],
                example: "CONFIRMADA"
            },
            Categoria: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.categorias.recitales },
                    nombre: { type: "string", example: "Recitales" },
                    descripcion: { type: "string", example: "Conciertos y festivales de música en vivo" }
                }
            },
            CrearCategoriaInput: {
                type: "object",
                required: ["nombre"],
                properties: {
                    nombre: { type: "string", example: "Festivales" },
                    descripcion: { type: "string", example: "Eventos musicales al aire libre" }
                }
            },
            TipoEntrada: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.tiposEntrada.rockCampo },
                    nombre: { type: "string", example: "Campo General" },
                    descripcion: { type: "string", example: "Acceso a campo de pie" },
                    precio: { type: "number", example: 25000 },
                    cupo: { type: "integer", example: 148 }
                }
            },
            CrearTipoEntradaInput: {
                type: "object",
                required: ["nombre", "precio", "cupo"],
                properties: {
                    nombre: { type: "string", example: "Platea Preferencial" },
                    descripcion: { type: "string", example: "Ubicación numerada frente al escenario" },
                    precio: { type: "number", example: 45000 },
                    cupo: { type: "integer", example: 60 }
                }
            },
            Usuario: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.usuarios.compLucia },
                    nombre: { type: "string", example: "Lucía" },
                    apellido: { type: "string", example: "Gómez" },
                    favoritos: {
                        type: "array",
                        items: { $ref: "#/components/schemas/EventoResumen" }
                    }
                }
            },
            CrearUsuarioInput: {
                type: "object",
                required: ["nombre", "apellido"],
                properties: {
                    nombre: { type: "string", example: "Valentina" },
                    apellido: { type: "string", example: "Rossi" }
                }
            },
            AgregarFavoritoInput: {
                type: "object",
                required: ["eventoId"],
                properties: {
                    eventoId: { type: "string", format: "uuid", example: SEED_IDS.eventos.festivalRock }
                }
            },
            EventoResumen: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.eventos.festivalRock },
                    nombre: { type: "string", example: "BA Rock Festival 2027" },
                    descripcion: { type: "string", example: "Las mejores bandas de rock nacional en una noche única." },
                    fecha: { type: "string", format: "date-time", example: "2027-05-15T21:00:00.000Z" }
                }
            },
            EventoEnriquecido: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.eventos.festivalRock },
                    nombre: { type: "string", example: "BA Rock Festival 2027" },
                    descripcion: { type: "string", example: "Las mejores bandas de rock nacional en una noche única al aire libre." },
                    categoria: { $ref: "#/components/schemas/Categoria" },
                    fecha: { type: "string", format: "date-time", example: "2027-05-15T21:00:00.000Z" },
                    tiposEntrada: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TipoEntrada" }
                    },
                    multimedia: {
                        type: "array",
                        items: { type: "string", format: "uri" },
                        example: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea"]
                    },
                    organizador: { $ref: "#/components/schemas/Usuario" },
                    precioMinimo: { type: "number", example: 25000 },
                    puntajeOrganizador: { type: "number", example: 4.5 },
                    reseniasOrganizador: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Resenia" }
                    }
                }
            },
            CrearEventoInput: {
                type: "object",
                required: ["nombre", "categoriaId", "fecha", "tiposEntrada", "organizadorId"],
                properties: {
                    nombre: { type: "string", example: "Noche de Jazz & Vino" },
                    descripcion: { type: "string", example: "Cuarteto de jazz en vivo con degustación." },
                    categoriaId: { type: "string", format: "uuid", example: SEED_IDS.categorias.recitales },
                    fecha: { type: "string", format: "date-time", example: "2027-08-20T21:00:00.000Z" },
                    tiposEntrada: {
                        type: "array",
                        items: { $ref: "#/components/schemas/CrearTipoEntradaInput" }
                    },
                    multimedia: {
                        type: "array",
                        items: { type: "string", format: "uri" },
                        example: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"]
                    },
                    organizadorId: { type: "string", format: "uuid", example: SEED_IDS.usuarios.orgRock }
                }
            },
            Mensaje: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    usuario: { $ref: "#/components/schemas/Usuario" },
                    mensaje: { type: "string", example: "Hola, ¿a qué hora se habilita el ingreso?" },
                    enviado: { type: "string", format: "date-time" }
                }
            },
            CrearMensajeInput: {
                type: "object",
                required: ["usuarioId", "mensaje"],
                properties: {
                    usuarioId: { type: "string", format: "uuid", example: SEED_IDS.usuarios.compLucia },
                    mensaje: { type: "string", example: "Hola, ¿el lugar cuenta con guardarropas?" }
                }
            },
            CambioEstadoCompra: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    estado: { $ref: "#/components/schemas/EstadoCompra" },
                    quien: { $ref: "#/components/schemas/Usuario" },
                    fechaHora: { type: "string", format: "date-time" }
                }
            },
            CompraEnriquecida: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.compras.confirmada },
                    comprador: { $ref: "#/components/schemas/Usuario" },
                    evento: { $ref: "#/components/schemas/EventoResumen" },
                    tipoEntrada: { $ref: "#/components/schemas/TipoEntrada" },
                    cantidad: { type: "integer", example: 2 },
                    total: { type: "number", example: 50000 },
                    estado: { $ref: "#/components/schemas/EstadoCompra" },
                    mensajes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Mensaje" }
                    },
                    diasFaltantesParaEvento: {
                        type: "integer",
                        nullable: true,
                        example: 15,
                        description: "Cantidad de días hasta el evento si el estado es CONFIRMADA; null en otros estados."
                    },
                    puedeCancelarse: { type: "boolean", example: true },
                    puedeSerReseniada: { type: "boolean", example: false },
                    cambiosEstado: {
                        type: "array",
                        items: { $ref: "#/components/schemas/CambioEstadoCompra" }
                    }
                }
            },
            CrearCompraInput: {
                type: "object",
                required: ["compradorId", "eventoId", "tipoEntradaId", "cantidad"],
                properties: {
                    compradorId: { type: "string", format: "uuid", example: SEED_IDS.usuarios.compLucia },
                    eventoId: { type: "string", format: "uuid", example: SEED_IDS.eventos.festivalRock },
                    tipoEntradaId: { type: "string", format: "uuid", example: SEED_IDS.tiposEntrada.rockCampo },
                    cantidad: { type: "integer", minimum: 1, example: 2 }
                }
            },
            ActualizarEstadoCompraInput: {
                type: "object",
                properties: {
                    estado: { $ref: "#/components/schemas/EstadoCompra" },
                    nuevoEstado: { $ref: "#/components/schemas/EstadoCompra" },
                    usuarioId: { type: "string", format: "uuid", example: SEED_IDS.usuarios.orgRock }
                }
            },
            Resenia: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid", example: SEED_IDS.resenias.resenia1 },
                    comprador: { $ref: "#/components/schemas/Usuario" },
                    evento: { $ref: "#/components/schemas/EventoResumen" },
                    detalle: { type: "string", example: "Excelente sonido y organización impecable." },
                    puntuacion: { type: "number", minimum: 1, maximum: 5, example: 5 }
                }
            },
            CrearReseniaInput: {
                type: "object",
                required: ["compraId", "puntuacion"],
                properties: {
                    compraId: { type: "string", format: "uuid", example: SEED_IDS.compras.utilizada },
                    compradorId: { type: "string", format: "uuid", example: SEED_IDS.usuarios.compLucia },
                    puntuacion: { type: "number", minimum: 1, maximum: 5, example: 5 },
                    detalle: { type: "string", example: "El evento estuvo increíble y empezó puntual." }
                }
            },
            ReputacionOrganizador: {
                type: "object",
                properties: {
                    organizador: { $ref: "#/components/schemas/Usuario" },
                    promedio: { type: "number", example: 4.5 },
                    totalResenias: { type: "integer", example: 2 },
                    resenias: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Resenia" }
                    }
                }
            }
        }
    },
    paths: {
        "/api/health": {
            get: {
                tags: ["Sistema"],
                summary: "Verifica que el servidor backend esté activo",
                responses: {
                    200: {
                        description: "Servidor operativo",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        mensaje: { type: "string", example: "Backend funcionando correctamente" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/seed": {
            post: {
                tags: ["Sistema"],
                summary: "Restaura los datos iniciales en memoria a su estado original",
                responses: {
                    200: {
                        description: "Base de datos en memoria restaurada con éxito"
                    }
                }
            }
        },
        "/api/categorias": {
            get: {
                tags: ["Categorías"],
                summary: "Lista todas las categorías de eventos disponibles",
                responses: {
                    200: {
                        description: "Listado de categorías",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Categoria" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Categorías"],
                summary: "Crea una nueva categoría de eventos",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearCategoriaInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Categoría creada",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Categoria" }
                            }
                        }
                    },
                    400: {
                        description: "Datos de entrada inválidos",
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
                    },
                    409: {
                        description: "Ya existe una categoría con ese nombre",
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
                    }
                }
            }
        },
        "/api/usuarios": {
            get: {
                tags: ["Usuarios"],
                summary: "Lista todos los usuarios registrados",
                responses: {
                    200: {
                        description: "Listado de usuarios",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Usuario" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Usuarios"],
                summary: "Crea un nuevo usuario",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearUsuarioInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Usuario creado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Usuario" }
                            }
                        }
                    },
                    400: { description: "Error de validación" }
                }
            }
        },
        "/api/usuarios/{id}": {
            get: {
                tags: ["Usuarios"],
                summary: "Obtiene el detalle de un usuario por su ID",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.compLucia
                    }
                ],
                responses: {
                    200: {
                        description: "Usuario encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Usuario" }
                            }
                        }
                    },
                    404: { description: "Usuario no encontrado" }
                }
            }
        },
        "/api/usuarios/{id}/reputacion": {
            get: {
                tags: ["Usuarios"],
                summary: "Obtiene el puntaje promedio y reseñas de los eventos de un organizador",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.orgRock
                    }
                ],
                responses: {
                    200: {
                        description: "Reputación e historial de reseñas del organizador",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ReputacionOrganizador" }
                            }
                        }
                    },
                    404: { description: "Organizador no encontrado" }
                }
            }
        },
        "/api/usuarios/{id}/favoritos": {
            get: {
                tags: ["Usuarios"],
                summary: "Lista los eventos favoritos de un usuario",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.compLucia
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de eventos favoritos",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/EventoResumen" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Usuarios"],
                summary: "Agrega un evento a la lista de favoritos del usuario",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.compLucia
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AgregarFavoritoInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Evento agregado a favoritos",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Usuario" }
                            }
                        }
                    },
                    404: { description: "Usuario o Evento no encontrado" }
                }
            }
        },
        "/api/usuarios/{id}/favoritos/{eventoId}": {
            delete: {
                tags: ["Usuarios"],
                summary: "Elimina un evento de la lista de favoritos del usuario",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.compLucia
                    },
                    {
                        name: "eventoId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.eventos.festivalRock
                    }
                ],
                responses: {
                    200: {
                        description: "Evento eliminado de favoritos",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Usuario" }
                            }
                        }
                    },
                    404: { description: "Usuario o Evento no encontrado" }
                }
            }
        },
        "/api/eventos": {
            get: {
                tags: ["Eventos"],
                summary: "Busca, filtra y ordena el catálogo de eventos",
                parameters: [
                    {
                        name: "texto",
                        in: "query",
                        description: "Búsqueda textual por nombre o descripción del evento",
                        schema: { type: "string" }
                    },
                    {
                        name: "categoriaId",
                        in: "query",
                        description: "Filtrar por una categoría (UUID) o varias separadas por coma",
                        schema: { type: "string" }
                    },
                    {
                        name: "categoriaIds",
                        in: "query",
                        description: "Filtrar por múltiples IDs de categoría separados por coma (ej: id1,id2)",
                        schema: { type: "string" }
                    },
                    {
                        name: "organizadorId",
                        in: "query",
                        description: "Filtrar eventos publicados por un organizador",
                        schema: { type: "string", format: "uuid" }
                    },
                    {
                        name: "precioMin",
                        in: "query",
                        description: "Precio mínimo del rango buscado",
                        schema: { type: "number" }
                    },
                    {
                        name: "precioMax",
                        in: "query",
                        description: "Precio máximo del rango buscado",
                        schema: { type: "number" }
                    },
                    {
                        name: "ordenarPor",
                        in: "query",
                        description: "Criterio de ordenamiento: precio, fecha o puntaje del organizador",
                        schema: { type: "string", enum: ["precio", "fecha", "puntaje"] }
                    },
                    {
                        name: "direccion",
                        in: "query",
                        description: "Dirección de ordenamiento (asc o desc)",
                        schema: { type: "string", enum: ["asc", "desc"] }
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Número de página (1-indexed). Si se envía page o limit, la respuesta incluye metadatos de paginación.",
                        schema: { type: "integer", minimum: 1 }
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Cantidad de elementos por página",
                        schema: { type: "integer", minimum: 1 }
                    }
                ],
                responses: {
                    200: {
                        description: "Listado de eventos enriquecidos con precio mínimo y reputación del organizador",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/EventoEnriquecido" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Eventos"],
                summary: "Publica un nuevo evento con sus tipos de entrada, precios y cupos",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearEventoInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Evento creado exitosamente",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/EventoEnriquecido" }
                            }
                        }
                    },
                    400: { description: "Datos de entrada inválidos" },
                    404: { description: "Categoría u organizador inexistente" }
                }
            }
        },
        "/api/eventos/{id}": {
            get: {
                tags: ["Eventos"],
                summary: "Obtiene el detalle completo de un evento por ID",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.eventos.festivalRock
                    }
                ],
                responses: {
                    200: {
                        description: "Detalle del evento",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/EventoEnriquecido" }
                            }
                        }
                    },
                    404: { description: "Evento no encontrado" }
                }
            }
        },
        "/api/eventos/{eventoId}/compras": {
            get: {
                tags: ["Eventos", "Compras"],
                summary: "Obtiene las compras asociadas a un evento diferenciadas por estado y los cupos disponibles",
                parameters: [
                    {
                        name: "eventoId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.eventos.festivalRock
                    },
                    {
                        name: "organizadorId",
                        in: "query",
                        required: false,
                        description: "ID del organizador para validar titularidad del evento",
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.orgRock
                    }
                ],
                responses: {
                    200: {
                        description: "Resumen de ventas por estado y cupos disponibles por tipo de entrada"
                    },
                    403: { description: "El usuario indicado no es el organizador del evento" },
                    404: { description: "Evento no encontrado" }
                }
            }
        },
        "/api/compras": {
            get: {
                tags: ["Compras"],
                summary: "Lista compras filtrando por comprador o por evento",
                parameters: [
                    {
                        name: "compradorId",
                        in: "query",
                        description: "ID del comprador para visualizar 'Mis Compras'",
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.compLucia
                    },
                    {
                        name: "eventoId",
                        in: "query",
                        description: "ID del evento para visualizar ventas y disponibilidad como organizador",
                        schema: { type: "string", format: "uuid" }
                    },
                    {
                        name: "organizadorId",
                        in: "query",
                        description: "ID del organizador titular del evento",
                        schema: { type: "string", format: "uuid" }
                    }
                ],
                responses: {
                    200: {
                        description: "Listado de compras o resumen de ventas por evento",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/CompraEnriquecida" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Compras"],
                summary: "Realiza una nueva compra de entradas validando y descontando el cupo disponible",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearCompraInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Compra registrada exitosamente",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CompraEnriquecida" }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o el tipo de entrada no pertenece al evento" },
                    404: { description: "Comprador o Evento no encontrado" },
                    409: { description: "No hay cupo suficiente para la cantidad solicitada" }
                }
            }
        },
        "/api/compras/{id}": {
            get: {
                tags: ["Compras"],
                summary: "Obtiene el detalle completo de una compra por su ID",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.compras.confirmada
                    }
                ],
                responses: {
                    200: {
                        description: "Detalle de la compra",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CompraEnriquecida" }
                            }
                        }
                    },
                    404: { description: "Compra no encontrada" }
                }
            },
            patch: {
                tags: ["Compras"],
                summary: "Actualiza el estado de una compra (ej. CONFIRMADA, UTILIZADA, REEMBOLSADA)",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.compras.confirmada
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ActualizarEstadoCompraInput" }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Compra con estado actualizado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CompraEnriquecida" }
                            }
                        }
                    },
                    409: { description: "Transición o cancelación inválida" },
                    422: { description: "EstadoCompra inválido" }
                }
            },
            delete: {
                tags: ["Compras"],
                summary: "Cancela y reembolsa una compra reintegrando el cupo (si no fue UTILIZADA y el evento no ocurrió)",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.compras.confirmada
                    }
                ],
                responses: {
                    200: {
                        description: "Compra cancelada/reembolsada exitosamente",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CompraEnriquecida" }
                            }
                        }
                    },
                    404: { description: "Compra no encontrada" },
                    409: { description: "No se puede cancelar (ya fue UTILIZADA, ya está cancelada o el evento ya ocurrió)" }
                }
            }
        },
        "/api/compras/{id}/mensajes": {
            get: {
                tags: ["Compras"],
                summary: "Lista los mensajes del chat asociados a una compra",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.compras.confirmada
                    }
                ],
                responses: {
                    200: {
                        description: "Historial de mensajes de la compra",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Mensaje" }
                                }
                            }
                        }
                    },
                    404: { description: "Compra no encontrada" }
                }
            },
            post: {
                tags: ["Compras"],
                summary: "Envía un mensaje en el chat de una compra (comprador u organizador)",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.compras.confirmada
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearMensajeInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Mensaje enviado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Mensaje" }
                            }
                        }
                    },
                    403: { description: "El usuario no es ni el comprador ni el organizador del evento" },
                    404: { description: "Compra o Usuario no encontrado" }
                }
            }
        },
        "/api/resenias": {
            get: {
                tags: ["Reseñas"],
                summary: "Lista reseñas filtrando opcionalmente por evento o por organizador",
                parameters: [
                    {
                        name: "eventoId",
                        in: "query",
                        description: "Filtrar reseñas de un evento puntual",
                        schema: { type: "string", format: "uuid" }
                    },
                    {
                        name: "organizadorId",
                        in: "query",
                        description: "Obtener promedio y reseñas acumuladas de un organizador",
                        schema: { type: "string", format: "uuid" },
                        example: SEED_IDS.usuarios.orgRock
                    }
                ],
                responses: {
                    200: {
                        description: "Listado de reseñas o reputación del organizador"
                    }
                }
            },
            post: {
                tags: ["Reseñas"],
                summary: "Crea una reseña con puntaje numérico (1 a 5) y comentario para una compra UTILIZADA",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CrearReseniaInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Reseña registrada exitosamente",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Resenia" }
                            }
                        }
                    },
                    403: { description: "Solo el comprador titular de la compra puede calificar el evento" },
                    404: { description: "Compra no encontrada" },
                    409: { description: "La entrada aún no se encuentra en estado UTILIZADA" },
                    422: { description: "La puntuación debe estar entre 1 y 5" }
                }
            }
        }
    }
};

export default swaggerSpec;
