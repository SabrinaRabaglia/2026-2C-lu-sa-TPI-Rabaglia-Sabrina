import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { seedDatabase } from "./data/seed.js";

seedDatabase();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Ruta de prueba
app.get("/api/health", (req, res) => {
    res.json({
        mensaje: "Backend funcionando correctamente"
    });
});

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;
