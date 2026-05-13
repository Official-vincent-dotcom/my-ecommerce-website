import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  ListOrdersQueryParams,
} from "@workspace/api-zod";

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

router.get("/orders", async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 20);
  const offset = (page - 1) * limit;

  let query = db.select().from(ordersTable);
  if (params.status) {
    // @ts-ignore
    query = query.where(eq(ordersTable.status, params.status));
  }

  const [orders, totalResult] = await Promise.all([
    db.select().from(ordersTable)
      .where(params.status ? eq(ordersTable.status, params.status) : undefined)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(params.status ? eq(ordersTable.status, params.status) : undefined),
  ]);

  res.json({
    orders: orders.map((o) => formatOrder(o as unknown as Record<string, unknown>)),
    total: Number(totalResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [order] = await db.insert(ordersTable).values({
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    address: data.address,
    items: data.items,
    total: String(total),
    status: "pending",
    notes: data.notes ?? null,
  }).returning();
  res.status(201).json(formatOrder(order as unknown as Record<string, unknown>));
});

router.get("/orders/:id", async (req, res) => {
  const parsed = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order as unknown as Record<string, unknown>));
});

router.patch("/orders/:id/status", async (req, res) => {
  const paramParsed = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(ordersTable.id, paramParsed.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order as unknown as Record<string, unknown>));
});

export default router;
