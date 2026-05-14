import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { db, settingsTable } from "@workspace/db";

const router = Router();

const DEFAULT_EMAIL = "admin@princessempire.com";
const DEFAULT_PASSWORD = "admin123";

router.post("/auth/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [settings] = await db.select().from(settingsTable).limit(1);
  const adminEmail = settings?.adminEmail ?? DEFAULT_EMAIL;
  const adminPassword = settings?.adminPassword ?? DEFAULT_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    res.json({ token: "admin-token-princess-empire", role: "admin" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
