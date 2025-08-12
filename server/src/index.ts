import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import universitasRoutes from "./routes/universitasRoutes";
import prodiRoutes from "./routes/prodiRoutes";
import { seedDefaultAdmins } from "./configs/seeder";

dotenv.config();

const app = express();

// Enhanced CORS configuration for cross-platform compatibility
app.use((req, res, next) => {
  const origin =
    req.headers.origin || req.headers.host || "http://localhost:3000";

  // Allow all origins and common localhost variations for development
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );
  res.header("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    console.log("Preflight request from:", origin);
    return res.status(200).end();
  }

  next();
});

// Backup CORS middleware
app.use(
  cors({
    origin: true, // Accept any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
      "Cache-Control",
    ],
    optionsSuccessStatus: 200,
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

const PORT = Number(process.env.PORT) || 5000;

// Listen on all interfaces for better compatibility
if (process.env.NODE_ENV === "production") {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedDefaultAdmins();
  });
} else {
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
    console.log(`Access URLs:`);
    console.log(`  Local:    http://localhost:${PORT}`);
    console.log(`  Network:  http://127.0.0.1:${PORT}`);
    console.log(`  IPv6:     http://[::1]:${PORT}`);
    await seedDefaultAdmins();
  });
}
