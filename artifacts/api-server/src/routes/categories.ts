import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody, DeleteCategoryParams } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  const categories = await db.select().from(categoriesTable);
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(eq(productsTable.categoryId, cat.id));
      return { ...cat, productCount: Number(countResult[0]?.count ?? 0) };
    })
  );
  res.json(withCounts);
});

router.post("/categories", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

router.delete("/categories/:id", async (req, res) => {
  const parsed = DeleteCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
