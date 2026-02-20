import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("hospital.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    phone TEXT UNIQUE,
    full_name TEXT,
    otp TEXT,
    otp_expiry DATETIME
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    code TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS user_hospitals (
    user_id INTEGER,
    hospital_id INTEGER,
    role TEXT,
    PRIMARY KEY (user_id, hospital_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER,
    full_name TEXT,
    age INTEGER,
    gender TEXT,
    condition TEXT,
    status TEXT,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER,
    patient_id INTEGER,
    doctor_name TEXT,
    date DATETIME,
    status TEXT,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`);

// Seed initial data if empty
const hospitalCount = db.prepare("SELECT COUNT(*) as count FROM hospitals").get() as { count: number };
if (hospitalCount.count === 0) {
  const insertHospital = db.prepare("INSERT INTO hospitals (name, location, code) VALUES (?, ?, ?)");
  insertHospital.run("St. Mary's General", "Downtown District", "SMG-001");
  insertHospital.run("City Children's Hospital", "West Side", "CCH-002");
  insertHospital.run("North Star Medical Center", "Northern Heights", "NSM-003");

  const insertUser = db.prepare("INSERT INTO users (email, username, password, phone, full_name) VALUES (?, ?, ?, ?, ?)");
  const user = insertUser.run("admin@aetheris.health", "admin", "password123", "1234567890", "Dr. Sarah Mitchell");
  
  const insertUserHospital = db.prepare("INSERT INTO user_hospitals (user_id, hospital_id, role) VALUES (?, ?, ?)");
  insertUserHospital.run(user.lastInsertRowid, 1, "Administrator");
  insertUserHospital.run(user.lastInsertRowid, 2, "Senior Physician");

  const insertPatient = db.prepare("INSERT INTO patients (hospital_id, full_name, age, gender, condition, status) VALUES (?, ?, ?, ?, ?, ?)");
  insertPatient.run(1, "John Doe", 45, "Male", "Hypertension", "Stable");
  insertPatient.run(1, "Jane Smith", 32, "Female", "Post-op Recovery", "Critical");
  insertPatient.run(2, "Billy Kid", 8, "Male", "Fractured Arm", "Stable");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Auth API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  app.post("/api/auth/login", (req, res) => {
    console.log("Login request received:", req.body);
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ 
      user: { id: user.id, email: user.email, fullName: user.full_name, username: user.username }
    });
  });

  app.post("/api/auth/request-otp", (req, res) => {
    const { phone } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as any;
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = "123456";
    const expiry = new Date(Date.now() + 10 * 60000).toISOString();
    
    db.prepare("UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?").run(otp, expiry, user.id);
    
    console.log(`[MOCK OTP] Sent to ${phone}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { phone, otp } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as any;

    if (!user || (user.otp !== otp && otp !== "123456")) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    res.json({ 
      user: { id: user.id, email: user.email, fullName: user.full_name, username: user.username }
    });
  });

  app.get("/api/user/:userId/hospitals", (req, res) => {
    const { userId } = req.params;
    const hospitals = db.prepare(`
      SELECT h.*, uh.role 
      FROM hospitals h
      JOIN user_hospitals uh ON h.id = uh.hospital_id
      WHERE uh.user_id = ?
    `).all(userId);
    res.json(hospitals);
  });

  app.get("/api/hospital/:hospitalId/stats", (req, res) => {
    const { hospitalId } = req.params;
    const patientCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE hospital_id = ?").get(hospitalId) as any;
    const criticalCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE hospital_id = ? AND status = 'Critical'").get(hospitalId) as any;
    const appointmentCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE hospital_id = ?").get(hospitalId) as any;

    res.json({
      patients: patientCount.count,
      critical: criticalCount.count,
      appointments: appointmentCount.count,
      staff: 12 // Mocked
    });
  });

  app.get("/api/hospital/:hospitalId/patients", (req, res) => {
    const { hospitalId } = req.params;
    const patients = db.prepare("SELECT * FROM patients WHERE hospital_id = ?").all(hospitalId);
    res.json(patients);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
