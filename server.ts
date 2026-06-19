import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

let pfToken: string | null = null;
let pfTokenExpiresAt: number = 0;

async function getPFToken(): Promise<string> {
  if (pfToken && Date.now() < pfTokenExpiresAt) {
    return pfToken;
  }

  const apiKey = process.env.PF_API_KEY;
  const apiSecret = process.env.PF_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('PF_API_KEY and PF_API_SECRET are not set.');
  }

  const reqBody = { apiKey, apiSecret };

  const res = await fetch('https://atlas.propertyfinder.com/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(reqBody)
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('PF Token failure:', txt);
    throw new Error(`Failed to get Property Finder token. Status: ${res.status}`);
  }

  const data = await res.json();
  pfToken = data.accessToken;
  // Expire 1 minute early to be safe
  pfTokenExpiresAt = Date.now() + ((data.expiresIn - 60) * 1000);
  
  return pfToken as string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example proxy for getting leads from Property Finder
  app.get("/api/pf/leads", async (req, res) => {
    try {
      const token = await getPFToken();
      // Forward query params
      const qParams = new URLSearchParams(req.query as Record<string, string>);
      
      const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/leads?${qParams.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await upstreamRes.json();
      res.status(upstreamRes.status).json(data);
    } catch (e: any) {
      console.error('PF Leads Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Proxy for listings
  app.get("/api/pf/listings", async (req, res) => {
    try {
      const token = await getPFToken();
      const qParams = new URLSearchParams(req.query as Record<string, string>);
      
      const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/listings?${qParams.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await upstreamRes.json();
      res.status(upstreamRes.status).json(data);
    } catch (e: any) {
      console.error('PF Listings Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite development middleware OR static serving
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
