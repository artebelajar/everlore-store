import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { supabase } from "../db/storage.js";

export const editProduct = async (c) => {
  const id = Number(c.req.param("id"));

  try {
    const body = await c.req.parseBody();
    const imagefile = body["image"]; 

    let imageUrl;

    if (imagefile && imagefile instanceof File && imagefile.size > 0) {
      const fileName = `prod_${Date.now()}_${imagefile.name.replace(/\s/g, "_")}`;
      const arrayBuffer = new Uint8Array(await imagefile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, arrayBuffer, {
          contentType: imagefile.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const data = await db
      .update(schema.products)
      .set({
        name: body["name"],
        description: body["description"],
        price: Number(body["price"]),
        stock: parseInt(body["stock"]),
        categoryId: parseInt(body["categoryId"]),
        ...(imageUrl && { imageUrl }),
        create: parseInt(body["userId"]),
      })
      .where(eq(schema.products.id, id));

    return c.json({
      success: true,
      message: "Berhasil mengubah data",
      imageUrl,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return c.json(
      { success: false, message: "Gagal update product" },
      500,
    );
  }
};