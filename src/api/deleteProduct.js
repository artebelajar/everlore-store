import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const deleteProduct = async (c) => {
  const id = c.req.param("id");

  try {
    const { data, error } = await db
      .delete(schema.products)
      .where(eq(schema.products.id, Number(id)));

    if (error) return c.json({ success: false, message: error.message }, 500);

    return c.json(
      { success: true, message: `Product deleted successfully` },
      200,
    );
  } catch (error) {
    console.log(error);
  }
}