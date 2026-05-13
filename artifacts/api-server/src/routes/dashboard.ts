import { Router } from "express";
import { db, productsTable, ordersTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql, lte } from "drizzle-orm";

const router = Router();

function formatOrder(o: Record<string, unknown>) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    address: o.address,
    items: Array.isArray(o.items) ? o.items : [],
    total: Number(o.total),
    status: o.status,
    notes: o.notes ?? null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  };
}

function formatProduct(p: Record<string, unknown>) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
    discount: p.discount != null ? Number(p.discount) : null,
    images: Array.isArray(p.images) ? p.images : [],
    categoryId: p.categoryId ?? null,
    categoryName: null,
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

router.get("/dashboard/stats", async (req, res) => {
  const [
    totalProductsResult,
    totalOrdersResult,
    pendingOrdersResult,
    totalRevenueResult,
    recentOrders,
    lowStockProducts,
    categories,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
    db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    db.select().from(productsTable).where(lte(productsTable.stock, 5)).limit(10),
    db.select().from(categoriesTable),
  ]);

  const productCounts = await Promise.all(
    categories.map(async (cat) => {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(eq(productsTable.categoryId, cat.id));
      return { name: cat.name, count: Number(result?.count ?? 0) };
    })
  );

  res.json({
    totalProducts: Number(totalProductsResult[0]?.count ?? 0),
    totalOrders: Number(totalOrdersResult[0]?.count ?? 0),
    totalRevenue: Number(totalRevenueResult[0]?.total ?? 0),
    pendingOrders: Number(pendingOrdersResult[0]?.count ?? 0),
    recentOrders: recentOrders.map((o) => formatOrder(o as unknown as Record<string, unknown>)),
    topCategories: productCounts.sort((a, b) => b.count - a.count).slice(0, 5),
    lowStockProducts: lowStockProducts.map((p) => formatProduct(p as unknown as Record<string, unknown>)),
  });
});

export default router;
