import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

app.use("*", cors());

app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/me", authMiddleware, auth);
app.post("/api/products", authMiddleware, addProduct);
app.get("/api/products", getProduct);
app.post("/api/orders", order);
app.get("/api/product/:id", myProduct);
app.delete("/api/product/:id", deleteProduct);
app.put("/api/product/:id", editProduct);
app.get("/api/orders/", getOrders);
app.put("/api/orders/:id/status", editOrders);

app.use("/*", serveStatic({
  root: path.join(__dirname, "public"),
}));

app.get("*", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>My App</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <div id="root"></div>
        <script src="/js/app.js"></script>
      </body>
    </html>
  `);
});

if (process.env.NODE_ENV !== 'production') {
  const port = 4554;
  console.log(`Server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;