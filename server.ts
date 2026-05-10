import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = new Database("finepay.db");
const JWT_SECRET = process.env.JWT_SECRET || "finepay-super-secret-key";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    recurrence TEXT DEFAULT 'none',
    isPaid INTEGER DEFAULT 0,
    notificationDays INTEGER DEFAULT 3,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const info = stmt.run(name, email, hashedPassword);
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, name, email } });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Bills
  app.get("/api/bills", authenticateToken, (req: any, res) => {
    const bills = db.prepare("SELECT * FROM bills WHERE userId = ? ORDER BY dueDate ASC").all(req.user.id);
    res.json(bills);
  });

  app.post("/api/bills", authenticateToken, (req: any, res) => {
    const { name, amount, dueDate, category, notes, recurrence, notificationDays } = req.body;
    const stmt = db.prepare(`
      INSERT INTO bills (userId, name, amount, dueDate, category, notes, recurrence, notificationDays)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(req.user.id, name, amount, dueDate, category, notes, recurrence || 'none', notificationDays || 3);
    res.json({ id: info.lastInsertRowid, ...req.body });
  });

  app.put("/api/bills/:id", authenticateToken, (req: any, res) => {
    const { name, amount, dueDate, category, notes, recurrence, notificationDays } = req.body;
    const stmt = db.prepare(`
      UPDATE bills 
      SET name = ?, amount = ?, dueDate = ?, category = ?, notes = ?, recurrence = ?, notificationDays = ?
      WHERE id = ? AND userId = ?
    `);
    stmt.run(name, amount, dueDate, category, notes, recurrence, notificationDays, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.patch("/api/bills/:id", authenticateToken, (req: any, res) => {
    const { isPaid } = req.body;
    const stmt = db.prepare("UPDATE bills SET isPaid = ? WHERE id = ? AND userId = ?");
    stmt.run(isPaid ? 1 : 0, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.delete("/api/bills/:id", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("DELETE FROM bills WHERE id = ? AND userId = ?");
    stmt.run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const now = new Date().toISOString().split('T')[0];
    
    const stats = db.prepare(`
      SELECT 
        SUM(CASE WHEN isPaid = 0 THEN amount ELSE 0 END) as totalPending,
        SUM(CASE WHEN isPaid = 1 THEN amount ELSE 0 END) as totalPaid,
        COUNT(CASE WHEN dueDate < ? AND isPaid = 0 THEN 1 END) as overdueCount
      FROM bills 
      WHERE userId = ?
    `).get(now, userId);

    res.json(stats);
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinePay running on http://localhost:${PORT}`);
  });
}

startServer();
