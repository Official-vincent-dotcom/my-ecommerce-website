import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number").notNull().default("+2348000000000"),
  storeName: text("store_name"),
  storeEmail: text("store_email"),
  storeAddress: text("store_address"),
  currency: text("currency"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
