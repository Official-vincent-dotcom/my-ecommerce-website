import { pgTable, serial, text, numeric, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  image: text("image"),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 12, scale: 2 }),
  discount: numeric("discount", { precision: 5, scale: 2 }),
  images: json("images").$type<string[]>().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  sizes: json("sizes").$type<string[]>().notNull().default([]),
  colors: json("colors").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  brand: text("brand"),
  featured: boolean("featured").notNull().default(false),
  bestSeller: boolean("best_seller").notNull().default(false),
  flashSale: boolean("flash_sale").notNull().default(false),
  flashSaleEndsAt: text("flash_sale_ends_at"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
