import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { seedDatabase } from "./data/seed.js";
import { swaggerSpec } from "./config/swagger.js";

seedDatabase();

const app = express();

app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));

// Documentación interactiva Swagger / OpenAPI 3.0
app.get("/api-docs.json", (req, res) => {
    res.status(200).json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de prueba
app.get("/api/health", (req, res) => {
    res.json({
        mensaje: "Backend funcionando correctamente"
    });
});

// Ruta para restaurar datos semilla en memoria (útil para demos y pruebas)
app.post("/api/seed", (req, res) => {
    const data = seedDatabase();
    res.status(200).json({
        mensaje: "Datos en memoria restaurados correctamente",
        resumen: {
            categorias: data.categorias.length,
            usuarios: data.usuarios.length,
            eventos: data.eventos.length,
            compras: data.compras.length,
            resenias: data.resenias.length
        }
    });
});

app.use("/api", apiRouter);

// Handler JSON para rutas inexistentes (404)
app.use((req, res) => {
    res.status(404).json({
        tipo: "RouteNotFoundError",
        error: `La ruta ${req.method} ${req.originalUrl} no existe`
    });
});

app.use(errorHandler);

export default app;
