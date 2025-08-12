import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import universitasRoutes from "./routes/universitasRoutes";
import prodiRoutes from "./routes/prodiRoutes";
import { seedDefaultAdmins } from "./configs/seeder";

dotenv.config();

const app = express();

// Simple CORS configuration to fix the error
app.use(
  cors({
    origin: "*", // Allow all origins for development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/universitas", universitasRoutes);
app.use("/api/prodi", prodiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDefaultAdmins();
});
