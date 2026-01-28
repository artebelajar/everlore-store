import { desc } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const getProduct = async (c) => {
  const data = await db
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.id));
  return c.json({ success: true, data });
}