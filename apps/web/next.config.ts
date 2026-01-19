import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@salon-admin/api-core", "@salon-admin/supabase"],
};

export default nextConfig;
