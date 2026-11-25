/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Gives curriculum pages a clean, dedicated URL (e.g. /programs/<slug>/curriculum)
      // instead of exposing the raw static asset path under /Programs/curriculum/...
      { source: "/programs/:slug/curriculum", destination: "/Programs/curriculum/:slug/index.html" },
      // 180-Day Better-Offer Guarantee Agreement is a self-contained static
      // document (own <html>/<head>/<body>), not a React page.
      { source: "/180-day-guarantee", destination: "/180-day-guarantee.html" },
    ];
  },
  images: {
    // Serve modern formats — the source mentor photos are multi-MB JPEG/PNG,
    // which wrecks LCP if shipped as-is.
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
