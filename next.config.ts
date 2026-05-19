import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://192.168.0.110:8080";

let uploadsRemoteHost = "localhost";
let uploadsRemotePort = "8080";
try {
  const proxyUrl = new URL(apiProxyTarget);
  uploadsRemoteHost = proxyUrl.hostname;
  uploadsRemotePort = proxyUrl.port || (proxyUrl.protocol === "https:" ? "443" : "80");
} catch {
  // keep defaults
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: uploadsRemoteHost,
        port: uploadsRemotePort,
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: uploadsRemoteHost,
        port: uploadsRemotePort,
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiProxyTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
