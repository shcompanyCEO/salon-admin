import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@salon-admin/supabase";

export type Client = SupabaseClient<Database>;
