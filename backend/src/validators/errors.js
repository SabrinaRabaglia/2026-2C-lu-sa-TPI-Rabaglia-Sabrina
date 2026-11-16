export class RequestValidationError extends Error {
    constructor(message, detalles = []) {
        super(message);
        this.name = "RequestValidationError";
        this.detalles = detalles;
    }
}

export default RequestValidationError;
