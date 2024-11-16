import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // ◀◀ 追加

const repositoryName = "react-todo-app"; // ◀◀ 追加

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? `/${repositoryName}/` : "/",
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        404: path.resolve(__dirname, "404.html"),
      },
    },
  },
  server: {
    port: 3001, // デフォルトのポートを3001に設定
    strictPort: false,
    open: true,
  },
});
