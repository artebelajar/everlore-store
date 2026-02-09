import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as schema from "./src/db/schema.js";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
import { auth } from "./src/api/auth.js";
import { myProduct } from "./src/api/myProducts,.js";
import { deleteProduct } from "./src/api/deleteProduct.js";
import { editProduct } from "./src/api/editProduct.js";
import { getOrders } from "./src/api/getOrders.js";
import { editOrders } from "./src/api/editOrders.js";

process.loadEnvFile();


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

app.get("/api/me", authMiddleware, auth);

app.post("/api/products", authMiddleware, addProduct);

app.get("/api/products", getProduct);

app.post("/api/orders", order);

app.get("/api/product/:id", myProduct);

app.delete("/api/product/:id", deleteProduct);

app.put("/api/product/:id", editProduct);

app.get("/api/orders/",  getOrders);

app.put("/api/orders/:id/status", editOrders);

app.get("/api/orders/items/:id", async (c) => {
  const orderId = c.req.param("id");
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));
  return c.json({ success: true, data: items });
});

app.get("/api/orders/:id/items", async (c) => {
  const orderId = Number(c.req.param("id"));

  const items = await db
    .select({
      quantity: schema.orderItems.quantity,
      priceAtTime: schema.orderItems.priceAtTime,
      product: {
        name: schema.products.name,
        imageUrl: schema.products.imageUrl,
      },
    })
    .from(schema.orderItems)
    .innerJoin(
      schema.products,
      eq(schema.products.id, schema.orderItems.productId)
    )
    .where(eq(schema.orderItems.orderId, orderId));

  return c.json({ success: true, data: items });
});

app.use("/*", serveStatic({ root: "src/public" }));

const port = 4554;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
