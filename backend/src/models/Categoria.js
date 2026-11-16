export class Categoria {
    constructor({ id = null, nombre, descripcion = "" }) {
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new Error("El nombre de la categoría es obligatorio");
        }
        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = descripcion;
    }
}

export default Categoria;
