import { Router } from "express";
import categoriaRoutes from "./categoriaRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import eventoRoutes from "./eventoRoutes.js";
import compraRoutes from "./compraRoutes.js";
import reseniaRoutes from "./reseniaRoutes.js";

const apiRouter = Router();

apiRouter.use("/categorias", categoriaRoutes);
apiRouter.use("/usuarios", usuarioRoutes);
apiRouter.use("/eventos", eventoRoutes);
apiRouter.use("/compras", compraRoutes);
apiRouter.use("/resenias", reseniaRoutes);

export default apiRouter;
