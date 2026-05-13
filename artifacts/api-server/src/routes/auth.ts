import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = "admin@princessempire.com";
const ADMIN_PASSWORD = "admin123";

router.post("/auth/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ token: "admin-token-princess-empire", role: "admin" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
