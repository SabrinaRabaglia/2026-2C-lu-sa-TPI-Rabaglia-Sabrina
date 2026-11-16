# Colecciones de Postman - AI Ticket It

Esta carpeta contiene las colecciones de Postman v2.1 organizadas por subcarpetas según cada recurso de la API REST. Todas las colecciones vienen preconfiguradas con `baseUrl = http://localhost:3000/api` y con los **UUIDs fijos** cargados por `backend/src/data/seed.js`, por lo que podés importarlas y ejecutar cualquier request directamente sin tener que copiar IDs a mano.

## Estructura de Subcarpetas

- [`categorias/categorias.postman_collection.json`](./categorias/categorias.postman_collection.json): listado, consulta por ID, creación y pruebas de validación/conflicto (`400` y `409`).
- [`usuarios/usuarios.postman_collection.json`](./usuarios/usuarios.postman_collection.json): listado, detalle, creación de usuario y gestión RESTful de eventos favoritos (`GET`, `POST`, `DELETE`).
- [`eventos/eventos.postman_collection.json`](./eventos/eventos.postman_collection.json): catálogo, búsqueda textual, filtros por categoría y rango de precios, ordenamiento por precio/fecha/puntaje del organizador, detalle enriquecido y creación de evento.
- [`compras/compras.postman_collection.json`](./compras/compras.postman_collection.json): compras por comprador (con días restantes), vista del organizador por evento (agrupadas por estado y cupos disponibles), alta de compra, chat de mensajes comprador/organizador, cambio de estado (`PATCH`) y cancelación con reintegro de cupo (`DELETE`).
- [`resenias/resenias.postman_collection.json`](./resenias/resenias.postman_collection.json): consulta de reseñas por evento y por organizador (con puntaje promedio), creación de reseña sobre compra `UTILIZADA` y rechazo (`409`) si aún no fue utilizada.

## Cómo usarlas

1. Iniciá el servidor backend desde `backend/`:
   ```bash
   node server.js
   ```
2. En Postman, hacé clic en **Import** y arrastrá cualquiera de los archivos `.postman_collection.json` (o toda la carpeta `docs/postman`).
