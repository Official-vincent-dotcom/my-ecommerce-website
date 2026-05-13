import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function ensureSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(settingsTable).values({
      whatsappNumber: "+2348000000000",
      storeName: "Princess Empire",
      storeEmail: "hello@princessempire.com",
      storeAddress: "Lagos, Nigeria",
      currency: "NGN",
      heroTitle: "Elegance for Everyone",
      heroSubtitle: "Discover premium fashion, beauty, and lifestyle products curated for you.",
    }).returning();
    return created;
  }
  return existing[0];
}

router.get("/settings", async (req, res) => {
  const settings = await ensureSettings();
  res.json(settings);
});

router.put("/settings", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const settings = await ensureSettings();
  const [updated] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(eq(settingsTable.id, settings.id))
    .returning();
  res.json(updated);
});

export default router;
