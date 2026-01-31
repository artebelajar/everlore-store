 import { eq } from "drizzle-orm";
 import { db } from "../db/index.js";
 import * as schema from "../db/schema.js";

 
 export const auth = async (c) => {
  const payload = c.get("user");

  const user = await db.query.usersECommerce.findFirst({
    where: eq(schema.usersECommerce.id, payload.id),
    columns: {
      id: true,
      username: true,
      role: true,
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }

  return c.json({
    success: true,
    data: user,
  });
}