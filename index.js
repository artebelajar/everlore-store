import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as schema from "./src/db/schema.js";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import { createClient } from "@supabase/supabase-js";

//database
import { db } from "./src/db/index.js";
import { supabase } from "./src/db/storage.js";

//router
import { register } from "./src/api/register.js";
import { login } from "./src/api/login.js";
// import { auth } from "./src/api/auth.js";
import { addProduct } from "./src/api/addProduct.js";
import { getProduct } from "./src/api/getProduct.js";
import { order } from "./src/api/orders.js";


process.loadEnvFile();

// const client = postgres(process.env.DATABASE_URL);
// const db = drizzle(client, { schema });
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_KEY,
// );

const app = new Hono();

app.use("*", cors());

app.post("/api/register", register);

app.post("/api/login", login);

const authMiddleware = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader)
    return c.json({ success: false, message: "Unauthorized" }, 401);

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: "Invalid token" }, 403);
  }
};

app.get("/api/me", authMiddleware, async (c) => {
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
});



app.post("/api/products", authMiddleware, addProduct);

app.get("/api/products", getProduct);

app.post("/api/orders", order);

app.use("/*", serveStatic({ root: "src/public" }));

const port = 4554;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
