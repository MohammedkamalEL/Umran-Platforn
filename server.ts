import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";

// Initialize Firebase Admin
// In a real environment, you'd use a service account key or default credentials
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e) {
    console.warn("Firebase Admin failed to initialize with default credentials. SMS parsing might be limited.");
    // Fallback for development if needed
  }
}

const db = admin.apps.length ? admin.firestore() : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Umran Platform Backend is Active" });
  });

  // SMS Webhook Endpoint (e.g. for Twilio or local gateway)
  app.post("/api/webhooks/sms", async (req, res) => {
    const { From, Body, MessageSid } = req.body;
    console.log(`Received SMS from ${From}: ${Body}`);

    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    try {
      // Very simple parser for demo: "Type: [road/water/etc] Desc: [description] Loc: [location]"
      const body = Body || "";
      const typeMatch = body.match(/Type:\s*(\w+)/i);
      const descMatch = body.match(/Desc:\s*(.+?)(?=Loc:|$)/i);
      const locMatch = body.match(/Loc:\s*(.+)/i);

      const issueType = typeMatch ? typeMatch[1].toLowerCase() : "other";
      const description = descMatch ? descMatch[1].trim() : body;
      const locationAddress = locMatch ? locMatch[1].trim() : "Unknown (SMS Source)";

      const trackingId = `SMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const issueData = {
        trackingId,
        type: issueType,
        description,
        location: {
          lat: 15.5007, // Default center or could be triangulated
          lng: 32.5599,
          address: locationAddress
        },
        severity: 2,
        status: "pending",
        reportedByCitizen: true,
        source: "sms",
        from: From,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await db.collection("issues").add(issueData);

      res.status(200).send("SMS Received and Processed");
    } catch (error) {
      console.error("Error processing SMS webhook:", error);
      res.status(500).send("Error Processing SMS");
    }
  });

  // Example API route for metadata or config if needed in future
  app.get("/api/config", (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
