var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// api/index.ts
var import_express = __toESM(require("express"), 1);
var app = (0, import_express.default)();
app.use(import_express.default.json());
var pfToken = null;
var pfTokenExpiresAt = 0;
async function getPFToken() {
  if (pfToken && Date.now() < pfTokenExpiresAt) {
    return pfToken;
  }
  const apiKey = process.env.PF_API_KEY;
  const apiSecret = process.env.PF_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("PF_API_KEY and PF_API_SECRET are not set.");
  }
  const reqBody = { apiKey, apiSecret };
  const res = await fetch("https://atlas.propertyfinder.com/v1/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(reqBody)
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("PF Token failure:", txt);
    throw new Error(`Failed to get Property Finder token. Status: ${res.status}`);
  }
  const data = await res.json();
  pfToken = data.accessToken;
  pfTokenExpiresAt = Date.now() + (data.expiresIn - 60) * 1e3;
  return pfToken;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/pf/leads", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query);
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/leads?${qParams.toString()}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e) {
    console.error("PF Leads Error:", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/pf/listings", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query);
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/listings?${qParams.toString()}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e) {
    console.error("PF Listings Error:", e);
    res.status(500).json({ error: e.message });
  }
});
var api_default = app;

// server.ts
async function startServer() {
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    api_default.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    const express2 = await import("express");
    api_default.use(express2.static(distPath));
    api_default.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  api_default.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
