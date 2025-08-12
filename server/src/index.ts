import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import universitasRoutes from "./routes/universitasRoutes";
import prodiRoutes from "./routes/prodiRoutes";
import { seedDefaultAdmins } from "./configs/seeder";

dotenv.config();
const app = express();

// CORS configuration yang lebih permissive untuk development
const corsOpts: cors.CorsOptions = {
  origin: true, // Allow all origins
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
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOpts));

// Handle preflight requests explicitly
app.options("*", cors(corsOpts));

// Additional CORS middleware as backup
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
  );

  if (req.method === "OPTIONS") {
    console.log("Preflight request handled");
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// (opsional) logger buat cek preflight nyampe dan origin
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.headers.origin) {
    console.log(`Origin: ${req.headers.origin}`);
  }
  if (req.headers["user-agent"]) {
    const isMac = req.headers["user-agent"].includes("Mac");
    if (isMac) console.log("Request from macOS detected");
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/universitas", universitasRoutes);
app.use("/api/prodi", prodiRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Listen on all network interfaces untuk cross-platform compatibility
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on all interfaces: 0.0.0.0:${PORT}`);
  console.log(`\nAccess URLs for different platforms:`);
  console.log(`  Windows/General: http://localhost:${PORT}`);
  console.log(`  macOS/Linux:     http://127.0.0.1:${PORT}`);
  console.log(`  Network IP:      http://10.10.70.163:${PORT}`);
  console.log(`  IPv6 (macOS):    http://[::1]:${PORT}`);
  console.log(
    `\nTeman di macOS coba gunakan: http://127.0.0.1:${PORT} atau network IP`
  );
  await seedDefaultAdmins();
});
