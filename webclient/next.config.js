/**
 * @type {import('next').NextConfig}
 */
const production = !!process.env.CI;

const nextConfig = {
  basePath: production ? "/earth-health-game" : "",
  assetPrefix: production ? "/earth-health-game/" : "",
  images: {
    unoptimized: true,
  },
  output: "export",
  env: {
    NEXT_PUBLIC_BASE_PATH: production ? "/earth-health-game" : "",
    NEXT_PUBLIC_DEFAULT_SERVER_URL: production
      ? "https://earth-health-game.appmana.com"
      : "http://localhost:5000",
  },
};

module.exports = nextConfig;
