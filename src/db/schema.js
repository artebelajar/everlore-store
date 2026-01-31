import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersECommerce = pgTable("users_e_commerce", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 512 }).notNull(),
  role: varchar("role", { length: 20 }).default("customer"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  //ini yang baru (siang:29-01-2026)
  create: integer("create").references(() => usersECommerce.id).default(1),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  address: text("address").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time", {
    precision: 12,
    scale: 2,
  }).notNull(),
});
