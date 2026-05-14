import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.put("/auth/credentials", async (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body as {
    currentPassword?: string;
    newEmail?: string;
    newPassword?: string;
  };

  if (!currentPassword) {
    res.status(400).json({ error: "Current password is required" });
    return;
  }

  const [settings] = await db.select().from(settingsTable).limit(1);
  const storedPassword = settings?.adminPassword ?? "admin123";

  if (currentPassword !== storedPassword) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const updates: Record<string, string> = {};
  if (newEmail) updates.adminEmail = newEmail;
  if (newPassword) updates.adminPassword = newPassword;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No changes provided" });
    return;
  }

  if (settings) {
    await db.update(settingsTable).set(updates).where(eq(settingsTable.id, settings.id));
  }

  res.json({ ok: true });
});

export default router;
