import { createClient } from "@supabase/supabase-js";
import 'dotenv/config.js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);