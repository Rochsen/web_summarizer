import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Ant Design 样式注册依赖客户端运行时，关闭 Cache Components 以避免预渲染冲突 */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
