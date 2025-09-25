import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import universitasRoutes from "./routes/universitasRoutes";
import prodiRoutes from "./routes/prodiRoutes";
import consultationRoutes from "./routes/consultationRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import geoCodeRoutes from "./routes/geoCoderRoutes";
import { seedDefaultAdmins } from "./configs/adminSeeder";
import { seedLocalData } from "./configs/localDataSeeder";

dotenv.config();
const app = express();

// CORS configuration - specific origins for better compatibility
const corsOpts: cors.CorsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Origin",
    "Accept",
    "Cache-Control",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOpts));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/universitas", universitasRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/geocode", geoCodeRoutes);

const PORT = 5000;

// Listen on localhost for better compatibility
app.listen(PORT, "localhost", async () => {
  console.log(`Server running on localhost:${PORT}`);
  console.log(`Access URL: http://localhost:${PORT}`);
  await seedDefaultAdmins();
  await seedLocalData();
});
