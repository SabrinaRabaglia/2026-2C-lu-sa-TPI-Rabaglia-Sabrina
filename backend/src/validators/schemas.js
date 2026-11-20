import { z } from "zod";

export const crearCategoriaSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio y debe ser texto" }).min(1, "El nombre no puede estar vacío"),
    descripcion: z.string().optional()
});

export const crearUsuarioSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio" }).min(1, "El nombre no puede estar vacío"),
    apellido: z.string({ error: "El campo 'apellido' es obligatorio" }).min(1, "El apellido no puede estar vacío"),
    email: z.string().email("El email no tiene un formato válido").optional(),
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres").optional(),
    rol: z.enum(["COMPRADOR", "ORGANIZADOR"]).optional()
});

export const registroUsuarioSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio" }).trim().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string({ error: "El campo 'apellido' es obligatorio" }).trim().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string({ error: "El campo 'email' es obligatorio" }).trim().email("Ingresá un email válido"),
    password: z.string({ error: "El campo 'password' es obligatorio" }).min(4, "La contraseña debe tener al menos 4 caracteres"),
    rol: z.enum(["COMPRADOR", "ORGANIZADOR"]).optional()
});

export const loginUsuarioSchema = z.object({
    email: z.string({ error: "El campo 'email' es obligatorio" }).trim().email("Ingresá un email válido"),
    password: z.string({ error: "El campo 'password' es obligatorio" }).min(1, "La contraseña es obligatoria")
});

export const agregarFavoritoSchema = z.object({
    eventoId: z.string({ error: "El campo 'eventoId' es obligatorio" }).min(1, "El 'eventoId' no puede estar vacío")
});

export const crearEventoSchema = z.object({
    nombre: z.string({ error: "El campo 'nombre' es obligatorio" }).min(1, "El nombre no puede estar vacío"),
    descripcion: z.string().optional(),
    categoriaId: z.string({ error: "El campo 'categoriaId' es obligatorio" }).min(1),
    fecha: z
        .string({ error: "El campo 'fecha' es obligatorio" })
        .min(1)
        .refine((val) => !Number.isNaN(Date.parse(val)), {
            message: "La fecha debe tener un formato válido (ej. ISO 8601)"
        }),
    tiposEntrada: z
        .array(
            z.object({
                nombre: z.string().min(1, "El nombre del tipo de entrada es obligatorio"),
                descripcion: z.string().optional(),
                precio: z.number({ error: "El precio debe ser numérico" }).nonnegative("El precio no puede ser negativo"),
                cupo: z.number({ error: "El cupo debe ser numérico" }).int("El cupo debe ser un número entero").positive("El cupo inicial debe ser mayor a 0")
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
    cantidad: z
        .number({ error: "El campo 'cantidad' debe ser numérico" })
        .int("La cantidad debe ser un número entero")
        .positive("La cantidad debe ser mayor a 0"),
    estadoInicial: z.enum(["PENDIENTE", "CONFIRMADA"]).optional()
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
    puntuacion: z
        .number({ error: "El campo 'puntuacion' debe ser numérico" })
        .min(1, "La puntuación mínima es 1")
        .max(5, "La puntuación máxima es 5"),
    detalle: z.string().optional()
});
