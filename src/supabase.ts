import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL || "https://jyqzksiuctjyqchrbfpn.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = key ? createClient(url, key) : null;
