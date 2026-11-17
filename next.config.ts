import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Lets `next dev` use Cloudflare bindings (the QR_LINKS KV namespace for dynamic QR codes).
if (process.env.NODE_ENV === "development") {
  void setupDevPlatform({ configPath: "wrangler.dev.toml" });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
