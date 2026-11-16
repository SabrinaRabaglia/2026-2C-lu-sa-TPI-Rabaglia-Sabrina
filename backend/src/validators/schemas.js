import { z } from "zod";

export const crearCategoriaSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio y debe ser texto" }).min(1, "El nombre no puede estar vacío"),
    descripcion: z.string().optional()
});

export const crearUsuarioSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio" }).min(1, "El nombre no puede estar vacío"),
    apellido: z.string({ error: "El campo 'apellido' es obligatorio" }).min(1, "El apellido no puede estar vacío")
});

export const agregarFavoritoSchema = z.object({
    eventoId: z.string({ error: "El campo 'eventoId' es obligatorio" }).min(1, "El 'eventoId' no puede estar vacío")
});

export const crearEventoSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio" }).min(1, "El nombre no puede estar vacío"),
    descripcion: z.string().optional(),
    categoriaId: z.string({ error: "El campo 'categoriaId' es obligatorio" }).min(1),
    fecha: z.string({ error: "El campo 'fecha' es obligatorio" }).min(1),
    tiposEntrada: z
        .array(
            z.object({
                nombre: z.string().min(1),
                descripcion: z.string().optional(),
                precio: z.number(),
                cupo: z.number().int()
            })
        )
        .min(1, "Se debe incluir al menos un tipo de entrada"),
    multimedia: z.array(z.string()).optional(),
    organizadorId: z.string({ error: "El campo 'organizadorId' es obligatorio" }).min(1)
});

export const crearCompraSchema = z.object({
    compradorId: z.string({ error: "El campo 'compradorId' es obligatorio" }).min(1),
    eventoId: z.string({ error: "El campo 'eventoId' es obligatorio" }).min(1),
    tipoEntradaId: z.string({ error: "El campo 'tipoEntradaId' es obligatorio" }).min(1),
    cantidad: z.number({ error: "El campo 'cantidad' debe ser numérico" }).int()
});

export const actualizarEstadoCompraSchema = z.object({
    estado: z.string().min(1).optional(),
    nuevoEstado: z.string().min(1).optional(),
    usuarioId: z.string().optional()
}).refine((data) => Boolean(data.estado || data.nuevoEstado), {
    message: "Se debe especificar 'estado' o 'nuevoEstado'"
});

export const crearMensajeSchema = z.object({
    usuarioId: z.string({ error: "El campo 'usuarioId' es obligatorio" }).min(1),
    mensaje: z.string({ error: "El campo 'mensaje' es obligatorio" }).min(1, "El mensaje no puede estar vacío")
});

export const crearReseniaSchema = z.object({
    compraId: z.string({ error: "El campo 'compraId' es obligatorio" }).min(1),
    compradorId: z.string().optional(),
    puntuacion: z.number({ error: "El campo 'puntuacion' debe ser numérico" }),
    detalle: z.string().optional()
});
