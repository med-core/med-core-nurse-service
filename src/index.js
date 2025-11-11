import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import nurseRoutes from "./router/nurseRoutes.js";
import { sendError } from "./utils/errorHandler.js";

// Instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de salud estándar (usado por Docker Healthcheck)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Rutas reales del microservicio
app.use("/api/v1/nurses", nurseRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Nurse Service funcionando correctamente");
});

// Manejador global de errores
app.use((err, req, res, next) => {
  sendError(err, res);
});

// Función principal para iniciar el servidor de forma asíncrona
async function startServer() {
  try {
    await connectDB();
    console.log("Conectado a MongoDB mediante Prisma (Nurse Service)");

    app.listen(PORT, () => {
      console.log(`Nurse Service corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Fallo crítico al iniciar el Nurse Service:", error.message);
    process.exit(1);
  }
}

startServer();

export default app;