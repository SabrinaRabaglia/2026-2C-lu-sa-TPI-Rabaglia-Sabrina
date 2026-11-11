import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

export default app;