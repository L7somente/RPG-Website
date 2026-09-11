/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      { source: "/owlbear/manifest.json", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] },
      { source: "/owlbear", headers: [
        { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://owlbear.rodeo https://*.owlbear.rodeo https://owlbear.app https://*.owlbear.app" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ] },
    ];
  },
};
module.exports = nextConfig;
