import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const myProduct = async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ success: false, message: "Invalid product ID" }, 400);
  }

  try {
    const data = await db.query.products.findMany({
      where: eq(schema.products.create, parseInt(id)),
    });
    return c.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Error fetching product" }, 500);
  }
}