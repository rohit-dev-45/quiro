import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "super-sniffle-g4p6grv66vggf7q7-3000.app.github.dev",
            ],
        },
    },
};

export default nextConfig;
