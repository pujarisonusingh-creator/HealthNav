import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("healthnav.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    phone TEXT,
    icu INTEGER DEFAULT 0,
    oxygen INTEGER DEFAULT 0,
    ambulance INTEGER DEFAULT 0,
    emergency247 INTEGER DEFAULT 0,
    pharmacy INTEGER DEFAULT 0,
    bloodBank INTEGER DEFAULT 0,
    trauma INTEGER DEFAULT 0,
    pediatric INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    address TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add columns if upgrading from old schema
try {
  db.exec(`ALTER TABLE hospitals ADD COLUMN pharmacy INTEGER DEFAULT 0`);
  db.exec(`ALTER TABLE hospitals ADD COLUMN bloodBank INTEGER DEFAULT 0`);
  db.exec(`ALTER TABLE hospitals ADD COLUMN trauma INTEGER DEFAULT 0`);
  db.exec(`ALTER TABLE hospitals ADD COLUMN pediatric INTEGER DEFAULT 0`);
} catch (_) { /* columns already exist */ }

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.get("/api/hospitals", (_req, res) => {
    const hospitals = db.prepare("SELECT * FROM hospitals").all();
    res.json(hospitals.map((h: any) => ({
      ...h,
      type: 'hospital',
      distanceKm: undefined,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
      facilities: {
        icu: !!h.icu, oxygen: !!h.oxygen, ambulance: !!h.ambulance,
        emergency247: !!h.emergency247, pharmacy: !!h.pharmacy,
        bloodBank: !!h.bloodBank, trauma: !!h.trauma, pediatric: !!h.pediatric,
      },
      isCustom: true,
    })));
  });

  app.post("/api/hospitals", (req, res) => {
    const { id, name, address, lat, lng, phone, facilities } = req.body;
    const stmt = db.prepare(`
      INSERT INTO hospitals (id, name, address, lat, lng, phone, icu, oxygen, ambulance, emergency247, pharmacy, bloodBank, trauma, pediatric)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, name, address || '', lat, lng, phone || '',
      facilities.icu ? 1 : 0, facilities.oxygen ? 1 : 0,
      facilities.ambulance ? 1 : 0, facilities.emergency247 ? 1 : 0,
      facilities.pharmacy ? 1 : 0, facilities.bloodBank ? 1 : 0,
      facilities.trauma ? 1 : 0, facilities.pediatric ? 1 : 0,
    );
    res.json({ success: true });
  });

  app.delete("/api/hospitals/:id", (req, res) => {
    db.prepare("DELETE FROM hospitals WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/history", (_req, res) => {
    res.json(db.prepare("SELECT * FROM history ORDER BY timestamp DESC LIMIT 30").all());
  });

  app.post("/api/history", (req, res) => {
    const { lat, lng, address } = req.body;
    db.prepare("INSERT INTO history (lat, lng, address) VALUES (?, ?, ?)").run(lat, lng, address);
    res.json({ success: true });
  });

  app.delete("/api/history", (_req, res) => {
    db.prepare("DELETE FROM history").run();
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HealthNav running → http://localhost:${PORT}`);
  });
}

startServer();
