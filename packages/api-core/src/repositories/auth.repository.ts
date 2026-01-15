import { BaseRepository } from "./base.repository";

export class AuthRepository extends BaseRepository {
  async checkDuplicate(type: "email" | "shop_name" | "phone", value: string) {
    const { data, error } = await this.supabase.functions.invoke(
      "check-duplicate",
      {
        body: { type, value },
      }
    );

    if (error) throw error;
    return data;
  }

  async registerOwner(params: any) {
    // Note: Edge Functions usually accessed via functions.invoke
    // But if original code used direct fetch, we can wrap it or use invoke
    // Assuming invoke is preferred for consistency within Supabase library
    const { data, error } = await this.supabase.functions.invoke(
      "register-owner",
      {
        body: params,
      }
    );

    if (error) throw error;
    return data;
  }
}
