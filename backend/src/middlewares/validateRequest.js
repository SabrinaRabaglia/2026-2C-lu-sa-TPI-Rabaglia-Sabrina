import { RequestValidationError } from "../validators/errors.js";

export function validateBody(schema) {
    return (req, res, next) => {
        const resultado = schema.safeParse(req.body);
        if (!resultado.success) {
            const detalles = resultado.error.issues.map((issue) => ({
                campo: issue.path.join("."),
                mensaje: issue.message
            }));
            throw new RequestValidationError(
                detalles[0]?.mensaje || "Datos de entrada inválidos en la solicitud",
                detalles
            );
        }
        next();
    };
}

export default validateBody;
