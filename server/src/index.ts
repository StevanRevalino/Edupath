import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import universitasRoutes from "./routes/universitasRoutes";
import prodiRoutes from "./routes/prodiRoutes";
import { seedDefaultAdmins } from "./configs/seeder";

dotenv.config();

const app = express();

// Configure CORS with specific options
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Add both localhost variations
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// // Handle preflight requests
// app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/universitas", universitasRoutes);
app.use("/api/prodi", prodiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDefaultAdmins();
});
