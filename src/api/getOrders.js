import { desc } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const getOrders = async (c) => {
  try {
    const data = await db.query.orders.findMany({
      orderBy: desc(schema.orders.id),
    });
    return c.json({ success: true, message: "Berhasil mengambil data", data });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Error fetching orders" }, 500);
  }
}