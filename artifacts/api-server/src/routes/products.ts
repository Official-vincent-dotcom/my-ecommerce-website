import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import {
  CreateProductBody,
  GetProductParams,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  ListProductsQueryParams,
  GetRecentProductsQueryParams,
  GetFeaturedProductsQueryParams,
  GetBestSellersQueryParams,
  GetFlashSalesQueryParams,
  GetSearchSuggestionsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function formatProduct(p: Record<string, unknown>, categoryName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
    discount: p.discount != null ? Number(p.discount) : null,
    images: Array.isArray(p.images) ? p.images : [],
    categoryId: p.categoryId ?? null,
    categoryName: categoryName ?? null,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    stock: p.stock,
    brand: p.brand ?? null,
    featured: p.featured,
    bestSeller: p.bestSeller,
    flashSale: p.flashSale,
    flashSaleEndsAt: p.flashSaleEndsAt ?? null,
    rating: p.rating != null ? Number(p.rating) : null,
    reviewCount: p.reviewCount ?? null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

router.get("/products/recent", async (req, res) => {
  const parsed = GetRecentProductsQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 8;
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  res.json(products.map((p) => formatProduct(p as unknown as Record<string, unknown>, p.categoryId ? catMap[p.categoryId] : null)));
});

router.get("/products/featured", async (req, res) => {
  const parsed = GetFeaturedProductsQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 8;
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  res.json(products.map((p) => formatProduct(p as unknown as Record<string, unknown>, p.categoryId ? catMap[p.categoryId] : null)));
});

router.get("/products/bestsellers", async (req, res) => {
  const parsed = GetBestSellersQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 8;
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.bestSeller, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  res.json(products.map((p) => formatProduct(p as unknown as Record<string, unknown>, p.categoryId ? catMap[p.categoryId] : null)));
});

router.get("/products/flashsales", async (req, res) => {
  const parsed = GetFlashSalesQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 8;
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.flashSale, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limit);
  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  res.json(products.map((p) => formatProduct(p as unknown as Record<string, unknown>, p.categoryId ? catMap[p.categoryId] : null)));
});

router.get("/products/search-suggestions", async (req, res) => {
  const parsed = GetSearchSuggestionsQueryParams.safeParse(req.query);
  if (!parsed.success || !parsed.data.q) {
    res.json([]);
    return;
  }
  const q = parsed.data.q;
  const products = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(ilike(productsTable.name, `%${q}%`))
    .limit(8);
  res.json(products.map((p) => p.name));
});

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const conditions = [];

  if (params.category) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.name, params.category)).limit(1);
    if (cat.length > 0) {
      conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
  }
  if (params.search) {
    conditions.push(ilike(productsTable.name, `%${params.search}%`));
  }
  if (params.featured === true || String(params.featured) === "true") {
    conditions.push(eq(productsTable.featured, true));
  }
  if (params.bestSeller === true || String(params.bestSeller) === "true") {
    conditions.push(eq(productsTable.bestSeller, true));
  }
  if (params.flashSale === true || String(params.flashSale) === "true") {
    conditions.push(eq(productsTable.flashSale, true));
  }
  if (params.brand) {
    conditions.push(eq(productsTable.brand, params.brand));
  }
  if (params.minPrice != null) {
    conditions.push(gte(sql`${productsTable.price}::numeric`, String(params.minPrice)));
  }
  if (params.maxPrice != null) {
    conditions.push(lte(sql`${productsTable.price}::numeric`, String(params.maxPrice)));
  }

  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 12);
  const offset = (page - 1) * limit;

  let orderBy;
  if (params.sort === "price_asc") orderBy = asc(productsTable.price);
  else if (params.sort === "price_desc") orderBy = desc(productsTable.price);
  else orderBy = desc(productsTable.createdAt);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, totalResult] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  res.json({
    products: products.map((p) => formatProduct(p as unknown as Record<string, unknown>, p.categoryId ? catMap[p.categoryId] : null)),
    total: Number(totalResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  let categoryName = null;
  if (product.categoryId) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    categoryName = cat?.name ?? null;
  }
  res.json(formatProduct(product as unknown as Record<string, unknown>, categoryName));
});

router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;
  const [product] = await db.insert(productsTable).values({
    name: data.name,
    description: data.description,
    price: String(data.price),
    oldPrice: data.oldPrice != null ? String(data.oldPrice) : null,
    discount: data.discount != null ? String(data.discount) : null,
    images: data.images ?? [],
    categoryId: data.categoryId ?? null,
    sizes: data.sizes ?? [],
    colors: data.colors ?? [],
    stock: data.stock,
    brand: data.brand ?? null,
    featured: data.featured ?? false,
    bestSeller: data.bestSeller ?? false,
    flashSale: data.flashSale ?? false,
    flashSaleEndsAt: data.flashSaleEndsAt ?? null,
  }).returning();
  res.status(201).json(formatProduct(product as unknown as Record<string, unknown>));
});

router.patch("/products/:id", async (req, res) => {
  const paramParsed = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.oldPrice !== undefined) updateData.oldPrice = data.oldPrice != null ? String(data.oldPrice) : null;
  if (data.discount !== undefined) updateData.discount = data.discount != null ? String(data.discount) : null;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.sizes !== undefined) updateData.sizes = data.sizes;
  if (data.colors !== undefined) updateData.colors = data.colors;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.bestSeller !== undefined) updateData.bestSeller = data.bestSeller;
  if (data.flashSale !== undefined) updateData.flashSale = data.flashSale;
  if (data.flashSaleEndsAt !== undefined) updateData.flashSaleEndsAt = data.flashSaleEndsAt;

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, paramParsed.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(formatProduct(product as unknown as Record<string, unknown>));
});

router.delete("/products/:id", async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
