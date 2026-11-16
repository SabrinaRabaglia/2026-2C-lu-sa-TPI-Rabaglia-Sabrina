export class Mensaje {
    constructor({ id = null, usuario, mensaje, enviado = new Date() }) {
        if (!usuario) {
            throw new Error("El usuario emisor del mensaje es obligatorio");
        }
        if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
            throw new Error("El contenido del mensaje no puede estar vacío");
        }
        const fechaEnviado = enviado instanceof Date ? enviado : new Date(enviado);
        if (Number.isNaN(fechaEnviado.getTime())) {
            throw new Error("La fecha de envío del mensaje es inválida");
        }

        this.id = id;
        this.usuario = usuario;
        this.mensaje = mensaje.trim();
        this.enviado = fechaEnviado;
    }
}

export default Mensaje;
