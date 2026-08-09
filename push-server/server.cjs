require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const cors = require("cors");
const express = require("express");
const webpush = require("web-push");

const app = express();
const port = Number(process.env.PORT || 8787);
const subscriptionsFile = path.join(__dirname, "subscriptions.json");
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);

for (const key of ["VAPID_SUBJECT", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"]) {
  if (!process.env[key]) throw new Error(key + " is missing. Copy .env.example to .env first.");
}
webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed"));
  },
}));
app.use(express.json({ limit: "32kb" }));

async function readSubscriptions() {
  try {
    return JSON.parse(await fs.readFile(subscriptionsFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}
async function writeSubscriptions(items) {
  await fs.writeFile(subscriptionsFile, JSON.stringify(items, null, 2));
}
function validSubscription(item) {
  return Boolean(item && typeof item.endpoint === "string" && item.keys &&
    typeof item.keys.p256dh === "string" && typeof item.keys.auth === "string");
}

app.get("/health", (_request, response) => response.json({ ok: true }));
app.get("/api/push/public-key", (_request, response) => response.json({ publicKey: process.env.VAPID_PUBLIC_KEY }));

app.post("/api/push/subscriptions", async (request, response, next) => {
  try {
    const subscription = request.body;
    if (!validSubscription(subscription)) return response.status(400).json({ error: "Invalid PushSubscription" });
    const all = await readSubscriptions();
    await writeSubscriptions([...all.filter((item) => item.endpoint !== subscription.endpoint), subscription]);
    return response.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

// Add real admin authentication to this endpoint before deploying it publicly.
app.post("/api/push/send", async (request, response, next) => {
  try {
    const { title = "Vajra", body = "You have a new reminder.", url = "/" } = request.body || {};
    const payload = JSON.stringify({ title, body, url, icon: "/icons/icon-192.svg" });
    const all = await readSubscriptions();
    const expired = new Set();
    let sent = 0;
    await Promise.all(all.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, { TTL: 3600 });
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) expired.add(subscription.endpoint);
        else console.error("Push failed:", error.statusCode || error.message);
      }
    }));
    if (expired.size) await writeSubscriptions(all.filter((item) => !expired.has(item.endpoint)));
    return response.json({ ok: true, sent, removed: expired.size });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});
app.listen(port, () => console.log("Push server listening on http://localhost:" + port));
