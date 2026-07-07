import type { NextConfig } from "next";

const r2PublicHost = (() => {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    return null;
  }

  try {
    return new URL(publicUrl).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.1.5", "192.168.1.5:3000", "localhost:3000"],
  images: {
    remotePatterns: r2PublicHost
      ? [
          {
            protocol: "https",
            hostname: r2PublicHost,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
