import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const editOrders =  async (c) => {
  const id = Number(c.req.param("id"));
  const { status } = await c.req.json();
  try {
    await db
      .update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, id));
    return c.json({ success: true, message: "Status pesanan diperbarui" });
  } catch (error) {
    console.error(error);
    return c.json(
      { success: false, message: "Error updating order status" },
      500
    );
  }
}